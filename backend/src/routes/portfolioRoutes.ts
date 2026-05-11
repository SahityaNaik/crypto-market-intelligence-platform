import { Router } from 'express';
import * as portfolioController from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { portfolioPositionSchema } from '../utils/schemas.js';

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/portfolio:
 *   get:
 *     summary: Get user portfolio with live P&L
 *     tags: [Portfolio]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of positions with live data }
 */
router.get('/', portfolioController.getPortfolio);

/**
 * @swagger
 * /api/portfolio/positions:
 *   post:
 *     summary: Add a new position to portfolio
 *     tags: [Portfolio]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coinId, quantity, purchasePrice]
 *             properties:
 *               coinId: { type: string }
 *               quantity: { type: number }
 *               purchasePrice: { type: number }
 *     responses:
 *       201: { description: Position added }
 */
router.post('/positions', validate(portfolioPositionSchema), portfolioController.addPosition);


/**
 * @swagger
 * /api/portfolio/{id}:
 *   delete:
 *     summary: Remove a position from portfolio
 *     tags: [Portfolio]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Position removed }
 */
router.delete('/:id', portfolioController.removePosition);

export default router;
