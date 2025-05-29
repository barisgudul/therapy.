import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import DailyWriteScreen from '../daily_write';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

// Günlük yazma ekranı için temel testler

describe('DailyWriteScreen', () => {
  it('dummy test', () => {
    expect(true).toBe(true);
  });
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should render mood buttons', async () => {
    let getByText: ((text: string) => any) | undefined;
    await act(async () => {
      const result = render(<DailyWriteScreen />);
      getByText = result.getByText;
    });
    expect(getByText && getByText('Neşeli bir gün')).toBeTruthy();
    expect(getByText && getByText('Hüzünlü bir an')).toBeTruthy();
  });

  it('should allow mood selection and note input', async () => {
    let getByText: ((text: string) => any) | undefined, getByPlaceholderText: ((text: string) => any) | undefined;
    await act(async () => {
      const result = render(<DailyWriteScreen />);
      getByText = result.getByText;
      getByPlaceholderText = result.getByPlaceholderText;
    });
    if (getByText && getByPlaceholderText) {
      fireEvent.press(getByText('Neşeli bir gün'));
      const input = getByPlaceholderText('Bugün neler hissettin?');
      fireEvent.changeText(input, 'Bugün çok iyiyim!');
      expect(input.props.value).toBe('Bugün çok iyiyim!');
    } else {
      throw new Error('getByText or getByPlaceholderText is undefined');
    }
  });
});
