import { render, screen, waitFor } from '@testing-library/react-native';
import type { User } from 'firebase/auth';

const mockUser = { uid: 'user-1' } as User;
const mockLoadPhotoPaths = jest.fn();

jest.mock('../../src/contexts/UserContext', () => ({
  useUser: () => ({ user: mockUser }),
}));

jest.mock('../../src/services/photoService', () => ({
  loadPhotoPaths: (...args: unknown[]) => mockLoadPhotoPaths(...args),
  updatePhotos: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => cb(),
}));

jest.mock('../../src/screens/HabitSettingsScreen', () => ({
  HabitSettingsScreen: () => null,
}));
jest.mock('../../src/screens/PhotoSettingsScreen', () => ({
  PhotoSettingsScreen: () => null,
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...props }: React.ComponentProps<typeof View>) => (
      <View {...props}>{children}</View>
    ),
  };
});

import { SettingsScreen } from '../../src/screens/SettingsScreen';

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadPhotoPaths.mockResolvedValue([]);
  });

  it('設定項目が2行表示される', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('習慣名・通知時刻')).toBeTruthy();
    expect(screen.getByText('モチベ写真')).toBeTruthy();
  });

  it('写真が登録済みの場合は枚数が表示される', async () => {
    mockLoadPhotoPaths.mockResolvedValue(['/a.jpg', '/b.jpg']);

    render(<SettingsScreen />);

    await waitFor(() => {
      expect(screen.getByText('2枚')).toBeTruthy();
    });
  });

  it('写真が0枚の場合は枚数が表示されない', async () => {
    render(<SettingsScreen />);

    await waitFor(() => {
      expect(screen.queryByText(/枚/)).toBeNull();
    });
  });
});
