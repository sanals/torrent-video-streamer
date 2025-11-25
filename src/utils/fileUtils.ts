// File utility functions for Torrent Video Streamer
import { VIDEO_EXTENSIONS } from './constants';

/**
 * Checks if a file name has a supported video extension.
 * @param fileName File name to check
 */
export function isVideoFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return !!ext && VIDEO_EXTENSIONS.includes(ext);
}

/**
 * Formats a file size in bytes to a human-readable string.
 * @param bytes File size in bytes
 */
export function formatFileSize(bytes: number): string {
  if (isNaN(bytes) || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

/**
 * Returns the MIME type for a given file extension.
 * @param ext File extension (without dot)
 */
export function getMimeTypeFromExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case 'mp4': return 'video/mp4';
    case 'mkv': return 'video/x-matroska';
    case 'webm': return 'video/webm';
    case 'avi': return 'video/x-msvideo';
    case 'mov': return 'video/quicktime';
    case 'flv': return 'video/x-flv';
    case 'wmv': return 'video/x-ms-wmv';
    case 'mpeg':
    case 'mpg': return 'video/mpeg';
    case 'm4v': return 'video/x-m4v';
    case '3gp': return 'video/3gpp';
    case 'ts': return 'video/mp2t';
    default: return 'application/octet-stream';
  }
} 