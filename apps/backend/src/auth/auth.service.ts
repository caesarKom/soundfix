import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserLoginDto } from '../user/dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../config/env.schema';

interface JwtPayload {
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<EnvConfig, true>
  ) {}

  async login(dto: UserLoginDto, deviceInfo: string) {
    if (!dto || !dto.email) {
    throw new BadRequestException('Email and password are required');
  }
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Incorect login details');
    }

    return this.generateAndSaveTokens(user.id, deviceInfo);
  }

  async refreshTokens(refreshToken: string, deviceInfo: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_REFRESH_TOKEN', { infer: true }),
      });

      const session = await this.prisma.session.findUnique({
        where: { tokenHash: refreshToken },
      });

      if (!session || session.isRevoked || session.expiresAt < new Date()) {
        if (session) {
          await this.prisma.session.updateMany({
            where: { userId: payload.sub },
            data: { isRevoked: true },
          });
        }
        throw new UnauthorizedException('Session expired or invalid');
      }

      // Rotate
      await this.prisma.session.delete({ where: { id: session.id } });
      // New Tokens
      return this.generateAndSaveTokens(payload.sub as string, deviceInfo);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateAndSaveTokens(userId: string, deviceInfo: string) {
    const payload: JwtPayload = { sub: userId };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_TOKEN', { infer: true }),
      expiresIn: this.config.get('REFRESH_TOKEN_EXPIRES', { infer: true }),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Save the new token as an active session
    await this.prisma.session.create({
      data: {
        userId,
        tokenHash: refreshToken,
        deviceInfo,
        expiresAt,
        updatedAt: new Date(),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;

    try {
      // Delete the session from the database so that no one else can use this token
      await this.prisma.session.deleteMany({
        where: { tokenHash: refreshToken },
      });
    } catch (error) {
      // If the token is no longer in the database (e.g. expired), we ignore the error to ensure successful logout
    }
  }
}
