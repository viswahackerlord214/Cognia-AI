import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  token: string | null;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('cognia_auth_token') || 'student@univ.edu');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (authToken: string) => {
    try {
      setLoading(true);
      localStorage.setItem('cognia_auth_token', authToken);
      setToken(authToken);
      const profile = await authApi.getProfile();
      setUser(profile);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.token) {
      await fetchProfile(res.token);
    }
  };

  const register = async (payload: any) => {
    await authApi.register(payload);
  };

  const logout = () => {
    localStorage.removeItem('cognia_auth_token');
    setToken(null);
    setUser(null);
  };

  const refetchUser = async () => {
    if (token) await fetchProfile(token);
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, loginWithCredentials, register, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
