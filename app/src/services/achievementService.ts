import { doc, collection, setDoc, getDoc, getDocs, deleteDoc, serverTimestamp, query, where, documentId } from 'firebase/firestore';
import { db } from './firebase';
import { formatDate } from '../utils/date';

export const addAchievement = async (uid: string, date: string): Promise<void> => {
  const ref = doc(db, 'users', uid, 'achievements', date);
  await setDoc(ref, { completedAt: serverTimestamp() });
};

export const deleteAchievement = async (uid: string, date: string): Promise<void> => {
  const ref = doc(db, 'users', uid, 'achievements', date);
  await deleteDoc(ref);
};

export const getTodayAchievement = async (uid: string, date: string): Promise<boolean> => {
  const ref = doc(db, 'users', uid, 'achievements', date);
  const snapshot = await getDoc(ref);
  return snapshot.exists();
};

export const getAchievementsByMonth = async (uid: string, year: number, month: number): Promise<Set<string>> => {
  const m = String(month).padStart(2, '0');
  const ref = collection(db, 'users', uid, 'achievements');
  const q = query(
    ref,
    where(documentId(), '>=', `${year}-${m}-01`),
    where(documentId(), '<=', `${year}-${m}-31`),
  );
  const snapshot = await getDocs(q);
  return new Set(snapshot.docs.map(d => d.id));
};

export const getStreak = async (uid: string, today: string): Promise<number> => {
  const ref = collection(db, 'users', uid, 'achievements');
  const snapshot = await getDocs(ref);
  const dates = new Set(snapshot.docs.map(d => d.id));

  let streak = 0;
  // new Date('YYYY-MM-DD') はUTC0時として解釈されるためローカル時刻で扱う
  const current = new Date(`${today}T00:00:00`);

  // 今日未達成なら昨日から遡る
  if (!dates.has(today)) {
    current.setDate(current.getDate() - 1);
  }

  while (dates.has(formatDate(current))) {
    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
};
