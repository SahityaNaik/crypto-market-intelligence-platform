import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PriceCardProps {
  coinId: string;
  price: number;
  change24h: number;
  sparkline: number[];
  lastUpdated: string;
}

const PriceCard: React.FC<PriceCardProps> = ({ coinId, price, change24h, sparkline, lastUpdated }) => {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<number>(price);

  useEffect(() => {
    if (price > prevPriceRef.current) {
      setFlash('up');
    } else if (price < prevPriceRef.current) {
      setFlash('down');
    }

    const timer = setTimeout(() => setFlash(null), 3000); // 3 second glow
    prevPriceRef.current = price;

    return () => clearTimeout(timer);
  }, [price]);

  // Format sparkline data for Recharts
  const chartData = sparkline?.map((val, i) => ({ value: val, index: i })) || [];
  const isTrendUp = change24h >= 0;

  return (
    <div className={cn(
      "glass-card p-6 border transition-all duration-1000 min-h-[220px] flex flex-col group",
      flash === 'up' ? "border-success/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : 
      flash === 'down' ? "border-danger/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]" : 
      "border-white/5 shadow-lg hover:border-white/10"
    )}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-gray-400 text-sm font-medium mb-1 capitalize tracking-wide">{coinId}</h3>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={cn(
              "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap",
              isTrendUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            )}>
              {isTrendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {Math.abs(change24h || 0).toFixed(2)}%
            </div>
          </div>
        </div>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-700 shrink-0",
          flash === 'up' ? "bg-success/20 scale-110" : flash === 'down' ? "bg-danger/20 scale-110" : "bg-white/5"
        )}>
          {isTrendUp ? (
            <TrendingUp className={cn("w-5 h-5", flash === 'up' ? "text-success" : "text-primary")} />
          ) : (
            <TrendingDown className={cn("w-5 h-5", flash === 'down' ? "text-danger" : "text-gray-400")} />
          )}
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="flex-1 h-16 mt-4 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${coinId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isTrendUp ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={isTrendUp ? '#10b981' : '#ef4444'} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis hide domain={['auto', 'auto']} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={isTrendUp ? '#10b981' : '#ef4444'} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#gradient-${coinId})`} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{new Date(lastUpdated).toLocaleTimeString()}</span>
        </div>
        <div className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-gray-400 font-mono tracking-wider uppercase">
          Live
        </div>
      </div>
    </div>
  );
};

export default PriceCard;
