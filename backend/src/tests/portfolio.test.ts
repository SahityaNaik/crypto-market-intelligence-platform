import { describe, it, expect } from 'vitest';
import { calculatePnL } from '../utils/portfolioUtils';

describe('Portfolio Utilities', () => {
  it('calculates profit correctly for a 10% gain', () => {
    const position = { buyPrice: 60000, amount: 0.1 };
    const currentPrice = 66000;
    
    const result = calculatePnL(currentPrice, position);
    
    expect(result.cost).toBe(6000);
    expect(result.currentValue).toBe(6600);
    expect(result.pnlValue).toBe(600);
    expect(result.pnlPercentage).toBe(10);
  });

  it('calculates loss correctly for a 50% drop', () => {
    const position = { buyPrice: 100, amount: 10 };
    const currentPrice = 50;
    
    const result = calculatePnL(currentPrice, position);
    
    expect(result.pnlPercentage).toBe(-50);
    expect(result.pnlValue).toBe(-500);
  });

  it('handles zero cost position', () => {
    const position = { buyPrice: 0, amount: 10 };
    const currentPrice = 100;
    
    const result = calculatePnL(currentPrice, position);
    
    expect(result.pnlPercentage).toBe(0);
  });
});
