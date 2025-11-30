import torrentManager from '../torrent/TorrentManager.js';
import multer from 'multer';

// Configure multer for in-memory file storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for torrent files
    },
    fileFilter: (req, file, cb) => {
        // Accept .torrent files
        if (file.mimetype === 'application/x-bittorrent' || 
            file.originalname.endsWith('.torrent')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only .torrent files are allowed.'));
        }
    },
});

/**
 * Add a new torrent (supports both magnet URI and .torrent file)
 */
export async function addTorrent(req, res, next) {
    try {
        // Check if file was uploaded
        if (req.file) {
            // Handle .torrent file upload
            const torrentBuffer = req.file.buffer;
            const torrent = await torrentManager.addTorrentFile(torrentBuffer);
            
            return res.status(201).json({
                success: true,
                torrent,
            });
        }

        // Handle magnet URI
        const { magnetURI } = req.body;

        if (!magnetURI) {
            return res.status(400).json({
                success: false,
                error: 'Either magnetURI or torrent file is required',
            });
        }

        // Basic validation for magnet URI
        if (!magnetURI.startsWith('magnet:?')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid magnet URI format',
            });
        }

        const torrent = await torrentManager.addTorrent(magnetURI);

        res.status(201).json({
            success: true,
            torrent,
        });
    } catch (error) {
        next(error);
    }
}

// Export multer middleware for use in routes
export { upload };

/**
 * Get all torrents
 */
export async function getAllTorrents(req, res, next) {
    try {
        const torrents = torrentManager.getAllTorrents();

        res.json({
            success: true,
            torrents,
            count: torrents.length,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get specific torrent by infoHash
 */
export async function getTorrent(req, res, next) {
    try {
        const { infoHash } = req.params;
        const torrent = torrentManager.getTorrentByInfoHash(infoHash);

        if (!torrent) {
            return res.status(404).json({
                success: false,
                error: 'Torrent not found',
            });
        }

        res.json({
            success: true,
            torrent: torrentManager.serializeTorrent(torrent),
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Get torrent progress
 */
export async function getTorrentProgress(req, res, next) {
    try {
        const { infoHash } = req.params;
        const progress = torrentManager.getTorrentProgress(infoHash);

        if (!progress) {
            return res.status(404).json({
                success: false,
                error: 'Torrent not found',
            });
        }

        res.json({
            success: true,
            progress,
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Remove a torrent
 */
export async function removeTorrent(req, res, next) {
    try {
        const { infoHash } = req.params;
        const deleteData = req.query.deleteData === 'true';

        await torrentManager.removeTorrent(infoHash, deleteData);

        res.json({
            success: true,
            message: 'Torrent removed successfully',
        });
    } catch (error) {
        next(error);
    }
}

export async function pauseTorrent(req, res, next) {
    try {
        const { infoHash } = req.params;
        const success = torrentManager.pauseTorrent(infoHash);

        if (!success) {
            return res.status(404).json({ success: false, error: 'Torrent not found' });
        }

        res.json({ success: true, message: 'Torrent paused' });
    } catch (error) {
        next(error);
    }
}

export async function resumeTorrent(req, res, next) {
    try {
        const { infoHash } = req.params;
        const success = torrentManager.resumeTorrent(infoHash);

        if (!success) {
            return res.status(404).json({ success: false, error: 'Torrent not found' });
        }

        res.json({ success: true, message: 'Torrent resumed' });
    } catch (error) {
        next(error);
    }
}

/**
 * Prioritize a file for streaming (selective downloading)
 */
export async function prioritizeFile(req, res, next) {
    try {
        const { infoHash, fileIndex } = req.params;
        const fileIdx = parseInt(fileIndex, 10);
        const success = torrentManager.prioritizeFileForStreaming(infoHash, fileIdx);

        if (!success) {
            return res.status(404).json({ success: false, error: 'Torrent or file not found' });
        }

        res.json({ success: true, message: 'File prioritized for streaming' });
    } catch (error) {
        next(error);
    }
}

/**
 * Handle video play event (resume download if pause-on-pause is enabled)
 */
export async function onVideoPlay(req, res, next) {
    try {
        const { infoHash } = req.params;
        const success = torrentManager.resumeTorrentDownload(infoHash);

        res.json({ 
            success: true, 
            message: success ? 'Torrent download resumed' : 'Torrent not found or already active' 
        });
    } catch (error) {
        next(error);
    }
}

/**
 * Handle video pause event (pause download if pause-on-pause is enabled)
 */
export async function onVideoPause(req, res, next) {
    try {
        const { infoHash } = req.params;
        const success = torrentManager.pauseTorrentDownload(infoHash);

        res.json({ 
            success: true, 
            message: success ? 'Torrent download paused' : 'Torrent not found or already paused' 
        });
    } catch (error) {
        next(error);
    }
}
