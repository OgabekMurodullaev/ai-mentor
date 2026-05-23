import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  setUser: (user) => set({ user, isAuthenticated: true, loading: false }),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, isAuthenticated: false, loading: false });
  },

  initFromStorage: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { getMe } = await import("../api/auth");
      const res = await getMe();
      set({ user: res.data, isAuthenticated: true, loading: false });
    } catch {
      localStorage.clear();
      set({ loading: false });
    }
  },
}));

export default useAuthStore;
