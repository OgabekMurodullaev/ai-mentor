import { create } from "zustand";

const useChatStore = create((set) => ({
  messages: [],

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;
