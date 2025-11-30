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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import type { TorrentData } from '@/services/apiClient';
import { formatBytes } from '@/utils/formatUtils';

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
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }} title={torrent.name}>
                                    {torrent.name || 'Loading metadata...'}
                                </Typography>
                                <Box>
                                    <Tooltip title={torrent.paused ? "Resume Download" : "Pause Download"}>
                                        <IconButton
                                            color="primary"
                                            onClick={() => torrent.paused ? onResumeTorrent(torrent.infoHash) : onPauseTorrent(torrent.infoHash)}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            {torrent.paused ? <PlayArrowIcon /> : <PauseIcon />}
                                        </IconButton>
                                    </Tooltip>
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
                                        {(torrent.progress * 100).toFixed(1)}% {torrent.paused && '(Paused)'}
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

                            <Typography variant="subtitle2" gutterBottom>
                                Files
                            </Typography>
                            <List dense disablePadding>
                                {torrent.files.map((file) => (
                                    <ListItem key={`${torrent.infoHash}-${file.index}`} disableGutters>
                                        <ListItemText
                                            primary={file.name}
                                            secondary={formatBytes(file.length)}
                                            primaryTypographyProps={{ noWrap: true }}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                color="primary"
                                                onClick={() => onPlayFile(torrent.infoHash, file.index, file.name)}
                                            >
                                                <PlayArrowIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
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
