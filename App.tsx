import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';
import Vehicles from './pages/Vehicles';
import Notifications from './pages/Notifications';
import Workers from './pages/Workers';
import Complaints from './pages/Complaints';
import Polls from './pages/Polls';
import Documents from './pages/Documents';
import Residents from './pages/Residents';

const App: React.FC = () => {
  return (
    <HashRouter>
      {/* Fix: Use Layout as a layout route, with other routes nested inside. */}
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="residents" element={<Residents />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="workers" element={<Workers />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="polls" element={<Polls />} />
          <Route path="documents" element={<Documents />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
