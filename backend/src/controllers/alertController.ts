import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { cacheService } from '../services/cacheService.js';

export const createAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { coinId, condition, targetPrice } = req.body;
    const userId = req.userId!;

    const prices = cacheService.getPrices();
    const currentPrice = prices[coinId]?.usd;
    
    let isTriggeredInstantly = false;
    if (currentPrice) {
      if (condition === 'above' && currentPrice >= parseFloat(targetPrice)) isTriggeredInstantly = true;
      if (condition === 'below' && currentPrice <= parseFloat(targetPrice)) isTriggeredInstantly = true;
    }

    const alert = await prisma.alert.create({
      data: {
        userId,
        coinId,
        condition,
        targetPrice: parseFloat(targetPrice),
        isActive: !isTriggeredInstantly,
        triggeredAt: isTriggeredInstantly ? new Date() : null
      }
    });

    res.status(201).json({
      ...alert,
      isTriggeredInstantly,
      currentPrice
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    await prisma.alert.deleteMany({
      where: { id: id as string, userId }
    });

    res.json({ message: 'Alert deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
