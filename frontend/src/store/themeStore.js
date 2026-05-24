import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
  persist(
    (set) => ({
      dark: false,
      toggle: () => set((s) => ({ dark: !s.dark })),
      setDark: (val) => set({ dark: val }),
    }),
    { name: "aim-theme" }
  )
);

export default useThemeStore;
