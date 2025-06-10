import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image, Platform, StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { generateTherapistReply } from '../../hooks/useGemini';
import { useVoiceSession } from '../../hooks/useVoiceSession';
import { saveToSessionData } from '../../storage/sessionData';
import { getSessionStats } from '../../utils/helpers';

const therapistImages: Record<string, any> = {
  therapist1: require('../../assets/Terapist_1.jpg'),
  therapist2: require('../../assets/Terapist_2.jpg'),
  therapist3: require('../../assets/Terapist_3.jpg'),
  coach1: require('../../assets/coach-can.jpg')
};

export default function VoiceSessionScreen() {
  const { therapistId } = useLocalSearchParams<{ therapistId: string }>();
  const router = useRouter();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [aiResponse, setAiResponse] = React.useState('');
  const [messageCount, setMessageCount] = React.useState(1);
  const [isSoundCheckComplete, setIsSoundCheckComplete] = useState(false);
  const [isSoundCheckInProgress, setIsSoundCheckInProgress] = useState(false);

  const {
    isRecording,
    isProcessing,
    transcript,
    startRecording,
    stopRecording,
    speakText,
    cleanup,
  } = useVoiceSession({
    onTranscriptReceived: async (text) => {
      console.log('Transcript alındı:', text);
      if (text) {
        const response = await generateTherapistReply(
          therapistId || 'therapist1',
          text,
          '', // moodHint
          '', // chatHistory
          messageCount
        );
        setAiResponse(response);
        speakText(response);
        setMessageCount(prev => prev + 1);
      }
    },
    onSpeechStarted: () => {
      console.log('Konuşma başladı');
    },
    onSpeechEnded: () => {
      console.log('Konuşma bitti');
    },
  });

  const startSoundCheck = async () => {
    try {
      setIsSoundCheckInProgress(true);
      await startRecording();
      setTimeout(async () => {
        await stopRecording();
        setIsSoundCheckInProgress(false);
        if (transcript) {
          setIsSoundCheckComplete(true);
          Alert.alert(
            "Ses Kontrolü Başarılı",
            "Ses sisteminiz düzgün çalışıyor. Terapiye başlayabilirsiniz.",
            [{ text: "Tamam" }]
          );
        } else {
          Alert.alert(
            "Ses Kontrolü Başarısız",
            "Sesiniz algılanamadı. Lütfen mikrofonunuzun çalıştığından emin olun ve tekrar deneyin.",
            [{ text: "Tekrar Dene", onPress: startSoundCheck }]
          );
        }
      }, 3000);
    } catch (error) {
      console.error('Ses kontrolü sırasında hata:', error);
      setIsSoundCheckInProgress(false);
      Alert.alert(
        "Hata",
        "Ses kontrolü sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        [{ text: "Tekrar Dene", onPress: startSoundCheck }]
      );
    }
  };

  useEffect(() => {
    pulseAnim.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: isRecording ? 1.1 : 1.25,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [isRecording]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleExit = async () => {
    await cleanup();
    await saveSession();
    router.back();
  };

  async function saveSession() {
    try {
      await saveToSessionData({
        sessionType: "voice",
        newMessages: transcript ? [{ text: transcript, sender: 'user' }] : [],
      });

      const sessionStats = await getSessionStats();
    } catch (error) {
      console.error('Seans kaydedilirken hata:', error);
    }
  }

  if (!isSoundCheckComplete) {
    return (
      <LinearGradient colors={isDark ? ['#000000', '#1c2e40'] : ['#F9FAFB', '#ECEFF4']} style={styles.container}>
        <View style={styles.therapistVideo}>
          <Image 
            source={therapistImages[therapistId] || therapistImages.therapist1} 
            style={styles.therapistImage}
          />
        </View>

        <TouchableOpacity onPress={handleExit} style={styles.back}>
          <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
        </TouchableOpacity>

        <Text style={styles.logo}>
          therapy<Text style={styles.dot}>.</Text>
        </Text>
        <Text style={[styles.title, { color: isDark ? '#fff' : Colors.light.text }]}>
          Ses Kontrolü
        </Text>

        <Text style={[styles.description, { color: isDark ? '#fff' : Colors.light.text }]}>
          Terapiye başlamadan önce ses sisteminizi kontrol edelim.
          Lütfen "Ses Kontrolünü Başlat" butonuna tıklayın ve 3 saniye boyunca konuşun.
        </Text>

        <TouchableOpacity
          onPress={startSoundCheck}
          style={[styles.button, styles.btnActive]}
          disabled={isSoundCheckInProgress}
        >
          <Text style={styles.buttonText}>
            {isSoundCheckInProgress ? "Ses Kontrolü Yapılıyor..." : "Ses Kontrolünü Başlat"}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={isDark ? ['#000000', '#1c2e40'] : ['#F9FAFB', '#ECEFF4']} style={styles.container}>
      <View style={styles.therapistVideo}>
        <Image 
          source={therapistImages[therapistId] || therapistImages.therapist1} 
          style={styles.therapistImage}
        />
      </View>

      <TouchableOpacity onPress={handleExit} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      <Text style={styles.logo}>
        therapy<Text style={styles.dot}>.</Text>
      </Text>
      <Text style={[styles.title, { color: isDark ? '#fff' : Colors.light.text }]}>
        Sesli Terapi
      </Text>

      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: isRecording ? Colors.light.tint : Colors.light.tint,
          },
        ]}
      />

      {transcript && (
        <Text style={[styles.transcript, { color: isDark ? '#fff' : Colors.light.text }]}>
          Sen: {transcript}
        </Text>
      )}

      {aiResponse && (
        <Text style={[styles.transcript, { color: isDark ? '#fff' : Colors.light.text, backgroundColor: '#e0e0e0' }]}>
          AI: {aiResponse}
        </Text>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
          style={[styles.button, isRecording ? styles.btnActive : styles.btnMuted]}
          disabled={isProcessing}
        >
          <Ionicons name={isRecording ? 'mic' : 'mic-off'} size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleExit} style={[styles.button, styles.btnMuted]}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 40,
  },
  back: {
    position: 'absolute',
    top: 52,
    left: 24,
    zIndex: 10,
  },
  logo: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.light.tint,
    textTransform: 'lowercase',
    marginBottom: 8,
  },
  dot: {
    color: Colors.light.tint,
    fontSize: 26,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: Colors.light.tint,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  transcript: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  controls: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 80,
    marginBottom: 50,
  },
  button: {
    padding: 18,
    borderRadius: 50,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  btnActive: {
    backgroundColor: Colors.light.tint,
  },
  btnMuted: {
    backgroundColor: '#9AA5B1',
  },
  therapistVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  therapistImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});