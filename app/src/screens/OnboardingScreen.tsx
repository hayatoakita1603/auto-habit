import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import type { HabitInput } from '../types/habit';

type Props = {
  onComplete: (input: HabitInput) => Promise<void>;
};

const DEFAULT_TIME = new Date(0, 0, 0, 7, 0); // デフォルト 7:00

export const OnboardingScreen = ({ onComplete }: Props) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [habitName, setHabitName] = useState('');
  const [time, setTime] = useState(DEFAULT_TIME);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedTime = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;

  const handleRequestPermission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await Notifications.requestPermissionsAsync();
      await onComplete({
        name: habitName.trim(),
        schedule: { type: 'daily', hour: time.getHours(), minute: time.getMinutes() },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>習慣化したいことは{'\n'}何ですか？</Text>
          <TextInput
            style={styles.input}
            value={habitName}
            onChangeText={setHabitName}
            placeholder="例：ランニング、参考書を開く"
            placeholderTextColor="#aaa"
            maxLength={50}
            autoFocus
          />
        </View>
        <TouchableOpacity
          style={[styles.button, habitName.trim().length === 0 && styles.buttonDisabled]}
          onPress={() => setStep(2)}
          disabled={habitName.trim().length === 0}
        >
          <Text style={styles.buttonText}>次へ</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>毎日何時に{'\n'}通知しますか？</Text>
          <DateTimePicker
            mode="time"
            value={time}
            onChange={(_, date) => date && setTime(date)}
            display="spinner"
            locale="ja"
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
          <Text style={styles.buttonText}>次へ</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>もう少しで完了です</Text>
        <Text style={styles.summary}>
          毎日 <Text style={styles.highlight}>{formattedTime}</Text> に
          {'\n'}「<Text style={styles.highlight}>{habitName}</Text>」の
          {'\n'}リマインドをお送りします。
        </Text>
        <Text style={styles.description}>
          通知を許可すると、毎日決まった時間にお知らせします。
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
        onPress={handleRequestPermission}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>通知を許可して始める</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    lineHeight: 40,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    fontSize: 20,
    paddingVertical: 8,
    color: '#000',
  },
  summary: {
    fontSize: 20,
    lineHeight: 36,
    marginBottom: 24,
  },
  highlight: {
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
