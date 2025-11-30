import React from 'react';
import { Box } from '@mui/material';
import TorrentInput from './TorrentInput';
import TorrentList from './TorrentList';
import type { TorrentData } from '@/services/apiClient';

interface TorrentManagerProps {
    torrents: TorrentData[];
    onAddTorrent: (magnetURI: string, torrentFile?: File) => void;
    onRemoveTorrent: (infoHash: string, deleteData: boolean) => void; // Modified signature
    onPlayFile: (infoHash: string, fileIndex: number, fileName: string) => void;
    onPauseTorrent: (infoHash: string) => void; // New prop
    onResumeTorrent: (infoHash: string) => void; // New prop
    isAdding: boolean;
    currentVideo: { infoHash: string; fileIndex: number; name: string; url: string } | null;
}

const TorrentManager: React.FC<TorrentManagerProps> = ({
    torrents,
    onAddTorrent,
    onRemoveTorrent,
    onPlayFile,
    onPauseTorrent, // Destructure new prop
    onResumeTorrent, // Destructure new prop
    isAdding,
    currentVideo,
}) => {
    return (
        <Box>
            <TorrentInput onAdd={onAddTorrent} isAdding={isAdding} />
            <TorrentList
                torrents={torrents}
                onRemoveTorrent={onRemoveTorrent}
                onPlayFile={onPlayFile}
                onPauseTorrent={onPauseTorrent} // Pass new prop
                onResumeTorrent={onResumeTorrent} // Pass new prop
                currentVideo={currentVideo}
            />
        </Box>
    );
};

export default TorrentManager;
