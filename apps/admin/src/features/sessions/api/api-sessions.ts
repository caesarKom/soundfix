import { apiClient } from "../../../api/api-client";
import type { SessionListQuery, SessionListResponse, SessionResponse } from "../types/session";

export const sessionsApi = {
  /**
   * Fetch all sessions with pagination and filters.
   */
  async getSessions(params: SessionListQuery): Promise<SessionListResponse> {
    const response = await apiClient.get('/admin/sessions', { params });
    return response.data;
  },

  /**
   * Fetch a single session by ID.
   */
  async getSessionById(id: string): Promise<SessionResponse> {
    const response = await apiClient.get(`/admin/sessions/${id}`);
    return response.data;
  },

  /**
   * Revoke a session.
   */
  async revokeSession(id: string): Promise<void> {
    await apiClient.delete(`/admin/sessions/${id}`);
  },

  /**
   * Revoke all sessions for a user.
   */
  async revokeAllUserSessions(userId: string): Promise<{ revokedCount: number }> {
    const response = await apiClient.delete(`/admin/sessions/user/${userId}`);
    return response.data;
  },

  /**
   * Clean up expired sessions.
   */
  async cleanupExpiredSessions(): Promise<{ deletedCount: number }> {
    const response = await apiClient.delete('/admin/sessions/cleanup/expired');
    return response.data;
  },
};