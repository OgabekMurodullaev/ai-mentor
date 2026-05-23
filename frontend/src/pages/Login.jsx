import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Sparkles, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { login } from "../api/auth";
import useAuthStore from "../store/authStore";

const DEMO_ACCOUNTS = [
  { label: "HR Mutaxassis", email: "hr@turonbank.uz", icon: "👩‍💼" },
  { label: "Kassir", email: "ali@turonbank.uz", icon: "💼" },
  { label: "Kreditchi", email: "zulfiya@turonbank.uz", icon: "🏦" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(email, password);
      localStorage.setItem("access_token", res.data.access);
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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #172554 0%, #1e3a8a 60%, #1d4ed8 100%)" }} />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${120 + i * 80}px`,
              height: `${120 + i * 80}px`,
              background: i % 2 === 0
                ? "radial-gradient(circle, #e8b84b, transparent)"
                : "radial-gradient(circle, #60a5fa, transparent)",
              left: `${[10, 60, 80, 20, 50, 90][i]}%`,
              top: `${[20, 70, 30, 80, 10, 60][i]}%`,
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -30, 20, 0],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md mx-auto px-4">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #172554 0%, #1e3a8a 60%, #1d4ed8 100%)" }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 70% 30%, #e8b84b 0%, transparent 60%)" }} />
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              <Sparkles size={28} className="text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white tracking-tight"
            >
              AI-Mentor
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200 text-sm mt-1"
            >
              Turonbank onboarding tizimi
            </motion.p>
          </div>

          {/* Form */}
          <div className="px-8 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="email@turonbank.uz"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Parol
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                    className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-3 py-2.5 rounded-xl"
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
                className="w-full bg-primary-700 text-white py-3 rounded-xl font-semibold
                           hover:bg-primary-800 transition-all disabled:opacity-60
                           flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
            <div className="mt-6">
              <p className="text-xs text-center text-gray-400 mb-3 font-medium uppercase tracking-wide">
                Demo hisoblar
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <motion.button
                    key={acc.email}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => fillDemo(acc.email)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-xl border border-gray-100
                               hover:border-primary-200 hover:bg-primary-50 transition-all text-center"
                  >
                    <span className="text-xl">{acc.icon}</span>
                    <span className="text-[10px] font-medium text-gray-600 leading-tight">
                      {acc.label}
                    </span>
                  </motion.button>
                ))}
              </div>
              <p className="text-center text-[10px] text-gray-400 mt-2">
                Parol: <span className="font-mono font-medium">demo1234</span>
              </p>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-blue-200/60 text-xs mt-6">
          © 2024 Turonbank · AI-Mentor Onboarding Tizimi
        </p>
      </div>
    </div>
  );
}

