export type UserRole = 'ADMIN' | 'MEMBER';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
}

export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
  isVerified?: boolean;
}
