import * as Haptics from 'expo-haptics';
import { Animated, Easing } from 'react-native';

export const animations = {
  // Konfeti animasyonu
  async celebrate(scale: Animated.Value) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
    ]).start();
  },

  // Rozet kazanma animasyonu
  async badgeEarned(scale: Animated.Value, opacity: Animated.Value) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.5,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ]),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  },

  // Streak artış animasyonu
  async streakIncreased(scale: Animated.Value) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }),
    ]).start();
  },

  // Hedef tamamlama animasyonu
  async goalCompleted(scale: Animated.Value, opacity: Animated.Value) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.4,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.in(Easing.cubic),
        }),
      ]),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1500),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  },
}; 