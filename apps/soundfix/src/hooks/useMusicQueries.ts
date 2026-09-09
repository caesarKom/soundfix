import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useEffect } from 'react';
import { usePlayerStore, Track } from '../store/usePlayerStore';


export const useMusicQuery = () => {
  const setAllTracks = usePlayerStore((s) => s.setAllTracks);

  const query = useQuery<Track[]>({
    queryKey: ['music'],
    queryFn: async () => {
      const res = await api.get('/music');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
    staleTime: 1000 * 60 * 5, // Data is "fresh" for 5 minutes
  });

  // Automatically sync with Zustand store when new data arrives
  useEffect(() => {
    if (Array.isArray(query.data) && query.data.length > 0) {
      setAllTracks(query.data);
    }
  }, [query.data, setAllTracks]);

  return query;
};

export const usePlaylistsQuery = () => {
  return useQuery({
    queryKey: ['playlists'],
    queryFn: async () => {
      const res = await api.get('/playlists');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
    staleTime: 1000 * 60 * 5,
  });
};