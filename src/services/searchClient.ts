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
        source?: string; // 'yts', '1337x', or 'alternative'
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
    if (options?.source) {
        params.append('source', options.source);
    }

    let response;
    try {
        response = await fetch(`${API_BASE_URL}/search?${params}`);
    } catch (fetchError) {
        // Network error (CORS, connection refused, etc.)
        console.error('Search fetch error:', fetchError);
        const errorMsg = fetchError instanceof Error ? fetchError.message : 'Network error';
        if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
            throw new Error(`Cannot connect to backend API at ${API_BASE_URL}. Make sure the backend server is running and accessible.`);
        }
        throw fetchError;
    }

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
        } catch {
            // If response is not JSON, use status text
        }
        throw new Error(errorMessage);
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
