import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../ui/Modal';
import { usePrices } from '../../hooks/usePrices';
import { Wallet, DollarSign, PieChart, Loader2 } from 'lucide-react';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { prices } = usePrices();
  const coinIds = Object.keys(prices);
  const [coinId, setCoinId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:4000/api/portfolio/positions', {
        coinId,
        quantity: parseFloat(quantity),
        purchasePrice: parseFloat(purchasePrice)
      });
      onSuccess();
      onClose();
      // Reset form
      setCoinId('');
      setQuantity('');
      setPurchasePrice('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add position');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Position">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Select Asset</label>
          <div className="relative">
            <PieChart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <select
              required
              value={coinId}
              onChange={(e) => {
                const id = e.target.value;
                setCoinId(id);
                const coinPrice = prices[id]?.usd;
                if (coinPrice) setPurchasePrice(coinPrice.toString());
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Quantity</label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="number"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Purchase Price ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="number"
                step="any"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50"
                placeholder="0.00"
              />
            </div>
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
              Adding...
            </>
          ) : 'Add to Portfolio'}
        </button>
      </form>
    </Modal>
  );
};

export default TradeModal;
