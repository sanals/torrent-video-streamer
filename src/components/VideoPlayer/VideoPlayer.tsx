import React, { useRef, useState, useEffect } from 'react';
import { Paper, Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BufferOverlay from './BufferOverlay';
import SubtitleControls from './SubtitleControls';
import type { FileData } from '../../services/apiClient';
import { getStreamUrl } from '../../services/apiClient';

interface Subtitle {
  label: string;
  src: string;
  srcLang: string;
}

interface VideoPlayerProps {
  src: string;
  title?: string;
  onClose?: () => void;
  infoHash?: string;
  fileIndex?: number;
  files?: FileData[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  onClose,
  infoHash,
  fileIndex,
  files = [],
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferPercent, setBufferPercent] = useState(0);

  // Filter available subtitle files from torrent
  const availableSubtitles = files.filter(
    (file) => file.name.endsWith('.srt') || file.name.endsWith('.vtt')
  );

  // Simple SRT to VTT converter
  const convertSRTtoVTT = (srt: string): string => {
    let vtt = 'WEBVTT\n\n';
    // Replace comma with dot in timestamps
    vtt += srt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    return vtt;
  };

  // Handle loading subtitle from torrent file
  const handleLoadSubtitle = async (file: FileData) => {
    try {
      // Construct URL to fetch subtitle file from backend
      const subtitleUrl = getStreamUrl(infoHash || '', file.index);
      
      // Fetch the subtitle file
      const response = await fetch(subtitleUrl);
      if (!response.ok) throw new Error('Failed to fetch subtitle');
      
      const text = await response.text();
      
      // Convert SRT to VTT if needed
      let vttContent = text;
      if (file.name.endsWith('.srt')) {
        vttContent = convertSRTtoVTT(text);
      }

      const blob = new Blob([vttContent], { type: 'text/vtt' });
      const url = URL.createObjectURL(blob);

      const newSubtitle: Subtitle = {
        label: file.name,
        src: url,
        srcLang: 'en', // We could parse this too, but 'en' is safe default
      };

      setSubtitles((prev) => {
        // Avoid duplicates
        if (prev.some((s) => s.label === newSubtitle.label)) return prev;
        return [...prev, newSubtitle];
      });
    } catch (err) {
      console.error(`Failed to load subtitle ${file.name}:`, err);
    }
  };

  // Handle subtitle file upload
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

      setSubtitles((prev) => {
        if (prev.some((s) => s.label === newSubtitle.label)) return prev;
        return [...prev, newSubtitle];
      });
    } catch (error) {
      console.error('Failed to upload subtitle:', error);
    }
  };

  // Handle poster image upload
  const handlePosterUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPoster(url);
    }
  };

  // Video event handlers for buffering
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleProgress = () => {
      if (video.buffered.length > 0 && video.duration > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const percent = (bufferedEnd / video.duration) * 100;
        setBufferPercent(percent);
      }
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
    };
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      subtitles.forEach((subtitle) => {
        URL.revokeObjectURL(subtitle.src);
      });
      if (poster) {
        URL.revokeObjectURL(poster);
      }
    };
  }, [subtitles, poster]);

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
              default={index === subtitles.length - 1} // Auto-select newest
            />
          ))}
          Your browser does not support the video tag.
        </video>
      </Box>

      <SubtitleControls
        subtitles={subtitles}
        availableFiles={availableSubtitles}
        onSubtitleUpload={handleSubtitleUpload}
        onLoadSubtitle={handleLoadSubtitle}
      />
    </Paper>
  );
};

export default VideoPlayer;
