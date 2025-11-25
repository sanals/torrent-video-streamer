import { useCallback } from 'react';
import { useTorrentContext } from '@/contexts/TorrentContext';
import torrentService from '@/services/torrentService';
import type { TorrentData } from '@/types/torrent';

/**
 * Custom hook for managing torrents (add, remove, progress, etc.)
 */
export function useTorrent() {
  const { torrents, addTorrent, updateTorrent, removeTorrent, setLoading, setError, loading, error } = useTorrentContext();

  // Add a torrent and track progress
  const addAndTrackTorrent = useCallback(async (source: string) => {
    setLoading(true);
    setError(undefined);
    try {
      const torrent = await torrentService.addTorrent(source, (data: TorrentData) => {
        updateTorrent(data);
      });
      addTorrent(torrent);
    } catch (err: any) {
      setError(err?.message || 'Failed to add torrent');
    } finally {
      setLoading(false);
    }
  }, [addTorrent, updateTorrent, setLoading, setError]);

  // Remove a torrent
  const removeAndCleanupTorrent = useCallback(async (infoHash: string) => {
    setLoading(true);
    setError(undefined);
    try {
      await torrentService.removeTorrent(infoHash);
      removeTorrent(infoHash);
    } catch (err: any) {
      setError(err?.message || 'Failed to remove torrent');
    } finally {
      setLoading(false);
    }
  }, [removeTorrent, setLoading, setError]);

  return {
    torrents,
    loading,
    error,
    addAndTrackTorrent,
    removeAndCleanupTorrent,
  };
} 