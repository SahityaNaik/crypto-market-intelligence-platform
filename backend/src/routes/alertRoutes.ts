import { Router } from 'express';
import * as alertController from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createAlertSchema } from '../utils/schemas.js';

const router = Router();

router.use(protect);

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new price alert
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coinId, condition, targetPrice]
 *             properties:
 *               coinId: { type: string }
 *               condition: { type: string, enum: [above, below] }
 *               targetPrice: { type: number }
 *     responses:
 *       201: { description: Alert created }
 *   get:
 *     summary: Get all alerts for the authenticated user
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of alerts }
 */
router.post('/', validate(createAlertSchema), alertController.createAlert);
router.get('/', alertController.getAlerts);

/**
 * @swagger
 * /api/alerts/{id}:
 *   delete:
 *     summary: Delete a price alert
 *     tags: [Alerts]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Alert deleted }
 */
router.delete('/:id', alertController.deleteAlert);

export default router;
