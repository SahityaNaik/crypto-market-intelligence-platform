import { useState, useEffect } from 'react';
import api from '../lib/api';

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
import { BarChart3, TrendingUp, TrendingDown, Activity, Bell, ArrowUp, ArrowDown, Zap } from 'lucide-react';
import { useSearchParams, useParams } from 'react-router-dom';
import AlertModal from '../components/alerts/AlertModal';
import { socket } from '../lib/socket';

const CoinDetail = () => {
  const { prices } = usePrices();
  const { coinId: pathCoinId } = useParams();
  const [searchParams] = useSearchParams();
  const coinIds = Object.keys(prices);
  
  const [selectedCoin, setSelectedCoin] = useState(pathCoinId || searchParams.get('coin') || 'bitcoin');
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState({ high: 0, low: 0, volatility: 0 });
  const [loading, setLoading] = useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  useEffect(() => {
    if (pathCoinId) setSelectedCoin(pathCoinId);
  }, [pathCoinId]);

  const fetchHistory = async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/prices/history/${id}`);
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

  useEffect(() => {
    if (selectedCoin) {
      fetchHistory(selectedCoin);
    }
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 capitalize">{selectedCoin} Detail</h1>
          <p className="text-gray-400 text-lg">In-depth performance metrics and live price action</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-gray-400 font-medium whitespace-nowrap">Switch Asset:</label>
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

      <AlertModal 
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        initialCoin={selectedCoin}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default CoinDetail;
