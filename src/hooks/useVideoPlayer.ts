import { useRef, useState, useCallback } from 'react';

/**
 * Custom hook for video player controls and state.
 */
export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Play video
  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((e) => setError(e.message));
    }
  }, []);

  // Pause video
  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Seek to time
  const seek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  }, []);

  // Attach event listeners
  const onTimeUpdate = useCallback(() => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
  }, []);
  const onDurationChange = useCallback(() => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  }, []);
  const onBuffering = useCallback(() => setIsBuffering(true), []);
  const onPlaying = useCallback(() => setIsBuffering(false), []);
  const onError = useCallback((e: any) => setError(e?.message || 'Playback error'), []);

  return {
    videoRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    isBuffering,
    error,
    play,
    pause,
    seek,
    onTimeUpdate,
    onDurationChange,
    onBuffering,
    onPlaying,
    onError,
  };
} 