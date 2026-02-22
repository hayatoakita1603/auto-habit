import { collection, addDoc, getDocs, query, limit, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { HabitInput } from '../types/habit';

export const createHabit = async (uid: string, input: HabitInput): Promise<string> => {
  const ref = collection(db, 'users', uid, 'habits');
  const doc = await addDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
  });
  return doc.id;
};

// 全件取得を避けるためlimit(1)で存在確認のみ行う
export const hasHabit = async (uid: string): Promise<boolean> => {
  const ref = collection(db, 'users', uid, 'habits');
  const q = query(ref, limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
