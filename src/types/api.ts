// API response types for the Torrent Video Streamer app
import type { SearchResult } from './search';

/**
 * Represents the response from a torrent search API.
 */
export interface SearchApiResponse {
  /** List of search results */
  results: SearchResult[];
  /** Total number of results available */
  total: number;
  /** Optional: Error message */
  error?: string;
}