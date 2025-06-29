import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LeaderboardComponent } from '../components/LeaderboardComponent';
import { useGamification } from '../hooks/useGamification';

interface LeaderboardScreenProps {
  navigation: any;
}

export default function LeaderboardScreen({ navigation }: LeaderboardScreenProps) {
  const { userXP } = useGamification();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <LeaderboardComponent
        currentUserXP={userXP.totalXP}
        currentUserLevel={userXP.level}
        currentUserStreak={12}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});
