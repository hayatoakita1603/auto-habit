import { act, fireEvent, render, screen } from "@testing-library/react-native";
import type { User } from "firebase/auth";
import type { Habit } from "../../src/types/habit";

const mockUser = { uid: "user-1" } as User;

const mockHabit: Habit = {
	id: "habit-id-1",
	name: "ランニング",
	schedule: { type: "daily", hour: 7, minute: 0 },
	createdAt: new Date("2026-01-01"),
};

const mockUpdateHabit = jest.fn();
const mockScheduleHabitNotification = jest.fn();
const mockLoadPhotoPaths = jest.fn();

jest.mock("../../src/contexts/UserContext", () => ({
	useUser: () => ({ user: mockUser }),
}));

jest.mock("../../src/hooks/useHabit", () => ({
	useHabit: () => ({
		habit: mockHabit,
		loading: false,
		updateHabit: mockUpdateHabit,
	}),
}));

jest.mock("../../src/services/notificationService", () => ({
	scheduleHabitNotification: (...args: unknown[]) =>
		mockScheduleHabitNotification(...args),
}));

jest.mock("../../src/services/photoService", () => ({
	loadPhotoPaths: (...args: unknown[]) => mockLoadPhotoPaths(...args),
}));

jest.mock("@react-native-community/datetimepicker", () => {
	const { View } = require("react-native");
	return ({ testID }: { testID?: string }) => (
		<View testID={testID ?? "date-time-picker"} />
	);
});

jest.mock("react-native-safe-area-context", () => {
	const { View } = require("react-native");
	return {
		SafeAreaView: ({
			children,
			...props
		}: React.ComponentProps<typeof View>) => <View {...props}>{children}</View>,
	};
});

import { HabitSettingsScreen } from "../../src/screens/HabitSettingsScreen";

const mockOnClose = jest.fn();

describe("HabitSettingsScreen", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockLoadPhotoPaths.mockResolvedValue([]);
		mockUpdateHabit.mockResolvedValue(undefined);
		mockScheduleHabitNotification.mockResolvedValue(undefined);
	});

	it("習慣名と通知時刻が表示される", () => {
		render(<HabitSettingsScreen onClose={mockOnClose} />);

		expect(screen.getByDisplayValue("ランニング")).toBeTruthy();
		expect(screen.getByTestId("time-picker")).toBeTruthy();
	});

	it("保存ボタンを押すと updateHabit が呼ばれる", async () => {
		render(<HabitSettingsScreen onClose={mockOnClose} />);

		await act(async () => {
			fireEvent.press(screen.getByText("保存"));
		});

		expect(mockUpdateHabit).toHaveBeenCalledWith({
			name: "ランニング",
			schedule: { type: "daily", hour: 7, minute: 0 },
		});
	});

	it("保存後に通知が再スケジュールされる", async () => {
		mockLoadPhotoPaths.mockResolvedValue(["/photos/1.jpg"]);
		render(<HabitSettingsScreen onClose={mockOnClose} />);

		await act(async () => {
			fireEvent.press(screen.getByText("保存"));
		});

		expect(mockScheduleHabitNotification).toHaveBeenCalledWith(
			expect.objectContaining({ name: "ランニング" }),
			["/photos/1.jpg"],
		);
	});

	it("習慣名が空のとき保存ボタンが無効になる", () => {
		render(<HabitSettingsScreen onClose={mockOnClose} />);

		fireEvent.changeText(screen.getByDisplayValue("ランニング"), "");

		expect(
			screen.getByTestId("save-button").props.accessibilityState?.disabled,
		).toBe(true);
	});
});
