import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../ui/Modal';
import { usePrices } from '../../hooks/usePrices';
import { Bell, ArrowUp, ArrowDown, DollarSign, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { prices } = usePrices();
  const coinIds = Object.keys(prices);
  
  const [coinId, setCoinId] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('http://localhost:4000/api/alerts', {
        coinId,
        condition,
        targetPrice: parseFloat(targetPrice)
      });
      toast.success(`Alert set for ${coinId.toUpperCase()}!`);
      onSuccess();
      onClose();
      // Reset
      setCoinId('');
      setTargetPrice('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to set alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Price Alert">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Select Asset</label>
          <div className="relative">
            <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <select
              required
              value={coinId}
              onChange={(e) => {
                const id = e.target.value;
                setCoinId(id);
                const current = prices[id]?.usd;
                if (current) setTargetPrice(current.toString());
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-background text-gray-500">Select a coin</option>
              {coinIds.map(id => (
                <option key={id} value={id} className="bg-background text-white capitalize">
                  {id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Condition</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setCondition('above')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                condition === 'above' 
                  ? 'bg-success/10 border-success text-success font-bold' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <ArrowUp className="w-4 h-4" />
              Price Above
            </button>
            <button
              type="button"
              onClick={() => setCondition('below')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                condition === 'below' 
                  ? 'bg-danger/10 border-danger text-danger font-bold' 
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <ArrowDown className="w-4 h-4" />
              Price Below
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Target Price ($)</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              step="any"
              required
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50"
              placeholder="0.00"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Setting...
            </>
          ) : 'Activate Alert'}
        </button>
      </form>
    </Modal>
  );
};

export default AlertModal;
