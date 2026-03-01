import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import type { HabitInput } from '../types/habit';
import { colors } from '../constants/colors';

type Props = {
  onComplete: (input: HabitInput, photoUris: string[]) => Promise<void>;
};

const DEFAULT_TIME = new Date(0, 0, 0, 7, 0); // デフォルト 7:00
const MAX_PHOTOS = 5;

export const OnboardingScreen = ({ onComplete }: Props) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [habitName, setHabitName] = useState('');
  const [time, setTime] = useState(DEFAULT_TIME);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedTime = `${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}`;

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotoUris((prev) => [...prev, result.assets[0].uri].slice(0, MAX_PHOTOS));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRequestPermission = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await Notifications.requestPermissionsAsync();
      await onComplete(
        {
          name: habitName.trim(),
          schedule: { type: 'daily', hour: time.getHours(), minute: time.getMinutes() },
        },
        photoUris
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>習慣化したいことは{'\n'}何ですか？</Text>
          <Text style={styles.advice}>最初は小さく始めるのがコツ。続けることが大切です。</Text>
          <TextInput
            style={styles.input}
            value={habitName}
            onChangeText={setHabitName}
            placeholder="例：ランニング、参考書を開く"
            placeholderTextColor={colors.textSecondary}
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
          <Text style={styles.advice}>毎日同じ時間に通知が来ると、習慣化しやすくなりますよ。</Text>
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

  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>通知に表示する{'\n'}写真を選びますか？</Text>
          <Text style={styles.advice}>なりたい自分や達成後のイメージ写真を設定すると、モチベーションが続きやすいですよ！</Text>
          <Text style={styles.description}>
            最大{MAX_PHOTOS}枚まで設定できます。通知のたびにランダムで1枚表示されます。
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoList}
          >
            {photoUris.map((uri, index) => (
              <View key={uri} style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemovePhoto(index)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.step3Actions}>
          {photoUris.length < MAX_PHOTOS ? (
            <>
              <TouchableOpacity style={styles.button} onPress={handlePickPhoto}>
                <Text style={styles.buttonText}>写真を追加</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.skipButton} onPress={() => setStep(4)}>
                <Text style={styles.skipButtonText}>
                  {photoUris.length === 0 ? 'スキップ' : '次へ'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
              <Text style={styles.buttonText}>次へ</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>もう少しで完了です</Text>
        <Text style={styles.advice}>あとは続けるだけ。応援しています！</Text>
        <Text style={styles.summary}>
          毎日 <Text style={styles.highlight}>{formattedTime}</Text> に{'\n'}「
          <Text style={styles.highlight}>{habitName}</Text>」の{'\n'}リマインドをお送りします。
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
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
  },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    fontSize: 20,
    paddingVertical: 8,
    color: colors.textPrimary,
  },
  summary: {
    fontSize: 20,
    lineHeight: 36,
    marginBottom: 24,
    color: colors.textPrimary,
  },
  highlight: {
    fontWeight: 'bold',
    color: colors.accent,
  },
  advice: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  photoList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  photoWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 16,
  },
  step3Actions: {
    gap: 12,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
