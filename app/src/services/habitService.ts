import { collection, addDoc, getDocs, query, limit, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Habit, HabitInput } from '../types/habit';

export const createHabit = async (uid: string, input: HabitInput): Promise<string> => {
  const ref = collection(db, 'users', uid, 'habits');
  const added = await addDoc(ref, {
    ...input,
    createdAt: serverTimestamp(),
  });
  return added.id;
};

export const getHabit = async (uid: string): Promise<Habit | null> => {
  const ref = collection(db, 'users', uid, 'habits');
  const q = query(ref, limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...(docSnap.data() as Omit<Habit, 'id'>) };
};

export const updateHabit = async (uid: string, habitId: string, input: HabitInput): Promise<void> => {
  const ref = doc(db, 'users', uid, 'habits', habitId);
  await updateDoc(ref, { ...input });
};

// 全件取得を避けるためlimit(1)で存在確認のみ行う
export const hasHabit = async (uid: string): Promise<boolean> => {
  const ref = collection(db, 'users', uid, 'habits');
  const q = query(ref, limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
