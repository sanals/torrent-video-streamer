import torrentSearchService from '../services/torrentSearchService.js';
import leetXSearchService from '../services/leetxSearchService.js';
import alternativeSearchService from '../services/alternativeSearchService.js';

/**
 * Search torrents
 */
export async function searchTorrents(req, res, next) {
    try {
        const { q, category, limit, sort, source } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required',
            });
        }

        // Validate query length
        if (q.length > 200) {
            return res.status(400).json({
                success: false,
                error: 'Search query is too long (max 200 characters)',
            });
        }

        const options = {
            category,
            limit: limit ? Math.min(parseInt(limit), 200) : 200, // Allow up to 200 results
            sort: sort || 'seeders',
        };

        let results = [];
        const searchSource = source || 'yts'; // Default to YTS

        if (searchSource === '1337x') {
            results = await leetXSearchService.searchTorrents(q, options);
        } else if (searchSource === 'alternative') {
            // Try multiple providers to avoid Cloudflare
            results = await alternativeSearchService.searchTorrents(q, options);
        } else {
            // Default to YTS
            results = await torrentSearchService.searchTorrents(q, options);
        }

        res.json({
            success: true,
            query: q,
            source: searchSource,
            results,
            count: results.length,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get available categories
 */
export async function getCategories(req, res) {
    res.json({
        success: true,
        categories: [
            { id: 'movies', name: 'Movies', value: 14 },
            { id: 'tv', name: 'TV Shows', value: 18 },
            { id: 'music', name: 'Music', value: 23 },
            { id: 'games', name: 'Games', value: 27 },
            { id: 'software', name: 'Software', value: 33 },
            { id: 'ebook', name: 'eBooks', value: 35 },
        ],
    });
}
