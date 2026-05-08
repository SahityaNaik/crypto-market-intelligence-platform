import cron from 'node-cron';
import axios from 'axios';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { io } from 'socket.io-client';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Connect to our backend server via Socket.io
const socket = io('http://localhost:4000');

socket.on('connect', () => {
  console.log('Worker connected to Socket.io server');
});

// The 10 coins we want to track
const COIN_IDS = [
  'bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano',
  'solana', 'polkadot', 'dogecoin', 'tron', 'chainlink'
];

console.log('Worker started. Will fetch CoinGecko data every 10 seconds...');

// The cron syntax for every 10 seconds is '*/10 * * * * *'
cron.schedule('*/10 * * * * *', async () => {
  try {
    console.log(`\n[${new Date().toISOString()}] Fetching prices from CoinGecko...`);
    
    // CoinGecko simple/price endpoint
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COIN_IDS.join(',')}&vs_currencies=usd`;
    
    const response = await axios.get(url);
    const data = response.data;
    
    let savedCount = 0;
    
    // Save each price to PostgreSQL via Prisma
    for (const coinId of COIN_IDS) {
      if (data[coinId] && data[coinId].usd) {
        await prisma.priceHistory.create({
          data: {
            coinId: coinId,
            price: data[coinId].usd,
          }
        });
        savedCount++;
      }
    }
    
    console.log(`[${new Date().toISOString()}] Successfully saved prices for ${savedCount} coins.`);

    // Broadcast the new prices to the server via WebSockets
    socket.emit('workerUpdate', data);
  } catch (error: any) {
    console.error('Error fetching from CoinGecko:', error.message);
  }
});
