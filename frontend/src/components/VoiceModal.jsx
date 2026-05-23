import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Volume2, Loader2, Bot, Sparkles } from "lucide-react";
import { sendVoiceChat } from "../api/voice";
import { convertToWav } from "../utils/audioUtils";
import { DEMO_MODE, DEMO_DELAY_MS } from "../config/demoMode";
import { getNextVoiceMock, resetVoiceIndex } from "../api/mockData";

// ── Yordamchi funksiyalar ─────────────────────────────────────────────────────

function getSupportedMimeType() {
  const types = [
    "audio/webm;codecs=opus", "audio/webm",
    "audio/ogg;codecs=opus",  "audio/ogg",
    "audio/mp4",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Browser SpeechSynthesis orqali matnni ovozga o'qiydi.
 * Demo rejimda AISHA TTS o'rniga ishlatiladi.
 * uz-UZ → ru-RU → en-US ketma-ketlikda urinadi.
 */
function speakWithBrowser(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }

    window.speechSynthesis.cancel();

    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find((v) => v.lang.startsWith("uz")) ||
        voices.find((v) => v.lang.startsWith("ru")) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        null;

      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      utterance.lang  = voice?.lang || "uz-UZ";
      utterance.rate  = 0.88;
      utterance.pitch = 1.0;
      utterance.onend   = resolve;
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    };

    // Voices ro'yxati async yuklanadi — tayyor bo'lishini kutamiz
    if (window.speechSynthesis.getVoices().length > 0) {
      trySpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        trySpeak();
      };
      // 300ms ichida yuklansa ham boshlaydi
      setTimeout(trySpeak, 300);
    }
  });
}

// ── Asosiy komponent ─────────────────────────────────────────────────────────

export default function VoiceModal({ onClose }) {
  const [messages, setMessages] = useState([]);
  // idle | recording | converting | loading | playing
  const [status, setStatus] = useState("idle");
  const [error,  setError]  = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const mimeTypeRef      = useRef("");
  const audioRef         = useRef(null);
  const scrollRef        = useRef(null);

  // Modal ochilganda demo index'ini qayta hisoblaydi
  useEffect(() => {
    if (DEMO_MODE) resetVoiceIndex();
  }, []);

  // Yangi xabar kelganda pastga scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  // Modal ochiq bo'lganda body scroll'ni bloklaydi
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ── Recording ──────────────────────────────────────────────────────────────

  const startRecording = async () => {
    if (status !== "idle") return;
    setError("");

    if (DEMO_MODE) {
      // Demo: haqiqiy mikrofon ishlatilmaydi, faqat "recording" effekti ko'rsatiladi
      setStatus("recording");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const options = mimeType ? { mimeType } : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const mime    = mimeTypeRef.current || "audio/webm";
        const rawBlob = new Blob(chunksRef.current, { type: mime });
        stream.getTracks().forEach((t) => t.stop());
        await processRealAudio(rawBlob);
      };

      mediaRecorderRef.current.start();
      setStatus("recording");
    } catch {
      setError("Mikrofonga ruxsat bering");
    }
  };

  const stopRecording = () => {
    if (DEMO_MODE) {
      processDemoAudio();
      return;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setStatus("converting");
  };

  // ── Demo pipeline ──────────────────────────────────────────────────────────

  const processDemoAudio = async () => {
    setStatus("loading");
    await sleep(DEMO_DELAY_MS);

    const mock = getNextVoiceMock();

    setMessages((prev) => [
      ...prev,
      { role: "user", text: mock.user_text },
    ]);

    // Biroz kutib bot javobini ko'rsatamiz (tabiiy ko'rinish)
    await sleep(300);
    setMessages((prev) => [...prev, { role: "bot", text: mock.bot_response }]);

    // Browser SpeechSynthesis bilan o'qiydi
    setStatus("playing");
    await speakWithBrowser(mock.bot_response);
    setStatus("idle");
  };

  // ── Haqiqiy pipeline ───────────────────────────────────────────────────────

  const processRealAudio = async (rawBlob) => {
    try {
      // 1. WebM → WAV (AISHA STT WAV talab qiladi)
      setStatus("converting");
      const { blob: wavBlob, ext } = await convertToWav(rawBlob);

      // 2. STT → RAG → TTS
      setStatus("loading");
      const res = await sendVoiceChat(wavBlob, "mentor", ext);
      const { user_text, bot_response, audio_url } = res.data;

      setMessages((prev) => [
        ...prev,
        { role: "user", text: user_text },
        { role: "bot",  text: bot_response },
      ]);

      // 3. Audio ijro
      if (audio_url) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(audio_url);
        setStatus("playing");
        audioRef.current.onended  = () => setStatus("idle");
        audioRef.current.onerror  = () => setStatus("idle");
        audioRef.current.play().catch(() => setStatus("idle"));
      } else {
        setStatus("idle");
      }
    } catch (err) {
      const msg = err?.response?.data?.error || "Xato yuz berdi. Qayta urining.";
      setError(msg);
      setStatus("idle");
    }
  };

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleMicDown = () => { if (status === "idle") startRecording(); };
  const handleMicUp   = () => { if (status === "recording") stopRecording(); };

  // ── UI helpers ─────────────────────────────────────────────────────────────

  const STATUS_TEXT = {
    idle:       "Bosib turing va gapiring",
    recording:  "🔴 Eshitilmoqda — qo'yib yuboring",
    converting: "🔄 Audio tayyorlanmoqda...",
    loading:    "⏳ Javob tayyorlanmoqda...",
    playing:    "🔊 Javob o'qilmoqda...",
  };
  const STATUS_COLOR = {
    idle:       "text-gray-400",
    recording:  "text-red-500",
    converting: "text-violet-500",
    loading:    "text-amber-500",
    playing:    "text-blue-600",
  };

  const isBusy = status === "loading" || status === "playing" || status === "converting";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(15,23,42,0.82)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="px-5 py-4 shrink-0 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #172554 0%, #1e3a8a 60%, #1d4ed8 100%)" }}
        >
          <div className="absolute inset-0 bg-dots opacity-20 pointer-events-none" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
                <Sparkles size={17} className="text-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-white text-sm leading-tight">Zulfiya — Ovozli Suhbat</p>
                  {DEMO_MODE && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gold/20 text-gold border border-gold/30">
                      DEMO
                    </span>
                  )}
                </div>
                <p className="text-blue-300/80 text-[11px] mt-0.5">
                  {DEMO_MODE ? "Demo rejim — oldindan tayyorlangan javoblar" : "1:1 ovozli mentor suhbati"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Conversation ── */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-3">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full py-10 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary-50 border-2 border-primary-100 flex items-center justify-center mb-4">
                <Mic size={26} className="text-primary-400" />
              </div>
              <p className="text-gray-600 text-sm font-medium">Ovozli suhbatni boshlang</p>
              <p className="text-gray-400 text-xs mt-1 max-w-[220px]">
                Pastdagi tugmani bosib turing va savolingizni ayting
              </p>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-800 to-blue-600 flex items-center justify-center shrink-0 mt-auto mb-5">
                  <Bot size={12} className="text-white" />
                </div>
              )}
              <div className="max-w-[82%] space-y-1">
                <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary-700 text-white rounded-br-sm shadow-sm"
                    : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}>
                  {msg.text}
                </div>
                <p className={`text-[10px] text-gray-400 ${msg.role === "user" ? "text-right" : "pl-1"}`}>
                  {msg.role === "user" ? "🎤 Ovozingiz" : "🤖 Zulfiya"}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 justify-start items-end"
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-800 to-blue-600 flex items-center justify-center shrink-0">
                <Bot size={12} className="text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((j) => (
                    <motion.div key={j} className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.7, delay: j * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* ── Controls ── */}
        <div className="px-6 pb-8 pt-4 flex flex-col items-center gap-3 shrink-0 border-t border-gray-100 bg-gray-50/50">

          <p className={`text-xs font-medium transition-colors ${STATUS_COLOR[status]}`}>
            {STATUS_TEXT[status]}
          </p>

          {/* Waveform */}
          <AnimatePresence>
            {status === "recording" && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                className="flex items-center gap-1 h-6"
              >
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-red-400 rounded-full wave-bar"
                    style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mic button */}
          <div className="relative">
            {status === "recording" && (
              <>
                <motion.div className="absolute inset-0 rounded-full bg-red-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div className="absolute inset-0 rounded-full bg-red-300"
                  animate={{ scale: [1, 1.85, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
              </>
            )}
            <motion.button
              onMouseDown={handleMicDown}
              onMouseUp={handleMicUp}
              onTouchStart={(e) => { e.preventDefault(); handleMicDown(); }}
              onTouchEnd={(e) => { e.preventDefault(); handleMicUp(); }}
              disabled={isBusy}
              whileTap={{ scale: 0.9 }}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white
                shadow-xl select-none transition-all duration-200
                ${status === "recording"
                  ? "bg-red-500 scale-110"
                  : isBusy
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary-700 hover:bg-primary-800 active:scale-95 cursor-pointer"
                }`}
            >
              <AnimatePresence mode="wait">
                {(status === "loading" || status === "converting") ? (
                  <motion.div key="spin" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Loader2 size={28} className="animate-spin" />
                  </motion.div>
                ) : status === "playing" ? (
                  <motion.div key="vol" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Volume2 size={28} />
                  </motion.div>
                ) : status === "recording" ? (
                  <motion.div key="moff" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <MicOff size={28} />
                  </motion.div>
                ) : (
                  <motion.div key="mic" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Mic size={28} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl text-center max-w-xs"
            >
              {error}
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
