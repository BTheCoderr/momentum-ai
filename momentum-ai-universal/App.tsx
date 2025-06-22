import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert, Text, SafeAreaView, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Navigation from './navigation/Navigation';
import AuthScreen from './screens/AuthScreen';
import { ThemeProvider } from './components/ThemeProvider';
import { analytics, setUserId } from './lib/analytics';
import { notificationService } from './lib/notifications';
import { SlideNotification } from './components/AnimatedComponents';
import AppFallback from './components/AppFallback';

// Development mode warning
if (__DEV__) {
  console.warn("Running development mode build.");
}

// iPad detection helper
const { width, height } = Dimensions.get('window');
const isTablet = Platform.OS === 'ios' && Math.min(width, height) >= 768;

// iPad detection helper
const { width, height } = Dimensions.get('window');
const isTablet = Platform.OS === 'ios' && Math.min(width, height) >= 768;

export default function App() {
  return (
    <AppFallback>
      <AppContent />
    </AppFallback>
  );
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOffline, setIsOffline] = useState(false);
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
      console.log('📱 Platform:', Platform.OS);
      console.log('🔧 Device type:', isTablet ? 'iPad' : 'Phone');
      
      // Always show welcome screen first - even without internet
      setTimeout(() => {
        console.log('✅ App initialization complete');
        setIsLoading(false);
      }, 1000);
      
      // Check authentication status (offline-safe)
      try {
        const userId = await AsyncStorage.getItem('userId');
        const userProfile = await AsyncStorage.getItem('userProfile');
        
        console.log('👤 User ID:', userId ? 'Found' : 'Not found');
        console.log('👤 User Profile:', userProfile ? 'Found' : 'Not found');
        
        if (userId && userProfile) {
          setIsAuthenticated(true);
          
          // Initialize analytics (safe to fail)
          try {
            await setUserId(userId);
            console.log('📊 Analytics initialized');
          } catch (analyticsError) {
            console.warn('⚠️ Analytics initialization failed (offline?):', analyticsError);
            setIsOffline(true);
          }
          
          // Initialize notifications (safe to fail)
          try {
            await notificationService.initialize();
            console.log('🔔 Notifications initialized');
          } catch (notificationError) {
            console.warn('⚠️ Notification initialization failed:', notificationError);
          }
          
          // Track app launch (safe to fail)
          try {
            analytics.track('app_launched', {
              hasProfile: !!userProfile,
              userId: userId,
              platform: Platform.OS,
              isTablet: isTablet,
            });
          } catch (trackingError) {
            console.warn('⚠️ Event tracking failed (offline?):', trackingError);
            setIsOffline(true);
          }
          
          showNotification('Welcome back! 🚀', 'success');
        } else {
          console.log('👋 First-time user or logged out');
          // Track first-time user (safe to fail)
          try {
            analytics.track('first_time_user', {
              platform: Platform.OS,
              isTablet: isTablet,
            });
          } catch (trackingError) {
            console.warn('⚠️ Event tracking failed (offline?):', trackingError);
            setIsOffline(true);
          }
        }
      } catch (storageError) {
        console.warn('⚠️ Storage access failed:', storageError);
        // Continue anyway - app should work without storage
      }
      
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      // Don't crash - show error UI instead
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown initialization error');
      
      try {
        analytics.trackError('app_initialization_error', error instanceof Error ? error.message : 'Unknown error');
      } catch (analyticsError) {
        console.warn('⚠️ Error tracking failed:', analyticsError);
      }
    }
  };

  const handleAuthSuccess = async (user: any) => {
    try {
      console.log('🎉 Authentication successful:', user?.id || user?.userId || 'demo-user');
      setIsAuthenticated(true);
      
      // Initialize analytics (safe to fail)
      try {
        await setUserId(user.id || user.userId || 'demo-user');
      } catch (analyticsError) {
        console.warn('⚠️ Analytics initialization failed:', analyticsError);
        setIsOffline(true);
      }
      
      // Initialize notifications (safe to fail)
      try {
        await notificationService.initialize();
      } catch (notificationError) {
        console.warn('⚠️ Notification initialization failed:', notificationError);
      }
      
      // Track successful authentication (safe to fail)
      try {
        analytics.track('user_authenticated', {
          userId: user.id || user.userId,
          profileComplete: !!(user.name && user.email),
          platform: Platform.OS,
          isTablet: isTablet,
        });
      } catch (trackingError) {
        console.warn('⚠️ Event tracking failed:', trackingError);
        setIsOffline(true);
      }
      
      showNotification('Welcome to Momentum AI! 🎉', 'success');
    } catch (error) {
      console.error('❌ Error handling auth success:', error);
      // Don't crash - show error message instead
      showNotification('Authentication setup had issues, but you can continue', 'warning');
      
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
    setIsOffline(false);
    initializeApp();
  };

  // Always show welcome screen for new users - even offline
  const showWelcomeScreen = () => {
    return (
      <ThemeProvider>
        <SafeAreaView style={styles.welcomeContainer}>
          <StatusBar style="auto" />
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Welcome to Momentum AI 👋</Text>
            <Text style={styles.welcomeSubtitle}>Your AI Accountability Agent</Text>
            <Text style={styles.welcomeDescription}>
              We help you achieve your goals with personalized coaching and smart insights.
            </Text>
            {isOffline && (
              <Text style={styles.offlineText}>
                📶 Some features may be limited offline
              </Text>
            )}
            <TouchableOpacity style={styles.welcomeButton} onPress={() => setIsAuthenticated(false)}>
              <Text style={styles.welcomeButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemeProvider>
    );
  };

  // Error fallback UI (App Store safe)
  if (hasError) {
    return (
      <ThemeProvider>
        <SafeAreaView style={styles.errorContainer}>
          <StatusBar style="auto" />
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <Text style={styles.errorSubtext}>Don't worry, you can still use the app!</Text>
            <TouchableOpacity style={styles.retryButton} onPress={retryInitialization}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.continueButton} onPress={showWelcomeScreen}>
              <Text style={styles.continueButtonText}>Continue Anyway</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemeProvider>
    );
  }

  // Loading UI (App Store safe)
  if (isLoading) {
    return (
      <ThemeProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <StatusBar style="auto" />
          <View style={styles.loadingContent}>
            <Text style={styles.loadingTitle}>Momentum AI</Text>
            <Text style={styles.loadingSubtitle}>Your AI Accountability Agent</Text>
            <Text style={styles.loadingText}>Getting ready...</Text>
            {isTablet && (
              <Text style={styles.iPadText}>✨ Optimized for iPad</Text>
            )}
          </View>
        </SafeAreaView>
      </ThemeProvider>
    );
  }

  // Main app UI (wrapped in safe navigation)
  return (
    <ThemeProvider>
      <NavigationContainer
        fallback={
          <View style={styles.navigationFallback}>
            <Text style={styles.navigationFallbackText}>Loading navigation...</Text>
          </View>
        }
      >
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
          
          {isOffline && (
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineBannerText}>📶 Limited connectivity</Text>
            </View>
          )}
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
    fontSize: isTablet ? 40 : 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: isTablet ? 20 : 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: isTablet ? 18 : 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  iPadText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 16,
    textAlign: 'center',
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 40 : 20,
  },
  welcomeTitle: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: isTablet ? 22 : 18,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: isTablet ? 18 : 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: isTablet ? 600 : 300,
  },
  welcomeButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: isTablet ? 32 : 24,
    paddingVertical: isTablet ? 16 : 12,
    borderRadius: 8,
  },
  welcomeButtonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isTablet ? 40 : 20,
  },
  errorTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: isTablet ? 18 : 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorSubtext: {
    fontSize: isTablet ? 16 : 14,
    color: '#9CA3AF',
    marginBottom: 32,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: isTablet ? 32 : 24,
    paddingVertical: isTablet ? 16 : 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: isTablet ? 32 : 24,
    paddingVertical: isTablet ? 16 : 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
  },
  navigationFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  navigationFallbackText: {
    fontSize: 16,
    color: '#6B7280',
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    borderRadius: 8,
    zIndex: 1000,
  },
  offlineBannerText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  offlineText: {
    fontSize: 14,
    color: '#F59E0B',
    marginBottom: 24,
    textAlign: 'center',
  },
});