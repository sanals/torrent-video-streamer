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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import type { SearchResult } from '@/services/searchClient';
import { formatBytes } from '@/utils/formatUtils';

interface SearchResultsProps {
    results: SearchResult[];
    onAdd: (magnetURI: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onAdd }) => {
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
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell align="right">Size</TableCell>
                            <TableCell align="center">Seeders</TableCell>
                            <TableCell align="center">Leechers</TableCell>
                            <TableCell align="right">Date</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {results.map((result, index) => (
                            <TableRow key={`${result.magnetURI}-${index}`} hover>
                                <TableCell>
                                    <Typography variant="body2" noWrap title={result.name} sx={{ maxWidth: 400 }}>
                                        {result.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={result.category} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={result.source || 'Unknown'} 
                                        size="small" 
                                        color={result.source === 'YTS' ? 'primary' : 'default'}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2">
                                        {formatBytes(result.size)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        icon={<CloudUploadIcon />}
                                        label={result.seeders}
                                        size="small"
                                        color={result.seeders > 10 ? 'success' : result.seeders > 0 ? 'warning' : 'default'}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        icon={<CloudDownloadIcon />}
                                        label={result.leechers}
                                        size="small"
                                        color="info"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDate(result.uploadDate)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={() => onAdd(result.magnetURI)}
                                    >
                                        Add
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
