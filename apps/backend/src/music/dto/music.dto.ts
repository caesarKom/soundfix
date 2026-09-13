import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateMusicDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  artist!: string;

  @IsString()
  @IsOptional()
  album?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value)) // 👈 Converts a string from multipart to number
  duration!: number;
}

export interface MusicListResponseDto {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  coverUrl: string;
  playCount: number;
  mimeType: string;
  isPublic: boolean;
}

export interface UploadedFileDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  mimeType: string;
}

export class UpdateMusicDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  artist?: string;

  @IsOptional()
  @IsString()
  album?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublic?: boolean;
}

export interface LikedSongItem {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  coverUrl: string;
}
