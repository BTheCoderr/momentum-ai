import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation from './navigation/Navigation';
import AuthScreen from './screens/AuthScreen';
import { ThemeProvider } from './components/ThemeProvider';
import analytics, { setUserId } from './lib/analytics';
// import { notificationService } from './lib/notifications'; // Temporarily disabled for build fix
import { SlideNotification } from './components/AnimatedComponents';
import AppFallback from './components/AppFallback';
import { supabase } from './lib/supabase';

// Development mode warning
if (__DEV__) {
  console.warn("Running development mode build.");
}

type NotificationType = 'success' | 'error' | 'info' | 'warning';

function AppContent() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({
    visible: false,
    message: '',
    type: 'info'
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

  useEffect(() => {
    // Check both Supabase session and AsyncStorage for authentication
    const checkAuthentication = async () => {
      try {
        // First check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSession(session);
          setUserId(session.user.id);
          setLoading(false);
          return;
        }

        // If no Supabase session, check AsyncStorage for demo/local auth
        const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
        const userData = await AsyncStorage.getItem('user');
        
        if (isAuthenticated === 'true' && userData) {
          const user = JSON.parse(userData);
          setSession(user);
          setUserId(user.id);
        } else {
          // No authentication found anywhere
          setSession(null);
          setUserId('');
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        // On error, clear everything to be safe
        setSession(null);
        setUserId('');
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || !session?.user) {
        // User signed out or session ended
        setSession(null);
        setUserId(null);
        
        // Also clear AsyncStorage fallback
        try {
          await AsyncStorage.multiRemove(['isAuthenticated', 'user']);
        } catch (error) {
          console.error('Error clearing AsyncStorage on sign out:', error);
        }
      } else if (session?.user) {
        // User signed in
        setSession(session);
        setUserId(session.user.id);
      } else {
        // Check AsyncStorage fallback
        try {
          const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
          const userData = await AsyncStorage.getItem('user');
          
          if (isAuthenticated === 'true' && userData) {
            const user = JSON.parse(userData);
            setSession(user);
            if (user.id) {
              setUserId(user.id);
            }
          } else {
            setSession(null);
            setUserId(null);
          }
        } catch (error) {
          console.error('Error checking AsyncStorage auth:', error);
          setSession(null);
          setUserId(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c47ff" />
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
});