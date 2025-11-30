import React, { useState } from 'react';
import { Box, TextField, Button, Paper, Typography, Tabs, Tab, Card, CardContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface TorrentInputProps {
    onAdd: (magnetURI: string, torrentFile?: File) => void;
    isAdding: boolean;
}

const TorrentInput: React.FC<TorrentInputProps> = ({ onAdd, isAdding }) => {
    const [magnetURI, setMagnetURI] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [tabValue, setTabValue] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile) {
            onAdd('', selectedFile);
            setSelectedFile(null);
            // Reset file input
            const fileInput = document.getElementById('torrent-file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } else if (magnetURI.trim()) {
            onAdd(magnetURI.trim());
            setMagnetURI('');
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file extension
            if (!file.name.endsWith('.torrent')) {
                alert('Please select a .torrent file');
                return;
            }
            setSelectedFile(file);
            setMagnetURI(''); // Clear magnet URI when file is selected
        }
    };

    const handleMagnetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMagnetURI(e.target.value);
        if (e.target.value.trim()) {
            setSelectedFile(null); // Clear file when magnet URI is entered
            const fileInput = document.getElementById('torrent-file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        // Clear the other input when switching tabs
        if (newValue === 0) {
            setSelectedFile(null);
            const fileInput = document.getElementById('torrent-file-input') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } else {
            setMagnetURI('');
        }
    };

    return (
        <Card 
            elevation={2}
            sx={{ 
                mb: 3,
                overflow: 'visible'
            }}
        >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 500,
                            minHeight: { xs: 56, sm: 64 },
                            fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                    }}
                >
                    <Tab 
                        icon={<LinkIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />} 
                        iconPosition="start"
                        label="Magnet Link"
                        sx={{ 
                            '&.MuiTab-root': {
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 0.5, sm: 1 }
                            }
                        }}
                    />
                    <Tab 
                        icon={<UploadFileIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />} 
                        iconPosition="start"
                        label="Upload File"
                        sx={{ 
                            '&.MuiTab-root': {
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 0.5, sm: 1 }
                            }
                        }}
                    />
                </Tabs>
            </Box>

            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box component="form" onSubmit={handleSubmit}>
                    {tabValue === 0 ? (
                        // Magnet Link Tab
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Paste a magnet link to start downloading
                            </Typography>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="magnet:?xt=urn:btih:..."
                                value={magnetURI}
                                onChange={handleMagnetChange}
                                disabled={isAdding}
                                size="medium"
                                sx={{ mb: 2 }}
                            />
                        </Box>
                    ) : (
                        // File Upload Tab
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Select a .torrent file from your computer
                            </Typography>
                            <Button
                                component="label"
                                variant={selectedFile ? "contained" : "outlined"}
                                fullWidth
                                startIcon={selectedFile ? <CheckCircleIcon /> : <UploadFileIcon />}
                                disabled={isAdding}
                                sx={{ 
                                    py: 2,
                                    mb: selectedFile ? 2 : 0,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    ...(selectedFile && {
                                        bgcolor: 'success.main',
                                        '&:hover': { bgcolor: 'success.dark' }
                                    })
                                }}
                            >
                                <Box
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        width: '100%',
                                        textAlign: 'left'
                                    }}
                                >
                                    {selectedFile 
                                        ? `Selected: ${selectedFile.name}`
                                        : 'Choose .torrent File'}
                                </Box>
                                <input
                                    id="torrent-file-input"
                                    type="file"
                                    hidden
                                    accept=".torrent"
                                    onChange={handleFileSelect}
                                />
                            </Button>
                            {selectedFile && (
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flex: 1,
                                            minWidth: 0
                                        }}
                                    >
                                        {selectedFile.name}
                                    </Typography>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            const fileInput = document.getElementById('torrent-file-input') as HTMLInputElement;
                                            if (fileInput) fileInput.value = '';
                                        }}
                                        sx={{ textTransform: 'none', minWidth: 'auto' }}
                                    >
                                        Clear
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<AddIcon />}
                            disabled={isAdding || (!magnetURI.trim() && !selectedFile)}
                            size="large"
                            fullWidth={{ xs: true, sm: false }}
                            sx={{ 
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1.5,
                                minWidth: { sm: 160 },
                                px: { sm: 4 }
                            }}
                        >
                            {isAdding ? 'Adding...' : 'Start Download'}
                        </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default TorrentInput;
