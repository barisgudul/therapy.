import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string;
  totalEntries: number;
  badges: string[];
}

const STREAK_KEY = 'user_streak_data';
const BADGES = {
  THREE_DAYS: '3 Gün Serisi',
  SEVEN_DAYS: '7 Gün Serisi',
  THIRTY_DAYS: '30 Gün Serisi',
  HUNDRED_DAYS: '100 Gün Serisi',
  FIRST_ENTRY: 'İlk Günlük',
  WEEKLY_GOAL: 'Haftalık Hedef',
  MONTHLY_GOAL: 'Aylık Hedef',
};

export const streakManager = {
  async updateStreak(): Promise<{ streakData: StreakData; newBadges: string[] }> {
    try {
      const today = moment().format('YYYY-MM-DD');
      const storedData = await AsyncStorage.getItem(STREAK_KEY);
      let streakData: StreakData = storedData 
        ? JSON.parse(storedData)
        : {
            currentStreak: 0,
            longestStreak: 0,
            lastEntryDate: '',
            totalEntries: 0,
            badges: [],
          };

      const lastEntry = moment(streakData.lastEntryDate);
      const daysSinceLastEntry = moment().diff(lastEntry, 'days');

      // Yeni rozetler
      const newBadges: string[] = [];

      // İlk günlük rozeti
      if (streakData.totalEntries === 0) {
        newBadges.push(BADGES.FIRST_ENTRY);
      }

      // Streak güncelleme
      if (daysSinceLastEntry === 1) {
        streakData.currentStreak += 1;
      } else if (daysSinceLastEntry > 1) {
        streakData.currentStreak = 1;
      }

      // En uzun streak güncelleme
      if (streakData.currentStreak > streakData.longestStreak) {
        streakData.longestStreak = streakData.currentStreak;
      }

      // Streak rozetleri
      if (streakData.currentStreak === 3 && !streakData.badges.includes(BADGES.THREE_DAYS)) {
        newBadges.push(BADGES.THREE_DAYS);
      }
      if (streakData.currentStreak === 7 && !streakData.badges.includes(BADGES.SEVEN_DAYS)) {
        newBadges.push(BADGES.SEVEN_DAYS);
      }
      if (streakData.currentStreak === 30 && !streakData.badges.includes(BADGES.THIRTY_DAYS)) {
        newBadges.push(BADGES.THIRTY_DAYS);
      }
      if (streakData.currentStreak === 100 && !streakData.badges.includes(BADGES.HUNDRED_DAYS)) {
        newBadges.push(BADGES.HUNDRED_DAYS);
      }

      // Toplam giriş sayısı güncelleme
      streakData.totalEntries += 1;
      streakData.lastEntryDate = today;

      // Yeni rozetleri ekle
      streakData.badges = [...streakData.badges, ...newBadges];

      // Verileri kaydet
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData));

      return { streakData, newBadges };
    } catch (error) {
      console.error('Streak güncellenirken hata:', error);
      throw error;
    }
  },

  async getStreakData(): Promise<StreakData> {
    try {
      const storedData = await AsyncStorage.getItem(STREAK_KEY);
      return storedData ? JSON.parse(storedData) : {
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: '',
        totalEntries: 0,
        badges: [],
      };
    } catch (error) {
      console.error('Streak verisi alınırken hata:', error);
      throw error;
    }
  },

  async resetStreak(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STREAK_KEY);
    } catch (error) {
      console.error('Streak sıfırlanırken hata:', error);
      throw error;
    }
  },
}; 