import { useMemo } from "react";

// Reduced from 18 → 8 particles for mobile GPU savings
const PARTICLES = [
  { emoji: "💕", size: "text-lg" },
  { emoji: "💖", size: "text-base" },
  { emoji: "✨", size: "text-sm" },
  { emoji: "💗", size: "text-xl" },
  { emoji: "🌸", size: "text-base" },
  { emoji: "💜", size: "text-sm" },
  { emoji: "💫", size: "text-xs" },
  { emoji: "❤️", size: "text-sm" },
];

export function FloatingHearts() {
  const particles = useMemo(() => {
    return PARTICLES.map((p, i) => ({
      ...p,
      left: `${(i * 12 + Math.random() * 5) % 100}%`,
      delay: `${i * 2 + Math.random() * 4}s`,
      duration: `${12 + Math.random() * 8}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p, i) => (
        <span
          key={i}
          className={`absolute ${p.size} animate-rose-fall opacity-0`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            willChange: "transform",
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
