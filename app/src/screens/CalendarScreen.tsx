import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { colors } from "../constants/colors";
import { useUser } from "../contexts/UserContext";
import { useCalendar } from "../hooks/useCalendar";
import { formatDate } from "../utils/date";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

const buildCalendarDays = (year: number, month: number): (number | null)[] => {
	// month は 1-12
	const firstDay = new Date(year, month - 1, 1).getDay(); // 0=日
	const lastDate = new Date(year, month, 0).getDate();
	const days: (number | null)[] = Array(firstDay).fill(null);
	for (let d = 1; d <= lastDate; d++) {
		days.push(d);
	}
	return days;
};

export const CalendarScreen = () => {
	const { user } = useUser();
	const {
		year,
		month,
		achievedDates,
		loading,
		goToPrevMonth,
		goToNextMonth,
		refresh,
	} = useCalendar(user);

	// タブ切り替え後も最新データを表示するためフォーカス時に再フェッチする
	useFocusEffect(
		useCallback(() => {
			refresh();
		}, [refresh]),
	);
	const days = buildCalendarDays(year, month);
	const today = formatDate(new Date());

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
					<Text style={styles.navText}>{"‹"}</Text>
				</TouchableOpacity>
				<Text style={styles.title}>
					{year}年{month}月
				</Text>
				<TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
					<Text style={styles.navText}>{"›"}</Text>
				</TouchableOpacity>
			</View>

			<View style={styles.weekRow}>
				{WEEKDAY_LABELS.map((label) => (
					<Text key={label} style={styles.weekLabel}>
						{label}
					</Text>
				))}
			</View>

			{loading ? (
				<ActivityIndicator style={styles.loader} color={colors.accent} />
			) : (
				<View style={styles.grid}>
					{days.map((day, i) => {
						if (day === null) {
							// biome-ignore lint/suspicious/noArrayIndexKey: カレンダーの空セルは月が変わらない限り順序が変わらない
							return <View key={`empty-${i}`} style={styles.cell} />;
						}
						const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
						const achieved = achievedDates.has(dateStr);
						const isToday = dateStr === today;
						return (
							<View
								key={dateStr}
								style={[
									styles.cell,
									achieved && styles.achievedCell,
									isToday && styles.todayCell,
								]}
							>
								<Text
									style={[
										styles.dayText,
										isToday && styles.todayText,
										achieved && styles.achievedText,
									]}
								>
									{day}
								</Text>
							</View>
						);
					})}
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: colors.background,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	navButton: {
		padding: 8,
	},
	navText: {
		fontSize: 28,
		color: colors.accent,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: colors.textPrimary,
	},
	weekRow: {
		flexDirection: "row",
		marginBottom: 4,
	},
	weekLabel: {
		flex: 1,
		textAlign: "center",
		fontSize: 12,
		color: colors.textSecondary,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	cell: {
		width: `${100 / 7}%`,
		aspectRatio: 1,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 4,
	},
	achievedCell: {
		backgroundColor: colors.accent,
	},
	todayCell: {
		borderWidth: 1,
		borderColor: colors.accent,
		borderRadius: 4,
		paddingBottom: 10,
	},
	dayText: {
		fontSize: 14,
		color: colors.textSecondary,
	},
	achievedText: {
		color: "#FFFFFF",
	},
	todayText: {
		color: colors.accent,
		fontWeight: "bold",
	},
	loader: {
		marginTop: 32,
	},
});
