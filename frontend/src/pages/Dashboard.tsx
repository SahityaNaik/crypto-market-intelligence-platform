import { usePrices } from '../hooks/usePrices';
import PriceCard from '../components/dashboard/PriceCard';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { prices, loading } = usePrices();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Market Overview</h1>
        <p className="text-gray-400">Real-time prices from the top 10 cryptocurrencies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Skeleton loader while initial data is fetching
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-40 glass-card animate-pulse border border-white/5" />
          ))
        ) : (
          Object.keys(prices).map((coinId) => (
            <div 
              key={coinId} 
              onClick={() => navigate(`/analytics?coin=${coinId}`)}
              className="cursor-pointer transition-transform hover:-translate-y-1 active:scale-95"
            >
              <PriceCard
                coinId={coinId}
                price={prices[coinId].usd}
                change24h={prices[coinId].change24h}
                sparkline={prices[coinId].sparkline}
                lastUpdated={prices[coinId].lastUpdated}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
