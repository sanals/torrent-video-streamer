import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Container, Typography } from '@mui/material';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#bb86fc' },
    secondary: { main: '#03dac6' },
    background: { default: '#121212', paper: '#1e1e1e' }
  }
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Torrent Video Streamer
        </Typography>
        <Typography align="center" color="text.secondary">
          Seamless video streaming from torrents. (Phase 1 setup)
        </Typography>
      </Container>
    </ThemeProvider>
  );
};

export default App;
