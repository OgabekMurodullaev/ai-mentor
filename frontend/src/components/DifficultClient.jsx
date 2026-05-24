import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Volume2, CheckCircle, XCircle, AlertCircle,
  Mic, MicOff, Loader2, Flag,
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
  // Chat log: [{type:'client'|'employee', text, audioUrl?}]
  const [chatLog, setChatLog] = useState(
    scenario.initial_message
      ? [{ type: "client", text: scenario.initial_message, audioUrl: scenario.audio_url || null }]
      : []
  );
  const [clientText, setClientText]       = useState(scenario.initial_message || "");
  const [employeeInput, setEmployeeInput] = useState("");
  const [history, setHistory]             = useState([]);
  const [step, setStep]                   = useState(0);
  const [stepScores, setStepScores]       = useState([]);
  const [loading, setLoading]             = useState(false);
  const [lastFeedback, setLastFeedback]   = useState(null);
  const [pendingFinish, setPendingFinish] = useState(false);
  const [startTime]                       = useState(Date.now());
  const [recStatus, setRecStatus]         = useState("idle");

  const inputRef         = useRef(null);
  const chatEndRef       = useRef(null);
  const clientAudioRef   = useRef(null);
  const currentAudioUrl  = useRef(scenario.audio_url || null);
  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);

  const totalScore  = stepScores.reduce((a, b) => a + b, 0);
  const currentStep = scenario.steps?.[step];
  const pct         = scenario.steps?.length ? (step / scenario.steps.length) * 100 : 0;

  // Auto-scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, loading]);

  // ── Audio helpers ────────────────────────────────────────
  const stopAudio = () => {
    if (clientAudioRef.current) {
      clientAudioRef.current.onended = null;
      clientAudioRef.current.pause();
      clientAudioRef.current = null;
    }
  };

  const playClientAudio = (url) => {
    if (!url) return;
    stopAudio();
    currentAudioUrl.current = url;
    setTimeout(() => {
      const audio = new Audio(url);
      audio.play().catch(() => {});
      clientAudioRef.current = audio;
    }, 80);
  };

  // ── Auto-play initial audio; chain steps[0] after it ends ─
  useEffect(() => {
    const s0 = scenario.steps?.[0];
    if (scenario.audio_url) {
      const audio = new Audio(scenario.audio_url);
      clientAudioRef.current = audio;
      audio.onended = () => {
        if (s0?.client_message) {
          setClientText(s0.client_message);
          currentAudioUrl.current = s0.audio_url || null;
          setChatLog((prev) => [
            ...prev,
            { type: "client", text: s0.client_message, audioUrl: s0.audio_url || null },
          ]);
          if (s0.audio_url) {
            setTimeout(() => {
              if (!clientAudioRef.current || clientAudioRef.current === audio) {
                const next = new Audio(s0.audio_url);
                next.play().catch(() => {});
                clientAudioRef.current = next;
              }
            }, 150);
          }
        }
      };
      audio.play().catch(() => {});
    }
    return () => stopAudio();
  }, []); // eslint-disable-line

  // ── Evaluate employee answer ──────────────────────────────
  const evaluate = (answer) => {
    if (!currentStep) return;
    const keywords  = currentStep.correct_keywords || [];
    const matched   = keywords.filter((kw) => answer.toLowerCase().includes(kw.toLowerCase()));
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

    // Add employee bubble to chat
    setChatLog((prev) => [...prev, { type: "employee", text: answer }]);

    const newHistory = [...history, { employee: answer, client: clientText }];
    setHistory(newHistory);
    return { newHistory, nextStep: step + 1 };
  };

  // ── Advance to next step ──────────────────────────────────
  const advanceStep = async (newHistory, nextStep) => {
    if (nextStep >= scenario.steps.length) {
      // All steps done — show Yakunlash button instead of auto-finishing
      setPendingFinish(true);
      setLoading(false);
      setTimeout(() => setLastFeedback(null), 2500);
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
        const res = await getDifficultClientResponse({
          scenario_id:      scenario.scenario_id || scenario.id,
          employee_message: newHistory[newHistory.length - 1]?.employee || "",
          history:          newHistory,
        });
        newClientText = res.data.client_text;
        newAudioUrl   = res.data.audio_url || null;
      }

      setClientText(newClientText);
      setStep(nextStep);
      setEmployeeInput("");
      currentAudioUrl.current = newAudioUrl;

      // Add client bubble to chat
      setChatLog((prev) => [
        ...prev,
        { type: "client", text: newClientText, audioUrl: newAudioUrl },
      ]);

      if (newAudioUrl) playClientAudio(newAudioUrl);
    } catch {
      const fallback = scenario.steps[nextStep]?.client_message || "Davom eting.";
      setClientText(fallback);
      setStep(nextStep);
      setChatLog((prev) => [...prev, { type: "client", text: fallback, audioUrl: null }]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLastFeedback(null);
        inputRef.current?.focus();
      }, 2500);
    }
  };

  // ── TEXT send ─────────────────────────────────────────────
  const handleTextSend = async () => {
    if (!employeeInput.trim() || loading || !currentStep || pendingFinish) return;
    stopAudio();
    setLoading(true);
    const { newHistory, nextStep } = evaluate(employeeInput);
    await advanceStep(newHistory, nextStep);
  };

  // ── VOICE ─────────────────────────────────────────────────
  const startVoiceRecording = async () => {
    if (recStatus !== "idle" || loading || pendingFinish) return;
    stopAudio();
    if (isDemoMode()) { setRecStatus("recording"); return; }
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
    } catch { setRecStatus("idle"); }
  };

  const stopVoiceRecording = () => {
    if (isDemoMode()) { processVoiceDemoAnswer(); return; }
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    setRecStatus("processing");
  };

  const processVoiceDemoAnswer = async () => {
    setRecStatus("processing");
    setLoading(true);
    await sleep(1100);
    const demoAnswer = currentStep?.demo_voice_answer || currentStep?.correct_keywords?.join(", ") || "Tushundim";
    const { newHistory, nextStep } = evaluate(demoAnswer);
    setRecStatus("idle");
    await advanceStep(newHistory, nextStep);
  };

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
      } else { setLoading(false); }
    } catch { setLoading(false); }
    finally { setRecStatus("idle"); }
  };

  const handleFinish = () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    onComplete(totalScore, elapsed);
  };

  const isBusy = loading || recStatus !== "idle";

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <ProgressBar value={pct} height="h-2" color="from-amber-500 to-orange-400" />
        <span className="text-xs text-gray-400 shrink-0 font-semibold">
          {Math.min(step + 1, scenario.steps?.length)} / {scenario.steps?.length}
        </span>
      </div>

      {/* ── Chat log ─────────────────────────────────────── */}
      <div className="space-y-2.5 max-h-[380px] min-h-[180px] overflow-y-auto scrollbar-hide px-0.5 pb-1">
        <AnimatePresence initial={false}>
          {chatLog.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22 }}
              className={`flex gap-2.5 ${msg.type === "employee" ? "justify-end" : "justify-start"}`}
            >
              {msg.type === "client" ? (
                /* ── Client bubble (left) ── */
                <div className="flex items-start gap-2.5 max-w-[78%]">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-base shrink-0 mt-0.5 shadow-sm">
                    😤
                  </div>
                  <div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-xs">
                      <p className="text-[10px] font-bold text-orange-500 mb-1 uppercase tracking-wider">Mijoz</p>
                      <p className="text-gray-800 text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    {msg.audioUrl && (
                      <button
                        onClick={() => playClientAudio(msg.audioUrl)}
                        className="mt-1 ml-1 flex items-center gap-1 text-[10px] text-orange-400 hover:text-orange-600 transition-colors font-medium"
                      >
                        <Volume2 size={10} /> Eshitish
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* ── Employee bubble (right) ── */
                <div className="flex items-start gap-2.5 max-w-[78%]">
                  <div>
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-xs">
                      <p className="text-[10px] font-bold text-blue-200 mb-1 uppercase tracking-wider">Siz</p>
                      <p className="text-white text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 text-xl shadow-sm">
                    👤
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-base shrink-0">😤</div>
            <div className="bg-orange-50 border border-orange-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-1.5 h-1.5 bg-orange-400 rounded-full"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Hint ─────────────────────────────────────────── */}
      {currentStep?.hint && !pendingFinish && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5"
        >
          <AlertCircle size={13} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <span className="font-bold">Maslahat: </span>{currentStep.hint}
          </p>
        </motion.div>
      )}

      {/* ── Feedback ─────────────────────────────────────── */}
      <AnimatePresence>
        {lastFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className={`flex items-start gap-2.5 p-3 rounded-xl border ${
              lastFeedback.isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
            }`}
          >
            {lastFeedback.isCorrect
              ? <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              : <XCircle    size={15} className="text-amber-500  shrink-0 mt-0.5" />
            }
            <p className={`text-xs font-semibold flex-1 ${lastFeedback.isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
              {lastFeedback.feedback}
            </p>
            <span className={`text-xs font-bold shrink-0 ${lastFeedback.isCorrect ? "text-emerald-600" : "text-amber-600"}`}>
              +{lastFeedback.score}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Yakunlash / Input area ───────────────────────── */}
      {pendingFinish ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-4 py-4 text-center">
            <p className="text-base font-bold text-emerald-700">🎉 Barcha savollarga javob berdingiz!</p>
            <p className="text-sm text-emerald-600 mt-1">
              Jami ball:&nbsp;
              <span className="font-black text-xl text-emerald-700">{totalScore}</span>
              <span className="text-emerald-300 mx-1">/</span>
              <span className="font-semibold">{scenario.max_score}</span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFinish}
            className="w-full btn-primary py-3 text-[15px] font-bold gap-2 justify-center"
          >
            <Flag size={17} />
            Yakunlash va natijani ko'rish
          </motion.button>
        </motion.div>

      ) : mode === "voice" ? (
        /* ── Voice input ── */
        <div className="flex flex-col items-center gap-3 py-2">
          <p className={`text-xs font-semibold ${
            recStatus === "recording"  ? "text-red-500" :
            recStatus === "processing" ? "text-amber-500" :
            loading                    ? "text-amber-500" : "text-gray-400"
          }`}>
            {recStatus === "recording"  ? "🔴 Eshitilmoqda — qo'yib yuboring" :
             recStatus === "processing" ? "⏳ Tahlil qilinmoqda..." :
             loading                    ? "⏳ Javob yuklanmoqda..." :
                                          "Bosib turing va javob bering"}
          </p>

          <AnimatePresence>
            {recStatus === "recording" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1 h-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-1.5 bg-red-400 rounded-full wave-bar"
                    style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            {recStatus === "recording" && (
              <>
                <motion.div className="absolute inset-0 rounded-full bg-red-400"
                  animate={{ scale:[1,1.5,1], opacity:[0.4,0,0.4] }}
                  transition={{ duration:1.5, repeat:Infinity }} />
                <motion.div className="absolute inset-0 rounded-full bg-red-300"
                  animate={{ scale:[1,1.8,1], opacity:[0.2,0,0.2] }}
                  transition={{ duration:1.5, repeat:Infinity, delay:0.3 }} />
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
                ${recStatus === "recording" ? "bg-red-500 scale-110" :
                  isBusy ? "bg-gray-300 cursor-not-allowed" :
                  "bg-primary-700 hover:bg-primary-800 cursor-pointer"}`}
            >
              <AnimatePresence mode="wait">
                {(recStatus === "processing" || loading) ? (
                  <motion.div key="s" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                    <Loader2 size={22} className="animate-spin" />
                  </motion.div>
                ) : recStatus === "recording" ? (
                  <motion.div key="r" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                    <MicOff size={22} />
                  </motion.div>
                ) : (
                  <motion.div key="i" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}>
                    <Mic size={22} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

      ) : (
        /* ── Text input ── */
        <>
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

          <div className="flex justify-between text-xs text-gray-400">
            <span>Jami ball: <span className="font-bold text-primary-700">{totalScore}</span></span>
            <span>Max: <span className="font-semibold">{scenario.max_score}</span></span>
          </div>
        </>
      )}
    </div>
  );
}
