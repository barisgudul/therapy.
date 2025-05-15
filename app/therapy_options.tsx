import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

export default function TherapyOptionsScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.container}>
      {/* Geri Butonu */}
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      <Text style={styles.logo}>
        therapy<Text style={styles.dot}>.</Text>
      </Text>

      <Text style={styles.title}>Terapi Türünü Seç</Text>
      <Text style={styles.subtitle}>İhtiyacına en uygun terapi yöntemini belirleyerek yolculuğuna başla.</Text>

      <View style={styles.cardContainer}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('./sessions/text_session')}>
          <Ionicons name="chatbubble-ellipses-outline" size={28} color={Colors.light.tint} />
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Yazışma Terapisi</Text>
            <Text style={styles.cardDesc}>Mesajlaşarak dilediğin zaman düşüncelerini paylaş.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('./sessions/voice_session')}>
          <Ionicons name="mic-outline" size={28} color={Colors.light.tint} />
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Sesli Terapi</Text>
            <Text style={styles.cardDesc}>Sadece sesle iletişim kurarak daha derin bağ kur.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => router.push('./sessions/video_session')}>
          <Ionicons name="videocam-outline" size={28} color={Colors.light.tint} />
          <View style={styles.textBlock}>
            <Text style={styles.cardTitle}>Görüntülü Terapi</Text>
            <Text style={styles.cardDesc}>AI terapist ile yüz yüze, gerçek zamanlı bir seans yap.</Text>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  back: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 5,
  },
  logo: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.tint,
    textTransform: 'lowercase',
    textAlign: 'center',
    marginBottom: 8,
  },
  dot: {
    color: '#5DA1D9',
    fontSize: 26,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1c1e',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6c7580',
    textAlign: 'center',
    marginBottom: 28,
  },
  cardContainer: {
    gap: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  textBlock: {
    marginLeft: 14,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#6d7583',
    lineHeight: 20,
  },
});
