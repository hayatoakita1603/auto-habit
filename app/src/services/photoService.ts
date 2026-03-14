import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";

const PHOTO_DIR = `${FileSystem.documentDirectory}habit-photos/`;

const storageKey = (userId: string) => `habit_photo_paths_${userId}`;

export const savePhotos = async (
	userId: string,
	uris: string[],
): Promise<string[]> => {
	const paths: string[] = [];

	if (uris.length === 0) {
		await AsyncStorage.setItem(storageKey(userId), JSON.stringify(paths));
		return paths;
	}

	// ディレクトリが存在しない場合のみ作成
	await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });

	for (const uri of uris) {
		// ファイル名の衝突を避けるためタイムスタンプとランダム文字列を組み合わせる
		const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
		const dest = `${PHOTO_DIR}${filename}`;
		await FileSystem.copyAsync({ from: uri, to: dest });
		paths.push(dest);
	}

	await AsyncStorage.setItem(storageKey(userId), JSON.stringify(paths));
	return paths;
};

export const loadPhotoPaths = async (userId: string): Promise<string[]> => {
	const json = await AsyncStorage.getItem(storageKey(userId));
	if (!json) return [];
	return JSON.parse(json) as string[];
};

export const updatePhotos = async (
	userId: string,
	keptPaths: string[],
	newUris: string[],
): Promise<string[]> => {
	// 削除対象ファイルを消す（元のリストにあるが維持リストにないパス）
	const originalPaths = await loadPhotoPaths(userId);
	const removedPaths = originalPaths.filter((p) => !keptPaths.includes(p));
	for (const path of removedPaths) {
		const info = await FileSystem.getInfoAsync(path);
		if (info.exists) await FileSystem.deleteAsync(path);
	}

	// 新規URIをコピー
	const newPaths: string[] = [];
	if (newUris.length > 0) {
		await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
		for (const uri of newUris) {
			const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
			const dest = `${PHOTO_DIR}${filename}`;
			await FileSystem.copyAsync({ from: uri, to: dest });
			newPaths.push(dest);
		}
	}

	const finalPaths = [...keptPaths, ...newPaths];
	await AsyncStorage.setItem(storageKey(userId), JSON.stringify(finalPaths));
	return finalPaths;
};

export const deletePhotos = async (userId: string): Promise<void> => {
	const paths = await loadPhotoPaths(userId);
	for (const path of paths) {
		const info = await FileSystem.getInfoAsync(path);
		if (info.exists) {
			await FileSystem.deleteAsync(path);
		}
	}
	await AsyncStorage.removeItem(storageKey(userId));
};
