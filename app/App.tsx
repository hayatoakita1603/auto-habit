import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from './src/hooks/useAuth';
import { useHabit } from './src/hooks/useHabit';
import { OnboardingScreen } from './src/screens/OnboardingScreen';

export default function App() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { hasHabit, loading: habitLoading, createHabit } = useHabit(user);

  if (authLoading || habitLoading) {
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
    <View style={styles.container}>
      <Text>UID: {user?.uid}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
