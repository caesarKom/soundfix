import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import { join, extname } from 'path';
import { CreatePlaylistDto, ManagePlaylistSongsDto, UpdatePlaylistDto } from './dto/playlist.dto';
import { Playlist } from '../generated/prisma/client';
import { UploadedFileDto } from '../music/dto/music.dto';

@Injectable()
export class PlaylistService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlaylistDto, userId: string, coverFile?: UploadedFileDto) {
    let coverPathName: string | null = null;

    if (coverFile) {
      const uploadCoverDir = join(process.cwd(), 'uploads', 'playlists');
      await fs.mkdir(uploadCoverDir, { recursive: true });

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      coverPathName = `uploads/playlists/${uniqueSuffix}${extname(coverFile.originalname)}`;
      await fs.writeFile(join(process.cwd(), coverPathName), coverFile.buffer);
    }

    return this.prisma.playlist.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        isPrivate: dto.isPrivate,
        coverUrl: coverPathName,
        userId: userId,
      },
    });
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

  // Update playlist
  async update(
    id: string, 
    userId: string, 
    userRole: string, 
    dto: UpdatePlaylistDto, 
    newCover?: UploadedFileDto
  ) {
    const playlist = await this.findOne(id, userId, userRole);

    if (playlist.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to edit this playlist');
    }

    const updateData: Record<string, any> = {
      name: dto.name,
      description: dto.description,
      isPrivate: dto.isPrivate,
    };
    
    if (dto.isPrivate !== undefined) {
      updateData.isPrivate = false;
    }

    if (newCover) {
      if (playlist.coverUrl) {
        try {
          const oldCoverPath: string = join(process.cwd(), playlist.coverUrl as string);
          await fs.unlink(oldCoverPath);
        } catch {
          /* ignore the missing file*/
        }
      }

      const uploadCoverDir = join(process.cwd(), 'uploads', 'playlists');
      await fs.mkdir(uploadCoverDir, { recursive: true });

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const coverPathName = `uploads/playlists/${uniqueSuffix}${extname(newCover.originalname)}`;
      await fs.writeFile(join(process.cwd(), coverPathName), newCover.buffer);

      updateData.coverUrl = coverPathName;
    }

    return this.prisma.playlist.update({
      where: { id },
      data: updateData,
    });
  }

  // Completely deleting the playlist
   async remove(id: string, userId: string, userRole: string) {
    const playlist = await this.findOne(id, userId, userRole);

    if (playlist.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to delete this playlist');
    }

    if (playlist.coverUrl) {
      try {
          const oldCoverPath: string = join(process.cwd(), playlist.coverUrl as string);
          await fs.unlink(oldCoverPath);
        } catch {
          /* ignore the missing file*/
        }
    }

    await this.prisma.playlist.delete({
      where: { id },
    });
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
