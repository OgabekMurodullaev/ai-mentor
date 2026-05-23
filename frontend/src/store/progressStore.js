import { create } from "zustand";

const useProgressStore = create((set) => ({
  progress: null,
  leaderboard: [],
  badges: [],

  setProgress: (progress) => set({ progress }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setBadges: (badges) => set({ badges }),
}));

export default useProgressStore;
