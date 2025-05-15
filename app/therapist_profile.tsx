import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';

const therapistDetails: Record<string, any> = {
  therapist1: {
    name: 'Dr. Elif',
    title: 'Klinik Psikolog',
    persona: 'Şefkatli ve duygusal, anaç tavırlı',
    style: 'Empati ve dinleme öncelikli, duygulara odaklanır',
    specialty: 'Duygusal zorluklar, özşefkat, ilişki terapisi',
    motto: 'Duygularını onurlandırmak, kendini iyileştirmenin ilk adımıdır.',
    about: 'Ben Dr. Elif. Duyguların keşfi ve iyileşme yolculuğunda sana şefkatle eşlik ederim. Seanslarda her duygunun güvenle ifade edilebildiği, yargısız bir alan yaratırım. Stres, özgüven ve ilişki sorunlarında destek olurum.',
    image: require('../assets/Terapist_1.jpg'),
  },
  therapist2: {
    name: 'Dr. Deniz',
    title: 'Aile Terapisti',
    persona: 'Mantıklı ve analitik, çözüm odaklı',
    style: 'Yapıcı, net, doğrudan; bilişsel teknikler uygular',
    specialty: 'Aile içi iletişim, ilişki yönetimi, bilişsel davranışçı terapi',
    motto: 'Her sorunun ardında bir çözüm ve yeni bir başlangıç vardır.',
    about: 'Merhaba, ben Dr. Deniz. İlişkilerde denge ve anlayışı güçlendirmeye odaklanırım. Analitik yaklaşımım ile sorunun kökenini keşfeder, pratik ve uygulanabilir çözüm yolları sunarım. Özellikle aile içi iletişimde uzmanım.',
    image: require('../assets/Terapist_2.jpg'),
  },
  therapist3: {
    name: 'Dr. Lina',
    title: 'Bilişsel Davranışçı Uzmanı',
    persona: 'Enerjik ve motive edici, genç ruhlu',
    style: 'Cesaretlendirici, pozitif ve umut aşılayan',
    specialty: 'Öz güven, motivasyon, yaşam hedefleri, davranış değişikliği',
    motto: 'Bugün küçük bir adım, yarın büyük bir değişimin başlangıcıdır.',
    about: 'Selam! Ben Dr. Lina. Hayata pozitif bakışımla, güçlü yönlerini keşfetmen ve hedeflerine ulaşman için seni desteklerim. Seanslarımda motive edici, pratik ve genç bir enerji sunarım. Hedef belirleme ve değişim konularında yanındayım.',
    image: require('../assets/Terapist_3.jpg'),
  }
};

export default function TherapistProfile() {
  const router = useRouter();
  const { imageId } = useLocalSearchParams<{ imageId: string }>();
  // default therapist1, eğer imageId gelmezse
  const therapist = therapistDetails[imageId ?? 'therapist1'];

  return (
    <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Image source={therapist.image} style={styles.image} />
        <Text style={styles.name}>{therapist.name}</Text>
        <Text style={styles.title}>{therapist.title}</Text>

        <Text style={styles.persona}><Text style={{ fontWeight: 'bold' }}>Karakter:</Text> {therapist.persona}</Text>
        <Text style={styles.specialty}><Text style={{ fontWeight: 'bold' }}>Uzmanlık:</Text> {therapist.specialty}</Text>
        <Text style={styles.style}><Text style={{ fontWeight: 'bold' }}>Seans Tarzı:</Text> {therapist.style}</Text>
        <Text style={styles.motto}>"{therapist.motto}"</Text>
        <Text style={styles.description}>{therapist.about}</Text>

        <Text style={styles.subtitle}>Terapiler nasıl ilerler?</Text>
        <Text style={styles.steps}>
          • İlk görüşme: Tanışma ve ihtiyaçların belirlenmesi{'\n'}
          • 2-4. Seans: Duyguların ve geçmiş deneyimlerin keşfi{'\n'}
          • Sonraki: Hedef odaklı dönüşüm süreci
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push({
        pathname: '/therapy_options',
        params: { therapistId: imageId }
      })}

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
    marginBottom: 12,
  },
  persona: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
    marginTop: 8,
  },
  specialty: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  style: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  motto: {
    fontSize: 15,
    color: '#3887fe',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
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
