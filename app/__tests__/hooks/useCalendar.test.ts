import { renderHook, act } from '@testing-library/react-native';
import { useCalendar } from '../../src/hooks/useCalendar';
import type { User } from 'firebase/auth';

const mockGetAchievementsByMonth = jest.fn();

jest.mock('../../src/services/achievementService', () => ({
  getAchievementsByMonth: (...args: unknown[]) => mockGetAchievementsByMonth(...args),
}));

// 現在日時を固定（2026-02-28）
const FIXED_DATE = new Date('2026-02-28T12:00:00');
jest.useFakeTimers();
jest.setSystemTime(FIXED_DATE);

const mockUser = { uid: 'user-1' } as User;

describe('useCalendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期値は今月・今年', async () => {
    mockGetAchievementsByMonth.mockResolvedValue(new Set());

    const { result } = renderHook(() => useCalendar(mockUser));
    await act(async () => {});

    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(2);
  });

  it('初期状態はloading: true', () => {
    mockGetAchievementsByMonth.mockResolvedValue(new Set());

    const { result } = renderHook(() => useCalendar(mockUser));

    expect(result.current.loading).toBe(true);
  });

  it('達成日セットを取得してloading: falseになる', async () => {
    mockGetAchievementsByMonth.mockResolvedValue(new Set(['2026-02-10', '2026-02-15']));

    const { result } = renderHook(() => useCalendar(mockUser));
    await act(async () => {});

    expect(result.current.achievedDates).toEqual(new Set(['2026-02-10', '2026-02-15']));
    expect(result.current.loading).toBe(false);
  });

  it('userがnullの場合はloading: falseで空セット', async () => {
    const { result } = renderHook(() => useCalendar(null));
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.achievedDates).toEqual(new Set());
  });

  it('goToPrevMonthで前月に移動する', async () => {
    mockGetAchievementsByMonth.mockResolvedValue(new Set());

    const { result } = renderHook(() => useCalendar(mockUser));
    await act(async () => {});

    await act(async () => {
      result.current.goToPrevMonth();
    });

    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(1);
  });

  it('1月からgoToPrevMonthで前年12月に移動する', async () => {
    mockGetAchievementsByMonth.mockResolvedValue(new Set());

    const { result } = renderHook(() => useCalendar(mockUser));
    await act(async () => {});

    // 2月 → 1月 → 前年12月
    await act(async () => { result.current.goToPrevMonth(); });
    await act(async () => { result.current.goToPrevMonth(); });

    expect(result.current.year).toBe(2025);
    expect(result.current.month).toBe(12);
  });

  it('goToNextMonthで次月に移動する', async () => {
    mockGetAchievementsByMonth.mockResolvedValue(new Set());

    const { result } = renderHook(() => useCalendar(mockUser));
    await act(async () => {});

    await act(async () => {
      result.current.goToNextMonth();
    });

    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(3);
  });

  it('12月からgoToNextMonthで翌年1月に移動する', async () => {
    mockGetAchievementsByMonth.mockResolvedValue(new Set());

    const { result } = renderHook(() => useCalendar(mockUser));
    await act(async () => {});

    // 2月 → ... → 12月 → 翌年1月（10回次月へ）
    for (let i = 0; i < 10; i++) {
      await act(async () => { result.current.goToNextMonth(); });
    }

    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(12);

    await act(async () => { result.current.goToNextMonth(); });

    expect(result.current.year).toBe(2027);
    expect(result.current.month).toBe(1);
  });

  it('月が変わると再フェッチする', async () => {
    mockGetAchievementsByMonth.mockResolvedValue(new Set());

    const { result } = renderHook(() => useCalendar(mockUser));
    await act(async () => {});

    await act(async () => {
      result.current.goToPrevMonth();
    });

    expect(mockGetAchievementsByMonth).toHaveBeenCalledTimes(2);
    expect(mockGetAchievementsByMonth).toHaveBeenLastCalledWith('user-1', 2026, 1);
  });
});
