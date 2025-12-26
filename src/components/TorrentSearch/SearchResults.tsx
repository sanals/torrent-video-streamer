import React from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Typography,
    Box,
    IconButton,
    Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import LinkIcon from '@mui/icons-material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import type { SearchResult } from '@/services/searchClient';
import { formatBytes } from '@/utils/formatUtils';

interface SearchResultsProps {
    results: SearchResult[];
    onAdd: (magnetURI: string) => void;
    addingMagnetURI?: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onAdd, addingMagnetURI }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Paper elevation={2}>
            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="h6">
                    Search Results ({results.length})
                </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            {/* Mobile: Action first, Desktop: Action last */}
                            <TableCell
                                align="center"
                                sx={{
                                    display: { xs: 'table-cell', sm: 'none' },
                                    minWidth: { xs: 50, sm: 'auto' },
                                    width: { xs: 50, sm: 'auto' },
                                    padding: { xs: '8px', sm: '16px' }
                                }}
                            >
                                Action
                            </TableCell>
                            <TableCell sx={{ minWidth: { xs: 120, sm: 200 } }}>Name</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell align="center">Seeders</TableCell>
                            <TableCell align="center">Leechers</TableCell>
                            <TableCell align="right">Date</TableCell>
                            {/* Category and Source at right end (after Date) */}
                            <TableCell>Category</TableCell>
                            <TableCell>Source</TableCell>
                            {/* Desktop: Action at the end */}
                            <TableCell
                                align="center"
                                sx={{
                                    display: { xs: 'none', sm: 'table-cell' }
                                }}
                            >
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((result, index) => (
                            <TableRow key={`${result.magnetURI}-${index}`} hover>
                                {/* Mobile: Action button first (leftmost) - icon only */}
                                <TableCell
                                    align="center"
                                    sx={{
                                        display: { xs: 'table-cell', sm: 'none' },
                                        padding: { xs: '8px', sm: '16px' }
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => onAdd(result.magnetURI)}
                                        disabled={addingMagnetURI === result.magnetURI || !!addingMagnetURI}
                                        sx={{
                                            minWidth: { xs: 'auto', sm: 'auto' },
                                            px: { xs: 0.5, sm: 2 },
                                            width: { xs: 36, sm: 'auto' },
                                            height: { xs: 36, sm: 'auto' }
                                        }}
                                    >
                                        {addingMagnetURI === result.magnetURI ? (
                                            <CircularProgress size={16} color="inherit" />
                                        ) : (
                                            <AddIcon fontSize="small" />
                                        )}
                                    </Button>
                                </TableCell>

                                {/* Name */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography
                                            variant="body2"
                                            noWrap
                                            title={result.name}
                                            sx={{
                                                maxWidth: { xs: 150, sm: 350 }
                                            }}
                                        >
                                            {result.name}
                                        </Typography>
                                        <Tooltip title="Copy magnet link">
                                            <IconButton
                                                size="small"
                                                onClick={() => navigator.clipboard.writeText(result.magnetURI)}
                                                sx={{ p: 0.25 }}
                                            >
                                                <LinkIcon fontSize="small" sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>

                                <TableCell align="right">
                                    <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                        {formatBytes(result.size)}
                                    </Typography>
                                </TableCell>

                                <TableCell align="center">
                                    <Chip
                                        icon={<CloudUploadIcon />}
                                        label={result.seeders}
                                        size="small"
                                        color={result.seeders > 10 ? 'success' : result.seeders > 0 ? 'warning' : 'default'}
                                        sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            height: { xs: 20, sm: 24 }
                                        }}
                                    />
                                </TableCell>

                                <TableCell align="center">
                                    <Chip
                                        icon={<CloudDownloadIcon />}
                                        label={result.leechers}
                                        size="small"
                                        color="info"
                                        sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            height: { xs: 20, sm: 24 }
                                        }}
                                    />
                                </TableCell>

                                <TableCell align="right">
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                    >
                                        {formatDate(result.uploadDate)}
                                    </Typography>
                                </TableCell>

                                {/* Category and Source at right end (after Date) */}
                                <TableCell>
                                    <Chip
                                        label={result.category}
                                        size="small"
                                        sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            height: { xs: 20, sm: 24 }
                                        }}
                                    />
                                </TableCell>

                                <TableCell>
                                    <Chip
                                        label={result.source || 'Unknown'}
                                        size="small"
                                        color={result.source === 'YTS' ? 'primary' : 'default'}
                                        variant="outlined"
                                        sx={{
                                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                            height: { xs: 20, sm: 24 }
                                        }}
                                    />
                                </TableCell>

                                {/* Desktop: Action button at the end */}
                                <TableCell
                                    align="center"
                                    sx={{
                                        display: { xs: 'none', sm: 'table-cell' }
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={
                                            addingMagnetURI === result.magnetURI ? (
                                                <CircularProgress size={16} color="inherit" />
                                            ) : (
                                                <AddIcon />
                                            )
                                        }
                                        onClick={() => onAdd(result.magnetURI)}
                                        disabled={addingMagnetURI === result.magnetURI || !!addingMagnetURI}
                                    >
                                        {addingMagnetURI === result.magnetURI ? 'Adding...' : 'Add'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default SearchResults;
