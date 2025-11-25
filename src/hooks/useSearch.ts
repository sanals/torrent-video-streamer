import { useState, useCallback } from 'react';
import { searchTorrents, validateSearchQuery, validateCategory } from '@/services/searchService';
import type { SearchResult } from '@/types/torrent';

/**
 * Custom hook for torrent search functionality.
 */
export function useSearch() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const search = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      if (!validateSearchQuery(query)) {
        setError('Please enter a valid search query.');
        setResults([]);
        setLoading(false);
        return;
      }
      if (category && !validateCategory(category)) {
        setError('Invalid category.');
        setResults([]);
        setLoading(false);
        return;
      }
      const res = await searchTorrents(query, category);
      setResults(res.results);
      if (res.error) setError(res.error);
    } catch (err: any) {
      setError(err?.message || 'Search failed.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, category]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    results,
    loading,
    error,
    search,
  };
} 