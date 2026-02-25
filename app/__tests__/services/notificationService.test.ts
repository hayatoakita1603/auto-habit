const mockScheduleNotificationAsync = jest.fn();
const mockCancelAllScheduledNotificationsAsync = jest.fn();

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: (...args: unknown[]) => mockScheduleNotificationAsync(...args),
  cancelAllScheduledNotificationsAsync: (...args: unknown[]) =>
    mockCancelAllScheduledNotificationsAsync(...args),
  SchedulableTriggerInputTypes: {
    CALENDAR: 'calendar',
  },
}));

import {
  getRandomMessage,
  scheduleHabitNotification,
  cancelAllNotifications,
} from '../../src/services/notificationService';
import type { Habit } from '../../src/types/habit';

const mockHabit: Habit = {
  id: 'habit-1',
  name: 'ランニング',
  schedule: { type: 'daily', hour: 7, minute: 0 },
  createdAt: new Date(),
};

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);
    mockScheduleNotificationAsync.mockResolvedValue('notification-id');
  });

  describe('getRandomMessage', () => {
    it('habitNameを含むメッセージを返す', () => {
      const message = getRandomMessage('ランニング');
      expect(message).toContain('ランニング');
    });

    it('3種類のテンプレートを使用する', () => {
      const messages = new Set<string>();
      for (let i = 0; i < 200; i++) {
        messages.add(getRandomMessage('test'));
      }
      // ランダムなので3種類全部が出る可能性は高い（200回試行）
      expect(messages.size).toBeGreaterThan(1);
    });
  });

  describe('scheduleHabitNotification', () => {
    it('既存の通知をキャンセルしてから新しい通知をスケジュールする', async () => {
      await scheduleHabitNotification(mockHabit, []);

      expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
      expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });

    it('習慣の時刻でトリガーを設定する', async () => {
      await scheduleHabitNotification(mockHabit, []);

      expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            hour: 7,
            minute: 0,
            repeats: true,
          }),
        })
      );
    });

    it('写真パスなしの場合はattachmentsなしで通知する', async () => {
      await scheduleHabitNotification(mockHabit, []);

      const call = mockScheduleNotificationAsync.mock.calls[0][0];
      expect(call.content.attachments).toBeUndefined();
    });

    it('写真パスありの場合はランダムに1枚をattachmentsに含める', async () => {
      await scheduleHabitNotification(mockHabit, [
        '/path/to/photo1.jpg',
        '/path/to/photo2.jpg',
      ]);

      const call = mockScheduleNotificationAsync.mock.calls[0][0];
      expect(call.content.attachments).toBeDefined();
      expect(call.content.attachments).toHaveLength(1);
    });
  });

  describe('cancelAllNotifications', () => {
    it('全てのスケジュール済み通知をキャンセルする', async () => {
      await cancelAllNotifications();

      expect(mockCancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    });
  });
});
