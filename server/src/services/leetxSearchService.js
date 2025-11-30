import TorrentSearchApi from 'torrent-search-api';

// Available providers in torrent-search-api (some may also have Cloudflare)
const AVAILABLE_PROVIDERS = [
    '1337x',        // Has Cloudflare protection
    'ThePirateBay', // May have Cloudflare
    'RARBG',        // Usually works
    'Torrent9',     // Alternative
    'YggTorrent',   // Alternative
    'Torrentz2',    // Alternative
];

class LeetXSearchService {
    constructor() {
        this.providers = ['1337x'];
        this.lastRequest = 0;
        this.requestDelay = 1000;
        
        // Try to enable 1337x provider
        try {
            TorrentSearchApi.enableProvider('1337x');
            console.log('✅ 1337x search provider enabled');
        } catch (error) {
            console.error('❌ Failed to enable 1337x provider:', error.message);
        }
    }

    /**
     * Get list of available providers
     */
    getAvailableProviders() {
        return AVAILABLE_PROVIDERS;
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

    /**
     * Map 1337x categories to our internal categories
     */
    mapCategory(category) {
        const categoryMap = {
            'movies': 'Movies',
            'tv': 'TV',
            'music': 'Music',
            'games': 'Games',
            'software': 'Applications',
            'ebook': 'Books',
        };
        return categoryMap[category] || 'All';
    }

    /**
     * Search 1337x for torrents
     */
    async searchTorrents(query, options = {}) {
        try {
            await this.waitForRateLimit();

            console.log(`🔍 Searching 1337x for: "${query}"`);

            const category = options.category ? this.mapCategory(options.category) : 'All';
            const limit = Math.min(options.limit || 50, 100); // 1337x can return more results

            // Disable all providers first, then enable only 1337x
            TorrentSearchApi.disableAllProviders();
            TorrentSearchApi.enableProvider('1337x');

            let results;
            try {
                results = await TorrentSearchApi.search(query, category, limit);
            } catch (searchError) {
                // Log full error for debugging
                console.error('🔍 1337x search error details:', {
                    message: searchError.message,
                    status: searchError.status,
                    code: searchError.code,
                    response: searchError.response?.data ? 
                        (typeof searchError.response.data === 'string' ? 
                            searchError.response.data.substring(0, 500) : 
                            JSON.stringify(searchError.response.data).substring(0, 500)) : 
                        'No response data',
                });

                // Check if it's a Cloudflare block
                const errorStr = JSON.stringify(searchError).toLowerCase();
                const responseStr = searchError.response?.data ? 
                    (typeof searchError.response.data === 'string' ? 
                        searchError.response.data.toLowerCase() : 
                        JSON.stringify(searchError.response.data).toLowerCase()) : '';
                
                const isCloudflare = errorStr.includes('cloudflare') || 
                    errorStr.includes('just a moment') ||
                    errorStr.includes('challenge-platform') ||
                    responseStr.includes('cloudflare') ||
                    responseStr.includes('just a moment') ||
                    responseStr.includes('challenge-platform') ||
                    searchError.message?.includes('403') ||
                    searchError.status === 403;

                if (isCloudflare) {
                    console.log('⚠️  Confirmed: Cloudflare protection detected');
                    throw new Error('1337x is currently blocked by Cloudflare protection. Please try again in a few minutes or use YTS for movies.');
                }
                throw searchError;
            }

            if (!results || results.length === 0) {
                console.log('ℹ️  No results found on 1337x');
                return [];
            }

            // Transform results to match our format
            const transformedResults = results.map(torrent => {
                // Get magnet link - might need to fetch it separately
                let magnetURI = torrent.magnet || torrent.magnetLink || '';
                
                // If no magnet, try to get it from the torrent object
                if (!magnetURI && torrent.provider === '1337x') {
                    // The API might return it in different formats
                    magnetURI = torrent.magnet || '';
                }

                return {
                    name: torrent.title || torrent.name || 'Unknown',
                    magnetURI: magnetURI,
                    size: this.parseSize(torrent.size) || 0,
                    seeders: parseInt(torrent.seeds || torrent.seeder || 0),
                    leechers: parseInt(torrent.peers || torrent.leech || 0),
                    category: this.detectCategory(torrent.title || torrent.name),
                    uploadDate: torrent.time || torrent.date || new Date().toISOString(),
                    source: '1337x',
                    infoPage: torrent.desc || torrent.url || null,
                };
            }).filter(result => result.magnetURI); // Only return results with magnet links

            console.log(`✅ Found ${transformedResults.length} torrents from 1337x`);
            return transformedResults;

        } catch (error) {
            console.error('❌ 1337x search error:', {
                message: error.message,
                code: error.code,
                status: error.status,
                stack: error.stack,
            });

            // Check for Cloudflare block
            const errorMessage = error.message || '';
            const errorString = JSON.stringify(error).toLowerCase();
            
            if (errorMessage.includes('403') || 
                errorMessage.includes('cloudflare') || 
                errorMessage.includes('Just a moment') ||
                errorString.includes('cloudflare') ||
                errorString.includes('challenge-platform')) {
                throw new Error('1337x is currently blocked by Cloudflare protection. This is a temporary issue. Please try again later or use YTS for movies.');
            }

            if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
                throw new Error('1337x search timed out. Please try again.');
            }

            if (error.status === 403 || errorMessage.includes('403')) {
                throw new Error('1337x access denied. The site may be blocking automated requests. Please try again later.');
            }

            throw new Error(`1337x search failed: ${error.message}`);
        }
    }

    /**
     * Parse size string (e.g., "1.5 GB") to bytes
     */
    parseSize(sizeString) {
        if (!sizeString || typeof sizeString !== 'string') return 0;

        const units = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024,
            'TB': 1024 * 1024 * 1024 * 1024,
        };

        const match = sizeString.match(/^([\d.]+)\s*([KMGT]?B)$/i);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = match[2].toUpperCase();
        return Math.floor(value * (units[unit] || 1));
    }

    /**
     * Detect category from title
     */
    detectCategory(title) {
        if (!title) return 'Other';
        const lower = title.toLowerCase();
        
        if (lower.includes('season') || lower.includes('s0') || lower.includes('episode') || lower.includes('e0')) {
            return 'TV Shows';
        }
        if (lower.match(/\b(1080p|720p|480p|4k|bluray|dvdrip|webrip|web-dl)\b/)) {
            return 'Movies';
        }
        if (lower.match(/\b(mp3|flac|album|single)\b/)) {
            return 'Music';
        }
        if (lower.match(/\b(game|iso|repack|crack)\b/)) {
            return 'Games';
        }
        if (lower.match(/\b(software|app|program)\b/)) {
            return 'Software';
        }
        
        return 'Other';
    }
}

export default new LeetXSearchService();

