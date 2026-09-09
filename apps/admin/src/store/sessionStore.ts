import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SessionListQuery } from '../features/sessions/types/session';

interface SessionState {
  // Filters and pagination
  query: SessionListQuery;
  selectedSessionId: string | null;
  isRevokeDialogOpen: boolean;
  isRevokeAllDialogOpen: boolean;
  targetUserId: string | null;
  targetUserEmail: string | null;

  // Actions
  setQuery: (query: Partial<SessionListQuery>) => void;
  setSelectedSessionId: (id: string | null) => void;
  setRevokeDialogOpen: (open: boolean) => void;
  setRevokeAllDialogOpen: (open: boolean, userId?: string, userEmail?: string) => void;
  resetFilters: () => void;
}

const defaultQuery: SessionListQuery = {
  page: 1,
  limit: 20,
  search: '',
  isRevoked: undefined,
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      query: defaultQuery,
      selectedSessionId: null,
      isRevokeDialogOpen: false,
      isRevokeAllDialogOpen: false,
      targetUserId: null,
      targetUserEmail: null,

      setQuery: (query) =>
        set((state) => ({
          query: { ...state.query, ...query },
        })),

      setSelectedSessionId: (id) =>
        set({ selectedSessionId: id }),

      setRevokeDialogOpen: (open) =>
        set({ isRevokeDialogOpen: open }),

      setRevokeAllDialogOpen: (open, userId, userEmail) =>
        set({
          isRevokeAllDialogOpen: open,
          targetUserId: userId || null,
          targetUserEmail: userEmail || null,
        }),

      resetFilters: () =>
        set({ query: defaultQuery }),
    }),
    {
      name: 'session-store',
      partialize: (state) => ({
        query: state.query,
      }),
    }
  )
);