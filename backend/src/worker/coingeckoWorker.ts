import axios from 'axios';
import express from 'express';
import { prisma } from '../lib/prisma.js';
import dotenv from 'dotenv';
import { io } from 'socket.io-client';

dotenv.config();

// Connect to our backend server via Socket.io
const socket = io(process.env.SOCKET_URL || 'http://localhost:4000');

socket.on('connect', () => {
  console.log('Worker connected to Socket.io server');
});

// The 12 coins we want to track
const COIN_IDS = [
  'bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano',
  'solana', 'polkadot', 'dogecoin', 'tron', 'chainlink',
  'shiba-inu', 'avalanche-2'
];

let retryDelay = 10000; // Start with 10s

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAndProcess() {
  try {
    console.log(`\n[${new Date().toISOString()}] Fetching prices from CoinGecko...`);
    
    // CoinGecko simple/price endpoint
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: COIN_IDS.join(','),
        order: 'market_cap_desc',
        sparkline: true, 
        price_change_percentage: '24h'
      }
    });

    const data: any = {};
    response.data.forEach((coin: any) => {
      data[coin.id] = {
        usd: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        sparkline: coin.sparkline_in_7d.price.slice(-24), // Get last 24 points for 24h movement
      };
    });

    // Save prices to DB
    for (const coinId of Object.keys(data)) {
      if (data[coinId].usd !== null && data[coinId].usd !== undefined) {
        await prisma.priceHistory.create({
          data: {
            coinId: coinId,
            price: data[coinId].usd,
          }
        });
      } else {
        console.warn(`[Worker] Skipping price for ${coinId} because it returned null/undefined.`);
      }
    }

    console.log(`[${new Date().toISOString()}] Successfully saved prices for ${response.data.length} coins.`);

    // Filter out null prices before emitting to frontend
    const cleanUpdate: any = {};
    Object.keys(data).forEach(id => {
      if (data[id].usd !== null && data[id].usd !== undefined) {
        cleanUpdate[id] = data[id];
      }
    });

    // Emit the prices (including sparkline and 24h change) to the server via Socket.io
    socket.emit('workerUpdate', cleanUpdate);
    
    // Success! Reset backoff
    retryDelay = 10000;
  } catch (error: any) {
    if (error.response && error.response.status === 429) {
      // Exponential Backoff: Double the delay on every rate limit error (up to 5 mins)
      retryDelay = Math.min(retryDelay * 2, 300000); 
      console.log(`[Market Data] Rate limit (429) reached. Backing off for ${retryDelay / 1000}s...`);
    } else {
      console.error('Error fetching from CoinGecko:', error.message);
      retryDelay = 10000; // Reset on general errors
    }
  } finally {
    // Schedule next run
    setTimeout(fetchAndProcess, retryDelay);
  }
}

console.log('Worker started. Fetching with intelligent backoff...');
fetchAndProcess();

// --- DATABASE CLEANUP ROUTINE ---
// Run cleanup every 1 hour (3600000 ms)
setInterval(async () => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const deleted = await prisma.priceHistory.deleteMany({
      where: {
        timestamp: {
          lt: twoWeeksAgo
        }
      }
    });

    if (deleted.count > 0) {
      console.log(`[Cleanup] Successfully deleted ${deleted.count} records older than 14 days.`);
    }
  } catch (error) {
    console.error('[Cleanup] Failed to delete old records:', error);
  }
}, 3600000);

// --- DUMMY SERVER FOR RENDER DEPLOYMENT ---
 
const app = express();
const PORT = process.env.PORT || 4001;

app.get('/', (req, res) => {
  res.status(200).send('Worker is alive and polling in the background!');
});

app.listen(PORT, () => {
  console.log(`[Worker Dummy Server] Listening on port ${PORT} for Render deployment`);
});
