import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    card: string;
    shadow: string;
  };
  dark: boolean;
}

const lightTheme: Theme = {
  colors: {
    primary: '#FF6B35',
    secondary: '#F7931E',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    card: '#FFFFFF',
    shadow: '#000000',
  },
  dark: false,
};

const darkTheme: Theme = {
  colors: {
    primary: '#FF6B35',
    secondary: '#FF8C42',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    card: '#1E293B',
    shadow: '#000000',
  },
  dark: true,
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      } else {
        // Use system preference if no saved preference
        setIsDark(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem('themePreference', darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    saveThemePreference(newIsDark);
  };

  const setTheme = (darkMode: boolean) => {
    setIsDark(darkMode);
    saveThemePreference(darkMode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility function to create themed styles
export const createThemedStyles = (stylesFn: (theme: Theme) => any) => {
  return (theme: Theme) => stylesFn(theme);
}; 