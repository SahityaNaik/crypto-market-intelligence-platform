import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Bell, 
  BarChart3, 
  Settings, 
  LogOut,
  TrendingUp
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Portfolio', icon: Wallet, path: '/portfolio' },
  { name: 'Alerts', icon: Bell, path: '/alerts' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
];

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <aside className="w-64 h-screen glass-sidebar flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <TrendingUp className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          CryptoIntel
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-primary" : "group-hover:text-white"
              )} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 text-danger/80 hover:text-danger hover:bg-danger/5 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        title="Confirm Logout"
      >
        <div className="space-y-4">
          <p className="text-gray-400 leading-relaxed">
            Are you sure you want to log out?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl border border-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={logout}
              className="flex-1 px-4 py-3 bg-danger hover:bg-danger/80 text-white font-bold rounded-xl transition-all shadow-lg shadow-danger/20"
            >
              Yes, Logout
            </button>
          </div>
        </div>
      </Modal>
    </aside>
  );
};

export default Sidebar;
