import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { prisma } from './lib/prisma.js';
import { cacheService } from './services/cacheService.js';
import authRoutes from './routes/authRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import alertRoutes from './routes/alertRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server to wrap Express app
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Alert checking engine
const checkAlerts = async (data: any) => {
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
        
        // 1. Mark as triggered
        await prisma.alert.update({
          where: { id: alert.id },
          data: { isActive: false, triggeredAt: new Date() }
        });

        // 2. Broadcast to the user
        io.emit(`alertTriggered:${alert.userId}`, {
          id: alert.id,
          coinId: alert.coinId,
          price: currentPrice,
          condition: alert.condition,
          targetPrice: alert.targetPrice
        });
      }
    }
  } catch (err) {
    console.error('Error checking alerts:', err);
  }
};

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for price updates from the worker
  socket.on('workerUpdate', async (data) => {
    console.log(`[Socket] Received prices from worker. Updating cache and broadcasting...`);
    
    // 1. Update the in-memory cache
    cacheService.setPrices(data);
    
    // 2. Check for triggered alerts
    await checkAlerts(data);
    
    // 3. Broadcast the new prices to all connected frontend clients
    io.emit('priceUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// --- REST API Endpoints ---

// 1. Basic health check endpoint
app.get('/api/admin/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API Server is running with WebSockets' });
});

// 2. Get live prices from cache
app.get('/api/prices/live', (req, res) => {
  res.status(200).json(cacheService.getPrices());
});

// 3. Get historical prices for a coin (Last 24 hours)
app.get('/api/prices/history/:coinId', async (req, res: any) => {
  const { coinId } = req.params;
  
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
});

// Start the HTTP server instead of the app
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
