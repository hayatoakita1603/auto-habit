import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../contexts/UserContext';
import { useHabit } from '../hooks/useHabit';
import { loadPhotoPaths, updatePhotos } from '../services/photoService';
import { scheduleHabitNotification } from '../services/notificationService';

const MAX_PHOTOS = 5;

type Props = {
  onClose: () => void;
};

export const PhotoSettingsScreen = ({ onClose }: Props) => {
  const { user } = useUser();
  const { habit } = useHabit(user);

  // load時のスナップショット（差分更新のために保持）
  const [savedPaths, setSavedPaths] = useState<string[]>([]);
  // 表示用（既存パス + 新規URI を混在）
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadPhotoPaths(user.uid).then(paths => {
      setSavedPaths(paths);
      setCurrentPhotos(paths);
      setLoading(false);
    });
  }, [user]);

  const handleAddPhoto = async () => {
    if (currentPhotos.length >= MAX_PHOTOS) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setCurrentPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setCurrentPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user || !habit || isSaving) return;
    setIsSaving(true);
    try {
      const keptPaths = currentPhotos.filter(p => savedPaths.includes(p));
      const newUris = currentPhotos.filter(p => !savedPaths.includes(p));
      const finalPaths = await updatePhotos(user.uid, keptPaths, newUris);
      // 写真変更後に通知を再スケジュール
      await scheduleHabitNotification(habit, finalPaths);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.title}>モチベ写真</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.photoArea}>
        <View style={styles.photoRow}>
          {currentPhotos.map((uri, index) => (
            <View key={uri} style={styles.photoWrapper}>
              <Image source={{ uri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          {currentPhotos.length < MAX_PHOTOS && (
            <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
              <Text style={styles.addText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.hint}>最大{MAX_PHOTOS}枚まで登録できます</Text>
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const PHOTO_SIZE = 90;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
  },
  headerRight: {
    width: 60,
  },
  photoArea: {
    flexGrow: 1,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#000',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 14,
  },
  addButton: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    fontSize: 32,
    color: '#ccc',
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
