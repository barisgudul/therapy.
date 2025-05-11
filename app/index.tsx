import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Image, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.container}>
      <Text style={styles.logo}>
        therapy<Text style={styles.dot}>.</Text>
      </Text>

      <Image source={require('../assets/therapy-illustration.png')} style={styles.image} resizeMode="contain" />

      <Text style={styles.title}>Zihnine iyi bak.</Text>
      <Text style={styles.subtitle}>Yapay zekâ destekli terapist ile birebir seans yap.</Text>

      <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/avatar')}>
        <Text style={styles.exploreText}>Terapistleri İncele</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('./therapy_options')}>
        <Text style={styles.primaryText}>Terapi Türleri</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/how_it_works')}>
        <Text style={styles.linkText}>Terapiler nasıl işler?</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.tint,
    textTransform: 'lowercase',
    textAlign: 'center',
    marginBottom: 12,
  },
  dot: {
    color: '#5DA1D9',
    fontSize: 26,
    fontWeight: '700',
  },
  image: {
    width: '100%',
    height: 220,
    marginVertical: 20,
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
    lineHeight: 22,
  },
  exploreButton: {
    alignSelf: 'center',
    borderColor: Colors.light.tint,
    borderWidth: 1.5,
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 26,
    marginBottom: 20,
  },
  exploreText: {
    color: Colors.light.tint,
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: Colors.light.tint,
    textDecorationLine: 'underline',
  },
});
