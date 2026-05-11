export interface Position {
  buyPrice: number;
  amount: number;
}

export const calculatePnL = (currentPrice: number, position: Position) => {
  const cost = position.buyPrice * position.amount;
  const currentValue = currentPrice * position.amount;
  const pnlValue = currentValue - cost;
  const pnlPercentage = cost === 0 ? 0 : (pnlValue / cost) * 100;

  return {
    cost,
    currentValue,
    pnlValue,
    pnlPercentage
  };
};
