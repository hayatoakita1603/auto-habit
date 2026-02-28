import { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { getAchievementsByMonth } from '../services/achievementService';

type CalendarState = {
  year: number;
  month: number;
  achievedDates: Set<string>;
  loading: boolean;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
};

export const useCalendar = (user: User | null): CalendarState => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [achievedDates, setAchievedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getAchievementsByMonth(user.uid, year, month)
      .then(dates => setAchievedDates(dates))
      .finally(() => setLoading(false));
  }, [user, year, month]);

  const goToPrevMonth = useCallback(() => {
    setMonth(m => {
      if (m === 1) {
        setYear(y => y - 1);
        return 12;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonth(m => {
      if (m === 12) {
        setYear(y => y + 1);
        return 1;
      }
      return m + 1;
    });
  }, []);

  return { year, month, achievedDates, loading, goToPrevMonth, goToNextMonth };
};
