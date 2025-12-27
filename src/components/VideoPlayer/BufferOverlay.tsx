import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Box, Typography, Fade, IconButton, Tooltip, LinearProgress } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

interface BufferOverlayProps {
    show: boolean;
    bufferPercent?: number;
    downloadSpeed?: number;
    progress?: number;
    numPeers?: number;
    isDownloading?: boolean;
    isFullscreen?: boolean;
}

const BufferOverlay: React.FC<BufferOverlayProps> = ({
    show,
    bufferPercent,
    downloadSpeed,
    progress,
    numPeers,
    isDownloading = false,
    isFullscreen = false,
}) => {
    const [showStats, setShowStats] = useState(true);

    // Format speed (bytes/sec to MB/s or KB/s)
    const formatSpeed = (bytes: number) => {
        if (!bytes) return '0 B/s';
        if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB/s`;
        if (bytes > 1024) return `${(bytes / 1024).toFixed(0)} KB/s`;
        return `${bytes} B/s`;
    };

    const hasStats = typeof downloadSpeed === 'number' || typeof progress === 'number';
    const shouldShowStatsPanel = hasStats && (isDownloading || show) && showStats;
    const isActivelyDownloading = (downloadSpeed ?? 0) > 0;

    // In fullscreen, use fixed positioning to overlay on top of the fullscreen video
    const positionStyle = isFullscreen ? 'fixed' : 'absolute';

    const overlayContent = (
        <>
            {/* Toggle button - always visible when stats available */}
            {hasStats && (isDownloading || show) && (
                <Tooltip title={showStats ? "Hide download stats" : "Show download stats"}>
                    <IconButton
                        size="small"
                        onClick={() => setShowStats(!showStats)}
                        sx={{
                            position: positionStyle,
                            top: 12,
                            right: 12,
                            zIndex: 2147483647, // Max z-index for fullscreen
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.8)',
                            },
                        }}
                    >
                        {showStats ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                </Tooltip>
            )}

            {/* Download stats badge - top right corner - SINGLE LINE */}
            <Fade in={shouldShowStatsPanel} timeout={{ enter: 200, exit: 300 }}>
                <Box
                    sx={{
                        position: positionStyle,
                        top: 12,
                        right: 52, // Leave room for toggle button
                        zIndex: 2147483646,
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        borderRadius: 1,
                        px: 1.5,
                        py: 0.5,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 1.5,
                        pointerEvents: 'none',
                    }}
                >
                    {/* Download speed */}
                    {typeof downloadSpeed === 'number' && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: isActivelyDownloading ? '#4caf50' : 'rgba(255,255,255,0.6)',
                                fontWeight: 'bold',
                                fontFamily: 'monospace',
                                fontSize: '0.8rem',
                            }}
                        >
                            ⬇ {formatSpeed(downloadSpeed)}
                        </Typography>
                    )}

                    {/* Progress and peers */}
                    {typeof progress === 'number' && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '0.75rem',
                            }}
                        >
                            {progress.toFixed(1)}% • {numPeers || 0} peers
                        </Typography>
                    )}

                    {/* Buffer status */}
                    {bufferPercent !== undefined && bufferPercent > 0 && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'rgba(255,255,255,0.5)',
                                fontSize: '0.7rem',
                            }}
                        >
                            {Math.round(Math.min(100, Math.max(0, bufferPercent)))}% buffered
                        </Typography>
                    )}
                </Box>
            </Fade>

            {/* Progress line at top - only when actually buffering */}
            <Fade in={show} timeout={{ enter: 200, exit: 400 }}>
                <Box
                    sx={{
                        position: positionStyle,
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 2147483645,
                    }}
                >
                    <LinearProgress
                        variant="indeterminate"
                        sx={{
                            height: 3,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: '#9c27b0',
                            },
                        }}
                    />
                </Box>
            </Fade>

            {/* Buffering text overlay - only when waiting */}
            <Fade in={show} timeout={{ enter: 300, exit: 400 }}>
                <Box
                    sx={{
                        position: positionStyle,
                        bottom: isFullscreen ? 80 : 60, // Higher in fullscreen for controls
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 2147483644,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        pointerEvents: 'none',
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'white',
                            fontWeight: 500,
                        }}
                    >
                        Buffering...
                    </Typography>
                </Box>
            </Fade>
        </>
    );

    // When in fullscreen, render as a portal to document.body so it appears on top
    if (isFullscreen) {
        return ReactDOM.createPortal(overlayContent, document.body);
    }

    return overlayContent;
};

export default BufferOverlay;
