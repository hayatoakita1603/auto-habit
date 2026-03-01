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
const CIRCLE_SIZE = 260;

export const HomeScreen = () => {
  const { user } = useUser();
  const { hasHabit, habit, loading: habitLoading } = useHabit(user);
  const { todayDone, streak, loading: achievementLoading, markDone, cancelDone } = useAchievement(
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
      <View style={styles.centerArea}>
        {todayDone ? (
          <>
            <View style={[styles.circle, styles.circleDone]}>
              <Text style={styles.habitNameDone}>{habit?.name}</Text>
              <Text style={styles.doneBadge}>達成！</Text>
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelDone}>
              <Text style={styles.cancelText}>取り消す</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={[styles.circle, styles.circleUndone]} onPress={markDone} activeOpacity={0.7}>
            <Text style={styles.habitName}>{habit?.name}</Text>
            <Text style={styles.tapHint}>タップして達成</Text>
          </TouchableOpacity>
        )}
      </View>

      {photoPaths.length > 0 && (
        <TouchableOpacity style={styles.photoRow} onPress={() => setGalleryVisible(true)}>
          <Image source={{ uri: photoPaths[0] }} style={styles.thumbnail} />
          <Text style={styles.photoLabel}>モチベ写真を見る ›</Text>
        </TouchableOpacity>
      )}

      <View style={styles.streakArea}>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>日連続達成</Text>
      </View>

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
    justifyContent: 'space-between',
    paddingVertical: 48,
    backgroundColor: colors.background,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleUndone: {
    borderWidth: 4,
    borderColor: colors.accent,
    backgroundColor: colors.background,
  },
  circleDone: {
    backgroundColor: colors.accent,
  },
  habitName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  habitNameDone: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  tapHint: {
    marginTop: 12,
    fontSize: 13,
    color: colors.textSecondary,
  },
  doneBadge: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  photoLabel: {
    fontSize: 14,
    color: colors.accent,
  },
  cancelButton: {
    marginTop: 16,
  },
  cancelText: {
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  streakArea: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent,
    lineHeight: 56,
  },
  streakLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
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
