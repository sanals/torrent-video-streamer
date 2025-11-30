import axios from 'axios';
import https from 'https';

// Try multiple YTS API mirrors
const YTS_API_MIRRORS = [
    'https://yts.mx/api/v2',
    'https://yts.torrentbay.to/api/v2',
    'https://yts.ag/api/v2',
];

// Create axios instance with relaxed SSL and better connection handling
const createApiClient = () => {
    return axios.create({
        httpsAgent: new https.Agent({
            rejectUnauthorized: false,
            keepAlive: true,
            keepAliveMsecs: 1000,
            maxSockets: 5,
        }),
        timeout: 20000, // 20 second timeout
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
        },
    });
};

class TorrentSearchService {
    constructor() {
        this.lastRequest = 0;
        this.requestDelay = 1000;
    }

    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;

        if (timeSinceLastRequest < this.requestDelay) {
            const waitTime = this.requestDelay - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequest = Date.now();
    }

    async searchTorrents(query, options = {}, retryCount = 0) {
        const maxRetries = 2;
        // YTS API supports up to 50 movies per request, but we can make multiple requests for more results
        const moviesPerRequest = 50;
        const maxMovies = Math.min(options.limit || 50, 200); // Allow up to 200 movies (4 pages)
        const params = {
            query_term: query,
            limit: moviesPerRequest,
            sort_by: options.sort || 'seeds',
            order_by: 'desc',
        };

        // Try each API mirror
        for (const apiBase of YTS_API_MIRRORS) {
            try {
                await this.waitForRateLimit();

                console.log(`🔍 Searching YTS for: "${query}" (mirror: ${apiBase})`);

                const apiClient = createApiClient();
                const url = `${apiBase}/list_movies.json`;

                console.log(`📡 Requesting: ${url}`);

                // Fetch multiple pages if needed
                let allMovies = [];
                let page = 1;
                let hasMore = true;

                while (hasMore && allMovies.length < maxMovies) {
                    const pageParams = { ...params, page };
                    const response = await apiClient.get(url, { params: pageParams });

                    console.log(`✅ Got response with status: ${response.status} (page ${page})`);

                    if (response.data.status !== 'ok') {
                        if (page === 1) {
                            throw new Error('API returned error status');
                        }
                        // If later pages fail, just use what we have
                        break;
                    }

                    const movies = response.data.data.movies || [];
                    const movieCount = response.data.data.movie_count || 0;

                    if (movies.length === 0) {
                        hasMore = false;
                        break;
                    }

                    allMovies = allMovies.concat(movies);

                    // Check if there are more pages
                    if (allMovies.length >= movieCount || movies.length < moviesPerRequest) {
                        hasMore = false;
                    } else {
                        page++;
                        await this.waitForRateLimit(); // Rate limit between pages
                    }
                }

                if (allMovies.length === 0) {
                    console.log('ℹ️  No results found');
                    return [];
                }

                const results = [];
                allMovies.forEach(movie => {
                    if (movie.torrents && movie.torrents.length > 0) {
                        movie.torrents.forEach(torrent => {
                            results.push({
                                name: `${movie.title} (${movie.year}) [${torrent.quality}]`,
                                magnetURI: this.buildMagnetLink(torrent.hash, movie.title),
                                size: torrent.size_bytes || 0,
                                seeders: torrent.seeds || 0,
                                leechers: torrent.peers || 0,
                                category: 'Movies',
                                uploadDate: movie.date_uploaded || new Date().toISOString(),
                                quality: torrent.quality,
                                rating: movie.rating,
                                source: 'YTS', // Add source information
                                infoPage: movie.url || null,
                            });
                        });
                    }
                });

                console.log(`✅ Found ${results.length} torrents from ${allMovies.length} movies (${page} page(s))`);
                return results;

            } catch (error) {
                console.error(`❌ Mirror ${apiBase} failed:`, {
                    message: error.message,
                    code: error.code,
                    response: error.response?.status,
                });

                // If this is ECONNRESET and we haven't tried all mirrors, continue to next
                if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
                    console.log(`⚠️  Connection reset/refused, trying next mirror...`);
                    continue; // Try next mirror
                }

                // If this is the last mirror, throw the error
                if (apiBase === YTS_API_MIRRORS[YTS_API_MIRRORS.length - 1]) {
                    // Retry logic for transient errors
                    if (retryCount < maxRetries && (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED')) {
                        console.log(`🔄 Retrying... (${retryCount + 1}/${maxRetries})`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
                        return this.searchTorrents(query, options, retryCount + 1);
                    }

                    // Provide user-friendly error messages
                    if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
                        throw new Error('Network connection failed. This is usually caused by firewall/antivirus blocking Node.js. Check TROUBLESHOOTING.md for solutions.');
                    }
                    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                        throw new Error('Request timed out. The API may be slow or temporarily unavailable.');
                    }
                    throw new Error(`Failed to search: ${error.message}`);
                }
            }
        }

        // If we get here, all mirrors failed
        throw new Error('All API mirrors failed. The YTS API may be temporarily unavailable or blocked by your network.');
    }

    buildMagnetLink(hash, name) {
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
}

export default new TorrentSearchService();
