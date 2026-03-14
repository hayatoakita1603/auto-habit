import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { useUser } from "../contexts/UserContext";
import { loadPhotoPaths } from "../services/photoService";
import { HabitSettingsScreen } from "./HabitSettingsScreen";
import { PhotoSettingsScreen } from "./PhotoSettingsScreen";

export const SettingsScreen = () => {
	const { user } = useUser();
	const [habitModalVisible, setHabitModalVisible] = useState(false);
	const [photoModalVisible, setPhotoModalVisible] = useState(false);
	const [photoCount, setPhotoCount] = useState(0);

	const refreshPhotoCount = useCallback(async () => {
		if (!user) return;
		const paths = await loadPhotoPaths(user.uid);
		setPhotoCount(paths.length);
	}, [user]);

	// タブフォーカス時と写真モーダルを閉じた後に枚数を更新
	useFocusEffect(
		useCallback(() => {
			refreshPhotoCount();
		}, [refreshPhotoCount]),
	);

	const handleClosePhotoModal = () => {
		setPhotoModalVisible(false);
		refreshPhotoCount();
	};

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.heading}>設定</Text>

			<View style={styles.list}>
				<TouchableOpacity
					style={styles.row}
					onPress={() => setHabitModalVisible(true)}
				>
					<Text style={styles.rowLabel}>習慣名・通知時刻</Text>
					<Text style={styles.chevron}>›</Text>
				</TouchableOpacity>
				<View style={styles.separator} />
				<TouchableOpacity
					style={styles.row}
					onPress={() => setPhotoModalVisible(true)}
				>
					<Text style={styles.rowLabel}>モチベ写真</Text>
					<View style={styles.rowRight}>
						{photoCount > 0 && (
							<Text style={styles.rowValue}>{photoCount}枚</Text>
						)}
						<Text style={styles.chevron}>›</Text>
					</View>
				</TouchableOpacity>
			</View>

			<Modal
				visible={habitModalVisible}
				animationType="slide"
				onRequestClose={() => setHabitModalVisible(false)}
			>
				<SafeAreaProvider>
					<HabitSettingsScreen onClose={() => setHabitModalVisible(false)} />
				</SafeAreaProvider>
			</Modal>

			<Modal
				visible={photoModalVisible}
				animationType="slide"
				onRequestClose={handleClosePhotoModal}
			>
				<SafeAreaProvider>
					<PhotoSettingsScreen onClose={handleClosePhotoModal} />
				</SafeAreaProvider>
			</Modal>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.surface,
	},
	heading: {
		fontSize: 34,
		fontWeight: "700",
		paddingHorizontal: 20,
		paddingBottom: 12,
		color: colors.textPrimary,
	},
	list: {
		backgroundColor: colors.background,
		borderRadius: 12,
		marginHorizontal: 16,
		overflow: "hidden",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 14,
	},
	rowLabel: {
		fontSize: 17,
		color: colors.textPrimary,
	},
	rowRight: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	rowValue: {
		fontSize: 17,
		color: colors.textSecondary,
	},
	chevron: {
		fontSize: 20,
		color: colors.accent,
	},
	separator: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: colors.border,
		marginLeft: 16,
	},
});
