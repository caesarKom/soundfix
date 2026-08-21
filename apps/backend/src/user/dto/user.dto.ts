import { ClassTransformer, Type } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

export class UserRegisterDto {
  @IsEmail({}, { message: 'Incorrect email address format' })
  email!: string;

  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  name!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}

export class UserLoginDto {
  @IsEmail({}, { message: 'Incorrect email address format' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;
}

enum Gender {
  MALE,
  FEMALE,
  OTHER,
}

export class ProfileUpdateDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() birthDay?: string;
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsString() avatar?: string;
  @IsOptional() @IsEnum(Gender) gender?: Gender;
}

export class UserUpdateDto {
  @IsOptional()
  @IsEmail({}, { message: 'Incorrect email address format' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileUpdateDto)
  profile?: ProfileUpdateDto;
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Incorrect email address format' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Code must be at least 6 characters long' })
  code!: string;
}