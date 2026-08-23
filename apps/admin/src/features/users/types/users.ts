export type UserRole = 'ADMIN' | 'MEMBER';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

interface Profile {
  firstName?: string;
    lastName?: string;
    birthDay?: string;
    avatar?: string;
    bio?: string;
    gender?: Gender;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  isVerified: boolean;
  profile?: Profile | null;
}

export interface CreateUser {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
}

export interface UpdateUserDto {
  name?: string;
  password?: string;
  role?: UserRole;
  isVerified?: boolean;
  profile?: Profile | null;
}