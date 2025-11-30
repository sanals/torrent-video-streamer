import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface BufferOverlayProps {
    show: boolean;
    bufferPercent?: number;
}

const BufferOverlay: React.FC<BufferOverlayProps> = ({ show, bufferPercent }) => {
    if (!show) return null;

    return (
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
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 10,
                backdropFilter: 'blur(4px)',
            }}
        >
            <CircularProgress 
                size={60} 
                thickness={4}
                variant={bufferPercent !== undefined && bufferPercent > 0 ? "determinate" : "indeterminate"}
                value={bufferPercent !== undefined ? Math.min(100, Math.max(0, bufferPercent)) : undefined}
            />
            <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
                Buffering...
            </Typography>
            {bufferPercent !== undefined && bufferPercent > 0 && (
                <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.7)' }}>
                    {Math.round(Math.min(100, Math.max(0, bufferPercent)))}% buffered
                </Typography>
            )}
        </Box>
    );
};

export default BufferOverlay;
