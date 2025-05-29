import AsyncStorage from '@react-native-async-storage/async-storage';
import { statisticsManager } from '../statisticsManager';

describe('statisticsManager', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('should initialize statistics correctly', async () => {
    const stats = await statisticsManager.getStatistics();
    expect(stats.totalEntries).toBe(0);
    expect(stats.totalWords).toBe(0);
    expect(stats.entriesByDay).toEqual({});
    expect(stats.entriesByMonth).toEqual({});
    expect(stats.moodDistribution).toEqual({});
  });

  it('should update statistics with a new entry', async () => {
    const entry = { text: 'Bugün çok iyiyim.', mood: '😊', date: '2025-05-30', source: 'daily_write' };
    const stats = await statisticsManager.updateStatistics(entry);
    expect(stats.totalEntries).toBe(1);
    expect(stats.entriesByDay['2025-05-30']).toBe(1);
    expect(stats.moodDistribution['😊']).toBe(1);
    expect(stats.totalWords).toBe(3);
  });

  it('should not double count the same date', async () => {
    const entry = { text: 'Bugün çok iyiyim.', mood: '😊', date: '2025-05-30', source: 'daily_write' };
    await statisticsManager.updateStatistics(entry);
    const stats2 = await statisticsManager.updateStatistics(entry);
    expect(stats2.totalEntries).toBe(1);
    expect(stats2.entriesByDay['2025-05-30']).toBe(1);
  });

  it('should reset statistics', async () => {
    const entry = { text: 'Bugün çok iyiyim.', mood: '😊', date: '2025-05-30', source: 'daily_write' };
    await statisticsManager.updateStatistics(entry);
    await statisticsManager.resetStatistics();
    const stats = await statisticsManager.getStatistics();
    expect(stats.totalEntries).toBe(0);
    expect(stats.totalWords).toBe(0);
  });
});
