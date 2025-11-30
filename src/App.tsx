import { useEffect, useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Snackbar, Alert, Typography, Box, Divider } from '@mui/material';
import VideoPlayer from './components/VideoPlayer';
import TorrentManager from './components/TorrentManager';
import TorrentSearch from './components/TorrentSearch/TorrentSearch';
import * as apiClient from './services/apiClient';
import { websocketClient } from './services/websocketClient';
import type { TorrentData } from './services/apiClient';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

interface CurrentVideo {
  url: string;
  name: string;
  infoHash: string;
  fileIndex: number;
}

function App() {
  const [torrents, setTorrents] = useState<TorrentData[]>([]);
  const [currentVideo, setCurrentVideo] = useState<CurrentVideo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Connect to WebSocket on mount
  useEffect(() => {
    websocketClient.connect();

    // Listen for torrent progress updates
    const handleProgress = (data: TorrentData[]) => {
      setTorrents(data);
    };

    const handleUpdate = (data: TorrentData[]) => {
      setTorrents(data);
    };

    websocketClient.on('torrent:progress', handleProgress);
    websocketClient.on('torrent:update', handleUpdate);

    // Fetch initial torrents
    fetchTorrents();

    // Cleanup on unmount
    return () => {
      websocketClient.off('torrent:progress', handleProgress);
      websocketClient.off('torrent:update', handleUpdate);
      websocketClient.disconnect();
    };
  }, []);

  const fetchTorrents = async () => {
    try {
      const fetchedTorrents = await apiClient.getTorrents();
      setTorrents(fetchedTorrents);
    } catch (err) {
      console.error('Failed to fetch torrents:', err);
    }
  };

  const handleAddTorrent = async (magnetURI: string) => {
    setIsAdding(true);
    setError(null);

    try {
      const torrent = await apiClient.addTorrent(magnetURI);
      console.log('Torrent added:', torrent.name || torrent.infoHash);
      // Fetch updated list
      await fetchTorrents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add torrent';
      setError(errorMessage);
      console.error('Error adding torrent:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTorrent = async (infoHash: string, deleteData: boolean) => {
    try {
      await apiClient.removeTorrent(infoHash, deleteData);

      // Clear current video if it's the one being removed
      if (currentVideo && currentVideo.url.includes(infoHash)) {
        setCurrentVideo(null);
      }

      // Fetch updated list
      await fetchTorrents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove torrent';
      setError(errorMessage);
      console.error('Error removing torrent:', err);
    }
  };

  const handlePauseTorrent = async (infoHash: string) => {
    try {
      await apiClient.pauseTorrent(infoHash);
      await fetchTorrents();
    } catch (err) {
      console.error('Error pausing torrent:', err);
    }
  };

  const handleResumeTorrent = async (infoHash: string) => {
    try {
      await apiClient.resumeTorrent(infoHash);
      await fetchTorrents();
    } catch (err) {
      console.error('Error resuming torrent:', err);
    }
  };

  const handlePlayFile = (infoHash: string, fileIndex: number, fileName: string) => {
    const streamUrl = apiClient.getStreamUrl(infoHash, fileIndex);
    setCurrentVideo({
      url: streamUrl,
      name: fileName,
      infoHash,
      fileIndex,
    });
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            🎬 Torrent Video Streamer
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Stream videos directly from torrents
          </Typography>
        </Box>

        {currentVideo && (
          <VideoPlayer
            src={currentVideo.url}
            title={currentVideo.name}
            onClose={() => setCurrentVideo(null)}
            infoHash={currentVideo.infoHash}
            fileIndex={currentVideo.fileIndex}
          />
        )}

        <TorrentSearch onAddTorrent={handleAddTorrent} />

        <Divider sx={{ my: 4 }} />

        <TorrentManager
          torrents={torrents}
          onAddTorrent={handleAddTorrent}
          onRemoveTorrent={handleRemoveTorrent}
          onPlayFile={handlePlayFile}
          onPauseTorrent={handlePauseTorrent}
          onResumeTorrent={handleResumeTorrent}
          isAdding={isAdding}
        />

        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
