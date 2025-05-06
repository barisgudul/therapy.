import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Colors } from '../constants/Colors';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#f6f8fa', '#e9eff5']} style={styles.container}>
      <Animatable.View animation="fadeInDown" delay={100} duration={800}>
        <Text style={styles.logo}>therapy <Text style={styles.dot}>•</Text></Text>
      </Animatable.View>

      <Animatable.Image
        animation="fadeInUp"
        delay={300}
        source={require('../assets/therapy-illustration.png')} // koyu mavi beyaz temalı sade bir illustrasyon öneririm
        style={styles.image}
        resizeMode="contain"
      />

      <Animatable.View animation="fadeInUp" delay={600}>
        <Text style={styles.title}>Zihnine iyi bak.</Text>
        <Text style={styles.subtitle}>Yapay zekâ destekli terapist ile birebir seans yap.</Text>

        <TouchableOpacity style={styles.buttonWrapper} onPress={() => router.push('/avatar')} activeOpacity={0.8}>
          <LinearGradient colors={['#3E6B89', '#5DA1D9']} style={styles.button}>
            <Text style={styles.buttonText}>Terapiye Başla</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Terapiler nasıl işler?</Text>
        </TouchableOpacity>
      </Animatable.View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
    textTransform: 'lowercase',
    marginBottom: 12,
    letterSpacing: 1,
  },
  dot: {
    color: '#5DA1D9',
    fontSize: 28,
  },
  image: {
    width: '100%',
    height: 250,
    marginVertical: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.softText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
  },
  secondaryText: {
    color: Colors.light.tint,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
