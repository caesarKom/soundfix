import { ClassTransformer } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

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
}

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Incorrect email address format' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Code must be at least 6 characters long' })
  code!: string;
}