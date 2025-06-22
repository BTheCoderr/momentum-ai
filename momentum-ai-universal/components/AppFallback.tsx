import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  children: React.ReactNode;
};

export default function AppFallback({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const retry = () => {
    setHasError(false);
    setRetryKey((prev) => prev + 1);
  };

  if (hasError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Oops! Something went wrong</Text>
        <Text style={styles.subtitle}>We're having trouble loading Momentum AI</Text>
        <TouchableOpacity style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <React.Suspense fallback={<LoadingScreen />}>
      <ErrorBoundary onError={() => setHasError(true)} key={retryKey}>
        {children}
      </ErrorBoundary>
    </React.Suspense>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#6c47ff" />
      <Text style={styles.loadingText}>Loading Momentum AI...</Text>
      <Text style={styles.subtitle}>Getting your goals ready</Text>
    </View>
  );
}

class ErrorBoundary extends React.Component<{ 
  children: React.ReactNode; 
  onError: () => void;
  state?: { hasError: boolean };
}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.warn('ErrorBoundary caught an error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary componentDidCatch:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state?.hasError) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Something unexpected happened</Text>
          <Text style={styles.subtitle}>Please restart the app</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1f2937',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6c47ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 