import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto, ManagePlaylistSongsDto, UpdatePlaylistDto } from './dto/playlist.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Playlist } from '../generated/prisma/client';
import type { UploadedFileDto } from '../music/dto/music.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard('jwt'))
@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  @UseInterceptors(FileInterceptor('cover'))
  async create(
    @Body() dto: CreatePlaylistDto,
    @CurrentUser() userId: string,
    @UploadedFile() coverFile?: UploadedFileDto,
  ): Promise<Playlist> {
    return this.playlistService.create(dto, userId, coverFile);
  }

  @Get() // GET /v1/playlists
  async getAllPublicPlaylists(
    @Req() req: Record<string, any>,
  ): Promise<Playlist[]> {
    const userRole = (req.user?.role as string) || 'MEMBER';
    return this.playlistService.findAll(userRole);
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Req() req: Record<string, any>,
  ): Promise<any> {
    const userRole = (req.user?.role as string) || 'MEMBER';
    return this.playlistService.findOne(id, userId, userRole);
  }

  @Post(':id/songs')
  @HttpCode(HttpStatus.OK)
  async addSong(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body() dto: ManagePlaylistSongsDto,
  ): Promise<void> {
    await this.playlistService.addSong(id, userId, dto);
  }

   @Patch(':id')
  @UseInterceptors(FileInterceptor('cover'))
  async update(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @CurrentUser('role') userRole: string,
    @Body() dto: UpdatePlaylistDto,
    @UploadedFile() newCoverFile?: UploadedFileDto,
  ) {
    return this.playlistService.update(id, userId, userRole, dto, newCoverFile);
  }

  @Delete(':id/songs')
  @HttpCode(HttpStatus.OK)
  async removeSong(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body() dto: ManagePlaylistSongsDto,
  ): Promise<void> {
    await this.playlistService.removeSong(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePlaylist(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Req() req: Record<string, any>,
  ): Promise<void> {
    const userRole = (req.user?.role as string) || 'MEMBER';
    await this.playlistService.remove(id, userId, userRole);
  }
}
