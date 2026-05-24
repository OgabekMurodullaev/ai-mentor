import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Sparkles, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { login } from "../api/auth";
import useAuthStore from "../store/authStore";

const DEMO_ACCOUNTS = [
  { label: "HR Mutaxassis", email: "hr@turonbank.uz",      icon: "👩‍💼", role: "HR"     },
  { label: "Kassir",        email: "ali@turonbank.uz",     icon: "💼",  role: "Hodim"  },
  { label: "Kreditchi",     email: "zulfiya@turonbank.uz", icon: "🏦",  role: "Hodim"  },
];

const FEATURES = [
  { icon: "🤖", text: "AI-powered onboarding" },
  { icon: "🎯", text: "Real-time simulyator" },
  { icon: "📊", text: "Progress analytics" },
  { icon: "🏆", text: "Gamification tizimi" },
];

export default function Login() {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const setUser  = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(email, password);
      localStorage.setItem("access_token",  res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      setUser(res.data.user);
      navigate("/dashboard");
    } catch {
      setError("Email yoki parol noto'g'ri. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword("demo1234");
    setError("");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
      style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 40%, #172554 70%, #1e3a8a 100%)" }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }} />
        <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-10"
          style={{ background: "radial-gradient(ellipse, #f59e0b, transparent 60%)" }} />
        {/* dot grid */}
        <div className="absolute inset-0 bg-dots opacity-40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-[900px] flex rounded-3xl overflow-hidden shadow-2xl shadow-black/40"
      >
        {/* ── Left panel: branding ─────────────────────────────── */}
        <div
          className="hidden lg:flex flex-col justify-between w-[45%] shrink-0 p-10 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, #172554 0%, #1e3a8a 50%, #1d4ed8 100%)" }}
        >
          {/* Sheen */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-lg leading-none">AI-Mentor</p>
                <p className="text-blue-300/70 text-[11px] font-semibold tracking-widest uppercase mt-0.5">Turonbank</p>
              </div>
            </div>

            <h2 className="text-3xl font-black text-white leading-tight mb-3">
              Xush kelibsiz<br />
              <span className="text-amber-300">onboarding</span>ga!
            </h2>
            <p className="text-blue-200/70 text-sm leading-relaxed">
              Yangi hodimlar uchun AI-powered interaktiv o'quv platformasi.
            </p>
          </div>

          {/* Features */}
          <div className="relative z-10 space-y-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-base">
                  {f.icon}
                </div>
                <span className="text-blue-100/80 text-sm font-medium">{f.text}</span>
                <CheckCircle2 size={14} className="text-emerald-400 ml-auto shrink-0" />
              </motion.div>
            ))}
          </div>

          {/* Bottom badge */}
          <div className="relative z-10 flex items-center gap-2 bg-white/8 border border-white/10 rounded-2xl px-4 py-3">
            <Zap size={14} className="text-amber-300 shrink-0" />
            <p className="text-[11px] text-blue-200/80">
              <span className="font-bold text-white">Hackathon MVP</span> · Demo rejimda ishlaydi
            </p>
          </div>
        </div>

        {/* ── Right panel: form ────────────────────────────────── */}
        <div className="flex-1 bg-white flex flex-col justify-center px-8 py-10 lg:px-10">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center">
              <Sparkles size={18} className="text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-base leading-none">AI-Mentor</p>
              <p className="text-slate-400 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Turonbank</p>
            </div>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tizimga kirish</h1>
            <p className="text-slate-500 text-sm mt-1.5">Hisobingizga kiring va o'qishni boshlang</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Email manzil
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm text-slate-800
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                             bg-slate-50 hover:bg-white transition-all placeholder:text-slate-400"
                  placeholder="email@turonbank.uz"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Parol
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-11 text-sm text-slate-800
                             focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                             bg-slate-50 hover:bg-white transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-3.5 py-2.5 rounded-xl"
                >
                  <AlertCircle size={14} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 rounded-xl font-bold
                         text-[15px] hover:from-blue-600 hover:to-blue-500 transition-all disabled:opacity-60
                         flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30
                         hover:shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kirish...
                </>
              ) : (
                <>
                  Tizimga kirish
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Demo accounts */}
          <div className="mt-7 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider text-center">
              Demo hisoblar bilan kirish
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <motion.button
                  key={acc.email}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fillDemo(acc.email)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200
                             hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
                >
                  <span className="text-xl">{acc.icon}</span>
                  <span className="text-[11px] font-semibold text-slate-600 group-hover:text-blue-700 leading-tight transition-colors">
                    {acc.label}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">{acc.role}</span>
                </motion.button>
              ))}
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-2.5">
              Barcha demo parollar: <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">demo1234</span>
            </p>
          </div>

        </div>
      </motion.div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-blue-200/40 text-xs whitespace-nowrap">
        © 2026 Turonbank · AI-Mentor Onboarding Tizimi
      </p>
    </div>
  );
}
