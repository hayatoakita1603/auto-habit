import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { useHabit } from '../hooks/useHabit';
import { useAchievement } from '../hooks/useAchievement';

export const HomeScreen = () => {
  const { user } = useUser();
  const { hasHabit, habit, loading: habitLoading } = useHabit(user);
  const { todayDone, streak, loading: achievementLoading, markDone } = useAchievement(
    hasHabit ? user : null
  );

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
      {todayDone ? (
        <Text style={styles.done}>今日は達成済み！</Text>
      ) : (
        <Button title="今日達成した！" onPress={markDone} />
      )}
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
  done: {
    fontSize: 16,
    marginTop: 16,
  },
});
