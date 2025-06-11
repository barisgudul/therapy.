import { Audio } from 'expo-av';
import { useCallback, useRef, useState } from 'react';
import { textToSpeech, transcribeAudio } from '../utils/gcpServices';

interface UseVoiceSessionProps {
  onTranscriptReceived?: (transcript: string) => void;
  onSpeechStarted?: () => void;
  onSpeechEnded?: () => void;
  onSoundLevelChange?: (level: number) => void;
}

export const useVoiceSession = ({
  onTranscriptReceived,
  onSpeechStarted,
  onSpeechEnded,
  onSoundLevelChange,
}: UseVoiceSessionProps = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          isMeteringEnabled: true,
        }
      );
      recording.current = newRecording;
      setIsRecording(true);
      onSpeechStarted?.();

      intervalRef.current = setInterval(async () => {
        if (recording.current) {
          const status = await recording.current.getStatusAsync();
          if (status.isRecording && status.metering) {
            onSoundLevelChange?.(status.metering);
          }
        }
      }, 100);

    } catch (error) {
      console.error('Kayıt başlatılamadı:', error);
    }
  }, [onSpeechStarted, onSoundLevelChange]);

  const stopRecording = useCallback(async () => {
    if (!recording.current) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;

    try {
      setIsProcessing(true);
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;
      setIsRecording(false);
      onSpeechEnded?.();

      if (uri) {
        const transcribedText = await transcribeAudio(uri);
        setTranscript(transcribedText);
        onTranscriptReceived?.(transcribedText);
      }
    } catch (error) {
      console.error('Kayıt durdurulamadı:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onSpeechEnded, onTranscriptReceived]);

  const speakText = useCallback(async (text: string) => {
    try {
      const audioUrl = await textToSpeech(text);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl }
      );
      sound.current = newSound;
      await sound.current.playAsync();
    } catch (error) {
      console.error('Ses çalınamadı:', error);
    }
  }, []);

  const cleanup = useCallback(async () => {
    if (sound.current) {
      await sound.current.unloadAsync();
    }
    if (recording.current) {
      await recording.current.stopAndUnloadAsync();
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  return {
    isRecording,
    isProcessing,
    transcript,
    startRecording,
    stopRecording,
    speakText,
    cleanup,
  };
}; 