import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Volume2, CheckCircle, XCircle, AlertCircle,
  Mic, MicOff, Loader2,
} from "lucide-react";
import { getDifficultClientResponse } from "../api/simulator";
import { sendVoiceChat } from "../api/voice";
import { convertToWav } from "../utils/audioUtils";
import { isDemoMode } from "../store/demoStore";
import ProgressBar from "./ProgressBar";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getSupportedMimeType() {
  const types = ["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/ogg","audio/mp4"];
  for (const t of types) { if (MediaRecorder.isTypeSupported(t)) return t; }
  return "";
}

export default function DifficultClient({ scenario, mode = "text", onComplete }) {
  const [clientText, setClientText]       = useState(scenario.initial_message || "");
  const [employeeInput, setEmployeeInput] = useState("");
  const [history, setHistory]             = useState([]);
  const [step, setStep]                   = useState(0);
  const [stepScores, setStepScores]       = useState([]);
  const [loading, setLoading]             = useState(false);
  const [lastFeedback, setLastFeedback]   = useState(null);
  const [finished, setFinished]           = useState(false);
  const [startTime]                       = useState(Date.now());

  // Voice recording state
  const [recStatus, setRecStatus] = useState("idle"); // idle|recording|processing

  const inputRef         = useRef(null);
  const clientAudioRef   = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);

  const totalScore  = stepScores.reduce((a, b) => a + b, 0);
  const currentStep = scenario.steps?.[step];
  const pct         = scenario.steps?.length ? (step / scenario.steps.length) * 100 : 0;

  // ── Auto-play initial client audio (only if URL provided) ──────────────────
  useEffect(() => {
    if (scenario.audio_url) {
      const audio = new Audio(scenario.audio_url);
      audio.play().catch(() => {});
      clientAudioRef.current = audio;
    }
    // NOTE: NO automatic TTS call — user can click Volume2 button manually
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Play client audio manually ─────────────────────────────────────────────
  const playClientAudio = (url) => {
    if (!url) return;
    if (clientAudioRef.current) clientAudioRef.current.pause();
    clientAudioRef.current = new Audio(url);
    clientAudioRef.current.play().catch(() => {});
  };

  // ── Evaluate employee answer ───────────────────────────────────────────────
  const evaluate = (answer) => {
    if (!currentStep) return;
    const keywords = currentStep.correct_keywords || [];
    const matched  = keywords.filter((kw) => answer.toLowerCase().includes(kw.toLowerCase()));
    const isCorrect = matched.length > 0;
    const earned    = isCorrect ? currentStep.score : Math.floor(currentStep.score * 0.3);

    setStepScores((prev) => [...prev, earned]);
    setLastFeedback({
      isCorrect,
      score: earned,
      feedback: isCorrect
        ? `To'g'ri! Kalit so'zlar: ${matched.join(", ")}`
        : `Maslahat: ${keywords.slice(0, 3).join(", ")} kabi so'zlardan foydalaning`,
    });

    const newHistory = [...history, { employee: answer, client: clientText }];
    setHistory(newHistory);
    return { newHistory, nextStep: step + 1 };
  };

  // ── Advance to next step ───────────────────────────────────────────────────
  const advanceStep = async (newHistory, nextStep) => {
    if (nextStep >= scenario.steps.length) {
      setFinished(true);
      setLoading(false);
      return;
    }

    try {
      let newClientText;
      let newAudioUrl = null;

      if (isDemoMode()) {
        await sleep(700);
        newClientText = scenario.steps[nextStep].client_message;
        newAudioUrl   = scenario.steps[nextStep].audio_url || null;
      } else {
        const res     = await getDifficultClientResponse({
          scenario_id:      scenario.scenario_id || scenario.id,
          employee_message: newHistory[newHistory.length - 1]?.employee || "",
          history:          newHistory,
        });
        newClientText = res.data.client_text;
        newAudioUrl   = res.data.audio_url || null;
      }

      setClientText(newClientText);
      if (newAudioUrl) playClientAudio(newAudioUrl);
      setStep(nextStep);
      setEmployeeInput("");
    } catch {
      setClientText(scenario.steps[nextStep]?.client_message || "Davom eting.");
      setStep(nextStep);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLastFeedback(null);
        inputRef.current?.focus();
      }, 2500);
    }
  };

  // ── TEXT mode: send ────────────────────────────────────────────────────────
  const handleTextSend = async () => {
    if (!employeeInput.trim() || loading || !currentStep) return;
    setLoading(true);
    const { newHistory, nextStep } = evaluate(employeeInput);
    await advanceStep(newHistory, nextStep);
  };

  // ── VOICE mode: recording ──────────────────────────────────────────────────
  const startVoiceRecording = async () => {
    if (recStatus !== "idle" || loading) return;

    if (isDemoMode()) {
      setRecStatus("recording");
      return;
    }

    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const options  = mimeType ? { mimeType } : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = async () => {
        const mime    = mimeType || "audio/webm";
        const rawBlob = new Blob(chunksRef.current, { type: mime });
        stream.getTracks().forEach((t) => t.stop());
        await processVoiceAnswer(rawBlob);
      };
      mediaRecorderRef.current.start();
      setRecStatus("recording");
    } catch {
      setRecStatus("idle");
    }
  };

  const stopVoiceRecording = () => {
    if (isDemoMode()) {
      processVoiceDemoAnswer();
      return;
    }
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecStatus("processing");
  };

  // Demo: pre-defined correct answer
  const processVoiceDemoAnswer = async () => {
    setRecStatus("processing");
    setLoading(true);
    await sleep(1100);

    const demoAnswer = currentStep?.demo_voice_answer || currentStep?.correct_keywords?.join(", ") || "Tushundim";
    const { newHistory, nextStep } = evaluate(demoAnswer);
    setRecStatus("idle");
    await advanceStep(newHistory, nextStep);
  };

  // Real: STT → evaluate
  const processVoiceAnswer = async (rawBlob) => {
    setRecStatus("processing");
    setLoading(true);
    try {
      const { blob, ext } = await convertToWav(rawBlob);
      const res           = await sendVoiceChat(blob, "client", ext);
      const transcript    = res.data.user_text || "";
      if (transcript) {
        const { newHistory, nextStep } = evaluate(transcript);
        await advanceStep(newHistory, nextStep);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    } finally {
      setRecStatus("idle");
    }
  };

  const isBusy = loading || recStatus !== "idle";

  // ── FINISHED screen ────────────────────────────────────────────────────────
  if (finished) {
    const elapsed  = Math.floor((Date.now() - startTime) / 1000);
    const pctScore = Math.round((totalScore / scenario.max_score) * 100);
    const grade    =
      pctScore >= 90 ? { label: "A'lo",      color: "text-emerald-600", bg: "bg-emerald-50", icon: "🏆" } :
      pctScore >= 70 ? { label: "Yaxshi",    color: "text-blue-600",    bg: "bg-blue-50",    icon: "🎯" } :
                       { label: "Qoniqarli", color: "text-amber-600",   bg: "bg-amber-50",   icon: "📈" };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 space-y-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="text-7xl"
        >
          {grade.icon}
        </motion.div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Stsenariy yakunlandi!</h3>
          <p className="text-gray-500 mt-1">Siz muvaffaqiyatli o'tdingiz</p>
        </div>
        <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl ${grade.bg}`}>
          <span className={`text-3xl font-bold ${grade.color}`}>{totalScore}</span>
          <span className="text-gray-400 text-lg font-light">/</span>
          <span className="text-gray-500 font-medium">{scenario.max_score}</span>
          <span className={`ml-2 font-bold ${grade.color}`}>{grade.label}</span>
        </div>
        <div className="max-w-xs mx-auto">
          <ProgressBar value={pctScore} height="h-3" showLabel />
        </div>
        <p className="text-sm text-gray-400">
          ⏱ Vaqt: {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onComplete(totalScore, elapsed)}
          className="btn-primary px-8 py-3 text-base"
        >
          Natijani saqlash
        </motion.button>
      </motion.div>
    );
  }

  // ── MAIN render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <ProgressBar value={pct} height="h-2" color="from-amber-500 to-orange-400" />
        <span className="text-xs text-gray-400 shrink-0 font-medium">
          {step + 1} / {scenario.steps?.length}
        </span>
      </div>

      {/* Client message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x:   0, opacity: 1 }}
          exit={{   x:  20, opacity: 0 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl shrink-0">
              😤
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-orange-700">Mijoz</span>
                {/* Manual audio replay — no auto-TTS */}
                {scenario.steps?.[step]?.audio_url && (
                  <button
                    onClick={() => playClientAudio(scenario.steps[step].audio_url)}
                    className="text-orange-400 hover:text-orange-600 transition-colors"
                    title="Ovozni eshiting"
                  >
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-gray-800 text-sm leading-relaxed">{clientText}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Hint */}
      {currentStep?.hint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5"
        >
          <AlertCircle size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Maslahat: </span>{currentStep.hint}
          </p>
        </motion.div>
      )}

      {/* Conversation history */}
      {history.length > 0 && (
        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
          {history.map((h, i) => (
            <div key={i} className="flex justify-end">
              <div className="bg-primary-700 text-white px-3 py-2 rounded-2xl rounded-br-sm text-xs max-w-[75%]">
                {h.employee}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {lastFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y:   0, scale: 1    }}
            exit={{   opacity: 0,           scale: 0.95 }}
            className={`flex items-start gap-2.5 p-3 rounded-xl border ${
              lastFeedback.isCorrect
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            {lastFeedback.isCorrect
              ? <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              : <XCircle    size={15} className="text-amber-500  shrink-0 mt-0.5" />
            }
            <p className={`text-xs font-semibold flex-1 ${
              lastFeedback.isCorrect ? "text-emerald-700" : "text-amber-700"
            }`}>
              {lastFeedback.feedback}
            </p>
            <span className={`text-xs font-bold shrink-0 ${
              lastFeedback.isCorrect ? "text-emerald-600" : "text-amber-600"
            }`}>
              +{lastFeedback.score}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input area: TEXT or VOICE ── */}
      {mode === "voice" ? (
        <div className="flex flex-col items-center gap-3 py-2">
          <p className={`text-xs font-medium ${
            recStatus === "recording"  ? "text-red-500"    :
            recStatus === "processing" ? "text-amber-500"  :
            loading                    ? "text-amber-500"  :
                                         "text-gray-400"
          }`}>
            {recStatus === "recording"  ? "🔴 Eshitilmoqda — qo'yib yuboring" :
             recStatus === "processing" ? "⏳ Tahlil qilinmoqda..."           :
             loading                    ? "⏳ Javob yuklanmoqda..."            :
                                          "Bosib turing va javob bering"}
          </p>

          {/* Waveform */}
          <AnimatePresence>
            {recStatus === "recording" && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1 h-5"
              >
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-red-400 rounded-full wave-bar"
                    style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mic button */}
          <div className="relative">
            {recStatus === "recording" && (
              <>
                <motion.div className="absolute inset-0 rounded-full bg-red-400"
                  animate={{ scale: [1,1.5,1], opacity: [0.4,0,0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }} />
                <motion.div className="absolute inset-0 rounded-full bg-red-300"
                  animate={{ scale: [1,1.8,1], opacity: [0.2,0,0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
              </>
            )}
            <motion.button
              onMouseDown={startVoiceRecording}
              onMouseUp={stopVoiceRecording}
              onTouchStart={(e) => { e.preventDefault(); startVoiceRecording(); }}
              onTouchEnd={(e)   => { e.preventDefault(); stopVoiceRecording();  }}
              disabled={isBusy && recStatus !== "recording"}
              whileTap={{ scale: 0.9 }}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white
                shadow-lg select-none transition-all duration-200
                ${recStatus === "recording"
                  ? "bg-red-500 scale-110"
                  : isBusy
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary-700 hover:bg-primary-800 cursor-pointer"
                }`}
            >
              <AnimatePresence mode="wait">
                {(recStatus === "processing" || loading) ? (
                  <motion.div key="s" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Loader2 size={22} className="animate-spin" />
                  </motion.div>
                ) : recStatus === "recording" ? (
                  <motion.div key="r" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <MicOff size={22} />
                  </motion.div>
                ) : (
                  <motion.div key="i" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Mic size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={employeeInput}
            onChange={(e) => setEmployeeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
            placeholder="Mijozga javob bering..."
            disabled={isBusy}
            className="input-field flex-1"
            autoFocus
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleTextSend}
            disabled={isBusy || !employeeInput.trim()}
            className="btn-primary px-4 shrink-0"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={16} />
            }
          </motion.button>
        </div>
      )}

      <div className="flex justify-between text-xs text-gray-400">
        <span>Jami ball: <span className="font-semibold text-primary-700">{totalScore}</span></span>
        <span>Max: {scenario.max_score}</span>
      </div>
    </div>
  );
}
