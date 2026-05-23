import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Bot, Monitor, Trophy, LayoutDashboard,
  Users, ChevronDown, Sparkles,
} from "lucide-react";
import { useState } from "react";
import useAuthStore from "../store/authStore";

const NAV_ITEMS = [
  { to: "/dashboard",   icon: LayoutDashboard, label: "Dashboard" },
  { to: "/chatbot",     icon: Bot,             label: "AI Chatbot" },
  { to: "/simulator",   icon: Monitor,         label: "Simulyator" },
  { to: "/leaderboard", icon: Trophy,          label: "Reyting" },
];

const ROLE_LABELS = {
  EMPLOYEE: { label: "Hodim",  cls: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" },
  HR:       { label: "HR",     cls: "bg-violet-500/20 text-violet-300 border border-violet-500/30" },
  ADMIN:    { label: "Admin",  cls: "bg-rose-500/20 text-rose-300 border border-rose-500/30" },
};

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const isHROrAdmin = user?.role === "HR" || user?.role === "ADMIN";
  const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS.EMPLOYEE;

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/10"
      style={{ background: "linear-gradient(135deg, #172554 0%, #1e3a8a 60%, #1d4ed8 100%)" }}
    >
      {/* subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-glow-gold/50">
              <Sparkles size={15} className="text-navy-dark" />
            </div>
            <div className="leading-none">
              <span className="font-bold text-white text-[15px] tracking-tight">AI-Mentor</span>
              <span className="block text-[10px] text-blue-300/80 font-medium tracking-wide">TURONBANK</span>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
              const active = location.pathname === to;
              return (
                <Link key={to} to={to}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${active
                        ? "text-white bg-white/12"
                        : "text-blue-200/80 hover:text-white hover:bg-white/8"
                      }`}
                  >
                    <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                    {label}
                    {active && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-white/12 -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    {active && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-gold" />
                    )}
                  </motion.div>
                </Link>
              );
            })}
            {isHROrAdmin && (
              <Link to="/hr">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${location.pathname === "/hr"
                      ? "text-white bg-white/12"
                      : "text-blue-200/80 hover:text-white hover:bg-white/8"
                    }`}
                >
                  <Users size={14} />
                  HR Panel
                </motion.div>
              </Link>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-navy-dark font-bold text-xs shrink-0 shadow-sm">
                {user?.full_name?.[0] || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-white text-xs font-semibold leading-none">{user?.full_name?.split(" ")[0]}</p>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md mt-0.5 inline-block ${roleInfo.cls}`}>
                  {roleInfo.label}
                </span>
              </div>
              <ChevronDown size={13} className={`text-blue-300/70 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
                >
                  <div className="px-4 py-3.5 border-b border-slate-50 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center text-white font-bold text-sm">
                        {user?.full_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{user?.full_name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[140px]">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    {user?.branch && (
                      <div className="px-3 py-1.5 text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="text-base">📍</span> {user.branch}
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1"
                    >
                      <LogOut size={14} />
                      Chiqish
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
