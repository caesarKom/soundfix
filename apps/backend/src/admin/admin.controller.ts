import {
  Controller,
  UseGuards,
  Get,
  Query,
  Param,
  HttpStatus,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SessionListQueryDto } from './dto/session-list-query.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('stats')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  @Get('sessions')
  async getAllSessions(@Query() query: SessionListQueryDto) {
    return this.adminService.findAllSessions(query);
  }

  @Get('sessions/:id')
  async getSessionById(@Param('id') id: string) {
    return this.adminService.findSessionById(id);
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeSession(@Param('id') id: string) {
    await this.adminService.revokeSession(id);
  }

  @Delete('sessions/user/:userId')
  @HttpCode(HttpStatus.OK)
  async revokeAllUserSessions(@Param('userId') userId: string) {
    return this.adminService.revokeAllUserSessions(userId);
  }

  @Delete('sessions/cleanup/expired')
  @HttpCode(HttpStatus.OK)
  async cleanupExpiredSessions() {
    return this.adminService.cleanupExpiredSessions();
  }
}
