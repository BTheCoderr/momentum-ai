import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LeaderboardUser {
  id: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface LeaderboardComponentProps {
  currentUserXP: number;
  currentUserLevel: number;
  currentUserStreak: number;
}

export const LeaderboardComponent: React.FC<LeaderboardComponentProps> = ({
  currentUserXP,
  currentUserLevel,
  currentUserStreak,
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');

  useEffect(() => {
    generateMockLeaderboard();
  }, [timeFrame, currentUserXP]);

  const generateMockLeaderboard = () => {
    // Generate mock leaderboard data
    const mockUsers: LeaderboardUser[] = [
      { id: '1', name: 'Sarah M.', level: 15, xp: 1450, streak: 28, rank: 1 },
      { id: '2', name: 'Mike R.', level: 12, xp: 1200, streak: 15, rank: 2 },
      { id: '3', name: 'Alex K.', level: 11, xp: 1100, streak: 22, rank: 3 },
      { id: '4', name: 'Emma L.', level: 10, xp: 950, streak: 12, rank: 4 },
      { id: '5', name: 'David W.', level: 9, xp: 890, streak: 18, rank: 5 },
      { id: '6', name: 'Lisa P.', level: 8, xp: 820, streak: 9, rank: 6 },
      { id: '7', name: 'Tom H.', level: 7, xp: 750, streak: 14, rank: 7 },
    ];

    // Add current user to leaderboard
    const currentUser: LeaderboardUser = {
      id: 'current',
      name: 'You',
      level: currentUserLevel,
      xp: currentUserXP,
      streak: currentUserStreak,
      rank: 0,
      isCurrentUser: true,
    };

    // Sort all users by XP and assign ranks
    const allUsers = [...mockUsers, currentUser].sort((a, b) => b.xp - a.xp);
    const rankedUsers = allUsers.map((user, index) => ({ ...user, rank: index + 1 }));

    setLeaderboard(rankedUsers);
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#58CC02'; // Green
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardUser }) => (
    <View style={[
      styles.leaderboardItem,
      item.isCurrentUser && styles.currentUserItem,
    ]}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rankEmoji, { color: getRankColor(item.rank) }]}>
          {getRankEmoji(item.rank)}
        </Text>
        <Text style={[styles.rankNumber, { color: getRankColor(item.rank) }]}>
          #{item.rank}
        </Text>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={[styles.userName, item.isCurrentUser && styles.currentUserName]}>
          {item.name}
        </Text>
        <View style={styles.userStats}>
          <Text style={styles.userLevel}>Level {item.level}</Text>
          <Text style={styles.userXP}>{item.xp} XP</Text>
          <Text style={styles.userStreak}>🔥 {item.streak}</Text>
        </View>
      </View>
      
      {item.isCurrentUser && (
        <View style={styles.currentUserBadge}>
          <Text style={styles.currentUserText}>YOU</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.timeFrameSelector}>
          {(['weekly', 'monthly', 'allTime'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.timeFrameButton,
                timeFrame === period && styles.activeTimeFrame,
              ]}
              onPress={() => setTimeFrame(period)}
            >
              <Text style={[
                styles.timeFrameText,
                timeFrame === period && styles.activeTimeFrameText,
              ]}>
                {period === 'allTime' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
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
        onPress={() => Alert.alert('Share', 'Share your progress with friends!')}
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 4,
  },
  timeFrameButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTimeFrame: {
    backgroundColor: '#FF6B35',
  },
  timeFrameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTimeFrameText: {
    color: '#FFF',
  },
  list: {
    flex: 1,
    padding: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserItem: {
    borderWidth: 2,
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  rankEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
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
  currentUserName: {
    color: '#FF6B35',
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userLevel: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  userXP: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
    marginRight: 12,
  },
  userStreak: {
    fontSize: 14,
    color: '#FF6B35',
  },
  currentUserBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentUserText: {
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
