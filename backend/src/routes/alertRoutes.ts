import { Router } from 'express';
import { createAlert, getAlerts, deleteAlert } from '../controllers/alertController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all alert routes
router.use(protect);

router.post('/', createAlert);
router.get('/', getAlerts);
router.delete('/:id', deleteAlert);

export default router;
