import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { addAchievement, getTodayAchievement, getStreak } from '../services/achievementService';
import { formatDate } from '../utils/date';

type AchievementState = {
  todayDone: boolean;
  streak: number;
  loading: boolean;
  markDone: () => Promise<void>;
};

export const useAchievement = (user: User | null): AchievementState => {
  const [todayDone, setTodayDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const today = formatDate(new Date());
    Promise.all([
      getTodayAchievement(user.uid, today),
      getStreak(user.uid, today),
    ])
      .then(([done, streakCount]) => {
        setTodayDone(done);
        setStreak(streakCount);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const markDone = useCallback(async () => {
    if (!user) return;
    const today = formatDate(new Date());
    await addAchievement(user.uid, today);
    setTodayDone(true);
    setStreak(s => s + 1);
  }, [user]);

  return { todayDone, streak, loading, markDone };
};
