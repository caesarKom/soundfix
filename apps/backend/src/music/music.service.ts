import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import * as fs from 'fs/promises';
import { join, extname } from 'path';
import { Music } from '../generated/prisma/client';
import {
  CreateMusicDto,
  LikedSongItem,
  MusicListResponseDto,
  UpdateMusicDto,
  UploadedFileDto,
} from './dto/music.dto';

@Injectable()
export class MusicService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateMusicDto,
    userId: string,
    audioFile: UploadedFileDto,
    coverFile: UploadedFileDto,
  ): Promise<Music> {
    const uploadAudioDir = join(process.cwd(), 'uploads', 'music');
    const uploadCoverDir = join(process.cwd(), 'uploads', 'covers');

    await fs.mkdir(uploadAudioDir, { recursive: true });
    await fs.mkdir(uploadCoverDir, { recursive: true });

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const audioPathName = `uploads/music/${uniqueSuffix}${extname(audioFile.originalname)}`;
    const coverPathName = `uploads/covers/${uniqueSuffix}${extname(coverFile.originalname)}`;

    await fs.writeFile(join(process.cwd(), audioPathName), audioFile.buffer);
    await fs.writeFile(join(process.cwd(), coverPathName), coverFile.buffer);

    const newSong = await this.prisma.music.create({
      data: {
        title: dto.title,
        artist: dto.artist,
        album: dto.album || null,
        duration: dto.duration,
        audioUrl: audioPathName,
        coverUrl: coverPathName,
        userId: userId,
        mimeType: audioFile.mimetype,
      },
    });

    return newSong;
  }

  async findAll(): Promise<MusicListResponseDto[]> {
    const records = await this.prisma.music.findMany({
      select: {
        id: true,
        title: true,
        artist: true,
        album: true,
        duration: true,
        coverUrl: true,
        playCount: true,
        mimeType: true,
      },
    });

    return records;
  }

  async findOne(id: string): Promise<Music> {
    const song = await this.prisma.music.findUnique({ where: { id } });
    if (!song) throw new NotFoundException('Song not found');
    return song;
  }

  async getAudioStream(id: string): Promise<StreamableFile> {
    const song = await this.prisma.music.findUnique({ where: { id } });
    if (!song) throw new NotFoundException('Song not found');

    // 'uploads/music/file.mp3'
    const filePath = join(process.cwd(), song.audioUrl);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Audio file not found on server storage');
    }

    void this.prisma.music.update({
      where: { id },
      data: { playCount: { increment: 1 } },
    });

    // Create a file read stream (efficient RAM management)
    const fileStream = createReadStream(filePath);
    return new StreamableFile(fileStream);
  }

  // 📝 Editing song data (Title, artist, album, visibility)
  async update(
    id: string,
    userId: string,
    userRole: string,
    dto: UpdateMusicDto,
    newAudio?: UploadedFileDto,
    newCover?: UploadedFileDto,
  ): Promise<Music> {
    const song = await this.findOne(id);

    // Permissions: Only the owner of the song or ADMIN can edit
    if (song.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to edit this song',
      );
    }

    const updateData: Record<string, any> = { ...dto };

    // 🔄 AUDIO REPLACEMENT
    if (newAudio) {
      // Delete the old file from the disk (we use a safe variable typed as string)
      const oldAudioPath: string = join(process.cwd(), song.audioUrl);
      try {
        await fs.unlink(oldAudioPath);
      } catch {
        /* ignore the missing file*/
      }

      // Save the new audio file
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const audioPathName = `uploads/music/${uniqueSuffix}${extname(newAudio.originalname)}`;
      await fs.writeFile(join(process.cwd(), audioPathName), newAudio.buffer);

      updateData.audioUrl = audioPathName;
    }

    // 🔄 COVER REPLACEMENT
    if (newCover) {
      const oldCoverPath: string = join(process.cwd(), song.coverUrl);
      try {
        await fs.unlink(oldCoverPath);
      } catch {
        /* ignore */
      }

      // Save the new cover file
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const coverPathName = `uploads/covers/${uniqueSuffix}${extname(newCover.originalname)}`;
      await fs.writeFile(join(process.cwd(), coverPathName), newCover.buffer);

      updateData.coverUrl = coverPathName;
    }

    // Update the song in the database
    const updatedSong = await this.prisma.music.update({
      where: { id },
      data: updateData,
    });

    return updatedSong;
  }

  // 🗑️ Deleting a song from the database and PHYSICALLY from the hard drive
  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const song = await this.findOne(id);

    if (song.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException(
        'You do not have permission to delete this song',
      );
    }

    // 1. Define full paths to files on disk
    const audioPath = join(process.cwd(), song.audioUrl);
    const coverPath = join(process.cwd(), song.coverUrl);

    // 2. Delete the MP3 file from the disk if it physically exists
    try {
      await fs.unlink(audioPath);
    } catch (error) {
      // ignore the error if the file has already been manually deleted from the folder to avoid blocking the database
    }

    // 3. Delete the cover image from
    try {
      await fs.unlink(coverPath);
    } catch (error) {
      // Ignore
    }

    // 4. Delete the record from the database (Prisma will automatically clear the links to playlists)
    await this.prisma.music.delete({
      where: { id },
    });
  }

  //
  // Like/Unlike song switch (Like/Unlike in one method)
  //
  async toggleLikeSong(
    musicId: string,
    userId: string,
  ): Promise<{ liked: boolean }> {
    // check whether the song exists at all
    const song = await this.prisma.music.findUnique({ where: { id: musicId } });
    if (!song) throw new NotFoundException('Song not found');

    const existingLike = await this.prisma.likedSong.findUnique({
      where: {
        userId_musicId: { userId, musicId },
      },
    });

    if (existingLike) {
      await this.prisma.likedSong.delete({
        where: { id: existingLike.id },
      });
      return { liked: false };
    } else {
      await this.prisma.likedSong.create({
        data: { userId, musicId },
      });
      return { liked: true };
    }
  }

  async getLikedSongs(userId: string): Promise<LikedSongItem[]> {
    const likedRecords = await this.prisma.likedSong.findMany({
      where: { userId },
      include: {
        music: {
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
      orderBy: { createdAt: 'desc' },
    });

    const songs: LikedSongItem[] = likedRecords.map(
      (record): LikedSongItem => record.music,
    );

    return songs;
  }

  // 3. 🔍 Search Global
  async globalSearch(query: string) {
    if (!query || query.trim() === '') {
      return { songs: [], playlists: [] };
    }

    const searchString = query.trim();

    // search in parallel in songs and public playlists (high efficiency)
    const [songs, playlists] = await Promise.all([
      // Search for songs by title or artist
      this.prisma.music.findMany({
        where: {
          OR: [
            { title: { contains: searchString, mode: 'insensitive' } },
            { artist: { contains: searchString, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          artist: true,
          album: true,
          duration: true,
          coverUrl: true,
        },
        take: 20, // Performance Score Limit
      }),

      // Searching for public playlists by name
      this.prisma.playlist.findMany({
        where: {
          name: { contains: searchString, mode: 'insensitive' },
          isPrivate: false, // Only public playlists
        },
        select: {
          id: true,
          name: true,
          description: true,
          coverUrl: true,
          _count: { select: { songs: true } },
        },
        take: 10,
      }),
    ]);

    return { songs, playlists };
  }
}
