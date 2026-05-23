import { create } from "zustand";
import { DEMO_MODE } from "../config/demoMode";

const STORAGE_KEY = "ai_mentor_demo";

const useDemoStore = create((set) => ({
  isDemo: (() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null ? stored === "true" : DEMO_MODE;
  })(),

  toggle: () =>
    set((s) => {
      const next = !s.isDemo;
      localStorage.setItem(STORAGE_KEY, String(next));
      return { isDemo: next };
    }),
}));

/**
 * Non-React kod uchun (API funksiyalari ichida hook ishlatib bo'lmaydi)
 * localStorage'dan to'g'ridan-to'g'ri o'qiydi.
 */
export const isDemoMode = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null ? stored === "true" : DEMO_MODE;
};

export default useDemoStore;
