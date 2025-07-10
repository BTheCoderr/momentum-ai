import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { checkinServices } from '../lib/services';
import { LoadingState } from '../components/LoadingState';
import { showToast } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { MoodPicker } from '../components/MoodPicker';
import { EnergyPicker } from '../components/EnergyPicker';
import { StressPicker } from '../components/StressPicker';

interface CheckInScreenProps {
  navigation: any;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkinData, setCheckinData] = useState({
    mood: 3,
    energy: 3,
    stress: 3,
    wins: '',
    challenges: '',
    reflection: '',
    priorities: []
  });

  const handleSubmit = async () => {
    if (!user) {
      showToast('Please sign in to submit a check-in');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...checkinData,
        date: new Date().toISOString()
      };

      await checkinServices.create(user.id, data);
      showToast('Check-in submitted successfully!');
      navigation.goBack(); // Go back to the previous screen instead of navigating to 'Home'
    } catch (error) {
      console.error('Error submitting check-in:', error);
      showToast('Error submitting check-in');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <MoodPicker
          value={checkinData.mood}
          onChange={(value) => setCheckinData(prev => ({ ...prev, mood: value }))}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Energy Level</Text>
        <EnergyPicker
          value={checkinData.energy}
          onChange={(value) => setCheckinData(prev => ({ ...prev, energy: value }))}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stress Level</Text>
        <StressPicker
          value={checkinData.stress}
          onChange={(value) => setCheckinData(prev => ({ ...prev, stress: value }))}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Wins</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={checkinData.wins}
          onChangeText={(text) => setCheckinData(prev => ({ ...prev, wins: text }))}
          placeholder="What went well today?"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Challenges</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={checkinData.challenges}
          onChangeText={(text) => setCheckinData(prev => ({ ...prev, challenges: text }))}
          placeholder="What challenges did you face?"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reflection</Text>
        <TextInput
          style={styles.textInput}
          multiline
          value={checkinData.reflection}
          onChangeText={(text) => setCheckinData(prev => ({ ...prev, reflection: text }))}
          placeholder="Any thoughts or reflections?"
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>Submit Check-in</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 