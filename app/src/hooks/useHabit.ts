import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { getHabit, createHabit as createHabitInFirestore, updateHabit as updateHabitInFirestore } from '../services/habitService';
import type { Habit, HabitInput } from '../types/habit';

type HabitState = {
  hasHabit: boolean | null;
  habit: Habit | null;
  loading: boolean;
  createHabit: (input: HabitInput) => Promise<void>;
  updateHabit: (input: HabitInput) => Promise<void>;
};

export const useHabit = (user: User | null): HabitState => {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    getHabit(user.uid)
      .then(setHabit)
      .finally(() => setLoading(false));
  }, [user]);

  const createHabit = useCallback(
    async (input: HabitInput) => {
      if (!user) return;
      await createHabitInFirestore(user.uid, input);
      // 作成後に再取得してidやサーバー側フィールドを含む完全なオブジェクトを得る
      const newHabit = await getHabit(user.uid);
      setHabit(newHabit);
    },
    [user]
  );

  const updateHabit = useCallback(
    async (input: HabitInput) => {
      if (!user || !habit) return;
      await updateHabitInFirestore(user.uid, habit.id, input);
      setHabit((prev) => (prev ? { ...prev, ...input } : prev));
    },
    [user, habit]
  );

  const hasHabit = loading ? null : habit !== null;

  return { hasHabit, habit, loading, createHabit, updateHabit };
};
