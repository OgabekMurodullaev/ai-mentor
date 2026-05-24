import { create } from "zustand";
import { persist } from "zustand/middleware";

const useChatStore = create(
  persist(
    (set, get) => ({
      sessions: [],          // [{id, title, messages, createdAt}]
      currentSessionId: null,

      /** Yangi seans yaratish (bo'sh sessionlarni tozalab) */
      newSession: () => {
        const id = `chat_${Date.now()}`;
        set((state) => ({
          sessions: [
            { id, title: "Yangi chat", messages: [], createdAt: new Date().toISOString() },
            ...state.sessions.filter((s) => s.messages.length > 0).slice(0, 19),
          ],
          currentSessionId: id,
        }));
        return id;
      },

      /** Seans almashtirish */
      switchSession: (id) => set({ currentSessionId: id }),

      /** Joriy seans xabarlari */
      getCurrentMessages: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find((s) => s.id === currentSessionId)?.messages ?? [];
      },

      /** Xabar qo'shish (birinchi savol sarlavha bo'ladi) */
      addMessage: (msg) => {
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== state.currentSessionId) return s;
            const messages = [...s.messages, msg];
            const title =
              s.title === "Yangi chat" && msg.role === "user"
                ? msg.text.slice(0, 38)
                : s.title;
            return { ...s, messages, title };
          }),
        }));
      },

      /** Sesanni o'chirish */
      deleteSession: (id) => {
        set((state) => {
          const sessions = state.sessions.filter((s) => s.id !== id);
          const currentSessionId =
            state.currentSessionId === id ? (sessions[0]?.id ?? null) : state.currentSessionId;
          return { sessions, currentSessionId };
        });
      },

      /** Eski clearMessages — backward compat */
      clearMessages: () => {
        const id = get().currentSessionId;
        if (!id) return;
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, messages: [], title: "Yangi chat" } : s
          ),
        }));
      },
    }),
    { name: "ai-mentor-chats" }
  )
);

export default useChatStore;
