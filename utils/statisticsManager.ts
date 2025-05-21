import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

interface Statistics {
  totalEntries: number;
  entriesByDay: { [key: string]: number };
  entriesByMonth: { [key: string]: number };
  averageEntryLength: number;
  mostActiveDay: string;
  mostActiveMonth: string;
  totalWords: number;
  moodDistribution: { [key: string]: number };
}

const STATS_KEY = 'user_statistics';

export const statisticsManager = {
  async updateStatistics(entry: { text: string; mood?: string }): Promise<Statistics> {
    try {
      const storedStats = await AsyncStorage.getItem(STATS_KEY);
      let stats: Statistics = storedStats ? JSON.parse(storedStats) : {
        totalEntries: 0,
        entriesByDay: {},
        entriesByMonth: {},
        averageEntryLength: 0,
        mostActiveDay: '',
        mostActiveMonth: '',
        totalWords: 0,
        moodDistribution: {},
      };

      const today = moment().format('YYYY-MM-DD');
      const month = moment().format('YYYY-MM');
      const wordCount = entry.text.trim().split(/\s+/).length;

      // Güncellemeler
      stats.totalEntries += 1;
      stats.totalWords += wordCount;
      
      // Günlük istatistikler
      stats.entriesByDay[today] = (stats.entriesByDay[today] || 0) + 1;
      stats.entriesByMonth[month] = (stats.entriesByMonth[month] || 0) + 1;

      // Ortalama giriş uzunluğu
      stats.averageEntryLength = stats.totalWords / stats.totalEntries;

      // En aktif gün ve ay
      stats.mostActiveDay = Object.entries(stats.entriesByDay)
        .sort((a, b) => b[1] - a[1])[0][0];
      
      stats.mostActiveMonth = Object.entries(stats.entriesByMonth)
        .sort((a, b) => b[1] - a[1])[0][0];

      // Ruh hali dağılımı
      if (entry.mood) {
        stats.moodDistribution[entry.mood] = (stats.moodDistribution[entry.mood] || 0) + 1;
      }

      // Verileri kaydet
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));

      return stats;
    } catch (error) {
      console.error('İstatistikler güncellenirken hata:', error);
      throw error;
    }
  },

  async getStatistics(): Promise<Statistics> {
    try {
      const storedStats = await AsyncStorage.getItem(STATS_KEY);
      return storedStats ? JSON.parse(storedStats) : {
        totalEntries: 0,
        entriesByDay: {},
        entriesByMonth: {},
        averageEntryLength: 0,
        mostActiveDay: '',
        mostActiveMonth: '',
        totalWords: 0,
        moodDistribution: {},
      };
    } catch (error) {
      console.error('İstatistikler alınırken hata:', error);
      throw error;
    }
  },

  async getWeeklyStats(): Promise<{ date: string; count: number }[]> {
    try {
      const stats = await this.getStatistics();
      const lastWeek = moment().subtract(7, 'days');
      
      return Array.from({ length: 7 }, (_, i) => {
        const date = moment(lastWeek).add(i, 'days').format('YYYY-MM-DD');
        return {
          date,
          count: stats.entriesByDay[date] || 0,
        };
      });
    } catch (error) {
      console.error('Haftalık istatistikler alınırken hata:', error);
      throw error;
    }
  },

  async getMonthlyStats(): Promise<{ month: string; count: number }[]> {
    try {
      const stats = await this.getStatistics();
      const last6Months = moment().subtract(6, 'months');
      
      return Array.from({ length: 6 }, (_, i) => {
        const month = moment(last6Months).add(i, 'months').format('YYYY-MM');
        return {
          month,
          count: stats.entriesByMonth[month] || 0,
        };
      });
    } catch (error) {
      console.error('Aylık istatistikler alınırken hata:', error);
      throw error;
    }
  },
}; 