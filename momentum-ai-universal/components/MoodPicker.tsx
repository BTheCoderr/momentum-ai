import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface MoodPickerProps {
  value: number;
  onChange: (value: number) => void;
}

const moods = [
  { value: 1, label: '😢', description: 'Very Bad' },
  { value: 2, label: '😕', description: 'Bad' },
  { value: 3, label: '😐', description: 'Neutral' },
  { value: 4, label: '🙂', description: 'Good' },
  { value: 5, label: '😄', description: 'Very Good' },
];

export const MoodPicker: React.FC<MoodPickerProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      {moods.map((mood) => (
        <TouchableOpacity
          key={mood.value}
          style={[
            styles.moodButton,
            value === mood.value && styles.selectedMood
          ]}
          onPress={() => onChange(mood.value)}
        >
          <Text style={styles.moodEmoji}>{mood.label}</Text>
          <Text style={styles.moodDescription}>{mood.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  moodButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: '18%',
  },
  selectedMood: {
    backgroundColor: '#007AFF',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  moodDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
}); 