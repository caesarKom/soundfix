import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}

export class ManagePlaylistSongsDto {
  @IsUUID('4', { message: 'Song ID must be a valid UUID' })
  @IsNotEmpty()
  songId!: string;
}
