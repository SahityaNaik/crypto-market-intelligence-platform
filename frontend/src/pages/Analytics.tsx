import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { usePrices } from '../hooks/usePrices';
import { BarChart3, TrendingUp, TrendingDown, Activity, Bell, ArrowUp, ArrowDown, Zap, Layers, Share2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AlertModal from '../components/alerts/AlertModal';
import { socket } from '../lib/socket';

const Analytics = () => {
  const { prices } = usePrices();
  const coinIds = Object.keys(prices);
  const [searchParams] = useSearchParams();
  
  const [selectedCoin, setSelectedCoin] = useState(searchParams.get('coin') || 'bitcoin');
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ high: 0, low: 0, volatility: 0 });
  const [correlations, setCorrelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Sync with URL params if they change
  useEffect(() => {
    const coinFromUrl = searchParams.get('coin');
    if (coinFromUrl && coinFromUrl !== selectedCoin) {
      setSelectedCoin(coinFromUrl);
    }
  }, [searchParams]);

  const fetchHistory = async (id: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:4000/api/prices/history/${id}`);
      const { history: historyData, stats: statsData } = response.data;
      
      const formattedData = historyData.map((item: any) => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: item.price,
        fullTime: new Date(item.timestamp).toLocaleString()
      }));
      
      setHistory(formattedData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCorrelations = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/prices/correlations');
      setCorrelations(response.data);
    } catch (error) {
      console.error('Failed to fetch correlations', error);
    }
  };

  useEffect(() => {
    if (selectedCoin) {
      fetchHistory(selectedCoin);
    }
    fetchCorrelations();
  }, [selectedCoin]);

  useEffect(() => {
    const handlePriceUpdate = (newPrices: any) => {
      if (newPrices[selectedCoin]) {
        const newDataPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: newPrices[selectedCoin].usd,
          fullTime: new Date().toLocaleString()
        };
        
        setHistory(prev => {
          const updated = [...prev, newDataPoint];
          return updated.slice(-100);
        });
      }
    };

    socket.on('priceUpdate', handlePriceUpdate);
    return () => {
      socket.off('priceUpdate', handlePriceUpdate);
    };
  }, [selectedCoin]);

  const currentCoinData = prices[selectedCoin];

  // Prepare Volatility Comparison Data
  const volatilityData = Object.entries(prices).map(([id, data]) => ({
    name: id,
    volatility: Math.abs(data.change24h) 
  })).sort((a, b) => b.volatility - a.volatility);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Market Analytics</h1>
          <p className="text-gray-400 text-lg">In-depth historical performance and price trends</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-gray-400 font-medium whitespace-nowrap">Select Asset:</label>
          <select
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-3 px-6 text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer capitalize font-bold w-full sm:w-auto"
          >
            {coinIds.map(id => (
              <option key={id} value={id} className="bg-background">{id}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="glass-card p-5 border border-white/5 bg-white/[0.01]">
          <p className="text-gray-500 text-sm mb-1 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Current Price
          </p>
          <h3 className="text-2xl font-bold text-white font-mono">
            ${currentCoinData?.usd?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </h3>
        </div>
        
        <div className="glass-card p-5 border border-white/5 bg-white/[0.01]">
          <p className="text-gray-500 text-sm mb-1 flex items-center gap-2">
            <ArrowUp className="w-3 h-3 text-success" /> 24h High
          </p>
          <h3 className="text-2xl font-bold text-white font-mono">
            ${stats.high.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="glass-card p-5 border border-white/5 bg-white/[0.01]">
          <p className="text-gray-500 text-sm mb-1 flex items-center gap-2">
            <ArrowDown className="w-3 h-3 text-danger" /> 24h Low
          </p>
          <h3 className="text-2xl font-bold text-white font-mono">
            ${stats.low.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="glass-card p-5 border border-white/5 bg-white/[0.01]">
          <p className="text-gray-500 text-sm mb-1 flex items-center gap-2">
            <Zap className="w-3 h-3 text-yellow-500" /> Volatility
          </p>
          <h3 className="text-2xl font-bold text-white font-mono">
            {stats.volatility.toFixed(4)}%
          </h3>
        </div>

        <div className="glass-card p-5 border border-white/5 bg-white/[0.01]">
          <p className="text-gray-500 text-sm mb-1">24h Change</p>
          <div className="flex items-center gap-2">
            <h3 className={`text-2xl font-bold font-mono ${ (currentCoinData?.change24h || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              {(currentCoinData?.change24h || 0) >= 0 ? '+' : ''}{(currentCoinData?.change24h || 0).toFixed(2)}%
            </h3>
            {(currentCoinData?.change24h || 0) >= 0 ? <TrendingUp className="w-5 h-5 text-success" /> : <TrendingDown className="w-5 h-5 text-danger" />}
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="glass-card p-8 border border-white/5 bg-white/[0.01] min-h-[500px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-white capitalize">{selectedCoin} Price Action</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAlertModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl border border-primary/20 transition-all text-sm"
            >
              <Bell className="w-4 h-4" />
              Set Alert
            </button>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                LIVE UPDATES
              </span>
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <p className="text-gray-500 max-w-md">
                No historical data found in database. 
                Keep the worker running to build up price history!
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1b1e', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#8b5cf6' }}
                  labelStyle={{ color: '#9ca3af', marginBottom: '4px' }}
                  labelFormatter={(label, payload) => payload[0]?.payload.fullTime}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  animationDuration={0}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Advanced Analytics - Vertical Stack */}
      <div className="space-y-8">
        {/* Volatility Comparison Chart */}
        <div className="glass-card p-8 border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Market Volatility Comparison</h2>
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
                    <Cell key={`cell-${index}`} fill={entry.name === selectedCoin ? '#8b5cf6' : '#374151'} />
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
                      // Heatmap color logic: Bright neon for high, muted for low
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
              <span className="text-xs text-gray-400">Low Correlation (Independent)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-primary/60 rounded" />
              <span className="text-xs text-gray-400">Moderate Correlation</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-primary rounded shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
              <span className="text-xs text-gray-400 font-bold">High Correlation (Moving Together)</span>
            </div>
          </div>
        </div>
      </div>

      <AlertModal 
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        initialCoin={selectedCoin}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default Analytics;
