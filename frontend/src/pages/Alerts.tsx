import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Plus, Trash2, ArrowUp, ArrowDown, Clock, CheckCircle2 } from 'lucide-react';
import AlertModal from '../components/alerts/AlertModal';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  coinId: string;
  condition: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch alerts', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await axios.delete(`http://localhost:4000/api/alerts/${id}`);
      toast.success('Alert removed');
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      toast.error('Failed to delete alert');
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.isActive);
  const historyAlerts = alerts.filter(a => !a.isActive);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Price Alerts</h1>
          <p className="text-gray-400 text-lg">Never miss a market move with real-time notifications</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          Create New Alert
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Alerts Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-xl mb-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2>Active Alerts ({activeAlerts.length})</h2>
          </div>
          
          {activeAlerts.length === 0 ? (
            <div className="glass-card p-10 border border-white/5 bg-white/[0.01] text-center">
              <p className="text-gray-500">No active alerts. Set one to stay ahead of the market!</p>
            </div>
          ) : (
            activeAlerts.map(alert => (
              <div key={alert.id} className="glass-card p-5 border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.condition === 'above' ? 'bg-success/10' : 'bg-danger/10'}`}>
                    {alert.condition === 'above' ? <ArrowUp className="w-5 h-5 text-success" /> : <ArrowDown className="w-5 h-5 text-danger" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold uppercase">{alert.coinId}</span>
                      <span className="text-gray-500 text-xs px-2 py-0.5 bg-white/5 rounded">Price {alert.condition}</span>
                    </div>
                    <p className="text-white text-lg font-medium">${alert.targetPrice.toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 text-gray-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </section>

        {/* Trigger History Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-xl mb-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2>Recently Triggered</h2>
          </div>
          
          {historyAlerts.length === 0 ? (
            <div className="glass-card p-10 border border-white/5 bg-white/[0.01] text-center">
              <p className="text-gray-500">No triggered alerts yet.</p>
            </div>
          ) : (
            historyAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="glass-card p-5 border border-white/5 bg-white/[0.01] opacity-60 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold uppercase">{alert.coinId}</p>
                    <p className="text-gray-500 text-sm">
                      Triggered at ${alert.targetPrice.toLocaleString()} 
                      <span className="ml-2 italic text-xs">({new Date(alert.triggeredAt!).toLocaleTimeString()})</span>
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      <AlertModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchAlerts} 
      />
    </div>
  );
};

export default Alerts;
