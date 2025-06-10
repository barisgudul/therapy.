import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
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

const { width, height } = Dimensions.get('window');

const therapistImages: Record<string, any> = {
  therapist1: require('../../assets/Terapist_1.jpg'),
  therapist2: require('../../assets/Terapist_2.jpg'),
  therapist3: require('../../assets/Terapist_3.jpg'),
  coach1: require('../../assets/coach-can.jpg')
};

export default function VoiceSessionScreen() {
  const { therapistId } = useLocalSearchParams<{ therapistId: string }>();
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [aiResponse, setAiResponse] = useState('');
  const [messageCount, setMessageCount] = useState(1);
  const [isSoundCheckComplete, setIsSoundCheckComplete] = useState(false);
  const [isSoundCheckInProgress, setIsSoundCheckInProgress] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0);
  const sessionTimer = useRef<NodeJS.Timeout>();

  const {
    isRecording,
    isProcessing: isVoiceProcessing,
    transcript,
    startRecording,
    stopRecording,
    speakText,
    cleanup,
  } = useVoiceSession({
    onTranscriptReceived: async (text) => {
      console.log('Transcript alındı:', text);
      if (text) {
        setIsProcessing(true);
        try {
          const response = await generateTherapistReply(
            therapistId || 'therapist1',
            text,
            '', // moodHint
            '', // chatHistory
            messageCount
          );
          setAiResponse(response);
          await speakText(response);
          setMessageCount(prev => prev + 1);
        } catch (error) {
          console.error('AI yanıt hatası:', error);
          Alert.alert('Hata', 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen tekrar deneyin.');
        } finally {
          setIsProcessing(false);
        }
      }
    },
    onSpeechStarted: () => {
      console.log('Konuşma başladı');
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    },
    onSpeechEnded: () => {
      console.log('Konuşma bitti');
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    },
    onSoundLevelChange: (level) => {
      setSoundLevel(level);
    },
  });

  useEffect(() => {
    // Seans süresini takip et
    sessionTimer.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);

    return () => {
      if (sessionTimer.current) {
        clearInterval(sessionTimer.current);
      }
    };
  }, []);

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        duration: sessionDuration,
      });

      const sessionStats = await getSessionStats();
    } catch (error) {
      console.error('Seans kaydedilirken hata:', error);
    }
  }

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
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
              backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
            }
          ]}
        />
      </View>

      <TouchableOpacity onPress={handleExit} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      <Text style={styles.logo}>
        therapy<Text style={styles.dot}>.</Text>
      </Text>

      <View style={styles.sessionInfo}>
        <Text style={[styles.duration, { color: isDark ? '#fff' : Colors.light.text }]}>
          {formatDuration(sessionDuration)}
        </Text>
        <Text style={[styles.title, { color: isDark ? '#fff' : Colors.light.text }]}>
          Sesli Terapi
        </Text>
      </View>

      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: isRecording ? Colors.light.tint : Colors.light.tint,
          },
        ]}
      >
        {isRecording && (
          <View style={styles.soundLevelIndicator}>
            <View 
              style={[
                styles.soundLevelBar,
                { 
                  height: `${Math.min(100, soundLevel * 100)}%`,
                  backgroundColor: '#fff'
                }
              ]} 
            />
          </View>
        )}
      </Animated.View>

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

      {isProcessing && (
        <View style={styles.processingIndicator}>
          <ActivityIndicator size="small" color={Colors.light.tint} />
          <Text style={[styles.processingText, { color: isDark ? '#fff' : Colors.light.text }]}>
            Düşünüyorum...
          </Text>
        </View>
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
  sessionInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  duration: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
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
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  soundLevelIndicator: {
    width: 20,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  soundLevelBar: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
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
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  processingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    lineHeight: 24,
  },
});