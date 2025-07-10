import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import universalStorage from './lib/storage';
import Navigation from './navigation/Navigation';
import AuthScreen from './screens/AuthScreen';
import { ThemeProvider } from './components/ThemeProvider';
import analytics, { setUserId } from './lib/analytics';
// import { notificationService } from './lib/notifications'; // Disabled for web compatibility
import { SlideNotification } from './components/AnimatedComponents';
import AppFallback from './components/AppFallback';
import { supabase, getSupabase } from './lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

// Development mode warning
if (__DEV__) {
  console.warn("Running development mode build.");
}

function AppContent() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'info' as 'info' | 'success'
  });

  const handleAuthSuccess = (user: any) => {
    setSession(user);
    setNotification({
      visible: true,
      message: 'Successfully logged in!',
      type: 'success'
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setNotification({
        visible: true,
        message: 'Successfully signed out!',
        type: 'info'
      });
      setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
      }, 3000);
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const supabaseClient = getSupabase();
        if (!supabaseClient) {
          throw new Error('Failed to initialize Supabase client');
        }

        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        
        setSession(session?.user || null);
        
        // Set up auth state change listener
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
          (_event: AuthChangeEvent, session: Session | null) => {
            setSession(session?.user || null);
          }
        );

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Expose sign out function globally for other components
  useEffect(() => {
    // @ts-ignore
    global.handleSignOut = handleSignOut;
    
    return () => {
      // @ts-ignore
      delete global.handleSignOut;
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!session ? (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      ) : (
        <Navigation />
      )}
      <SlideNotification
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onHide={() => setNotification(prev => ({ ...prev, visible: false }))}
        duration={3000}
      />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <AppFallback>
        <AppContent />
      </AppFallback>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});