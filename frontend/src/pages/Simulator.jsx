import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, Play, Trophy, Clock,
  AlertTriangle, Shield, Coins, RotateCcw,
  MessageSquare, Mic,
} from "lucide-react";
import { getScenarios, startScenario, finishScenario } from "../api/simulator";
import DifficultClient from "../components/DifficultClient";
import ProgressBar from "../components/ProgressBar";

const DIFFICULTY_CONFIG = {
  EASY:   { label: "Oson",  color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-400" },
  MEDIUM: { label: "O'rta", color: "bg-amber-100 text-amber-700",     dot: "bg-amber-400"   },
  HARD:   { label: "Qiyin", color: "bg-red-100 text-red-700",         dot: "bg-red-400"     },
};

const TYPE_CONFIG = {
  COMPLAINT: { icon: AlertTriangle, color: "text-red-500",    bg: "bg-red-50"     },
  DEPOSIT:   { icon: Coins,         color: "text-amber-500",  bg: "bg-amber-50"   },
  CREDIT:    { icon: Coins,         color: "text-blue-500",   bg: "bg-blue-50"    },
  SECURITY:  { icon: Shield,        color: "text-violet-500", bg: "bg-violet-50"  },
  TRANSFER:  { icon: Coins,         color: "text-teal-500",   bg: "bg-teal-50"    },
};

export default function Simulator() {
  const [scenarios,     setScenarios]     = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [scenarioData,   setScenarioData]   = useState(null);
  const [result,         setResult]         = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [startingId,     setStartingId]     = useState(null);
  // "text" | "voice"
  const [inputMode,      setInputMode]      = useState("text");

  useEffect(() => {
    getScenarios().then((r) => setScenarios(r.data)).catch(() => {});
  }, []);

  const handleStart = async (s) => {
    setStartingId(s.id);
    setLoading(true);
    try {
      const res = await startScenario(s.id);
      setActiveScenario(s);
      setScenarioData(res.data);
    } catch {
      setActiveScenario(s);
      setScenarioData({ ...s, scenario_id: s.id });
    } finally {
      setLoading(false);
      setStartingId(null);
    }
  };

  const handleComplete = async (score, timeSpent) => {
    setResult({ score, scenario: activeScenario });
    try {
      await finishScenario({
        scenario_id:        activeScenario.id,
        total_score:        score,
        time_spent_seconds: timeSpent || 120,
        mistakes:           [],
      });
    } catch {/* ignore */}
  };

  const reset = () => {
    setActiveScenario(null);
    setScenarioData(null);
    setResult(null);
  };

  // ── RESULT ──────────────────────────────────────────────────────────────────
  if (result) {
    const pct = Math.round((result.score / result.scenario.max_score) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-10 text-center space-y-6 max-w-md mx-auto mt-8"
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-7xl"
        >
          {pct >= 80 ? "🏆" : pct >= 50 ? "🎯" : "📈"}
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stsenariy yakunlandi!</h2>
          <p className="text-gray-500 mt-1 text-sm">{result.scenario.title}</p>
        </div>
        <div className="bg-primary-50 rounded-2xl py-5 px-8 inline-block mx-auto">
          <span className="text-4xl font-bold text-primary-700">{result.score}</span>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-xl text-gray-600">{result.scenario.max_score}</span>
        </div>
        <div className="max-w-48 mx-auto">
          <ProgressBar value={pct} height="h-3" showLabel />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={reset}
          className="btn-primary px-8 py-3 gap-2 flex items-center mx-auto"
        >
          <RotateCcw size={16} />
          Boshqa stsenariy
        </motion.button>
      </motion.div>
    );
  }

  // ── ACTIVE SCENARIO ─────────────────────────────────────────────────────────
  if (activeScenario && scenarioData) {
    return (
      <div className="space-y-4">
        {/* Breadcrumb + mode toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
            >
              ← Orqaga
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <span className={`badge-pill text-[10px] ${DIFFICULTY_CONFIG[activeScenario.difficulty]?.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${DIFFICULTY_CONFIG[activeScenario.difficulty]?.dot}`} />
              {DIFFICULTY_CONFIG[activeScenario.difficulty]?.label}
            </span>
            <h2 className="font-bold text-gray-800 text-sm truncate max-w-[180px]">
              {activeScenario.title}
            </h2>
          </div>

          {/* Text / Voice mode selector */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setInputMode("text")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                inputMode === "text"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <MessageSquare size={12} />
              Matnli
            </button>
            <button
              onClick={() => setInputMode("voice")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                inputMode === "voice"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Mic size={12} />
              Ovozli
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card p-6"
        >
          <DifficultClient
            scenario={scenarioData}
            mode={inputMode}
            onComplete={handleComplete}
          />
        </motion.div>
      </div>
    );
  }

  // ── SCENARIOS LIST ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center">
          <Monitor size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">ABS/CRM Simulyator</h2>
          <p className="text-xs text-gray-500">Mijoz xizmat ko'rsatish stsenariylarini mashq qiling</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4">
        {scenarios.map((s, i) => {
          const diffCfg  = DIFFICULTY_CONFIG[s.difficulty]    || {};
          const typeCfg  = TYPE_CONFIG[s.scenario_type]       || TYPE_CONFIG.CREDIT;
          const TypeIcon = typeCfg.icon;
          const isStarting = startingId === s.id;

          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div
                className="card p-5 group hover:-translate-y-0.5 cursor-pointer overflow-hidden relative"
                onClick={() => !loading && handleStart(s)}
              >
                <div
                  className={`absolute top-0 right-0 w-24 h-24 ${typeCfg.bg} rounded-full opacity-30`}
                  style={{ transform: "translate(30%, -30%)" }}
                />
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${typeCfg.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <TypeIcon size={22} className={typeCfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1.5">
                      <span className={`badge-pill ${diffCfg.color} text-[10px]`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${diffCfg.dot}`} />
                        {diffCfg.label}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">{s.scenario_type}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm">{s.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Trophy size={11} />
                        <span>Max: <span className="font-semibold text-primary-700">{s.max_score}</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} />
                        <span>~3 daqiqa</span>
                      </div>
                      {/* Mode indicators */}
                      <div className="flex items-center gap-1">
                        <MessageSquare size={10} className="text-gray-300" />
                        <Mic          size={10} className="text-gray-300" />
                      </div>
                    </div>
                  </div>
                  <motion.div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all
                      ${isStarting ? "bg-primary-700" : "bg-primary-50 group-hover:bg-primary-700"}`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {isStarting
                      ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Play size={15} className="transition-colors group-hover:text-white text-primary-700" />
                    }
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {scenarios.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Monitor size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Stsenariylar yuklanmoqda...</p>
          </div>
        )}
      </div>
    </div>
  );
}
