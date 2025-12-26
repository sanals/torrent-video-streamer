import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as apiClient from '@/services/apiClient';
import type { TorrentData } from '@/services/apiClient';
import { websocketClient, type WebSocketStatus } from '@/services/websocketClient';

type HealthStatus = 'unknown' | 'ok' | 'down';

export interface CurrentVideo {
  url: string;
  name: string;
  infoHash: string;
  fileIndex: number;
}

interface UseBackendTorrentsResult {
  torrents: TorrentData[];
  currentVideo: CurrentVideo | null;
  isAdding: boolean;
  error: string | null;
  wsStatus: WebSocketStatus;
  healthStatus: HealthStatus;
  handleAddTorrent: (magnetURI: string, torrentFile?: File) => Promise<void>;
  handleRemoveTorrent: (infoHash: string, deleteData: boolean) => Promise<void>;
  handlePauseTorrent: (infoHash: string) => Promise<void>;
  handleResumeTorrent: (infoHash: string) => Promise<void>;
  handlePlayFile: (infoHash: string, fileIndex: number, fileName: string) => Promise<void>;
  closeVideo: () => void;
  clearError: () => void;
}

/**
 * Centralizes backend-driven torrent lifecycle and WebSocket updates.
 * Keeps App.tsx lean by exposing state + handlers from a single hook.
 */
export function useBackendTorrents(): UseBackendTorrentsResult {
  const [torrents, setTorrents] = useState<TorrentData[]>([]);
  const [currentVideo, setCurrentVideo] = useState<CurrentVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>(websocketClient.getStatus());
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('unknown');
  const mountedRef = useRef(false);

  const fetchTorrents = useCallback(async () => {
    try {
      const fetched = await apiClient.getTorrents();
      setTorrents(fetched);
    } catch (err) {
      console.error('Failed to fetch torrents:', err);
    }
  }, []);

  const runHealthCheck = useCallback(async () => {
    try {
      const ok = await apiClient.checkHealth();
      setHealthStatus(ok ? 'ok' : 'down');
    } catch {
      setHealthStatus('down');
    }
  }, []);

  // Init WebSocket + health + initial data
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    websocketClient.connect();
    const handleProgress = (data: TorrentData[]) => setTorrents(data);
    const handleUpdate = (data: TorrentData[]) => setTorrents(data);
    const handleStatus = (status: WebSocketStatus) => setWsStatus(status);

    websocketClient.on('torrent:progress', handleProgress);
    websocketClient.on('torrent:update', handleUpdate);
    websocketClient.onStatusChange(handleStatus);

    fetchTorrents();
    runHealthCheck();

    const handleBeforeUnload = () => websocketClient.disconnect();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      websocketClient.off('torrent:progress', handleProgress);
      websocketClient.off('torrent:update', handleUpdate);
      websocketClient.offStatusChange(handleStatus);
      websocketClient.disconnect();
    };
  }, [fetchTorrents, runHealthCheck]);

  const handleAddTorrent = useCallback(
    async (magnetURI: string, torrentFile?: File) => {
      setIsAdding(true);
      setError(null);
      try {
        await apiClient.addTorrent(magnetURI, torrentFile);
        await fetchTorrents();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add torrent';
        setError(errorMessage);
        console.error('Error adding torrent:', err);
      } finally {
        setIsAdding(false);
      }
    },
    [fetchTorrents]
  );

  const handleRemoveTorrent = useCallback(
    async (infoHash: string, deleteData: boolean) => {
      try {
        await apiClient.removeTorrent(infoHash, deleteData);
        if (currentVideo && currentVideo.infoHash === infoHash) {
          setCurrentVideo(null);
        }
        await fetchTorrents();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to remove torrent';
        setError(errorMessage);
        console.error('Error removing torrent:', err);
      }
    },
    [currentVideo, fetchTorrents]
  );

  const handlePauseTorrent = useCallback(
    async (infoHash: string) => {
      try {
        await apiClient.pauseTorrent(infoHash);
        await fetchTorrents();
      } catch (err) {
        console.error('Error pausing torrent:', err);
      }
    },
    [fetchTorrents]
  );

  const handleResumeTorrent = useCallback(
    async (infoHash: string) => {
      try {
        await apiClient.resumeTorrent(infoHash);
        await fetchTorrents();
      } catch (err) {
        console.error('Error resuming torrent:', err);
      }
    },
    [fetchTorrents]
  );

  const handlePlayFile = useCallback(
    async (infoHash: string, fileIndex: number, fileName: string) => {
      const torrent = torrents.find((t) => t.infoHash === infoHash);
      if (torrent?.paused) {
        setError('Please start downloading the torrent first before playing. Click the download button.');
        return;
      }
      const streamUrl = apiClient.getStreamUrl(infoHash, fileIndex);
      setCurrentVideo({
        url: streamUrl,
        name: fileName,
        infoHash,
        fileIndex,
      });
    },
    [torrents]
  );

  const closeVideo = useCallback(() => setCurrentVideo(null), []);
  const clearError = useCallback(() => setError(null), []);

  return useMemo(
    () => ({
      torrents,
      currentVideo,
      isAdding,
      error,
      wsStatus,
      healthStatus,
      handleAddTorrent,
      handleRemoveTorrent,
      handlePauseTorrent,
      handleResumeTorrent,
      handlePlayFile,
      closeVideo,
      clearError,
    }),
    [
      torrents,
      currentVideo,
      isAdding,
      error,
      wsStatus,
      healthStatus,
      handleAddTorrent,
      handleRemoveTorrent,
      handlePauseTorrent,
      handleResumeTorrent,
      handlePlayFile,
      closeVideo,
      clearError,
    ]
  );
}

