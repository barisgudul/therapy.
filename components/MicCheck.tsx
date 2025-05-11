import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MicCheck() {
  const recording = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [volume, setVolume] = useState<number>(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const startMic = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return;
      setPermissionGranted(true);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.caf',
          audioQuality: 2,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        isMeteringEnabled: true,
      });

      await rec.startAsync();
      recording.current = rec;

      intervalRef.current = setInterval(async () => {
        const status = await rec.getStatusAsync();
        if (status.isRecording && status.metering) {
          setVolume(status.metering);
        }
      }, 300);
    };

    startMic();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (recording.current) {
        recording.current.stopAndUnloadAsync();
        recording.current = null;
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {permissionGranted ? (
        <>
          <Text style={styles.label}>🎙️ Mikrofon Ses Seviyesi:</Text>
          <Text style={styles.volume}>{volume.toFixed(1)} dB</Text>
        </>
      ) : (
        <Text style={styles.label}>Mikrofon izni gerekiyor.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginTop: 80 },
  label: { fontSize: 18, marginBottom: 10 },
  volume: { fontSize: 32, fontWeight: 'bold', color: 'tomato' },
});
