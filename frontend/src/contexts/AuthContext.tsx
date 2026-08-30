import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password?: string; role?: string }) => Promise<void>;
  register: (userData: { name: string; email: string; phone?: string; password: string; role: string; facilityId?: string }) => Promise<void>;
  updateProfile: (profileData: { name?: string; phone?: string; facilityId?: string }) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => Promise<void>;
  demoAccounts: any[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('swasthya_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [demoAccounts, setDemoAccounts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch demo accounts list for reference
    api.getDemoAccounts()
      .then(res => setDemoAccounts(res.demoAccounts || []))
      .catch(() => {});

    // Restore real user or demo session
    const savedToken = localStorage.getItem('swasthya_token');
    const savedUser = localStorage.getItem('swasthya_user');

    if (savedToken) {
      api.getCurrentUser()
        .then(res => {
          setUser(res.user);
          localStorage.setItem('swasthya_user', JSON.stringify(res.user));
        })
        .catch(() => {
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch (e) {
              logout();
            }
          } else {
            logout();
          }
        })
        .finally(() => setLoading(false));
    } else {
      // Unauthenticated initial state: user must sign in or register
      setUser(null);
      setToken(null);
      setLoading(false);
    }
  }, []);

  const register = async (userData: { name: string; email: string; phone?: string; password: string; role: string; facilityId?: string }) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('swasthya_token', res.token);
      localStorage.setItem('swasthya_user', JSON.stringify(res.user));
      localStorage.removeItem('swasthya_demo_role'); // Clear demo role tag
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { email: string; password?: string; role?: string }) => {
    setLoading(true);
    try {
      const res = await api.login(credentials);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('swasthya_token', res.token);
      localStorage.setItem('swasthya_user', JSON.stringify(res.user));
      if (credentials.role) {
        localStorage.setItem('swasthya_demo_role', credentials.role);
      } else {
        localStorage.removeItem('swasthya_demo_role');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: { name?: string; phone?: string; facilityId?: string }) => {
    const res = await api.updateProfile(profileData);
    setUser(res.user);
    localStorage.setItem('swasthya_user', JSON.stringify(res.user));
  };

  const switchRole = async (role: UserRole) => {
    setLoading(true);
    try {
      localStorage.setItem('swasthya_demo_role', role);
      const res = await api.login({ email: `${role.toLowerCase()}@swasthysetu.demo`, role });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('swasthya_token', res.token);
      localStorage.setItem('swasthya_user', JSON.stringify(res.user));
    } catch (err) {
      console.warn('Role switch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('swasthya_token');
    localStorage.removeItem('swasthya_user');
    localStorage.removeItem('swasthya_demo_role');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, updateProfile, logout, switchRole, demoAccounts }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
