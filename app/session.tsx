import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Camera } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Draggable from 'react-native-draggable';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const CameraType = {
  front: 'front',
  back: 'back',
} as const;

export default function SessionScreen() {
  const router = useRouter();
  const { image } = useLocalSearchParams<{ image: string }>();

  const [muted, setMuted] = useState(false);
  const [pipVisible, setPipVisible] = useState(true);
  const [fullCam, setFullCam] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('Kamera izni gerekli', 'Devam etmek için kameraya izin ver.');
      }
    })();
  }, []);

  const toggleOrientation = async () => {
    const current = await ScreenOrientation.getOrientationAsync();
    const next =
      current === ScreenOrientation.Orientation.PORTRAIT_UP
        ? ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
        : ScreenOrientation.OrientationLock.PORTRAIT_UP;

    await ScreenOrientation.lockAsync(next);
  };

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text>Kamera izni reddedildi.</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f7f9fc', '#f0f4f9']} style={styles.container}>
      {/* Terapist video */}
      <TouchableOpacity activeOpacity={1} onLongPress={toggleOrientation} style={styles.videoBox}>
        <Video
          source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
          shouldPlay
          isMuted={muted}
          resizeMode={ResizeMode.COVER}
          style={styles.video}
        />
      </TouchableOpacity>

      {/* Senin kameran - küçük pencere */}
      {pipVisible && !fullCam && (
        <Draggable x={width - 120} y={80}>
          <View style={styles.pipWrapper}>
            <Camera
              style={styles.pipCam}
              type={CameraType.front}
              ref={(ref: Camera | null) => {
                cameraRef.current = ref;
              }}
            />
            <TouchableOpacity
              style={styles.pipClose}
              onPress={() => setPipVisible(false)}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pipExpand}
              onPress={() => setFullCam(true)}
            >
              <Ionicons name="expand" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </Draggable>
      )}

      {/* Senin kameran - tam ekran */}
      {fullCam && (
        <TouchableOpacity style={styles.fullCam} onPress={() => setFullCam(false)} activeOpacity={1}>
          <Camera style={{ flex: 1 }} type={CameraType.front} />
        </TouchableOpacity>
      )}

      {/* Kontroller */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => setMuted(!muted)}
          activeOpacity={0.85}
          style={[styles.iconBtn, muted ? styles.micMuted : styles.micActive]}
        >
          <Ionicons name={muted ? 'mic-off' : 'mic'} size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.85}
          style={[styles.iconBtn, styles.endBtn]}
        >
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBox: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  pipWrapper: {
    width: 100,
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  pipCam: {
    flex: 1,
  },
  pipClose: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#0009',
    padding: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  pipExpand: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#0009',
    padding: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  fullCam: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: '#000',
    zIndex: 10,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 26,
    marginBottom: 40,
  },
  iconBtn: {
    padding: 18,
    borderRadius: 40,
    elevation: Platform.OS === 'android' ? 4 : 0,
    backgroundColor: '#999',
  },
  micActive: {
    backgroundColor: Colors.light.tint,
  },
  micMuted: {
    backgroundColor: '#9AA5B1',
  },
  endBtn: {
    backgroundColor: '#D1483E',
  },
});
