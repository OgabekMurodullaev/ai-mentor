import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, TrendingUp, CheckCircle, Clock,
  Plus, X, ChevronDown, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import api from "../api/axios";
import ProgressBar from "../components/ProgressBar";

const LP_LABELS = {
  CASHIER:    "Kassir",
  CREDIT:     "Kreditchi",
  OPERATIONS: "Operatsionist",
  SERVICE:    "Xizmat",
};

const LP_COLORS = {
  CASHIER:    "bg-emerald-100 text-emerald-700",
  CREDIT:     "bg-blue-100 text-blue-700",
  OPERATIONS: "bg-violet-100 text-violet-700",
  SERVICE:    "bg-orange-100 text-orange-700",
};

const STAT_CONFIG = [
  { key: "total_employees",     label: "Jami hodimlar",    Icon: Users,        color: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-600"    },
  { key: "completed_onboarding",label: "Yakunladi",        Icon: CheckCircle,  color: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600" },
  { key: "in_progress",         label: "Jarayonda",        Icon: Clock,        color: "bg-amber-500",   light: "bg-amber-50",   text: "text-amber-600"   },
  { key: "average_score",       label: "O'rtacha ball",    Icon: TrendingUp,   color: "bg-violet-500",  light: "bg-violet-50",  text: "text-violet-600"  },
];

const EMPTY_FORM = {
  email: "", full_name: "", password: "demo1234",
  position: "", department: "", branch: "",
  learning_path: "CASHIER", role: "EMPLOYEE",
};

export default function HRDashboard() {
  const [overview, setOverview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("score");

  const load = () => {
    api.get("/analytics/overview/").then((r) => setOverview(r.data));
    api.get("/analytics/employees/").then((r) => setEmployees(r.data));
  };

  useEffect(() => { load(); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/register/", form);
      setShowRegister(false);
      setForm(EMPTY_FORM);
      setSuccessMsg("Yangi hodim muvaffaqiyatli qo'shildi!");
      load();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert(err.response?.data?.email?.[0] || "Xato yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = employees
    .filter((e) => filter === "ALL" || e.learning_path === filter)
    .sort((a, b) => sortBy === "score"
      ? b.total_score - a.total_score
      : b.completion_percentage - a.completion_percentage
    );

  const chartData = [...employees]
    .sort((a, b) => b.completion_percentage - a.completion_percentage)
    .slice(0, 8)
    .map((e) => ({
      name: e.full_name.split(" ")[0],
      pct: e.completion_percentage,
      score: e.total_score,
    }));

  return (
    <div className="space-y-5">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-800">HR Dashboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">Hodimlar onboarding progressi</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowRegister(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Yangi hodim
        </motion.button>
      </motion.div>

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
          >
            <CheckCircle size={16} />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CONFIG.map(({ key, label, Icon, light, text }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="card p-4"
            >
              <div className={`w-10 h-10 ${light} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={text} />
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {typeof overview[key] === "number"
                  ? Number.isInteger(overview[key]) ? overview[key] : overview[key].toFixed(1)
                  : overview[key]}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
              <BarChart3 size={16} className="text-primary-700" />
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Onboarding bajarilishi (%)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: "12px" }}
                formatter={(v) => [`${v}%`, "Bajarilishi"]}
              />
              <Bar dataKey="pct" name="Bajarilish %" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.pct >= 70 ? "#1a3c6e" : entry.pct >= 40 ? "#3b82f6" : "#93c5fd"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Register modal */}
      <AnimatePresence>
        {showRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowRegister(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #172554 0%, #1e3a8a 60%, #1d4ed8 100%)" }}>
                <div>
                  <h3 className="font-bold text-white">Yangi hodim qo'shish</h3>
                  <p className="text-blue-300 text-xs mt-0.5">Barcha maydonlarni to'ldiring</p>
                </div>
                <button
                  onClick={() => setShowRegister(false)}
                  className="w-8 h-8 bg-white/15 hover:bg-white/25 rounded-xl flex items-center justify-center text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRegister} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "full_name", label: "F.I.Sh", placeholder: "Ali Karimov" },
                    { key: "email", label: "Email", placeholder: "ali@turonbank.uz", type: "email" },
                    { key: "position", label: "Lavozim", placeholder: "Kassir" },
                    { key: "department", label: "Bo'lim", placeholder: "Kassa bo'limi" },
                    { key: "branch", label: "Filial", placeholder: "Chilonzor filiali" },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key} className={key === "full_name" ? "col-span-2" : ""}>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                        {label}
                      </label>
                      <input
                        type={type || "text"}
                        placeholder={placeholder}
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      O'quv yo'li
                    </label>
                    <div className="relative">
                      <select
                        value={form.learning_path}
                        onChange={(e) => setForm({ ...form, learning_path: e.target.value })}
                        className="input-field appearance-none pr-8"
                      >
                        <option value="CASHIER">Kassir</option>
                        <option value="CREDIT">Kreditchi</option>
                        <option value="OPERATIONS">Operatsionist</option>
                        <option value="SERVICE">Xizmat Ko'rsatish</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {submitting
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Qo'shilmoqda...</>
                      : <><Plus size={16} /> Hodimni qo'shish</>
                    }
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowRegister(false)}
                    className="btn-ghost border border-gray-200 px-5"
                  >
                    Bekor
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employees table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card overflow-hidden"
      >
        {/* Table controls */}
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
            <Users size={16} className="text-primary-700" />
            Hodimlar ({filtered.length})
          </h3>
          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl text-xs">
              {["ALL", "CASHIER", "CREDIT", "OPERATIONS", "SERVICE"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                    filter === f
                      ? "bg-white text-primary-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f === "ALL" ? "Barchasi" : LP_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60">
                {["F.I.Sh", "Filial", "Yo'l", "Ball", "Progress", "Holat"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <motion.tr
                  key={emp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-800 to-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {emp.full_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-xs">{emp.full_name}</p>
                        <p className="text-[10px] text-gray-400">{emp.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{emp.branch}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge-pill text-[10px] ${LP_COLORS[emp.learning_path] || "bg-gray-100 text-gray-600"}`}>
                      {LP_LABELS[emp.learning_path] || emp.learning_path}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-primary-700 text-sm">{emp.total_score}</td>
                  <td className="px-5 py-3.5 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar
                          value={emp.completion_percentage}
                          height="h-1.5"
                          color="from-primary-800 to-blue-400"
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap shrink-0">
                        {emp.completion_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge-pill text-[10px] ${
                      emp.onboarding_completed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        emp.onboarding_completed ? "bg-emerald-500" : "bg-amber-400"
                      }`} />
                      {emp.onboarding_completed ? "Yakunlandi" : "Jarayonda"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Hodimlar topilmadi</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

