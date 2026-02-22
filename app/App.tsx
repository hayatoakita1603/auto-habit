import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from './src/hooks/useAuth';

export default function App() {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>認証エラー: {error.message}</Text>
      </View>
    );
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
