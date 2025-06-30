import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';

type Props = {
  onGetStarted?: () => void;
};

export default function WelcomeScreen({ onGetStarted }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Momentum AI 👋</Text>
        <Text style={styles.subtitle}>Your AI Accountability Agent</Text>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What we help you with:</Text>
          <Text style={styles.feature}>🎯 Set and track meaningful goals</Text>
          <Text style={styles.feature}>🤖 Get personalized AI coaching</Text>
          <Text style={styles.feature}>📊 Analyze your progress patterns</Text>
          <Text style={styles.feature}>🔥 Build lasting streaks</Text>
          <Text style={styles.feature}>💡 Receive smart insights</Text>
        </View>
        
        <Text style={styles.description}>
          Transform your ambitions into achievements with AI-powered accountability.
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={onGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>Version 1.0.0</Text>
        {Platform.OS === 'ios' && (
          <Text style={styles.compatibility}>📱 iPhone & iPad Compatible</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
    alignSelf: 'center',
  },
  feature: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  compatibility: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
}); 