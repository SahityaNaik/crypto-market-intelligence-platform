import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { prisma } from './lib/prisma.js';
import { cacheService } from './services/cacheService.js';
import authRoutes from './routes/authRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import priceRoutes from './routes/priceRoutes.js';
import { checkAlerts } from './services/alertService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server to wrap Express app
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Crypto Market Intelligence API',
      version: '1.0.0',
      description: 'An API for real-time crypto tracking, portfolio management, and alerts.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware
app.use(cors());
app.use(express.json());

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/prices', priceRoutes);




// Socket.io connection logic
io.on('connection', (socket) => {
  socket.on('workerUpdate', async (data) => {
    cacheService.setPrices(data);
    await checkAlerts(data, io);
    io.emit('priceUpdate', data);
  });
});

// Health check endpoint
app.get('/api/admin/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API Server is running with WebSockets' });
});

// Create demo user if not exists
const ensureDemoUser = async () => {
  const demoEmail = 'demo@kuvaka.io';
  const user = await prisma.user.findUnique({ where: { email: demoEmail } });
  if (!user) {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    await prisma.user.create({
      data: {
        email: demoEmail,
        password: hashedPassword,
        name: 'Kuvaka Demo User'
      }
    });
    console.log('✅ Demo user ready: demo@kuvaka.io');
  }
};

httpServer.listen(PORT, async () => {
  await ensureDemoUser();
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});
