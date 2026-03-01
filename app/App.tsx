import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from './src/hooks/useAuth';
import { useHabit } from './src/hooks/useHabit';
import { useNotification } from './src/hooks/useNotification';
import { savePhotos } from './src/services/photoService';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { UserProvider } from './src/contexts/UserContext';
import type { HabitInput } from './src/types/habit';

export default function App() {
  const { user, loading: authLoading, error: authError } = useAuth();
  const { hasHabit, habit, loading: habitLoading, createHabit } = useHabit(user);
  // habitが設定されたタイミングで通知をスケジュールする
  useNotification(user, habit);

  // 写真を先に保存してからhabitを作成する（通知スケジュール時に写真が参照できるようにする）
  const handleOnboardingComplete = async (input: HabitInput, photoUris: string[]) => {
    if (user) {
      await savePhotos(user.uid, photoUris);
    }
    await createHabit(input);
  };

  const renderContent = () => {
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
      return <OnboardingScreen onComplete={handleOnboardingComplete} />;
    }
    return (
      <UserProvider value={{ user }}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </UserProvider>
    );
  };

  return <SafeAreaProvider>{renderContent()}</SafeAreaProvider>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
