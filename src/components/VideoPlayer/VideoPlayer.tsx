import React, { useRef, useState, useEffect } from 'react';
import { Box, IconButton, Typography, Paper, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BufferOverlay from './BufferOverlay';
import SubtitleControls from './SubtitleControls';

interface VideoPlayerProps {
  src: string;
  title?: string;
  onClose?: () => void;
  infoHash?: string;
  fileIndex?: number;
}

interface Subtitle {
  label: string;
  src: string;
  srcLang: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, onClose, infoHash, fileIndex }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferPercent, setBufferPercent] = useState(0);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [poster, setPoster] = useState<string | undefined>(undefined);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Buffering event handlers
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleCanPlay = () => setIsBuffering(false);
    const handleLoadStart = () => setIsBuffering(true);

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          const percent = (bufferedEnd / duration) * 100;
          setBufferPercent(percent);
        }
      }
    };

    // Add event listeners
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('loadstart', handleLoadStart);

    // Cleanup
    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [src]);

  // Load subtitle files from torrent if available
  useEffect(() => {
    if (infoHash && fileIndex !== undefined) {
      // Future: Check for subtitle files in the same torrent
      setSubtitles([]);
    }
  }, [infoHash, fileIndex]);

  const handleSubtitleUpload = async (file: File) => {
    try {
      // Read the file
      const text = await file.text();

      // Convert SRT to VTT if needed
      let vttContent = text;
      if (file.name.endsWith('.srt')) {
        vttContent = convertSRTtoVTT(text);
      }

      // Create blob URL
      const blob = new Blob([vttContent], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);

      // Add to subtitles list
      const newSubtitle: Subtitle = {
        label: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        src: url,
        srcLang: 'en', // Default to English
      };

      setSubtitles([...subtitles, newSubtitle]);
    } catch (error) {
      console.error('Failed to upload subtitle:', error);
    }
  };

  const handlePosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPoster(url);
    }
  };

  return (
    <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
      {title && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component="label"
              size="small"
              startIcon={<UploadFileIcon />}
              sx={{ mr: 1 }}
            >
              Poster
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePosterUpload}
              />
            </Button>
            {onClose && (
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
        <BufferOverlay show={isBuffering} bufferPercent={bufferPercent} />
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          autoPlay
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
          }}
        >
          {subtitles.map((subtitle, index) => (
            <track
              key={index}
              kind="subtitles"
              label={subtitle.label}
              src={subtitle.src}
              srcLang={subtitle.srcLang}
              default={index === 0}
            />
          ))}
          Your browser does not support the video tag.
        </video>
      </Box>

      <SubtitleControls
        subtitles={subtitles}
        onSubtitleUpload={handleSubtitleUpload}
      />
    </Paper>
  );
};

// Simple SRT to VTT converter
function convertSRTtoVTT(srt: string): string {
  let vtt = 'WEBVTT\n\n';

  // Replace comma with dot in timestamps
  vtt += srt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');

  return vtt;
}

export default VideoPlayer;
