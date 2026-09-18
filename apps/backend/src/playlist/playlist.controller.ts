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
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlaylistService } from './playlist.service';
import {
  CreatePlaylistDto,
  ManagePlaylistSongsDto,
  UpdatePlaylistDto,
} from './dto/playlist.dto';
import {
  CurrentUser,
  ObjectUser,
} from '../auth/decorators/current-user.decorator';
import { Playlist } from '../generated/prisma/client';
import type { UploadedFileDto } from '../music/dto/music.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MusicService } from '../music/music.service';

@UseGuards(AuthGuard('jwt'))
@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService, private readonly musicService: MusicService) {}

   // POST /v1/playlists/favorites/toggle/:musicId
  @Post('favorites/toggle/:musicId')
  async toggleFavorite(
    @Param('musicId') musicId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.musicService.toggleLikeSong(musicId, user.id);
  }

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
    @CurrentUser() userId: string,
  ): Promise<any[]> {
    const userRole = (req.user?.role as string) || 'MEMBER';
    return this.playlistService.findAll(userRole, userId);
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

    @Get(':id/song')
  async getPlaylistSong(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Req() req: Record<string, any>,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const userRole = (req.user?.role as string) || 'MEMBER';
    return this.playlistService.findPlaylistSongs(id, userId, userRole, pageNum, limitNum);
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
    @ObjectUser('role') userRole: string,
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
