import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { usePrices } from '../hooks/usePrices';
import { BarChart3, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Analytics = () => {
  const { prices } = usePrices();
  const coinIds = Object.keys(prices);
  const [searchParams] = useSearchParams();
  
  const [selectedCoin, setSelectedCoin] = useState(searchParams.get('coin') || 'bitcoin');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Format data for Recharts
      const formattedData = response.data.map((item: any) => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: item.price,
        fullTime: new Date(item.timestamp).toLocaleString()
      }));
      setHistory(formattedData);
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCoin) {
      fetchHistory(selectedCoin);
    }
  }, [selectedCoin]);

  const currentCoinData = prices[selectedCoin];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 border border-white/5 bg-white/[0.01]">
          <p className="text-gray-500 text-sm mb-1">Current Price</p>
          <h3 className="text-2xl font-bold text-white">
            ${currentCoinData?.usd?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
          </h3>
        </div>
        <div className="glass-card p-5 border border-white/5 bg-white/[0.01]">
          <p className="text-gray-500 text-sm mb-1">24h Change</p>
          <div className="flex items-center gap-2">
            <h3 className={`text-2xl font-bold ${ (currentCoinData?.change24h || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              {(currentCoinData?.change24h || 0) >= 0 ? '+' : ''}{(currentCoinData?.change24h || 0).toFixed(2)}%
            </h3>
            {(currentCoinData?.change24h || 0) >= 0 ? <TrendingUp className="w-5 h-5 text-success" /> : <TrendingDown className="w-5 h-5 text-danger" />}
          </div>
        </div>
        <div className="glass-card p-5 border border-white/5 bg-white/[0.01]">
          <p className="text-gray-500 text-sm mb-1">Data Points</p>
          <div className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-2xl font-bold">{history.length}</h3>
          </div>
        </div>
        <div className="glass-card p-5 border border-white/5 bg-white/[0.01]">
          <p className="text-gray-500 text-sm mb-1">Time Range</p>
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5 text-gray-500" />
            <h3 className="text-2xl font-bold">24 Hours</h3>
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
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/30">REAL-TIME DATA</span>
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
                  minTickGap={30}
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
                  labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
                  labelFormatter={(label, payload) => payload[0]?.payload.fullTime}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPrice)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
