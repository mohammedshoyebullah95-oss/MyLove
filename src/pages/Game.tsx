import { Lightbulb, Heart, Coins, Star, Moon, Flower2 } from "lucide-react";
import { motion } from "framer-motion";
import { TesterAgent } from "../components/TesterAgent";
import { useAuth } from "@/context/AuthContext";
import { useAudio } from "@/hooks/useAudio";

export function Game() {
  const { coins, completedActivities } = useAuth();
  const { playClick } = useAudio();

  const totalActivities = 3;
  const uniqueCompleted = Array.from(new Set(completedActivities.filter(id => !id.endsWith("-perfect")))).length;
  const progressPercent = (uniqueCompleted / totalActivities) * 100;

  // Piano sound logic
  const playNote = (index: number) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Frequencies for a C major scale starting from C4
    const frequencies = [
      261.63, 293.66, 329.63, 349.23,
      392.00, 440.00, 493.88, 523.25,
      587.33, 659.25, 698.46, 783.99,
      880.00, 987.77, 1046.50, 1174.66
    ];

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[index % frequencies.length], audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  };

  return (
    <div className="px-5 py-4 flex flex-col gap-6 h-full relative">
      {/* Top Stats Bar */}
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="liquid-glass rounded-full px-4 py-2.5 flex items-center gap-2"
        >
          <Heart className="w-4 h-4 text-eid-rose fill-eid-rose drop-shadow-[0_0_6px_rgba(244,114,182,0.5)]" />
          <span className="font-bold text-xs tracking-wider uppercase text-eid-dark/80">
            {uniqueCompleted}
          </span>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="liquid-glass rounded-full px-4 py-2.5 flex items-center gap-2"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-eid-gold to-eid-gold-dark text-white rounded-full flex items-center justify-center text-xs font-bold shadow-[0_0_8px_rgba(212,168,83,0.3)]">
            <Coins className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs tracking-wider uppercase text-eid-dark/80">
            {coins.toLocaleString()} Coins
          </span>
        </motion.div>
      </div>

      {/* Mission Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center text-center gap-3 mt-2"
      >
        <span className="px-4 py-1.5 liquid-glass-subtle text-eid-accent rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
          Ongoing Mission
        </span>
        <h2 className="text-2xl font-bold text-eid-dark tracking-tight">
          {uniqueCompleted === totalActivities ? "All Missions Complete!" : `Mission ${uniqueCompleted} of ${totalActivities}`}
        </h2>

        {/* Progress Bar */}
        <div className="w-full max-w-[280px] h-3.5 liquid-glass rounded-full mt-3 relative overflow-hidden">
          {/* Track inner shadow */}
          <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] rounded-full" />

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-eid-accent via-eid-accent2 to-eid-rose" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
            <div className="absolute inset-0 shadow-[0_0_12px_rgba(110,193,228,0.4)]" />
          </motion.div>

          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `${progressPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-eid-gold-light to-eid-gold" />
            <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_0_12px_rgba(212,168,83,0.5)] rounded-full" />
            <div className="absolute inset-[2px] bg-gradient-to-br from-white/20 to-transparent rounded-full" />
            <Star className="w-3.5 h-3.5 text-white fill-white relative z-10 drop-shadow-sm" />
          </motion.div>
        </div>
      </motion.div>

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-3 mt-6">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.08, rotate: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              playNote(i);
            }}
            className="aspect-square liquid-glass rounded-2xl flex items-center justify-center cursor-pointer group relative overflow-hidden transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(110,193,228,0.15)]"
          >
            {/* Hover inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

            <div className="group-hover:scale-110 transition-transform relative z-10">
              {i % 4 === 0 && (
                <Star className="w-7 h-7 fill-eid-dark text-eid-dark drop-shadow-[0_0_6px_rgba(232,236,244,0.3)]" />
              )}
              {i % 4 === 1 && (
                <Moon className="w-7 h-7 fill-eid-gold text-eid-gold drop-shadow-[0_0_8px_rgba(212,168,83,0.4)]" />
              )}
              {i % 4 === 2 && (
                <Heart className="w-7 h-7 fill-eid-rose text-eid-rose drop-shadow-[0_0_8px_rgba(244,114,182,0.4)]" />
              )}
              {i % 4 === 3 && (
                <Flower2 className="w-7 h-7 text-eid-accent2 drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]" />
              )}
            </div>
          </motion.div>
        ))}
      </div>



      {/* Tester Agent */}
      <TesterAgent />
    </div>
  );
}
