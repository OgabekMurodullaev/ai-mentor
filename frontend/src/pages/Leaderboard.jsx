import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Zap, Star, TrendingUp, Crown } from "lucide-react";
import { getLeaderboard } from "../api/gamification";

/* ── medal configs ─────────────────────────────────────── */
const MEDALS = [
  {
    rank: 1,
    order: 1,
    crown: true,
    pillarH: "h-[90px]",
    avatarSize: "w-16 h-16",
    textSize: "text-base",
    gradient: "from-amber-400 via-yellow-300 to-amber-500",
    pillarGradient: "from-amber-400 to-yellow-500",
    glow: "shadow-[0_0_28px_rgba(245,158,11,0.55)]",
    ring: "ring-2 ring-amber-300",
    label: "🥇",
    scoreColor: "text-amber-600",
    bg: "from-amber-50 to-yellow-50",
  },
  {
    rank: 2,
    order: 0,
    crown: false,
    pillarH: "h-[60px]",
    avatarSize: "w-13 h-13",
    textSize: "text-sm",
    gradient: "from-slate-400 via-slate-300 to-slate-400",
    pillarGradient: "from-slate-400 to-slate-500",
    glow: "shadow-[0_0_20px_rgba(148,163,184,0.50)]",
    ring: "ring-2 ring-slate-300",
    label: "🥈",
    scoreColor: "text-slate-600",
    bg: "from-slate-50 to-gray-50",
  },
  {
    rank: 3,
    order: 2,
    crown: false,
    pillarH: "h-[44px]",
    avatarSize: "w-12 h-12",
    textSize: "text-sm",
    gradient: "from-orange-400 via-amber-400 to-orange-500",
    pillarGradient: "from-orange-400 to-amber-500",
    glow: "shadow-[0_0_18px_rgba(205,124,47,0.50)]",
    ring: "ring-2 ring-orange-300",
    label: "🥉",
    scoreColor: "text-orange-600",
    bg: "from-orange-50 to-amber-50",
  },
];

const LEARNING_PATH_BADGE = {
  CASHIER:    { label: "Kassir",        color: "bg-emerald-100 text-emerald-700" },
  CREDIT:     { label: "Kreditchi",     color: "bg-blue-100 text-blue-700" },
  OPERATIONS: { label: "Operatsionist", color: "bg-violet-100 text-violet-700" },
  SERVICE:    { label: "Xizmat",        color: "bg-rose-100 text-rose-700" },
};

/* ── Star sparkle decoration ───────────────────────────── */
function Stars() {
  const positions = [
    { top: "12%", left: "8%",  size: 3, delay: 0 },
    { top: "25%", left: "92%", size: 2, delay: 0.4 },
    { top: "60%", left: "5%",  size: 2, delay: 0.8 },
    { top: "72%", left: "88%", size: 3, delay: 0.2 },
    { top: "40%", left: "50%", size: 2, delay: 1.0 },
    { top: "85%", left: "30%", size: 2, delay: 0.6 },
    { top: "18%", left: "60%", size: 3, delay: 1.2 },
  ];
  return (
    <>
      {positions.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/40 pointer-events-none"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.5 + i * 0.3, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

/* ── Podium ─────────────────────────────────────────────── */
function Podium({ top3 }) {
  if (!top3?.length) return null;

  return (
    <div className="flex items-end justify-center gap-4 pt-6 pb-2">
      {MEDALS.map((m) => {
        const person = top3[m.rank - 1];
        if (!person) return null;
        return (
          <motion.div
            key={m.rank}
            initial={{ opacity: 0, y: 40, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: m.order * 0.15 + 0.3, type: "spring", stiffness: 220, damping: 20 }}
            style={{ order: m.order }}
            className="flex flex-col items-center gap-0"
          >
            {/* Crown for #1 */}
            {m.crown && (
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-1"
              >
                <Crown size={20} className="text-amber-300 fill-amber-300 drop-shadow-lg" />
              </motion.div>
            )}

            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.06 }}
              className={`${m.avatarSize} rounded-2xl bg-gradient-to-br ${m.gradient}
                          flex items-center justify-center text-white font-bold text-lg
                          ${m.glow} ${m.ring} ring-offset-0 mb-2 relative cursor-default`}
            >
              {person.full_name[0]}
              {person.is_current_user && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary-600 border-2 border-white text-[8px] text-white flex items-center justify-center font-bold">
                  ★
                </span>
              )}
            </motion.div>

            {/* Name + score */}
            <p className={`${m.textSize} font-bold text-white text-center max-w-[72px] leading-tight truncate drop-shadow`}>
              {person.full_name.split(" ")[0]}
            </p>
            <p className="text-xs text-white/70 font-semibold mt-0.5 drop-shadow">
              {person.total_score} <span className="text-[9px] opacity-60">ball</span>
            </p>

            {/* Pillar */}
            <div
              className={`w-20 ${m.pillarH} mt-2 bg-gradient-to-t ${m.pillarGradient}
                          rounded-t-xl flex items-start justify-center pt-2 relative overflow-hidden
                          shadow-inner`}
            >
              <span className="text-2xl drop-shadow">{m.label}</span>
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-t-xl" />
              {/* Shine */}
              <div className="absolute top-0 left-2 right-2 h-px bg-white/40 rounded-full" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Row card for rank 4+ ───────────────────────────────── */
function RankRow({ item, index }) {
  const pathBadge = LEARNING_PATH_BADGE[item.learning_path];
  const rankColor =
    item.rank === 1 ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400" :
    item.rank === 2 ? "bg-gradient-to-r from-slate-50 to-gray-50 border-l-4 border-slate-400"  :
    item.rank === 3 ? "bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400":
    item.is_current_user ? "bg-blue-50 border-l-4 border-primary-600" :
    "bg-white border-l-4 border-transparent";

  const avgStars = Math.round((item.completion_percentage / 100) * 5);

  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.045, ease: "easeOut" }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-100
                  hover:border-slate-200 hover:shadow-card transition-all duration-200 ${rankColor}`}
    >
      {/* Rank number */}
      <div className="w-8 text-center shrink-0">
        {item.rank <= 3
          ? <span className="text-xl leading-none">
              {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : "🥉"}
            </span>
          : <span className={`text-sm font-bold ${item.is_current_user ? "text-primary-600" : "text-slate-400"}`}>
              {item.rank}
            </span>
        }
      </div>

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm
        ${item.rank === 1 ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white" :
          item.rank === 2 ? "bg-gradient-to-br from-slate-400 to-slate-500 text-white" :
          item.rank === 3 ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white" :
          item.is_current_user ? "bg-gradient-to-br from-primary-700 to-primary-500 text-white" :
          "bg-slate-100 text-slate-600"
        }`}
      >
        {item.full_name[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-semibold text-slate-800 text-sm leading-tight truncate">
            {item.full_name}
          </p>
          {item.is_current_user && (
            <span className="badge-pill bg-primary-600 text-white text-[9px] py-0 px-1.5">Siz</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[11px] text-slate-400 truncate">{item.branch || "—"}</p>
          {pathBadge && (
            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${pathBadge.color}`}>
              {pathBadge.label}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.completion_percentage}%` }}
              transition={{ delay: index * 0.045 + 0.3, duration: 0.7, ease: "easeOut" }}
              className={`h-full rounded-full ${
                item.rank === 1 ? "bg-gradient-to-r from-amber-400 to-yellow-500" :
                item.rank === 2 ? "bg-gradient-to-r from-slate-400 to-slate-500" :
                item.rank === 3 ? "bg-gradient-to-r from-orange-400 to-amber-500" :
                "bg-gradient-to-r from-primary-600 to-primary-400"
              }`}
            />
          </div>
          <span className="text-[10px] text-slate-400">{item.completion_percentage}%</span>
        </div>
      </div>

      {/* Score & stats */}
      <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
        <div className={`text-xl font-black leading-none
          ${item.rank === 1 ? "text-amber-500" :
            item.rank === 2 ? "text-slate-500" :
            item.rank === 3 ? "text-orange-500" :
            item.is_current_user ? "text-primary-600" :
            "text-slate-700"
          }`}
        >
          {item.total_score}
        </div>
        <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wide">ball</span>
        {/* Stars */}
        <div className="flex gap-0.5 mt-1">
          {[1,2,3,4,5].map((s) => (
            <Star
              key={s}
              size={8}
              className={s <= avgStars ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main page ──────────────────────────────────────────── */
export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const top3 = data.slice(0, 3);

  /* summary stats */
  const totalParticipants = data.length;
  const topScore = data[0]?.total_score ?? 0;
  const avgScore = totalParticipants
    ? Math.round(data.reduce((s, d) => s + d.total_score, 0) / totalParticipants)
    : 0;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">

      {/* ── Hero header ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(140deg, #172554 0%, #1e3a8a 40%, #1d4ed8 75%, #2563eb 100%)" }}
      >
        {/* dots pattern */}
        <div className="absolute inset-0 bg-dots opacity-60" />
        {/* radial glow center */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-400/15 via-transparent to-transparent" />
        {/* top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />

        <Stars />

        <div className="relative z-10 px-6 pt-7 pb-0">
          {/* Title row */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-glow-gold/60">
                  <Trophy size={18} className="text-navy-dark" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Reyting Jadvali</h1>
              </div>
              <p className="text-blue-300/80 text-sm pl-[52px]">
                {totalParticipants} ta hodim raqobatda
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-2 shrink-0">
              <div className="text-center bg-white/10 backdrop-blur rounded-xl px-3 py-2 border border-white/10">
                <div className="flex items-center gap-1 text-amber-300">
                  <Zap size={11} />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Top</span>
                </div>
                <p className="text-white font-black text-lg leading-none mt-0.5">{topScore}</p>
              </div>
              <div className="text-center bg-white/10 backdrop-blur rounded-xl px-3 py-2 border border-white/10">
                <div className="flex items-center gap-1 text-blue-300">
                  <TrendingUp size={11} />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">O'rtacha</span>
                </div>
                <p className="text-white font-black text-lg leading-none mt-0.5">{avgScore}</p>
              </div>
            </div>
          </div>

          {/* Podium */}
          <Podium top3={top3} />
        </div>
      </motion.div>

      {/* ── Full list ───────────────────────────────── */}
      <div>
        {/* Section header */}
        <div className="flex items-center gap-2 px-1 mb-3">
          <Flame size={14} className="text-orange-500" />
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">Barcha ishtirokchilar</h2>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[68px] rounded-xl bg-white border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Trophy size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Hali hech kim yo'q</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((item, i) => (
              <RankRow key={item.rank} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
