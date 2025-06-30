import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MomentumLogo } from '../components/MomentumLogo';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    primaryGoal: '',
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in email and password');
      return;
    }

    if (!isLogin && (!formData.name || !formData.primaryGoal)) {
      Alert.alert('Error', 'Please fill in your name and primary goal');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        console.log('✅ Login successful:', data);
        onAuthSuccess(data.user);
      } else {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', formData.email)
          .single();

        if (existingUser) {
          Alert.alert(
            'Account Exists',
            'An account with this email already exists. Please log in instead.',
            [
              { text: 'OK', onPress: () => setIsLogin(true) }
            ]
          );
          setLoading(false);
          return;
        }

        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.name,
              primary_goal: formData.primaryGoal,
            }
          }
        });

        if (error) throw error;

        console.log('✅ Signup successful:', data);
        
        // Create user profile
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                full_name: formData.name,
                email: formData.email,
                primary_goal: formData.primaryGoal,
                created_at: new Date().toISOString()
              }
            ]);
          
          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw profileError;
          }

          // Create user stats entry
          const { error: statsError } = await supabase
            .from('user_stats')
            .insert([
              {
                user_id: data.user.id,
                total_xp: 0,
                current_level: 1,
                streak_count: 0,
                goals_completed: 0,
                checkins_completed: 0,
                achievements: []
              }
            ]);
          
          if (statsError) {
            console.error('Stats creation error:', statsError);
          }
        }

        onAuthSuccess(data.user);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, we'll simulate a successful signup
      // In production, you'd integrate with your actual auth service
      
      // Generate a unique user ID
      const userId = `user_${Math.random().toString(36).substr(2, 16)}`;
      
      // Store user data
      const userData = {
        id: userId,
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        primaryGoal: formData.primaryGoal || 'General wellness',
        createdAt: new Date().toISOString(),
        emailConfirmed: true, // Skip email confirmation for demo
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      
      // Show success message
      Alert.alert(
        'Welcome! 🎉',
        'Your account has been created successfully. Let\'s start building your momentum!',
        [
          {
            text: 'Get Started',
            onPress: () => {
              if (onAuthSuccess) {
                onAuthSuccess(userData);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // For demo purposes, we'll check if user exists in AsyncStorage
      const existingUser = await AsyncStorage.getItem('user');
      
      if (existingUser) {
        const userData = JSON.parse(existingUser);
        if (userData.email === formData.email) {
          await AsyncStorage.setItem('isAuthenticated', 'true');
          
          Alert.alert(
            'Welcome back! 👋',
            'Successfully signed in. Ready to continue your momentum?',
            [
              {
                text: 'Continue',
                onPress: () => {
                  if (onAuthSuccess) {
                    onAuthSuccess(userData);
                  }
                }
              }
            ]
          );
          return;
        }
      }
      
      // If no user found, suggest signup
      Alert.alert(
        'Account not found',
        'No account found with this email. Would you like to create a new account?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Up', onPress: () => setIsLogin(false) }
        ]
      );
      
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B35', '#F7931E', '#FF8C42']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            
            {/* Header */}
            <View style={styles.header}>
              <MomentumLogo size="large" color="white" showText={true} />
              <Text style={styles.title}>Welcome to Momentum AI</Text>
              <Text style={styles.subtitle}>Your personal AI-powered goal achievement companion</Text>
            </View>

            {/* Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>What's your name? ✨</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData({...formData, name: text})}
                    placeholder="Enter your name"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email 📧</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  placeholder="your@email.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password 🔒</Text>
                <TextInput
                  style={styles.input}
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                  placeholder="Create a secure password"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  secureTextEntry
                />
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>What's your main goal? 🎯</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.primaryGoal}
                    onChangeText={(text) => setFormData({...formData, primaryGoal: text})}
                    placeholder="e.g., Get fit, Learn Spanish, Save money"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  />
                </View>
              )}

              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Welcome Back! 🎉' : 'Start My Journey! 🚀'}
                  </Text>
                )}
              </TouchableOpacity>

              {!isLogin && (
                <Text style={styles.disclaimer}>
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </Text>
              )}
            </View>

            {/* Features Preview */}
            {!isLogin && (
              <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>What you'll get:</Text>
                <View style={styles.featuresList}>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>🤖</Text>
                    <Text style={styles.featureText}>AI-powered coaching</Text>
                  </View>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>📊</Text>
                    <Text style={styles.featureText}>Progress tracking</Text>
                  </View>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>🔥</Text>
                    <Text style={styles.featureText}>Streak motivation</Text>
                  </View>
                  <View style={styles.feature}>
                    <Text style={styles.featureIcon}>💡</Text>
                    <Text style={styles.featureText}>Smart insights</Text>
                  </View>
                </View>
              </View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 21,
  },
  toggleButtonActive: {
    backgroundColor: 'white',
  },
  toggleText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  toggleTextActive: {
    color: '#FF6B35',
  },
  form: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  submitButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
  featuresContainer: {
    marginTop: 20,
  },
  featuresTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  featureText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuthScreen; 