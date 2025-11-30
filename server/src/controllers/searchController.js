import torrentSearchService from '../services/torrentSearchService.js';

/**
 * Search torrents
 */
export async function searchTorrents(req, res, next) {
    try {
        const { q, category, limit, sort } = req.query;

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

        const results = await torrentSearchService.searchTorrents(q, options);

        res.json({
            success: true,
            query: q,
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
