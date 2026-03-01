import { updatePhotos } from '../photoService';

const mockGetInfoAsync = jest.fn();
const mockDeleteAsync = jest.fn();
const mockCopyAsync = jest.fn();
const mockMakeDirectoryAsync = jest.fn();
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///docs/',
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
  deleteAsync: (...args: unknown[]) => mockDeleteAsync(...args),
  copyAsync: (...args: unknown[]) => mockCopyAsync(...args),
  makeDirectoryAsync: (...args: unknown[]) => mockMakeDirectoryAsync(...args),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (...args: unknown[]) => mockGetItem(...args),
  setItem: (...args: unknown[]) => mockSetItem(...args),
}));

const EXISTING_PATH_A = 'file:///docs/habit-photos/a.jpg';
const EXISTING_PATH_B = 'file:///docs/habit-photos/b.jpg';
const NEW_URI = 'file:///tmp/picked.jpg';

describe('updatePhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMakeDirectoryAsync.mockResolvedValue(undefined);
    mockCopyAsync.mockResolvedValue(undefined);
    mockDeleteAsync.mockResolvedValue(undefined);
    mockSetItem.mockResolvedValue(undefined);
    mockGetInfoAsync.mockResolvedValue({ exists: true });
  });

  it('既存写真を維持しつつ新規写真を追加する', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify([EXISTING_PATH_A]));

    const result = await updatePhotos('user-1', [EXISTING_PATH_A], [NEW_URI]);

    // 削除は呼ばれない
    expect(mockDeleteAsync).not.toHaveBeenCalled();
    // 新規URIがコピーされる
    expect(mockCopyAsync).toHaveBeenCalledWith(
      expect.objectContaining({ from: NEW_URI })
    );
    // 結果に既存パスと新規パスが含まれる
    expect(result[0]).toBe(EXISTING_PATH_A);
    expect(result[1]).toMatch(/habit-photos\/.+\.jpg$/);
  });

  it('削除された写真のファイルを消す', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify([EXISTING_PATH_A, EXISTING_PATH_B]));

    await updatePhotos('user-1', [EXISTING_PATH_A], []);

    // B が削除される
    expect(mockDeleteAsync).toHaveBeenCalledWith(EXISTING_PATH_B);
    expect(mockDeleteAsync).not.toHaveBeenCalledWith(EXISTING_PATH_A);
  });

  it('全写真を削除すると空配列が保存される', async () => {
    mockGetItem.mockResolvedValue(JSON.stringify([EXISTING_PATH_A]));

    const result = await updatePhotos('user-1', [], []);

    expect(mockDeleteAsync).toHaveBeenCalledWith(EXISTING_PATH_A);
    expect(mockSetItem).toHaveBeenCalledWith(
      'habit_photo_paths_user-1',
      JSON.stringify([])
    );
    expect(result).toEqual([]);
  });
});
