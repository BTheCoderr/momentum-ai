import React, { useState, useEffect, createContext, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuthProvider();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name
        });
        await SecureStore.setItemAsync('accessToken', session.access_token);
      }
    } catch (error) {
      console.log('Session check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name
      });
      if (data.session?.access_token) {
        await SecureStore.setItemAsync('accessToken', data.session.access_token);
      }
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: name
      });
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user...');
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync('accessToken');
      setUser(null);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      // Force sign out even if there's an error
      setUser(null);
      try {
        await SecureStore.deleteItemAsync('accessToken');
      } catch (e) {
        console.log('Token cleanup error (non-critical):', e);
      }
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}; 