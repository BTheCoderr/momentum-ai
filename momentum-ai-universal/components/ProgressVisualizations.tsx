import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

interface Goal {
  id: string;
  title: string;
  progress: number;
  category: string;
  created_at: string;
}

interface Stats {
  completed_goals: number;
  current_streak: number;
  totalXP: number;
  motivationScore: number;
}

interface Props {
  goals: Goal[];
  stats: Stats;
  timeframe?: 'week' | 'month' | 'year';
}

export const ProgressVisualizations = ({ goals, stats, timeframe = 'week' }: Props) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 24; // More width utilization

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`, // Orange theme
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#FF6B35',
    },
  };

  // Calculate category distribution
  const categoryData = goals.reduce((acc, goal) => {
    acc[goal.category] = (acc[goal.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(categoryData).map(([name, count], index) => ({
    name,
    count,
    color: [
      '#FF6B35',
      '#FF8C42', 
      '#FFB347',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
    ][index % 6],
    legendFontColor: '#7F7F7F',
    legendFontSize: 11,
  }));

  // Calculate progress over time
  const progressData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [65, 70, 75, 72, 80, 85, 90], // Replace with actual data
    }],
  };

  // Calculate completion rate by category
  const completionData = {
    labels: Object.keys(categoryData).slice(0, 5), // Limit for better display
    datasets: [{
      data: Object.values(categoryData).slice(0, 5),
    }],
  };

  return (
    <View style={styles.container}>
      {/* Compact Stats Grid - Full Width */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Progress Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completed_goals}</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.current_streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalXP}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.motivationScore}%</Text>
            <Text style={styles.statLabel}>Motivation</Text>
          </View>
        </View>
      </View>

      {/* Compact Progress Chart - Full Width */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Weekly Progress</Text>
        <LineChart
          data={progressData}
          width={chartWidth}
          height={180} // Reduced height
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withShadow={false}
          withInnerLines={false}
        />
      </View>

      {/* Horizontal Layout for Charts */}
      <View style={styles.horizontalChartsContainer}>
        {/* Left: Category Distribution */}
        <View style={styles.halfChart}>
          <Text style={styles.smallSectionTitle}>Categories</Text>
          <PieChart
            data={pieChartData}
            width={chartWidth / 2 - 8}
            height={160}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="0"
            style={styles.smallChart}
            hasLegend={false}
          />
        </View>

        {/* Right: Completion Rate */}
        <View style={styles.halfChart}>
          <Text style={styles.smallSectionTitle}>Completion</Text>
          <BarChart
            data={completionData}
            width={chartWidth / 2 - 8}
            height={160}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              ...chartConfig,
              barPercentage: 0.7,
            }}
            style={styles.smallChart}
            showValuesOnTopOfBars={true}
            withInnerLines={false}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12, // Reduced padding
    backgroundColor: '#f8f9fa',
  },
  statsSection: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartSection: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  horizontalChartsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfChart: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  smallSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  smallChart: {
    borderRadius: 8,
  },
}); 