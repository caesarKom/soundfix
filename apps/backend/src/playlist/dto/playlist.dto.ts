import { Transform } from 'class-transformer';
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
  @Transform(({ value }) => value === 'true' || value === true)
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  coverUrl?: string;
}

export class ManagePlaylistSongsDto {
  @IsUUID('4', { message: 'Song ID must be a valid UUID' })
  @IsNotEmpty()
  songId!: string;
}

export class UpdatePlaylistDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  coverUrl?: string;
}