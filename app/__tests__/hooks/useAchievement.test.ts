import { renderHook, act } from '@testing-library/react-native';
import { useAchievement } from '../../src/hooks/useAchievement';
import type { User } from 'firebase/auth';

const mockAddAchievement = jest.fn();
const mockGetTodayAchievement = jest.fn();
const mockGetStreak = jest.fn();

jest.mock('../../src/services/achievementService', () => ({
  addAchievement: (...args: unknown[]) => mockAddAchievement(...args),
  getTodayAchievement: (...args: unknown[]) => mockGetTodayAchievement(...args),
  getStreak: (...args: unknown[]) => mockGetStreak(...args),
}));

const mockUser = { uid: 'user-1' } as User;

describe('useAchievement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態はloading: true', () => {
    mockGetTodayAchievement.mockResolvedValue(false);
    mockGetStreak.mockResolvedValue(0);

    const { result } = renderHook(() => useAchievement(mockUser));

    expect(result.current.loading).toBe(true);
  });

  it('userがnullの場合はloading: falseになる', async () => {
    const { result } = renderHook(() => useAchievement(null));
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.todayDone).toBe(false);
    expect(result.current.streak).toBe(0);
  });

  it('今日達成済みの場合はtodayDone: true、streakが反映される', async () => {
    mockGetTodayAchievement.mockResolvedValue(true);
    mockGetStreak.mockResolvedValue(5);

    const { result } = renderHook(() => useAchievement(mockUser));
    await act(async () => {});

    expect(result.current.todayDone).toBe(true);
    expect(result.current.streak).toBe(5);
    expect(result.current.loading).toBe(false);
  });

  it('今日未達成の場合はtodayDone: false', async () => {
    mockGetTodayAchievement.mockResolvedValue(false);
    mockGetStreak.mockResolvedValue(3);

    const { result } = renderHook(() => useAchievement(mockUser));
    await act(async () => {});

    expect(result.current.todayDone).toBe(false);
    expect(result.current.streak).toBe(3);
  });

  it('markDoneを呼ぶとtodayDone: true、streakが1増える', async () => {
    mockGetTodayAchievement.mockResolvedValue(false);
    mockGetStreak.mockResolvedValue(2);
    mockAddAchievement.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAchievement(mockUser));
    await act(async () => {});

    await act(async () => {
      await result.current.markDone();
    });

    expect(result.current.todayDone).toBe(true);
    expect(result.current.streak).toBe(3);
  });
});
