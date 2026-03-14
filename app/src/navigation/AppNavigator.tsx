import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../constants/colors";
import { CalendarScreen } from "../screens/CalendarScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { SettingsScreen } from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
	return (
		<Tab.Navigator
			screenOptions={{
				headerStyle: { backgroundColor: colors.background },
				headerTintColor: colors.textPrimary,
				headerShadowVisible: false,
				tabBarStyle: {
					backgroundColor: colors.background,
					borderTopColor: colors.border,
				},
				tabBarActiveTintColor: colors.accent,
				tabBarInactiveTintColor: colors.textSecondary,
			}}
		>
			<Tab.Screen
				name="Home"
				component={HomeScreen}
				options={{
					title: "記録",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="pencil" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="Calendar"
				component={CalendarScreen}
				options={{
					title: "履歴",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="calendar-outline" size={size} color={color} />
					),
				}}
			/>
			<Tab.Screen
				name="Settings"
				component={SettingsScreen}
				options={{
					title: "設定",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="settings-outline" size={size} color={color} />
					),
				}}
			/>
		</Tab.Navigator>
	);
};
