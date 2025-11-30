import { Router } from 'express';
import * as streamController from '../controllers/streamController.js';

const router = Router();

// GET /api/stream/:infoHash/:fileIndex - Stream video file
router.get('/stream/:infoHash/:fileIndex', streamController.streamVideo);

export default router;
