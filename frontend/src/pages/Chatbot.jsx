import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Trash2, Sparkles, Mic } from "lucide-react";
import { askChatbot } from "../api/chat";
import useChatStore from "../store/chatStore";
import VoiceModal from "../components/VoiceModal";

const QUICK_QUESTIONS = [
  "Ish vaqti qanday?",
  "Kredit olish uchun hujjatlar?",
  "Dress-code talablari?",
  "Depozit foizi qancha?",
];

export default function Chatbot() {
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const { messages, addMessage, clearMessages } = useChatStore();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    addMessage({ role: "user", text: q, time: new Date() });
    setInput("");
    setLoading(true);
    try {
      const res = await askChatbot(q);
      // Faqat matn javob — TTS yo'q (ovozli suhbat alohida modal orqali)
      addMessage({ role: "bot", text: res.data.answer, time: new Date() });
    } catch {
      addMessage({ role: "bot", text: "Xato yuz berdi. Qayta urining.", time: new Date(), error: true });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatTime = (d) =>
    d ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}` : "";

  return (
    <>
      <div className="flex flex-col h-[calc(100vh-88px)] gap-3">

        {/* ── Header ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card px-5 py-4 flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-800 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-800 text-sm">Zulfiya — AI Mentor</h2>
                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Onlayn
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Bank qoidalari bo'yicha yordam beradi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Ovozli suhbat tugmasi */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowVoiceModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-700 text-white text-xs font-semibold shadow-sm hover:bg-primary-800 transition-all"
            >
              <Mic size={14} />
              Ovozli suhbat
            </motion.button>

            {messages.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={clearMessages}
                className="p-2.5 bg-red-50 text-red-400 hover:bg-red-100 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ── Messages ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 px-1">

          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-10"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary-800 to-blue-600 rounded-3xl flex items-center justify-center mb-5 shadow-lg">
                <Sparkles size={36} className="text-white" />
              </div>
              <h3 className="font-bold text-gray-700 text-lg mb-1">Zulfiya bilan gaplashing</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                Bank qoidalari, ish tartibi, kredit va depozit bo'yicha savollar bering
              </p>

              {/* Quick questions */}
              <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-sm">
                {QUICK_QUESTIONS.map((q) => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:border-primary-400 hover:text-primary-700 transition-all shadow-sm"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>

              {/* Voice hint */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowVoiceModal(true)}
                className="mt-4 flex items-center gap-2 text-xs text-primary-600 bg-primary-50 border border-primary-100 px-4 py-2.5 rounded-xl hover:bg-primary-100 transition-all"
              >
                <Mic size={13} />
                Yoki ovozli suhbat boshlang
              </motion.button>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="w-8 h-8 bg-gradient-to-br from-primary-800 to-blue-600 rounded-xl flex items-center justify-center shrink-0 mt-auto mb-5">
                  <Bot size={14} className="text-white" />
                </div>
              )}
              <div className="max-w-[78%] space-y-1">
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary-700 text-white rounded-br-sm shadow-md"
                      : msg.error
                      ? "bg-red-50 text-red-700 border border-red-100 rounded-bl-sm"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <p className={`text-[10px] text-gray-400 ${msg.role === "user" ? "text-right pr-1" : "pl-1"}`}>
                  {formatTime(msg.time)}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2.5 justify-start"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-800 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((j) => (
                    <motion.div
                      key={j}
                      className="w-2 h-2 bg-gray-300 rounded-full"
                      animate={{ y: [0, -5, 0], backgroundColor: ["#d1d5db", "#6b7280", "#d1d5db"] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: j * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Text input ──────────────────────────── */}
        <div className="flex gap-2 shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Savol yozing..."
            className="input-field flex-1"
            disabled={loading}
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="btn-primary px-4 shrink-0 disabled:opacity-40"
          >
            <Send size={17} />
          </motion.button>
        </div>
      </div>

      {/* ── Voice Modal ─────────────────────────── */}
      <AnimatePresence>
        {showVoiceModal && (
          <VoiceModal onClose={() => setShowVoiceModal(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
