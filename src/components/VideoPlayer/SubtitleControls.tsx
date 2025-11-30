import React, { useState } from 'react';
import { Box, Button, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import UploadFileIcon from '@mui/icons-material/UploadFile';

interface SubtitleControlsProps {
    subtitles: Array<{ label: string; src: string; srcLang: string }>;
    onSubtitleUpload?: (file: File) => void;
}

const SubtitleControls: React.FC<SubtitleControlsProps> = ({ subtitles, onSubtitleUpload }) => {
    const [selectedTrack, setSelectedTrack] = useState<string>('none');

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onSubtitleUpload) {
            onSubtitleUpload(file);
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, bgcolor: 'background.paper' }}>
            <SubtitlesIcon />

            <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Subtitles</InputLabel>
                <Select
                    value={selectedTrack}
                    label="Subtitles"
                    onChange={(e) => setSelectedTrack(e.target.value)}
                >
                    <MenuItem value="none">None</MenuItem>
                    {subtitles.map((sub, index) => (
                        <MenuItem key={index} value={index.toString()}>
                            {sub.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {subtitles.length > 0 && (
                <Chip
                    label={`${subtitles.length} available`}
                    size="small"
                    color="primary"
                    variant="outlined"
                />
            )}

            <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                size="small"
            >
                Upload SRT/VTT
                <input
                    type="file"
                    hidden
                    accept=".srt,.vtt"
                    onChange={handleFileSelect}
                />
            </Button>
        </Box>
    );
};

export default SubtitleControls;
