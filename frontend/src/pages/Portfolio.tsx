import { useState, useEffect, useMemo } from 'react';
import api from '../lib/api';

import { usePrices } from '../hooks/usePrices';
import TradeModal from '../components/portfolio/TradeModal';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Wallet, 
  PieChart as PieChartIcon,
  Search
} from 'lucide-react';

interface Position {
  id: string;
  coinId: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  symbol: string;
  image: string;
}

const Portfolio = () => {
  const { prices } = usePrices();
  const [positions, setPositions] = useState<Position[]>([]);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      const response = await api.get('/portfolio');
      setPositions(response.data);
    } catch (error) {
      console.error('Failed to fetch portfolio', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Real-time P&L sync with live prices from WebSocket
  const enrichedPositions = useMemo(() => {
    return positions.map(pos => {
      const liveData = prices[pos.coinId];
      if (!liveData) return pos;

      const currentPrice = liveData.usd;
      const currentValue = pos.quantity * currentPrice;
      const costBasis = pos.quantity * pos.purchasePrice;
      const profitLoss = currentValue - costBasis;
      const profitLossPercentage = costBasis !== 0 ? (profitLoss / costBasis) * 100 : 0;

      return {
        ...pos,
        currentPrice,
        currentValue,
        profitLoss,
        profitLossPercentage
      };
    });
  }, [positions, prices]);

  const stats = useMemo(() => {
    const totalValue = enrichedPositions.reduce((acc, pos) => acc + pos.currentValue, 0);
    const totalCost = enrichedPositions.reduce((acc, pos) => acc + (pos.quantity * pos.purchasePrice), 0);
    const totalPL = totalValue - totalCost;
    const plPercentage = totalCost !== 0 ? (totalPL / totalCost) * 100 : 0;

    return { totalValue, totalPL, plPercentage };
  }, [enrichedPositions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
          <p className="text-gray-400 text-lg">Manage your crypto investments and track P&L live</p>
        </div>
        <button 
          onClick={() => setIsTradeModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Add Position
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <p className="text-gray-400 font-medium">Total Balance</p>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">
            ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="flex items-center gap-2">
            <span className={stats.plPercentage >= 0 ? "text-success" : "text-danger"}>
              {stats.plPercentage >= 0 ? '+' : ''}{stats.plPercentage.toFixed(2)}%
            </span>
            <span className="text-gray-500 text-sm">All time profit</span>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.totalPL >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
              {stats.totalPL >= 0 ? <TrendingUp className="w-6 h-6 text-success" /> : <TrendingDown className="w-6 h-6 text-danger" />}
            </div>
            <p className="text-gray-400 font-medium">Net Profit / Loss</p>
          </div>
          <h2 className={`text-3xl font-bold mb-1 ${stats.totalPL >= 0 ? 'text-success' : 'text-danger'}`}>
            {stats.totalPL >= 0 ? '+' : '-'}${Math.abs(stats.totalPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-gray-500 text-sm">Real-time valuation</p>
        </div>

        <div className="glass-card p-6 border border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <PieChartIcon className="w-6 h-6 text-purple-500" />
            </div>
            <p className="text-gray-400 font-medium">Asset Count</p>
          </div>
          <h2 className="text-3xl font-bold text-white mb-1">{enrichedPositions.length}</h2>
          <p className="text-gray-500 text-sm">Unique tokens</p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card border border-white/5 overflow-hidden bg-white/[0.01]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-gray-400 font-medium text-sm">Asset</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm text-right">Holdings</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm text-right">Purchase Price</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm text-right">Current Price</th>
                <th className="px-6 py-4 text-gray-400 font-medium text-sm text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {enrichedPositions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">No assets found</p>
                        <p className="text-gray-500">Add your first trade to see your performance live.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                enrichedPositions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <PieChartIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-white font-bold uppercase">{pos.coinId}</p>
                          <p className="text-gray-500 text-xs">Crypto Asset</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-white font-medium">{pos.quantity.toLocaleString()}</p>
                      <p className="text-gray-500 text-xs">${pos.currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      ${pos.purchasePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-medium">
                      ${pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`flex flex-col items-end ${pos.profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                        <div className="flex items-center gap-1 font-bold">
                          {pos.profitLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          ${Math.abs(pos.profitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${pos.profitLoss >= 0 ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
                          {pos.profitLossPercentage >= 0 ? '+' : ''}{pos.profitLossPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TradeModal 
        isOpen={isTradeModalOpen} 
        onClose={() => setIsTradeModalOpen(false)} 
        onSuccess={fetchPortfolio}
      />
    </div>
  );
};

export default Portfolio;
