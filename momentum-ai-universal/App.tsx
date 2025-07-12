import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import universalStorage from './lib/storage';
import Navigation from './navigation/Navigation';
import AuthScreen from './screens/AuthScreen';
import { ThemeProvider } from './components/ThemeProvider';
import analytics, { setUserId, track } from './lib/analytics';
import { SlideNotification } from './components/AnimatedComponents';
import AppFallback from './components/AppFallback';
import { supabase, getSupabase } from './lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    visible: false,
    message: '',
    type: 'success'
  });

  const handleAuthSuccess = async (user: any) => {
    setSession(user);
    if (user?.id) {
      await setUserId(user.id);
      await track('user_signed_in', { userId: user.id });
    }
  };

  const handleSignOut = async () => {
    try {
      const supabaseClient = getSupabase();
      if (!supabaseClient) {
        throw new Error('Failed to initialize Supabase client');
      }

      await supabaseClient.auth.signOut();
      await universalStorage.clear();
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const initializeApp = useCallback(async () => {
    try {
      console.log('🚀 Initializing app...');
      
      // Initialize analytics first
      await analytics.initialize();
      
      // Track app launch
      await track('app_launched', {
        platform: 'ios',
        version: '1.0.0',
        sessionId: analytics.getSessionId()
      });
      
      // Get initial session
      const supabaseClient = getSupabase();
      if (!supabaseClient) {
        throw new Error('Failed to initialize Supabase client');
      }

      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      
      if (session?.user) {
        setSession(session.user);
        await setUserId(session.user.id);
      } else {
        setSession(null);
      }
      
      // Set up auth state change listener
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        async (_event: AuthChangeEvent, session: Session | null) => {
          if (session?.user) {
            setSession(session.user);
            await setUserId(session.user.id);
          } else {
            setSession(null);
          }
        }
      );

      setAppReady(true);
      console.log('✅ App initialized successfully');
      
      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('❌ App initialization error:', error);
      setSession(null);
      setAppReady(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // Hide splash screen when app is ready
  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  // Expose sign out function globally for other components
  useEffect(() => {
    // @ts-ignore
    global.handleSignOut = handleSignOut;
    
    return () => {
      // @ts-ignore
      delete global.handleSignOut;
    };
  }, []);

  // Don't render anything until app is ready
  if (!appReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        
        {session ? (
          <NavigationContainer>
            <Navigation />
          </NavigationContainer>
        ) : (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        )}
        
        <SlideNotification
          visible={notification.visible}
          message={notification.message}
          type={notification.type}
          onHide={() => setNotification(prev => ({ ...prev, visible: false }))}
        />
      </View>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppFallback>
      <AppContent />
    </AppFallback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});