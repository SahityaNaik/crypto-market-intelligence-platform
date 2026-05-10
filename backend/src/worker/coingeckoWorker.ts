import cron from 'node-cron';
import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import dotenv from 'dotenv';
import { io } from 'socket.io-client';

dotenv.config();


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

    // Save each price to PostgreSQL via Prisma
    for (const coinId of COIN_IDS) {
      if (data[coinId] && data[coinId].usd) {
        await prisma.priceHistory.create({
          data: {
            coinId: coinId,
            price: data[coinId].usd,
          }
        });
      }
    }

    console.log(`[${new Date().toISOString()}] Successfully saved prices for ${response.data.length} coins.`);

    // Emit the prices (including sparkline and 24h change) to the server via Socket.io
    socket.emit('workerUpdate', data);
  } catch (error: any) {
      console.error('Error fetching from CoinGecko:', error.message);
  }
});
