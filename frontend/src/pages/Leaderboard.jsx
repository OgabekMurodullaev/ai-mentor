import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Flame, TrendingUp, Crown, Medal, Zap } from "lucide-react";
import { getLeaderboard } from "../api/gamification";

/* ── Medal / rank config ──────────────────────────────────── */
const RANK_CFG = [
  {
    rank: 1, order: 1, crown: true,
    pillarH: "h-[88px]",
    avatarCls: "w-[60px] h-[60px] text-base",
    gradient:  "from-amber-400 via-yellow-300 to-amber-500",
    pillar:    "from-amber-500 to-yellow-400",
    glow:      "shadow-[0_0_24px_rgba(245,158,11,0.55)]",
    ring:      "ring-2 ring-amber-300/80 ring-offset-2 ring-offset-transparent",
    medal:     "🥇",
    scoreCls:  "text-amber-500",
  },
  {
    rank: 2, order: 0, crown: false,
    pillarH: "h-[58px]",
    avatarCls: "w-[50px] h-[50px] text-sm",
    gradient:  "from-slate-400 via-slate-300 to-slate-400",
    pillar:    "from-slate-500 to-slate-400",
    glow:      "shadow-[0_0_18px_rgba(148,163,184,0.50)]",
    ring:      "ring-2 ring-slate-300/80 ring-offset-2 ring-offset-transparent",
    medal:     "🥈",
    scoreCls:  "text-slate-500",
  },
  {
    rank: 3, order: 2, crown: false,
    pillarH: "h-[42px]",
    avatarCls: "w-[44px] h-[44px] text-sm",
    gradient:  "from-orange-500 via-amber-400 to-orange-500",
    pillar:    "from-orange-500 to-amber-400",
    glow:      "shadow-[0_0_16px_rgba(205,124,47,0.50)]",
    ring:      "ring-2 ring-orange-300/80 ring-offset-2 ring-offset-transparent",
    medal:     "🥉",
    scoreCls:  "text-orange-500",
  },
];

const PATH_BADGE = {
  CASHIER:    { label: "Kassir",        cls: "bg-emerald-100 text-emerald-700" },
  CREDIT:     { label: "Kreditchi",     cls: "bg-blue-100 text-blue-700" },
  OPERATIONS: { label: "Operatsionist", cls: "bg-violet-100 text-violet-700" },
  SERVICE:    { label: "Xizmat",        cls: "bg-rose-100 text-rose-700" },
};

/* ── Stars ────────────────────────────────────────────────── */
function Stars() {
  return (
    <>
      {[[10,8],[90,20],[5,60],[88,70],[50,35],[25,85],[70,15]].map(([l,t],i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/40 pointer-events-none"
          style={{ left: `${l}%`, top: `${t}%`, width: i%2===0?3:2, height: i%2===0?3:2 }}
          animate={{ opacity:[0.2,0.8,0.2], scale:[0.8,1.3,0.8] }}
          transition={{ duration: 2.5+i*0.3, delay: i*0.2, repeat: Infinity }}
        />
      ))}
    </>
  );
}

/* ── Podium ───────────────────────────────────────────────── */
function Podium({ top3 }) {
  if (!top3?.length) return null;
  return (
    <div className="flex items-end justify-center gap-3 pb-0 pt-4">
      {RANK_CFG.map((m) => {
        const p = top3[m.rank - 1];
        if (!p) return null;
        return (
          <motion.div
            key={m.rank}
            style={{ order: m.order }}
            initial={{ opacity: 0, y: 36, scale: 0.85 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            transition={{ delay: m.order * 0.12 + 0.25, type: "spring", stiffness: 220, damping: 22 }}
            className="flex flex-col items-center gap-0"
          >
            {/* Crown */}
            {m.crown && (
              <motion.div
                animate={{ y: [0,-4,0] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="mb-1.5"
              >
                <Crown size={18} className="text-amber-300 fill-amber-300 drop-shadow" />
              </motion.div>
            )}

            {/* Avatar */}
            <div className={`${m.avatarCls} rounded-2xl bg-gradient-to-br ${m.gradient}
                             flex items-center justify-center text-white font-black
                             ${m.glow} ${m.ring} mb-2 relative cursor-default select-none`}>
              {p.full_name[0]}
              {p.is_current_user && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600
                                 border-2 border-white text-[7px] text-white flex items-center justify-center font-bold">
                  ★
                </span>
              )}
            </div>

            {/* Name + score */}
            <p className="text-[13px] font-bold text-white text-center max-w-[70px] truncate leading-tight drop-shadow-sm">
              {p.full_name.split(" ")[0]}
            </p>
            <p className="text-[11px] text-white/65 font-semibold mt-0.5">
              {p.total_score}<span className="text-[9px] ml-0.5 opacity-70">ball</span>
            </p>

            {/* Pillar */}
            <div className={`w-[72px] ${m.pillarH} mt-2 bg-gradient-to-t ${m.pillar}
                             rounded-t-xl flex items-start justify-center pt-2.5 relative overflow-hidden`}>
              <span className="text-xl drop-shadow">{m.medal}</span>
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              <div className="absolute top-0 left-2 right-2 h-px bg-white/40 rounded-full" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Rank row (4+) ────────────────────────────────────────── */
function RankRow({ item, index }) {
  const pathBadge = PATH_BADGE[item.learning_path];
  const isMine    = item.is_current_user;

  const rowCls =
    item.rank === 1 ? "border-l-[3px] border-amber-400 bg-amber-50/60 dark:bg-amber-500/10" :
    item.rank === 2 ? "border-l-[3px] border-slate-400 bg-slate-50/60 dark:bg-slate-700/20" :
    item.rank === 3 ? "border-l-[3px] border-orange-400 bg-orange-50/60 dark:bg-orange-500/10" :
    isMine          ? "border-l-[3px] border-blue-500 bg-blue-50/50 dark:bg-blue-500/10" :
                      "border-l-[3px] border-transparent bg-white dark:bg-slate-800/20";

  const avatarCls =
    item.rank === 1 ? "from-amber-400 to-yellow-500" :
    item.rank === 2 ? "from-slate-400 to-slate-500"  :
    item.rank === 3 ? "from-orange-400 to-amber-500" :
    isMine          ? "from-blue-700 to-blue-500"    :
                      "from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-500";

  const scoreColor =
    item.rank === 1 ? "text-amber-500" :
    item.rank === 2 ? "text-slate-500" :
    item.rank === 3 ? "text-orange-500":
    isMine          ? "text-blue-600"  : "text-slate-700";

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, ease: "easeOut" }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-100
                  hover:shadow-card transition-all duration-200 ${rowCls}`}
    >
      {/* Rank */}
      <div className="w-7 text-center shrink-0">
        {item.rank <= 3
          ? <span className="text-lg leading-none">{item.rank===1?"🥇":item.rank===2?"🥈":"🥉"}</span>
          : <span className={`text-sm font-black ${isMine ? "text-blue-600" : "text-slate-400"}`}>{item.rank}</span>
        }
      </div>

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarCls}
                       flex items-center justify-center font-bold text-sm shrink-0
                       ${item.rank <= 3 ? "text-white" : isMine ? "text-white" : "text-slate-500 dark:text-slate-100"}`}>
        {item.full_name[0]}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="font-semibold text-slate-800 text-sm truncate leading-tight">
            {item.full_name}
          </p>
          {isMine && (
            <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full shrink-0">
              Siz
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.branch && <p className="text-[11px] text-slate-400 truncate">{item.branch}</p>}
          {pathBadge && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${pathBadge.cls}`}>
              {pathBadge.label}
            </span>
          )}
        </div>
        {/* Progress bar */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.completion_percentage}%` }}
              transition={{ delay: index * 0.04 + 0.3, duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${
                item.rank===1 ? "from-amber-400 to-yellow-500" :
                item.rank===2 ? "from-slate-400 to-slate-500" :
                item.rank===3 ? "from-orange-400 to-amber-500" :
                "from-blue-500 to-blue-400"
              }`}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{item.completion_percentage}%</span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p className={`text-xl font-black leading-none ${scoreColor}`}>{item.total_score}</p>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-0.5">ball</p>
      </div>
    </motion.div>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function Leaderboard() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const top3              = data.slice(0, 3);
  const totalParticipants = data.length;
  const topScore          = data[0]?.total_score ?? 0;
  const avgScore          = totalParticipants
    ? Math.round(data.reduce((s, d) => s + d.total_score, 0) / totalParticipants) : 0;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(145deg, #0f172a 0%, #172554 35%, #1e3a8a 70%, #1d4ed8 100%)" }}
      >
        <div className="absolute inset-0 bg-dots opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-purple-600/10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />
        <Stars />

        <div className="relative z-10 px-6 pt-7 pb-0">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-glow-gold/40">
                  <Trophy size={18} className="text-white" />
                </div>
                <h1 className="text-[22px] font-black text-white tracking-tight">Reyting Jadvali</h1>
              </div>
              <p className="text-blue-300/70 text-sm pl-[52px]">
                {totalParticipants} ta hodim raqobatda
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-2 shrink-0">
              <div className="text-center bg-white/8 backdrop-blur-sm rounded-2xl px-3.5 py-2.5 border border-white/10">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Zap size={10} className="text-amber-300" />
                  <span className="text-[9px] font-bold text-amber-200/80 uppercase tracking-wider">Top</span>
                </div>
                <p className="text-white font-black text-xl leading-none">{topScore}</p>
              </div>
              <div className="text-center bg-white/8 backdrop-blur-sm rounded-2xl px-3.5 py-2.5 border border-white/10">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <TrendingUp size={10} className="text-blue-300" />
                  <span className="text-[9px] font-bold text-blue-200/80 uppercase tracking-wider">O'rtacha</span>
                </div>
                <p className="text-white font-black text-xl leading-none">{avgScore}</p>
              </div>
            </div>
          </div>

          {/* Podium */}
          <Podium top3={top3} />
        </div>
      </motion.div>

      {/* ── Full list ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 px-1 mb-3">
          <Flame size={14} className="text-orange-500" />
          <h2 className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Barcha ishtirokchilar</h2>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-[72px] rounded-xl bg-white border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Medal size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">Hali hech kim yo'q</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {data.map((item, i) => (
              <RankRow key={item.rank} item={item} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
