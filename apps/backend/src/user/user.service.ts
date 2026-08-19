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

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService, private readonly mailService: MailService) {}

  async register(dto: UserRegisterDto) {
    const userExists = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { name: dto.name }] },
    });

    if (userExists) {
      throw new ConflictException('User with this email or name already exists');
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
      },
    });

    return { message: 'Verification code sent to email', email: user.email };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const otpRecord = await this.prisma.otpToken.findUnique({
      where: { email: dto.email },
    });

    if (!otpRecord || otpRecord.code !== dto.code || otpRecord.expiresAt < new Date()) {
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
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, dto: UserUpdateDto) {
    await this.findOne(id);

    const updateData: Record<string, any> = { ...dto };

    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    // Checking the uniqueness of the email/name if they are changed
    if (dto.email || dto.name) {
      const conflictUser = await this.prisma.user.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(dto.email ? [{ email: dto.email }] : []),
            ...(dto.name ? [{ name: dto.name }] : []),
          ],
        },
      });

      if (conflictUser) {
        throw new ConflictException('Email or Username is already taken');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, isVerified: true, },
    });

    return updatedUser;
  }

  async remove(id: string) {
    await this.findOne(id); // 404 if not exist

    // First delete the related sessions (if the onDelete: Cascade is not set in Prisma)
    await this.prisma.session.deleteMany({
      where: { userId: id },
    });

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
