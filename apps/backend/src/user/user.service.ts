import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRegisterDto, UserUpdateDto, VerifyOtpDto } from './dto/user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { UploadedFileDto } from '../music/dto/music.dto';
import { extname, join } from 'path';
import * as fs from 'fs/promises';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: UserRegisterDto) {
    const userExists = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { name: dto.name }] },
    });

    if (userExists) {
      throw new ConflictException(
        'User with this email or name already exists',
      );
    }
    // OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 120); // 2 hours from now

    await this.prisma.otpToken.upsert({
      where: { email: dto.email },
      update: { code: otpCode, expiresAt },
      create: { email: dto.email, code: otpCode, expiresAt },
    });

    await this.mailService.sendOTP(dto.email, otpCode, dto.name);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashedPassword,
        isVerified: false,
        profile: { create: {} },
      },
    });

    return { message: 'Verification code sent to email', email: user.email };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const otpRecord = await this.prisma.otpToken.findUnique({
      where: { email: dto.email },
    });

    if (
      !otpRecord ||
      otpRecord.code !== dto.code ||
      otpRecord.expiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // If the code is correct, we will activate the user
    const user = await this.prisma.user.update({
      where: { email: dto.email },
      data: { isVerified: true },
    });

    // Delete code
    await this.prisma.otpToken.delete({ where: { id: otpRecord.id } });

    // Send welcome email
    await this.mailService.sendWelcomeEmail(user.email, user.name);

    return { message: 'Account verified successfully', status: 'SUCCESS' };
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthDay: true,
            bio: true,
            avatar: true,
            gender: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthDay: true,
            bio: true,
            avatar: true,
            gender: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, dto: UserUpdateDto, avatarFile?: UploadedFileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User account not found');

    const userUpdateData: Prisma.UserUpdateInput = {};
  if (dto.email !== undefined) userUpdateData.email = dto.email;
  if (dto.name !== undefined) userUpdateData.name = dto.name;
  if (dto.role !== undefined) userUpdateData.role = dto.role;
  if (dto.isVerified !== undefined) userUpdateData.isVerified = dto.isVerified;

  const profileUpdateData: Prisma.ProfileUpdateInput = {};
  if (dto.firstName !== undefined) profileUpdateData.firstName = dto.firstName;
  if (dto.lastName !== undefined) profileUpdateData.lastName = dto.lastName;
  if (dto.bio !== undefined) profileUpdateData.bio = dto.bio;
  if (dto.birthDay !== undefined) profileUpdateData.birthDay = dto.birthDay;
  if (dto.gender !== undefined) profileUpdateData.gender = dto.gender;

    if (avatarFile) {
      if (user.profile?.avatar) {
        try {
          await fs.unlink(join(process.cwd(), user.profile.avatar));
        } catch {
          // Ignore
        }
      }

      const uploadAvatarDir = join(process.cwd(), 'uploads', 'avatars');
      await fs.mkdir(uploadAvatarDir, { recursive: true });

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const avatarPathName = `uploads/avatars/${uniqueSuffix}${extname(avatarFile.originalname)}`;
      await fs.writeFile(
        join(process.cwd(), avatarPathName),
        avatarFile.buffer,
      );

      profileUpdateData.avatar = avatarPathName;
    }

    const updateData: Prisma.UserUpdateInput = { ...userUpdateData };

    if (Object.keys(profileUpdateData).length > 0) {
      updateData.profile = {
        upsert: {
          create: {
            ...profileUpdateData,
          } as Prisma.ProfileCreateWithoutUserInput,
          update: { ...profileUpdateData },
        },
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { profile: true },
    });

    return updatedUser;
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    if (user.profile?.avatar) {
      try {
        await fs.unlink(join(process.cwd(), user.profile.avatar));
      } catch {
        // Ignore
      }
    }

    // First delete the related sessions (if the onDelete: Cascade is not set in Prisma)
    await this.prisma.session.deleteMany({
      where: { userId: id },
    });

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
