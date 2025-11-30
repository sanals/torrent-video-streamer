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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloudIcon from '@mui/icons-material/Cloud';
import ComputerIcon from '@mui/icons-material/Computer';
import type { SearchResult } from '@/services/searchClient';
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
                searchResults = await browserSearchClient.searchTorrentsBrowser(query, {
                    limit: 50,
                });
            } else {
                // Backend API search
                searchResults = await searchClient.searchTorrents(query, {
                    category: category || undefined,
                    limit: 50,
                });
            }

            setResults(searchResults);

            if (searchResults.length === 0) {
                setError('No torrents found. Try a different search query.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search torrents';
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
                <Alert severity={results.length === 0 ? 'warning' : 'error'} sx={{ mb: 2 }}>
                    {error}
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
