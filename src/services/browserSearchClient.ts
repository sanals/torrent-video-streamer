/**
 * Browser-Based YTS Search Client
 * Makes requests directly from browser to bypass API blocks
 */

const YTS_API_BASE = 'https://yts.mx/api/v2';

export interface BrowserSearchResult {
    name: string;
    magnetURI: string;
    size: number;
    seeders: number;
    leechers: number;
    category: string;
    uploadDate: string;
    quality?: string;
    rating?: number;
}

/**
 * Search torrents directly from browser
 */
export async function searchTorrentsBrowser(
    query: string,
    options?: {
        limit?: number;
        sort?: string;
    }
): Promise<BrowserSearchResult[]> {
    try {
        const params = new URLSearchParams({
            query_term: query,
            limit: (options?.limit || 20).toString(),
            sort_by: options?.sort || 'seeds',
            order_by: 'desc',
        });

        // Use corsproxy.io as it handles some Cloudflare challenges better
        const targetUrl = `${YTS_API_BASE}/list_movies.json?${params}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl, {
            method: 'GET',
            // Remove custom headers that might trigger preflight checks or be blocked by proxy
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error('API returned error status');
        }

        const movies = data.data.movies || [];

        if (movies.length === 0) {
            return [];
        }

        // Flatten torrents from all movies
        const results: BrowserSearchResult[] = [];
        movies.forEach((movie: any) => {
            if (movie.torrents && movie.torrents.length > 0) {
                movie.torrents.forEach((torrent: any) => {
                    results.push({
                        name: `${movie.title} (${movie.year}) [${torrent.quality}]`,
                        magnetURI: buildMagnetLink(torrent.hash, movie.title),
                        size: torrent.size_bytes || 0,
                        seeders: torrent.seeds || 0,
                        leechers: torrent.peers || 0,
                        category: 'Movies',
                        uploadDate: movie.date_uploaded || new Date().toISOString(),
                        quality: torrent.quality,
                        rating: movie.rating,
                    });
                });
            }
        });

        return results;
    } catch (error) {
        console.error('Browser search error:', error);
        throw new Error(error instanceof Error ? error.message : 'Browser search failed');
    }
}

/**
 * Build magnet link from hash
 */
function buildMagnetLink(hash: string, name: string): string {
    const trackers = [
        'udp://open.demonii.com:1337/announce',
        'udp://tracker.openbittorrent.com:80',
        'udp://tracker.coppersurfer.tk:6969',
        'udp://glotorrents.pw:6969/announce',
        'udp://tracker.opentrackr.org:1337/announce',
    ];

    const trackerParams = trackers.map(t => `tr=${encodeURIComponent(t)}`).join('&');
    return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(name)}&${trackerParams}`;
}
