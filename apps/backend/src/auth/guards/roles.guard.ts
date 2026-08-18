import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true; // Jeśli endpoint nie ma dekoratora @Roles, wpuść każdego zalogowanego

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Pobieramy usera doklejonego przez JwtStrategy

    if (!user) return false;

    // Pobieramy pełne dane użytkownika z bazy, aby sprawdzić jego rolę
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser || !requiredRoles.includes(dbUser.role)) {
      throw new ForbiddenException('Brak wymaganych uprawnień administratora');
    }

    return true;
  }
}
