import { NativeModules } from 'react-native';

// Mock React Native components and modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      select: jest.fn(obj => obj.native || obj.default || {}),
    },
    // Properly mock View component without referencing ViewNativeComponent
    View: jest.fn(({ children, ...props }) => children),
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
  isLoading: jest.fn(() => false),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(() => Promise.resolve()),
  },
}));

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
  ok: true,
  status: 200,
  headers: new Headers(),
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock ActivityIndicator
jest.mock('react-native/Libraries/Components/ActivityIndicator/ActivityIndicator', () => 'ActivityIndicator');

// Setup for React Native Web
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'web',
      select: jest.fn(obj => obj.web || obj.default || {}),
    },
    StyleSheet: {
      ...RN.StyleSheet,
      create: styles => styles,
    },
  };
});

// ... rest of the file ... 