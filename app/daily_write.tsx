import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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

const DEV_MODE = false;           // true iken 7 gün → 60 sn

export default function DailyWriteScreen() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState('');
  const [note, setNote] = useState('');
  const [messageVisible, setMessageVisible] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

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

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Geçen hafta böyle hissediyordun',
        body: message.slice(0, 60) + '…  Şimdi nasılsın?',
      },
      trigger: {
        seconds: DEV_MODE ? 60 : 60 * 60 * 24 * 7,
        repeats: false,
      } as any,
    });

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
      {/* geri ok */}
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      {/* ===  Klavye uyumlu alan  === */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ ios: 90, android: 80 })}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Bugün nasıl hissediyorsun?</Text>

          {/* mood seçimi */}
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
        </ScrollView>
      </KeyboardAvoidingView>
      {/* ===  Klavye uyumlu alan sonu === */}

      {/* AI mesajı modalı */}
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

/* ---------- Stil ---------- */
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 24 },
  back: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: '#1a1c1e', textAlign: 'center', marginBottom: 24 },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 28 },
  moodBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 30, borderWidth: 1, borderColor: '#eee', width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  selectedMood: { backgroundColor: Colors.light.tint, borderColor: Colors.light.tint },
  mood: { fontSize: 26 },
  label: { fontSize: 15, color: '#6c7580', marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 18, padding: 16, fontSize: 15, marginBottom: 30, minHeight: 60, textAlignVertical: 'top', color: '#1c1c1e' },
  saveBtn: { backgroundColor: Colors.light.tint, borderRadius: 28, paddingVertical: 14, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#ccd9e1' },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 22, padding: 26, width: width - 48, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: Platform.OS === 'android' ? 5 : 0 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.light.tint, marginBottom: 10 },
  modalMessage: { fontSize: 15, color: '#333', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  closeButton: { backgroundColor: Colors.light.tint, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  closeText: { color: '#fff', fontWeight: '600' },
});
