import { prisma } from '../lib/prisma.js';

export const checkAlerts = async (data: any, io?: any) => {
  try {
    const activeAlerts = await prisma.alert.findMany({
      where: { isActive: true }
    });

    for (const alert of activeAlerts) {
      const currentPrice = data[alert.coinId]?.usd;
      if (!currentPrice) continue;

      let triggered = false;
      if (alert.condition === 'above' && currentPrice >= alert.targetPrice) triggered = true;
      if (alert.condition === 'below' && currentPrice <= alert.targetPrice) triggered = true;

      if (triggered) {
        console.log(`[Alert] Triggered for user ${alert.userId}: ${alert.coinId} is ${alert.condition} ${alert.targetPrice}`);
        
        await prisma.alert.update({
          where: { id: alert.id },
          data: { isActive: false, triggeredAt: new Date() }
        });

        if (io) {
          io.emit(`alertTriggered:${alert.userId}`, {
            id: alert.id,
            coinId: alert.coinId,
            price: currentPrice,
            condition: alert.condition,
            targetPrice: alert.targetPrice
          });
        }
      }
    }
  } catch (err) {
    console.error('Error checking alerts:', err);
  }
};
