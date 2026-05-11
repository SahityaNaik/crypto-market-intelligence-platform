import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { cacheService } from '../services/cacheService.js';

export const getLivePrices = (req: Request, res: Response) => {
  try {
    const prices = cacheService.getPrices();
    res.status(200).json(prices);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch live prices' });
  }
};

export const getPriceHistory = async (req: Request, res: Response) => {
  const coinId = req.params.coinId as string;
  
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const history = await prisma.priceHistory.findMany({
      where: {
        coinId: coinId,
        timestamp: {
          gte: twentyFourHoursAgo
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Calculate detailed stats for the selected period
    const prices = history.map(h => h.price);
    const high = prices.length > 0 ? Math.max(...prices) : 0;
    const low = prices.length > 0 ? Math.min(...prices) : 0;
    
    // Calculate Volatility (Standard Deviation)
    let volatility = 0;
    if (prices.length > 1) {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const squareDiffs = prices.map(p => Math.pow(p - avg, 2));
      const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
      volatility = (Math.sqrt(avgSquareDiff) / avg) * 100;  
    }
    
    res.status(200).json({
      history,
      stats: { high, low, volatility }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch history', message: error.message });
  }
};

export const getCorrelations = async (req: Request, res: Response) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const history = await prisma.priceHistory.findMany({
      where: { timestamp: { gte: twentyFourHoursAgo } },
      orderBy: { timestamp: 'asc' }
    });

    const coinIds = [...new Set(history.map(h => h.coinId))];
    const dataByCoin: { [id: string]: number[] } = {};
    
    // Group prices
    coinIds.forEach(id => {
      dataByCoin[id] = history.filter(h => h.coinId === id).map(h => h.price);
    });

    const matrix: any[] = [];
    
    coinIds.forEach(id1 => {
      const row: any = { coin: id1 };
      coinIds.forEach(id2 => {
        const prices1 = dataByCoin[id1];
        const prices2 = dataByCoin[id2];
        
        const minLen = Math.min(prices1.length, prices2.length);
        if (minLen < 2) {
          row[id2] = 1;
          return;
        }

        const p1 = prices1.slice(0, minLen);
        const p2 = prices2.slice(0, minLen);
        
        const sum1 = p1.reduce((a, b) => a + b, 0);
        const sum2 = p2.reduce((a, b) => a + b, 0);
        const sum1Sq = p1.reduce((a, b) => a + (b * b), 0);
        const sum2Sq = p2.reduce((a, b) => a + (b * b), 0);
        const pSum = p1.reduce((acc, val, i) => acc + (val * p2[i]), 0);
        
        const num = pSum - (sum1 * sum2 / minLen);
        const den = Math.sqrt((sum1Sq - (sum1 * sum1) / minLen) * (sum2Sq - (sum2 * sum2) / minLen));
        
        row[id2] = den === 0 ? 0 : parseFloat((num / den).toFixed(2));
      });
      matrix.push(row);
    });

    res.status(200).json(matrix);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to calculate correlations' });
  }
};
