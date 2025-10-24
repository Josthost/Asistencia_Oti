import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (usuario: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user_data');

      if (savedToken && savedUser) {
        try {
          // Verify token is still valid
          await authAPI.verify();
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usuario: string, password: string) => {
    try {
      const response = await authAPI.login({ usuario, password });
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error en el login');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Call logout endpoint (optional)
    authAPI.logout().catch(() => {
      // Ignore errors on logout
    });
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};