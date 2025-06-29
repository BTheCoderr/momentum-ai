// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native-web');

  return {
    ...RN,
    ActivityIndicator: 'ActivityIndicator',
    TouchableOpacity: 'TouchableOpacity',
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