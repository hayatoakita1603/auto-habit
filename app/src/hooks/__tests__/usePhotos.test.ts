import { renderHook, waitFor } from '@testing-library/react-native';
import { usePhotos } from '../usePhotos';
import { loadPhotoPaths } from '../../services/photoService';

jest.mock('../../services/photoService', () => ({
  loadPhotoPaths: jest.fn(),
}));
const mockLoadPhotoPaths = loadPhotoPaths as jest.Mock;

describe('usePhotos', () => {
  it('写真パスを読み込んで返す', async () => {
    const mockPaths = ['/path/photo1.jpg', '/path/photo2.jpg'];
    mockLoadPhotoPaths.mockResolvedValue(mockPaths);

    const { result } = renderHook(() => usePhotos({ uid: 'user-1' } as any));

    await waitFor(() => {
      expect(result.current.photoPaths).toEqual(mockPaths);
    });
  });

  it('userがnullの場合は空配列を返す', () => {
    const { result } = renderHook(() => usePhotos(null));
    expect(result.current.photoPaths).toEqual([]);
  });
});
