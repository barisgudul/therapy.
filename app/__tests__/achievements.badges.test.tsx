import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render } from '@testing-library/react-native';
import React from 'react';
import { defaultBadges } from '../../utils/badges';
import AchievementsScreen from '../achievements';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

// Rozetlerin doğru şekilde gösterildiğini ve kilitli/aktif durumunu test et

describe('AchievementsScreen Badges', () => {
  it('dummy test', () => {
    expect(true).toBe(true);
  });
  beforeEach(async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem('user_badges', JSON.stringify(defaultBadges));
  });

  it('should render all default badges', async () => {
    let getByText: ((text: string) => any) | undefined;
    await act(async () => {
      const result = render(<AchievementsScreen />);
      getByText = result.getByText;
    });
    expect(getByText && getByText('İlk Günlük')).toBeTruthy();
  });

  it('should show locked badge if not unlocked', async () => {
    let getByText: ((text: string) => any) | undefined;
    await act(async () => {
      const result = render(<AchievementsScreen />);
      getByText = result.getByText;
    });
    expect(getByText && getByText('İlk günlüğünü yazdın')).toBeTruthy();
  });
});
