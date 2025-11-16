import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Role, User } from '../types';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user profiles to use for the demo
const MOCK_ADMIN_PROFILE: User = {
    id: 'admin-mock-id',
    name: 'Admin User',
    role: Role.Admin,
    avatar: 'https://picsum.photos/seed/admin/200'
};

const MOCK_RESIDENT_PROFILE: User = {
    id: 'res1', // Match an ID from mockData for consistency
    name: 'Aarav Sharma',
    role: Role.Resident,
    avatar: 'https://picsum.photos/seed/resident/200'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // No initial loading needed for mock auth

  const login = async (email: string, pass: string): Promise<void> => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        if (pass === '123456') {
          if (email === 'admin@society.com') {
            setUser(MOCK_ADMIN_PROFILE);
            resolve();
          } else if (email === 'resident@society.com') {
            setUser(MOCK_RESIDENT_PROFILE);
            resolve();
          } else {
            reject(new Error('Invalid email address.'));
          }
        } else {
          reject(new Error('Incorrect password.'));
        }
        setLoading(false);
      }, 500);
    });
  };

  const logout = async (): Promise<void> => {
    setUser(null);
  };

  const isAdmin = user?.role === Role.Admin;

  const value = {
    user,
    isAdmin,
    loading,
    login,
    logout,
  };

  // Render children immediately since loading is synchronous
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
