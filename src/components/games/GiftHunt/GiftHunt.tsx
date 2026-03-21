import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Coins, Moon, Star, Gift, ArrowRight, CheckCircle2, XCircle, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { db, auth, signInWithGoogle, OperationType, handleFirestoreError } from "@/firebase";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { useAudio } from "@/hooks/useAudio";

// --- Types ---
type Level = 1 | 2 | 3 | 4 | 'final';

interface GiftHuntProps {
  onClose: () => void;
}

// --- Sub-components ---

const TransitionScreen: React.FC<{ message: string }> = ({ message }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-eid-bg/80 backdrop-blur-xl"
  >
    <motion.div
      initial={{ scale: 0.8, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="text-center"
    >
      <div className="w-20 h-20 mx-auto mb-6 liquid-glass-solid rounded-3xl flex items-center justify-center">
        <SparkleIcon className="w-10 h-10 text-eid-gold animate-pulse" />
      </div>
      <h2 className="text-2xl font-serif italic text-eid-dark drop-shadow-lg">
        {message}
      </h2>
    </motion.div>
  </motion.div>
);

const SparkleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    <path d="M12 3L14.5 9L21 11.5L14.5 14L12 21L9.5 14L3 11.5L9.5 9L12 3Z" fill="currentColor" />
  </svg>
);

// --- Main Game Component ---

export function GiftHunt({ onClose }: GiftHuntProps) {
  const { user, coins: globalCoins, isAuthReady, completedActivities } = useAuth();
  const { playClick, playSuccess, playCoin } = useAudio();

  const [currentLevel, setCurrentLevel] = useState<Level>(1);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");
  const [error, setError] = useState(false);

  const transitionMessages = [
    "You're getting closer 💖",
    "I made this just for you 🌙",
    "Almost there… 🎁",
  ];

  const handleLevelComplete = async (reward: number) => {
    playSuccess();
    setSessionCoins(prev => prev + reward);
    setTapCount(0);

    // Sync to Firestore
    if (user) {
      const userRef = doc(db, "users", user.uid);
      try {
        const updateData: any = {
          coins: increment(reward),
          lastUpdated: new Date().toISOString()
        };

        // If it's the final level, mark as completed and set the initial reward if not already done
        if (currentLevel === 4 && !completedActivities.includes("gift-hunt")) {
          updateData.completedActivities = arrayUnion("gift-hunt");
          updateData.rewardAmount = increment(10);
        }

        await updateDoc(userRef, updateData);
        playCoin();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }

    if (currentLevel < 4) {
      setTransitionMessage(transitionMessages[currentLevel - 1]);
      setIsTransitioning(true);
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentLevel((prev) => (prev as number + 1) as Level);
        setUserAnswer("");
        setError(false);
      }, 2000);
    } else {
      setCurrentLevel('final');
    }
  };

  if (!user && isAuthReady) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-eid-bg items-center justify-center p-6 text-center">
        <div className="mesh-bg opacity-50" />
        <div className="liquid-glass-strong p-8 rounded-[36px] w-full max-w-sm relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 liquid-glass rounded-2xl flex items-center justify-center">
            <LogIn className="w-8 h-8 text-eid-accent" />
          </div>
          <h2 className="text-2xl font-bold text-eid-dark mb-2">Login Required</h2>
          <p className="text-eid-gray mb-8">Please login to save your progress and earn coins!</p>
          <button
            onClick={() => { playClick(); signInWithGoogle(); }}
            className="w-full py-4 bg-eid-accent rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all"
          >
            Login with Google
          </button>
          <button
            onClick={onClose}
            className="mt-4 text-eid-gray font-semibold text-sm"
          >
            Maybe Later
          </button>
        </div>
      </div>
    );
  }

  const renderLevel = () => {
    switch (currentLevel) {
      case 1:
        return (
          <div className="flex flex-col items-center gap-8 py-10">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-eid-dark">Level 1</h3>
              <p className="text-eid-gray font-medium">Tap the moon 3 times 🌙</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.8, rotate: -10 }}
              onClick={() => {
                playClick();
                const newCount = tapCount + 1;
                setTapCount(newCount);
                if (newCount >= 3) {
                  handleLevelComplete(10);
                }
              }}
              className="w-40 h-40 liquid-glass-solid rounded-[40px] flex items-center justify-center relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-eid-gold/20 to-transparent opacity-50" />
              <Moon className={cn(
                "w-20 h-20 text-eid-gold-light fill-eid-gold-light transition-all duration-300",
                tapCount > 0 && "scale-110 drop-shadow-[0_0_15px_rgba(212,168,83,0.6)]"
              )} />

              {/* Tap indicators */}
              <div className="absolute -bottom-4 flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-500",
                      tapCount >= i ? "bg-eid-gold scale-125 shadow-[0_0_8px_rgba(212,168,83,0.8)]" : "bg-white/10"
                    )}
                  />
                ))}
              </div>
            </motion.button>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col items-center gap-8 py-10">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-eid-dark">Level 2</h3>
              <p className="text-eid-gray font-medium">Tap the stars in order ✨</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-[240px]">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playClick();
                    if (tapCount + 1 === i) {
                      setTapCount(i);
                      if (i === 4) {
                        handleLevelComplete(10);
                      }
                    } else {
                      setTapCount(0);
                    }
                  }}
                  className={cn(
                    "aspect-square liquid-glass rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300",
                    tapCount >= i && "bg-eid-accent/20 border-eid-accent shadow-[0_0_15px_rgba(110,193,228,0.3)]"
                  )}
                >
                  <Star className={cn(
                    "w-8 h-8 transition-all duration-300",
                    tapCount >= i ? "text-eid-accent fill-eid-accent" : "text-eid-accent/40"
                  )} />
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-center gap-8 py-10">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-eid-dark">Level 3</h3>
              <p className="text-eid-gray font-medium">Personal Question</p>
            </div>

            <div className="liquid-glass-strong p-6 rounded-3xl w-full space-y-6">
              <p className="text-lg font-serif italic text-center text-eid-dark/90">
                "Where did we last celebrate Eid together?"
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-eid-dark placeholder:text-eid-gray/50 focus:outline-none focus:ring-2 focus:ring-eid-accent/50 transition-all"
                />
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-eid-rose text-xs font-bold text-center">
                    Try again, my love! ❤️
                  </motion.p>
                )}
              </div>

              <button
                onClick={() => {
                  playClick();
                  if (userAnswer.toLowerCase().trim() !== "") {
                    handleLevelComplete(15);
                  } else {
                    setError(true);
                  }
                }}
                className="w-full py-4 bg-gradient-to-r from-eid-accent to-eid-accent2 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all"
              >
                Submit Answer
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col items-center gap-8 py-10">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-eid-dark">Level 4</h3>
              <p className="text-eid-gray font-medium">The Final Riddle</p>
            </div>

            <div className="liquid-glass-strong p-8 rounded-[32px] w-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Gift className="w-20 h-20" />
              </div>

              <p className="text-xl font-serif italic text-center text-eid-dark/90 leading-relaxed relative z-10">
                "I’m always near you when you rest,<br />
                beside your dreams, I hide your gifts. What am I?"
              </p>

              <div className="mt-8 space-y-4 relative z-10">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Where is it?"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-eid-dark placeholder:text-eid-gray/50 focus:outline-none focus:ring-2 focus:ring-eid-gold/50 transition-all"
                />

                <button
                  onClick={() => {
                    playClick();
                    const validAnswers = ["bed", "drawer", "closet", "table", "chair", "cabinet", "pillow", "phone", "draw"];
                    if (validAnswers.some(answer => userAnswer.toLowerCase().includes(answer))) {
                      handleLevelComplete(25);
                    } else {
                      setError(true);
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-eid-gold to-eid-gold-dark rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );

      case 'final':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] border-2 border-dashed border-eid-gold/30 rounded-full"
              />
              <div className="w-32 h-32 liquid-glass-solid rounded-[40px] flex items-center justify-center relative z-10">
                <Gift className="w-16 h-16 text-eid-gold animate-bounce" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl font-serif font-bold text-eid-dark tracking-tight">
                Congratulations!
              </h2>
              <p className="text-xl font-serif italic text-eid-gold-light">
                "Your real gift is waiting for you 💖"
              </p>
            </div>

            <button
              onClick={() => { playClick(); onClose(); }}
              className="mt-4 px-10 py-4 liquid-glass-strong rounded-2xl font-bold text-eid-dark hover:bg-white/10 transition-all active:scale-95"
            >
              Back to Hub
            </button>
          </motion.div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-eid-bg overflow-hidden">
      {/* Mesh Background */}
      <div className="mesh-bg opacity-50" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 liquid-glass-strong border-b border-white/10">
        <button
          onClick={() => { playClick(); onClose(); }}
          className="w-10 h-10 liquid-glass rounded-xl flex items-center justify-center text-eid-gray hover:text-eid-dark transition-colors"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-eid-accent tracking-[0.2em] uppercase">
            {currentLevel === 'final' ? 'MISSION COMPLETE' : `LEVEL 0${currentLevel}`}
          </span>
          <h1 className="text-sm font-bold text-eid-dark/90">Eid Gift Hunt</h1>
        </div>

        <div className="liquid-glass rounded-full px-3 py-1.5 flex items-center gap-2">
          <Coins className="w-3.5 h-3.5 text-eid-gold" />
          <span className="text-xs font-bold text-eid-dark/80">{globalCoins}</span>
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 relative z-10 overflow-y-auto px-6 py-8 no-scrollbar">
        <AnimatePresence mode="wait">
          {isTransitioning ? (
            <TransitionScreen key="transition" message={transitionMessage} />
          ) : (
            <motion.div
              key={currentLevel}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              {renderLevel()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Progress Footer */}
      {currentLevel !== 'final' && (
        <footer className="relative z-10 p-6 liquid-glass-strong border-t border-white/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-eid-gray tracking-widest uppercase">Progress</span>
            <span className="text-[10px] font-bold text-eid-accent tracking-widest uppercase">
              {Math.round(((currentLevel as number - 1) / 4) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentLevel as number - 1) / 4) * 100}%` }}
              className="h-full bg-gradient-to-r from-eid-accent to-eid-accent2 shadow-[0_0_10px_rgba(110,193,228,0.3)]"
            />
          </div>
        </footer>
      )}
    </div>
  );
}
