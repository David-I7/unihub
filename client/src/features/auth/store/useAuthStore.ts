import type { User } from "@/types/domain";
import { create } from "zustand";

type State = {
  user: User | null;
  accessToken: string | null;
  initialized: boolean;
};

type Action = {
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setInitialized: () => void;
};

type AuthState = State & Action;

const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    accessToken: null,
    initialized: false,
    setAuth: (user, accessToken) =>
      set({ user, accessToken, initialized: true }),
    setAccessToken: (accessToken) => set({ accessToken }),
    setInitialized: () => set({ initialized: true }),
    clearAuth: () => set({ user: null, accessToken: null }),
  };
});

export default useAuthStore;
