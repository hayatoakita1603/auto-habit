import {
	onAuthStateChanged,
	signInAnonymously,
	type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../services/firebase";

type AuthState = {
	user: User | null;
	loading: boolean;
	error: Error | null;
};

export const useAuth = (): AuthState => {
	const [state, setState] = useState<AuthState>({
		user: null,
		loading: true,
		error: null,
	});

	useEffect(() => {
		// onAuthStateChangedで既存セッションを検知してからサインインすることで、
		// アプリ再起動時に不要な匿名アカウントが重複作成されるのを防ぐ
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				setState({ user, loading: false, error: null });
			} else {
				try {
					await signInAnonymously(auth);
				} catch (error) {
					// クラッシュさせずUIでエラーを表示できるよう状態として保持する
					setState({ user: null, loading: false, error: error as Error });
				}
			}
		});

		return unsubscribe;
	}, []);

	return state;
};
