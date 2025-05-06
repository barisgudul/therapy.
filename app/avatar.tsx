import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Colors } from '../constants/Colors';

const avatars = [
  {
    id: '1',
    name: 'Dr. Elif',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '2',
    name: 'Dr. Ayhan',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '3',
    name: 'Dr. Lina',
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
];

export default function AvatarScreen() {
  const router = useRouter();

  const handleSelect = (name: string, image: string) => {
    router.push({
      pathname: '/session',
      params: { name, image },
    });
  };

  return (
    <LinearGradient colors={['#f7f9fc', '#f0f4f9']} style={styles.container}>
      <Animatable.Text animation="fadeInDown" delay={100} style={styles.logo}>
        therapy <Text style={styles.dot}>•</Text>
      </Animatable.Text>

      <Animatable.Text animation="fadeInDown" delay={200} style={styles.title}>
        Terapistini Seç
      </Animatable.Text>

      <Animatable.Text animation="fadeInDown" delay={300} style={styles.subtitle}>
        Kendine en uygun terapisti seçerek yolculuğuna başla.
      </Animatable.Text>

      <FlatList
        data={avatars}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Animatable.View animation="fadeInUp" delay={400}>
            <TouchableOpacity style={styles.card} onPress={() => handleSelect(item.name, item.image)}>
              <Image source={{ uri: item.image }} style={styles.avatar} />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.desc}>Klinik Psikolog</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
      />
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.tint,
    textTransform: 'lowercase',
    marginBottom: 16,
    letterSpacing: 1,
    textAlign: 'center',
  },
  dot: {
    color: '#5DA1D9',
    fontSize: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.softText,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  list: {
    paddingBottom: 60,
    alignItems: 'center',
    gap: 24,
  },
  card: {
    backgroundColor: '#FAFBFC',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: width - 56,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  desc: {
    fontSize: 14,
    color: Colors.light.softText,
  },
});
