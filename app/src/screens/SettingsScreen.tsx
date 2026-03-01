import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../contexts/UserContext';
import { loadPhotoPaths } from '../services/photoService';
import { HabitSettingsScreen } from './HabitSettingsScreen';
import { PhotoSettingsScreen } from './PhotoSettingsScreen';

export const SettingsScreen = () => {
  const { user } = useUser();
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);

  const refreshPhotoCount = useCallback(async () => {
    if (!user) return;
    const paths = await loadPhotoPaths(user.uid);
    setPhotoCount(paths.length);
  }, [user]);

  // タブフォーカス時と写真モーダルを閉じた後に枚数を更新
  useFocusEffect(useCallback(() => { refreshPhotoCount(); }, [refreshPhotoCount]));

  const handleClosePhotoModal = () => {
    setPhotoModalVisible(false);
    refreshPhotoCount();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>設定</Text>

      <View style={styles.list}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => setHabitModalVisible(true)}
        >
          <Text style={styles.rowLabel}>習慣名・通知時刻</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.separator} />
        <TouchableOpacity
          style={styles.row}
          onPress={() => setPhotoModalVisible(true)}
        >
          <Text style={styles.rowLabel}>モチベ写真</Text>
          <View style={styles.rowRight}>
            {photoCount > 0 && (
              <Text style={styles.rowValue}>{photoCount}枚</Text>
            )}
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={habitModalVisible}
        animationType="slide"
        onRequestClose={() => setHabitModalVisible(false)}
      >
        <HabitSettingsScreen onClose={() => setHabitModalVisible(false)} />
      </Modal>

      <Modal
        visible={photoModalVisible}
        animationType="slide"
        onRequestClose={handleClosePhotoModal}
      >
        <PhotoSettingsScreen onClose={handleClosePhotoModal} />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  heading: {
    fontSize: 34,
    fontWeight: '700',
    paddingHorizontal: 20,
    paddingBottom: 12,
    color: '#000',
  },
  list: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: {
    fontSize: 17,
    color: '#000',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowValue: {
    fontSize: 17,
    color: '#8e8e93',
  },
  chevron: {
    fontSize: 20,
    color: '#c7c7cc',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#c6c6c8',
    marginLeft: 16,
  },
});
