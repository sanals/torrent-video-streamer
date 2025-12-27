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
    source?: string;
}

/**
 * Search torrents directly from browser
 */
/**
 * List of CORS proxy services to try (in order)
 * Note: Some proxies may require activation or have rate limits
 */
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://corsproxy.io/?',
    'https://thingproxy.freeboard.io/fetch/',
];

/**
 * Try fetching with multiple proxy fallbacks
 */
async function fetchWithProxies(targetUrl: string): Promise<Response> {
    // First, try direct fetch with timeout
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const directResponse = await fetch(targetUrl, {
            method: 'GET',
            mode: 'cors',
            signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (directResponse.ok) {
            return directResponse;
        }
    } catch (directError) {
        const err = directError as Error;
        if (err.name === 'AbortError') {
            console.log('Direct fetch timed out, trying proxies...');
        } else {
            console.log('Direct fetch failed, trying proxies...');
        }
    }

    // Try each proxy in order with timeout
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = proxy + encodeURIComponent(targetUrl);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout per proxy

            const response = await fetch(proxyUrl, {
                method: 'GET',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                return response;
            }

            // If we get a 403, 400, or block, try next proxy
            if (response.status === 403 || response.status === 400 || response.status === 429) {
                console.log(`Proxy ${proxy} returned ${response.status}, trying next...`);
                continue;
            }
        } catch (proxyError) {
            const err = proxyError as Error;
            if (err.name === 'AbortError') {
                console.log(`Proxy ${proxy} timed out, trying next...`);
            } else {
                console.log(`Proxy ${proxy} failed, trying next...`);
            }
            continue;
        }
    }

    throw new Error('Browser search failed: All proxies are blocked or unavailable. Please use the "Backend API" search mode instead (toggle above the search box).');
}

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

        const targetUrl = `${YTS_API_BASE}/list_movies.json?${params}`;

        // Try fetching with proxy fallbacks
        const response = await fetchWithProxies(targetUrl);

        // Check if response is HTML (Cloudflare block page or error page)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
            const text = await response.text();
            if (text.includes('Cloudflare') || text.includes('challenge-platform') || text.includes('Attention Required')) {
                throw new Error('Request blocked by Cloudflare. The search API is currently unavailable. Please try the backend search option or try again later.');
            }
            // If we get HTML but it's not Cloudflare, it might be an error page
            if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
                throw new Error('Received HTML response instead of JSON. The API may be temporarily unavailable.');
            }
        }

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
                        source: 'YTS',
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
