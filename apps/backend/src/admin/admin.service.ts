import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SessionListQueryDto, SessionResponseDto } from './dto/session-list-query.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats() {
    const [totalUsers, totalTracks, totalPlaylists, playCountAgg] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.music.count(),
      this.prisma.playlist.count(),
      this.prisma.music.aggregate({
        _sum: { playCount: true },
      }),
    ]);

    const recentTracks = await this.prisma.music.findMany({
      take: 5,
      orderBy: { playCount: 'desc' },
      select: {
        id: true,
        title: true,
        artist: true,
        playCount: true,
      },
    });

    return {
      totalUsers,
      totalTracks,
      totalPlaylists,
      totalPlayCount: playCountAgg._sum.playCount || 0,
      recentTracks,
    };
  }

   /**
   * Retrieves a paginated list of all sessions with user information.
   * Supports search by user email or device info, and filtering by revocation status.
   */
  async findAllSessions(query: SessionListQueryDto): Promise<{
    data: SessionResponseDto[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const { page = 1, limit = 20, search, isRevoked } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (isRevoked !== undefined) {
      where.isRevoked = isRevoked === 'true';
    }
    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { deviceInfo: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [sessions, total] = await Promise.all([
      this.prisma.session.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.session.count({ where }),
    ]);

    const data = sessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      userEmail: session.user.email,
      userName: session.user.name,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      isRevoked: session.isRevoked,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a single session by ID with user details.
   */
  async findSessionById(sessionId: string): Promise<SessionResponseDto> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    return {
      id: session.id,
      userId: session.userId,
      userEmail: session.user.email,
      userName: session.user.name,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      isRevoked: session.isRevoked,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  /**
   * Revokes a single session (forces logout).
   */
  async revokeSession(sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionId} not found`);
    }

    if (session.isRevoked) {
      throw new ForbiddenException('Session is already revoked');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });
  }

  /**
   * Revokes all sessions belonging to a specific user.
   */
  async revokeAllUserSessions(userId: string): Promise<{ revokedCount: number }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });

    return { revokedCount: result.count };
  }

  /**
   * Cleans up expired sessions (runs on schedule or on-demand).
   */
  async cleanupExpiredSessions(): Promise<{ deletedCount: number }> {
    const result = await this.prisma.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
    return { deletedCount: result.count };
  }

}
