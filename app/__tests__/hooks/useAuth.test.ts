import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../../src/hooks/useAuth';

const mockSignInAnonymously = jest.fn();
const mockOnAuthStateChanged = jest.fn();

jest.mock('../../src/services/firebase', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  signInAnonymously: (...args: unknown[]) => mockSignInAnonymously(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockReturnValue(jest.fn());
  });

  it('初期状態はloading: true', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('未サインインならsignInAnonymouslyを呼ぶ', async () => {
    mockSignInAnonymously.mockResolvedValue({});
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: (user: null) => void) => {
      callback(null);
      return jest.fn();
    });

    const { result: _result } = renderHook(() => useAuth());
    await act(async () => {});

    expect(mockSignInAnonymously).toHaveBeenCalledTimes(1);
  });

  it('認証済みユーザーがいればuserをセットする', async () => {
    const mockUser = { uid: 'test-uid' };
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: (user: typeof mockUser) => void) => {
      callback(mockUser);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('signInAnonymously失敗時はerrorをセットする', async () => {
    const mockError = new Error('auth failed');
    mockSignInAnonymously.mockRejectedValue(mockError);
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: (user: null) => void) => {
      callback(null);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    expect(result.current.error).toEqual(mockError);
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
