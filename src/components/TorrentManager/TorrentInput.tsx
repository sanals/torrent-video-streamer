import React, { useState } from 'react';
import { Box, TextField, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface TorrentInputProps {
    onAdd: (magnetURI: string) => void;
    isAdding: boolean;
}

const TorrentInput: React.FC<TorrentInputProps> = ({ onAdd, isAdding }) => {
    const [magnetURI, setMagnetURI] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (magnetURI.trim()) {
            onAdd(magnetURI.trim());
            setMagnetURI('');
        }
    };

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Magnet URI"
                    placeholder="magnet:?xt=urn:btih:..."
                    value={magnetURI}
                    onChange={(e) => setMagnetURI(e.target.value)}
                    disabled={isAdding}
                />
                <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={isAdding || !magnetURI.trim()}
                    sx={{ minWidth: 120 }}
                >
                    {isAdding ? 'Adding...' : 'Add'}
                </Button>
            </Box>
        </Paper>
    );
};

export default TorrentInput;
