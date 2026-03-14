import type { User } from "firebase/auth";
import { createContext, useContext } from "react";

type UserContextValue = {
	user: User | null;
};

const UserContext = createContext<UserContextValue>({ user: null });

export const UserProvider = UserContext.Provider;

export const useUser = (): UserContextValue => useContext(UserContext);
