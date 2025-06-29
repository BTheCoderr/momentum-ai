import React from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  showLabel?: boolean;
  style?: any;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabel = true, style }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {isDark ? '🌙' : '☀️'} {isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>
      )}
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ 
          false: theme.colors.border, 
          true: theme.colors.primary 
        }}
        thumbColor={isDark ? theme.colors.surface : theme.colors.background}
        ios_backgroundColor={theme.colors.border}
      />
    </View>
  );
};

export const ThemeToggleButton: React.FC<{ style?: any }> = ({ style }) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        style
      ]}
      onPress={toggleTheme}
    >
      <Text style={[styles.buttonIcon, { color: theme.colors.text }]}>
        {isDark ? '🌙' : '☀️'}
      </Text>
      <Text style={[styles.buttonText, { color: theme.colors.text }]}>
        {isDark ? 'Dark' : 'Light'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 