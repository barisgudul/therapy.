import '@testing-library/jest-native/extend-expect';

// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// Expo-router mock
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

// react-native-chart-kit mock
jest.mock('react-native-chart-kit', () => ({ PieChart: () => null }));

// react-native-reanimated mock (if needed)
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
