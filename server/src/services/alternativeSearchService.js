import TorrentSearchApi from 'torrent-search-api';

/**
 * Alternative search service that tries multiple providers
 * to avoid Cloudflare blocks
 */
class AlternativeSearchService {
    constructor() {
        this.lastRequest = 0;
        this.requestDelay = 1000;
        
        // Providers to try in order (ones less likely to have Cloudflare first)
        this.providerPriority = [
            'RARBG',        // Usually reliable, no Cloudflare
            'ThePirateBay', // May work
            'Torrent9',     // Alternative
            '1337x',        // Has Cloudflare but try as fallback
        ];
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

    /**
     * Search using alternative providers (tries multiple to avoid Cloudflare)
     */
    async searchTorrents(query, options = {}) {
        const category = options.category ? this.mapCategory(options.category) : 'All';
        const limit = Math.min(options.limit || 50, 100);

        // Try each provider in priority order
        for (const provider of this.providerPriority) {
            try {
                await this.waitForRateLimit();

                console.log(`🔍 Trying ${provider} for: "${query}"`);

                // Disable all, enable only this provider
                TorrentSearchApi.disableAllProviders();
                TorrentSearchApi.enableProvider(provider);

                const results = await TorrentSearchApi.search(query, category, limit);

                if (!results || results.length === 0) {
                    console.log(`ℹ️  No results from ${provider}, trying next...`);
                    continue;
                }

                // Transform results
                const transformedResults = results.map(torrent => {
                    let magnetURI = torrent.magnet || torrent.magnetLink || '';
                    
                    return {
                        name: torrent.title || torrent.name || 'Unknown',
                        magnetURI: magnetURI,
                        size: this.parseSize(torrent.size) || 0,
                        seeders: parseInt(torrent.seeds || torrent.seeder || 0),
                        leechers: parseInt(torrent.peers || torrent.leech || 0),
                        category: this.detectCategory(torrent.title || torrent.name),
                        uploadDate: torrent.time || torrent.date || new Date().toISOString(),
                        source: provider,
                        infoPage: torrent.desc || torrent.url || null,
                    };
                }).filter(result => result.magnetURI);

                console.log(`✅ Found ${transformedResults.length} torrents from ${provider}`);
                return transformedResults;

            } catch (error) {
                const errorStr = JSON.stringify(error).toLowerCase();
                const isCloudflare = errorStr.includes('cloudflare') || 
                    errorStr.includes('just a moment') ||
                    errorStr.includes('challenge-platform') ||
                    error.status === 403;

                if (isCloudflare) {
                    console.log(`⚠️  ${provider} blocked by Cloudflare, trying next provider...`);
                    continue;
                }

                console.log(`⚠️  ${provider} failed: ${error.message}, trying next...`);
                continue;
            }
        }

        // If all providers failed
        throw new Error('All alternative search providers failed. This may be due to Cloudflare protection or network issues.');
    }
}

export default new AlternativeSearchService();

