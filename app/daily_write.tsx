import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewBase,
} from 'react-native-keyboard-aware-scroll-view';
import { Colors } from '../constants/Colors';

const moods = ['😊', '😔', '😡', '😟', '😍', '😴', '😐'];
const moodMessages: Record<string, string> = {
  '😊': 'Kendini iyi hissetmen harika. Bu hissin farkında olman çok değerli.',
  '😔': 'Zor bir gün geçirmiş olabilirsin. Bu duygularla kalmak bile iyileştirici olabilir.',
  '😡': 'Öfke yoğun bir duygudur. Onu bastırmadan fark etmek çok kıymetli.',
  '😟': 'Endişe etmek doğaldır. Şu anda burada olmak bile bir cesaret göstergesidir.',
  '😍': 'İçinde taşıdığın sevgi hissi seni parlatıyor olabilir.',
  '😴': 'Yorgunluk, bedeninin sana dinlenmeye ihtiyacın olduğunu söyleme şeklidir.',
  '😐': 'Nötr hissetmek de hissetmektir. Bu denge noktası bazen iyileştiricidir.',
};

const DEV_MODE = false;

export default function DailyWriteScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [messageVisible, setMessageVisible] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const scrollViewRef = useRef<KeyboardAwareScrollViewBase>(null);
  const hiddenInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Simüle edilmiş klavye aç/kapa
    setTimeout(() => {
      hiddenInputRef.current?.focus();
      setTimeout(() => {
        hiddenInputRef.current?.blur();
      }, 36);
    }, 16);

    const showListener = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToPosition(0, 300, true);
      }, 50);
    });

    return () => showListener.remove();
  }, []);

  const handleSave = async () => {
    if (!selectedMood || !note) return;

    const now = Date.now();
    const today = new Date(now).toISOString().split('T')[0];
    const message = moodMessages[selectedMood];

    await AsyncStorage.multiSet([
      [`mood-${today}`, JSON.stringify({ mood: selectedMood, reflection: note })],
      ['todayMessage', message],
      ['todayDate', today],
      ['lastReflectionAt', now.toString()],
    ]);

    Keyboard.dismiss();
    setAiMessage(message);
    setMessageVisible(true);
  };

  const closeModal = () => {
    setMessageVisible(false);
    router.replace('/');
  };

  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      {/* 👇 Gizli input simülasyonu */}
      <TextInput ref={hiddenInputRef} style={{ height: 0, width: 0, opacity: 0 }} />

      <KeyboardAwareScrollView
        ref={scrollViewRef}
        enableOnAndroid
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Bugün nasıl hissediyorsun?</Text>

        <View style={styles.moodRow}>
          {moods.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.moodBtn, selectedMood === m && styles.selectedMood]}
              onPress={() => setSelectedMood(m)}
            >
              <Text style={styles.mood}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>1 cümleyle bugünü özetle:</Text>
        <TextInput
          style={styles.input}
          value={note}
          onChangeText={setNote}
          placeholder="Bugün kendim için şunu yaptım..."
          placeholderTextColor="#999"
          returnKeyType="send"
          blurOnSubmit
          multiline={false}
          onSubmitEditing={() => {
            if (selectedMood && note) handleSave();
          }}
        />

        <TouchableOpacity
          style={[styles.saveBtn, (!selectedMood || !note) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!selectedMood || !note}
        >
          <Text style={styles.saveText}>Kaydet</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>

      <Modal visible={messageVisible} transparent animationType="fade" onRequestClose={closeModal}>
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

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 24 },
  back: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1c1e', textAlign: 'center', marginBottom: 24 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 28 },
  moodBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#eee',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMood: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
  mood: { fontSize: 26 },
  label: { fontSize: 15, color: '#6c7580', marginBottom: 10 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    fontSize: 15,
    marginBottom: 30,
    minHeight: 60,
    textAlignVertical: 'top',
    color: '#1c1c1e',
  },
  saveBtn: {
    backgroundColor: Colors.light.tint,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#ccd9e1' },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.tint, marginBottom: 10 },
  modalMessage: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  closeButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  closeText: { color: '#fff', fontWeight: '600' },
});
