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
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    initFromStorage();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-700 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 text-sm">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

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

