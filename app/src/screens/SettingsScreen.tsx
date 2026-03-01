import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '../contexts/UserContext';
import { useHabit } from '../hooks/useHabit';
import { scheduleHabitNotification } from '../services/notificationService';
import { loadPhotoPaths } from '../services/photoService';
import type { Habit, HabitInput } from '../types/habit';

export const SettingsScreen = () => {
  const { user } = useUser();
  const { habit, loading, updateHabit } = useHabit(user);

  const [habitName, setHabitName] = useState('');
  const [time, setTime] = useState(new Date(0, 0, 0, 7, 0));
  const [initialized, setInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // habitロード後にフォームの初期値をセット
  useEffect(() => {
    if (habit && !initialized) {
      setHabitName(habit.name);
      setTime(new Date(0, 0, 0, habit.schedule.hour, habit.schedule.minute));
      setInitialized(true);
    }
  }, [habit, initialized]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  const handleSave = async () => {
    if (!habit || !user || isSaving) return;
    setIsSaving(true);
    try {
      const input: HabitInput = {
        name: habitName.trim(),
        schedule: { type: 'daily', hour: time.getHours(), minute: time.getMinutes() },
      };
      await updateHabit(input);
      // 保存直後に通知を再スケジュールする（App.tsxのhabit状態は更新されないため）
      const updatedHabit: Habit = { ...habit, ...input };
      const photoPaths = await loadPhotoPaths(user.uid);
      await scheduleHabitNotification(updatedHabit, photoPaths);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = habitName.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>習慣名</Text>
        <TextInput
          style={styles.input}
          value={habitName}
          onChangeText={setHabitName}
          placeholder="例：ランニング"
          placeholderTextColor="#aaa"
          maxLength={50}
        />
        <Text style={styles.label}>通知時刻</Text>
        <DateTimePicker
          testID="time-picker"
          mode="time"
          value={time}
          onChange={(_, date) => date && setTime(date)}
          display="spinner"
          locale="ja"
        />
      </View>
      <TouchableOpacity
        testID="save-button"
        style={[styles.button, (!isValid || isSaving) && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={!isValid || isSaving}
        accessibilityState={{ disabled: !isValid || isSaving }}
      >
        <Text style={styles.buttonText}>保存</Text>
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
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginTop: 24,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    fontSize: 20,
    paddingVertical: 8,
    color: '#000',
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
