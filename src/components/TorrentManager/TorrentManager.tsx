import React from 'react';
import { Box } from '@mui/material';
import TorrentInput from './TorrentInput';
import TorrentList from './TorrentList';
import type { TorrentData } from '@/services/apiClient';

interface TorrentManagerProps {
    torrents: TorrentData[];
    onAddTorrent: (magnetURI: string) => void;
    onRemoveTorrent: (infoHash: string) => void;
    onPlayFile: (infoHash: string, fileIndex: number, fileName: string) => void;
    isAdding: boolean;
}

const TorrentManager: React.FC<TorrentManagerProps> = ({
    torrents,
    onAddTorrent,
    onRemoveTorrent,
    onPlayFile,
    isAdding,
}) => {
    return (
        <Box>
            <TorrentInput onAdd={onAddTorrent} isAdding={isAdding} />
            <TorrentList
                torrents={torrents}
                onRemoveTorrent={onRemoveTorrent}
                onPlayFile={onPlayFile}
            />
        </Box>
    );
};

export default TorrentManager;
