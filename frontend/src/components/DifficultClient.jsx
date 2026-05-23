import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Volume2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { getDifficultClientResponse } from "../api/simulator";
import { sendTTS } from "../api/voice";
import ProgressBar from "./ProgressBar";

export default function DifficultClient({ scenario, onComplete }) {
  const [history, setHistory] = useState([]);
  const [clientText, setClientText] = useState(scenario.initial_message || "");
  const [employeeInput, setEmployeeInput] = useState("");
  const [step, setStep] = useState(0);
  const [stepScores, setStepScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const inputRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (scenario.audio_url) {
      const audio = new Audio(scenario.audio_url);
      audio.play().catch(() => {});
    } else if (clientText) {
      sendTTS(clientText, "difficult_client")
        .then((r) => {
          if (r.data.audio_url) {
            new Audio(r.data.audio_url).play().catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, []);

  const totalScore = stepScores.reduce((a, b) => a + b, 0);
  const currentStep = scenario.steps?.[step];
  const pct = scenario.steps?.length ? (step / scenario.steps.length) * 100 : 0;

  const playAudio = (url) => {
    if (!url) return;
    if (audioRef.current) audioRef.current.pause();
    audioRef.current = new Audio(url);
    audioRef.current.play().catch(() => {});
  };

  const handleSend = async () => {
    if (!employeeInput.trim() || loading || !currentStep) return;
    setLoading(true);

    const keywords = currentStep.correct_keywords || currentStep.correct_answer_keywords || [];
    const matched = keywords.filter((kw) =>
      employeeInput.toLowerCase().includes(kw.toLowerCase())
    );
    const isCorrect = matched.length > 0;
    const earned = isCorrect ? currentStep.score : Math.floor(currentStep.score * 0.3);

    setStepScores((prev) => [...prev, earned]);
    setLastFeedback({
      isCorrect,
      matched,
      feedback: isCorrect
        ? `To'g'ri! Kalit so'zlar: ${matched.join(", ")}`
        : `Maslahat: ${keywords.slice(0, 3).join(", ")} kabi so'zlardan foydalaning`,
      score: earned,
    });

    const newHistory = [...history, { employee: employeeInput, client: clientText }];
    setHistory(newHistory);
    const nextStep = step + 1;

    if (nextStep >= scenario.steps.length) {
      setFinished(true);
      setLoading(false);
      return;
    }

    try {
      const res = await getDifficultClientResponse({
        scenario_id: scenario.scenario_id || scenario.id,
        employee_message: employeeInput,
        history: newHistory,
      });
      const newClientText = res.data.client_text;
      setClientText(newClientText);
      if (res.data.audio_url) playAudio(res.data.audio_url);
      setStep(nextStep);
      setEmployeeInput("");
    } catch {
      setClientText("Uzr, texnik muammo. Davom eting.");
      setStep(nextStep);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLastFeedback(null);
        inputRef.current?.focus();
      }, 2500);
    }
  };

  if (finished) {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const pctScore = Math.round((totalScore / scenario.max_score) * 100);
    const grade = pctScore >= 90 ? { label: "A'lo", color: "text-emerald-600", bg: "bg-emerald-50", icon: "🏆" }
      : pctScore >= 70 ? { label: "Yaxshi", color: "text-blue-600", bg: "bg-blue-50", icon: "🎯" }
      : { label: "Qoniqarli", color: "text-amber-600", bg: "bg-amber-50", icon: "📈" };

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

  return (
    <div className="space-y-4">
      {/* Step progress */}
      <div className="flex items-center gap-3">
        <ProgressBar value={pct} height="h-2" color="from-amber-500 to-orange-400" />
        <span className="text-xs text-gray-400 shrink-0 font-medium">
          {step + 1}/{scenario.steps?.length}
        </span>
      </div>

      {/* Client message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl shrink-0">
              😤
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-orange-700">Mijoz</span>
                <button
                  onClick={() => sendTTS(clientText, "difficult_client").then((r) => r.data.audio_url && playAudio(r.data.audio_url)).catch(() => {})}
                  className="text-orange-400 hover:text-orange-600 transition-colors"
                >
                  <Volume2 size={14} />
                </button>
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
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`flex items-start gap-2.5 p-3 rounded-xl border ${
              lastFeedback.isCorrect
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            {lastFeedback.isCorrect
              ? <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
              : <XCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
            }
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold ${lastFeedback.isCorrect ? "text-emerald-700" : "text-amber-700"}`}>
                {lastFeedback.feedback}
              </p>
            </div>
            <span className={`text-xs font-bold shrink-0 ${lastFeedback.isCorrect ? "text-emerald-600" : "text-amber-600"}`}>
              +{lastFeedback.score}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={employeeInput}
          onChange={(e) => setEmployeeInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Mijozga javob bering..."
          disabled={loading}
          className="input-field flex-1"
          autoFocus
        />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSend}
          disabled={loading || !employeeInput.trim()}
          className="btn-primary px-4 shrink-0"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Send size={16} />
          }
        </motion.button>
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>Jami ball: <span className="font-semibold text-primary-700">{totalScore}</span></span>
        <span>Max: {scenario.max_score}</span>
      </div>
    </div>
  );
}

