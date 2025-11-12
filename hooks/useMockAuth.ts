import { Role } from '../types';

// This is a mock hook to simulate an authenticated user.
export const useMockAuth = () => {
  const user = {
    id: 'user1',
    name: 'Admin User',
    role: Role.Admin,
    avatar: 'https://api.dicebear.com/8.x/initials/svg?seed=Admin',
  };

  return {
    user,
    isAdmin: user.role === Role.Admin,
    loading: false,
  };
};