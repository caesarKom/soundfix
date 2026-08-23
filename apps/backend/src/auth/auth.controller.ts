import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from '../user/dto/user.dto';
import type { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('media-token')
  getMediaToken(@CurrentUser() sub: string) {
    const token = this.jwtService.sign({ sub: sub }, { expiresIn: '1h' });
    return { token };
  }

  @Post('login')
  async login(
    @Body() dto: UserLoginDto,
    @Req() req: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const deviceInfo = (req.headers['user-agent'] as string) || 'unknown';
    const tokens = await this.authService.login(dto, deviceInfo, ip);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return tokens;
  }

  @Post('refresh')
  async refresh(
    @Body('refreshToken') bodyRefreshToken: string | undefined,
    @Req() req: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
    @Ip() ip: string,
  ) {
    const deviceInfo = (req.headers['user-agent'] as string) || 'unknown';
    const refreshToken = (bodyRefreshToken || req.cookies?.refreshToken) as
      string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const tokens = await this.authService.refreshTokens(
      refreshToken,
      deviceInfo,
      ip,
    );

    // Refresh the cookie with a new token (Token Rotation)
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body('refreshToken') bodyRefreshToken: string | undefined,
    @Req() req: Record<string, any>,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (bodyRefreshToken ||
      req.cookies?.refreshToken) as string;

    await this.authService.logout(refreshToken);

    // Clear cookies
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return;
  }
}
