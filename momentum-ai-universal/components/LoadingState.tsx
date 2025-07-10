import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingStateProps {
  color?: string;
  size?: 'small' | 'large';
  type?: 'full' | 'inline';
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  color = '#007AFF',
  size = 'large',
  type = 'full',
  message
}) => {
  return (
    <View style={[styles.container, type === 'inline' && styles.inline]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  inline: {
    flex: 0,
    padding: 20,
    backgroundColor: 'transparent'
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  }
});