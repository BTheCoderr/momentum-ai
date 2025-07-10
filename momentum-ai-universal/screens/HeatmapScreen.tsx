import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import CalendarHeatmap from 'react-native-calendar-heatmap';
import { getDailyCheckins } from '../lib/streaks';
import { useAuth } from '../hooks/useAuth';

interface HeatmapValue {
  date: string;
  count: number;
}

export function HeatmapScreen() {
  const { user } = useAuth();
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCheckins() {
      if (user?.id) {
        setLoading(true);
        const checkinDates = await getDailyCheckins(user.id);
        setDates(checkinDates);
        setLoading(false);
      }
    }

    loadCheckins();
  }, [user?.id]);

  const getColor = (value: HeatmapValue | null): string => {
    if (!value) return '#ebedf0';
    if (value.count === 1) return '#9be9a8';
    if (value.count === 2) return '#40c463';
    return '#216e39';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔥 Your Momentum Streak</Text>
      
      {loading ? (
        <Text style={styles.loading}>Loading your streak data...</Text>
      ) : (
        <View style={styles.heatmapContainer}>
          <CalendarHeatmap
            values={dates.map(date => ({ date, count: 1 }))}
            endDate={new Date().toISOString().split('T')[0]}
            numDays={60}
            colorForValue={(value) => getColor(value as HeatmapValue)}
            horizontal={true}
          />
          <Text style={styles.legend}>Less ⬤ ⬤ ⬤ More</Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Total Check-ins</Text>
          <Text style={styles.statValue}>{dates.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>Best Streak</Text>
          <Text style={styles.statValue}>
            {Math.max(...dates.map((_, i) => 
              dates.slice(0, i + 1).filter((d, j) => 
                j === 0 || new Date(d).getTime() - new Date(dates[j - 1]).getTime() === 86400000
              ).length
            ), 0)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  heatmapContainer: {
    marginVertical: 20,
  },
  legend: {
    textAlign: 'right',
    color: '#666',
    marginTop: 8,
  },
  loading: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
}); 