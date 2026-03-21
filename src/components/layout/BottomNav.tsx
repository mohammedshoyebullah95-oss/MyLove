import { Castle, Sparkles, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BottomNav() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isMemories = location.pathname === "/memories";
  const isJourney = location.pathname === "/journey";

  const tabs = [
    { path: "/", label: "HOME", icon: Castle, active: isHome, glow: "rgba(110,193,228,0.15)" },
    { path: "/memories", label: "MEMORIES", icon: Heart, active: isMemories, glow: "rgba(255,107,157,0.15)" },
    { path: "/journey", label: "JOURNEY", icon: Sparkles, active: isJourney, glow: "rgba(167,139,250,0.15)" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 liquid-glass-subtle border-t border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.2)]">
      <div className="flex justify-between items-center max-w-md mx-auto px-4 pt-3 pb-safe">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl transition-all duration-500 relative group"
            )}
          >
            {tab.active && (
              <motion.div
                layoutId="nav-active"
                className="absolute inset-0 rounded-2xl -z-0 overflow-hidden"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl" />
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    boxShadow: `inset 0 1px 2px rgba(255,255,255,0.2), 0 0 20px ${tab.glow}`,
                  }}
                />
              </motion.div>
            )}
            <tab.icon
              className={cn(
                "w-5 h-5 relative z-10 transition-all duration-300",
                tab.active
                  ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                  : "text-eid-gray group-hover:text-eid-dark"
              )}
            />
            <span
              className={cn(
                "text-[9px] font-bold tracking-[0.12em] relative z-10 uppercase transition-colors duration-300",
                tab.active
                  ? "text-white/90"
                  : "text-eid-gray group-hover:text-eid-dark"
              )}
            >
              {tab.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
