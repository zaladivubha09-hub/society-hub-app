import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { MenuIcon } from './icons';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile off-canvas
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // For desktop collapsible
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex justify-between items-center bg-card p-4 border-b border-border">
            <h1 className="text-xl font-bold">MADHAV HOMES</h1>
            <button onClick={() => setSidebarOpen(true)} className="text-gray-300 hover:text-white">
                <MenuIcon className="h-6 w-6" />
            </button>
        </header>
        <main key={location.pathname} className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8 animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
