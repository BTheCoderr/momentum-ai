import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation from './navigation/Navigation';
import AuthScreen from './screens/AuthScreen';
import { ThemeProvider } from './components/ThemeProvider';
import { analytics, setUserId } from './lib/analytics';
import { notificationService } from './lib/notifications';
import { SlideNotification } from './components/AnimatedComponents';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing Momentum AI...');
      
      // Clear any corrupted data on fresh installs
      // await AsyncStorage.clear(); // Uncomment for testing
      
      // Check authentication status
      const userId = await AsyncStorage.getItem('userId');
      const userProfile = await AsyncStorage.getItem('userProfile');
      
      console.log('👤 User ID:', userId ? 'Found' : 'Not found');
      console.log('👤 User Profile:', userProfile ? 'Found' : 'Not found');
      
      if (userId && userProfile) {
        setIsAuthenticated(true);
        
        // Initialize analytics with user ID
        try {
          await setUserId(userId);
          console.log('📊 Analytics initialized');
        } catch (analyticsError) {
          console.warn('⚠️ Analytics initialization failed:', analyticsError);
        }
        
        // Initialize notifications
        try {
          await notificationService.initialize();
          console.log('🔔 Notifications initialized');
        } catch (notificationError) {
          console.warn('⚠️ Notification initialization failed:', notificationError);
        }
        
        // Track app launch
        try {
          analytics.track('app_launched', {
            hasProfile: !!userProfile,
            userId: userId,
          });
        } catch (trackingError) {
          console.warn('⚠️ Event tracking failed:', trackingError);
        }
        
        showNotification('Welcome back! 🚀', 'success');
      } else {
        console.log('👋 First-time user or logged out');
        // Track first-time user
        try {
          analytics.track('first_time_user');
        } catch (trackingError) {
          console.warn('⚠️ Event tracking failed:', trackingError);
        }
      }
      
      console.log('✅ App initialization complete');
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown initialization error');
      
      try {
        analytics.trackError('app_initialization_error', error instanceof Error ? error.message : 'Unknown error');
      } catch (analyticsError) {
        console.warn('⚠️ Error tracking failed:', analyticsError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (user: any) => {
    try {
      console.log('🎉 Authentication successful:', user?.id || user?.userId || 'demo-user');
      setIsAuthenticated(true);
      
      // Initialize analytics
      try {
        await setUserId(user.id || user.userId || 'demo-user');
      } catch (analyticsError) {
        console.warn('⚠️ Analytics initialization failed:', analyticsError);
      }
      
      // Initialize notifications
      try {
        await notificationService.initialize();
      } catch (notificationError) {
        console.warn('⚠️ Notification initialization failed:', notificationError);
      }
      
      // Track successful authentication
      try {
        analytics.track('user_authenticated', {
          userId: user.id || user.userId,
          profileComplete: !!(user.name && user.email),
        });
      } catch (trackingError) {
        console.warn('⚠️ Event tracking failed:', trackingError);
      }
      
      showNotification('Welcome to Momentum AI! 🎉', 'success');
    } catch (error) {
      console.error('❌ Error handling auth success:', error);
      setHasError(true);
      setErrorMessage('Authentication setup failed');
      
      try {
        analytics.trackError('auth_success_error', error instanceof Error ? error.message : 'Unknown error');
      } catch (analyticsError) {
        console.warn('⚠️ Error tracking failed:', analyticsError);
      }
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setNotification({
      visible: true,
      message,
      type,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  const retryInitialization = () => {
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    initializeApp();
  };

  // Error fallback UI
  if (hasError) {
    return (
      <ThemeProvider>
        <SafeAreaView style={styles.errorContainer}>
          <StatusBar style="auto" />
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryInitialization}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemeProvider>
    );
  }

  // Loading UI
  if (isLoading) {
    return (
      <ThemeProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <StatusBar style="auto" />
          <View style={styles.loadingContent}>
            <Text style={styles.loadingTitle}>Momentum AI</Text>
            <Text style={styles.loadingSubtitle}>Your AI Accountability Agent</Text>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <StatusBar style="auto" />
          
          {isAuthenticated ? (
            <Navigation />
          ) : (
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          )}
          
          <SlideNotification
            visible={notification.visible}
            message={notification.message}
            type={notification.type}
            onHide={hideNotification}
            duration={3000}
          />
        </View>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});