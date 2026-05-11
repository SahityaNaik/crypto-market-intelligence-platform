import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { cacheService } from '../services/cacheService.js';

export const addPosition = async (req: AuthRequest, res: Response) => {
  try {
    const { coinId, quantity, purchasePrice } = req.body;
    const userId = req.userId!;

    const position = await prisma.portfolioPosition.create({
      data: {
        userId,
        coinId,
        quantity: parseFloat(quantity),
        purchasePrice: parseFloat(purchasePrice)
      }
    });

    res.status(201).json(position);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPortfolio = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const positions = await prisma.portfolioPosition.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const livePrices = cacheService.getPrices();

    // Enrich positions with live price and P&L data
    const enrichedPositions = positions.map(pos => {
      const liveData = livePrices[pos.coinId];
      const currentPrice = liveData?.usd || pos.purchasePrice;
      const currentValue = pos.quantity * currentPrice;
      const costBasis = pos.quantity * pos.purchasePrice;
      const profitLoss = currentValue - costBasis;
      const profitLossPercentage = costBasis !== 0 ? (profitLoss / costBasis) * 100 : 0;

      return {
        ...pos,
        currentPrice,
        currentValue,
        profitLoss,
        profitLossPercentage
      };
    });

    res.json(enrichedPositions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const removePosition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    await prisma.portfolioPosition.deleteMany({
      where: { id: id as string, userId }
    });

    res.json({ message: 'Position removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

