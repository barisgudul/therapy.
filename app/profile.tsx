import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Colors } from '../constants/Colors';

export default function ProfileScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [profession, setProfession] = useState('');
  const [expectation, setExpectation] = useState('');
  const [history, setHistory] = useState('');
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('userProfile');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNickname(parsed.nickname || '');
        setBirthDate(parsed.birthDate || '');
        setProfession(parsed.profession || '');
        setExpectation(parsed.expectation || '');
        setHistory(parsed.history || '');
      }
    })();
  }, []);

  const handleConfirm = (date: Date) => {
    setBirthDate(moment(date).format('DD/MM/YYYY'));
    setDatePickerVisibility(false);
    setActiveField(null);
  };

  const handleSave = async () => {
    const data = { nickname, birthDate, profession, expectation, history };
    await AsyncStorage.setItem('userProfile', JSON.stringify(data));
    router.replace('/');
  };

  const renderModalInput = (
    field: string,
    label: string,
    value: string,
    onChange: (val: string) => void,
    multiline = false
  ) => (
    <Modal visible={activeField === field} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{label}</Text>
          <TextInput
            style={styles.modalInput}
            placeholder={label}
            placeholderTextColor="#aaa"
            value={value}
            onChangeText={onChange}
            multiline={multiline}
          />
          <TouchableOpacity
            style={styles.modalButton}
            onPress={async () => {
              const updatedData = {
                nickname,
                birthDate,
                profession,
                expectation,
                history,
              };
              await AsyncStorage.setItem('userProfile', JSON.stringify(updatedData));
              setActiveField(null);
            }}
          >
            <Text style={styles.modalButtonText}>Tamamdır</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderDatePickerModal = () => (
    <DateTimePickerModal
      isVisible={activeField === 'birthDate'}
      mode="date"
      onConfirm={async (date) => {
        const formatted = moment(date).format('DD/MM/YYYY');
        setBirthDate(formatted);
        setDatePickerVisibility(false);
        setActiveField(null);
        const updatedData = {
          nickname,
          birthDate: formatted,
          profession,
          expectation,
          history,
        };
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedData));
      }}
      onCancel={() => setActiveField(null)}
      maximumDate={new Date()}
    />
  );

  const renderTouchable = (value: string, placeholder: string, field: string) => (
    <TouchableOpacity
      style={[styles.input, !value && { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }]}
      onPress={() => {
        if (field === 'birthDate') {
          setActiveField('birthDate');
          setDatePickerVisibility(true);
        } else {
          setActiveField(field);
        }
      }}
    >
      <Text style={[styles.inputText, !value && { color: '#c2c6cc' }]}> {value || placeholder} </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#fdfdfd', '#f1f5f9']} style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color={Colors.light.tint} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.brand}>
            therapy<Text style={styles.dot}>.</Text>
          </Text>

          <Text style={styles.title}>Profilini Oluştur</Text>
          <Text style={styles.subtitle}>Kendini dilediğin kadar ifade edebilirsin ✨</Text>

          {renderTouchable(nickname, 'Sana nasıl hitap etmemizi istersin?', 'nickname')}
          {renderTouchable(birthDate, 'Doğum Tarihin?', 'birthDate')}
          {renderTouchable(profession, 'Mesleğin nedir?', 'profession')}
          {renderTouchable(expectation, 'Terapiden beklentilerin neler?', 'expectation')}
          {renderTouchable(history, 'Hayatında iz bırakan deneyimlerin?', 'history')}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Devam Etmeye Hazırım</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderModalInput('nickname', 'Sana nasıl hitap etmemizi istersin?', nickname, setNickname)}
      {renderModalInput('profession', 'Mesleğin nedir?', profession, setProfession)}
      {renderModalInput('expectation', 'Terapiden beklentilerin neler?', expectation, setExpectation, true)}
      {renderModalInput('history', 'Hayatında iz bırakan deneyimlerin?', history, setHistory, true)}
      {renderDatePickerModal()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 70, paddingHorizontal: 24 },
  back: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  scroll: { paddingBottom: 40 },
  brand: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.tint,
    textTransform: 'lowercase',
    marginBottom: 10,
  },
  dot: { color: '#5DA1D9', fontSize: 28, fontWeight: '700' },
  title: {
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1c1e',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7a848f',
    marginBottom: 28,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 26,
    padding: 18,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 1,
  },
  inputText: {
    color: '#1e1e1e',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 32,
    paddingVertical: 16,
    paddingHorizontal: 44,
    alignSelf: 'center',
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 28,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.tint,
    marginBottom: 18,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 22,
    padding: 18,
    fontSize: 15,
    marginBottom: 20,
    textAlignVertical: 'top',
    color: '#1c1c1e',
  },
  modalButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 32,
    paddingVertical: 13,
    borderRadius: 30,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
