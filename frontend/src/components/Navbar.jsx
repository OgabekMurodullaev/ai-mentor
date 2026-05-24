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
    <nav
      style={{
        backgroundColor: dark ? "rgba(15,23,42,0.93)" : "rgba(255,255,255,0.96)",
        borderBottomColor: dark ? "rgba(100,116,139,0.3)" : "rgba(226,232,240,1)",
        boxShadow: dark
          ? "0 1px 16px rgba(0,0,0,0.4)"
          : "0 1px 8px rgba(15,23,42,0.06)",
      }}
      className="sticky top-0 z-50 backdrop-blur-sm border-b transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-5">
        <div className="flex items-center justify-between h-[62px]">

          {/* ── Logo ──────────────────────────────────────────── */}
          <Link to="/dashboard" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:shadow-blue-500/30 transition-all duration-200">
              <Sparkles size={16} className="text-amber-300" />
            </div>
            <div className="leading-none">
              <span
                style={{ color: dark ? "#f1f5f9" : "#0f172a" }}
                className="font-bold text-[15px] tracking-tight"
              >
                AI-Mentor
              </span>
              <span
                style={{ color: dark ? "#64748b" : "#94a3b8" }}
                className="block text-[10px] font-semibold tracking-[0.12em] uppercase mt-0.5"
              >
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
                  <div
                    style={{
                      color: active
                        ? (dark ? "#93c5fd" : "#1d4ed8")
                        : (dark ? "#94a3b8" : "#64748b"),
                      backgroundColor: active
                        ? (dark ? "rgba(59,130,246,0.12)" : "rgba(239,246,255,1)")
                        : "transparent",
                    }}
                    className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-semibold transition-all duration-200 hover:opacity-90"
                  >
                    <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                    {label}
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full"
                        style={{ backgroundColor: dark ? "#93c5fd" : "#2563eb" }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}

            {isHROrAdmin && (
              <Link to="/hr">
                <div
                  style={{
                    color: location.pathname === "/hr"
                      ? (dark ? "#c4b5fd" : "#6d28d9")
                      : (dark ? "#94a3b8" : "#64748b"),
                    backgroundColor: location.pathname === "/hr"
                      ? (dark ? "rgba(139,92,246,0.12)" : "rgba(245,243,255,1)")
                      : "transparent",
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13.5px] font-semibold transition-all duration-200"
                >
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
              style={{
                backgroundColor: dark ? "rgba(30,41,59,0.8)" : "#ffffff",
                borderColor: dark ? "rgba(100,116,139,0.5)" : "#e2e8f0",
                color: dark ? "#cbd5e1" : "#64748b",
              }}
              className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-200"
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
              style={isDemo ? {
                backgroundColor: dark ? "rgba(245,158,11,0.12)" : "#fffbeb",
                borderColor: dark ? "rgba(245,158,11,0.35)" : "#fcd34d",
                color: dark ? "#fcd34d" : "#b45309",
              } : {
                backgroundColor: dark ? "rgba(30,41,59,0.6)" : "#f8fafc",
                borderColor: dark ? "rgba(100,116,139,0.4)" : "#e2e8f0",
                color: dark ? "#64748b" : "#94a3b8",
              }}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[12px] font-semibold transition-all duration-200"
              title={isDemo ? "Demo rejim yoniq" : "Demo rejimni yoqish"}
            >
              <FlaskConical size={11} />
              <span>Demo</span>
              <div
                style={{ backgroundColor: isDemo ? "#f59e0b" : (dark ? "#334155" : "#e2e8f0") }}
                className="w-7 h-3.5 rounded-full relative transition-colors duration-200"
              >
                <motion.div
                  animate={{ x: isDemo ? 14 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-0.5 w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: "white" }}
                />
              </div>
            </motion.button>

            <div
              style={{ backgroundColor: dark ? "rgba(100,116,139,0.3)" : "#e2e8f0" }}
              className="hidden sm:block w-px h-5 mx-1"
            />

            {/* User menu */}
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-colors"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? "rgba(30,41,59,0.7)" : "#f1f5f9"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                  {user?.full_name?.[0] || "U"}
                </div>
                <div className="hidden sm:block text-left leading-none">
                  <p
                    style={{ color: dark ? "#f1f5f9" : "#1e293b" }}
                    className="text-[13px] font-semibold"
                  >
                    {user?.full_name?.split(" ")[0]}
                  </p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md mt-0.5 inline-block ${roleInfo.cls}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <ChevronDown
                  size={13}
                  style={{ color: dark ? "#64748b" : "#94a3b8" }}
                  className={`transition-transform duration-200 hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`}
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
                      style={{
                        backgroundColor: dark ? "#0f172a" : "#ffffff",
                        borderColor: dark ? "rgba(100,116,139,0.25)" : "#f1f5f9",
                      }}
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-xl overflow-hidden z-50 border"
                    >
                      <div
                        style={{
                          borderBottomColor: dark ? "rgba(100,116,139,0.2)" : "#f1f5f9",
                          background: dark
                            ? "linear-gradient(to right, rgba(15,23,42,0.8), rgba(15,23,42,0.6))"
                            : "linear-gradient(to right, #f8fafc, #ffffff)",
                        }}
                        className="px-4 py-3.5 border-b"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {user?.full_name?.[0]}
                          </div>
                          <div>
                            <p
                              style={{ color: dark ? "#f1f5f9" : "#1e293b" }}
                              className="font-semibold text-sm leading-tight"
                            >
                              {user?.full_name}
                            </p>
                            <p
                              style={{ color: dark ? "#475569" : "#94a3b8" }}
                              className="text-[11px] mt-0.5 truncate max-w-[140px]"
                            >
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        {user?.branch && (
                          <div
                            style={{ color: dark ? "#64748b" : "#94a3b8" }}
                            className="px-3 py-1.5 text-[12px] flex items-center gap-1.5"
                          >
                            <span>📍</span> {user.branch}
                          </div>
                        )}
                        <button
                          onClick={handleLogout}
                          style={{ color: dark ? "#f87171" : "#ef4444" }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold hover:bg-red-500/10 rounded-xl transition-colors mt-0.5"
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
