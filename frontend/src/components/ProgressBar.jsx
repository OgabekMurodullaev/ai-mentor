import { motion } from "framer-motion";

export default function ProgressBar({ value = 0, height = "h-3", showLabel = false, color = "from-primary-800 to-blue-500" }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progress</span>
          <span className="font-semibold text-primary-700">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          className={`${height} bg-gradient-to-r ${color} rounded-full relative overflow-hidden`}
        >
          <motion.div
            className="absolute inset-0 bg-card-shimmer"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          />
        </motion.div>
      </div>
    </div>
  );
}

