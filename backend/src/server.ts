import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { prisma } from './lib/prisma.js';
import { cacheService } from './services/cacheService.js';
import authRoutes from './routes/authRoutes.js';

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

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for price updates from the worker
  socket.on('workerUpdate', (data) => {
    console.log(`[Socket] Received prices from worker. Updating cache and broadcasting...`);
    
    // 1. Update the in-memory cache
    cacheService.setPrices(data);
    
    // 2. Broadcast the new prices to all connected frontend clients
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
    
    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch history', message: error.message });
  }
});

// Start the HTTP server instead of the app
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
