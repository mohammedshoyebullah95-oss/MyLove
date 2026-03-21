import { useMemo } from "react";

const PARTICLES = [
  { emoji: "💕", size: "text-lg" },
  { emoji: "💖", size: "text-base" },
  { emoji: "✨", size: "text-sm" },
  { emoji: "💗", size: "text-xl" },
  { emoji: "🌸", size: "text-base" },
  { emoji: "💜", size: "text-sm" },
  { emoji: "💫", size: "text-xs" },
  { emoji: "🫧", size: "text-base" },
  { emoji: "❤️", size: "text-sm" },
  { emoji: "🌙", size: "text-lg" },
  { emoji: "💕", size: "text-sm" },
  { emoji: "✨", size: "text-lg" },
  { emoji: "💗", size: "text-xs" },
  { emoji: "🌸", size: "text-sm" },
  { emoji: "💖", size: "text-base" },
  { emoji: "💫", size: "text-sm" },
  { emoji: "❤️", size: "text-xs" },
  { emoji: "🫧", size: "text-sm" },
];

export function FloatingHearts() {
  const particles = useMemo(() => {
    return PARTICLES.map((p, i) => ({
      ...p,
      left: `${(i * 5.5 + Math.random() * 3) % 100}%`,
      delay: `${i * 1.3 + Math.random() * 3}s`,
      duration: `${10 + Math.random() * 8}s`,
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
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
