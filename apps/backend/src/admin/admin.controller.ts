import { Controller, UseGuards, Get } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

     @UseGuards(AuthGuard('jwt'), RolesGuard)
      @Roles('ADMIN')
      @Get('stats')
      async getSystemStats() {
        return this.adminService.getSystemStats();
      }

}
