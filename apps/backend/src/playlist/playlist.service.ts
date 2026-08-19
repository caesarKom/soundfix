import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylistDto, ManagePlaylistSongsDto } from './dto/playlist.dto';
import { Playlist } from '../generated/prisma/client';

@Injectable()
export class PlaylistService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlaylistDto, userId: string): Promise<Playlist> {
    const playlist = await this.prisma.playlist.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        isPrivate: dto.isPrivate ?? false,
        userId: userId,
      },
    });
    return playlist;
  }

  async findOne(id: string, userId: string, userRole: string): Promise<any> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          select: {
            id: true,
            title: true,
            artist: true,
            album: true,
            duration: true,
            coverUrl: true,
          },
        },
      },
    });

    if (!playlist) throw new NotFoundException('Playlist not found');

    // If the playlist is private, only allow the owner or ADMIN to enter.
    if (playlist.isPrivate && playlist.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('This playlist is private');
    }

    return playlist;
  }

  // Adding a song to a playlist (Owner only)
  async addSong(id: string, userId: string, dto: ManagePlaylistSongsDto): Promise<void> {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException('You do not own this playlist');

    // check whether the song exists in the database at all
    const song = await this.prisma.music.findUnique({ where: { id: dto.songId } });
    if (!song) throw new NotFoundException('Song not found');

    // Prisma Many-to-Many relationship notation via 'connect'
    await this.prisma.playlist.update({
      where: { id },
      data: {
        songs: {
          connect: { id: dto.songId },
        },
      },
    });
  }

  // Removing a song from a playlist (Owner only)
  async removeSong(id: string, userId: string, dto: ManagePlaylistSongsDto): Promise<void> {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId) throw new ForbiddenException('You do not own this playlist');

    await this.prisma.playlist.update({
      where: { id },
      data: {
        songs: {
          disconnect: { id: dto.songId },
        },
      },
    });
  }

  // Completely deleting the playlist
  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundException('Playlist not found');

    if (playlist.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to delete this playlist');
    }

    await this.prisma.playlist.delete({ where: { id } });
  }

  async findAll(userRole: string): Promise<Playlist[]> {
  // If the request is from ADMIN, we return everything. If MEMBER, we return only public data.
  const whereCondition = userRole === 'ADMIN' ? {} : { isPrivate: false };

  const playlists = await this.prisma.playlist.findMany({
    where: whereCondition,
    include: {
      // extract basic information about the owner (e.g. to display who created the playlist)
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      // count songs in a playlist instead of downloading entire files (optimizing database performance)
      _count: {
        select: { songs: true },
      },
    },
    orderBy: {
      createdAt: 'desc', // The newest playlists will be displayed at the top
    },
  });

  return playlists;
}
}
