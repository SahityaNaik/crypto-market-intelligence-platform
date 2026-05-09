import { Router } from 'express';
import { addPosition, getPortfolio } from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all portfolio routes - only authenticated users can manage their portfolio
router.use(protect);

router.post('/positions', addPosition);
router.get('/', getPortfolio);

export default router;
