import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '../store/sessionStore';
import { toast } from 'sonner';
import { sessionsApi } from '../features/sessions/api/api-sessions';

export const SESSIONS_QUERY_KEY = ['admin', 'sessions'];

export function useSessions() {
  const { query } = useSessionStore();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...SESSIONS_QUERY_KEY, query],
    queryFn: () => sessionsApi.getSessions(query),
    staleTime: 30 * 1000, // 30 seconds
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => sessionsApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      toast.success('Session revoked successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to revoke session');
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: (userId: string) => sessionsApi.revokeAllUserSessions(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      toast.success(`Revoked ${data.revokedCount} session(s) for user`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to revoke sessions');
    },
  });

  const cleanupMutation = useMutation({
    mutationFn: () => sessionsApi.cleanupExpiredSessions(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
      toast.success(`Deleted ${data.deletedCount} expired session(s)`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to clean up sessions');
    },
  });

  return {
    sessions: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    isError,
    refetch,
    revokeSession: revokeMutation.mutate,
    revokeAllSessions: revokeAllMutation.mutate,
    cleanupExpired: cleanupMutation.mutate,
    isRevoking: revokeMutation.isPending,
    isRevokingAll: revokeAllMutation.isPending,
    isCleaning: cleanupMutation.isPending,
  };
}