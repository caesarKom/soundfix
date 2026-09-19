import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import { join, extname } from 'path';
import {
  CreatePlaylistDto,
  ManagePlaylistSongsDto,
  UpdatePlaylistDto,
} from './dto/playlist.dto';
import { UploadedFileDto } from '../music/dto/music.dto';

@Injectable()
export class PlaylistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new standard database playlist
   */
  async create(
    dto: CreatePlaylistDto,
    userId: string,
    coverFile?: UploadedFileDto,
  ) {
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
        _count: {
          select: { songs: true },
        },
      },
    });

    if (!playlist) throw new NotFoundException('Playlist not found');

    if (playlist.isPrivate && playlist.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('This playlist is private');
    }

    return playlist;
  }

  async findPlaylistSongs(
    playlistId: string,
    userId: string,
    userRole: string,
    pageNum: number = 1,
    limitNum: number = 20,
  ): Promise<any[]> {
    const skip = (pageNum - 1) * limitNum;

    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { isPrivate: true, userId: true },
    });

    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.isPrivate && playlist.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('This playlist is private and you do not have permission to access it.');
    }

    const playlistWithSongs = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
      select: {
        songs: {
          skip: skip,
          take: limitNum,
          select: {
            id: true,
            title: true,
            artist: true,
            album: true,
            duration: true,
            coverUrl: true,
            mimeType: true,
            likedBy: {
              where: { userId },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!playlistWithSongs || !playlistWithSongs.songs) return [];

    return playlistWithSongs.songs.map(song => {
      const { likedBy, ...rest } = song;
      return {
        ...rest,
        isLiked: likedBy.length > 0,
      };
    });
  }
  /**
   * Adds a song link to a custom playlist (Owner only)
   */
  async addSong(
    id: string,
    userId: string,
    dto: ManagePlaylistSongsDto,
  ): Promise<void> {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId)
      throw new ForbiddenException('You do not own this playlist');

    const song = await this.prisma.music.findUnique({
      where: { id: dto.songId },
    });
    if (!song) throw new NotFoundException('Song not found');

    await this.prisma.playlist.update({
      where: { id },
      data: {
        songs: {
          connect: { id: dto.songId },
        },
      },
    });
  }

  /**
   * Removes a song link from a custom playlist (Owner only)
   */
  async removeSong(
    id: string,
    userId: string,
    dto: ManagePlaylistSongsDto,
  ): Promise<void> {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new NotFoundException('Playlist not found');
    if (playlist.userId !== userId)
      throw new ForbiddenException('You do not own this playlist');

    await this.prisma.playlist.update({
      where: { id },
      data: {
        songs: {
          disconnect: { id: dto.songId },
        },
      },
    });
  }

  /**
   * Updates playlist metadata and covers
   */
  async update(
    id: string,
    userId: string,
    userRole: string,
    dto: UpdatePlaylistDto,
    newCover?: UploadedFileDto,
  ) {
    const playlist = await this.findOne(id, userId, userRole);

    if (userRole !== 'ADMIN' && playlist.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to edit this playlist',
      );
    }

    const updateData: Record<string, any> = {
      name: dto.name,
      description: dto.description,
      isPrivate: dto.isPrivate,
    };

    if (dto.isPrivate !== undefined) {
      updateData.isPrivate = dto.isPrivate;
    }

    if (newCover) {
      if (playlist.coverUrl) {
        try {
          const oldCoverPath: string = join(process.cwd(), playlist.coverUrl as string);
          await fs.unlink(oldCoverPath);
        } catch {
          /* ignore missing files */
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

  /**
   * Deletes the playlist completely from the database
   */
  async remove(id: string, userId: string, userRole: string) {
    const playlist = await this.findOne(id, userId, userRole);

    if (playlist.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this playlist',
      );
    }

    if (playlist.coverUrl) {
      try {
        const oldCoverPath: string = join(process.cwd(), playlist.coverUrl as string);
        await fs.unlink(oldCoverPath);
      } catch {
        /* ignore missing files */
      }
    }

    await this.prisma.playlist.delete({
      where: { id },
    });
  }

  /**
   * Returns all playlists, injecting the virtual Favorite placeholder at index 0
   */
  async findAll(userRole: string, userId: string): Promise<any[]> {
    const whereCondition = userRole === 'ADMIN' 
      ? {} 
      : {
          OR: [
            { isPrivate: false },
            { userId: userId } // It allows the user to see their own 'Favorite' playlist and other hidden collections
          ]
        };

    const playlists = await this.prisma.playlist.findMany({
      where: whereCondition,
      include: {
        owner: { select: { id: true, name: true } },
        _count: { select: { songs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Sort in RAM: looking for an item named 'Favorite' belonging to the user
    const favIndex = playlists.findIndex(p => p.name === 'Favorite' && p.userId === userId);
    
    if (favIndex > -1) {
      const [favorites] = playlists.splice(favIndex, 1);
      return [favorites, ...playlists]; // indeks 0
    }

    return playlists;
  }
}