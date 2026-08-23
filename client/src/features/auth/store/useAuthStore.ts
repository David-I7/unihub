import type { User } from "@/types/domain";
import { create } from "zustand";

type State = {
  user: User | null;
  accessToken: string | null;
};

type Action = {
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
};

type AuthState = State & Action;

const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    accessToken: null,
    setAuth: (user, accessToken) => set({ user, accessToken }),
    setAccessToken: (accessToken) => set({ accessToken }),
    clearAuth: () => set({ user: null, accessToken: null }),
  };
});

export default useAuthStore;
