import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Monitor, Play, Trophy, Clock, RotateCcw,
  AlertTriangle, Shield, Coins, Lock,
  MessageSquare, Mic, CheckCircle2, ChevronDown,
  Sparkles, Star, Zap,
} from "lucide-react";
import { getScenarios, startScenario, finishScenario } from "../api/simulator";
import DifficultClient from "../components/DifficultClient";
import ProgressBar from "../components/ProgressBar";

/* ─── Type configs ──────────────────────────────────────────── */
const TYPE_CFG = {
  COMPLAINT: { icon: AlertTriangle, color: "text-red-400",    bg: "bg-red-500/15",    border: "border-red-500/25"    },
  DEPOSIT:   { icon: Coins,         color: "text-amber-400",  bg: "bg-amber-500/15",  border: "border-amber-500/25"  },
  CREDIT:    { icon: Coins,         color: "text-blue-400",   bg: "bg-blue-500/15",   border: "border-blue-500/25"   },
  SECURITY:  { icon: Shield,        color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/25" },
  TRANSFER:  { icon: Coins,         color: "text-teal-400",   bg: "bg-teal-500/15",   border: "border-teal-500/25"   },
};

const DIFF_CFG = {
  EASY:   { label: "Oson",  badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25", dot: "bg-emerald-400" },
  MEDIUM: { label: "O'rta", badge: "bg-amber-500/15 text-amber-300 border-amber-500/25",       dot: "bg-amber-400"   },
  HARD:   { label: "Qiyin", badge: "bg-red-500/15 text-red-300 border-red-500/25",             dot: "bg-red-400"     },
};

/* ─── Tier configs ──────────────────────────────────────────── */
const TIERS = [
  {
    key: "EASY", step: 1, label: "Boshlang'ich", sublabel: "Asosiy tushunchalar",
    emoji: "🌱",
    glow:         "rgba(16,185,129,0.20)",
    headerFrom:   "rgba(16,185,129,0.13)",
    headerTo:     "rgba(20,184,166,0.06)",
    borderColor:  "rgba(16,185,129,0.28)",
    stepFrom:     "#10b981", stepTo: "#14b8a6",
    progressFrom: "#10b981", progressTo: "#14b8a6",
    badgeText:    "text-emerald-300",
    badgeBg:      "bg-emerald-500/15 border border-emerald-500/25",
    connFrom:     "rgba(16,185,129,0.55)",
    connTo:       "rgba(245,158,11,0.55)",
  },
  {
    key: "MEDIUM", step: 2, label: "O'rta daraja", sublabel: "Murakkab holatlar",
    emoji: "⚡",
    glow:         "rgba(245,158,11,0.20)",
    headerFrom:   "rgba(245,158,11,0.13)",
    headerTo:     "rgba(249,115,22,0.06)",
    borderColor:  "rgba(245,158,11,0.28)",
    stepFrom:     "#f59e0b", stepTo: "#f97316",
    progressFrom: "#f59e0b", progressTo: "#f97316",
    badgeText:    "text-amber-300",
    badgeBg:      "bg-amber-500/15 border border-amber-500/25",
    connFrom:     "rgba(245,158,11,0.55)",
    connTo:       "rgba(239,68,68,0.55)",
  },
  {
    key: "HARD", step: 3, label: "Professional", sublabel: "Yuqori sinov",
    emoji: "🔥",
    glow:         "rgba(239,68,68,0.20)",
    headerFrom:   "rgba(239,68,68,0.13)",
    headerTo:     "rgba(225,29,72,0.06)",
    borderColor:  "rgba(239,68,68,0.28)",
    stepFrom:     "#ef4444", stepTo: "#e11d48",
    progressFrom: "#ef4444", progressTo: "#e11d48",
    badgeText:    "text-red-300",
    badgeBg:      "bg-red-500/15 border border-red-500/25",
    connFrom:     "",
    connTo:       "",
  },
];

/* ─── Coming soon scenarios ─────────────────────────────────── */
const COMING_SOON = [
  {
    id: "cs_security", title: "Fishing va kiberxavfsizlik",
    description: "Mijozni fishing hujumlardan himoya qilish va bank ma'lumotlarini muhofaza etish.",
    scenario_type: "SECURITY", difficulty: "MEDIUM", max_score: 70, eta: "Iyul 2026",
  },
  {
    id: "cs_swift", title: "Pul o'tkazma va SWIFT operatsiyalari",
    description: "Xalqaro pul o'tkazmalar, SWIFT kodlar va valyuta konvertatsiyasi.",
    scenario_type: "TRANSFER", difficulty: "HARD", max_score: 80, eta: "Iyun 2026",
  },
];

/* ─── localStorage helpers ──────────────────────────────────── */
const STORAGE_KEY = "aim_completed_v1";
const loadCompleted = () => {
  try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); }
  catch { return new Set(); }
};
const saveCompleted = (ids) => localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));

/* ─── Animated background ───────────────────────────────────── */
function AnimatedBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Blob 1 — blue, top-left */}
      <motion.div
        animate={{
          x: [0, 70, -35, 20, 0],
          y: [0, -55, 75, -25, 0],
          scale: [1, 1.18, 0.90, 1.06, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-48 -left-48 w-[750px] h-[750px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.13), transparent 65%)" }}
      />
      {/* Blob 2 — indigo, top-right */}
      <motion.div
        animate={{
          x: [0, -65, 45, -20, 0],
          y: [0, 65, -55, 40, 0],
          scale: [1, 0.87, 1.13, 0.94, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 7 }}
        className="absolute -top-28 right-[-120px] w-[620px] h-[620px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.11), transparent 65%)" }}
      />
      {/* Blob 3 — teal, bottom-center */}
      <motion.div
        animate={{
          x: [0, 55, -65, 25, 0],
          y: [0, -85, 45, 65, 0],
          scale: [1, 1.12, 0.92, 1.08, 1],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 14 }}
        className="absolute bottom-[-120px] left-[30%] w-[550px] h-[550px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.09), transparent 65%)" }}
      />
      {/* Blob 4 — purple, middle */}
      <motion.div
        animate={{
          x: [0, -40, 55, -15, 0],
          y: [0, 45, -35, 50, 0],
          scale: [1, 1.05, 0.95, 1.03, 1],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 21 }}
        className="absolute top-[35%] left-[45%] w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.07), transparent 65%)" }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.06) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      {/* Subtle scan lines */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(0deg, transparent calc(100% - 1px), rgba(148,163,184,0.3) 100%)",
          backgroundSize: "100% 80px",
        }}
      />
    </div>
  );
}

/* ─── Page background color ─────────────────────────────────── */
const PAGE_BG = {
  background: "linear-gradient(155deg, #080e1a 0%, #0f172a 30%, #111827 60%, #0d1f3c 100%)",
};

/* ─── Scenario card ─────────────────────────────────────────── */
function ScenarioCard({ s, isCompleted, isLocked, isStarting, onStart }) {
  const t = TYPE_CFG[s.scenario_type] || TYPE_CFG.CREDIT;
  const d = DIFF_CFG[s.difficulty]    || DIFF_CFG.EASY;
  const TypeIcon = t.icon;

  if (isLocked) {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] opacity-35 cursor-not-allowed select-none">
        <div className={`w-9 h-9 ${t.bg} rounded-xl flex items-center justify-center shrink-0 grayscale`}>
          <TypeIcon size={15} className={t.color} />
        </div>
        <p className="text-xs font-semibold text-slate-500 truncate flex-1">{s.title}</p>
        <Lock size={11} className="text-slate-600 shrink-0" />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={!isCompleted ? { y: -2, scale: 1.007 } : {}}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={`relative overflow-hidden rounded-2xl border cursor-pointer group
        ${isCompleted
          ? "border-emerald-500/20"
          : "border-white/8 hover:border-white/18"
        }`}
      style={
        isCompleted
          ? { background: "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(20,184,166,0.05))" }
          : {
              background: "rgba(255,255,255,0.04)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.25)",
            }
      }
      onClick={() => !isCompleted && !isStarting && onStart(s)}
    >
      {/* Hover shimmer */}
      {!isCompleted && (
        <motion.div
          initial={{ x: "-110%", opacity: 0 }}
          whileHover={{ x: "110%", opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
        />
      )}

      {/* Corner glow blob */}
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${t.bg} rounded-full opacity-20 pointer-events-none`}
        style={{ transform: "translate(35%, -35%)" }}
      />

      <div className="relative p-4 flex items-start gap-3">
        {/* Type icon */}
        <div className={`w-11 h-11 ${t.bg} ${t.border} border rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
          <TypeIcon size={19} className={t.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${d.badge} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${d.dot}`} />
              {d.label}
            </span>
            <span className="text-[10px] text-slate-600 font-medium">{s.scenario_type}</span>
          </div>
          <h4 className="font-bold text-slate-100 text-sm leading-snug">{s.title}</h4>
          <p className="text-[12px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{s.description}</p>

          <div className="flex items-center gap-4 mt-2.5">
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Trophy size={10} />
              Max: <b className="text-blue-400 ml-0.5">{s.max_score}</b>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <Clock size={10} /> ~3 daq
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <MessageSquare size={9} /> / <Mic size={9} />
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="shrink-0 mt-1">
          {isCompleted ? (
            <div className="flex flex-col items-center gap-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 240 }}
                className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center"
              >
                <CheckCircle2 size={17} className="text-emerald-400" />
              </motion.div>
              <button
                onClick={(e) => { e.stopPropagation(); onStart(s); }}
                className="text-[9px] font-semibold text-slate-600 hover:text-blue-400 transition-colors"
              >
                Qayta
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.14 }}
              whileTap={{ scale: 0.90 }}
              disabled={isStarting}
              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200
                ${isStarting
                  ? "bg-blue-600 border-blue-500"
                  : "bg-blue-500/15 border-blue-500/25 group-hover:bg-blue-600 group-hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-900/40"
                }`}
            >
              {isStarting
                ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Play size={13} className="text-blue-400 group-hover:text-white transition-colors ml-0.5" />
              }
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Coming soon card ──────────────────────────────────────── */
function ComingSoonCard({ s }) {
  const t = TYPE_CFG[s.scenario_type] || TYPE_CFG.CREDIT;
  const TypeIcon = t.icon;
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-white/8 bg-white/[0.025]">
      <div className={`w-9 h-9 ${t.bg} rounded-xl flex items-center justify-center shrink-0 opacity-40 grayscale`}>
        <TypeIcon size={15} className={t.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-slate-500 truncate">{s.title}</p>
        <p className="text-[10px] text-slate-700 mt-0.5 line-clamp-1">{s.description}</p>
      </div>
      <div className="shrink-0 text-right space-y-1">
        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-full">
          <Lock size={7} /> Tez orada
        </div>
        <p className="text-[9px] text-slate-600 text-right">{s.eta}</p>
      </div>
    </div>
  );
}

/* ─── Animated connector ────────────────────────────────────── */
function TierConnector({ tier, isNextUnlocked }) {
  return (
    <div className="flex flex-col items-center py-2">
      <motion.div
        animate={isNextUnlocked ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.15 }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        className="w-px h-6"
        style={{
          background: isNextUnlocked
            ? `linear-gradient(180deg, ${tier.connFrom}, ${tier.connTo})`
            : "rgba(100,116,139,0.2)",
        }}
      />
      <motion.div
        animate={isNextUnlocked
          ? { y: [0, 4, 0], opacity: [0.5, 1, 0.5] }
          : { opacity: 0.2 }
        }
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown size={15} className={isNextUnlocked ? "text-slate-400" : "text-slate-700"} />
      </motion.div>
      <motion.div
        animate={isNextUnlocked ? { opacity: [0.35, 1, 0.35] } : { opacity: 0.15 }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="w-px h-3"
        style={{
          background: isNextUnlocked
            ? `linear-gradient(180deg, ${tier.connFrom}, ${tier.connTo})`
            : "rgba(100,116,139,0.2)",
        }}
      />
    </div>
  );
}

/* ═══ Main component ════════════════════════════════════════════ */
export default function Simulator() {
  const [scenarios,      setScenarios]      = useState([]);
  const [completedIds,   setCompletedIds]   = useState(loadCompleted);
  const [activeScenario, setActiveScenario] = useState(null);
  const [scenarioData,   setScenarioData]   = useState(null);
  const [result,         setResult]         = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [startingId,     setStartingId]     = useState(null);
  const [inputMode,      setInputMode]      = useState("text");

  useEffect(() => {
    getScenarios().then((r) => setScenarios(r.data)).catch(() => {});
  }, []);

  /* Tier unlock logic */
  const activeByDiff = (diff) => scenarios.filter((s) => s.difficulty === diff);
  const allCompleted = (diff) =>
    activeByDiff(diff).length > 0 && activeByDiff(diff).every((s) => completedIds.has(s.id));
  const tierUnlocked = {
    EASY:   true,
    MEDIUM: allCompleted("EASY"),
    HARD:   allCompleted("EASY") && allCompleted("MEDIUM"),
  };
  const totalActive    = scenarios.length;
  const totalCompleted = scenarios.filter((s) => completedIds.has(s.id)).length;

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
    const newIds = new Set([...completedIds, activeScenario.id]);
    setCompletedIds(newIds);
    saveCompleted(newIds);
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

  const reset = () => { setActiveScenario(null); setScenarioData(null); setResult(null); };

  /* Shared full-bleed wrapper */
  const Wrap = ({ children }) => (
    <div
      className="relative -mx-4 -mt-6"
      style={{ ...PAGE_BG, minHeight: "calc(100vh - 64px)" }}
    >
      <AnimatedBg />
      <div className="relative z-10 px-4 pt-6 pb-12">
        {children}
      </div>
    </div>
  );

  /* ── RESULT ─────────────────────────────────────────────── */
  if (result) {
    const pct  = Math.round((result.score / result.scenario.max_score) * 100);
    const diff = result.scenario.difficulty;
    const nextTierUnlocked =
      diff === "EASY"   ? allCompleted("EASY") :
      diff === "MEDIUM" ? allCompleted("EASY") && allCompleted("MEDIUM") : false;
    const nextTierName =
      diff === "EASY" ? "O'rta daraja" : diff === "MEDIUM" ? "Professional daraja" : null;

    return (
      <Wrap>
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.90, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            className="w-full max-w-sm mx-auto"
          >
            <div
              className="rounded-3xl border border-white/10 p-8 text-center space-y-5 backdrop-blur-sm"
              style={{
                background: "rgba(15,23,42,0.80)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)",
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                className="text-6xl"
              >
                {pct >= 80 ? "🏆" : pct >= 50 ? "🎯" : "📈"}
              </motion.div>

              <div>
                <h2 className="text-xl font-bold text-white">Stsenariy yakunlandi!</h2>
                <p className="text-slate-400 text-sm mt-1">{result.scenario.title}</p>
              </div>

              <div
                className="rounded-2xl py-4 px-6 border border-blue-500/20"
                style={{ background: "rgba(59,130,246,0.08)" }}
              >
                <span className="text-4xl font-black text-white">{result.score}</span>
                <span className="text-slate-600 mx-2">/</span>
                <span className="text-xl text-slate-400 font-medium">{result.scenario.max_score}</span>
                <p className="text-xs text-slate-500 mt-1">
                  {pct >= 80 ? "Ajoyib natija! 🌟" : pct >= 50 ? "Yaxshi urinish!" : "Davom eting!"}
                </p>
              </div>

              <div className="w-48 mx-auto">
                <ProgressBar value={pct} height="h-2" showLabel />
              </div>

              {nextTierUnlocked && nextTierName && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-amber-300 border border-amber-500/25"
                  style={{ background: "rgba(245,158,11,0.08)" }}
                >
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  🎉 <b>{nextTierName}</b> ochildi!
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                style={{ boxShadow: "0 4px 18px rgba(37,99,235,0.35)" }}
              >
                <RotateCcw size={14} />
                Yo'l xaritasiga qaytish
              </motion.button>
            </div>
          </motion.div>
        </div>
      </Wrap>
    );
  }

  /* ── ACTIVE SCENARIO ────────────────────────────────────── */
  if (activeScenario && scenarioData) {
    return (
      <Wrap>
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={reset}
                className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                ← Orqaga
              </button>
              <div className="h-4 w-px bg-slate-700" />
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${DIFF_CFG[activeScenario.difficulty]?.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${DIFF_CFG[activeScenario.difficulty]?.dot}`} />
                {DIFF_CFG[activeScenario.difficulty]?.label}
              </span>
              <h2 className="font-bold text-white text-sm truncate max-w-[220px]">
                {activeScenario.title}
              </h2>
            </div>

            <div
              className="flex items-center rounded-xl p-1 gap-1 border border-slate-700/50"
              style={{ background: "rgba(15,23,42,0.7)" }}
            >
              {[["text", MessageSquare, "Matnli"], ["voice", Mic, "Ovozli"]].map(([val, Icon, lbl]) => (
                <button
                  key={val}
                  onClick={() => setInputMode(val)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    inputMode === val
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon size={12} />{lbl}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
            <DifficultClient scenario={scenarioData} mode={inputMode} onComplete={handleComplete} />
          </motion.div>
        </div>
      </Wrap>
    );
  }

  /* ── ROADMAP ────────────────────────────────────────────── */
  return (
    <Wrap>
      <div className="max-w-2xl mx-auto space-y-3">

        {/* ── Page header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-2"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
                boxShadow: "0 4px 18px rgba(29,78,216,0.4)",
              }}
            >
              <Monitor size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">O'quv Yo'l Xaritasi</h2>
              <p className="text-[12px] text-slate-400 mt-0.5">Qiyinlikka qarab ketma-ket o'zlashtirib boring</p>
            </div>
          </div>

          {totalActive > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-right"
            >
              <p className="text-[11px] text-slate-500 font-medium">Umumiy progress</p>
              <p className="text-2xl font-black text-white leading-none">
                {totalCompleted}
                <span className="text-slate-500 font-medium text-sm">/{totalActive}</span>
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Overall progress bar */}
        {totalActive > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="h-1.5 rounded-full overflow-hidden mb-4"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalCompleted / totalActive) * 100}%` }}
              transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #3b82f6, #6366f1)" }}
            />
          </motion.div>
        )}

        {/* ── Tier cards ──────────────────────────────────── */}
        {TIERS.map((tier, ti) => {
          const tierScenarios  = activeByDiff(tier.key);
          const tierCS         = COMING_SOON.filter((c) => c.difficulty === tier.key);
          const unlocked       = tierUnlocked[tier.key];
          const completedCount = tierScenarios.filter((s) => completedIds.has(s.id)).length;
          const isAllDone      = tierScenarios.length > 0 && completedCount === tierScenarios.length;
          const isNextUnlocked = ti < TIERS.length - 1 && tierUnlocked[TIERS[ti + 1].key];

          return (
            <div key={tier.key}>
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: ti * 0.12, type: "spring", stiffness: 180, damping: 22 }}
                className={`rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-500 ${!unlocked ? "opacity-55" : ""}`}
                style={{
                  border: `1px solid ${tier.borderColor}`,
                  background: "rgba(10,18,32,0.72)",
                  boxShadow: unlocked
                    ? `0 0 0 1px ${tier.borderColor}, 0 0 35px ${tier.glow}, 0 10px 40px rgba(0,0,0,0.4)`
                    : "0 4px 28px rgba(0,0,0,0.3)",
                }}
              >
                {/* ── Tier header ─────────────────────────── */}
                <div
                  className="relative px-5 py-4"
                  style={{
                    background: `linear-gradient(135deg, ${tier.headerFrom}, ${tier.headerTo})`,
                    borderBottom: `1px solid ${tier.borderColor}`,
                  }}
                >
                  {/* Watermark step number */}
                  <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-white pointer-events-none select-none"
                    style={{ fontSize: "80px", lineHeight: 1, opacity: 0.04, letterSpacing: "-4px" }}
                  >
                    {String(tier.step).padStart(2, "0")}
                  </div>

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Gradient step badge */}
                      <motion.div
                        initial={unlocked ? { scale: 0.7, opacity: 0 } : {}}
                        animate={unlocked ? { scale: 1, opacity: 1 } : {}}
                        transition={{ type: "spring", stiffness: 260, damping: 18, delay: ti * 0.12 + 0.1 }}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-white text-sm shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${tier.stepFrom}, ${tier.stepTo})`,
                          boxShadow: unlocked ? `0 4px 16px ${tier.glow}` : "none",
                        }}
                      >
                        {tier.step}
                      </motion.div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white text-sm">{tier.emoji} {tier.label}</p>
                          {isAllDone && (
                            <motion.span
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: "spring", stiffness: 260 }}
                              className="flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full"
                            >
                              <CheckCircle2 size={9} /> Tugallandi
                            </motion.span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{tier.sublabel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {tierScenarios.length > 0 && (
                        <span className="text-xs font-bold text-slate-300">
                          {completedCount}/{tierScenarios.length}
                        </span>
                      )}
                      {!unlocked ? (
                        <span
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-500 px-2.5 py-1 rounded-xl border border-slate-700/60"
                          style={{ background: "rgba(15,23,42,0.60)" }}
                        >
                          <Lock size={9} /> Qulflangan
                        </span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.75 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 260 }}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-xl ${tier.badgeBg} ${tier.badgeText}`}
                        >
                          Ochiq ✓
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Tier content ─────────────────────────── */}
                <div className="p-4 space-y-2.5">
                  {/* Loading shimmer */}
                  {scenarios.length === 0 && ti === 0 && (
                    <div className="text-center py-7">
                      <div
                        className="w-5 h-5 border-2 border-t-blue-500 rounded-full animate-spin mx-auto mb-2.5"
                        style={{ borderColor: "rgba(148,163,184,0.2)", borderTopColor: "#3b82f6" }}
                      />
                      <p className="text-xs text-slate-600">Stsenariylar yuklanmoqda...</p>
                    </div>
                  )}

                  {tierScenarios.map((s) => (
                    <ScenarioCard
                      key={s.id} s={s}
                      isCompleted={completedIds.has(s.id)}
                      isLocked={!unlocked}
                      isStarting={startingId === s.id}
                      onStart={handleStart}
                    />
                  ))}

                  {tierCS.map((s) => <ComingSoonCard key={s.id} s={s} />)}

                  {!unlocked && (
                    <div
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 border border-dashed border-slate-700/40"
                      style={{ background: "rgba(15,23,42,0.4)" }}
                    >
                      <Lock size={11} className="text-slate-600 shrink-0" />
                      <p className="text-xs text-slate-600">
                        <span className="text-slate-500 font-semibold">{TIERS[ti - 1]?.label}</span> bosqichini tugatgach ochiladi
                      </p>
                    </div>
                  )}
                </div>

                {/* Tier progress bar */}
                {unlocked && tierScenarios.length > 0 && (
                  <div className="px-4 pb-4">
                    <div
                      className="h-[3px] rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(completedCount / tierScenarios.length) * 100}%` }}
                        transition={{ duration: 1, delay: ti * 0.12 + 0.4, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${tier.progressFrom}, ${tier.progressTo})` }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Connector between tiers */}
              {ti < TIERS.length - 1 && (
                <TierConnector tier={tier} isNextUnlocked={isNextUnlocked} />
              )}
            </div>
          );
        })}

        {/* All done celebration */}
        {totalActive > 0 && totalCompleted === totalActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 160 }}
            className="rounded-2xl p-6 text-center border border-amber-500/25"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(251,191,36,0.05))",
              boxShadow: "0 0 40px rgba(245,158,11,0.10)",
            }}
          >
            <p className="text-3xl mb-2">🏆</p>
            <p className="font-bold text-amber-200 text-base">Barcha stsenariylarni tugatdingiz!</p>
            <p className="text-sm text-amber-400/60 mt-1">Siz professionallik darajasiga yettingiz</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-xs text-amber-400/60 font-medium">Yangi stsenariylar tez orada qo'shiladi</span>
            </div>
          </motion.div>
        )}

      </div>
    </Wrap>
  );
}
