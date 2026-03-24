import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, HealthProfile } from "@pharmapersonal/types";

interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem("token", token);
        set({ token, user });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ token: null, user: null });
      },
    }),
    { name: "auth-store" }
  )
);

interface ProfileStore {
  profile: HealthProfile | null;
  healthScore: number | null;
  setProfile: (p: HealthProfile) => void;
  setScore: (s: number) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  healthScore: null,
  setProfile: (profile) => set({ profile }),
  setScore: (healthScore) => set({ healthScore }),
}));
