import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Button,
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
        <ActivityIndicator />
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
        <Text style={styles.done}>今日は達成済み！</Text>
      ) : (
        <Button title="今日達成した！" onPress={markDone} />
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
  },
  habitName: {
    fontSize: 24,
  },
  streak: {
    fontSize: 18,
    marginTop: 16,
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
    color: '#555',
  },
  done: {
    fontSize: 16,
    marginTop: 16,
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
    color: '#fff',
    fontSize: 28,
  },
  fullPhoto: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    marginBottom: 8,
  },
});
