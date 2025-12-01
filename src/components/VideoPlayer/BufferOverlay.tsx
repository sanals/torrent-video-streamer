import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

interface BufferOverlayProps {
    show: boolean;
    bufferPercent?: number;
}

const BufferOverlay: React.FC<BufferOverlayProps> = ({ show, bufferPercent }) => {
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
