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
import type { SearchResult } from '@/services/searchClient';
import * as searchClient from '@/services/searchClient';
import SearchResults from './SearchResults';

interface TorrentSearchProps {
    onAddTorrent: (magnetURI: string) => void;
}

const categories = [
    { value: '', label: 'All Categories' },
    { value: 'movies', label: 'Movies' },
    { value: 'tv', label: 'TV Shows' },
    { value: 'music', label: 'Music' },
    { value: 'games', label: 'Games' },
    { value: 'software', label: 'Software' },
    { value: 'ebook', label: 'eBooks' },
];

type SearchSource = 'alternative' | 'tpb' | 'yts' | 'td';

const TorrentSearch: React.FC<TorrentSearchProps> = ({ onAddTorrent }) => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchSource, setSearchSource] = useState<SearchSource>('tpb');
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
            // Backend API search - request more results
            const searchResults = await searchClient.searchTorrents(query, {
                category: category || undefined,
                limit: 200, // Request up to 200 results
                source: searchSource, // Pass the selected source
            });

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
                {/* Source Selector */}
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
                            <ToggleButton value="tpb">
                                <Tooltip title="The Pirate Bay - All content types">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        TPB
                                    </Box>
                                </Tooltip>
                            </ToggleButton>
                            <ToggleButton value="yts">
                                <Tooltip title="YTS - Movies only, small file sizes">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        YTS
                                    </Box>
                                </Tooltip>
                            </ToggleButton>
                            <ToggleButton value="td">
                                <Tooltip title="TorrentDownloads - Reliable general content">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        TD
                                    </Box>
                                </Tooltip>
                            </ToggleButton>
                            <ToggleButton value="alternative">
                                <Tooltip title="Jackett - 500+ indexers (Recommended)">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        Jackett
                                    </Box>
                                </Tooltip>
                            </ToggleButton>
                        </ToggleButtonGroup>
                        {searchSource === 'alternative' && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                (Jackett - 500+ indexers including 1337x, TPB, EZTV, LimeTorrents)
                            </Typography>
                        )}
                        {searchSource === 'tpb' && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                (TPB - Movies, TV, Music, Games, Software)
                            </Typography>
                        )}
                        {searchSource === 'yts' && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                (YTS - Movies only, small sizes)
                            </Typography>
                        )}
                        {searchSource === 'td' && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                (TorrentDownloads - Movies, TV, Music, Games, Software)
                            </Typography>
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
                            <ToggleButton value="tpb" sx={{ flex: 1 }}>
                                TPB
                            </ToggleButton>
                            <ToggleButton value="yts" sx={{ flex: 1 }}>
                                YTS
                            </ToggleButton>
                            <ToggleButton value="td" sx={{ flex: 1 }}>
                                TD
                            </ToggleButton>
                            <ToggleButton value="alternative" sx={{ flex: 1 }}>
                                Jackett
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {/* Info at bottom */}
                        <Box sx={{ mt: 0.5 }}>
                            {searchSource === 'alternative' && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    Jackett - 500+ indexers (Recommended)
                                </Typography>
                            )}
                            {searchSource === 'tpb' && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    TPB - Movies, TV, Music, Games, Software
                                </Typography>
                            )}
                            {searchSource === 'yts' && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    YTS - Movies only, small sizes
                                </Typography>
                            )}
                            {searchSource === 'td' && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    TD - Movies, TV, Music, Games, Software
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Paper>

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
                >
                    {error}
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
