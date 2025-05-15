import { Ionicons } from '@expo/vector-icons';
import { Slider } from '@miblanchard/react-native-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// @ts-ignore
import RNHTMLtoPDF from 'react-native-html-to-pdf';

import { Colors } from '../constants/Colors';
import { generateDetailedMoodSummary } from '../hooks/useGemini';

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
      const sessionKeys = keys.filter(k => k.startsWith('session-'));
      const capped = Math.min(sessionKeys.length, 30);
      setMaxDays(capped || 1);
      setSelectedDays(capped || 1);
    })();
  }, []);

  const fetchSummary = async () => {
    if (loading) return;
    setLoading(true);

    // Bütün anahtarları al
    const keys = await AsyncStorage.getAllKeys();

    // Sadece session- ile başlayanları bul ve tarihe göre yeni > eski sırala
    const sessionKeys = keys
      .filter(k => k.startsWith('session-'))
      .sort((a, b) => b.localeCompare(a)); // Yeni tarihler başta

    // Seçili gün kadar en güncel kayıtları al
    const selectedSessionKeys = sessionKeys.slice(0, selectedDays);

    const entries: any[] = [];
    for (const key of selectedSessionKeys) {
      const val = await AsyncStorage.getItem(key);
      if (val) {
        entries.push({ date: key.replace('session-', ''), ...JSON.parse(val) });
      }
    }

    if (entries.length === 0) {
      setSummaries(prev => ["Hiç veri bulunamadı.", ...prev]);
      setLoading(false);
      return;
    }

    try {
      const result = await generateDetailedMoodSummary(entries, selectedDays);
      setSummaries(prev => [result.trim(), ...prev]);
    } catch (e) {
      setSummaries(prev => ["AI özet üretilemedi, lütfen tekrar deneyin.", ...prev]);
    }
    setLoading(false);
  };

  // PDF OLUŞTURMA ve PAYLAŞIM
  const exportToPDF = async () => {
    if (!activeSummary) return;
    const htmlContent = `
      <div style="padding:32px 18px;font-family:Helvetica,Arial,sans-serif">
        <h2 style="color:#4988e5;text-align:center;margin-bottom:16px;">therapy<span style="color:#5DA1D9;">.</span> - AI Ruh Hâli Analizi</h2>
        <div style="height:2px;width:100%;background:#e3e8f0;margin:12px 0 22px 0;border-radius:2px"></div>
        <div style="font-size:15px;line-height:1.7;color:#222;text-align:center">
          ${activeSummary.replace(/\n/g, "<br/>")}
        </div>
        <div style="margin-top:32px;color:#9ca3af;font-size:12px;text-align:center">
          Bu PDF, therapy. uygulamasının AI analiz özelliği ile otomatik oluşturulmuştur.
        </div>
      </div>
    `;
    try {
      const options = {
        html: htmlContent,
        fileName: 'therapy_ai_analiz',
        directory: 'Documents',
      };
      const file = await RNHTMLtoPDF.convert(options);
      if (file.filePath) {
        await Sharing.shareAsync(file.filePath, {
          dialogTitle: 'PDF Analizini Paylaş',
        });
      } else {
        Alert.alert('PDF oluşturulamadı!');
      }
    } catch (e) {
      Alert.alert('PDF veya paylaşım başarısız.', String((e as any)?.message || e));
    }
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

      {/* --- Ultra Zarif Modal --- */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.25)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 36,
            paddingHorizontal: 32,
            paddingVertical: 38,
            alignItems: 'center',
            width: '92%',
            maxWidth: 420,
            shadowColor: '#000',
            shadowOpacity: 0.13,
            shadowOffset: { width: 0, height: 12 },
            shadowRadius: 32,
            elevation: 14,
          }}>
            <View style={{
              width: 74, height: 74, borderRadius: 37,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
              backgroundColor: 'transparent',
            }}>
              <LinearGradient
                colors={['#E0ECFD', '#F4E6FF']}
                style={{ ...StyleSheet.absoluteFillObject, borderRadius: 37 }}
              />
              <Ionicons name="document-text-outline" size={32} color={Colors.light.tint} />
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: Colors.light.tint,
              marginBottom: 12,
              letterSpacing: 0.1,
              textAlign: 'center'
            }}>
              AI Duygu Analizi
            </Text>
            <View style={{
              width: 48,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#E8EDF4',
              marginBottom: 22,
              marginTop: -6,
            }} />
            <ScrollView style={{ maxHeight: 350, marginBottom: 26 }} showsVerticalScrollIndicator={false}>
              <Text style={{
                fontSize: 16,
                color: '#232b38',
                lineHeight: 24,
                textAlign: 'center',
                fontWeight: '400'
              }}>
                {activeSummary || "Analiz yüklenemedi."}
              </Text>
            </ScrollView>
            <View style={{ flexDirection: 'row', gap: 18, marginTop: 4 }}>
              <TouchableOpacity
                onPress={exportToPDF}
                style={{
                  backgroundColor: "#E3EAFD",
                  borderRadius: 22,
                  paddingHorizontal: 28,
                  paddingVertical: 11,
                  alignItems: "center",
                  flexDirection: "row",
                  marginRight: 6
                }}>
                <Ionicons name="download-outline" size={20} color={Colors.light.tint} style={{ marginRight: 6 }} />
                <Text style={{ color: Colors.light.tint, fontWeight: "600", fontSize: 15 }}>PDF İndir & Paylaş</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: Colors.light.tint,
                  borderRadius: 22,
                  paddingHorizontal: 30,
                  paddingVertical: 12,
                  alignItems: "center",
                  flexDirection: "row"
                }}>
                <Ionicons name="close" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Kapat</Text>
              </TouchableOpacity>
            </View>
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
});
