import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
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
import { Colors } from '../constants/Colors';

const DAY_MS = 10 * 1000;          // ⚙️ TEST: 10 sn. 24 saat için 86_400_000 yap.
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  /* -------- Bildirim (her akşam 20:00) -------- */
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

  /* -------- State -------- */
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /* -------- Arkaplan animasyonu -------- */
  const animateBg = (open: boolean) =>
    Animated.timing(scaleAnim, {
      toValue: open ? 0.9 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

  /* -------- 24 saat & mesaj kontrolü -------- */
  const refreshState = useCallback(async () => {
    const [lastStr, todayMsg] = await AsyncStorage.multiGet(['lastReflectionAt', 'todayMessage']);
    const now = Date.now();

    if (lastStr[1] && now - Number(lastStr[1]) < DAY_MS && todayMsg[1]) {
      setAiMessage(todayMsg[1]);
    } else {
      setAiMessage(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshState();
    }, [refreshState])
  );

  /* -------- Kart tıklama -------- */
  const handleCardPress = async () => {
    const last = await AsyncStorage.getItem('lastReflectionAt');
    const now = Date.now();

    if (last && now - Number(last) < DAY_MS) {
      const todayMsg = await AsyncStorage.getItem('todayMessage');
      if (todayMsg) setAiMessage(todayMsg);
      setModalVisible(true);
      animateBg(true);
    } else {
      setAiMessage(null);          // eski mesajı temizle
      router.push('/daily_write'); // yeniden yaz
    }
  };

  /* -------- Modal kapatma -------- */
  const closeModal = () => {
    animateBg(false);
    setModalVisible(false);
    setAiMessage(null);            // modal kapatılınca sıfırla
  };

  /* -------- JSX -------- */
  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.flex}>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.brand}>
          therapy<Text style={styles.dot}>.</Text>
        </Text>

        <TouchableOpacity style={styles.greetingCard} onPress={handleCardPress}>
          <Ionicons name="sparkles-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.greetingText}>Bugün nasıl hissediyorsun?</Text>
        </TouchableOpacity>

        <Image
          source={require('../assets/therapy-illustration.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Zihnine iyi bak.</Text>
        <Text style={styles.subtitle}>Yapay zekâ destekli terapist ile birebir seans yap.</Text>

        <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/avatar')}>
          <Text style={styles.exploreText}>Terapistleri İncele</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/therapy_options')}>
          <Text style={styles.primaryText}>Terapi Türleri</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/how_it_works')}>
          <Text style={styles.linkText}>Terapiler nasıl işler?</Text>
        </TouchableOpacity>
      </Animated.View>

      {modalVisible && <BlurView intensity={60} tint="default" style={StyleSheet.absoluteFill} />}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="chatbox-ellipses-outline" size={28} color={Colors.light.tint} style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>AI Terapist</Text>
            <Text style={styles.modalMessage}>{aiMessage}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

/* -------- Stiller -------- */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 70 },
  brand: { textAlign: 'center', fontSize: 22, fontWeight: '600', color: Colors.light.tint, textTransform: 'lowercase', marginBottom: 12 },
  dot: { color: '#5DA1D9', fontSize: 26, fontWeight: '700' },
  greetingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.tint, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 18, marginBottom: 18, alignSelf: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 4 }, shadowRadius: 6, elevation: Platform.OS === 'android' ? 2 : 0 },
  greetingText: { fontSize: 15, color: '#fff', fontWeight: '500' },
  image: { width: '100%', height: 220, marginBottom: 20 },
  title: { textAlign: 'center', fontSize: 26, fontWeight: '700', color: '#1a1c1e', marginBottom: 4 },
  subtitle: { textAlign: 'center', fontSize: 15, color: '#6c7580', marginBottom: 28 },
  exploreButton: { alignSelf: 'center', borderColor: Colors.light.tint, borderWidth: 1.5, borderRadius: 28, paddingVertical: 12, paddingHorizontal: 26, marginBottom: 20 },
  exploreText: { color: Colors.light.tint, fontSize: 15, fontWeight: '600' },
  primaryButton: { backgroundColor: Colors.light.tint, borderRadius: 20, paddingVertical: 14, alignItems: 'center', marginBottom: 16, elevation: Platform.OS === 'android' ? 3 : 0 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkButton: { alignItems: 'center' },
  linkText: { fontSize: 14, color: Colors.light.tint, textDecorationLine: 'underline' },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 22, padding: 26, width, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: Platform.OS === 'android' ? 5 : 0 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.tint, marginBottom: 10 },
  modalMessage: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  closeButton: { backgroundColor: Colors.light.tint, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  closeText: { color: '#fff', fontWeight: '600' },
});
