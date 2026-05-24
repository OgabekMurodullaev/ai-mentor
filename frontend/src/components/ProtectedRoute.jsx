import { Navigate, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import useAuthStore from "../store/authStore";
import useThemeStore from "../store/themeStore";
import Navbar from "./Navbar";

/* ── Slow-moving premium blobs for dark mode ──────────────── */
function GlobalDarkBg() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Blob 1 — deep blue, top-left */}
      <motion.div
        animate={{ x: [0, 90, -45, 25, 0], y: [0, -65, 90, -30, 0], scale: [1, 1.22, 0.87, 1.07, 1] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-72 -left-72 w-[1000px] h-[1000px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(29,78,216,0.11), transparent 65%)" }}
      />
      {/* Blob 2 — indigo, top-right */}
      <motion.div
        animate={{ x: [0, -85, 55, -30, 0], y: [0, 75, -65, 50, 0], scale: [1, 0.84, 1.16, 0.93, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 9 }}
        className="absolute -top-40 right-[-180px] w-[800px] h-[800px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(79,70,229,0.09), transparent 65%)" }}
      />
      {/* Blob 3 — teal, bottom-left */}
      <motion.div
        animate={{ x: [0, 65, -75, 35, 0], y: [0, -95, 55, 75, 0], scale: [1, 1.12, 0.91, 1.09, 1] }}
        transition={{ duration: 44, repeat: Infinity, ease: "easeInOut", delay: 18 }}
        className="absolute bottom-[-180px] left-[15%] w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(13,148,136,0.07), transparent 65%)" }}
      />
      {/* Blob 4 — purple, center */}
      <motion.div
        animate={{ x: [0, -50, 65, -22, 0], y: [0, 55, -45, 60, 0], scale: [1, 1.07, 0.93, 1.05, 1] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut", delay: 25 }}
        className="absolute top-[38%] right-[20%] w-[550px] h-[550px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(126,34,206,0.06), transparent 65%)" }}
      />
      {/* Blob 5 — amber accent, bottom-right */}
      <motion.div
        animate={{ x: [0, -35, 45, -15, 0], y: [0, -45, 35, -55, 0], scale: [1, 1.05, 0.95, 1.03, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 13 }}
        className="absolute bottom-[5%] right-[5%] w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(217,119,6,0.05), transparent 65%)" }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const dark            = useThemeStore((s) => s.dark);
  const location        = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen relative transition-colors duration-300">
      {/* Global animated background — only in dark mode */}
      {dark && <GlobalDarkBg />}

      {/* Content layer */}
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
