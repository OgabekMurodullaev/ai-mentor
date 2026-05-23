# AI-Mentor: Turonbank — Frontend Prompt (Claude Code)

Sen React frontend dasturchisisisan. Quyidagi loyihani to'liq yozib ber.

---

## Texnologiyalar

- React 18 + Vite
- Tailwind CSS
- Framer Motion (animatsiyalar)
- Zustand (state management)
- Axios (API so'rovlar)
- React Router v6
- Recharts (grafiklar)
- Lucide React (ikonlar)

---

## package.json dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "framer-motion": "^10.16.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "vite": "^5.0.0"
  }
}
```

---

## vite.config.js

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
```

---

## Loyiha Strukturasi

```
frontend/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── pages/
    │   ├── Login.jsx
    │   ├── Dashboard.jsx
    │   ├── Chatbot.jsx
    │   ├── Simulator.jsx
    │   ├── Leaderboard.jsx
    │   └── HRDashboard.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   ├── VoiceAssistant.jsx
    │   ├── DifficultClient.jsx
    │   ├── BadgeCard.jsx
    │   ├── ProgressBar.jsx
    │   └── ProtectedRoute.jsx
    ├── store/
    │   ├── authStore.js
    │   ├── chatStore.js
    │   └── progressStore.js
    └── api/
        ├── axios.js
        ├── auth.js
        ├── voice.js
        ├── chat.js
        ├── simulator.js
        └── gamification.js
```

---

## src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #1a3c6e;
  --secondary: #e8b84b;
  --accent: #2563eb;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: #f1f5f9;
}
```

---

## tailwind.config.js

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a3c6e",
        secondary: "#e8b84b",
      },
    },
  },
  plugins: [],
};
```

---

## src/api/axios.js

```js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post("/api/auth/refresh/", { refresh });
          localStorage.setItem("access_token", res.data.access);
          error.config.headers.Authorization = `Bearer ${res.data.access}`;
          return axios(error.config);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## src/api/auth.js

```js
import api from "./axios";

export const login = (email, password) =>
  api.post("/auth/login/", { email, password });

export const getMe = () => api.get("/auth/me/");

export const registerEmployee = (data) =>
  api.post("/auth/register/", data);
```

---

## src/api/voice.js

```js
import api from "./axios";

export const sendSTT = (audioBlob) => {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.wav");
  return api.post("/voice/stt/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const sendTTS = (text, voiceType = "mentor") =>
  api.post("/voice/tts/", { text, voice_type: voiceType });

export const sendVoiceChat = (audioBlob, voiceType = "mentor") => {
  const form = new FormData();
  form.append("audio", audioBlob, "recording.wav");
  form.append("voice_type", voiceType);
  return api.post("/voice/voice-chat/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

---

## src/api/chat.js

```js
import api from "./axios";

export const askChatbot = (question) =>
  api.post("/chatbot/ask/", { question });

export const getChatHistory = () =>
  api.get("/chatbot/history/");
```

---

## src/api/gamification.js

```js
import api from "./axios";

export const getProgress = () => api.get("/gamification/progress/");
export const getLeaderboard = () => api.get("/gamification/leaderboard/");
export const getBadges = () => api.get("/gamification/badges/");
```

---

## src/api/simulator.js

```js
import api from "./axios";

export const getScenarios = () => api.get("/simulator/scenarios/");
export const startScenario = (id) => api.post("/simulator/start/", { scenario_id: id });
export const submitAnswer = (data) => api.post("/simulator/submit/", data);
export const getDifficultClientResponse = (data) =>
  api.post("/simulator/difficult-client/", data);
```

---

## src/store/authStore.js

```js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, isAuthenticated: false });
  },

  initFromStorage: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const { getMe } = await import("../api/auth");
      const res = await getMe();
      set({ user: res.data, isAuthenticated: true });
    } catch {
      localStorage.clear();
    }
  },
}));

export default useAuthStore;
```

---

## src/store/progressStore.js

```js
import { create } from "zustand";

const useProgressStore = create((set) => ({
  progress: null,
  leaderboard: [],
  badges: [],

  setProgress: (progress) => set({ progress }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setBadges: (badges) => set({ badges }),
}));

export default useProgressStore;
```

---

## src/store/chatStore.js

```js
import { create } from "zustand";

const useChatStore = create((set) => ({
  messages: [],

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  clearMessages: () => set({ messages: [] }),
}));

export default useChatStore;
```

---

## src/App.jsx

```jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import Simulator from "./pages/Simulator";
import Leaderboard from "./pages/Leaderboard";
import HRDashboard from "./pages/HRDashboard";

export default function App() {
  const initFromStorage = useAuthStore((s) => s.initFromStorage);

  useEffect(() => {
    initFromStorage();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/hr" element={<HRDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## src/components/ProtectedRoute.jsx

```jsx
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Navbar from "./Navbar";

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
```

---

## src/components/Navbar.jsx

```jsx
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Bot, Monitor, Trophy, LayoutDashboard, Users } from "lucide-react";
import useAuthStore from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/turonbank-logo.png" alt="Turonbank" className="h-8"
            onError={(e) => { e.target.style.display = "none"; }} />
          <span className="font-bold text-lg">AI-Mentor</span>
        </div>

        <div className="flex items-center gap-1">
          <NavLink to="/dashboard" icon={<LayoutDashboard size={16} />} label="Bosh sahifa" />
          <NavLink to="/chatbot" icon={<Bot size={16} />} label="AI Chatbot" />
          <NavLink to="/simulator" icon={<Monitor size={16} />} label="Simulyator" />
          <NavLink to="/leaderboard" icon={<Trophy size={16} />} label="Reyting" />
          {user?.role === "HR" || user?.role === "ADMIN" ? (
            <NavLink to="/hr" icon={<Users size={16} />} label="HR Panel" />
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-blue-200">{user?.full_name}</span>
          <button onClick={handleLogout}
            className="flex items-center gap-1 text-sm hover:text-secondary transition-colors">
            <LogOut size={16} /> Chiqish
          </button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link to={to}
      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm hover:bg-white/10 transition-colors">
      {icon} {label}
    </Link>
  );
}
```

---

## src/pages/Login.jsx

```jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { login } from "../api/auth";
import useAuthStore from "../store/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError("Email yoki parol noto'g'ri");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🏦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">AI-Mentor</h1>
          <p className="text-gray-500 text-sm mt-1">Turonbank onboarding tizimi</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="email@turonbank.uz" required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••" required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60">
            {loading ? "Kirish..." : "Kirish"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Demo: ali@turonbank.uz / demo1234
        </p>
      </motion.div>
    </div>
  );
}
```

---

## src/pages/Dashboard.jsx

```jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, Monitor, Trophy, TrendingUp } from "lucide-react";
import { getProgress } from "../api/gamification";
import useAuthStore from "../store/authStore";
import ProgressBar from "../components/ProgressBar";
import BadgeCard from "../components/BadgeCard";

const LEARNING_PATH_LABELS = {
  CASHIER: "Kassir yo'li",
  CREDIT: "Kreditchi yo'li",
  OPERATIONS: "Operatsionist yo'li",
  SERVICE: "Xizmat ko'rsatish yo'li",
};

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    getProgress().then((res) => setProgress(res.data));
  }, []);

  const cards = [
    { to: "/chatbot", icon: <Bot size={28} />, label: "AI Chatbot", desc: "Bank qoidalari bo'yicha savol ber", color: "bg-blue-500" },
    { to: "/simulator", icon: <Monitor size={28} />, label: "Simulyator", desc: "Mijoz xizmat ko'rsatishni mashq qil", color: "bg-emerald-500" },
    { to: "/leaderboard", icon: <Trophy size={28} />, label: "Reyting", desc: "Hamkasblar orasidagi o'rning", color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Salom banner */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl p-6">
        <h2 className="text-2xl font-bold">Xush kelibsiz, {user?.full_name}! 👋</h2>
        <p className="text-blue-200 mt-1">{LEARNING_PATH_LABELS[user?.learning_path] || "Onboarding"}</p>
        <div className="mt-4 flex gap-4">
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-bold">{progress?.total_score || 0}</div>
            <div className="text-xs text-blue-200">Ball</div>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-bold">{progress?.completed_quests || 0}</div>
            <div className="text-xs text-blue-200">Kvest</div>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-center">
            <div className="text-2xl font-bold">{progress?.current_streak || 0}🔥</div>
            <div className="text-xs text-blue-200">Streak</div>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      {progress && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} className="text-primary" />
            <h3 className="font-semibold text-gray-800">Onboarding progressi</h3>
          </div>
          <ProgressBar value={progress.completion_percentage} />
          <p className="text-sm text-gray-500 mt-2">{progress.completion_percentage}% bajarildi</p>
        </motion.div>
      )}

      {/* Menyu kartochkalari */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <motion.div key={card.to} initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Link to={card.to}
              className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
              <div className={`${card.color} text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                {card.icon}
              </div>
              <h3 className="font-bold text-gray-800">{card.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Nishonlar */}
      {progress?.badges?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Mening nishonlarim 🏅</h3>
          <div className="flex flex-wrap gap-3">
            {progress.badges.map((badge, i) => (
              <BadgeCard key={i} badge={badge} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
```

---

## src/components/VoiceAssistant.jsx

```jsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { sendVoiceChat } from "../api/voice";

export default function VoiceAssistant({ onTranscript, onResponse, voiceType = "mentor" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        stream.getTracks().forEach((t) => t.stop());
        await handleSend(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch {
      alert("Mikrofonga ruxsat bering");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleSend = async (blob) => {
    setIsLoading(true);
    try {
      const res = await sendVoiceChat(blob, voiceType);
      const { user_text, bot_response, audio_url } = res.data;

      onTranscript?.(user_text);
      onResponse?.(bot_response);

      // Avtomatik audio ijro
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(audio_url);
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
    } catch {
      alert("Xato yuz berdi. Qayta urining.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={isLoading}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all
          ${isRecording ? "bg-red-500 scale-110" : "bg-primary hover:bg-blue-700"}
          ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div key="rec" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <MicOff size={32} />
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Mic size={32} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <p className="text-sm text-gray-500">
        {isRecording ? "🔴 Gapiryapsiz... (qo'yib yuboring)" :
         isLoading ? "⏳ Javob tayyorlanmoqda..." :
         isPlaying ? <span className="flex items-center gap-1"><Volume2 size={14} /> Ovoz ijro etilmoqda...</span> :
         "Bosib turing va gapiring"}
      </p>

      {/* Zarbalar animatsiyasi */}
      {isRecording && (
        <div className="flex gap-1 items-end h-8">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i}
              animate={{ height: [8, 24, 8] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
              className="w-2 bg-red-400 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## src/pages/Chatbot.jsx

```jsx
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot } from "lucide-react";
import { askChatbot } from "../api/chat";
import { sendTTS } from "../api/voice";
import useChatStore from "../store/chatStore";
import VoiceAssistant from "../components/VoiceAssistant";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { messages, addMessage } = useChatStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    addMessage({ role: "user", text });
    setInput("");
    setLoading(true);
    try {
      const res = await askChatbot(text);
      const answer = res.data.answer;
      addMessage({ role: "bot", text: answer });

      // TTS bilan ovozli javob
      const ttsRes = await sendTTS(answer, "mentor");
      const audio = new Audio(ttsRes.data.audio_url);
      audio.play();
    } catch {
      addMessage({ role: "bot", text: "Xato yuz berdi. Qayta urining." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800">Zulfiya — AI Mentor</h2>
          <p className="text-xs text-green-500">● Onlayn | Bank qoidalari bo'yicha yordam beradi</p>
        </div>
      </div>

      {/* Xabarlar */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            <Bot size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Salom! Men Zulfiya, sizning AI-mentoringizman.</p>
            <p className="text-sm mt-1">Bank qoidalari, ish tartibi haqida so'rang.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm
              ${msg.role === "user"
                ? "bg-primary text-white rounded-br-none"
                : "bg-white text-gray-800 shadow-sm rounded-bl-none"}`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-2 h-2 bg-gray-400 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Ovozli assistent */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
        <VoiceAssistant
          voiceType="mentor"
          onTranscript={(text) => setInput(text)}
          onResponse={(text) => addMessage({ role: "bot", text })}
        />
      </div>

      {/* Matnli input */}
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Savol yozing yoki mikrofondan gapiring..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
          className="bg-primary text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
```

---

## src/components/DifficultClient.jsx

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { getDifficultClientResponse } from "../api/simulator";

export default function DifficultClient({ scenario, onComplete }) {
  const [history, setHistory] = useState([]);
  const [clientText, setClientText] = useState(scenario.steps[0]?.client_message || "");
  const [clientAudio, setClientAudio] = useState(null);
  const [employeeInput, setEmployeeInput] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Dastlabki mijoz ovozini yuklash
  useState(() => {
    import("../api/voice").then(({ sendTTS }) => {
      sendTTS(clientText, "difficult_client").then((res) => {
        const audio = new Audio(res.data.audio_url);
        audio.play();
      });
    });
  });

  const handleSend = async () => {
    if (!employeeInput.trim() || loading) return;
    setLoading(true);

    const currentStep = scenario.steps[step];
    const keywords = currentStep?.correct_answer_keywords || [];
    const isCorrect = keywords.some((kw) => employeeInput.toLowerCase().includes(kw.toLowerCase()));
    const earnedScore = isCorrect ? currentStep.score : Math.floor(currentStep.score * 0.3);
    setScore((s) => s + earnedScore);

    const newHistory = [...history, { employee: employeeInput, client: clientText }];
    setHistory(newHistory);

    const nextStep = step + 1;
    if (nextStep >= scenario.steps.length) {
      setFinished(true);
      setLoading(false);
      return;
    }

    try {
      const res = await getDifficultClientResponse({
        scenario: scenario.description,
        employee_message: employeeInput,
        history: newHistory,
      });
      setClientText(res.data.client_text);
      setClientAudio(res.data.audio_url);

      const audio = new Audio(res.data.audio_url);
      audio.play();
      setStep(nextStep);
      setEmployeeInput("");
    } catch {
      setClientText("Uzr, texnik muammo. Davom eting.");
    } finally {
      setLoading(false);
    }
  };

  if (finished) {
    return (
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="text-center py-10">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-gray-800">Siz muvaffaqiyatli o'tdingiz!</h3>
        <p className="text-gray-500 mt-2">Jami ball: <span className="font-bold text-primary">{score}</span> / {scenario.max_score}</p>
        <button onClick={() => onComplete(score)}
          className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
          Natijani saqlash
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mijoz xabari */}
      <motion.div key={step} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">😤</span>
          <span className="font-semibold text-gray-700">Mijoz:</span>
        </div>
        <p className="text-gray-800">{clientText}</p>
      </motion.div>

      {/* Tarix */}
      {history.map((h, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-end">
            <div className="bg-primary text-white px-4 py-2 rounded-2xl rounded-br-none text-sm max-w-[70%]">
              {h.employee}
            </div>
          </div>
        </div>
      ))}

      {/* Hodim javobi */}
      <div className="flex gap-2">
        <input value={employeeInput} onChange={(e) => setEmployeeInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Mijozga javob bering..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        <button onClick={handleSend} disabled={loading || !employeeInput.trim()}
          className="bg-primary text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? "..." : "Yuborish"}
        </button>
      </div>

      <div className="text-right text-sm text-gray-400">
        Qadam {step + 1} / {scenario.steps.length} | Ball: {score}
      </div>
    </div>
  );
}
```

---

## src/pages/Simulator.jsx

```jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, ChevronRight } from "lucide-react";
import { getScenarios } from "../api/simulator";
import { getProgress } from "../api/gamification";
import api from "../api/axios";
import DifficultClient from "../components/DifficultClient";

const DIFFICULTY_COLORS = {
  EASY: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HARD: "bg-red-100 text-red-700",
};

const DIFFICULTY_LABELS = { EASY: "Oson", MEDIUM: "O'rta", HARD: "Qiyin" };

export default function Simulator() {
  const [scenarios, setScenarios] = useState([]);
  const [active, setActive] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    getScenarios().then((res) => setScenarios(res.data));
  }, []);

  const handleComplete = async (score) => {
    setFinalScore(score);
    setCompleted(true);
    await api.post("/simulator/submit/", {
      scenario_id: active.id,
      score,
      max_score: active.max_score,
      time_spent_seconds: 120,
    });
  };

  if (active && !completed) {
    return (
      <div>
        <button onClick={() => setActive(null)}
          className="mb-4 text-sm text-primary hover:underline flex items-center gap-1">
          ← Orqaga
        </button>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-xl text-gray-800 mb-2">{active.title}</h2>
          <p className="text-gray-500 text-sm mb-6">{active.description}</p>
          <DifficultClient scenario={active} onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white rounded-2xl p-10 shadow-sm text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-gray-800">Stsenariy yakunlandi!</h2>
        <p className="text-gray-500 mt-2">Ball: <span className="text-primary font-bold text-xl">{finalScore}</span></p>
        <button onClick={() => { setActive(null); setCompleted(false); }}
          className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-semibold">
          Boshqa stsenariy
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Monitor size={24} className="text-primary" />
        <h2 className="text-xl font-bold text-gray-800">ABS/CRM Simulyator</h2>
      </div>

      {scenarios.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <button onClick={() => setActive(s)}
            className="w-full bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[s.difficulty]}`}>
                  {DIFFICULTY_LABELS[s.difficulty]}
                </span>
                <span className="text-xs text-gray-400">{s.scenario_type}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{s.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.description}</p>
              <p className="text-xs text-primary mt-2">Max ball: {s.max_score}</p>
            </div>
            <ChevronRight size={20} className="text-gray-400 group-hover:text-primary transition-colors" />
          </button>
        </motion.div>
      ))}
    </div>
  );
}
```

---

## src/pages/Leaderboard.jsx

```jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { getLeaderboard } from "../api/gamification";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getLeaderboard().then((res) => setData(res.data));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Trophy size={24} className="text-secondary" />
        <h2 className="text-xl font-bold text-gray-800">Reyting jadvali</h2>
      </div>

      {data.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
          className={`bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4
            ${item.is_current_user ? "ring-2 ring-primary" : ""}`}>
          <div className="text-2xl w-10 text-center">
            {i < 3 ? MEDAL[i] : <span className="text-gray-400 font-bold">#{item.rank}</span>}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{item.full_name}</p>
              {item.is_current_user && (
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">Siz</span>
              )}
            </div>
            <p className="text-xs text-gray-400">{item.branch}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary text-lg">{item.total_score}</p>
            <p className="text-xs text-gray-400">{item.completion_percentage}%</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

---

## src/pages/HRDashboard.jsx

```jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/axios";

export default function HRDashboard() {
  const [overview, setOverview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ email: "", full_name: "", password: "demo1234",
    position: "", department: "", branch: "", learning_path: "CASHIER", role: "EMPLOYEE" });

  useEffect(() => {
    api.get("/analytics/overview/").then((r) => setOverview(r.data));
    api.get("/analytics/employees/").then((r) => setEmployees(r.data));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    await api.post("/auth/register/", form);
    setShowRegister(false);
    api.get("/analytics/employees/").then((r) => setEmployees(r.data));
  };

  const stats = overview ? [
    { label: "Jami hodimlar", value: overview.total_employees, icon: <Users size={20} />, color: "bg-blue-500" },
    { label: "Onboarding yakunladi", value: overview.completed_onboarding, icon: <CheckCircle size={20} />, color: "bg-green-500" },
    { label: "Jarayonda", value: overview.in_progress, icon: <Clock size={20} />, color: "bg-orange-500" },
    { label: "O'rtacha ball", value: overview.average_score, icon: <TrendingUp size={20} />, color: "bg-purple-500" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">HR Dashboard</h2>
        <button onClick={() => setShowRegister(!showRegister)}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          + Yangi hodim
        </button>
      </div>

      {/* Statistika kartochkalari */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm">
            <div className={`${s.color} text-white w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Grafik */}
      {employees.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Hodimlar progressi</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={employees.slice(0, 8)}>
              <XAxis dataKey="full_name" tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.split(" ")[0]} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="completion_percentage" fill="#1a3c6e" radius={[4, 4, 0, 0]}
                name="Bajarilish %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Yangi hodim formasi */}
      {showRegister && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Yangi hodim qo'shish</h3>
          <form onSubmit={handleRegister} className="grid grid-cols-2 gap-3">
            {[
              { key: "full_name", label: "F.I.Sh", placeholder: "Ali Karimov" },
              { key: "email", label: "Email", placeholder: "ali@turonbank.uz", type: "email" },
              { key: "position", label: "Lavozim", placeholder: "Kassir" },
              { key: "department", label: "Bo'lim", placeholder: "Kassa bo'limi" },
              { key: "branch", label: "Filial", placeholder: "Chilonzor filiali" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-gray-600 mb-1 block">{f.label}</label>
                <input type={f.type || "text"} placeholder={f.placeholder}
                  value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-600 mb-1 block">O'quv yo'li</label>
              <select value={form.learning_path}
                onChange={(e) => setForm({ ...form, learning_path: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="CASHIER">Kassir</option>
                <option value="CREDIT">Kreditchi</option>
                <option value="OPERATIONS">Operatsionist</option>
                <option value="SERVICE">Xizmat Ko'rsatish</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-2 mt-2">
              <button type="submit"
                className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Qo'shish
              </button>
              <button type="button" onClick={() => setShowRegister(false)}
                className="border border-gray-200 px-6 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                Bekor qilish
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Hodimlar jadvali */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["F.I.Sh", "Bo'lim", "Filial", "Ball", "Bajarilish", "Holat"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, i) => (
              <tr key={emp.id} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                <td className="px-4 py-3 font-medium text-gray-800">{emp.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{emp.department}</td>
                <td className="px-4 py-3 text-gray-500">{emp.branch}</td>
                <td className="px-4 py-3 font-semibold text-primary">{emp.total_score}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${emp.completion_percentage}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{emp.completion_percentage}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${emp.onboarding_completed
                    ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {emp.onboarding_completed ? "Yakunlandi" : "Jarayonda"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## src/components/BadgeCard.jsx

```jsx
export default function BadgeCard({ badge }) {
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
      <span className="text-2xl">{badge.icon}</span>
      <div>
        <p className="text-xs font-semibold text-amber-800">{badge.name}</p>
        <p className="text-xs text-amber-600">{badge.description}</p>
      </div>
    </div>
  );
}
```

---

## src/components/ProgressBar.jsx

```jsx
import { motion } from "framer-motion";

export default function ProgressBar({ value }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
      />
    </div>
  );
}
```

---

## Ishga Tushirish

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173 da ochiladi
```

---

## Muhim Eslatmalar

1. Vite proxy orqali `/api` → `http://localhost:8000` ga yo'naltiriladi (CORS muammo yo'q)
2. JWT token `localStorage` da saqlanadi
3. VoiceAssistant — `onMouseDown/onMouseUp` bilan ishlaydi (mobil uchun `onTouchStart/onTouchEnd` ham bor)
4. Audio avtomatik ijro etiladi — brauzer ruxsati talab qilinishi mumkin
5. Barcha sahifalar JWT bo'lmasa `/login` ga yo'naltiradi
6. Demo login: `ali@turonbank.uz` / `demo1234`
