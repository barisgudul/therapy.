import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { sendToGemini } from '../hooks/useGemini';

const { width, height } = Dimensions.get('window');
const PIP_SIZE = 100;

export default function SessionScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const pan = useState(new Animated.ValueXY({ x: width - PIP_SIZE - 10, y: 100 }))[0];
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted) requestPermission();

    Voice.onSpeechResults = (e) => {
      const text = e.value?.[0];
      setSpokenText(text);
      sendToGemini(text).then(setAiResponse);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start('tr-TR');
      setMicOn(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setMicOn(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Kamera sürükleme hareketi
  let lastX = width - PIP_SIZE - 10;
  let lastY = 100;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({ x: lastX, y: lastY });
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: (e, gestureState) => {
      let newX = lastX + gestureState.dx;
      let newY = lastY + gestureState.dy;

      newX = Math.max(0, Math.min(newX, width - PIP_SIZE));
      newY = Math.max(0, Math.min(newY, height - PIP_SIZE - 100));

      pan.setValue({ x: newX - lastX, y: newY - lastY });
    },
    onPanResponderRelease: (e, gestureState) => {
      lastX += gestureState.dx;
      lastY += gestureState.dy;
      pan.flattenOffset();
    },
  });

  if (!permission) return <Text>İzin kontrol ediliyor...</Text>;
  if (!permission.granted) return <Text>Kamera izni reddedildi.</Text>;

  return (
    <View style={styles.container}>
      {/* Terapist görseli */}
      <Image
        source={{ uri: 'https://randomuser.me/api/portraits/men/75.jpg' }}
        style={styles.therapist}
        resizeMode="cover"
      />

      {/* Kullanıcının küçük yuvarlak kamerası */}
      {cameraVisible && (
        <Animated.View
          style={[styles.pipWrapper, { transform: pan.getTranslateTransform() }]}
          {...panResponder.panHandlers}
        >
          <CameraView facing="front" style={styles.camera} />
        </Animated.View>
      )}

      {/* Kontrol butonları */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => setCameraVisible((prev) => !prev)}
          style={[styles.iconBtn, cameraVisible ? styles.btnActive : styles.btnMuted]}
        >
          <Ionicons name={cameraVisible ? 'videocam' : 'videocam-off'} size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={micOn ? stopListening : startListening}
          style={[styles.iconBtn, micOn ? styles.btnActive : styles.btnMuted]}
        >
          <Ionicons name={micOn ? 'mic' : 'mic-off'} size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconBtn, styles.btnEnd]}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Konuşma ve cevap metni */}
      <View style={styles.textBox}>
        <Text style={styles.text}>🎙️ Sen: {spokenText}</Text>
        <Text style={styles.text}>🤖 AI: {aiResponse}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  therapist: { width: '100%', height: '100%', position: 'absolute' },
  pipWrapper: {
    position: 'absolute',
    width: PIP_SIZE,
    height: PIP_SIZE,
    borderRadius: PIP_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#000',
    zIndex: 10,
  },
  camera: { width: '100%', height: '100%' },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 26,
  },
  iconBtn: {
    padding: 18,
    borderRadius: 40,
    backgroundColor: '#999',
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  btnActive: {
    backgroundColor: Colors.light.tint,
  },
  btnMuted: {
    backgroundColor: '#9AA5B1',
  },
  btnEnd: {
    backgroundColor: '#D1483E',
  },
  textBox: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#000a',
    padding: 10,
    borderRadius: 8,
  },
  text: {
    color: '#fff',
    marginBottom: 6,
  },
});
