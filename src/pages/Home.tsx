import { Play, Lock, Gift, Sparkles, Moon, Heart, X, Bell, Shield, HelpCircle, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TesterAgent } from "../components/TesterAgent";
import { useState, useRef, MouseEvent, TouchEvent } from "react";
import { GiftHunt } from "../components/games/GiftHunt/GiftHunt";
import { CoupleQuiz } from "../components/games/CoupleQuiz/CoupleQuiz";
import { LoveNotes } from "../components/games/LoveNotes/LoveNotes";
import { useAuth } from "@/context/AuthContext";
import { useAudio } from "@/hooks/useAudio";
import { RewardPopup } from "@/components/RewardPopup";
import { db } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { LoginPrompt } from "@/components/LoginPrompt";

// ─── 3D Tilt Hook ───
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  const handleMove = (clientX: number, clientY: number) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    setTilt({
      rotateX: (0.5 - y) * 12,
      rotateY: (x - 0.5) * 12,
      glareX: x * 100,
      glareY: y * 100,
    });
  };

  const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) handleMove(touch.clientX, touch.clientY);
  };
  const handleLeave = () => setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  return { ref, tilt, handleMouseMove, handleTouchMove, handleLeave };
}

// ─── Days Together Counter ───
const ANNIVERSARY_DATE = new Date("2025-08-01"); // <-- Change this to your actual date!
function getDaysTogether() {
  const now = new Date();
  const diff = Math.floor((now.getTime() - ANNIVERSARY_DATE.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

// ─── Stagger animation ───
const stagger = {
  container: {
    animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  },
};

export function Home() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { user, coins, rewardAmount, completedActivities } = useAuth();
  const { playClick } = useAudio();
  const tiltCard = useTilt();

  const handleGameClick = (gameId: string) => {
    playClick();
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setActiveGame(gameId);
  };

  // Unique activities completed (filter out perfect variants)
  const uniqueCompleted = Array.from(new Set(completedActivities.filter(id => !id.endsWith("-perfect")))).length;
  const availableActivities = 3; // Gift Hunt, Couple Quiz, and Love Notes

  return (
    <div className="px-5 py-4 flex flex-col gap-7 relative">
      {/* Game Overlays */}
      <AnimatePresence>
        {activeGame === "gift-hunt" && (
          <GiftHunt onClose={() => setActiveGame(null)} />
        )}
        {activeGame === "couple-quiz" && (
          <CoupleQuiz onClose={() => setActiveGame(null)} />
        )}
        {activeGame === "love-notes" && (
          <LoveNotes onClose={() => setActiveGame(null)} />
        )}
      </AnimatePresence>

      {/* Popups */}
      <RewardPopup
        isOpen={showReward}
        onClose={() => setShowReward(false)}
        reward={rewardAmount}
        message="You're my greatest treasure!"
      />
      <LoginPrompt 
        isOpen={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)} 
      />

      {/* Hero Section — Enhanced */}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center text-center gap-2 mt-2"
      >
        {/* Logo Orb */}
        <motion.div variants={stagger.item}>
          <div className="w-20 h-20 liquid-glass-solid rounded-[28px] flex items-center justify-center mb-3 relative overflow-hidden group animate-glow-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-love-pink/20 via-transparent to-eid-accent/15" />
            <div className="absolute inset-0 shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)]" />
            <Heart className="w-9 h-9 text-love-pink fill-love-pink absolute bottom-2.5 left-3 drop-shadow-[0_0_12px_rgba(255,107,157,0.5)] group-hover:scale-110 transition-transform animate-heartbeat" />
            <span className="text-xl font-serif font-bold text-eid-gold-light absolute top-2.5 right-3 drop-shadow-[0_0_8px_rgba(212,168,83,0.3)]">
              AS
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          variants={stagger.item}
          className="text-4xl font-bold text-eid-dark tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          My Love 😘
          <br />
          Eid Mubarak
        </motion.h2>

        {/* Subtitle */}
        <motion.p variants={stagger.item} className="text-eid-gray text-sm font-medium">
          A digital sanctuary for our joy
        </motion.p>

        {/* Days Together Counter */}
        <motion.div
          variants={stagger.item}
          className="mt-2 liquid-glass-subtle rounded-full px-5 py-2 flex items-center gap-2"
        >
          <Heart className="w-3.5 h-3.5 text-love-pink fill-love-pink" />
          <span className="text-xs font-bold text-eid-dark/70 tracking-wide">
            {getDaysTogether()} days together
          </span>
          <span className="text-xs">💕</span>
        </motion.div>

        {/* Floating sparkles */}
        <div className="absolute top-4 left-8 animate-sparkle" style={{ animationDelay: "0s" }}>
          <Sparkles className="w-4 h-4 text-eid-gold/30" />
        </div>
        <div className="absolute top-12 right-10 animate-sparkle" style={{ animationDelay: "1s" }}>
          <Sparkles className="w-3 h-3 text-love-pink/30" />
        </div>
        <div className="absolute top-28 left-16 animate-sparkle" style={{ animationDelay: "2s" }}>
          <Sparkles className="w-3.5 h-3.5 text-eid-accent2/30" />
        </div>
      </motion.div>

      {/* Greeting Card — with 3D Tilt */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ delay: 0.2 }}
        ref={tiltCard.ref}
        onMouseMove={tiltCard.handleMouseMove}
        onTouchMove={tiltCard.handleTouchMove}
        onMouseLeave={tiltCard.handleLeave}
        onTouchEnd={tiltCard.handleLeave}
        style={{
          transform: `perspective(800px) rotateX(${tiltCard.tilt.rotateX}deg) rotateY(${tiltCard.tilt.rotateY}deg)`,
          transition: "transform 0.15s ease-out",
        }}
        className="liquid-glass-subtle rounded-[28px] p-7 relative overflow-hidden group iridescent-border will-change-transform"
      >
        {/* Interactive glare effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${tiltCard.tilt.glareX}% ${tiltCard.tilt.glareY}%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
          }}
        />

        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-love-pink/5 via-transparent to-eid-accent2/5 pointer-events-none" />

        <div className="absolute top-5 left-6 text-love-pink relative z-10">
          <Heart className="w-5 h-5 fill-love-pink drop-shadow-[0_0_8px_rgba(255,107,157,0.5)] animate-heartbeat" />
        </div>
        <div className="absolute top-5 right-6 text-white/10 relative z-10">
          <Sparkles className="w-9 h-9" />
        </div>

        <div className="mt-7 space-y-4 relative z-10">
          <p className="font-serif text-[26px] italic text-eid-dark/90 leading-snug">
            To my beautiful wife Arshi 💕, may every day be as magical as you are.
          </p>
          <div className="text-3xl animate-heartbeat inline-block drop-shadow-[0_0_12px_rgba(255,107,157,0.4)]">
            💖
          </div>
        </div>

        {/* Corner glow */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-tl from-love-pink/10 to-transparent rounded-full blur-2xl group-hover:from-love-pink/20 transition-all duration-700" />
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-eid-gold/10 to-transparent rounded-full blur-2xl" />
      </motion.div>

      {/* Reveal Button */}
      <AnimatePresence>
        {rewardAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 15 }}
            className="flex flex-col items-center gap-3"
          >
            <button
              onClick={() => { playClick(); setShowReward(true); }}
              className="w-full rounded-[22px] py-5 px-7 font-bold flex items-center justify-between group transition-all active:scale-[0.98] relative overflow-hidden"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-love-rose via-love-pink to-love-blush opacity-90" />
              {/* Glass overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
              </div>
              {/* Edge glow */}
              <div className="absolute inset-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.1)] rounded-[22px]" />

              <div className="flex items-center gap-4 text-white relative z-10">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20 shadow-inner group-hover:scale-110 transition-transform">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-base font-semibold">
                    Tap to reveal
                  </span>
                  <span className="block text-lg font-serif italic opacity-90">
                    surprise
                  </span>
                </div>
              </div>
              <span className="text-sm font-large opacity-90 tracking-wider text-white relative z-10">
                😍
              </span>
            </button>
            <span className="text-[10px] tracking-[0.2em] text-eid-gray font-semibold uppercase opacity-50">
              Unlock your festive blessing
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Our Journey Section */}
      <div className="w-full flex flex-col gap-3">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-sm font-bold text-eid-dark/70">
            Our Journey
          </h3>
          <span className="text-[10px] font-bold text-eid-accent bg-eid-accent/10 px-2 py-0.5 rounded-full">
            {uniqueCompleted}/{availableActivities} done
          </span>
        </div>
        <div className="h-2.5 w-full bg-white/30 rounded-full overflow-hidden p-0.5 border border-white/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(uniqueCompleted / availableActivities) * 100}%` }}
            className="h-full bg-gradient-to-r from-love-pink to-eid-accent2 rounded-full shadow-[0_0_8px_rgba(255,107,157,0.4)]"
          />
        </div>
      </div>

      {/* Activities Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-eid-dark/90">
            Love Experiences
          </h3>
          <div className="px-3 py-1 liquid-glass-subtle rounded-full">
            <span className="text-[10px] font-bold text-love-pink uppercase tracking-widest">
              {availableActivities} Activities
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {/* Activity 1 — Eid Gift Hunt */}
          <motion.div
            whileHover={{ x: 4 }}
            onClick={() => handleGameClick("gift-hunt")}
            className="liquid-glass rounded-[22px] p-4.5 flex items-center gap-4 group iridescent-border cursor-pointer"
          >
            <div className="w-14 h-14 liquid-glass-subtle rounded-2xl flex items-center justify-center text-eid-accent group-hover:shadow-[0_0_16px_rgba(110,193,228,0.2)] transition-shadow">
              <Gift className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-eid-dark/90">
                Gift Hunt
              </h4>
              <p className="text-sm text-eid-gray font-medium">
                Find the hidden treasures
              </p>
            </div>
            <button className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-eid-accent/30 to-eid-accent2/20 text-eid-accent shadow-[0_0_12px_rgba(110,193,228,0.15)] active:scale-90 transition-transform border border-white/10">
              <Play className="w-4 h-4 fill-current" />
            </button>
          </motion.div>

          {/* Activity 2 — Couple Quiz */}
          <motion.div
            whileHover={{ x: 4 }}
            onClick={() => handleGameClick("couple-quiz")}
            className="liquid-glass rounded-[22px] p-4.5 flex items-center gap-4 group iridescent-border cursor-pointer"
          >
            <div className="w-14 h-14 liquid-glass-subtle rounded-2xl flex items-center justify-center text-eid-gold group-hover:shadow-[0_0_16px_rgba(212,168,83,0.2)] transition-shadow">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-eid-dark/90">
                Couple Quiz
              </h4>
              <p className="text-sm text-eid-gray font-medium">
                How well do you know me?
              </p>
            </div>
            <button className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-eid-gold/30 to-eid-gold-dark/20 text-eid-gold shadow-[0_0_12px_rgba(212,168,83,0.15)] active:scale-90 transition-transform border border-white/10">
              <Play className="w-4 h-4 fill-current" />
            </button>
          </motion.div>

          {/* Activity 3 — Catch the Love Notes (NOW ACTIVE!) */}
          <motion.div
            whileHover={{ x: 4 }}
            onClick={() => handleGameClick("love-notes")}
            className="liquid-glass rounded-[22px] p-4.5 flex items-center gap-4 group iridescent-border cursor-pointer"
          >
            <div className="w-14 h-14 liquid-glass-subtle rounded-2xl flex items-center justify-center text-love-pink group-hover:shadow-[0_0_16px_rgba(255,107,157,0.2)] transition-shadow">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-eid-dark/90">
                Catch the Love Notes
              </h4>
              <p className="text-sm text-eid-gray font-medium">
                Catch falling love messages! 💌
              </p>
            </div>
            <button className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-love-pink/30 to-love-rose/20 text-love-pink shadow-[0_0_12px_rgba(255,107,157,0.15)] active:scale-90 transition-transform border border-white/10">
              <Play className="w-4 h-4 fill-current" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Tester Agent */}
      <TesterAgent />
    </div>
  );
}
