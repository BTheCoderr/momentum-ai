import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

// Safe SecureStore wrapper with module existence check
const SafeSecureStore = {
  async setItemAsync(key: string, value: string) {
    try {
      // Check if the module exists first
      const SecureStore = require('expo-secure-store');
      if (SecureStore && SecureStore.setItemAsync) {
        return await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      // Module not available
    }
    console.log('SecureStore not available, skipping token storage');
    return Promise.resolve();
  },
  async getItemAsync(key: string) {
    try {
      // Check if the module exists first
      const SecureStore = require('expo-secure-store');
      if (SecureStore && SecureStore.getItemAsync) {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      // Module not available
    }
    console.log('SecureStore not available, no stored token');
    return Promise.resolve(null);
  },
  async deleteItemAsync(key: string) {
    try {
      // Check if the module exists first
      const SecureStore = require('expo-secure-store');
      if (SecureStore && SecureStore.deleteItemAsync) {
        return await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      // Module not available
    }
    console.log('SecureStore not available, skipping token deletion');
    return Promise.resolve();
  }
};

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
        await SafeSecureStore.setItemAsync('accessToken', session.access_token);
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
        await SafeSecureStore.setItemAsync('accessToken', data.session.access_token);
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
      await SafeSecureStore.deleteItemAsync('accessToken');
      setUser(null);
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      // Force sign out even if there's an error
      setUser(null);
      try {
        await SafeSecureStore.deleteItemAsync('accessToken');
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