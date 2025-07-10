import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface EnergyPickerProps {
  value: number;
  onChange: (value: number) => void;
}

const energyLevels = [
  { value: 1, label: '🔋', description: 'Very Low' },
  { value: 2, label: '🔋🔋', description: 'Low' },
  { value: 3, label: '🔋🔋🔋', description: 'Medium' },
  { value: 4, label: '🔋🔋🔋🔋', description: 'High' },
  { value: 5, label: '🔋🔋🔋🔋🔋', description: 'Very High' },
];

export const EnergyPicker: React.FC<EnergyPickerProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      {energyLevels.map((level) => (
        <TouchableOpacity
          key={level.value}
          style={[
            styles.energyButton,
            value === level.value && styles.selectedEnergy
          ]}
          onPress={() => onChange(level.value)}
        >
          <Text style={styles.energyEmoji}>{level.label}</Text>
          <Text style={styles.energyDescription}>{level.description}</Text>
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
  energyButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: '18%',
  },
  selectedEnergy: {
    backgroundColor: '#007AFF',
  },
  energyEmoji: {
    fontSize: 16,
    marginBottom: 5,
  },
  energyDescription: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
  },
}); 