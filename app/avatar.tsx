import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';

const avatars = [
  {
    id: '1',
    name: 'Dr. Elif',
    imageId: 'therapist1',
    thumbnail: require('../assets/Terapist_1.jpg'),
    title: 'Klinik Psikolog',
  },
  {
    id: '2',
    name: 'Dr. Deniz',
    imageId: 'therapist2',
    thumbnail: require('../assets/Terapist_2.jpg'),
    title: 'Aile Terapisti',
  },
  {
    id: '3',
    name: 'Dr. Lina',
    imageId: 'therapist3',
    thumbnail: require('../assets/Terapist_3.jpg'),
    title: 'Bilişsel Davranışçı Uzmanı',
  },
];

export default function AvatarScreen() {
  const router = useRouter();

  const handleSelect = (name: string, imageId: string) => {
    router.push({
      pathname: 'therapist_profile',
      params: { name, imageId },
    });
  };

  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      <Text style={styles.brand}>
        therapy<Text style={styles.dot}>.</Text>
      </Text>

      <Text style={styles.title}>Terapistini Seç</Text>
      <Text style={styles.subtitle}>Senin için en uygun uzmanı seçerek yolculuğuna başla.</Text>

      <FlatList
        data={avatars}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.thumbnail} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.titleText}>{item.title}</Text>
              <TouchableOpacity onPress={() => handleSelect(item.name, item.imageId)} style={styles.explore}>
                <Text style={styles.exploreText}>Terapisti İncele</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.light.tint} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 70,
    backgroundColor: '#F9FAFB',
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
    marginBottom: 10,
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
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: '#6c7580',
    marginBottom: 30,
  },
  list: {
    paddingBottom: 40,
    gap: 28,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 2,
  },
  titleText: {
    fontSize: 14,
    color: '#7a7f87',
    marginBottom: 8,
  },
  explore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exploreText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
});
