// Core torrent service for Torrent Video Streamer
import WebTorrent from 'webtorrent';
import type { Torrent } from 'webtorrent';
import type { TorrentData, VideoFile } from '@/types/torrent';
import { isVideoFile } from '@/utils/fileUtils';
import { getMimeTypeFromExtension } from '@/utils/fileUtils';

/**
 * Singleton TorrentService for managing torrents and streaming video files.
 */
class TorrentService {
  private static instance: TorrentService;
  private client: WebTorrent.Instance;
  private torrents: Map<string, Torrent>;

  private constructor() {
    this.client = new WebTorrent();
    this.torrents = new Map();
  }

  /**
   * Get the singleton instance of TorrentService.
   */
  public static getInstance(): TorrentService {
    if (!TorrentService.instance) {
      TorrentService.instance = new TorrentService();
    }
    return TorrentService.instance;
  }

  /**
   * Add a torrent by magnet URI or .torrent file URL.
   * @param source Magnet URI or .torrent file URL
   * @param onProgress Optional callback for progress updates
   */
  public addTorrent(
    source: string,
    onProgress?: (data: TorrentData) => void
  ): Promise<TorrentData> {
    return new Promise((resolve, reject) => {
      if (this.torrents.has(source)) {
        // Already added
        const torrent = this.torrents.get(source)!;
        resolve(this.toTorrentData(torrent));
        return;
      }

      try {
        const torrent = this.client.add(source, {
          // Optional: Add specific options here if needed
        });

        // Store immediately
        this.torrents.set(source, torrent);

        // Set up listeners
        if (onProgress) {
          torrent.on('download', () => onProgress(this.toTorrentData(torrent)));
          torrent.on('upload', () => onProgress(this.toTorrentData(torrent)));
          torrent.on('done', () => onProgress(this.toTorrentData(torrent)));
        }

        // Handle errors
        torrent.on('error', (err) => {
          this.torrents.delete(source);
          const errorMsg = typeof err === 'string' ? err : err?.message || 'Unknown error';
          console.error(`Torrent error for ${source}:`, errorMsg);
        });

        // Resolve immediately with initial data
        resolve(this.toTorrentData(torrent));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Get all video files from a torrent.
   * @param source Magnet URI or .torrent file URL
   */
  public getVideoFiles(source: string): VideoFile[] {
    const torrent = this.torrents.get(source);
    if (!torrent) return [];
    return torrent.files
      .filter((file) => isVideoFile(file.name))
      .map((file) => {
        const ext = file.name.split('.').pop() || '';
        let getBlobURL: (() => string) | undefined = undefined;
        if (typeof file.getBlobURL === 'function') {
          getBlobURL = () => {
            let blobUrl: string | undefined;
            let error: string | Error | undefined;
            file.getBlobURL((err: string | Error | undefined, url?: string) => {
              if (err) error = err;
              else blobUrl = url;
            });
            if (error) throw typeof error === 'string' ? new Error(error) : error;
            if (typeof blobUrl === 'string') return blobUrl;
            throw new Error('getBlobURL did not return a string');
          };
        }
        return {
          name: file.name,
          path: file.path,
          length: file.length,
          type: getMimeTypeFromExtension(ext),
          getBlobURL,
          extension: ext,
        };
      });
  }

  /**
   * Stream a video file from a torrent as a Blob URL.
   * @param source Magnet URI or .torrent file URL
   * @param fileName Name of the video file to stream
   */
  public async streamFile(source: string, fileName: string): Promise<string> {
    const torrent = this.torrents.get(source);
    if (!torrent) throw new Error('Torrent not found');
    const file = torrent.files.find((f) => f.name === fileName);
    if (!file) throw new Error('File not found in torrent');
    return new Promise((resolve, reject) => {
      if (typeof file.getBlobURL === 'function') {
        file.getBlobURL((err: string | Error | undefined, url?: string) => {
          if (err || !url) {
            reject(new Error('Failed to create Blob URL for video file'));
          } else {
            resolve(url);
          }
        });
      } else {
        reject(new Error('getBlobURL is not available for this file'));
      }
    });
  }

  /**
   * Remove a torrent and clean up resources.
   * @param source Magnet URI or .torrent file URL
   */
  public removeTorrent(source: string): Promise<void> {
    return new Promise((resolve) => {
      const torrent = this.torrents.get(source);
      if (!torrent) {
        resolve();
        return;
      }
      torrent.destroy();
      this.torrents.delete(source);
      resolve();
    });
  }

  /**
   * Get stats and progress for a torrent.
   * @param source Magnet URI or .torrent file URL
   */
  public getTorrentStats(source: string): TorrentData | undefined {
    const torrent = this.torrents.get(source);
    return torrent ? this.toTorrentData(torrent) : undefined;
  }

  /**
   * Convert a WebTorrent Torrent to TorrentData.
   */
  private toTorrentData(torrent: Torrent): TorrentData {
    return {
      infoHash: torrent.infoHash,
      name: torrent.name,
      files: torrent.files.map((file) => {
        const ext = file.name.split('.').pop() || '';
        let getBlobURL: (() => string) | undefined = undefined;
        if (typeof file.getBlobURL === 'function') {
          getBlobURL = () => {
            let blobUrl: string | undefined;
            let error: string | Error | undefined;
            file.getBlobURL((err: string | Error | undefined, url?: string) => {
              if (err) error = err;
              else blobUrl = url;
            });
            if (error) throw typeof error === 'string' ? new Error(error) : error;
            if (typeof blobUrl === 'string') return blobUrl;
            throw new Error('getBlobURL did not return a string');
          };
        }
        return {
          name: file.name,
          path: file.path,
          length: file.length,
          type: getMimeTypeFromExtension(ext),
          getBlobURL,
          extension: ext,
        };
      }),
      progress: torrent.progress,
      downloaded: torrent.downloaded,
      length: torrent.length,
      magnetURI: torrent.magnetURI,
      downloadSpeed: torrent.downloadSpeed,
      uploadSpeed: torrent.uploadSpeed,
      numPeers: torrent.numPeers,
    };
  }

  /**
   * Clean up all torrents and WebTorrent client (for app shutdown).
   */
  public destroy(): void {
    this.client.destroy();
    this.torrents.clear();
  }
}

export const torrentService = TorrentService.getInstance();
export default torrentService;