import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAlerts } from '../services/alertService';
import { prisma } from '../lib/prisma';

// Mock the prisma client
vi.mock('../lib/prisma', () => ({
  prisma: {
    alert: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Alert Engine Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('alert triggers when price crosses threshold', async () => {
    const mockAlert = {
      id: 'alert-123',
      userId: 'user-456',
      coinId: 'bitcoin',
      condition: 'above',
      targetPrice: 45000,
      isActive: true,
    };

    // 1. Mock finding active alerts
    (prisma.alert.findMany as any).mockResolvedValue([mockAlert]);
    
    // 2. Simulate price update 
    const mockData = {
      bitcoin: { usd: 46000 }
    };

    const mockIo = {
      emit: vi.fn()
    };

    // 3. Run the alert checker
    await checkAlerts(mockData, mockIo);

    // 4. Verify the alert was updated in DB
    expect(prisma.alert.update).toHaveBeenCalledWith({
      where: { id: mockAlert.id },
      data: expect.objectContaining({
        isActive: false,
        triggeredAt: expect.any(Date)
      })
    });

    // 5. Verify WebSocket notification was sent
    expect(mockIo.emit).toHaveBeenCalledWith(`alertTriggered:${mockAlert.userId}`, expect.objectContaining({
      coinId: 'bitcoin',
      price: 46000,
      condition: 'above',
      targetPrice: 45000
    }));
  });

  it('alert does not trigger if price is below threshold (condition: above)', async () => {
    const mockAlert = {
      id: 'alert-123',
      userId: 'user-456',
      coinId: 'bitcoin',
      condition: 'above',
      targetPrice: 45000,
      isActive: true,
    };

    (prisma.alert.findMany as any).mockResolvedValue([mockAlert]);
    
    const mockData = {
      bitcoin: { usd: 44000 } // Below threshold
    };

    await checkAlerts(mockData);

    expect(prisma.alert.update).not.toHaveBeenCalled();
  });

  it('alert triggers when price drops below threshold (condition: below)', async () => {
    const mockAlert = {
      id: 'alert-789',
      userId: 'user-456',
      coinId: 'ethereum',
      condition: 'below',
      targetPrice: 2000,
      isActive: true,
    };

    (prisma.alert.findMany as any).mockResolvedValue([mockAlert]);
    
    const mockData = {
      ethereum: { usd: 1950 } // Below threshold
    };

    await checkAlerts(mockData);

    expect(prisma.alert.update).toHaveBeenCalledWith({
      where: { id: mockAlert.id },
      data: expect.objectContaining({
        isActive: false
      })
    });
  });
});
