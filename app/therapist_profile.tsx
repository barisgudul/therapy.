import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';

const therapistImages: Record<string, any> = {
  therapist1: require('../assets/Terapist_1.jpg'),
  therapist2: require('../assets/Terapist_2.jpg'),
  therapist3: require('../assets/Terapist_3.jpg'),
};

export default function TherapistProfile() {
  const router = useRouter();
  const { name, imageId } = useLocalSearchParams<{ name: string; imageId: string }>();
  const therapistImage = therapistImages[imageId ?? 'therapist1'];

  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={therapistImage} style={styles.image} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.title}>Klinik Psikolog</Text>

        <Text style={styles.description}>
          Merhaba! Ben {name}. Bireysel terapilerde özellikle duygusal zorluklar, stres yönetimi ve özsaygı üzerine çalışıyorum. Seanslarımız gizlilik içerisinde ve sana özel planlanır.
        </Text>

        <Text style={styles.subtitle}>Terapiler nasıl ilerler?</Text>
        <Text style={styles.steps}>
          • İlk görüşme: Tanışma ve ihtiyaçların belirlenmesi{'\n'}
          • 2-4. Seans: Duyguların ve geçmiş deneyimlerin keşfi{'\n'}
          • Sonraki: Hedef odaklı dönüşüm süreci
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/therapy_options')}
        >
          <Text style={styles.buttonText}>Terapi Seçenekleri</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 20,
    zIndex: 10,
  },
  content: {
    paddingBottom: 60,
  },
  image: {
    width: 240,
    height: 240,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.light.text,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    textAlign: 'center',
    color: Colors.light.softText,
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 10,
  },
  steps: {
    fontSize: 14,
    color: '#555',
    marginBottom: 30,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.light.tint,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
