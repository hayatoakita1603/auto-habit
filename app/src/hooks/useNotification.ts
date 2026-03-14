import type { User } from "firebase/auth";
import { useEffect } from "react";
import { scheduleHabitNotification } from "../services/notificationService";
import { loadPhotoPaths } from "../services/photoService";
import type { Habit } from "../types/habit";

export const useNotification = (
	user: User | null,
	habit: Habit | null,
): void => {
	useEffect(() => {
		if (!user || !habit) return;

		loadPhotoPaths(user.uid).then((paths) => {
			scheduleHabitNotification(habit, paths);
		});
	}, [user, habit]);
};
