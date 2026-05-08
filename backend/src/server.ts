import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

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

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for price updates from the worker
  socket.on('workerUpdate', (data) => {
    console.log(`[Socket] Received prices from worker. Broadcasting to clients...`);
    // Broadcast the new prices to all connected frontend clients
    io.emit('priceUpdate', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Basic health check endpoint
app.get('/api/admin/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API Server is running with WebSockets' });
});

// Start the HTTP server instead of the app
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
