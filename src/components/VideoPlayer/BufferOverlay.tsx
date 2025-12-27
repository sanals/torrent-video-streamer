import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

interface BufferOverlayProps {
    show: boolean;
    bufferPercent?: number;
    downloadSpeed?: number;
    progress?: number;
    numPeers?: number;
}

const BufferOverlay: React.FC<BufferOverlayProps> = ({
    show,
    bufferPercent,
    downloadSpeed,
    progress,
    numPeers
}) => {
    // Format speed (bytes/sec to MB/s or KB/s)
    const formatSpeed = (bytes: number) => {
        if (!bytes) return '0 B/s';
        if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`;
        if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB/s`;
        return `${bytes} B/s`;
    };

    return (
        <Fade in={show} timeout={{ enter: 300, exit: 400 }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 10,
                    pointerEvents: show ? 'auto' : 'none',
                }}
            >
                <CircularProgress
                    size={50}
                    thickness={3}
                    sx={{ color: 'white' }}
                />
                <Typography variant="body1" sx={{ mt: 2, color: 'white', fontWeight: 500 }}>
                    Buffering...
                </Typography>

                {/* Network Stats */}
                {typeof downloadSpeed === 'number' && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                            ⬇ {formatSpeed(downloadSpeed)}
                        </Typography>
                        {typeof progress === 'number' && (
                            <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.7)' }}>
                                {progress.toFixed(1)}% Downloaded • {numPeers || 0} Peers
                            </Typography>
                        )}
                    </Box>
                )}

                {bufferPercent !== undefined && bufferPercent > 0 && (
                    <Typography variant="caption" sx={{ mt: 0.5, color: 'rgba(255,255,255,0.7)' }}>
                        {Math.round(Math.min(100, Math.max(0, bufferPercent)))}% loaded
                    </Typography>
                )}
            </Box>
        </Fade>
    );
};

export default BufferOverlay;
