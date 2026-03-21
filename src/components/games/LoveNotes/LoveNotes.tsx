import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Clock, Coins, Mail, MailOpen, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAudio } from "@/hooks/useAudio";
import { db } from "@/firebase";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";

// ─── Love Notes Data ───
const LOVE_NOTES = [
  "You make my heart skip a beat 💓",
  "I fall in love with you more every day 🌹",
  "Your smile lights up my world ✨",
  "You are my forever and always 💍",
  "Every moment with you is magical 🌙",
  "I'm so grateful for your love 🙏",
  "You complete me in every way 💕",
  "My heart beats only for you 💗",
  "You're the best thing that ever happened to me 🌟",
  "I love you more than words can say 💌",
  "You are my sunshine on cloudy days ☀️",
  "Forever wouldn't be long enough with you 💫",
  "You make ordinary days extraordinary 🦋",
  "My love for you grows stronger each day 🌺",
  "Being with you is my favorite place 🏡",
];

interface FallingNote {
  id: number;
  message: string;
  x: number;
  speed: number;
  caught: boolean;
  y: number;
}

interface LoveNotesProps {
  onClose: () => void;
}

export function LoveNotes({ onClose }: LoveNotesProps) {
  const { user, completedActivities } = useAuth();
  const { playClick, playSuccess, playCoin } = useAudio();

  const [notes, setNotes] = useState<FallingNote[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameOver, setIsGameOver] = useState(false);
  const [caughtMessage, setCaughtMessage] = useState<string | null>(null);
  const [totalSpawned, setTotalSpawned] = useState(0);
  const notesRef = useRef(notes);
  notesRef.current = notes;

  const nextId = useRef(0);

  // Spawn notes
  useEffect(() => {
    if (isGameOver) return;

    const spawnInterval = setInterval(() => {
      const noteIndex = Math.floor(Math.random() * LOVE_NOTES.length);
      const newNote: FallingNote = {
        id: nextId.current++,
        message: LOVE_NOTES[noteIndex],
        x: 10 + Math.random() * 70, // 10% to 80% horizontal
        speed: 2 + Math.random() * 2, // seconds to fall
        caught: false,
        y: -10,
      };

      setNotes((prev) => [...prev.slice(-8), newNote]); // max 9 notes
      setTotalSpawned((prev) => prev + 1);
    }, 1800);

    return () => clearInterval(spawnInterval);
  }, [isGameOver]);

  // Timer
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver]);

  // Catch a note
  const catchNote = useCallback(
    (noteId: number) => {
      const note = notesRef.current.find((n) => n.id === noteId);
      if (!note || note.caught) return;

      playCoin();
      setScore((prev) => prev + 1);
      setCaughtMessage(note.message);
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, caught: true } : n))
      );

      // Clear message after 1.5s
      setTimeout(() => setCaughtMessage(null), 1500);

      // Remove caught note after animation
      setTimeout(() => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
      }, 600);
    },
    [playCoin]
  );

  // Handle game over — save to firestore
  useEffect(() => {
    if (!isGameOver || !user) return;

    const saveScore = async () => {
      try {
        const coinsEarned = score * 5;
        const userRef = doc(db, "users", user.uid);
        const updateData: any = {
          coins: increment(coinsEarned),
          lastUpdated: new Date().toISOString(),
        };

        if (!completedActivities.includes("love-notes")) {
          updateData.completedActivities = arrayUnion("love-notes");
        }

        if (score >= 10 && !completedActivities.includes("love-notes-perfect")) {
          updateData.rewardAmount = increment(30);
          updateData.completedActivities = arrayUnion("love-notes-perfect");
        }

        await updateDoc(userRef, updateData);
        playSuccess();
      } catch (error) {
        console.error("Error saving Love Notes score:", error);
      }
    };

    saveScore();
  }, [isGameOver]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#060D18]/95 backdrop-blur-xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 liquid-glass-strong border-b border-white/10">
        <button
          onClick={onClose}
          className="w-10 h-10 liquid-glass rounded-xl flex items-center justify-center text-eid-gray hover:text-eid-dark transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black text-love-pink tracking-[0.2em] uppercase">
            {isGameOver ? "GAME OVER" : "CATCH THEM"}
          </span>
          <h1 className="text-sm font-bold text-eid-dark/90">
            Love Notes
          </h1>
        </div>

        <div className="flex gap-2">
          <div className="liquid-glass rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-eid-accent" />
            <span className="text-xs font-bold text-eid-dark/80">
              {timeLeft}s
            </span>
          </div>
        </div>
      </header>

      {/* Game Area */}
      <div className="flex-1 relative z-10 overflow-hidden">
        {/* Score display */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 liquid-glass rounded-full px-4 py-2 flex items-center gap-2">
          <Heart className="w-4 h-4 text-love-pink fill-love-pink" />
          <span className="text-sm font-bold text-eid-dark/90">
            {score} caught
          </span>
        </div>

        {/* Caught message popup */}
        <AnimatePresence>
          {caughtMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-30 liquid-glass-strong rounded-2xl px-5 py-3 max-w-[280px]"
            >
              <p className="text-sm font-semibold text-eid-dark text-center">
                {caughtMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Falling Notes */}
        <AnimatePresence>
          {!isGameOver &&
            notes
              .filter((n) => !n.caught)
              .map((note) => (
                <motion.button
                  key={note.id}
                  initial={{ y: "-10%", opacity: 0 }}
                  animate={{ y: "110vh", opacity: [0, 1, 1, 0] }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{
                    duration: 4 + note.speed,
                    ease: "linear",
                  }}
                  onClick={() => catchNote(note.id)}
                  className="absolute w-16 h-16 flex items-center justify-center cursor-pointer"
                  style={{
                    left: `${note.x}%`,
                  }}
                >
                  <div className="w-14 h-14 liquid-glass-solid rounded-2xl flex items-center justify-center animate-float relative group shadow-[0_0_20px_rgba(255,107,157,0.2)]">
                    <Mail className="w-7 h-7 text-love-pink group-hover:scale-110 transition-transform" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-love-pink rounded-full shadow-[0_0_6px_rgba(255,107,157,0.6)]" />
                  </div>
                </motion.button>
              ))}
        </AnimatePresence>

        {/* Game Over Screen */}
        <AnimatePresence>
          {isGameOver && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center p-6"
            >
              <div className="w-full max-w-sm liquid-glass-strong rounded-[40px] p-10 text-center space-y-8 border border-white/20 iridescent-border">
                <div className="w-24 h-24 bg-gradient-to-br from-love-pink to-love-deep rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(255,107,157,0.4)]">
                  <MailOpen className="w-12 h-12 text-white" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-white">
                    {score >= 10 ? "Amazing! 💕" : "Well Done!"}
                  </h3>
                  <p className="text-eid-gray font-medium">
                    {score >= 10
                      ? "You caught so much love! ❤️"
                      : "Try again to catch more love notes! 💌"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="liquid-glass-subtle rounded-2xl p-4">
                    <span className="block text-[10px] font-bold text-eid-gray uppercase tracking-widest mb-1">
                      Caught
                    </span>
                    <span className="text-2xl font-bold text-love-pink">
                      {score}
                    </span>
                  </div>
                  <div className="liquid-glass-subtle rounded-2xl p-4">
                    <span className="block text-[10px] font-bold text-eid-gray uppercase tracking-widest mb-1">
                      Coins
                    </span>
                    <span className="text-2xl font-bold text-eid-gold">
                      +{score * 5}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-love-pink to-love-rose text-white font-bold shadow-lg shadow-love-pink/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  Back to Hub
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
