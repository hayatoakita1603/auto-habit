import { renderHook, act } from '@testing-library/react-native';
import { useNotification } from '../../src/hooks/useNotification';
import type { User } from 'firebase/auth';
import type { Habit } from '../../src/types/habit';

const mockScheduleHabitNotification = jest.fn();
const mockLoadPhotoPaths = jest.fn();

jest.mock('../../src/services/notificationService', () => ({
  scheduleHabitNotification: (...args: unknown[]) =>
    mockScheduleHabitNotification(...args),
}));

jest.mock('../../src/services/photoService', () => ({
  loadPhotoPaths: (...args: unknown[]) => mockLoadPhotoPaths(...args),
}));

const mockUser = { uid: 'user-1' } as User;

const mockHabit: Habit = {
  id: 'habit-1',
  name: 'ランニング',
  schedule: { type: 'daily', hour: 7, minute: 0 },
  createdAt: new Date(),
};

describe('useNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadPhotoPaths.mockResolvedValue([]);
    mockScheduleHabitNotification.mockResolvedValue(undefined);
  });

  it('userとhabitがある場合に通知をスケジュールする', async () => {
    renderHook(() => useNotification(mockUser, mockHabit));
    await act(async () => {});

    expect(mockLoadPhotoPaths).toHaveBeenCalledWith('user-1');
    expect(mockScheduleHabitNotification).toHaveBeenCalledWith(mockHabit, []);
  });

  it('写真パスがある場合は写真パスを渡してスケジュールする', async () => {
    const photoPaths = ['/path/to/photo1.jpg'];
    mockLoadPhotoPaths.mockResolvedValue(photoPaths);

    renderHook(() => useNotification(mockUser, mockHabit));
    await act(async () => {});

    expect(mockScheduleHabitNotification).toHaveBeenCalledWith(mockHabit, photoPaths);
  });

  it('userがnullの場合はスケジュールしない', async () => {
    renderHook(() => useNotification(null, mockHabit));
    await act(async () => {});

    expect(mockScheduleHabitNotification).not.toHaveBeenCalled();
  });

  it('habitがnullの場合はスケジュールしない', async () => {
    renderHook(() => useNotification(mockUser, null));
    await act(async () => {});

    expect(mockScheduleHabitNotification).not.toHaveBeenCalled();
  });
});
