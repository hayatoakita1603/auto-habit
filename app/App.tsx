import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from './src/hooks/useAuth';
import { useHabit } from './src/hooks/useHabit';
import { useAchievement } from './src/hooks/useAchievement';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { hasHabit, habit, loading: habitLoading, createHabit } = useHabit(user);
  const { todayDone, streak, loading: achievementLoading, markDone } = useAchievement(
    hasHabit ? user : null
  );

  if (authLoading || habitLoading || achievementLoading) {
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  if (authError) {
    return (
      <View style={styles.container}>
        <Text>認証エラー: {authError.message}</Text>
      </View>
    );
  }

  if (!hasHabit) {
    return <OnboardingScreen onComplete={createHabit} />;
  }

  return (
    <HomeScreen
      habit={habit!}
      streak={streak}
      todayDone={todayDone}
      onMarkDone={markDone}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
