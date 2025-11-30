import React from 'react';
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
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type { TorrentData } from '@/services/apiClient';
import { formatBytes } from '@/utils/formatUtils';

interface TorrentListProps {
    torrents: TorrentData[];
    onRemoveTorrent: (infoHash: string) => void;
    onPlayFile: (infoHash: string, fileIndex: number, fileName: string) => void;
}

const TorrentList: React.FC<TorrentListProps> = ({ torrents, onRemoveTorrent, onPlayFile }) => {
    if (torrents.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography>No active torrents. Add one to start streaming!</Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            {torrents.map((torrent) => (
                <Card key={torrent.infoHash} variant="outlined">
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="h6" noWrap sx={{ maxWidth: '80%' }} title={torrent.name}>
                                {torrent.name || 'Loading metadata...'}
                            </Typography>
                            <IconButton
                                color="error"
                                onClick={() => onRemoveTorrent(torrent.infoHash)}
                                size="small"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {(torrent.progress * 100).toFixed(1)}%
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {formatBytes(torrent.downloadSpeed)}/s ↓
                                </Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={torrent.progress * 100} />
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
    );
};

export default TorrentList;
