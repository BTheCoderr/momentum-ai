import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

export const ProfileScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Get user stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;
      setStats(statsData || {
        total_checkins: 0,
        total_goals: 0,
        completed_goals: 0,
        current_streak: 0,
        best_streak: 0,
        totalXP: 0,
        level: 1
      });

    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Navigate to auth screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user) throw new Error('No authenticated user');

              // Delete user data
              await Promise.all([
                supabase.from('checkins').delete().eq('user_id', user.id),
                supabase.from('goals').delete().eq('user_id', user.id),
                supabase.from('user_stats').delete().eq('user_id', user.id),
                supabase.from('user_settings').delete().eq('user_id', user.id),
                supabase.from('profiles').delete().eq('id', user.id),
              ]);

              // Delete auth user
              const { error } = await supabase.auth.admin.deleteUser(user.id);
              if (error) throw error;

              // Sign out and navigate to auth screen
              await supabase.auth.signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account');
            }
          }
        }
      ]
    );
  };

  return (
    // Render your component here
  );
}; 