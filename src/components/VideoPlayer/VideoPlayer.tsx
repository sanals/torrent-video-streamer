import React, { useRef, useState, useEffect } from 'react';
import { Paper, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BufferOverlay from './BufferOverlay';
import SubtitleControls from './SubtitleControls';
import type { FileData } from '../../services/apiClient';
import { getStreamUrl, onVideoPlay, onVideoPause } from '../../services/apiClient';

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


  // Video event handlers for buffering - accurate detection
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let bufferingTimeout: number | null = null;

    const calculateBufferStatus = () => {
      if (!video || video.duration === 0 || isNaN(video.duration)) {
        setBufferPercent(0);
        return;
      }

      const currentTime = video.currentTime;
      const duration = video.duration;
      
      // Find buffered range that contains current time
      let bufferedAhead = 0;
      let totalBuffered = 0;
      
      for (let i = 0; i < video.buffered.length; i++) {
        const start = video.buffered.start(i);
        const end = video.buffered.end(i);
        
        // Total buffered percentage
        totalBuffered = Math.max(totalBuffered, (end / duration) * 100);
        
        // Buffer ahead of current playback position
        if (currentTime >= start && currentTime < end) {
          bufferedAhead = end - currentTime;
        }
      }

      // Update buffer percentage (show total buffered)
      setBufferPercent(totalBuffered);
    };

    const handleWaiting = () => {
      // Video is waiting for data - show buffering
      setIsBuffering(true);
      calculateBufferStatus();
    };

    const handleCanPlay = () => {
      // Enough data to play - clear buffering after a short delay
      // This prevents flickering if canplay fires before waiting is cleared
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
      }
      bufferingTimeout = window.setTimeout(() => {
        setIsBuffering(false);
      }, 100);
      calculateBufferStatus();
    };

    const handleCanPlayThrough = () => {
      // Enough data to play through - definitely not buffering
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
      }
      setIsBuffering(false);
      calculateBufferStatus();
    };

    const handleProgress = () => {
      // Update buffer percentage as data loads
      calculateBufferStatus();
    };

    const handlePlaying = () => {
      // Video started playing - clear buffering
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
      }
      setIsBuffering(false);
      calculateBufferStatus();
    };

    const handleStalled = () => {
      // Network stalled - show buffering
      setIsBuffering(true);
      calculateBufferStatus();
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('playing', handlePlaying);

    // Initial check
    calculateBufferStatus();

    return () => {
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
      }
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      subtitles.forEach((subtitle) => {
        URL.revokeObjectURL(subtitle.src);
      });
    };
  }, [subtitles]);

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
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      )}

      <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
        <BufferOverlay show={isBuffering} bufferPercent={bufferPercent} />
        <video
          ref={videoRef}
          src={src}
          controls
          autoPlay
          playsInline
          webkit-playsinline="true"
          crossOrigin="anonymous"
          preload="metadata"
          onPlay={() => {
            // Notify backend that video started playing (resume download if paused)
            if (infoHash) {
              onVideoPlay(infoHash);
            }
          }}
          onPause={() => {
            // Notify backend that video paused (pause download if enabled)
            if (infoHash) {
              onVideoPause(infoHash);
            }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            touchAction: 'none',
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
