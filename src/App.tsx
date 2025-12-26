import { useEffect, useRef } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Snackbar, Alert, Typography, Box, Divider, Chip, Stack } from '@mui/material';
import VideoPlayer from './components/VideoPlayer';
import TorrentManager from './components/TorrentManager';
import TorrentSearch from './components/TorrentSearch/TorrentSearch';
import { useBackendTorrents } from './hooks';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const {
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
  } = useBackendTorrents();

  const videoPlayerRef = useRef<HTMLDivElement>(null);
  const torrentManagerRef = useRef<HTMLDivElement>(null);

  // Also scroll when currentVideo changes (e.g., from other sources)
  useEffect(() => {
    if (currentVideo && videoPlayerRef.current) {
      setTimeout(() => {
        videoPlayerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [currentVideo]);

  // After adding, scroll to torrent manager
  const handleAddAndScroll = async (magnetURI: string, torrentFile?: File) => {
    await handleAddTorrent(magnetURI, torrentFile);
    setTimeout(() => {
      torrentManagerRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 300);
  };

  const wsStatusColor = {
    connecting: 'warning.main',
    reconnecting: 'warning.main',
    open: 'success.main',
    closed: 'text.secondary',
    failed: 'error.main',
  }[wsStatus];

  const wsStatusLabel = {
    connecting: 'Connecting',
    reconnecting: 'Reconnecting',
    open: 'Live',
    closed: 'Disconnected',
    failed: 'Failed',
  }[wsStatus];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 3 }
        }}
      >
        <Box sx={{ mb: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          <Stack spacing={1} alignItems="center">
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 600
              }}
            >
              🎬 Torrent Video Streamer
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Stream videos directly from torrents
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={`Backend: ${healthStatus === 'ok' ? 'Online' : healthStatus === 'down' ? 'Offline' : 'Checking...'}`}
                color={healthStatus === 'ok' ? 'success' : healthStatus === 'down' ? 'error' : 'default'}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`WS: ${wsStatusLabel}`}
                variant="outlined"
                sx={{
                  color: wsStatusColor,
                  borderColor: wsStatusColor,
                }}
              />
            </Stack>
            {healthStatus === 'down' && (
              <Alert severity="error" sx={{ width: '100%', maxWidth: 520 }}>
                Backend offline – torrents will not load until the server is reachable.
              </Alert>
            )}
          </Stack>
        </Box>

        <Box ref={videoPlayerRef}>
          {currentVideo && (
            <VideoPlayer
              src={currentVideo.url}
              title={currentVideo.name}
              onClose={closeVideo}
              infoHash={currentVideo.infoHash}
              fileIndex={currentVideo.fileIndex}
              files={torrents.find(t => t.infoHash === currentVideo.infoHash)?.files || []}
            />
          )}
        </Box>

        <TorrentSearch onAddTorrent={handleAddAndScroll} />

        <Divider sx={{ my: 4 }} />

        <Box ref={torrentManagerRef}>
        <TorrentManager
          torrents={torrents}
          onAddTorrent={handleAddTorrent}
          onRemoveTorrent={handleRemoveTorrent}
          onPlayFile={handlePlayFile}
          onPauseTorrent={handlePauseTorrent}
          onResumeTorrent={handleResumeTorrent}
          isAdding={isAdding}
          currentVideo={currentVideo}
        />
        </Box>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={clearError}>
          <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;
