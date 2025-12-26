// Torrent-related types for the Torrent Video Streamer app

/**
 * Represents a file within a torrent.
 * Mirrors WebTorrent's TorrentFile type, but strictly typed for video streaming context.
 */
export interface TorrentFile {
  /** File name (e.g., movie.mp4) */
  name: string;
  /** File path within the torrent */
  path: string;
  /** File length in bytes */
  length: number;
  /** File MIME type (e.g., video/mp4) */
  type: string;
  /** Returns a Blob URL for the file (if available) */
  getBlobURL?: () => string;
}

/**
 * Represents the main torrent data structure managed by WebTorrent.
 */
export interface TorrentData {
  /** Torrent info hash */
  infoHash: string;
  /** Torrent name */
  name: string;
  /** List of files in the torrent */
  files: TorrentFile[];
  /** Download progress (0-1) */
  progress: number;
  /** Downloaded bytes */
  downloaded: number;
  /** Total bytes */
  length: number;
  /** Magnet URI */
  magnetURI: string;
  /** Torrent download/upload speed in bytes/sec */
  downloadSpeed: number;
  uploadSpeed: number;
  /** Peers connected */
  numPeers: number;
  /** Error message, if any */
  error?: string;
}

/**
 * Represents a video file within a torrent (filtered from TorrentFile).
 */
export interface VideoFile extends TorrentFile {
  /** Video file extension (e.g., mp4, mkv) */
  extension: string;
}