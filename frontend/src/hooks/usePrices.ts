import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../lib/api';

import { socket } from '../lib/socket';

export interface PriceInfo {
  usd: number;
  change24h: number;
  sparkline: number[];
  lastUpdated: string;
}

export interface Prices {
  [coinId: string]: PriceInfo;
}

export const usePrices = () => {
  const [prices, setPrices] = useState<Prices>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial fetch from the REST API cache
    const fetchInitialPrices = async () => {
      try {
        const response = await api.get('/prices/live');
        setPrices(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch initial prices:', err);
        setLoading(false);
      }
    };

    fetchInitialPrices();

    // 2. Listen for live updates via Socket.io
    socket.on('priceUpdate', (newPrices: any) => {
      console.log('Received price update:', newPrices);
      setPrices((prev) => {
        // Merge updates correctly
        const updated = { ...prev };
        Object.keys(newPrices).forEach(id => {
          updated[id] = {
            usd: newPrices[id].usd,
            change24h: newPrices[id].change24h,
            sparkline: newPrices[id].sparkline,
            lastUpdated: new Date().toISOString()
          };
        });
        return updated;
      });
    });

    return () => {
      socket.off('priceUpdate');
    };
  }, []);

  return { prices, loading };
};
