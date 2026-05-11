import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { apiClient, API_BASE_URL } from '../lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  avatar: string;
  shopName?: string;
  whatsappNumber?: string;
  location?: string;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: any) => void;
  setUser: (userData: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const normalizeUserRole = (role: unknown): 'buyer' | 'seller' => {
    return role === 'seller' ? 'seller' : 'buyer';
  };

  const normalizeUser = (rawUser: any): User => ({
    ...rawUser,
    role: normalizeUserRole(rawUser?.role),
    avatar: rawUser?.avatar || rawUser?.profileImage || '',
    profileImage: rawUser?.profileImage || rawUser?.avatar || '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('[Auth:Me] Fetching user from', `${API_BASE_URL}/api/auth/me`);
          const res = await apiClient.get('/api/auth/me');
          setUser(normalizeUser(res.data.data));
        } catch (error) {
          console.error('Failed to fetch user', error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (data: any) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(normalizeUser(data.user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, setUser, logout }}>
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
