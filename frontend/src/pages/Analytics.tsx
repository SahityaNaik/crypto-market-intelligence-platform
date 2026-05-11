import React, { useState, useEffect } from 'react';
import api from '../lib/api';

import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { usePrices } from '../hooks/usePrices';
import { Share2, Layers } from 'lucide-react';

const Analytics = () => {
  const { prices } = usePrices();
  const coinIds = Object.keys(prices);
  const [correlations, setCorrelations] = useState<any[]>([]);

  const fetchCorrelations = async () => {
    try {
      const response = await api.get('/prices/correlations');
      setCorrelations(response.data);
    } catch (error) {
      console.error('Failed to fetch correlations', error);
    }
  };

  useEffect(() => {
    fetchCorrelations();
  }, []);

  // Prepare Volatility Comparison Data
  const volatilityData = Object.entries(prices).map(([id, data]) => ({
    name: id,
    volatility: Math.abs(data.change24h) 
  })).sort((a, b) => b.volatility - a.volatility);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Market Insights</h1>
        <p className="text-gray-400 text-lg">Advanced metrics and asset relationships across the entire portfolio</p>
      </div>

      <div className="space-y-8">
        {/* Volatility Comparison Chart */}
        <div className="glass-card p-8 border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Volatility Comparison</h2>
              <p className="text-gray-500 text-sm">24h Absolute Price Swing % across all tracked assets</p>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volatilityData} layout="vertical" margin={{ left: 20, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  width={100}
                  tick={{ fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1b1e', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: '#8b5cf6' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  formatter={(value: any) => [`${value.toFixed(2)}%`, 'Volatility']}
                />
                <Bar dataKey="volatility" radius={[0, 4, 4, 0]} barSize={20}>
                  {volatilityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={'#374151'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Correlation Heatmap */}
        <div className="glass-card p-8 border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Share2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Asset Correlation Matrix</h2>
              <p className="text-gray-500 text-sm">How prices move in relationship to each other (1.0 = Perfect Positive, -1.0 = Inverse)</p>
            </div>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-[120px_repeat(12,1fr)] gap-2">
                <div />
                {coinIds.map(id => (
                  <div key={id} className="text-[10px] text-gray-500 uppercase font-bold text-center h-12 flex items-center justify-center bg-white/5 rounded-t-lg">
                    {id.substring(0, 5)}
                  </div>
                ))}
                
                {correlations.map((row) => (
                  <React.Fragment key={row.coin}>
                    <div className="text-[11px] text-gray-400 uppercase font-bold flex items-center px-3 bg-white/5 rounded-l-lg h-12">
                      {row.coin.substring(0, 10)}
                    </div>
                    {coinIds.map(id => {
                      const value = row[id] || 0;
                      const opacity = Math.max(0.1, Math.abs(value));
                      const isHigh = Math.abs(value) > 0.8;
                      
                      return (
                        <div 
                          key={id}
                          className={`h-12 rounded flex flex-col items-center justify-center transition-all duration-500 hover:scale-105 cursor-help ${isHigh ? 'border border-primary/50' : ''}`}
                          style={{
                            backgroundColor: `rgba(139, 92, 246, ${opacity})`,
                          }}
                          title={`${row.coin} vs ${id}: ${value}`}
                        >
                          <span className={`text-[10px] font-bold ${Math.abs(value) > 0.6 ? 'text-white' : 'text-gray-500'}`}>
                            {value.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-8 border-t border-white/5 pt-6">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-primary/10 border border-white/10 rounded" />
              <span className="text-xs text-gray-400">Low Correlation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-primary/60 rounded" />
              <span className="text-xs text-gray-400">Moderate</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-primary rounded shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
              <span className="text-xs text-gray-400 font-bold">High Correlation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
