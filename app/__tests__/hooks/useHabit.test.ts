import { renderHook, act } from '@testing-library/react-native';
import { useHabit } from '../../src/hooks/useHabit';
import type { User } from 'firebase/auth';

const mockHasHabit = jest.fn();
const mockCreateHabit = jest.fn();

jest.mock('../../src/services/habitService', () => ({
  hasHabit: (...args: unknown[]) => mockHasHabit(...args),
  createHabit: (...args: unknown[]) => mockCreateHabit(...args),
}));

const mockUser = { uid: 'user-1' } as User;

describe('useHabit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態はloading: true, hasHabit: null', () => {
    mockHasHabit.mockResolvedValue(false);

    const { result } = renderHook(() => useHabit(mockUser));

    expect(result.current.loading).toBe(true);
    expect(result.current.hasHabit).toBeNull();
  });

  it('userがnullの場合はloading: falseになる', async () => {
    const { result } = renderHook(() => useHabit(null));
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.hasHabit).toBeNull();
  });

  it('習慣が存在する場合はhasHabit: trueになる', async () => {
    mockHasHabit.mockResolvedValue(true);

    const { result } = renderHook(() => useHabit(mockUser));
    await act(async () => {});

    expect(result.current.hasHabit).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('習慣が存在しない場合はhasHabit: falseになる', async () => {
    mockHasHabit.mockResolvedValue(false);

    const { result } = renderHook(() => useHabit(mockUser));
    await act(async () => {});

    expect(result.current.hasHabit).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('createHabitを呼ぶとhasHabit: trueになる', async () => {
    mockHasHabit.mockResolvedValue(false);
    mockCreateHabit.mockResolvedValue('habit-id-1');

    const { result } = renderHook(() => useHabit(mockUser));
    await act(async () => {});

    await act(async () => {
      await result.current.createHabit({ name: 'ランニング', schedule: { type: 'daily', hour: 7, minute: 0 } });
    });

    expect(result.current.hasHabit).toBe(true);
  });
});
