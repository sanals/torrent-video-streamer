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

/**
 * Checks if a file is a subtitle file
 * @param fileName File name to check
 */
export function isSubtitleFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return !!ext && ['srt', 'vtt', 'ass', 'ssa', 'sub'].includes(ext);
}

/**
 * Categorizes files into Videos, Subtitles, and Other
 */
export type FileCategory = 'video' | 'subtitle' | 'other';

export interface CategorizedFile {
  file: { name: string; length: number; index: number; path: string };
  category: FileCategory;
}

export function categorizeFiles(files: Array<{ name: string; length: number; index: number; path: string }>): {
  videos: CategorizedFile[];
  subtitles: CategorizedFile[];
  other: CategorizedFile[];
} {
  const videos: CategorizedFile[] = [];
  const subtitles: CategorizedFile[] = [];
  const other: CategorizedFile[] = [];

  files.forEach((file) => {
    if (isVideoFile(file.name)) {
      videos.push({ file, category: 'video' });
    } else if (isSubtitleFile(file.name)) {
      subtitles.push({ file, category: 'subtitle' });
    } else {
      other.push({ file, category: 'other' });
    }
  });

  return { videos, subtitles, other };
} 