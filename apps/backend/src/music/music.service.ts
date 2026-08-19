import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import * as fs from 'fs/promises';
import { join, extname } from 'path';
import { Music } from '../generated/prisma/client';
import { CreateMusicDto, MusicListResponseDto, UploadedFileDto } from './dto/music.dto';

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
      },
    });

    return newSong as Music;
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
        playCount: true 
      },
    });

    return records as MusicListResponseDto[]
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
    const filePath = join(process.cwd(), song.audioUrl as string);

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
}
