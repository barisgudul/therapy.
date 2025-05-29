module.exports = {
  preset: 'react-native',
  setupFiles: [
    './jest.setup.js',
    '@testing-library/jest-native/extend-expect',
  ],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|expo|@expo|react-native-chart-kit|react-native-svg|@miblanchard/react-native-slider|react-native-reanimated|react-native-modal|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|react-native-web|react-native-vector-icons|react-native-confetti-cannon|react-native-html-to-pdf|react-native-pager-view|react-native-modal-datetime-picker|react-native-keyboard-aware-scroll-view|react-native-animatable)/)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
};
