const mockSetDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockServerTimestamp = jest.fn(() => 'server-timestamp');
const mockQuery = jest.fn((...args: unknown[]) => ({ _query: args }));
const mockWhere = jest.fn((...args: unknown[]) => ({ _where: args }));
const mockDocumentId = jest.fn(() => '__documentId__');

jest.mock('../../src/services/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => mockDoc(...args),
  collection: (...args: unknown[]) => mockCollection(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  serverTimestamp: () => mockServerTimestamp(),
  query: (...args: unknown[]) => mockQuery(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  documentId: () => mockDocumentId(),
}));

import { addAchievement, getTodayAchievement, getStreak, getAchievementsByMonth } from '../../src/services/achievementService';

describe('achievementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockReturnValue({});
    mockCollection.mockReturnValue({});
  });

  describe('addAchievement', () => {
    it('指定した日付のドキュメントを作成する', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      await addAchievement('user-1', '2026-02-22');

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ completedAt: 'server-timestamp' })
      );
    });

    it('日付をドキュメントIDとして使用する', async () => {
      mockSetDoc.mockResolvedValue(undefined);

      await addAchievement('user-1', '2026-02-22');

      expect(mockDoc).toHaveBeenCalledWith(
        expect.anything(),
        'users',
        'user-1',
        'achievements',
        '2026-02-22'
      );
    });
  });

  describe('getTodayAchievement', () => {
    it('達成済みの場合はtrueを返す', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => true });

      const result = await getTodayAchievement('user-1', '2026-02-22');

      expect(result).toBe(true);
    });

    it('未達成の場合はfalseを返す', async () => {
      mockGetDoc.mockResolvedValue({ exists: () => false });

      const result = await getTodayAchievement('user-1', '2026-02-22');

      expect(result).toBe(false);
    });
  });

  describe('getAchievementsByMonth', () => {
    it('指定月の達成日セットを返す', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: '2026-02-10' },
          { id: '2026-02-15' },
          { id: '2026-02-22' },
        ],
      });

      const result = await getAchievementsByMonth('user-1', 2026, 2);

      expect(result).toEqual(new Set(['2026-02-10', '2026-02-15', '2026-02-22']));
    });

    it('達成がない月は空セットを返す', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });

      const result = await getAchievementsByMonth('user-1', 2026, 2);

      expect(result).toEqual(new Set());
    });

    it('月の範囲でクエリを発行する', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });

      await getAchievementsByMonth('user-1', 2026, 2);

      expect(mockWhere).toHaveBeenCalledWith('__documentId__', '>=', '2026-02-01');
      expect(mockWhere).toHaveBeenCalledWith('__documentId__', '<=', '2026-02-31');
    });
  });

  describe('getStreak', () => {
    it('今日から連続した達成日数を返す', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: '2026-02-22' },
          { id: '2026-02-21' },
          { id: '2026-02-20' },
        ],
      });

      const streak = await getStreak('user-1', '2026-02-22');

      expect(streak).toBe(3);
    });

    it('途中で途切れた場合は直近の連続分だけ返す', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: '2026-02-22' },
          { id: '2026-02-21' },
          // 2026-02-20 が欠け
          { id: '2026-02-19' },
        ],
      });

      const streak = await getStreak('user-1', '2026-02-22');

      expect(streak).toBe(2);
    });

    it('今日未達成でも昨日からの連続を返す', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [
          { id: '2026-02-21' },
          { id: '2026-02-20' },
        ],
      });

      const streak = await getStreak('user-1', '2026-02-22');

      expect(streak).toBe(2);
    });

    it('達成がない場合は0を返す', async () => {
      mockGetDocs.mockResolvedValue({ docs: [] });

      const streak = await getStreak('user-1', '2026-02-22');

      expect(streak).toBe(0);
    });
  });
});
