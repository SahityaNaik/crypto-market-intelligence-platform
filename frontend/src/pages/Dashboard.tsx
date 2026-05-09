const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Market Overview</h1>
        <p className="text-gray-400">Real-time prices from the top 10 cryptocurrencies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-40 glass-card animate-pulse flex items-center justify-center text-gray-500 border border-white/5">
          Loading live prices...
        </div>
        <div className="h-40 glass-card animate-pulse flex items-center justify-center text-gray-500 border border-white/5">
          Loading live prices...
        </div>
        <div className="h-40 glass-card animate-pulse flex items-center justify-center text-gray-500 border border-white/5">
          Loading live prices...
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
