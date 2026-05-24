import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, Sparkles, Mic, Plus, Trash2,
  MessageSquare, Clock, ChevronRight,
} from "lucide-react";
import { askChatbot } from "../api/chat";
import useChatStore from "../store/chatStore";
import VoiceModal from "../components/VoiceModal";

const QUICK_QUESTIONS = [
  "Ish vaqti qanday?",
  "Kredit hujjatlar?",
  "Dress-code?",
  "Depozit foizi?",
];

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000)    return "Hozirgina";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)} daq oldin`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} soat oldin`;
  return d.toLocaleDateString("uz-UZ", { month: "short", day: "numeric" });
}

function formatTime(d) {
  if (!d) return "";
  const t = typeof d === "string" ? new Date(d) : d;
  return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
}

export default function Chatbot() {
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [deletingId, setDeletingId]   = useState(null);

  const {
    sessions, currentSessionId,
    newSession, switchSession, getCurrentMessages, addMessage, deleteSession,
  } = useChatStore();

  const messages  = getCurrentMessages();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Har safar sahifaga kirganda yangi chat ochiladi
  useEffect(() => {
    newSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    addMessage({ role: "user", text: q, time: new Date().toISOString() });
    setInput("");
    setLoading(true);
    try {
      const res = await askChatbot(q);
      addMessage({ role: "bot", text: res.data.answer, time: new Date().toISOString() });
    } catch {
      addMessage({ role: "bot", text: "Xato yuz berdi. Qayta urining.", time: new Date().toISOString(), error: true });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setDeletingId(id);
    setTimeout(() => {
      deleteSession(id);
      setDeletingId(null);
    }, 250);
  };

  // Sessiyalar - faqat xabari borlar + joriy bo'sh
  const visibleSessions = sessions.filter(
    (s) => s.messages.length > 0 || s.id === currentSessionId
  );

  return (
    <>
      <div className="flex gap-3 h-[calc(100vh-82px)]">

        {/* ── Sidebar: chat tarixi ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-[220px] shrink-0 card flex flex-col overflow-hidden hidden md:flex"
        >
          {/* Yangi chat tugmasi */}
          <div className="p-3 border-b border-slate-100">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => newSession()}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700
                         text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus size={15} />
              Yangi chat
            </motion.button>
          </div>

          {/* Sessiyalar ro'yxati */}
          <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-0.5">
            {visibleSessions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 px-2">
                Hali chat tarixi yo'q
              </p>
            ) : (
              visibleSessions.map((s) => {
                const isActive = s.id === currentSessionId;
                return (
                  <motion.button
                    key={s.id}
                    animate={{ opacity: deletingId === s.id ? 0 : 1, x: deletingId === s.id ? -20 : 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => switchSession(s.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group relative ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-500/12 border border-blue-200 dark:border-blue-500/25"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <MessageSquare
                        size={13}
                        className={`shrink-0 mt-0.5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[12px] font-semibold truncate leading-tight ${
                          isActive ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"
                        }`}>
                          {s.title}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={9} className="text-slate-400 shrink-0" />
                          <span className="text-[10px] text-slate-400">{formatDate(s.createdAt)}</span>
                        </div>
                        {s.messages.length > 0 && (
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {s.messages.length} xabar
                          </p>
                        )}
                      </div>
                    </div>

                    {/* O'chirish tugmasi */}
                    {s.messages.length > 0 && (
                      <button
                        onClick={(e) => handleDelete(e, s.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg
                                   text-slate-300 hover:text-red-500 hover:bg-red-50
                                   opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 text-center">
              {visibleSessions.length} ta chat
            </p>
          </div>
        </motion.div>

        {/* ── Asosiy chat area ──────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card px-5 py-3.5 flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-800 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-800 text-sm">Zulfiya — AI Mentor</h2>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Onlayn
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Bank qoidalari bo'yicha yordam beradi</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => setShowVoiceModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-700 text-white text-xs font-semibold shadow-sm hover:bg-blue-800 transition-all"
              >
                <Mic size={13} />
                Ovozli
              </motion.button>

              {/* Mobile: new chat */}
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => newSession()}
                className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-all"
              >
                <Plus size={13} />
              </motion.button>
            </div>
          </motion.div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 px-1 pb-1">

            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-10"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-800 to-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-700 text-base mb-1">Zulfiya bilan gaplashing</h3>
                <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                  Bank qoidalari, ish tartibi, kredit va depozit bo'yicha savollar bering
                </p>

                <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-sm">
                  {QUICK_QUESTIONS.map((q) => (
                    <motion.button
                      key={q}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => sendMessage(q)}
                      className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-800/70 border border-gray-200 dark:border-slate-700/50 text-gray-600 dark:text-slate-300
                                 px-3 py-2 rounded-xl hover:border-blue-400 dark:hover:border-blue-500/50 hover:text-blue-700 dark:hover:text-blue-400 transition-all shadow-xs"
                    >
                      <ChevronRight size={11} className="text-gray-400" />
                      {q}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowVoiceModal(true)}
                  className="mt-4 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-100
                             px-4 py-2.5 rounded-xl hover:bg-blue-100 transition-all"
                >
                  <Mic size={13} />
                  Ovozli suhbat boshlang
                </motion.button>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-600 rounded-xl flex items-center justify-center shrink-0 mt-auto mb-5 shadow-sm">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div className="max-w-[78%] space-y-1">
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-700 text-white rounded-br-sm shadow-md"
                      : msg.error
                      ? "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-bl-sm"
                      : "bg-white dark:bg-slate-800/80 text-gray-800 dark:text-slate-200 shadow-xs border border-gray-100 dark:border-slate-700/50 rounded-bl-sm"
                  }`}>
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2.5 justify-start"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-800 to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 shadow-xs px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((j) => (
                      <motion.div
                        key={j}
                        className="w-2 h-2 bg-blue-300 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.75, delay: j * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Text input */}
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
      </div>

      {/* Voice Modal */}
      <AnimatePresence>
        {showVoiceModal && <VoiceModal onClose={() => setShowVoiceModal(false)} />}
      </AnimatePresence>
    </>
  );
}
