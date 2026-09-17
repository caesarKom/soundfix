import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

export class MusicListQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export interface LikedSongItem {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  coverUrl: string;
}
