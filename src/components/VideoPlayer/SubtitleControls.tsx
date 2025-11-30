import React, { useState } from 'react';
import { Box, Button, Select, MenuItem, FormControl, InputLabel, ListSubheader, Typography, Checkbox, FormControlLabel } from '@mui/material';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import type { FileData } from '../../services/apiClient';

interface SubtitleControlsProps {
    subtitles: Array<{ label: string; src: string; srcLang: string }>;
    availableFiles?: FileData[];
    onSubtitleUpload?: (file: File) => void;
    onLoadSubtitle?: (file: FileData) => void;
}

const SubtitleControls: React.FC<SubtitleControlsProps> = ({
    subtitles,
    availableFiles = [],
    onSubtitleUpload,
    onLoadSubtitle
}) => {
    const [selectedTrack, setSelectedTrack] = useState<string>('none');
    const [showAllLanguages, setShowAllLanguages] = useState<boolean>(false);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onSubtitleUpload) {
            onSubtitleUpload(file);
        }
    };

    const handleTrackChange = (value: string) => {
        if (value.startsWith('available-')) {
            const index = parseInt(value.replace('available-', ''));
            // Use filtered files to get the correct index
            const file = filteredAvailableFiles[index];
            if (file && onLoadSubtitle) {
                onLoadSubtitle(file);
            }
        } else {
            setSelectedTrack(value);
        }
    };

    // Helper to parse language from filename for display
    const getLanguageLabel = (filename: string): string => {
        const lower = filename.toLowerCase();
        
        // English patterns
        if (lower.includes('eng') || lower.includes('en.') || lower.includes('.en') || lower.includes('english')) {
            return 'English';
        }
        
        // Spanish patterns
        if (lower.includes('spa') || lower.includes('es.') || lower.includes('spanish')) {
            return 'Spanish';
        }
        
        // French patterns
        if (lower.includes('fre') || lower.includes('fr.') || lower.includes('french')) {
            return 'French';
        }
        
        // German patterns
        if (lower.includes('ger') || lower.includes('de.') || lower.includes('german')) {
            return 'German';
        }
        
        // Italian patterns
        if (lower.includes('ita') || lower.includes('it.') || lower.includes('italian')) {
            return 'Italian';
        }
        
        // Portuguese patterns
        if (lower.includes('por') || lower.includes('pt.') || lower.includes('portuguese')) {
            return 'Portuguese';
        }
        
        // Russian patterns
        if (lower.includes('rus') || lower.includes('ru.') || lower.includes('russian')) {
            return 'Russian';
        }
        
        // Hindi patterns
        if (lower.includes('hin') || lower.includes('hi.') || lower.includes('hindi')) {
            return 'Hindi';
        }
        
        // Norwegian patterns
        if (lower.includes('nor') || lower.includes('no.') || lower.includes('norwegian')) {
            return 'Norwegian';
        }
        
        // Dutch patterns
        if (lower.includes('dut') || lower.includes('nl.') || lower.includes('dutch')) {
            return 'Dutch';
        }
        
        // Polish patterns
        if (lower.includes('pol') || lower.includes('pl.') || lower.includes('polish')) {
            return 'Polish';
        }
        
        // Swedish patterns
        if (lower.includes('swe') || lower.includes('sv.') || lower.includes('swedish')) {
            return 'Swedish';
        }
        
        // Turkish patterns
        if (lower.includes('tur') || lower.includes('tr.') || lower.includes('turkish')) {
            return 'Turkish';
        }
        
        // Czech patterns
        if (lower.includes('cze') || lower.includes('cs.') || lower.includes('czech')) {
            return 'Czech';
        }
        
        // Danish patterns
        if (lower.includes('dan') || lower.includes('da.') || lower.includes('danish')) {
            return 'Danish';
        }
        
        // Greek patterns
        if (lower.includes('gre') || lower.includes('el.') || lower.includes('greek')) {
            return 'Greek';
        }
        
        // Finnish patterns
        if (lower.includes('fin') || lower.includes('fi.') || lower.includes('finnish')) {
            return 'Finnish';
        }
        
        // Indonesian patterns
        if (lower.includes('ind') || lower.includes('id.') || lower.includes('indonesian')) {
            return 'Indonesian';
        }
        
        // Try to extract language name from filename (e.g., "11_Indonesian.srt" -> "Indonesian")
        const languageMatch = lower.match(/_([a-z]+)\./);
        if (languageMatch) {
            const lang = languageMatch[1];
            // Capitalize first letter
            return lang.charAt(0).toUpperCase() + lang.slice(1);
        }
        
        // If no pattern matches, return "Unknown" instead of defaulting to English
        return 'Unknown';
    };

    // Helper to check if a file is English (strict - only return true if English is explicitly detected)
    const isEnglish = (filename: string): boolean => {
        const lower = filename.toLowerCase();
        return lower.includes('eng') || 
               lower.includes('en.') || 
               lower.includes('.en') ||
               lower.includes('english');
    };

    // Filter available files based on language preference
    const filteredAvailableFiles = showAllLanguages 
        ? availableFiles 
        : availableFiles.filter(file => isEnglish(file.name));

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 2 }, 
                alignItems: 'center',
                flexWrap: 'nowrap',
                p: { xs: 1.5, sm: 2 },
                bgcolor: 'background.paper',
                width: '100%'
            }}
        >
            <SubtitlesIcon sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />

            <FormControl 
                size="small" 
                sx={{ 
                    minWidth: { xs: 100, sm: 250 },
                    flex: { xs: '1 1 auto', sm: '0 0 auto' }, // Dynamic width on mobile, fixed on desktop
                    flexShrink: 1, // Allow to shrink on mobile
                    maxWidth: { xs: 'none', sm: 'none' }
                }}
            >
                <InputLabel>Subtitles</InputLabel>
                <Select
                    value={selectedTrack}
                    label="Subtitles"
                    onChange={(e) => handleTrackChange(e.target.value)}
                >
                    <MenuItem value="none">Off</MenuItem>

                    {subtitles.length > 0 && [
                        <ListSubheader key="loaded-header">Loaded</ListSubheader>,
                        ...subtitles.map((sub, index) => (
                            <MenuItem key={`loaded-${index}`} value={index.toString()}>
                                {sub.label}
                            </MenuItem>
                        ))
                    ]}

                    {filteredAvailableFiles.length > 0 && [
                        <ListSubheader key="available-header">Available from Torrent</ListSubheader>,
                        ...filteredAvailableFiles.map((file, index) => (
                            <MenuItem key={`available-${index}`} value={`available-${index}`}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                                        {getLanguageLabel(file.name)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1, maxWidth: 100 }} noWrap>
                                        {file.name}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))
                    ]}
                </Select>
            </FormControl>

            <Button
                component="label"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                size="small"
                sx={{ 
                    flexShrink: 0, // Never shrink
                    whiteSpace: 'nowrap',
                    height: '40px',
                    minHeight: '40px',
                    maxHeight: '40px',
                    minWidth: { xs: 'auto', sm: 'auto' },
                    px: { xs: 1.5, sm: 2 }
                }}
            >
                Upload
                <input
                    type="file"
                    hidden
                    accept=".srt,.vtt"
                    onChange={handleFileSelect}
                />
            </Button>

            {availableFiles.length > 0 && (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={showAllLanguages}
                            onChange={(e) => setShowAllLanguages(e.target.checked)}
                            size="small"
                        />
                    }
                    label="Show all languages"
                    sx={{ 
                        ml: { xs: 0, sm: 1 },
                        display: { xs: 'none', sm: 'flex' }
                    }}
                />
            )}
        </Box>
    );
};

export default SubtitleControls;
