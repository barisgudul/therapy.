import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DailyStreak from '../components/DailyStreak';
import { Colors } from '../constants/Colors';

export default function StreakHistoryScreen() {
  const router = useRouter();
  const [streakCount, setStreakCount] = useState(0);
  const [moodHistory, setMoodHistory] = useState<Array<{ 
    date: string; 
    mood: string; 
    reflection: string; 
    activityType: string;
    sessionType?: string;
  }>>([]);

  useEffect(() => {
    loadMoodHistory();
  }, []);

  const loadMoodHistory = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const moodKeys = keys.filter(k => k.startsWith('mood-'));
      const sessionKeys = keys.filter(k => k.startsWith('session-'));
      
      // Mood verilerini işle
      const moodHistory = await Promise.all(
        moodKeys.map(async (key) => {
          const mood = await AsyncStorage.getItem(key);
          const date = key.replace('mood-', '');
          
          let moodData = { mood: '', reflection: '', activityType: 'Günlük Yazıldı' };
          try {
            const parsed = JSON.parse(mood || '{}');
            moodData = {
              mood: parsed.mood || '',
              reflection: parsed.reflection || '',
              activityType: 'Günlük Yazıldı'
            };
          } catch {
            moodData = { mood: '', reflection: mood || '', activityType: 'Günlük Yazıldı' };
          }
          return {
            date,
            ...moodData
          };
        })
      );

      // Session verilerini işle
      const sessionHistory = await Promise.all(
        sessionKeys.map(async (key) => {
          const session = await AsyncStorage.getItem(key);
          const date = key.replace('session-', '');
          
          let sessionData = { mood: '', reflection: '', activityType: 'Terapi Seansı Yapıldı', sessionType: '' };
          try {
            const parsed = JSON.parse(session || '{}');
            const sessionType = parsed.sessions?.[0]?.type || '';
            let typeText = '';
            switch(sessionType) {
              case 'text': typeText = 'Mesajlaşma Terapisi Yapıldı'; break;
              case 'voice': typeText = 'Sesli Terapi Yapıldı'; break;
              case 'video': typeText = 'Görüntülü Terapi Yapıldı'; break;
              default: typeText = 'Terapi Seansı';
            }
            sessionData = {
              mood: parsed.mood || '',
              reflection: parsed.reflection || '',
              activityType: 'Terapi Seansı Yapıldı',
              sessionType: typeText
            };
          } catch {
            sessionData = { 
              mood: '', 
              reflection: session || '', 
              activityType: 'Terapi Seansı Yapıldı',
              sessionType: 'Terapi Seansı'
            };
          }
          return {
            date,
            ...sessionData
          };
        })
      );

      // Tüm kayıtları birleştir
      const allHistory = [...moodHistory, ...sessionHistory];
      
      // Aynı tarihli kayıtları birleştir
      const uniqueHistory = allHistory.reduce((acc, curr) => {
        const existing = acc.find(item => item.date === curr.date);
        if (existing) {
          // Eğer mood verisi varsa onu kullan
          if (curr.mood) {
            existing.mood = curr.mood;
            existing.reflection = curr.reflection;
          }
          // Aktivite türlerini birleştir
          if (curr.activityType === 'Terapi Seansı Yapıldı') {
            existing.activityType = existing.mood ? 
              `Günlük Yazıldı + ${curr.sessionType}` : 
              curr.sessionType;
          }
        } else {
          acc.push(curr);
        }
        return acc;
      }, [] as any[]);

      // Tarihe göre sırala
      const sortedHistory = uniqueHistory.sort((a, b) => b.date.localeCompare(a.date));
      setMoodHistory(sortedHistory);
    } catch (error) {
      console.error('Mood geçmişi yüklenemedi:', error);
    }
  };

  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
        </TouchableOpacity>
        <Text style={styles.title}>Günlük Seri</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <DailyStreak refreshKey={Date.now()} onStreakUpdate={setStreakCount} />
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{streakCount}</Text>
              <Text style={styles.statLabel}>Günlük Seri</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{moodHistory.length}</Text>
              <Text style={styles.statLabel}>Aktif Gün</Text>
            </View>
          </View>

          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Geçmiş Girişler</Text>
            {moodHistory.map((item) => (
              <View key={item.date} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <View>
                    <Text style={styles.historyDate}>
                      {new Date(item.date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.activityType}>{item.activityType}</Text>
                  </View>
                  {item.mood && (
                    <Text style={styles.moodEmoji}>{item.mood}</Text>
                  )}
                </View>
                {item.reflection && (
                  <View style={styles.messageContainer}>
                    <Text style={styles.historyMood}>{item.reflection}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.tint,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c7580',
  },
  historyContainer: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 14,
    color: '#6c7580',
    fontWeight: '500',
  },
  moodEmoji: {
    fontSize: 20,
  },
  messageContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
  },
  historyMood: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  activityType: {
    fontSize: 12,
    color: Colors.light.tint,
    marginTop: 2,
  },
}); 