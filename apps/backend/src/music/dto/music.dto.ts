import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
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
}

export interface UploadedFileDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}