export interface SessionResponse {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  deviceInfo?: string;
  ipAddress?: string;
  isRevoked: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  isRevoked?: string;
}

export interface SessionListResponse {
  data: SessionResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RevokeAllResponse {
  revokedCount: number;
}

export interface CleanupResponse {
  deletedCount: number;
}