import { Router } from 'express';
import * as priceController from '../controllers/priceController.js';

const router = Router();

/**
 * @swagger
 * /api/prices/live:
 *   get:
 *     summary: Get live prices for all tracked assets
 *     tags: [Prices]
 *     responses:
 *       200: { description: List of live prices }
 */
router.get('/live', priceController.getLivePrices);

/**
 * @swagger
 * /api/prices/history/{coinId}:
 *   get:
 *     summary: Get historical price data for a specific coin
 *     tags: [Prices]
 *     parameters:
 *       - in: path
 *         name: coinId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Price history and stats }
 */
router.get('/history/:coinId', priceController.getPriceHistory);

/**
 * @swagger
 * /api/prices/correlations:
 *   get:
 *     summary: Get correlation matrix between all assets
 *     tags: [Prices]
 *     responses:
 *       200: { description: Correlation matrix JSON }
 */
router.get('/correlations', priceController.getCorrelations);

export default router;
