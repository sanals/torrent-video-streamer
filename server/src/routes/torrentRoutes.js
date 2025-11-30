import { Router } from 'express';
import * as torrentController from '../controllers/torrentController.js';

const router = Router();

// POST /api/torrents - Add new torrent
router.post('/torrents', torrentController.addTorrent);

// GET /api/torrents - Get all torrents
router.get('/torrents', torrentController.getAllTorrents);

// GET /api/torrents/:infoHash - Get specific torrent
router.get('/torrents/:infoHash', torrentController.getTorrent);

// GET /api/torrents/:infoHash/progress - Get torrent progress
router.get('/torrents/:infoHash/progress', torrentController.getTorrentProgress);

// DELETE /api/torrents/:infoHash - Remove torrent
router.delete('/torrents/:infoHash', torrentController.removeTorrent);

export default router;
