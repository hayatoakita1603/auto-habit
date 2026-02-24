import { renderHook, act } from '@testing-library/react-native';
import { useHabit } from '../../src/hooks/useHabit';
import type { User } from 'firebase/auth';
import type { Habit } from '../../src/types/habit';

const mockGetHabit = jest.fn();
const mockCreateHabit = jest.fn();

jest.mock('../../src/services/habitService', () => ({
  getHabit: (...args: unknown[]) => mockGetHabit(...args),
  createHabit: (...args: unknown[]) => mockCreateHabit(...args),
}));

const mockUser = { uid: 'user-1' } as User;

const mockHabit: Habit = {
  id: 'habit-id-1',
  name: 'ランニング',
  schedule: { type: 'daily', hour: 7, minute: 0 },
  createdAt: new Date('2026-01-01'),
};

describe('useHabit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態はloading: true, hasHabit: null', () => {
    mockGetHabit.mockResolvedValue(null);

    const { result } = renderHook(() => useHabit(mockUser));

    expect(result.current.loading).toBe(true);
    expect(result.current.hasHabit).toBeNull();
  });

  it('userがnullの場合はloading: false, hasHabit: falseになる', async () => {
    const { result } = renderHook(() => useHabit(null));
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.hasHabit).toBe(false);
  });

  it('習慣が存在する場合はhasHabit: true、habit: Habitオブジェクトになる', async () => {
    mockGetHabit.mockResolvedValue(mockHabit);

    const { result } = renderHook(() => useHabit(mockUser));
    await act(async () => {});

    expect(result.current.hasHabit).toBe(true);
    expect(result.current.habit).toEqual(mockHabit);
    expect(result.current.loading).toBe(false);
  });

  it('習慣が存在しない場合はhasHabit: false、habit: nullになる', async () => {
    mockGetHabit.mockResolvedValue(null);

    const { result } = renderHook(() => useHabit(mockUser));
    await act(async () => {});

    expect(result.current.hasHabit).toBe(false);
    expect(result.current.habit).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('createHabitを呼ぶとhasHabit: true、habit: Habitオブジェクトになる', async () => {
    // 初回はnull、createHabit後の再取得でhabitを返す
    mockGetHabit.mockResolvedValueOnce(null).mockResolvedValueOnce(mockHabit);
    mockCreateHabit.mockResolvedValue('habit-id-1');

    const { result } = renderHook(() => useHabit(mockUser));
    await act(async () => {});

    await act(async () => {
      await result.current.createHabit({ name: 'ランニング', schedule: { type: 'daily', hour: 7, minute: 0 } });
    });

    expect(result.current.hasHabit).toBe(true);
    expect(result.current.habit).toEqual(mockHabit);
  });
});
