import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Bot, Monitor, Trophy, TrendingUp, Flame, Star,
  ChevronRight, Zap, Clock, Target,
} from "lucide-react";
import { getProgress, getBadges } from "../api/gamification";
import useAuthStore from "../store/authStore";
import ProgressBar from "../components/ProgressBar";
import BadgeCard from "../components/BadgeCard";

const LEARNING_PATH_META = {
  CASHIER:    { label: "Kassir yo'li",            icon: "💵", color: "from-green-400 to-emerald-600" },
  CREDIT:     { label: "Kreditchi yo'li",          icon: "📋", color: "from-blue-400 to-indigo-600" },
  OPERATIONS: { label: "Operatsionist yo'li",      icon: "⚙️", color: "from-purple-400 to-violet-600" },
  SERVICE:    { label: "Xizmat ko'rsatish yo'li",  icon: "🤝", color: "from-orange-400 to-rose-600" },
};

const QUICK_ACTIONS = [
  {
    to: "/chatbot",
    icon: Bot,
    label: "AI Chatbot",
    desc: "Zulfiya bilan suhbat",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    to: "/simulator",
    icon: Monitor,
    label: "Simulyator",
    desc: "Mijoz stsenariylari",
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    to: "/leaderboard",
    icon: Trophy,
    label: "Reyting",
    desc: "O'rningni ko'r",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

function StatChip({ icon, value, label, color }) {
  return (
    <div className={`flex-1 min-w-0 ${color} rounded-2xl px-4 py-3 text-white`}>
      <div className="flex items-center gap-1.5 mb-1 opacity-80">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function ScoreRing({ value, max = 100 }) {
  const pct = Math.min(100, (value / max) * 100);
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
        <motion.circle
          cx="48" cy="48" r={r}
          fill="none" stroke="#e8b84b" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="text-center">
        <p className="text-xl font-bold text-white leading-none">{value}</p>
        <p className="text-[9px] text-blue-200 font-medium">BALL</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [progress, setProgress] = useState(null);
  const [allBadges, setAllBadges] = useState([]);

  useEffect(() => {
    getProgress().then((r) => setProgress(r.data));
    getBadges().then((r) => setAllBadges(r.data));
  }, []);

  const meta = LEARNING_PATH_META[user?.learning_path] || LEARNING_PATH_META.SERVICE;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Xayrli tong" : hour < 17 ? "Xayrli kun" : "Xayrli kech";

  return (
    <div className="space-y-5">

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 shadow-xl"
        style={{ background: "linear-gradient(135deg, #172554 0%, #1e3a8a 60%, #1d4ed8 100%)" }}
      >
        {/* bg decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10"
          style={{ background: "radial-gradient(circle, #e8b84b 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 opacity-5"
          style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)", transform: "translate(-20%, 40%)" }} />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-blue-300 text-sm font-medium"
            >
              {greeting}, 👋
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-bold text-white mt-0.5 truncate"
            >
              {user?.full_name}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mt-2"
            >
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                bg-white/15 text-white backdrop-blur`}>
                {meta.icon} {meta.label}
              </span>
              {user?.branch && (
                <span className="text-[11px] text-blue-300">📍 {user.branch}</span>
              )}
            </motion.div>

            {/* Progress bar in hero */}
            {progress && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4"
              >
                <div className="flex items-center justify-between text-xs text-blue-200 mb-1.5">
                  <span>Onboarding progressi</span>
                  <span className="font-bold text-white">{progress.completion_percentage}%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.completion_percentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-secondary-500 to-amber-300 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Score ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <ScoreRing value={progress?.total_score || 0} max={500} />
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex gap-3 mt-5"
        >
          <StatChip
            icon={<Target size={10} />}
            value={progress?.completed_quests || 0}
            label="Kvest"
            color="bg-white/15"
          />
          <StatChip
            icon={<Flame size={10} />}
            value={`${progress?.current_streak || 0}🔥`}
            label="Streak"
            color="bg-white/15"
          />
          <StatChip
            icon={<Star size={10} />}
            value={allBadges.filter((b) => b.earned).length}
            label="Nishon"
            color="bg-white/15"
          />
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, gradient, bg, iconColor }, i) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
          >
            <Link to={to} className="block group">
              <div className="card p-5 hover:-translate-y-1 cursor-pointer overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{label}</h3>
                <p className="text-xs text-gray-500 mt-1">{desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  Boshlash <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent results + Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Recent quests */}
        {progress?.recent_results?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                <Clock size={16} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">So'nggi natijalar</h3>
            </div>
            <div className="space-y-3">
              {progress.recent_results.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-800 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {r.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-700 truncate">{r.scenario}</p>
                    <div className="mt-1">
                      <ProgressBar
                        value={(r.score / r.max_score) * 100}
                        height="h-1.5"
                        color="from-primary-800 to-blue-400"
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {r.score}/{r.max_score}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Badges */}
        {allBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                <Zap size={16} className="text-amber-500" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">Nishonlar</h3>
              <span className="ml-auto text-xs text-gray-400">
                {allBadges.filter((b) => b.earned).length}/{allBadges.length}
              </span>
            </div>
            <div className="space-y-2">
              {allBadges.slice(0, 4).map((badge, i) => (
                <BadgeCard key={i} badge={badge} earned={badge.earned} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

