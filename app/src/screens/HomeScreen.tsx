import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { useHabit } from '../hooks/useHabit';
import { useAchievement } from '../hooks/useAchievement';
import { usePhotos } from '../hooks/usePhotos';
import { colors } from '../constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const HomeScreen = () => {
  const { user } = useUser();
  const { hasHabit, habit, loading: habitLoading } = useHabit(user);
  const { todayDone, streak, loading: achievementLoading, markDone } = useAchievement(
    hasHabit ? user : null
  );
  const { photoPaths, refresh: refreshPhotos } = usePhotos(user);
  const [galleryVisible, setGalleryVisible] = useState(false);

  useFocusEffect(useCallback(() => { refreshPhotos(); }, [refreshPhotos]));

  if (habitLoading || achievementLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.habitName}>{habit?.name}</Text>
      <Text style={styles.streak}>{streak}日連続達成</Text>

      {photoPaths.length > 0 && (
        <TouchableOpacity style={styles.photoRow} onPress={() => setGalleryVisible(true)}>
          <Image source={{ uri: photoPaths[0] }} style={styles.thumbnail} />
          <Text style={styles.photoLabel}>モチベ写真を見る ›</Text>
        </TouchableOpacity>
      )}

      {todayDone ? (
        <View style={styles.doneButton}>
          <Text style={styles.doneText}>今日は達成済み！</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.markDoneButton} onPress={markDone}>
          <Text style={styles.markDoneText}>今日達成した！</Text>
        </TouchableOpacity>
      )}

      <Modal visible={galleryVisible} animationType="slide" onRequestClose={() => setGalleryVisible(false)}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setGalleryVisible(false)}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            <ScrollView>
              {photoPaths.map((path) => (
                <Image key={path} source={{ uri: path }} style={styles.fullPhoto} resizeMode="contain" />
              ))}
            </ScrollView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  habitName: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  streak: {
    fontSize: 18,
    marginTop: 16,
    color: colors.accent,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  photoLabel: {
    fontSize: 16,
    color: colors.accent,
  },
  markDoneButton: {
    marginTop: 24,
    backgroundColor: colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  markDoneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  doneButton: {
    marginTop: 24,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 28,
  },
  fullPhoto: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    marginBottom: 8,
  },
});
