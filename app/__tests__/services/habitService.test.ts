const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockLimit = jest.fn();
const mockServerTimestamp = jest.fn(() => 'server-timestamp');

jest.mock('../../src/services/firebase', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  limit: (...args: unknown[]) => mockLimit(...args),
  serverTimestamp: () => mockServerTimestamp(),
}));

import { createHabit, hasHabit, getHabit } from '../../src/services/habitService';
import type { HabitInput } from '../../src/types/habit';

const mockInput: HabitInput = {
  name: 'ランニング',
  schedule: { type: 'daily', hour: 7, minute: 0 },
};

describe('habitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // collection/queryのモック戻り値を設定（addDoc/getDocsの第1引数として渡る）
    mockCollection.mockReturnValue({});
    mockQuery.mockReturnValue({});
  });

  describe('createHabit', () => {
    it('Firestoreにhabitsドキュメントを作成してidを返す', async () => {
      mockAddDoc.mockResolvedValue({ id: 'habit-id-1' });

      const id = await createHabit('user-1', mockInput);

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'ランニング',
          schedule: { type: 'daily', hour: 7, minute: 0 },
          createdAt: 'server-timestamp',
        })
      );
      expect(id).toBe('habit-id-1');
    });
  });

  describe('getHabit', () => {
    it('最初のhabitsドキュメントをHabitオブジェクトとして返す', async () => {
      const mockDoc = {
        id: 'habit-id-1',
        data: () => ({
          name: 'ランニング',
          schedule: { type: 'daily', hour: 7, minute: 0 },
          createdAt: 'server-timestamp',
        }),
      };
      mockGetDocs.mockResolvedValue({ empty: false, docs: [mockDoc] });

      const habit = await getHabit('user-1');

      expect(habit).toEqual({
        id: 'habit-id-1',
        name: 'ランニング',
        schedule: { type: 'daily', hour: 7, minute: 0 },
        createdAt: 'server-timestamp',
      });
    });

    it('habitが存在しない場合はnullを返す', async () => {
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] });

      const habit = await getHabit('user-1');

      expect(habit).toBeNull();
    });

    it('limit(1)で最小限のクエリを発行する', async () => {
      mockGetDocs.mockResolvedValue({ empty: true, docs: [] });

      await getHabit('user-1');

      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });

  describe('hasHabit', () => {
    it('habitsコレクションが空でない場合はtrueを返す', async () => {
      mockGetDocs.mockResolvedValue({ empty: false });

      const result = await hasHabit('user-1');

      expect(result).toBe(true);
    });

    it('habitsコレクションが空の場合はfalseを返す', async () => {
      mockGetDocs.mockResolvedValue({ empty: true });

      const result = await hasHabit('user-1');

      expect(result).toBe(false);
    });

    it('limit(1)で最小限のクエリを発行する', async () => {
      mockGetDocs.mockResolvedValue({ empty: true });

      await hasHabit('user-1');

      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });
});
