import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, NutritionTarget } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  targets: NutritionTarget | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  refreshProfileAndTargets: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [targets, setTargets] = useState<NutritionTarget | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfileAndTargets = async () => {
    try {
      const [prof, targ] = await Promise.all([
        api.getProfile(),
        api.getTargets(),
      ]);
      setProfile(prof);
      setTargets(targ);
    } catch (e) {
      console.warn('Failed to refresh profile/targets:', e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('nutritrack_token');
      if (token) {
        try {
          const me = await api.getMe();
          setUser(me);
          await refreshProfileAndTargets();
        } catch (e) {
          console.warn('Invalid saved session, attempting demo user fallback');
          await loginAsDemo();
        }
      } else {
        // Automatically sign in as Demo User by default for frictionless evaluation
        await loginAsDemo();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('nutritrack_token', res.access_token);
    setUser(res.user);
    await refreshProfileAndTargets();
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await api.register({ email, password, full_name: fullName });
    localStorage.setItem('nutritrack_token', res.access_token);
    setUser(res.user);
    await refreshProfileAndTargets();
  };

  const loginAsDemo = async () => {
    try {
      const res = await api.login({ email: 'demo@nutritrack.ai', password: 'demopassword' });
      localStorage.setItem('nutritrack_token', res.access_token);
      setUser(res.user);
      await refreshProfileAndTargets();
    } catch (e) {
      console.error('Demo login error:', e);
    }
  };

  const logout = () => {
    localStorage.removeItem('nutritrack_token');
    setUser(null);
    setProfile(null);
    setTargets(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        targets,
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
        refreshProfileAndTargets,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
