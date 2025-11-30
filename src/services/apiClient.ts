/**
 * API Client for Backend Communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface FileData {
    name: string;
    path: string;
    length: number;
    index: number;
}

export interface TorrentData {
    infoHash: string;
    name: string;
    magnetURI: string;
    paused: boolean;
    progress: number;
    downloadSpeed: number;
    uploadSpeed: number;
    downloaded: number;
    uploaded: number;
    length: number;
    numPeers: number;
    files: FileData[];
}

export interface AddTorrentResponse {
    success: boolean;
    torrent: TorrentData;
}

export interface GetTorrentsResponse {
    success: boolean;
    torrents: TorrentData[];
    count: number;
}

/**
 * Add a new torrent
 */
export async function addTorrent(magnetURI: string): Promise<TorrentData> {
    const response = await fetch(`${API_BASE_URL}/torrents`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ magnetURI }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add torrent');
    }

    const data: AddTorrentResponse = await response.json();
    return data.torrent;
}

/**
 * Get all torrents
 */
export async function getTorrents(): Promise<TorrentData[]> {
    const response = await fetch(`${API_BASE_URL}/torrents`);

    if (!response.ok) {
        throw new Error('Failed to fetch torrents');
    }

    const data: GetTorrentsResponse = await response.json();
    return data.torrents;
}

/**
 * Get specific torrent by infoHash
 */
export async function getTorrent(infoHash: string): Promise<TorrentData> {
    const response = await fetch(`${API_BASE_URL}/torrents/${infoHash}`);

    if (!response.ok) {
        throw new Error('Failed to fetch torrent');
    }

    const data = await response.json();
    return data.torrent;
}

/**
 * Remove a torrent
 */
export async function removeTorrent(infoHash: string, deleteData: boolean = false): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/torrents/${infoHash}?deleteData=${deleteData}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to remove torrent');
    }
}

/**
 * Pause a torrent
 */
export async function pauseTorrent(infoHash: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/torrents/${infoHash}/pause`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to pause torrent');
    }
}

/**
 * Resume a torrent
 */
export async function resumeTorrent(infoHash: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/torrents/${infoHash}/resume`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error('Failed to resume torrent');
    }
}

/**
 * Get stream URL for a file
 */
export function getStreamUrl(infoHash: string, fileIndex: number): string {
    return `${API_BASE_URL.replace('/api', '')}/api/stream/${infoHash}/${fileIndex}`;
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
}
