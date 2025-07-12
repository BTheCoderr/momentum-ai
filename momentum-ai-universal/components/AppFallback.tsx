import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ErrorBoundary } from 'react-error-boundary';

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

  const ErrorFallback = () => (
    <View style={styles.centered}>
      <Text style={styles.title}>Oops! Something went wrong</Text>
      <Text style={styles.subtitle}>We're having trouble loading Momentum AI</Text>
      <TouchableOpacity style={styles.retryButton} onPress={retry}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (hasError) {
    return <ErrorFallback />;
  }

  return (
    <React.Suspense fallback={null}>
      <ErrorBoundary 
        fallbackRender={ErrorFallback}
        onError={() => setHasError(true)} 
        key={retryKey}
      >
        {children}
      </ErrorBoundary>
    </React.Suspense>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 