import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface LeaderboardItem {
  id: string;
  name: string;
  xp: number;
  level: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface LeaderboardComponentProps {
  timeFrame?: 'weekly' | 'monthly' | 'allTime';
}

export const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({
  timeFrame = 'weekly',
}) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserStats, setCurrentUserStats] = useState<any>(null);

  useEffect(() => {
    loadLeaderboard();
    loadCurrentUserStats();
  }, [timeFrame]);

  const loadCurrentUserStats = async () => {
    try {
      if (!user?.id) return;

      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed');

      const { data: checkins } = await supabase
        .from('checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      setCurrentUserStats({
        ...stats,
        completedGoals: goals?.length || 0,
        recentCheckins: checkins?.length || 0,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Mock leaderboard data for now
      const mockData: LeaderboardItem[] = [
        { id: '1', name: 'Alex Chen', xp: 2450, level: 12, rank: 1 },
        { id: '2', name: 'Sarah Johnson', xp: 2180, level: 11, rank: 2 },
        { id: '3', name: 'Mike Rodriguez', xp: 1950, level: 10, rank: 3 },
        { id: '4', name: 'Emma Wilson', xp: 1720, level: 9, rank: 4 },
        { id: '5', name: 'David Kim', xp: 1500, level: 8, rank: 5 },
    ];

      // Add current user to leaderboard if they have stats
      if (currentUserStats) {
        const userRank = mockData.length + 1;
        mockData.push({
          id: user?.id || 'current',
      name: 'You',
          xp: currentUserStats.total_xp || 0,
          level: currentUserStats.current_level || 1,
          rank: userRank,
      isCurrentUser: true,
        });
      }

      setLeaderboard(mockData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareProgress = async () => {
    try {
      if (!currentUserStats) {
        Alert.alert('No Data', 'Complete some activities to share your progress!');
        return;
      }

      const shareMessage = `🚀 My Momentum AI Progress Update!\n\n` +
        `📊 Level: ${currentUserStats.current_level || 1}\n` +
        `⭐ XP: ${currentUserStats.total_xp || 0}\n` +
        `🎯 Goals Completed: ${currentUserStats.completedGoals}\n` +
        `📝 Recent Check-ins: ${currentUserStats.recentCheckins}\n` +
        `🔥 Current Streak: ${currentUserStats.streak_count || 0} days\n\n` +
        `Join me on my journey to build better habits and achieve my goals! 💪\n\n` +
        `#MomentumAI #PersonalGrowth #GoalAchievement`;

      const result = await Share.share({
        message: shareMessage,
        title: 'My Momentum AI Progress',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success! 🎉', 'Your progress has been shared! Keep up the great work!');
      }
    } catch (error) {
      console.error('Error sharing progress:', error);
      Alert.alert('Error', 'Failed to share progress. Please try again.');
    }
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardItem }) => (
    <View style={[styles.leaderboardItem, item.isCurrentUser && styles.currentUserItem]}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rank, item.isCurrentUser && styles.currentUserText]}>
          #{item.rank}
        </Text>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[styles.userName, item.isCurrentUser && styles.currentUserText]}>
          {item.name}
        </Text>
        <Text style={[styles.userLevel, item.isCurrentUser && styles.currentUserText]}>
          Level {item.level}
        </Text>
      </View>
      
      <View style={styles.xpContainer}>
        <Text style={[styles.xp, item.isCurrentUser && styles.currentUserText]}>
          {item.xp.toLocaleString()} XP
        </Text>
      {item.isCurrentUser && (
        <View style={styles.currentUserBadge}>
            <Text style={styles.currentUserBadgeText}>YOU</Text>
        </View>
      )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.timeFrameSelector}>
          <Text style={styles.timeFrameText}>
            {timeFrame === 'allTime' ? 'All Time' : timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
              </Text>
        </View>
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />

      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShareProgress}
      >
        <LinearGradient
          colors={['#FF6B35', '#F7931E']}
          style={styles.shareGradient}
        >
          <Text style={styles.shareText}>Share Your Progress 🚀</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  timeFrameSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#FFF5F0',
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: '#666',
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xp: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  currentUserText: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  currentUserBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  currentUserBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shareButton: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  shareText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
