import { useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { Habit } from '../types/habit';
import { scheduleHabitNotification } from '../services/notificationService';
import { loadPhotoPaths } from '../services/photoService';

export const useNotification = (user: User | null, habit: Habit | null): void => {
  useEffect(() => {
    if (!user || !habit) return;

    loadPhotoPaths(user.uid).then((paths) => {
      scheduleHabitNotification(habit, paths);
    });
  }, [user, habit]);
};
