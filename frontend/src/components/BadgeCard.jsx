import { motion } from "framer-motion";

export default function BadgeCard({ badge, earned = true, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all
        ${earned
          ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-sm"
          : "bg-gray-50 border-gray-200 opacity-50 grayscale"
        }`}
    >
      {earned && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
      )}
      <div className={`text-2xl w-10 h-10 flex items-center justify-center rounded-xl
        ${earned ? "bg-amber-100" : "bg-gray-100"}`}>
        {badge.icon}
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-bold leading-none ${earned ? "text-amber-800" : "text-gray-500"}`}>
          {badge.name}
        </p>
        <p className={`text-[10px] mt-0.5 leading-tight ${earned ? "text-amber-600" : "text-gray-400"}`}>
          {badge.description}
        </p>
      </div>
    </motion.div>
  );
}
