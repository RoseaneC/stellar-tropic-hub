import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  nickname: string;
  email?: string;
  public_key?: string;
  tokens: number;
  xp: number;
  avatar?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (nickname: string, password: string) => Promise<void>;
  register: (nickname: string, password: string, publicKey?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  connectFreighter: () => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  };

  const login = async (nickname: string, password: string) => {
    try {
      const response = await authAPI.login({ nickname, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo de volta, ${userData.nickname}!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.response?.data?.message || "Credenciais inválidas",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (nickname: string, password: string, publicKey?: string) => {
    try {
      const response = await authAPI.register({ nickname, password, public_key: publicKey });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: "Conta criada com sucesso!",
        description: `Bem-vindo ao Connectus, ${userData.nickname}!`,
      });
    } catch (error: any) {
      toast({
        title: "Erro no registro",
        description: error.response?.data?.message || "Erro ao criar conta",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const connectFreighter = async () => {
    try {
      // @ts-ignore - Freighter wallet integration
      if (window.freighterApi) {
        // @ts-ignore
        const publicKey = await window.freighterApi.getPublicKey();
        await authAPI.updateProfile({ public_key: publicKey });
        updateUser({ public_key: publicKey });
        
        toast({
          title: "Carteira conectada!",
          description: "Freighter wallet conectada com sucesso.",
        });
      } else {
        toast({
          title: "Freighter não encontrada",
          description: "Por favor, instale a extensão Freighter.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao conectar carteira",
        description: "Não foi possível conectar com a Freighter.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    connectFreighter,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};