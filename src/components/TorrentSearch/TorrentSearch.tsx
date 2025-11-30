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

type SearchSource = 'yts' | '1337x' | 'alternative';

const TorrentSearch: React.FC<TorrentSearchProps> = ({ onAddTorrent }) => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchMode, setSearchMode] = useState<SearchMode>('browser');
    const [searchSource, setSearchSource] = useState<SearchSource>('yts');
    const [addingMagnetURI, setAddingMagnetURI] = useState<string | null>(null);

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
                    source: searchSource, // Pass the selected source
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
            } else if (errorMessage.includes('Cloudflare') || errorMessage.includes('cloudflare')) {
                errorMessage = '1337x is currently blocked by Cloudflare protection. This is a temporary issue. Please try again in a few minutes, or switch to YTS for movies.';
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
        setAddingMagnetURI(magnetURI);
        // Call onAddTorrent (it handles async internally)
        onAddTorrent(magnetURI);
        // Clear adding state after a delay to show feedback
        setTimeout(() => {
            setAddingMagnetURI(null);
        }, 2000); // 2 seconds should be enough for most torrents to start adding
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

                {/* Source Selector (only for backend mode) */}
                {searchMode === 'backend' && (
                    <Paper 
                        elevation={1} 
                        sx={{ 
                            mb: 2, 
                            p: { xs: 1.5, sm: 2 },
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        {/* Desktop: Horizontal layout */}
                        <Box 
                            sx={{ 
                                display: { xs: 'none', sm: 'flex' }, 
                                alignItems: 'center', 
                                gap: 2 
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
                                Source:
                            </Typography>
                            <ToggleButtonGroup
                                value={searchSource}
                                exclusive
                                onChange={(_, newSource) => newSource && setSearchSource(newSource)}
                                size="small"
                            >
                                <ToggleButton value="yts">
                                    <Tooltip title="YTS - Movies only, high quality">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            YTS
                                        </Box>
                                    </Tooltip>
                                </ToggleButton>
                                <ToggleButton value="1337x">
                                    <Tooltip title="1337x - Movies, TV Shows, and more (may be blocked by Cloudflare)">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            1337x
                                        </Box>
                                    </Tooltip>
                                </ToggleButton>
                                <ToggleButton value="alternative">
                                    <Tooltip title="Alternative - Tries multiple providers (RARBG, ThePirateBay, etc.) to avoid Cloudflare">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            Alternative
                                        </Box>
                                    </Tooltip>
                                </ToggleButton>
                            </ToggleButtonGroup>
                            {searchSource === 'yts' && (
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    (Movies only)
                                </Typography>
                            )}
                            {searchSource === '1337x' && (
                                <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        (Movies, TV Shows, etc.)
                                    </Typography>
                                    <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                                        Note: May be blocked by Cloudflare. Try "Alternative" if this fails.
                                    </Typography>
                                </Box>
                            )}
                            {searchSource === 'alternative' && (
                                <Box sx={{ ml: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        (Tries RARBG, ThePirateBay, Torrent9, 1337x)
                                    </Typography>
                                    <Typography variant="caption" color="info.main" sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                                        Automatically tries multiple providers to avoid Cloudflare blocks
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Mobile: Vertical layout */}
                        <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1.5 }}>
                            {/* Label at top */}
                            <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                sx={{ fontWeight: 600 }}
                            >
                                Source:
                            </Typography>
                            
                            {/* Buttons in middle */}
                            <ToggleButtonGroup
                                value={searchSource}
                                exclusive
                                onChange={(_, newSource) => newSource && setSearchSource(newSource)}
                                size="small"
                                fullWidth
                                sx={{
                                    '& .MuiToggleButtonGroup-grouped': {
                                        flex: 1,
                                    }
                                }}
                            >
                                <ToggleButton value="yts" sx={{ flex: 1 }}>
                                    YTS
                                </ToggleButton>
                                <ToggleButton value="1337x" sx={{ flex: 1 }}>
                                    1337x
                                </ToggleButton>
                                <ToggleButton value="alternative" sx={{ flex: 1 }}>
                                    Alternative
                                </ToggleButton>
                            </ToggleButtonGroup>
                            
                            {/* Info at bottom */}
                            <Box sx={{ mt: 0.5 }}>
                                {searchSource === 'yts' && (
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        Movies only
                                    </Typography>
                                )}
                                {searchSource === '1337x' && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block' }}>
                                            Movies, TV Shows, etc.
                                        </Typography>
                                        <Typography variant="caption" color="warning.main" sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                                            ⚠️ May be blocked by Cloudflare. Try "Alternative" if this fails.
                                        </Typography>
                                    </Box>
                                )}
                                {searchSource === 'alternative' && (
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block' }}>
                                            Tries RARBG, ThePirateBay, Torrent9, 1337x
                                        </Typography>
                                        <Typography variant="caption" color="info.main" sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>
                                            ✅ Automatically tries multiple providers to avoid Cloudflare blocks
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                )}

                <Box 
                    component="form" 
                    onSubmit={handleSearch} 
                    sx={{ 
                        display: 'flex', 
                        gap: { xs: 1, sm: 2 }, 
                        flexWrap: { xs: 'nowrap', sm: 'wrap' },
                        alignItems: { xs: 'stretch', sm: 'flex-start' }
                    }}
                >
                    <TextField
                        variant="outlined"
                        label="Search Torrents"
                        placeholder="Enter movie, TV show, music, etc..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={loading}
                        sx={{ 
                            flex: 1,
                            minWidth: { xs: 0, sm: 300 },
                            '& .MuiOutlinedInput-root': {
                                height: { xs: '56px', sm: 'auto' }
                            }
                        }}
                    />
                    {searchMode === 'backend' && (
                        <TextField
                            select
                            label="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={loading}
                            sx={{ 
                                minWidth: { xs: 120, sm: 150 },
                                display: { xs: 'none', sm: 'flex' }
                            }}
                        >
                            {categories.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                        disabled={loading || !query.trim()}
                        sx={{ 
                            px: { xs: 2, sm: 4 },
                            minWidth: { xs: 'auto', sm: 'auto' },
                            height: { xs: '56px', sm: '56.5px' }, // Match TextField height on desktop
                            whiteSpace: 'nowrap',
                            alignSelf: { xs: 'stretch', sm: 'flex-start' }
                        }}
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
                <SearchResults 
                    results={results} 
                    onAdd={handleAdd}
                    addingMagnetURI={addingMagnetURI}
                />
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
