import { IsOptional, IsInt, Min, Max, IsString, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';

export class SessionListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBooleanString()
  isRevoked?: string;
}

export interface SessionResponseDto {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    deviceInfo?: string | null;
    ipAddress?: string | null;
    isRevoked: boolean;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}