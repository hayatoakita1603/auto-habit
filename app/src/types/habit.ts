export type DailySchedule = {
	type: "daily";
	hour: number; // 0-23
	minute: number; // 0-59
};

export type HabitInput = {
	name: string;
	schedule: DailySchedule;
};

export type Habit = HabitInput & {
	id: string;
	createdAt: Date;
};
