import { useState, useEffect } from "react";
import { ArrowUpFromLine, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Onboarding() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");

    if (!isStandalone && !hasSeen) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#060D18]/70 backdrop-blur-2xl" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="liquid-glass-strong rounded-[36px] p-9 w-full max-w-sm relative overflow-hidden iridescent-border"
          >
            {/* Inner ambient light */}
            <div className="absolute inset-0 bg-gradient-to-br from-eid-accent/5 via-transparent to-eid-accent2/5 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-5 right-5 w-9 h-9 liquid-glass-subtle rounded-full flex items-center justify-center text-eid-gray hover:text-eid-dark transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-9 relative z-10">
              <h1 className="text-2xl font-bold text-eid-dark mb-2">
                Add to Home Screen
              </h1>
              <p className="text-eid-gray font-medium text-sm">
                For the best experience 💖
              </p>
            </div>

            <div className="space-y-7 mb-9 relative z-10">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-eid-gold-light to-eid-gold" />
                  <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_0_10px_rgba(212,168,83,0.3)] rounded-full" />
                  <span className="relative z-10 text-white">1</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-eid-dark text-base">
                      Tap the Share icon
                    </p>
                    <ArrowUpFromLine className="w-4 h-4 text-eid-accent" />
                  </div>
                  <p className="text-eid-gray text-sm font-medium">
                    Located at the bottom of Safari
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-eid-gold-light to-eid-gold" />
                  <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_0_10px_rgba(212,168,83,0.3)] rounded-full" />
                  <span className="relative z-10 text-white">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-eid-dark text-base mb-1">
                    Scroll and tap 'Add to Home Screen'
                  </p>
                  <p className="text-eid-gray text-sm font-medium">
                    Find it in the list of share options
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <button
                onClick={handleDismiss}
                className="w-full py-4 rounded-[20px] font-bold text-base text-white active:scale-95 transition-transform relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-eid-accent via-eid-accent2 to-eid-rose" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_4px_16px_rgba(110,193,228,0.3)] rounded-[20px]" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
                <span className="relative z-10">I've Added It</span>
              </button>
              <button className="text-eid-gray font-semibold text-sm hover:text-eid-dark transition-colors py-1">
                Why?
              </button>
            </div>
          </motion.div>

          {/* Bottom indicator arrow */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-10 flex flex-col items-center gap-3 relative z-10"
          >
            <div className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center backdrop-blur-sm">
              <div className="w-2 h-2 bg-white/50 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.3)]" />
            </div>
            <svg
              width="36"
              height="50"
              viewBox="0 0 40 60"
              fill="none"
              className="text-white/20"
            >
              <path
                d="M20 0V40M20 40L10 30M20 40L30 30"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
