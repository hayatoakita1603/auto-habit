const mockCopyAsync = jest.fn();
const mockDeleteAsync = jest.fn();
const mockGetInfoAsync = jest.fn();
const mockMakeDirectoryAsync = jest.fn();
const documentDirectory = 'file:///app/documents/';

jest.mock('expo-file-system/legacy', () => ({
  copyAsync: (...args: unknown[]) => mockCopyAsync(...args),
  deleteAsync: (...args: unknown[]) => mockDeleteAsync(...args),
  getInfoAsync: (...args: unknown[]) => mockGetInfoAsync(...args),
  makeDirectoryAsync: (...args: unknown[]) => mockMakeDirectoryAsync(...args),
  documentDirectory,
}));

const mockSetItem = jest.fn();
const mockGetItem = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: (...args: unknown[]) => mockSetItem(...args),
  getItem: (...args: unknown[]) => mockGetItem(...args),
  removeItem: (...args: unknown[]) => mockRemoveItem(...args),
}));

import { savePhotos, loadPhotoPaths, deletePhotos } from '../../src/services/photoService';

describe('photoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMakeDirectoryAsync.mockResolvedValue(undefined);
    mockCopyAsync.mockResolvedValue(undefined);
    mockSetItem.mockResolvedValue(undefined);
    mockRemoveItem.mockResolvedValue(undefined);
  });

  describe('savePhotos', () => {
    it('写真をドキュメントディレクトリにコピーしてパスをAsyncStorageに保存する', async () => {
      const paths = await savePhotos('user-1', ['file:///tmp/photo1.jpg']);

      expect(mockCopyAsync).toHaveBeenCalledTimes(1);
      expect(mockCopyAsync).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'file:///tmp/photo1.jpg' })
      );
      expect(mockSetItem).toHaveBeenCalledWith(
        'habit_photo_paths_user-1',
        expect.any(String)
      );
      expect(paths).toHaveLength(1);
    });

    it('複数の写真を全てコピーする', async () => {
      await savePhotos('user-1', [
        'file:///tmp/photo1.jpg',
        'file:///tmp/photo2.jpg',
        'file:///tmp/photo3.jpg',
      ]);

      expect(mockCopyAsync).toHaveBeenCalledTimes(3);
    });

    it('写真が空配列の場合はコピーせずに空配列を保存する', async () => {
      await savePhotos('user-1', []);

      expect(mockCopyAsync).not.toHaveBeenCalled();
      expect(mockSetItem).toHaveBeenCalledWith(
        'habit_photo_paths_user-1',
        JSON.stringify([])
      );
    });
  });

  describe('loadPhotoPaths', () => {
    it('保存済み写真パスを返す', async () => {
      const paths = ['/path/to/photo1.jpg', '/path/to/photo2.jpg'];
      mockGetItem.mockResolvedValue(JSON.stringify(paths));

      const result = await loadPhotoPaths('user-1');

      expect(result).toEqual(paths);
    });

    it('保存データがない場合は空配列を返す', async () => {
      mockGetItem.mockResolvedValue(null);

      const result = await loadPhotoPaths('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('deletePhotos', () => {
    it('保存済み写真ファイルを削除してAsyncStorageのキーを削除する', async () => {
      const paths = [
        'file:///app/documents/habit-photos/photo1.jpg',
        'file:///app/documents/habit-photos/photo2.jpg',
      ];
      mockGetItem.mockResolvedValue(JSON.stringify(paths));
      mockGetInfoAsync.mockResolvedValue({ exists: true });
      mockDeleteAsync.mockResolvedValue(undefined);

      await deletePhotos('user-1');

      expect(mockDeleteAsync).toHaveBeenCalledTimes(2);
      expect(mockRemoveItem).toHaveBeenCalledWith('habit_photo_paths_user-1');
    });

    it('ファイルが存在しない場合はdeleteを呼ばない', async () => {
      const paths = ['file:///app/documents/habit-photos/photo1.jpg'];
      mockGetItem.mockResolvedValue(JSON.stringify(paths));
      mockGetInfoAsync.mockResolvedValue({ exists: false });

      await deletePhotos('user-1');

      expect(mockDeleteAsync).not.toHaveBeenCalled();
      expect(mockRemoveItem).toHaveBeenCalledWith('habit_photo_paths_user-1');
    });

    it('写真パスが保存されていない場合は何もしない', async () => {
      mockGetItem.mockResolvedValue(null);

      await deletePhotos('user-1');

      expect(mockDeleteAsync).not.toHaveBeenCalled();
      expect(mockRemoveItem).toHaveBeenCalledWith('habit_photo_paths_user-1');
    });
  });
});
