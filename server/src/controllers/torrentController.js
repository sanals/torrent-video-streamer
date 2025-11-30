import torrentManager from '../torrent/TorrentManager.js';

/**
 * Add a new torrent
 */
export async function addTorrent(req, res, next) {
    try {
        const { magnetURI } = req.body;

        if (!magnetURI) {
            return res.status(400).json({
                success: false,
                error: 'magnetURI is required',
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
