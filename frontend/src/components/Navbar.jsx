import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Bot, Monitor, Trophy, LayoutDashboard,
  Users, ChevronDown, Sparkles, FlaskConical, Moon, Sun,
} from "lucide-react";
import { useState } from "react";
import useAuthStore from "../store/authStore";
import useDemoStore from "../store/demoStore";
import useThemeStore from "../store/themeStore";

const NAV_ITEMS = [
  { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
  { to: "/chatbot",     icon: Bot,             label: "AI Chatbot" },
  { to: "/simulator",   icon: Monitor,         label: "Simulyator" },
  { to: "/leaderboard", icon: Trophy,          label: "Reyting" },
];

const ROLE_LABELS = {
  EMPLOYEE: { label: "Hodim", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  HR:       { label: "HR",    cls: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"   },
  ADMIN:    { label: "Admin", cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"           },
};

export default function Navbar() {
  const { user, logout }                = useAuthStore();
  const { isDemo, toggle: toggleDemo }  = useDemoStore();
  const { dark, toggle: toggleTheme }   = useThemeStore();
  const navigate                        = useNavigate();
  const location                        = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const isHROrAdmin  = user?.role === "HR" || user?.role === "ADMIN";
  const roleInfo     = ROLE_LABELS[user?.role] || ROLE_LABELS.EMPLOYEE;

  return (
    <nav className="sticky top-0 z-50
      bg-white/95 dark:bg-slate-900/92
      backdrop-blur-sm
      border-b border-slate-200 dark:border-slate-700/50
      shadow-[0_1px_8px_rgba(15,23,42,0.06)] dark:shadow-[0_1px_16px_rgba(0,0,0,0.35)]
      transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center justify-between h-[62px]">

          {/* ── Logo ──────────────────────────────────────────── */}
          <Link to="/dashboard" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:shadow-blue-500/30 transition-all duration-200">
              <Sparkles size={16} className="text-amber-300" />
            </div>
            <div className="leading-none">
              <span className="font-bold text-slate-900 dark:text-white text-[15px] tracking-tight">AI-Mentor</span>
              <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-[0.12em] uppercase mt-0.5">
                Turonbank
              </span>
            </div>
          </Link>

          {/* ── Nav links ─────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}>
                  <div className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-semibold transition-all duration-200 ${
                    active
                      ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/12"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}>
                    <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                    {label}
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}

            {isHROrAdmin && (
              <Link to="/hr">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-semibold transition-all duration-200 ${
                  location.pathname === "/hr"
                    ? "text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/12"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}>
                  <Users size={15} />
                  HR Panel
                </div>
              </Link>
            )}
          </div>

          {/* ── Right actions ─────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-800/80
                         flex items-center justify-center
                         text-slate-500 dark:text-slate-300
                         hover:bg-slate-100 dark:hover:bg-slate-700
                         transition-all duration-200"
              title={dark ? "Kunduzgi rejim" : "Tungi rejim"}
            >
              <AnimatePresence mode="wait" initial={false}>
                {dark ? (
                  <motion.div key="sun"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.18 }}>
                    <Sun size={14} />
                  </motion.div>
                ) : (
                  <motion.div key="moon"
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -90 }}
                    transition={{ duration: 0.18 }}>
                    <Moon size={14} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Demo toggle */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleDemo}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-semibold transition-all duration-200 ${
                isDemo
                  ? "bg-amber-50 dark:bg-amber-500/12 border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/18"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
              title={isDemo ? "Demo rejim yoniq" : "Demo rejimni yoqish"}
            >
              <FlaskConical size={11} />
              <span>Demo</span>
              <div className={`w-7 h-3.5 rounded-full relative transition-colors duration-200 ${isDemo ? "bg-amber-400" : "bg-slate-200 dark:bg-slate-600"}`}>
                <motion.div
                  animate={{ x: isDemo ? 14 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm"
                />
              </div>
            </motion.button>

            <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />

            {/* User menu */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                  {user?.full_name?.[0] || "U"}
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <p className="text-slate-800 dark:text-slate-100 text-[13px] font-semibold">{user?.full_name?.split(" ")[0]}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-0.5 inline-block ${roleInfo.cls}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.14, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-xl overflow-hidden z-50
                                 bg-white dark:bg-slate-900
                                 border border-slate-100 dark:border-slate-700/60"
                    >
                      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900/60">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-tight">{user?.full_name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[140px]">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        {user?.branch && (
                          <div className="px-3 py-1.5 text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <span>📍</span> {user.branch}
                          </div>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors mt-0.5"
                        >
                          <LogOut size={14} />
                          Chiqish
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}
