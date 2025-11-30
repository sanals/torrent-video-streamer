import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Paper,
    CircularProgress,
    Alert,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudIcon from '@mui/icons-material/Cloud';
import ComputerIcon from '@mui/icons-material/Computer';
import type { SearchResult } from '@/services/searchClient';
import type { BrowserSearchResult } from '@/services/browserSearchClient';
import * as searchClient from '@/services/searchClient';
import * as browserSearchClient from '@/services/browserSearchClient';
import SearchResults from './SearchResults';

interface TorrentSearchProps {
    onAddTorrent: (magnetURI: string) => void;
}

type SearchMode = 'backend' | 'browser';

const categories = [
    { value: '', label: 'All Categories' },
    { value: 'movies', label: 'Movies' },
    { value: 'tv', label: 'TV Shows' },
    { value: 'music', label: 'Music' },
    { value: 'games', label: 'Games' },
    { value: 'software', label: 'Software' },
    { value: 'ebook', label: 'eBooks' },
];

const TorrentSearch: React.FC<TorrentSearchProps> = ({ onAddTorrent }) => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchMode, setSearchMode] = useState<SearchMode>('browser');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) {
            setError('Please enter a search query');
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            let searchResults: SearchResult[];

            if (searchMode === 'browser') {
                // Browser-based search (direct to YTS API)
                const browserResults = await browserSearchClient.searchTorrentsBrowser(query, {
                    limit: 200, // Request more results
                });
                // Convert BrowserSearchResult to SearchResult
                searchResults = browserResults.map((result: BrowserSearchResult): SearchResult => ({
                    name: result.name,
                    magnetURI: result.magnetURI,
                    size: result.size,
                    seeders: result.seeders,
                    leechers: result.leechers,
                    category: result.category,
                    uploadDate: result.uploadDate,
                    source: result.source || 'YTS',
                }));
            } else {
                // Backend API search - request more results
                searchResults = await searchClient.searchTorrents(query, {
                    category: category || undefined,
                    limit: 200, // Request up to 200 results
                });
            }

            setResults(searchResults);

            if (searchResults.length === 0) {
                setError('No torrents found. Try a different search query.');
            }
        } catch (err) {
            let errorMessage = err instanceof Error ? err.message : 'Failed to search torrents';
            
            // Provide helpful messages for common backend errors
            if (errorMessage.includes('ECONNRESET') || errorMessage.includes('Network connection failed')) {
                errorMessage = 'Network connection failed. This is usually caused by firewall/antivirus blocking Node.js. Please check TROUBLESHOOTING.md for solutions, or try using a VPN.';
            } else if (errorMessage.includes('timed out')) {
                errorMessage = 'Request timed out. The API may be slow or temporarily unavailable. Please try again in a moment.';
            } else if (errorMessage.includes('All API mirrors failed')) {
                errorMessage = 'All search API endpoints are currently unavailable. This may be a temporary issue. Please try again later or manually add torrents using magnet links.';
            }
            
            setError(errorMessage);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = (magnetURI: string) => {
        onAddTorrent(magnetURI);
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                {/* Info Alert */}
                {searchMode === 'backend' && (
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'info.dark', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.primary' }}>
                            <strong>Note:</strong> Currently using YTS API (movies only). For TV shows and more results, consider using 1337x or other sources manually via magnet links.
                        </Typography>
                    </Box>
                )}
                {/* Search Mode Toggle */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <ToggleButtonGroup
                        value={searchMode}
                        exclusive
                        onChange={(_, newMode) => newMode && setSearchMode(newMode)}
                        size="small"
                    >
                        <ToggleButton value="browser">
                            <Tooltip title="Search directly from browser (bypasses network restrictions)">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <ComputerIcon fontSize="small" />
                                    Browser Direct
                                </Box>
                            </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="backend">
                            <Tooltip title="Search via backend server (may be blocked)">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CloudIcon fontSize="small" />
                                    Backend API
                                </Box>
                            </Tooltip>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label="Search Torrents"
                        placeholder="Enter movie, TV show, music, etc..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={loading}
                        sx={{ flex: 1, minWidth: 300 }}
                    />
                    <TextField
                        select
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={loading}
                        sx={{ minWidth: 150 }}
                    >
                        {categories.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                        disabled={loading || !query.trim()}
                        sx={{ px: 4 }}
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </Button>
                </Box>
            </Paper>

            {error && (
                <Alert 
                    severity={results.length === 0 ? 'warning' : 'error'} 
                    sx={{ mb: 2 }}
                    action={
                        searchMode === 'browser' && error.includes('Browser search failed') ? (
                            <Button 
                                color="inherit" 
                                size="small" 
                                onClick={() => setSearchMode('backend')}
                            >
                                Switch to Backend
                            </Button>
                        ) : null
                    }
                >
                    {error}
                    {searchMode === 'browser' && error.includes('Browser search failed') && (
                        <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
                            <strong>Tip:</strong> Switch to "Backend API" mode above for more reliable searches.
                        </Box>
                    )}
                </Alert>
            )}

            {hasSearched && !loading && results.length > 0 && (
                <SearchResults results={results} onAdd={handleAdd} />
            )}

            {hasSearched && !loading && results.length === 0 && !error && (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ color: 'text.secondary' }}>
                        No results found for "{query}"
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default TorrentSearch;
