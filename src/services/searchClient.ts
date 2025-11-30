/**
 * Search API Client
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface SearchResult {
    name: string;
    magnetURI: string;
    size: number;
    seeders: number;
    leechers: number;
    category: string;
    uploadDate: string;
    infoPage?: string;
    source?: string; // Source/provider (e.g., "YTS", "1337x")
}

export interface SearchResponse {
    success: boolean;
    query: string;
    results: SearchResult[];
    count: number;
}

export interface Category {
    id: string;
    name: string;
    value: number;
}

/**
 * Search torrents by query
 */
export async function searchTorrents(
    query: string,
    options?: {
        category?: string;
        limit?: number;
        sort?: string;
    }
): Promise<SearchResult[]> {
    const params = new URLSearchParams({
        q: query,
    });

    if (options?.category) {
        params.append('category', options.category);
    }
    if (options?.limit) {
        params.append('limit', options.limit.toString());
    }
    if (options?.sort) {
        params.append('sort', options.sort);
    }

    const response = await fetch(`${API_BASE_URL}/search?${params}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to search torrents');
    }

    const data: SearchResponse = await response.json();
    return data.results;
}

/**
 * Get available categories
 */
export async function getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/search/categories`);

    if (!response.ok) {
        throw new Error('Failed to get categories');
    }

    const data = await response.json();
    return data.categories;
}
