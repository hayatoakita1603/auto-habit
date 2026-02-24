import { View, Text, Button, StyleSheet } from 'react-native';
import type { Habit } from '../types/habit';

type Props = {
  habit: Habit;
  streak: number;
  todayDone: boolean;
  onMarkDone: () => void;
};

export const HomeScreen = ({ habit, streak, todayDone, onMarkDone }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.habitName}>{habit.name}</Text>
      <Text style={styles.streak}>{streak}日連続達成</Text>
      {todayDone ? (
        <Text style={styles.done}>今日は達成済み！</Text>
      ) : (
        <Button title="今日達成した！" onPress={onMarkDone} />
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
