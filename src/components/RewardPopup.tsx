import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Heart, Sparkles } from "lucide-react";

interface RewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  reward: number;
  message: string;
}

export function RewardPopup({ isOpen, onClose, reward, message }: RewardPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-eid-dark/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm liquid-glass-strong rounded-[32px] p-8 text-center relative overflow-hidden iridescent-border"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-eid-gold/10 via-transparent to-eid-accent/10 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-eid-gold/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-eid-accent/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-eid-gold to-eid-gold-dark rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(212,168,83,0.4)] rotate-12">
                <Gift className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-pink-900 mb-2">Congratulations!</h2>
              <p className="text-eid-gray font-medium mb-6">You've unlocked a festive blessing</p>

              <div className="liquid-glass-subtle rounded-2xl p-6 mb-8 border border-white/20">
                <div className="text-4xl font-black text-eid-gold mb-2 drop-shadow-[0_0_10px_rgba(212,168,83,0.3)]">
                  ${reward}
                </div>
                <div className="text-sm font-bold text-eid-accent uppercase tracking-widest">
                  Reward Earned
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-eid-rose mb-8">
                <Heart className="w-5 h-5 fill-current" />
                <span className="font-serif italic text-lg">{message}</span>
                <Heart className="w-5 h-5 fill-current" />
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 bg-gradient-to-r from-eid-gold to-eid-gold-dark rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all"
              >
                Amazing!
              </button>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-gray-400 hover:text-red-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
