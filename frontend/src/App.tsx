import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portfolio" element={<div className="text-white text-2xl font-bold">Portfolio Feature (Phase 5)</div>} />
          <Route path="/alerts" element={<div className="text-white text-2xl font-bold">Alerts Feature (Phase 5)</div>} />
          <Route path="/analytics" element={<div className="text-white text-2xl font-bold">Analytics Feature (Phase 6)</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
