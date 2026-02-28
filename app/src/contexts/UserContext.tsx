import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';

type UserContextValue = {
  user: User | null;
};

const UserContext = createContext<UserContextValue>({ user: null });

export const UserProvider = UserContext.Provider;

export const useUser = (): UserContextValue => useContext(UserContext);
