import axios from 'axios';
import https from 'https';

// Use working mirror
const YTS_API_BASE = 'https://yts.torrentbay.to/api/v2';

// Create axios instance with relaxed SSL
const apiClient = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false, // Allow self-signed certificates
    }),
    timeout: 30000, // 30 second timeout
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
});

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

    async searchTorrents(query, options = {}) {
        try {
            await this.waitForRateLimit();

            console.log(`🔍 Searching YTS for: "${query}"`);

            const params = {
                query_term: query,
                limit: Math.min(options.limit || 20, 50),
                sort_by: options.sort || 'seeds',
                order_by: 'desc',
            };

            console.log(`📡 Requesting: ${YTS_API_BASE}/list_movies.json`);

            const response = await apiClient.get(`${YTS_API_BASE}/list_movies.json`, {
                params,
            });

            console.log(`✅ Got response with status: ${response.status}`);

            if (response.data.status !== 'ok') {
                throw new Error('API returned error status');
            }

            const movies = response.data.data.movies || [];

            if (movies.length === 0) {
                console.log('ℹ️  No results found');
                return [];
            }

            const results = [];
            movies.forEach(movie => {
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
                        });
                    });
                }
            });

            console.log(`✅ Found ${results.length} torrents from ${movies.length} movies`);
            return results;

        } catch (error) {
            console.error('❌ Search error details:', {
                message: error.message,
                code: error.code,
                response: error.response?.status,
            });

            if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
                throw new Error('Search request timed out. The API may be slow or blocked.');
            }

            throw new Error(`Failed to search: ${error.message}`);
        }
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
