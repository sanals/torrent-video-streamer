import { Router } from 'express';
import * as searchController from '../controllers/searchController.js';

const router = Router();

// GET /api/search - Search torrents
router.get('/search', searchController.searchTorrents);

// GET /api/search/categories - Get available categories
router.get('/search/categories', searchController.getCategories);

export default router;
