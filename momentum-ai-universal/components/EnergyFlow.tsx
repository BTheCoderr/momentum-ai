import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { checkinServices } from '../lib/services';

type RootStackParamList = {
  Home: undefined;
  Goals: undefined;
  AICoach: undefined;
  Progress: undefined;
  Profile: undefined;
};

type NavigationProps = NavigationProp<RootStackParamList>;

interface EnergyData {
  date: string;
  level: number;
}

interface Props {
  onComplete?: () => void;
}

export const EnergyFlow = ({ onComplete }: Props) => {
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  const [energyHistory, setEnergyHistory] = useState<EnergyData[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  useEffect(() => {
    fetchEnergyHistory();
  }, []);

  const fetchEnergyHistory = async () => {
    try {
      const checkins = await checkinServices.getRecent(30);
      const energyData = checkins.map((checkin: any) => ({
        date: checkin.date,
        level: checkin.energy
      }));
      setEnergyHistory(energyData);
    } catch (error) {
      console.error('Error fetching energy history:', error);
      // Handle error gracefully
      setEnergyHistory([]);
    }
  };

  const handleEnergySelect = async (level: string) => {
    setSelectedEnergy(level);
    try {
      await checkinServices.create({
        date: new Date().toISOString().split('T')[0],
        energy: level === 'high' ? 3 : level === 'medium' ? 2 : 1,
        mood: 0, // Will be set later
        stress: 0, // Will be set later
        wins: '',
        challenges: '',
        priorities: '',
        reflection: ''
      });
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        onComplete?.();
        navigation.navigate('Home');
      }, 1500);
    } catch (error) {
      console.error('Error saving energy level:', error);
      Alert.alert('Error', 'Failed to save energy level. Please try again.');
    }
  };

  const chartData = {
    labels: energyHistory.slice(-30).map(d => d.date.slice(-2)), // Show day only
    datasets: [{
      data: energyHistory.slice(-30).map(d => d.level)
    }]
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How's your energy today?</Text>
      <Text style={styles.subtitle}>Let's customize your coaching based on how you're feeling</Text>

      <View style={styles.energyOptions}>
        <TouchableOpacity 
          style={[styles.energyCard, selectedEnergy === 'high' && styles.selectedCard]}
          onPress={() => handleEnergySelect('high')}
        >
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.energyTitle}>High Energy</Text>
          <Text style={styles.energyDesc}>Ready to tackle big challenges</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.energyCard, selectedEnergy === 'medium' && styles.selectedCard]}
          onPress={() => handleEnergySelect('medium')}
        >
          <Text style={styles.emoji}>⚡️</Text>
          <Text style={styles.energyTitle}>Medium Energy</Text>
          <Text style={styles.energyDesc}>Steady and focused</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.energyCard, selectedEnergy === 'low' && styles.selectedCard]}
          onPress={() => handleEnergySelect('low')}
        >
          <Text style={styles.emoji}>🌱</Text>
          <Text style={styles.energyTitle}>Low Energy</Text>
          <Text style={styles.energyDesc}>Taking it easy today</Text>
        </TouchableOpacity>
      </View>

      {energyHistory.length > 0 && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Your 30-Day Energy Trends</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(78, 85, 175, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {showConfirmation && (
        <View style={styles.confirmation}>
          <Text style={styles.confirmText}>Great! Customizing your experience...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30
  },
  energyOptions: {
    gap: 15
  },
  energyCard: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  selectedCard: {
    backgroundColor: '#e8eaf6',
    borderColor: '#4e55af',
    borderWidth: 2
  },
  emoji: {
    fontSize: 24
  },
  energyTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  energyDesc: {
    fontSize: 14,
    color: '#666'
  },
  chartContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  confirmation: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#4e55af',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500'
  }
}); 