import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

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
      // Sign up with Supabase
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) throw signUpError;
      if (!user) throw new Error('No user data returned');

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: formData.email,
          full_name: formData.name || formData.email.split('@')[0],
          primary_goal: formData.primaryGoal || 'General wellness',
        });

      if (profileError) throw profileError;

      // Show success message
      Alert.alert(
        'Welcome! 🎉',
        'Your account has been created successfully. Let\'s start building your momentum!',
        [
          {
            text: 'Get Started',
            onPress: () => {
              if (onAuthSuccess) {
                onAuthSuccess(user);
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
      // Sign in with Supabase
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;
      if (!user) throw new Error('No user data returned');

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // Create profile if it doesn't exist
      if (!profile) {
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.email?.split('@')[0] || 'User',
            primary_goal: 'General wellness',
          });

        if (createProfileError) throw createProfileError;
      }

      Alert.alert(
        'Welcome back! 👋',
        'Successfully signed in. Ready to continue your momentum?',
        [
          {
            text: 'Continue',
            onPress: () => {
              if (onAuthSuccess) {
                onAuthSuccess(user);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Sign in error:', error);
      Alert.alert('Error', 'Failed to sign in. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      {!isLogin && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>What's your name? ✨</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email 📧</Text>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password 🔒</Text>
        <TextInput
          style={styles.input}
          placeholder={isLogin ? "Enter your password" : "Create a secure password"}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />
      </View>

      {!isLogin && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>What's your main goal? 🎯</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Get fit, Learn Spanish, Save money"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={formData.primaryGoal}
            onChangeText={(text) => setFormData({ ...formData, primaryGoal: text })}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.disabledButton]}
        onPress={isLogin ? handleSignIn : handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FF6B35" />
        ) : (
          <Text style={styles.submitButtonText}>
            {isLogin ? 'Welcome Back! 👋' : 'Start My Journey! 🚀'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#FF6B35', '#F7931E', '#FF6B35']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>M</Text>
                <Text style={styles.logoSubtext}>AI</Text>
              </View>
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Momentum AI</Text>
              <Text style={styles.subtitle}>Welcome to Momentum AI</Text>
              <Text style={styles.description}>
                Your personal AI-powered goal achievement companion
              </Text>
            </View>

            {/* Auth Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !isLogin && styles.activeToggle]}
                onPress={() => setIsLogin(false)}
              >
                <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isLogin && styles.activeToggle]}
                onPress={() => setIsLogin(true)}
              >
                <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>

            {renderForm()}
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
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  logoSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: -4,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 21,
  },
  activeToggle: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeToggleText: {
    color: '#FF6B35',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
});

export default AuthScreen; 