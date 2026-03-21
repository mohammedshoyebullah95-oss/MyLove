import { motion, AnimatePresence } from "framer-motion";
import { LogIn, X, Heart } from "lucide-react";
import { signInWithGoogle } from "@/firebase";
import { useAudio } from "@/hooks/useAudio";

interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginPrompt({ isOpen, onClose }: LoginPromptProps) {
  const { playClick } = useAudio();

  const handleLogin = async () => {
    playClick();
    try {
      await signInWithGoogle();
      onClose();
    } catch (error: any) {
      console.error("Login error:", error);
      // If popup blocked, show a message
      if (error?.code === "auth/popup-blocked") {
        alert("Popup was blocked. Please allow popups for this site and try again.");
      } else if (error?.code === "auth/unauthorized-domain") {
        alert("This domain is not authorized for Firebase Auth. Please add it in Firebase Console → Authentication → Settings → Authorized domains.");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#060D18]/70 backdrop-blur-xl"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm liquid-glass-strong rounded-[36px] p-9 relative overflow-hidden iridescent-border z-10"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-love-pink/5 via-transparent to-eid-accent2/5 pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-love-pink/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-eid-accent/15 rounded-full blur-3xl" />

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-9 h-9 liquid-glass-subtle rounded-full flex items-center justify-center text-eid-gray hover:text-eid-dark transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="w-full h-full bg-gradient-to-br from-love-pink to-love-rose rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(255,107,157,0.3)] rotate-6">
                  <Heart className="w-10 h-10 text-white fill-white" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-eid-dark mb-2">
                Login to Play 💕
              </h2>
              <p className="text-eid-gray font-medium text-sm mb-8 leading-relaxed">
                Sign in to save your progress, earn coins, and unlock all the romantic experiences!
              </p>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                className="w-full py-4 rounded-[20px] font-bold text-base text-white active:scale-95 transition-transform relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-love-pink via-love-rose to-eid-accent2" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_4px_16px_rgba(255,107,157,0.3)] rounded-[20px]" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign in with Google
                </span>
              </button>

              {/* Skip */}
              <button
                onClick={onClose}
                className="mt-4 text-eid-gray font-semibold text-sm hover:text-eid-dark transition-colors py-1"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
