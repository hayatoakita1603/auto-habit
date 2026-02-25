import * as Notifications from 'expo-notifications';
import type { Habit } from '../types/habit';

const MESSAGE_TEMPLATES = [
  (name: string) => `${name}の時間です!`,
  (name: string) => `${name}をやりましょう!`,
  (name: string) => `今日も${name}、一緒に頑張りましょう!`,
];

export const getRandomMessage = (habitName: string): string => {
  const index = Math.floor(Math.random() * MESSAGE_TEMPLATES.length);
  return MESSAGE_TEMPLATES[index](habitName);
};

export const cancelAllNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const scheduleHabitNotification = async (
  habit: Habit,
  photoPaths: string[]
): Promise<void> => {
  await cancelAllNotifications();

  const body = getRandomMessage(habit.name);
  const photoPath =
    photoPaths.length > 0
      ? photoPaths[Math.floor(Math.random() * photoPaths.length)]
      : undefined;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: habit.name,
      body,
      ...(photoPath ? { attachments: [{ url: photoPath }] } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: habit.schedule.hour,
      minute: habit.schedule.minute,
      repeats: true,
    },
  });
};
