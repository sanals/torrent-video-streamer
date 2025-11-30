import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Stack,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    FormControlLabel,
    Checkbox,
    Tooltip,
    Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import type { TorrentData } from '@/services/apiClient';
import { formatBytes } from '@/utils/formatUtils';
import { categorizeFiles } from '@/utils/fileUtils';

interface TorrentListProps {
    torrents: TorrentData[];
    onRemoveTorrent: (infoHash: string, deleteData: boolean) => void;
    onPlayFile: (infoHash: string, fileIndex: number, fileName: string) => void;
    onPauseTorrent: (infoHash: string) => void;
    onResumeTorrent: (infoHash: string) => void;
}

const TorrentList: React.FC<TorrentListProps> = ({
    torrents,
    onRemoveTorrent,
    onPlayFile,
    onPauseTorrent,
    onResumeTorrent
}) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [torrentToDelete, setTorrentToDelete] = useState<string | null>(null);
    const [deleteData, setDeleteData] = useState(false);
    // Track collapsed state for each section per torrent: { torrentHash: { videos: boolean, subtitles: boolean, other: boolean } }
    const [collapsedSections, setCollapsedSections] = useState<Record<string, { videos: boolean; subtitles: boolean; other: boolean }>>({});

    const handleDeleteClick = (infoHash: string) => {
        setTorrentToDelete(infoHash);
        setDeleteData(false);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (torrentToDelete) {
            onRemoveTorrent(torrentToDelete, deleteData);
            setDeleteDialogOpen(false);
            setTorrentToDelete(null);
        }
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setTorrentToDelete(null);
    };

    const toggleSection = (torrentHash: string, section: 'videos' | 'subtitles' | 'other') => {
        setCollapsedSections(prev => ({
            ...prev,
            [torrentHash]: {
                ...prev[torrentHash],
                [section]: !prev[torrentHash]?.[section]
            }
        }));
    };

    const isSectionCollapsed = (torrentHash: string, section: 'videos' | 'subtitles' | 'other'): boolean => {
        return collapsedSections[torrentHash]?.[section] ?? false;
    };

    if (torrents.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography>No active torrents. Add one to start streaming!</Typography>
            </Box>
        );
    }

    return (
        <>
            <Stack spacing={2}>
                {torrents.map((torrent) => (
                    <Card key={torrent.infoHash} variant="outlined">
                        <CardContent>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start', 
                                mb: 1,
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: { xs: 1, sm: 0 }
                            }}>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: { xs: '100%', sm: '70%' },
                                        fontSize: { xs: '1rem', sm: '1.25rem' }
                                    }} 
                                    title={torrent.name}
                                >
                                    {torrent.name || 'Loading metadata...'}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                                    {torrent.paused && torrent.progress === 0 && (
                                        <Tooltip title="Start Download">
                                            <IconButton
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Starting download for torrent (header):', torrent.infoHash);
                                                    onResumeTorrent(torrent.infoHash);
                                                }}
                                                size="small"
                                            >
                                                <CloudDownloadIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {torrent.paused && torrent.progress > 0 && (
                                        <Tooltip title="Resume Download">
                                            <IconButton
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Resuming download for torrent (header):', torrent.infoHash);
                                                    onResumeTorrent(torrent.infoHash);
                                                }}
                                                size="small"
                                            >
                                                <PlayArrowIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {!torrent.paused && (
                                        <Tooltip title="Pause Download">
                                            <IconButton
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onPauseTorrent(torrent.infoHash);
                                                }}
                                                size="small"
                                            >
                                                <PauseIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Remove Torrent">
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteClick(torrent.infoHash)}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {torrent.progress === 0 && torrent.paused ? 'Not Started' : `${(torrent.progress * 100).toFixed(1)}%`} {torrent.paused && torrent.progress > 0 && '(Paused)'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatBytes(torrent.downloadSpeed)}/s ↓
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={torrent.progress * 100}
                                    color={torrent.paused ? "warning" : "primary"}
                                />
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Peers: {torrent.numPeers}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Size: {formatBytes(torrent.length)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
                                Files
                            </Typography>
                            
                            {(() => {
                                const { videos, subtitles, other } = categorizeFiles(torrent.files);
                                
                                return (
                                    <Box>
                                        {/* Videos Section */}
                                        {videos.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        mb: 1,
                                                        cursor: 'pointer',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                    onClick={() => toggleSection(torrent.infoHash, 'videos')}
                                                >
                                                    <VideoFileIcon sx={{ mr: 1, fontSize: { xs: 16, sm: 18 }, color: 'primary.main' }} />
                                                    <Typography 
                                                        variant="overline" 
                                                        color="primary" 
                                                        sx={{ 
                                                            fontWeight: 600, 
                                                            flex: 1,
                                                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        Videos ({videos.length})
                                                    </Typography>
                                                    <IconButton size="small" sx={{ p: 0.5, ml: 1 }}>
                                                        {isSectionCollapsed(torrent.infoHash, 'videos') ? 
                                                            <ExpandMoreIcon fontSize="small" /> : 
                                                            <ExpandLessIcon fontSize="small" />
                                                        }
                                                    </IconButton>
                                                </Box>
                                                <Collapse in={!isSectionCollapsed(torrent.infoHash, 'videos')}>
                                                    <List dense disablePadding>
                                                        {videos.map(({ file }) => (
                                                            <ListItem 
                                                                key={`${torrent.infoHash}-${file.index}`} 
                                                                disableGutters
                                                                sx={{ 
                                                                    pl: 2,
                                                                    '&:hover': { bgcolor: 'action.hover' },
                                                                    borderRadius: 1
                                                                }}
                                                            >
                                                                <ListItemText
                                                                    primary={file.name}
                                                                    secondary={formatBytes(file.length)}
                                                                    primaryTypographyProps={{ 
                                                                    noWrap: true,
                                                                    sx: { fontSize: '0.875rem' }
                                                                }}
                                                                secondaryTypographyProps={{ 
                                                                    sx: { fontSize: '0.75rem' }
                                                                }}
                                                            />
                                                                <ListItemSecondaryAction>
                                                                    <Tooltip title={torrent.paused ? "Start downloading the torrent first (use the download button in the header)" : "Play Video"}>
                                                                        <span>
                                                                            <IconButton
                                                                                edge="end"
                                                                                color="primary"
                                                                                size="small"
                                                                                disabled={torrent.paused}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    onPlayFile(torrent.infoHash, file.index, file.name);
                                                                                }}
                                                                            >
                                                                                <PlayArrowIcon />
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                </ListItemSecondaryAction>
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            </Box>
                                        )}

                                        {/* Subtitles Section */}
                                        {subtitles.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        mb: 1,
                                                        cursor: 'pointer',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                    onClick={() => toggleSection(torrent.infoHash, 'subtitles')}
                                                >
                                                    <SubtitlesIcon sx={{ mr: 1, fontSize: { xs: 16, sm: 18 }, color: 'text.secondary' }} />
                                                    <Typography 
                                                        variant="overline" 
                                                        color="text.secondary" 
                                                        sx={{ 
                                                            fontWeight: 600, 
                                                            flex: 1,
                                                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        Subtitles ({subtitles.length})
                                                    </Typography>
                                                    <IconButton size="small" sx={{ p: 0.5, ml: 1 }}>
                                                        {isSectionCollapsed(torrent.infoHash, 'subtitles') ? 
                                                            <ExpandMoreIcon fontSize="small" /> : 
                                                            <ExpandLessIcon fontSize="small" />
                                                        }
                                                    </IconButton>
                                                </Box>
                                                <Collapse in={!isSectionCollapsed(torrent.infoHash, 'subtitles')}>
                                                    <List dense disablePadding>
                                                        {subtitles.map(({ file }) => (
                                                            <ListItem 
                                                                key={`${torrent.infoHash}-${file.index}`} 
                                                                disableGutters
                                                                sx={{ 
                                                                    pl: 2,
                                                                    '&:hover': { bgcolor: 'action.hover' },
                                                                    borderRadius: 1
                                                                }}
                                                            >
                                                                <ListItemText
                                                                    primary={file.name}
                                                                    secondary={formatBytes(file.length)}
                                                                    primaryTypographyProps={{ 
                                                                        noWrap: true,
                                                                        sx: { fontSize: '0.875rem' }
                                                                    }}
                                                                    secondaryTypographyProps={{ 
                                                                        sx: { fontSize: '0.75rem' }
                                                                    }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            </Box>
                                        )}

                                        {/* Other Files Section */}
                                        {other.length > 0 && (
                                            <Box>
                                                <Box 
                                                    sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        mb: 1,
                                                        cursor: 'pointer',
                                                        '&:hover': { opacity: 0.8 }
                                                    }}
                                                    onClick={() => toggleSection(torrent.infoHash, 'other')}
                                                >
                                                    <InsertDriveFileIcon sx={{ mr: 1, fontSize: { xs: 16, sm: 18 }, color: 'text.secondary' }} />
                                                    <Typography 
                                                        variant="overline" 
                                                        color="text.secondary" 
                                                        sx={{ 
                                                            fontWeight: 600, 
                                                            flex: 1,
                                                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        Other Files ({other.length})
                                                    </Typography>
                                                    <IconButton size="small" sx={{ p: 0.5, ml: 1 }}>
                                                        {isSectionCollapsed(torrent.infoHash, 'other') ? 
                                                            <ExpandMoreIcon fontSize="small" /> : 
                                                            <ExpandLessIcon fontSize="small" />
                                                        }
                                                    </IconButton>
                                                </Box>
                                                <Collapse in={!isSectionCollapsed(torrent.infoHash, 'other')}>
                                                    <List dense disablePadding>
                                                        {other.map(({ file }) => (
                                                            <ListItem 
                                                                key={`${torrent.infoHash}-${file.index}`} 
                                                                disableGutters
                                                                sx={{ 
                                                                    pl: 2,
                                                                    '&:hover': { bgcolor: 'action.hover' },
                                                                    borderRadius: 1
                                                                }}
                                                            >
                                                                <ListItemText
                                                                    primary={file.name}
                                                                    secondary={formatBytes(file.length)}
                                                                    primaryTypographyProps={{ 
                                                                        noWrap: true,
                                                                        sx: { fontSize: '0.875rem' }
                                                                    }}
                                                                    secondaryTypographyProps={{ 
                                                                        sx: { fontSize: '0.75rem' }
                                                                    }}
                                                                />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })()}
                        </CardContent>
                    </Card>
                ))}
            </Stack>

            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Remove Torrent?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to remove this torrent?
                        <br /><br />
                        <strong>Warning:</strong> If you are currently watching this video, playback will stop immediately.
                    </DialogContentText>
                    <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={deleteData}
                                    onChange={(e) => setDeleteData(e.target.checked)}
                                    color="error"
                                />
                            }
                            label="Also delete downloaded files from disk"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TorrentList;
