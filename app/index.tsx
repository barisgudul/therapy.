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
      console.log(key, JSON.parse(value));
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
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Bugün nasılsın?',
          body: '1 cümleyle kendini ifade etmek ister misin?',
          data: { route: '/daily_write' },
        },
        trigger: { hour: 20, minute: 0, repeats: true } as any,
      });
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
      // zaten açılmışsa: modal
      const msg = await AsyncStorage.getItem('todayMessage');
      if (msg) setAiMessage(msg);
      setModalVisible(true);
      animateBg(true);
    } else {
      // ilk tıklama → tarihi hemen kaydet
      await AsyncStorage.setItem('todayDate', todayISO());
      setAiMessage(null);
      router.push('/daily_write');
    }
  };

  /* Terapistini Seç */
  const handleStart = async () => {
    const stored = await AsyncStorage.getItem('userProfile');
    stored ? router.push('/avatar') : router.push('/profile');
  };

  /* DEMO reset (gelistirmede) */
  const clearDemoData = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter(
      k =>
        k.startsWith('mood-') ||
        ['todayDate', 'lastReflectionAt', 'todayMessage', 'userProfile', 'nickname'].includes(k)
    );
    await AsyncStorage.multiRemove(toRemove);
    setAiMessage(null);
    setRefreshStreak(Date.now());
    Alert.alert('Demo verisi temizlendi.');
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

            <TouchableOpacity style={styles.buttonUnified} onPress={() => router.push('/streak_history')}>
              <Ionicons name="calendar-outline" size={22} color={Colors.light.tint} style={{ marginRight: 10 }} />
              <Text style={styles.outlinedText}>Günlük Seri Geçmişi</Text>
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
      </Animated.View>

      {/* DEMO RESET ve DEBUG only dev */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <TouchableOpacity style={styles.resetBtn} onPress={clearDemoData}>
            <Text style={styles.resetTxt}>Demo Sıfırla</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: '#14b8a6' }]}
            onPress={showAllActivities}
          >
            <Text style={[styles.resetTxt, { color: '#fff' }]}>Aktiviteleri Yazdır</Text>
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
  debugContainer: {
    position: 'absolute',
    bottom: 40,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  brand: { textAlign: 'center', fontSize: 22, fontWeight: '600', color: Colors.light.tint, textTransform: 'lowercase' },
  dot: { color: '#5DA1D9', fontSize: 26, fontWeight: '700' },
  image: { 
    width: '100%', 
    height: 200, 
    marginBottom: 16 
  },
  title: { 
    textAlign: 'center', 
    fontSize: 26, 
    fontWeight: '700', 
    color: '#1a1c1e', 
    marginBottom: 4 
  },
  subtitle: { 
    textAlign: 'center', 
    fontSize: 15, 
    color: '#6c7580', 
    marginBottom: 24 
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
});