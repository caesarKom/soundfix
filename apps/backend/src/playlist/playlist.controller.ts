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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Playlist } from '../generated/prisma/client';
import type { UploadedFileDto } from '../music/dto/music.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { MusicService } from '../music/music.service';

@UseGuards(AuthGuard('jwt'))
@Controller('playlists')
export class PlaylistController {
  constructor(
    private readonly playlistService: PlaylistService,
    private readonly musicService: MusicService,
  ) {}

  /**
   * Toggles heart status for a specific song (Favorite / Unfavorite)
   * POST /v1/playlists/favorites/toggle/:musicId
   */
  @Post('favorites/toggle/:musicId')
  async toggleFavorite(
    @Param('musicId') musicId: string,
    @CurrentUser() userId: string, // Returns string ID directly
  ) {
    return this.musicService.toggleLikeSong(musicId, userId);
  }

  /**
   * Creates a custom playlist with an optional image file cover
   * POST /v1/playlists
   */
  @Post()
  @UseInterceptors(FileInterceptor('cover'))
  async create(
    @Body() dto: CreatePlaylistDto,
    @CurrentUser() userId: string,
    @UploadedFile() coverFile?: UploadedFileDto,
  ): Promise<Playlist> {
    return this.playlistService.create(dto, userId, coverFile);
  }

  /**
   * Fetches all visible lists including the virtual favorites card at index 0
   * GET /v1/playlists
   */
  @Get()
  async getAllPublicPlaylists(
    @Req() req: Record<string, any>,
    @CurrentUser() userId: string,
  ): Promise<any[]> {
    const userRole = (req.user?.role as string) || 'MEMBER';
    return this.playlistService.findAll(userRole, userId);
  }

  /**
   * Fetches the top-level metadata of a single playlist
   * GET /v1/playlists/:id
   */
  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Req() req: Record<string, any>,
  ): Promise<any> {
    const userRole = (req.user?.role as string) || 'MEMBER';
    return this.playlistService.findOne(id, userId, userRole);
  }

  /**
   * Fetches dynamic, infinite-scroll paginated tracks belonging to the playlist
   * GET /v1/playlists/:id/songs?page=1&limit=20
   */
  @Get(':id/songs')
  async getPlaylistSongs(
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

  /**
   * Attaches a song to a user custom playlist
   * POST /v1/playlists/:id/songs
   */
  @Post(':id/songs')
  @HttpCode(HttpStatus.OK)
  async addSong(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body() dto: ManagePlaylistSongsDto,
  ): Promise<void> {
    await this.playlistService.addSong(id, userId, dto);
  }

  /**
   * Updates fields or replaces the image file cover for a playlist
   * PATCH /v1/playlists/:id
   */
  @Patch(':id')
  @UseInterceptors(FileInterceptor('cover'))
  async update(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Req() req: Record<string, any>,
    @Body() dto: UpdatePlaylistDto,
    @UploadedFile() newCoverFile?: UploadedFileDto,
  ) {
    const userRole = (req.user?.role as string) || 'MEMBER';
    return this.playlistService.update(id, userId, userRole, dto, newCoverFile);
  }

  /**
   * Detaches a song from a user custom playlist
   * DELETE /v1/playlists/:id/songs
   */
  @Delete(':id/songs')
  @HttpCode(HttpStatus.OK)
  async removeSong(
    @Param('id') id: string,
    @CurrentUser() userId: string,
    @Body() dto: ManagePlaylistSongsDto,
  ): Promise<void> {
    await this.playlistService.removeSong(id, userId, dto);
  }

  /**
   * Drops a full custom playlist entity along with its local storage images
   * DELETE /v1/playlists/:id
   */
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
