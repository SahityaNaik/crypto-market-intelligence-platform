import { Search, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-40">
      <div className="relative w-96 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          placeholder="Search coins, alerts, or portfolio..." 
          className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
            <User className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
