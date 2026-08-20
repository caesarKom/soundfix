import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

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
}
