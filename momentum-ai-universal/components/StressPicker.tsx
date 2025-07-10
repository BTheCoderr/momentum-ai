import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StressPickerProps {
  value: number;
  onChange: (value: number) => void;
}

const stressLevels = [
  { value: 1, label: '😌', description: 'Very Low' },
  { value: 2, label: '😊', description: 'Low' },
  { value: 3, label: '😐', description: 'Medium' },
  { value: 4, label: '😓', description: 'High' },
  { value: 5, label: '😰', description: 'Very High' },
];

export const StressPicker: React.FC<StressPickerProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      {stressLevels.map((level) => (
        <TouchableOpacity
          key={level.value}
          style={[
            styles.stressButton,
            value === level.value && styles.selectedStress
          ]}
          onPress={() => onChange(level.value)}
        >
          <Text style={styles.stressEmoji}>{level.label}</Text>
          <Text style={styles.stressDescription}>{level.description}</Text>
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
  stressButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: '18%',
  },
  selectedStress: {
    backgroundColor: '#007AFF',
  },
  stressEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  stressDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
}); 