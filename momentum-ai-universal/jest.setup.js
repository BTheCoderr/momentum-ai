// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Expo Constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://test.supabase.co',
      supabaseAnonKey: 'test-key',
    },
  },
}));

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.View = ({ children, testID, style, ...props }) => (
    <div data-testid={testID} style={style} {...props}>{children}</div>
  );

  RN.Text = ({ children, testID, style, ...props }) => (
    <div data-testid={testID} style={style} {...props}>{children}</div>
  );

  RN.Animated = {
    ...RN.Animated,
    View: RN.View,
    timing: () => ({
      start: jest.fn(),
    }),
    loop: () => ({
      start: jest.fn(),
    }),
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
    })),
  };

  return RN;
}); 