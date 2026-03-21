import { useState } from "react";
import { ShieldCheck, AlertCircle, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface Goal {
  id: string;
  text: string;
  achieved: boolean;
}

export function TesterAgent() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const isAdmin = user?.email === "mohammedshoyebullah95@gmail.com";

  const [goals] = useState<Goal[]>([
    { id: "1", text: "High Quality UI", achieved: true },
    { id: "2", text: "Liquid Glass Style", achieved: true },
    { id: "3", text: "Responsive Design", achieved: true },
    { id: "4", text: "Animated Background", achieved: true },
    { id: "5", text: "Elegant Typography", achieved: true },
  ]);

  const [isChecking, setIsChecking] = useState(false);

  if (!isAdmin) return null;

  const handleCheck = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
    }, 2000);
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="liquid-glass-strong mb-3 p-4 rounded-2xl w-60 iridescent-border"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-eid-accent" />
                <span className="font-bold text-sm text-eid-dark/90">
                  Tester Agent
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-eid-gray hover:text-eid-dark transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-2.5">
                  {goal.achieved ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span
                    className={`text-xs ${goal.achieved ? "text-eid-dark/80" : "text-eid-gray"}`}
                  >
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleCheck}
              disabled={isChecking}
              className="w-full mt-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-eid-accent/20 to-eid-accent2/20" />
              <div className="absolute inset-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-xl border border-white/10" />
              <span className="relative z-10 text-eid-dark/80">
                {isChecking ? "Checking UI..." : "Run UI Audit"}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 rounded-full shadow-lg flex items-center justify-center relative overflow-hidden group"
      >
        <div className="absolute inset-0 liquid-glass" />
        <div className="absolute inset-0 bg-gradient-to-br from-eid-accent/20 to-eid-accent2/10 opacity-60" />
        <ShieldCheck className="w-5 h-5 text-eid-dark/70 relative z-10 group-hover:text-eid-dark transition-colors" />
      </motion.button>
    </div>
  );
}
