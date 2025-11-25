// Torrent search service for Torrent Video Streamer
import type { SearchResult } from '@/types/torrent';
import type { SearchApiResponse } from '@/types/api';
import { TORRENT_CATEGORIES } from '@/utils/constants';

// Simple in-memory rate limiter
let lastSearchTime = 0;
const RATE_LIMIT_MS = 1000; // 1 request per second

// Mock search results for development
const mockResults: SearchResult[] = [
  {
    title: 'Ubuntu 22.04 LTS Desktop',
    magnetURI: 'magnet:?xt=urn:btih:MOCK1',
    size: 2_000_000_000,
    seeds: 1200,
    leeches: 100,
    source: 'MockSource',
  },
  {
    title: 'Big Buck Bunny 1080p',
    magnetURI: 'magnet:?xt=urn:btih:MOCK2',
    size: 800_000_000,
    seeds: 800,
    leeches: 50,
    source: 'MockSource',
  },
  {
    title: 'Sintel 4K',
    magnetURI: 'magnet:?xt=urn:btih:MOCK3',
    size: 1_500_000_000,
    seeds: 500,
    leeches: 30,
    source: 'MockSource',
  },
];

/**
 * Validates a search query string.
 * @param query Search query
 */
export function validateSearchQuery(query: string): boolean {
  return typeof query === 'string' && query.trim().length >= 3;
}

/**
 * Validates a search category.
 * @param category Category string
 */
export function validateCategory(category: string): boolean {
  return TORRENT_CATEGORIES.includes(category);
}

/**
 * Performs a torrent search (mock implementation).
 * @param query Search query
 * @param category Optional category
 */
export async function searchTorrents(query: string, category?: string): Promise<SearchApiResponse> {
  // Rate limiting
  const now = Date.now();
  if (now - lastSearchTime < RATE_LIMIT_MS) {
    return { results: [], total: 0, error: 'Rate limit exceeded. Please wait.' };
  }
  lastSearchTime = now;

  // Validate query
  if (!validateSearchQuery(query)) {
    return { results: [], total: 0, error: 'Invalid search query.' };
  }
  if (category && !validateCategory(category)) {
    return { results: [], total: 0, error: 'Invalid category.' };
  }

  // Simulate async search and filter by category (mock)
  try {
    // In a real implementation, call the API here
    const filtered = mockResults.filter(r =>
      r.title.toLowerCase().includes(query.toLowerCase()) &&
      (!category || r.source === category || category === 'Other')
    );
    // Simulate network delay
    await new Promise(res => setTimeout(res, 300));
    return { results: filtered, total: filtered.length };
  } catch (err) {
    return { results: [], total: 0, error: 'Search failed. Please try again.' };
  }
} 