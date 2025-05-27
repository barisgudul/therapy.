// app/index.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DailyStreak from '../components/DailyStreak';
import { Colors } from '../constants/Colors';
import { defaultBadges } from '../utils/badges';
import { statisticsManager } from '../utils/statisticsManager';

const todayISO = () => new Date().toISOString().split('T')[0];
const { width } = Dimensions.get('window');

/* --------- DEBUG: Aktiviteleri Yazdır --------- */
async function showAllActivities() {
  const keys = await AsyncStorage.getAllKeys();
  const activityKeys = keys.filter(k => k.startsWith('activity-'));
  if (activityKeys.length === 0) {
    console.log('Hiç aktivite kaydı yok!');
    Alert.alert('Hiç aktivite kaydı yok!');
    return;
  }
  for (const key of activityKeys) {
    const value = await AsyncStorage.getItem(key);
    try {
      console.log(key, JSON.parse(value || ''));
    } catch {
      console.log(key, value);
    }
  }
  Alert.alert('Tüm aktiviteler konsola yazdırıldı!');
}
/* ---------------------------------------------- */

/* -------- HomeScreen -------- */
export default function HomeScreen() {
  const router = useRouter();

  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshStreak, setRefreshStreak] = useState(Date.now());
  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [streakCount, setStreakCount] = useState(0);

  /* bildirim */
  useEffect(() => {
    (async () => {
      await Notifications.cancelAllScheduledNotificationsAsync();
      // ... bildirim planlama kodu değişmedi ...
    })();
  }, []);

  const animateBg = (open: boolean) =>
    Animated.timing(scaleAnim, { toValue: open ? 0.9 : 1, duration: 250, useNativeDriver: true }).start();

  /* kart/modal durumu */
  const refreshState = useCallback(async () => {
    const [storedDate, todayMsg] = await AsyncStorage.multiGet(['todayDate', 'todayMessage']);
    storedDate[1] === todayISO() && todayMsg[1] ? setAiMessage(todayMsg[1]) : setAiMessage(null);
    setRefreshStreak(Date.now());
  }, []);

  useFocusEffect(useCallback(() => { refreshState(); }, [refreshState]));

  /* günlük kartı */
  const handleCardPress = async () => {
    const storedDate = await AsyncStorage.getItem('todayDate');
    if (storedDate === todayISO()) {
      const msg = await AsyncStorage.getItem('todayMessage');
      if (msg) setAiMessage(msg);
      setModalVisible(true);
      animateBg(true);
    } else {
      setAiMessage(null);
      router.push('/daily_write');
    }
  };

  /* Terapistini Seç */
  const handleStart = async () => {
    const stored = await AsyncStorage.getItem('userProfile');
    stored ? router.push('/avatar') : router.push('/profile');
  };

  /* ---------------- DEMO RESET ---------------- */
  const clearDemoData = async () => {
    try {
      /* 1) Tüm anahtarları al */
      const keys = await AsyncStorage.getAllKeys();

      /* 2) Günlük (mood-...) anahtarlarını ve önemli demo verilerini ayrı ayrı sil */
      const moodKeys = keys.filter(k => k.startsWith('mood-'));
      if (moodKeys.length) await AsyncStorage.multiRemove(moodKeys);

      const otherKeys = keys.filter(k =>
        k.startsWith('session-') ||
        k.includes('stats') ||
        k.includes('streak') ||
        k === 'todayDate' ||
        k === 'todayMessage' ||
        k === 'lastEntryDate' ||
        k === 'currentStreak'
      );
      if (otherKeys.length) await AsyncStorage.multiRemove(otherKeys);

      /* 3) İstatistik yöneticisini tamamen sıfırla */
      await statisticsManager.resetStatistics();

      /* 4) Varsayılan rozet ve streak verilerini yeniden yaz */
      await AsyncStorage.setItem('user_badges', JSON.stringify(defaultBadges));
      await AsyncStorage.setItem('user_streak_data', JSON.stringify({
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: '',
        totalEntries: 0,
        badges: [],
      }));

      /* 5) UI state'i yenile */
      await refreshState();

      Alert.alert('Tüm veriler sıfırlandı!');
    } catch (err) {
      console.error('Veriler sıfırlanırken hata:', err);
      Alert.alert('Hata', 'Veriler sıfırlanırken bir hata oluştu.');
    }
  };
 /* Bugünkü Girişi Sıfırla (debug) */
  const clearTodayDate = async () => {
    await AsyncStorage.removeItem('todayDate');
    setAiMessage(null);
    setRefreshStreak(Date.now());
    Alert.alert('Bugünkü giriş sıfırlandı. Artık günlük ekranına girebilirsiniz.');
  };

  /* Yalnızca Gerçek Günlük Kayıtlarını Koru (debug) */
  const keepOnlyRealDailyEntries = async () => {
    // 1. Tüm mood- kayıtlarını al
    const keys = await AsyncStorage.getAllKeys();
    const moodKeys = keys.filter(k => k.startsWith('mood-'));
    let kept = 0, removed = 0;
    let realEntries = [];
    for (const key of moodKeys) {
      const value = await AsyncStorage.getItem(key);
      try {
        const obj = JSON.parse(value || '{}');
        // Sadece daily_write.tsx'den gelenler: source === 'daily_write'
        if (obj.source !== 'daily_write') {
          await AsyncStorage.removeItem(key);
          removed++;
        } else {
          kept++;
          realEntries.push({
            text: obj.reflection || '',
            mood: obj.mood,
            date: key.replace('mood-', ''),
            source: 'daily_write',
          });
        }
      } catch {
        // Hatalı kayıtları da sil
        await AsyncStorage.removeItem(key);
        removed++;
      }
    }
    // 2. İstatistikleri ve işlenmiş mood tarihlerini sıfırla
    await AsyncStorage.removeItem('moodStats');
    await AsyncStorage.removeItem('moodDist');
    await AsyncStorage.removeItem('processedMoodDates');
    await AsyncStorage.removeItem('user_statistics');
    await AsyncStorage.removeItem('mood-stats-processed');
    // 3. Kalan gerçek günlükleri tekrar istatistiklere ekle
    for (const entry of realEntries) {
      await statisticsManager.updateStatistics(entry);
    }
    Alert.alert('Temizlendi', `${kept} gerçek günlük kaydı kaldı, ${removed} yapay/analiz kaydı silindi. İstatistikler yeniden oluşturuldu.`);
    setRefreshStreak(Date.now());
  };

  /* ------------- UI ------------- */
  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.flex}>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        {/* başlık + profil */}
        <View style={styles.headerWrapper}>
          <View style={styles.headerRow}>
            <Text style={styles.brand}>therapy</Text>
            <Text style={styles.dot}>.</Text>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={40} color={Colors.light.tint} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <Image source={require('../assets/therapy-illustration.png')} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>Zihnine iyi bak.</Text>
          <Text style={styles.subtitle}>Yapay zekâ destekli terapist ile birebir seans yap.</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonUnified} onPress={handleCardPress}>
              <Ionicons name="sparkles-outline" size={22} color={Colors.light.tint} style={{ marginRight: 10 }} />
              <Text style={styles.outlinedText}>Bugün nasıl hissediyorsun?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonUnified} onPress={() => router.push('/achievements')}>
              <Ionicons name="trophy-outline" size={22} color={Colors.light.tint} style={{ marginRight: 10 }} />
              <Text style={styles.outlinedText}>Başarılarım</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.buttonUnified} onPress={() => router.push('/ai_summary')}>
              <Ionicons name="analytics-outline" size={22} color={Colors.light.tint} style={{ marginRight: 10 }} />
              <Text style={styles.outlinedText}>AI Ruh Hâli Özeti</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonUnified} onPress={() => router.push('/diary')}>
              <Ionicons name="book-outline" size={22} color={Colors.light.tint} style={{ marginRight: 10 }} />
              <Text style={styles.outlinedText}>AI Destekli Günlük</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonUnified} onPress={handleStart}>
              <Ionicons name="people-outline" size={20} color={Colors.light.tint} style={{ marginRight: 8 }} />
              <Text style={styles.secondaryText}>Terapistini Seç</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/how_it_works')}>
              <Text style={styles.linkText}>Terapiler nasıl işler?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>      {/* DEMO RESET ve DEBUG only dev */}
      {__DEV__ && (
        <View style={styles.debugBottomContainer}>
          <TouchableOpacity style={[styles.debugBtnWide, { backgroundColor: '#888' }]} onPress={clearDemoData}>
            <Text style={{ color: '#fff' }}>Tüm verileri sıfırla</Text>
          </TouchableOpacity>
        </View>
      )}

      {modalVisible && <BlurView intensity={60} tint="default" style={StyleSheet.absoluteFill} />}

      {/* Modal: streak + AI sözü */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <DailyStreak refreshKey={refreshStreak} />

            <Ionicons name="chatbox-ellipses-outline" size={28} color={Colors.light.tint} style={{ marginBottom: 8 }} />
            <Text style={styles.modalTitle}>AI Terapist</Text>
            <Text style={styles.modalMessage}>{aiMessage}</Text>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                animateBg(false);
              }}
            >
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  buttonUnified: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.4,
    borderColor: Colors.light.tint,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 28,
    alignSelf: 'center',
    minWidth: 260,
  },
  buttonText: {
    fontSize: 15.5,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  flex: { flex: 1 },
  container: { 
    flex: 1, 
    paddingHorizontal: 22, 
    paddingTop: 50 
  },
  headerWrapper: { 
    marginBottom: 24 
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  profileButton: { 
    marginLeft: 200 
  },
  contentWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  debugContainerTop: {
    position: 'absolute',
    top: 12,
    right: 10,
    flexDirection: 'row',
    gap: 6,
    zIndex: 1000,
    alignItems: 'center',
  },
  debugContainerPhoto: {
    position: 'absolute',
    top: 170,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    zIndex: 1000,
    alignItems: 'center',
  },
  debugContainerPhotoColumn: {
    position: 'absolute',
    top: 170,
    left: 0,
    right: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    zIndex: 1000,
  },
  debugBottomContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  debugBtnMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e11d48',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginLeft: 0,
    marginRight: 0,
    minWidth: 0,
    minHeight: 0,
    height: 28,
  },
  debugBtnWide: {
    width: '90%',
    alignSelf: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  debugBtnTxt: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 3,
    marginRight: 1,
    padding: 0,
  },
  debugBtnWideTxt: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
    marginRight: 2,
    padding: 0,
  },
  brand: { textAlign: 'center', fontSize: 22, fontWeight: '600', color: Colors.light.tint, textTransform: 'lowercase' },
  dot: { color: '#5DA1D9', fontSize: 26, fontWeight: '700' },
  image: { 
    width: '100%', 
    height: 200, 
    marginBottom: 16 
  },
  outlinedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.light.tint, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 18, marginBottom: 18, alignSelf: 'center' },
  outlinedText: { fontSize: 15, color: Colors.light.tint, fontWeight: '500' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: Colors.light.tint, borderRadius: 30, paddingVertical: 16, paddingHorizontal: 44, marginBottom: 18, alignSelf: 'center' },
  secondaryText: { fontSize: 17, color: Colors.light.tint, fontWeight: '700' },
  linkButton: { alignItems: 'center' },
  linkText: { fontSize: 14, color: Colors.light.tint, textDecorationLine: 'underline' },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCard: { backgroundColor: '#fff', borderRadius: 22, padding: 26, width: width - 48, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: Platform.OS === 'android' ? 5 : 0 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.tint, marginBottom: 8 },
  modalMessage: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 22, marginBottom: 18 },
  closeButton: { backgroundColor: Colors.light.tint, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  closeText: { color: '#fff', fontWeight: '600' },
  streakWrapper: { alignItems: 'center', marginBottom: 12 },
  streakTitle: { fontSize: 16, fontWeight: '700', color: Colors.light.tint, marginBottom: 6 },
  streakRow: { flexDirection: 'row', columnGap: 10 },
  streakDot: { width: 18, height: 18, borderRadius: 9 },
  dotActive: { backgroundColor: Colors.light.tint },
  dotInactive: { backgroundColor: '#fff', borderWidth: 1.2, borderColor: '#E5E7EB' },
  resetBtn: {
    backgroundColor: '#e11d48',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 26,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6 }
      : { elevation: 4 }),
  },
  resetTxt: { color: '#fff', fontWeight: '600' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
});