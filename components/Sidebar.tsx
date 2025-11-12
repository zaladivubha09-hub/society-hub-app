import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMockAuth as useAuth } from '../hooks/useMockAuth';
import {
  DashboardIcon, HomeIcon, UsersIcon, BellIcon, WrenchIcon, ShieldCheckIcon, ChartBarIcon, DocumentTextIcon, XIcon,
  ChevronDoubleLeftIcon, ChevronDoubleRightIcon
} from './icons';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
    { name: 'Maintenance', href: '/maintenance', icon: WrenchIcon },
    { name: 'Complaints', href: '/complaints', icon: ShieldCheckIcon },
    { name: 'Residents', href: '/residents', icon: UsersIcon },
    { name: 'Notifications', href: '/notifications', icon: BellIcon },
    { name: 'Vehicles', href: '/vehicles', icon: UsersIcon },
    { name: 'Workers', href: '/workers', icon: UsersIcon },
    { name: 'Polls & Votes', href: '/polls', icon: ChartBarIcon },
    { name: 'Documents', href: '/documents', icon: DocumentTextIcon },
  ];

  const NavLinks = ({ isCollapsed }: {isCollapsed: boolean}) => (
    <>
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          to={item.href}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-gray-700 hover:text-white'
            } ${isCollapsed ? 'justify-center' : ''}`
          }
        >
          <item.icon className="h-5 w-5 flex-shrink-0" />
          <span className={`${isCollapsed ? 'hidden' : 'ml-3'}`}>{item.name}</span>
        </NavLink>
      ))}
    </>
  );
  
  const UserProfile = ({ isCollapsed }: {isCollapsed: boolean}) => (
    user ? (
        <div className={`flex-shrink-0 flex items-center bg-gray-900 p-4 border-t border-border ${isCollapsed ? 'justify-center' : ''}`}>
          <img className="h-10 w-10 rounded-full" src={user.avatar} alt="User Avatar" />
          <div className={`ml-3 flex-1 min-w-0 ${isCollapsed ? 'hidden' : ''}`}>
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs font-medium text-gray-400">{user.role}</p>
          </div>
        </div>
    ) : null
  );

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75" aria-hidden="true" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-secondary">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <HomeIcon className="h-8 w-auto text-primary" />
              <span className="ml-3 text-white text-lg font-bold">SocietyHub</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              <NavLinks isCollapsed={false} />
            </nav>
          </div>
          <UserProfile isCollapsed={false} />
        </div>
        <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className={`flex flex-col bg-secondary transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div className="flex flex-col h-0 flex-1">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className={`flex items-center flex-shrink-0 px-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <HomeIcon className="h-8 w-auto text-primary" />
                <span className={`ml-3 text-white text-xl font-bold ${sidebarCollapsed ? 'hidden' : ''}`}>SocietyHub</span>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-2">
                <NavLinks isCollapsed={sidebarCollapsed} />
              </nav>
            </div>
            
            <div className="flex-shrink-0 border-t border-border">
                <button 
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
                  className={`w-full flex items-center p-4 text-text-secondary hover:bg-gray-700 focus:outline-none ${sidebarCollapsed ? 'justify-center' : 'justify-start'}`}
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {sidebarCollapsed ? <ChevronDoubleRightIcon className="h-6 w-6" /> : <ChevronDoubleLeftIcon className="h-6 w-6" />}
                  <span className={`ml-3 text-sm font-medium ${sidebarCollapsed ? 'hidden' : ''}`}>Collapse</span>
                </button>
            </div>
            <UserProfile isCollapsed={sidebarCollapsed} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
