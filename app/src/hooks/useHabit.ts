import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { hasHabit as checkHasHabit, createHabit as createHabitInFirestore } from '../services/habitService';
import type { HabitInput } from '../types/habit';

type HabitState = {
  hasHabit: boolean | null;
  loading: boolean;
  createHabit: (input: HabitInput) => Promise<void>;
};

export const useHabit = (user: User | null): HabitState => {
  const [hasHabit, setHasHabit] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    checkHasHabit(user.uid)
      .then(setHasHabit)
      .finally(() => setLoading(false));
  }, [user]);

  const createHabit = useCallback(
    async (input: HabitInput) => {
      if (!user) return;
      await createHabitInFirestore(user.uid, input);
      setHasHabit(true);
    },
    [user]
  );

  return { hasHabit, loading, createHabit };
};
