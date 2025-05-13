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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';

const DAY_MS = 10 * 1000;
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nicknameModalVisible, setNicknameModalVisible] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
    Animated.timing(scaleAnim, {
      toValue: open ? 0.9 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

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

  const handleCardPress = async () => {
    const last = await AsyncStorage.getItem('lastReflectionAt');
    const now = Date.now();
    if (last && now - Number(last) < DAY_MS) {
      const todayMsg = await AsyncStorage.getItem('todayMessage');
      if (todayMsg) setAiMessage(todayMsg);
      setModalVisible(true);
      animateBg(true);
    } else {
      setAiMessage(null);
      router.push('/daily_write');
    }
  };

  const closeModal = () => {
    animateBg(false);
    setModalVisible(false);
    setAiMessage(null);
  };

  const handleStart = async () => {
    const stored = await AsyncStorage.getItem('userProfile');
    if (stored) {
      router.push('/avatar');
    } else {
      router.push('/profile');
    }
  };

  const handleSaveNickname = async () => {
    if (!nicknameInput.trim()) return;
    await AsyncStorage.setItem('nickname', nicknameInput.trim());
    setNicknameModalVisible(false);
    router.push('/avatar');
  };

  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.flex}>
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.headerWrapper}>
          <View style={styles.headerRow}>
            <Text style={styles.brand}>therapy</Text>
            <Text style={styles.dot}>.</Text>
            <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={40} color={Colors.light.tint} />
            </TouchableOpacity>
          </View>
        </View>

        <Image source={require('../assets/therapy-illustration.png')} style={styles.image} resizeMode="contain" />

        <Text style={styles.title}>Zihnine iyi bak.</Text>
        <Text style={styles.subtitle}>Yapay zekâ destekli terapist ile birebir seans yap.</Text>

        <TouchableOpacity style={styles.outlinedCard} onPress={handleCardPress}>
          <Ionicons name="sparkles-outline" size={22} color={Colors.light.tint} style={{ marginRight: 10 }} />
          <Text style={styles.outlinedText}>Bugün nasıl hissediyorsun?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleStart}>
          <Ionicons name="people-outline" size={20} color={Colors.light.tint} style={{ marginRight: 8 }} />
          <Text style={styles.secondaryText}>Terapistini Seç</Text>
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

      <Modal visible={nicknameModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sana nasıl hitap edelim?</Text>
            <TextInput
              placeholder="Bir isim yaz..."
              style={styles.input}
              value={nicknameInput}
              onChangeText={setNicknameInput}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNickname}>
              <Text style={styles.saveText}>Devam Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 22, paddingTop: 70 },
  headerWrapper: { marginTop: 60, marginBottom: 12 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  profileButton: { marginLeft: 200 },
  brand: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.tint,
    textTransform: 'lowercase',
  },
  dot: { color: '#5DA1D9', fontSize: 26, fontWeight: '700' },
  image: { width: '100%', height: 220, marginBottom: 20 },
  title: { textAlign: 'center', fontSize: 26, fontWeight: '700', color: '#1a1c1e', marginBottom: 4 },
  subtitle: { textAlign: 'center', fontSize: 15, color: '#6c7580', marginBottom: 28 },
  outlinedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.light.tint,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 18,
    alignSelf: 'center',
  },
  outlinedText: { fontSize: 15, color: Colors.light.tint, fontWeight: '500' },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.light.tint,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 44,
    marginBottom: 18,
    alignSelf: 'center',
  },
  secondaryText: { fontSize: 17, color: Colors.light.tint, fontWeight: '700' },
  linkButton: { alignItems: 'center' },
  linkText: { fontSize: 14, color: Colors.light.tint, textDecorationLine: 'underline' },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 26,
    width: width - 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: Platform.OS === 'android' ? 5 : 0,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.tint, marginBottom: 14 },
  modalMessage: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  closeButton: { backgroundColor: Colors.light.tint, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  closeText: { color: '#fff', fontWeight: '600' },
  input: { width: '100%', padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 12, marginBottom: 16 },
  saveBtn: { backgroundColor: Colors.light.tint, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 18 },
  saveText: { color: '#fff', fontWeight: '600' },
});
