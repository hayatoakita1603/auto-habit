import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import * as ImagePicker from 'expo-image-picker';
import type { HabitInput } from '../types/habit';

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

  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>通知に表示する{'\n'}写真を選びますか？</Text>
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
          {photoUris.length < MAX_PHOTOS && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={handlePickPhoto}>
              <Text style={styles.addPhotoButtonText}>写真を追加</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.button} onPress={() => setStep(4)}>
          <Text style={styles.buttonText}>
            {photoUris.length === 0 ? 'スキップ' : '次へ'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>もう少しで完了です</Text>
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
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 16,
  },
  addPhotoButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  addPhotoButtonText: {
    fontSize: 15,
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
