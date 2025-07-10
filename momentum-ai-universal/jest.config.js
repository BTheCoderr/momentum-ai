module.exports = {
  preset: 'react-native',
  setupFiles: [
    '<rootDir>/jest.setup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-community)/)',
  ],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
}; 