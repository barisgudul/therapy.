import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function TextSessionScreen() {
  const router = useRouter();
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const animateDots = () => {
    Animated.loop(
      Animated.stagger(150, [
        Animated.sequence([
          Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot1, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ])
    ).start();
  };

  useEffect(() => {
    setTimeout(() => {
      setMessages(['AI: Merhaba, ben buradayım. Hazır olduğunda seninle konuşmaya hazırım.']);
    }, 1000);
  }, []);

  useEffect(() => {
    if (isTyping) animateDots();
  }, [isTyping]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, trimmed]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        'AI: Anladım. O zaman ne hakkında konuşmak istersin?',
      ]);
      scrollRef.current?.scrollToEnd(true);
    }, 1200);

    setTimeout(() => scrollRef.current?.scrollToEnd(true), 100);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={['#F9FAFB', '#ECEFF4']} style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
            </TouchableOpacity>
            <Text style={styles.logo}>
              therapy<Text style={styles.dot}>.</Text>
            </Text>
          </View>

          {/* MESSAGE THREAD */}
          <KeyboardAwareScrollView
            ref={scrollRef}
            contentContainerStyle={styles.messages}
            keyboardShouldPersistTaps="always"
            enableOnAndroid
            extraScrollHeight={160}
            extraHeight={Platform.OS === 'android' ? 160 : 100}
            showsVerticalScrollIndicator={false}
            enableAutomaticScroll
          >
            {messages.map((msg, index) => {
              const isAI = msg.startsWith('AI:');
              const cleanMsg = isAI ? msg.replace('AI: ', '') : msg;

              return (
                <View
                  key={index}
                  style={[
                    styles.bubble,
                    isAI ? styles.aiBubble : styles.userBubble,
                  ]}
                >
                  <Text style={styles.bubbleText}>{cleanMsg}</Text>
                </View>
              );
            })}

            {/* TYPING INDICATOR */}
            {isTyping && (
              <View style={[styles.bubble, styles.aiBubble, { flexDirection: 'row', gap: 6 }]}>
                {[dot1, dot2, dot3].map((dot, i) => (
                  <Animated.Text
                    key={i}
                    style={[
                      styles.bubbleText,
                      {
                        opacity: dot,
                        transform: [
                          {
                            scale: dot.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.7, 1.2],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    ●
                  </Animated.Text>
                ))}
              </View>
            )}

            {/* INPUT FIELD */}
            <View style={styles.inputBar}>
              <TextInput
                style={styles.input}
                placeholder="Mesajınızı yazın..."
                value={input}
                onChangeText={setInput}
                multiline
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    marginRight: 6,
  },
  logo: {
    fontSize: 22,
    fontWeight: '600',
    textTransform: 'lowercase',
    color: Colors.light.tint,
  },
  dot: {
    fontSize: 26,
    fontWeight: '700',
    color: '#5DA1D9',
  },
  messages: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#D4E7F9',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAEFF4',
  },
  bubbleText: {
    color: '#333',
    fontSize: 15,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: Platform.OS === 'android' ? 2 : 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: '#000',
    backgroundColor: 'transparent',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.light.tint,
    padding: 10,
    marginLeft: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
