import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { socket } from './lib/socket';

const NotificationHandler = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const eventName = `alertTriggered:${user.id}`;
    socket.on(eventName, (data: any) => {
      toast((t) => (
        <div className="flex flex-col gap-1">
          <div className="font-bold text-white flex items-center gap-2">
            🚨 Price Alert: {data.coinId.toUpperCase()}
          </div>
          <div className="text-sm text-gray-400">
            Price is now {data.condition} ${data.targetPrice.toLocaleString()}!
            (Current: ${data.price.toLocaleString()})
          </div>
        </div>
      ), {
        duration: 8000,
        position: 'top-right',
        style: {
          background: '#1a1b1e',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
        }
      });
    });

    return () => {
      socket.off(eventName);
    };
  }, [user]);

  return null;
};

function App() {
  return (
    <AuthProvider>
      <NotificationHandler />
      <Toaster />
      <Router>
        <Routes>
          {/* Auth Routes (Public) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/portfolio" element={
            <ProtectedRoute>
              <MainLayout>
                <Portfolio />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/alerts" element={
            <ProtectedRoute>
              <MainLayout>
                <Alerts />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute>
              <MainLayout>
                <div className="text-white text-2xl font-bold">Analytics Feature (Phase 8)</div>
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Catch all - Redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
