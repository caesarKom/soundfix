import {
  Controller,
  Get,
  Param,
  UseGuards,
  Header,
  StreamableFile,
  NotFoundException,
  Body,
  UploadedFiles,
  BadRequestException,
  UseInterceptors,
  Post,
  Patch,
  Req,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MusicService } from './music.service';
import {
  CreateMusicDto,
  MusicListResponseDto,
  UpdateMusicDto,
  UploadedFileDto,
} from './dto/music.dto';
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
    @UploadedFiles()
    files: { audio?: UploadedFileDto[]; cover?: UploadedFileDto[] },
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
  @Header('Accept-Ranges', 'bytes') // Allows you to rewind the song (jump to a specific moment)
  async streamMusic(@Param('id') id: string): Promise<StreamableFile> {
    return this.musicService.getAudioStream(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  async updateSong(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Req() req: Record<string, any>, // 👈 fetch the req to safely extract the role added by JwtStrategy
    @Body() dto: UpdateMusicDto,
    @UploadedFiles()
    files?: { audio?: UploadedFileDto[]; cover?: UploadedFileDto[] },
  ): Promise<Music> {
    const userRole = (req.user?.role as string) || 'USER';
    // Extract files if they were submitted in the form-data form
    const audioFile = files?.audio?.[0];
    const coverFile = files?.cover?.[0];

    return this.musicService.update(
      id,
      userId,
      userRole,
      dto,
      audioFile,
      coverFile,
    );
  }

  // 🗑️ Endpoint Usuwania Utworu
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // status 204
  async deleteSong(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Req() req: Record<string, any>,
  ): Promise<void> {
    const userRole = (req.user?.role as string) || 'USER';
    await this.musicService.remove(id, userId, userRole);
  }
}
