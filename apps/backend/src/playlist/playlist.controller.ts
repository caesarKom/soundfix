import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto, ManagePlaylistSongsDto } from './dto/playlist.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Playlist } from '../generated/prisma/client';

@UseGuards(AuthGuard('jwt'))
@Controller('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  async create(
    @Body() dto: CreatePlaylistDto,
    @CurrentUser() userId: string,
  ): Promise<Playlist> {
    return this.playlistService.create(dto, userId);
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
