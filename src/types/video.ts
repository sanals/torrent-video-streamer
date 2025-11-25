// Video player types for the Torrent Video Streamer app

/**
 * Props for the VideoPlayer component.
 */
export interface VideoPlayerProps {
  /** Video file URL or Blob URL */
  src: string;
  /** Video file name (for display) */
  fileName: string;
  /** Optional poster image URL */
  poster?: string;
  /** Optional: Called when playback starts */
  onPlay?: () => void;
  /** Optional: Called when playback is paused */
  onPause?: () => void;
  /** Optional: Called when playback ends */
  onEnded?: () => void;
  /** Optional: Called on error */
  onError?: (error: Error) => void;
}

/**
 * State for the VideoPlayer component.
 */
export interface VideoPlayerState {
  /** Is the video currently playing? */
  isPlaying: boolean;
  /** Current playback time (seconds) */
  currentTime: number;
  /** Video duration (seconds) */
  duration: number;
  /** Is the video buffering? */
  isBuffering: boolean;
  /** Error message, if any */
  error?: string;
} 