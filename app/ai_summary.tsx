import { Ionicons } from '@expo/vector-icons';
import { Slider } from '@miblanchard/react-native-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { generatePersonalizedResponse } from '../hooks/useGemini';

export default function AISummaryScreen() {
  const router = useRouter();

  const [maxDays, setMaxDays] = useState(7);
  const [selectedDays, setSelectedDays] = useState(7);
  const [summaries, setSummaries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSummary, setActiveSummary] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const keys = await AsyncStorage.getAllKeys();
      const moods = keys.filter(k => k.startsWith('activity_'));
      const capped = Math.min(moods.length, 30);
      setMaxDays(capped || 1);
      setSelectedDays(capped || 1);
    })();
  }, []);

  const fetchSummary = async () => {
    if (loading) return;
    setLoading(true);
    const now = new Date();
    const entries: any[] = [];
    for (let i = 0; i < selectedDays; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const moodData = await AsyncStorage.getItem(`mood-${dateStr}`);
      const sessionData = await AsyncStorage.getItem(`session-${dateStr}`); // Eğer session verisi varsa

      if (moodData) {
        entries.push(JSON.parse(moodData));
      } else if (sessionData) {
        entries.push(JSON.parse(sessionData));
      } else {
        entries.push({ date: dateStr, activity: 'Günlük veya seans yapıldı, detay girilmedi.' });
      }
}


    const prompt = `Son ${selectedDays} gün içinde kullanıcı şu verileri girdi: ${JSON.stringify(entries)}. Bu verileri analiz ederek kullanıcıya duygusal durumuyla ilgili kısa, empatik bir analiz çıkar.`;
    const result = await generatePersonalizedResponse(prompt, '');
    setSummaries(prev => [result.trim(), ...prev]);
    setLoading(false);
  };

  const SummaryCard = ({ text }: { text: string }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        setActiveSummary(text);
        setModalVisible(true);
      }}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="document-text-outline" size={20} color={Colors.light.tint} />
      </View>
      <Text numberOfLines={3} style={styles.cardText}>{text}</Text>
    </TouchableOpacity>
  );

  const loadingHeader = loading ? (
    <View style={styles.loadingCard}>
      <ActivityIndicator size="small" color={Colors.light.tint} />
      <Text style={styles.loadingText}>Analiz oluşturuluyor...</Text>
    </View>
  ) : null;

  return (
    <LinearGradient colors={['#FFFFFF', '#F4F7FC']} style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      <Text style={styles.brand}>therapy<Text style={styles.dot}>.</Text></Text>
      <Text style={styles.title}>AI Ruh Hâli Analizi</Text>
      <Text style={styles.subtitle}>Duygu geçmişini analizle keşfet.</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.controlsBox}>
          <Text style={styles.label}>Kaç günlük veriyi analiz edelim?</Text>
          <Slider
            minimumValue={1}
            maximumValue={maxDays}
            step={1}
            value={selectedDays}
            onValueChange={v => setSelectedDays(Array.isArray(v) ? v[0] : v)}
            containerStyle={styles.sliderContainer}
            trackStyle={styles.sliderTrack}
            thumbStyle={styles.sliderThumb}
            minimumTrackTintColor={Colors.light.tint}
            renderThumbComponent={() => (
              <View style={styles.thumbInner}><Text style={styles.thumbText}>{selectedDays}</Text></View>
            )}
          />
          <TouchableOpacity style={[styles.button, loading && { opacity: 0.6 }]} disabled={loading} onPress={fetchSummary}>
            <Text style={styles.buttonText}>Analiz Oluştur</Text>
          </TouchableOpacity>
        </View>

        {summaries.length === 0 && !loading ? (
          <View style={styles.placeholderCard}>
            <Ionicons name="information-circle-outline" size={22} color="#9CA3AF" style={{ marginBottom: 6 }} />
            <Text style={styles.placeholderText}>Henüz analiz oluşturulmadı</Text>
          </View>
        ) : (
          <FlatList
            data={summaries}
            renderItem={({ item }) => <SummaryCard text={item} />}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.list}
            ListHeaderComponent={loadingHeader}
          />
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="document-text-outline" size={24} color={Colors.light.tint} style={{ marginBottom: 12 }} />
            <ScrollView style={{ maxHeight: '70%' }}>
              <Text style={styles.modalText}>{activeSummary}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeTxt}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const LIGHT_BORDER = '#E8EDF4';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
  },
  back: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 5,
  },
  brand: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.tint,
    textTransform: 'lowercase',
    marginBottom: 4,
  },
  dot: {
    color: '#5DA1D9',
    fontSize: 26,
    fontWeight: '700',
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1c1e',
    marginBottom: 2,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: '#6c7580',
    marginBottom: 24,
  },
  scroll: {
    paddingHorizontal: 22,
    paddingBottom: 80,
  },
  controlsBox: {
    marginBottom: 36,
  },
  label: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 12,
  },
  sliderContainer: {
    marginBottom: 14,
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  sliderThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  button: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  list: {
    gap: 18,
  },
  card: {
    flexDirection: 'row',
    padding: 30,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 2 : 0,
    alignItems: 'flex-start',
    gap: 15,
    borderWidth: 3,
    borderColor: Colors.light.tint,
    borderStyle: 'solid',
    alignSelf: 'stretch',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F6F8FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 32,
    borderWidth: 0.4,
    borderColor: LIGHT_BORDER,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 2 : 0,
    marginBottom: 18,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
  },
  placeholderCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: LIGHT_BORDER,
    borderRadius: 30,
    padding: 32,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: Platform.OS === 'android' ? 6 : 0,
  },
  modalText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  closeBtn: {
    marginTop: 26,
    backgroundColor: Colors.light.tint,
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 46,
  },
  closeTxt: {
    color: '#fff',
    fontWeight: '600',
  },
});
