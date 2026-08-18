import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { UserLoginDto } from '../user/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: UserLoginDto, @Req() req: any) {
    const deviceInfo = (req.headers['user-agent'] as string) || 'unknown';
    return this.authService.login(dto, deviceInfo);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string, @Req() req: any) {
    const deviceInfo = (req.headers['user-agent'] as string) || 'unknown';
    return this.authService.refreshTokens(refreshToken, deviceInfo);
  }
}
