import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Paper, Box, Typography, IconButton, Button, Tooltip, Select, MenuItem, FormControl, InputLabel, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import UndoIcon from '@mui/icons-material/Undo';
import LinkIcon from '@mui/icons-material/Link';
import BufferOverlay from './BufferOverlay';
import SubtitleControls from './SubtitleControls';
import type { FileData, AudioTrack, TorrentData } from '../../services/apiClient';
import { getStreamUrl, onVideoPlay, onVideoPause, getStreamInfo, getTorrent, isMSESupported } from '../../services/apiClient';
import { MSEPlayer } from '../../utils/MSEPlayer';

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
  magnetURI?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  onClose,
  infoHash,
  fileIndex,
  files = [],
  magnetURI,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const msePlayerRef = useRef<MSEPlayer | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [bufferPercent, setBufferPercent] = useState(0);
  const [isTranscoded, setIsTranscoded] = useState(false);
  const [isMSEMode, setIsMSEMode] = useState(false);
  const [mseError, setMseError] = useState<string | null>(null);
  const [effectiveSrc, setEffectiveSrc] = useState(src);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<number>(0);
  const [loadingAudioTracks, setLoadingAudioTracks] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [torrentStats, setTorrentStats] = useState<TorrentData | null>(null);

  // Cleanup MSE player
  const cleanupMSE = useCallback(() => {
    if (msePlayerRef.current) {
      msePlayerRef.current.destroy();
      msePlayerRef.current = null;
    }
    setIsMSEMode(false);
    setMseError(null);
  }, []);

  // Reset state when src changes
  useEffect(() => {
    cleanupMSE();
    setIsTranscoded(false);
    setEffectiveSrc(src);
    setAudioTracks([]);
    setSelectedAudioTrack(0);
    setVideoDuration(0);
    setTorrentStats(null);
  }, [src, cleanupMSE]);



  // Fetch audio tracks info
  useEffect(() => {
    if (infoHash && typeof fileIndex === 'number') {
      setLoadingAudioTracks(true);
      getStreamInfo(infoHash, fileIndex)
        .then(info => {
          setAudioTracks(info.audioTracks || []);
          if (info.duration) setVideoDuration(info.duration);
        })
        .catch(err => {
          console.warn('Failed to fetch audio tracks:', err);
        })
        .finally(() => {
          setLoadingAudioTracks(false);
        });
    }
  }, [infoHash, fileIndex]);

  // Handle Fix Audio button click - uses MSE for seekable transcoded playback
  const handleFixAudio = async () => {
    if (!infoHash || typeof fileIndex !== 'number' || !videoRef.current) return;

    // Check if MSE is supported
    if (!isMSESupported()) {
      setMseError('MediaSource Extensions not supported in this browser');
      return;
    }

    // Clean up any existing MSE player
    cleanupMSE();

    setIsTranscoded(true);
    setIsMSEMode(true);
    setIsBuffering(true);
    setMseError(null);

    try {
      // Create MSE player
      const player = new MSEPlayer({
        videoElement: videoRef.current,
        infoHash,
        fileIndex,
        audioTrack: selectedAudioTrack,
        onError: (error) => {
          console.error('MSE Player error:', error);
          setMseError(error.message);
          setIsBuffering(false);
        },
        onBuffering: (buffering) => {
          setIsBuffering(buffering);
        },
        onReady: () => {
          console.log('📺 MSE Player ready!');
          setIsBuffering(false);
          // Update duration from MSE player
          const dur = player.getDuration();
          if (dur > 0) {
            setVideoDuration(dur);
          }
          // Start playback
          videoRef.current?.play().catch(() => { });
        },
      });

      msePlayerRef.current = player;

      // Initialize the player
      await player.initialize();

    } catch (error) {
      console.error('Failed to initialize MSE player:', error);
      setMseError((error as Error).message);
      setIsBuffering(false);
      setIsMSEMode(false);
    }
  };

  // Handle Use Original button click (undo audio fix)
  const handleUseOriginal = () => {
    cleanupMSE();
    setIsTranscoded(false);
    setEffectiveSrc(src);

    // Reset video to play from start with original source
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => { });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupMSE();
    };
  }, [cleanupMSE]);

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


  // Video event handlers for buffering - with debouncing to prevent flickering
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Debounce settings to prevent flickering on slow networks
    const SHOW_DELAY = 800;      // Wait 800ms before showing buffering
    const HIDE_DELAY = 500;      // Wait 500ms before hiding buffering
    const MIN_SHOW_TIME = 1500;  // Keep buffering visible for at least 1.5s once shown

    let showTimeout: number | null = null;
    let hideTimeout: number | null = null;
    let lastShownAt: number = 0;
    let isWaiting = false;
    let wasPlayingBeforeBuffering = false; // Track if video was playing before buffering

    const calculateBufferStatus = () => {
      if (!video || video.duration === 0 || isNaN(video.duration)) {
        setBufferPercent(0);
        return;
      }

      const duration = video.duration;
      let totalBuffered = 0;

      for (let i = 0; i < video.buffered.length; i++) {
        const end = video.buffered.end(i);
        totalBuffered = Math.max(totalBuffered, (end / duration) * 100);
      }

      setBufferPercent(totalBuffered);
    };

    const showBuffering = () => {
      // Clear any pending hide
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      // Pause video if it's playing
      if (!video.paused) {
        wasPlayingBeforeBuffering = true;
        video.pause();
      } else {
        wasPlayingBeforeBuffering = false;
      }

      setIsBuffering(true);
      lastShownAt = Date.now();
    };

    const hideBuffering = () => {
      // Clear any pending show
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }

      // Ensure minimum show time
      const timeSinceShown = Date.now() - lastShownAt;
      const remainingTime = Math.max(0, MIN_SHOW_TIME - timeSinceShown);

      if (remainingTime > 0) {
        // Wait for minimum show time to complete
        hideTimeout = window.setTimeout(() => {
          if (!isWaiting) {
            setIsBuffering(false);
            // Resume video if it was playing before buffering
            if (wasPlayingBeforeBuffering && video.paused) {
              video.play().catch(err => {
                console.warn('Failed to resume video after buffering:', err);
              });
            }
          }
          hideTimeout = null;
        }, remainingTime);
      } else {
        setIsBuffering(false);
        // Resume video if it was playing before buffering
        if (wasPlayingBeforeBuffering && video.paused) {
          video.play().catch(err => {
            console.warn('Failed to resume video after buffering:', err);
          });
        }
      }
    };

    const scheduleShowBuffering = () => {
      isWaiting = true;

      // Clear any pending hide
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }

      // Don't schedule if already showing or already scheduled
      if (showTimeout) return;

      showTimeout = window.setTimeout(() => {
        if (isWaiting) {
          showBuffering();
        }
        showTimeout = null;
      }, SHOW_DELAY);
    };

    const scheduleHideBuffering = () => {
      isWaiting = false;

      // Clear any pending show
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }

      // Don't schedule if already hidden or already scheduled
      if (hideTimeout) return;

      hideTimeout = window.setTimeout(() => {
        if (!isWaiting) {
          hideBuffering();
        }
        hideTimeout = null;
      }, HIDE_DELAY);
    };

    const handleWaiting = () => {
      scheduleShowBuffering();
      calculateBufferStatus();
    };

    const handleCanPlay = () => {
      scheduleHideBuffering();
      calculateBufferStatus();
    };

    const handleCanPlayThrough = () => {
      scheduleHideBuffering();
      calculateBufferStatus();
    };

    const handleProgress = () => {
      calculateBufferStatus();
    };

    const handlePlaying = () => {
      scheduleHideBuffering();
      calculateBufferStatus();
    };

    const handleStalled = () => {
      scheduleShowBuffering();
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
      if (showTimeout) clearTimeout(showTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  // Poll for torrent stats when buffering
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if ((isBuffering || isTranscoded) && infoHash) {
      const fetchStats = async () => {
        try {
          const stats = await getTorrent(infoHash);
          setTorrentStats(stats);
        } catch (err) {
          console.warn('Failed to fetch torrent stats', err);
        }
      };

      fetchStats(); // Initial fetch
      pollInterval = setInterval(fetchStats, 1000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isBuffering, isTranscoded, infoHash]);

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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <Typography variant="h6" noWrap>
              {title}
            </Typography>
            {magnetURI && (
              <Tooltip title="Copy magnet link">
                <IconButton
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(magnetURI);
                  }}
                >
                  <LinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      )}

      <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: 'black' }}>
        <BufferOverlay
          show={isBuffering}
          bufferPercent={bufferPercent}
          downloadSpeed={torrentStats?.downloadSpeed}
          progress={torrentStats?.progress ? torrentStats.progress * 100 : 0}
          numPeers={torrentStats?.numPeers}
        />
        <video
          ref={videoRef}
          src={isMSEMode ? undefined : effectiveSrc}
          controls
          autoPlay={!isMSEMode}
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
          onDurationChange={(e) => {
            const dur = e.currentTarget.duration;
            // If backend duration failed (0) but native player found a duration, use it!
            if (videoDuration === 0 && dur && isFinite(dur)) {
              setVideoDuration(dur);
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

      {/* Fix Audio Button and Info Message - ABOVE subtitles */}
      {infoHash && typeof fileIndex === 'number' && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {!isTranscoded && (
            <>
              {audioTracks.length > 1 && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Audio Track</InputLabel>
                  <Select
                    value={selectedAudioTrack}
                    label="Audio Track"
                    onChange={(e) => setSelectedAudioTrack(Number(e.target.value))}
                    disabled={loadingAudioTracks}
                  >
                    {audioTracks.map((track) => (
                      <MenuItem key={track.index} value={track.index}>
                        {track.language || 'Unknown'} ({track.channels}ch)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Tooltip title="Fix audio with full seeking support">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<VolumeUpIcon />}
                  onClick={handleFixAudio}
                >
                  Fix Audio
                </Button>
              </Tooltip>
            </>
          )}
          {isTranscoded && (
            <>
              {mseError ? (
                <Alert severity="error" sx={{ py: 0.5 }}>
                  {mseError}
                </Alert>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  📺 MSE Mode: Seeking enabled via native controls
                </Typography>
              )}

              <Button
                variant="outlined"
                size="small"
                color="secondary"
                startIcon={<UndoIcon />}
                onClick={handleUseOriginal}
              >
                Use Original
              </Button>
            </>
          )}
        </Box>
      )}

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
