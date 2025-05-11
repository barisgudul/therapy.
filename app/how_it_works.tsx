import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';

export default function HowItWorksScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.container}>
      {/* Geri Butonu */}
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>
          therapy<Text style={styles.dot}>.</Text>
        </Text>

        <Text style={styles.title}>Yapay Zekâ Destekli Terapi Nasıl İşler?</Text>

        <Text style={styles.paragraph}>
          Bu uygulama, psikoloji ilkeleriyle geliştirilen yapay zekâ temelli bir sistemle çalışır. Seçtiğiniz terapist görünümündeki yapay zekâ, sizi dikkatle dinler ve birebir iletişim kurar.
        </Text>

        <Text style={styles.paragraph}>
          Konuşmanız gerçek zamanlı olarak yazıya çevrilir ve analiz edilerek anlamlı, destekleyici yanıtlar üretilir. Sistem, empati ve yönlendirme becerisiyle duygusal destek sağlar.
        </Text>

        <Text style={styles.paragraph}>
          Tüm görüşmeler gizlidir. Veriler hiçbir şekilde kayıt altına alınmaz veya paylaşılmaz. Gizliliğiniz temel önceliğimizdir.
        </Text>

        <Text style={styles.paragraph}>
          Bu sistem psikolojik destek sunar ancak profesyonel bir terapistin yerini tutmaz.
        </Text>

        <Text style={styles.note}>
          Ciddi ruhsal sorunlar için bir uzmandan yüz yüze yardım almanız önemlidir.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  back: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  scroll: {
    padding: 28,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.tint,
    textTransform: 'lowercase',
    textAlign: 'center',
    marginBottom: 10,
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
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 15,
    color: '#6c7580',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'left',
  },
  note: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: 4,
  },
});
