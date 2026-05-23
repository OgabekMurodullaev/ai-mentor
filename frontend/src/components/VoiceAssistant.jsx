import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { sendVoiceChat } from "../api/voice";

// Brauzer qo'llab-quvvatlaydigan MIME turini aniqlash
function getSupportedMimeType() {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
    "audio/mp4",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export default function VoiceAssistant({ onTranscript, onResponse, voiceType = "mentor" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const mimeTypeRef = useRef("");
  const audioRef = useRef(null);

  const startRecording = async () => {
    setError("");
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
        const actualMime = mimeTypeRef.current || "audio/webm";
        const ext = actualMime.includes("ogg") ? "ogg"
                  : actualMime.includes("mp4") ? "mp4"
                  : "webm";
        const blob = new Blob(chunksRef.current, { type: actualMime });
        stream.getTracks().forEach((t) => t.stop());
        await handleSend(blob, ext);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      setError("Mikrofonga ruxsat bering");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSend = async (blob, ext = "webm") => {
    setIsLoading(true);
    try {
      const res = await sendVoiceChat(blob, voiceType, ext);
      const { user_text, bot_response, audio_url } = res.data;

      onTranscript?.(user_text);
      onResponse?.(bot_response);

      if (audio_url) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(audio_url);
        setIsPlaying(true);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => setIsPlaying(false);
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    } catch (err) {
      const msg = err?.response?.data?.error || "Ovoz xizmati ishlamayapti. Matn orqali yozing.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const status = isRecording ? "recording"
    : isLoading ? "loading"
    : isPlaying ? "playing"
    : "idle";

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      {/* Mic button */}
      <div className="relative">
        {isRecording && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-red-400"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-red-300"
              animate={{ scale: [1, 1.7, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
          </>
        )}
        <motion.button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
          onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
          disabled={isLoading || isPlaying}
          whileTap={{ scale: 0.92 }}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg
            transition-all duration-200 select-none
            ${isRecording
              ? "bg-red-500 scale-110"
              : isLoading || isPlaying
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary-700 hover:bg-primary-800 cursor-pointer"
            }`}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Loader2 size={22} className="animate-spin" />
              </motion.div>
            ) : isPlaying ? (
              <motion.div key="playing" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Volume2 size={22} />
              </motion.div>
            ) : isRecording ? (
              <motion.div key="recording" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <MicOff size={22} />
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Mic size={22} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Waveform */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="flex items-center gap-1 h-7"
          >
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-red-400 rounded-full wave-bar"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status text */}
      <p className={`text-xs font-medium transition-colors ${
        isRecording ? "text-red-500"
        : isLoading ? "text-amber-500"
        : isPlaying ? "text-blue-600"
        : "text-gray-400"
      }`}>
        {isRecording ? "🔴 Gapiryapsiz — qo'yib yuboring"
          : isLoading ? "⏳ Javob tayyorlanmoqda..."
          : isPlaying ? "🔊 Ovoz ijro etilmoqda..."
          : "Bosib turing va gapiring"}
      </p>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>
      )}
    </div>
  );
}

