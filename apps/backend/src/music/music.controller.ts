import { Controller, Get, Param, UseGuards, Header, StreamableFile, NotFoundException, Body, UploadedFiles, BadRequestException, UseInterceptors, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MusicService } from './music.service';
import { CreateMusicDto, MusicListResponseDto, UploadedFileDto } from './dto/music.dto';
import { Music } from '../generated/prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

   @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  async uploadMusic(
    @Body() dto: CreateMusicDto,
    @CurrentUser() userId: string,
    @UploadedFiles() files: { audio?: UploadedFileDto[]; cover?: UploadedFileDto[] }, 
  ): Promise<Music> {
    const audioFile = files.audio?.[0];
    const coverFile = files.cover?.[0];

    if (!audioFile || !coverFile) {
      throw new BadRequestException('Both audio and cover files are required');
    }

    return this.musicService.create(dto, userId, audioFile, coverFile);
  }

  @Get()
  async getAllMusic(): Promise<MusicListResponseDto[]> {
    return this.musicService.findAll();
  }

  @Get(':id')
  async getOneSong(@Param('id') id: string): Promise<Music> {
    return this.musicService.findOne(id);
  }

  // 🎧 Safe streaming audio
  @Get('stream/:id')
  @Header('Content-Type', 'audio/mpeg') // Inform the player (e.g. on the phone) that it is an MP3 file
  @Header('Accept-Ranges', 'bytes')    // Allows you to rewind the song (jump to a specific moment)
  async streamMusic(@Param('id') id: string): Promise<StreamableFile> {
    return this.musicService.getAudioStream(id);
  }
}
