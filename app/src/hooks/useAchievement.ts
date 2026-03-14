import type { User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import {
	addAchievement,
	deleteAchievement,
	getStreak,
	getTodayAchievement,
} from "../services/achievementService";
import { formatDate } from "../utils/date";

type AchievementState = {
	todayDone: boolean;
	streak: number;
	loading: boolean;
	markDone: () => Promise<void>;
	cancelDone: () => Promise<void>;
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
		setStreak((s) => s + 1);
	}, [user]);

	const cancelDone = useCallback(async () => {
		if (!user) return;
		const today = formatDate(new Date());
		await deleteAchievement(user.uid, today);
		setTodayDone(false);
		setStreak((s) => Math.max(0, s - 1));
	}, [user]);

	return { todayDone, streak, loading, markDone, cancelDone };
};
