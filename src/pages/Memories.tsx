import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Heart, ChevronDown, Camera } from "lucide-react";

// ─── Love Letter Content ───
const LOVE_LETTER = `My Dearest Arshi,

Every day with you feels like a beautiful dream I never want to wake up from. You are my sunshine, my moonlight, and every star in between.

From the moment we met, my world changed forever. Your smile is the reason I look forward to every tomorrow. Your laughter is the melody that plays in my heart.

I want to spend every Eid, every celebration, and every ordinary day by your side. You make everything extraordinary just by being you.

Thank you for being my best friend, my partner, and the love of my life. I am the luckiest person in the world because I have you.

Forever and always yours,
Your husband 💕`;

// ─── Types ───
interface MemoryPhoto {
  src: string;
  date: string;
  caption: string;
}

// ─── Typewriter Hook ───
function useTypewriter(text: string, speed: number = 30) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    setIsComplete(false);

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayText, isComplete };
}

// ─── Photo Card Component ───
function PhotoCard({ photo, index }: { photo: MemoryPhoto; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
      className="liquid-glass rounded-[28px] overflow-hidden group relative"
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <img
          src={photo.src}
          alt={photo.caption}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      </div>

      {/* Caption & Date */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        {/* <p className="text-white font-semibold text-sm drop-shadow-lg">
          {photo.caption}
        </p> */}
        <p className="text-white/60 text-xs font-medium mt-1">
          {new Date(photo.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Glass shine on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}

// ─── Main Memories Page ───
export function Memories() {
  const [showLetter, setShowLetter] = useState(true);
  const { displayText, isComplete } = useTypewriter(
    showLetter ? LOVE_LETTER : "",
    25
  );

  // Photos from src/assets/memories/ folder — user uploads manually
  // Example filename: 2024-05-15_Our-First-Date.jpg
  // Will be shown correctly if they follow that format, or fallback to file name.
  const [photos, setPhotos] = useState<MemoryPhoto[]>([]);

  useEffect(() => {
    // Load photos dynamically from the assets directory using Vite's glob import
    // @ts-ignore
    const modules = import.meta.glob('/src/assets/memories/*.{png,jpg,jpeg,svg,webp,gif}', {
      eager: true,
      query: '?url',
      import: 'default',
    });

    const parsedPhotos: MemoryPhoto[] = Object.entries(modules).map(([path, url]) => {
      // e.g. path = "/src/assets/memories/2023-01-01_Happy-New-Year.jpg"
      const filename = path.split('/').pop() || '';
      const nameWithoutExt = filename.split('.').slice(0, -1).join('.');

      let dateStr = new Date().toISOString();
      let caption = nameWithoutExt;

      if (nameWithoutExt.includes('_')) {
        const [d, ...c] = nameWithoutExt.split('_');
        dateStr = d;
        caption = c.join('_').replace(/-/g, ' ');
      } else {
        // Fallback if they didn't follow the format YYYY-MM-DD_Caption
        caption = nameWithoutExt.replace(/[-_]/g, ' ');
      }

      // Validate date
      const timestamp = Date.parse(dateStr);
      if (isNaN(timestamp)) {
        dateStr = new Date().toISOString();
      }

      return {
        src: url as string,
        date: dateStr,
        caption: caption
      };
    });

    // Sort newest to oldest
    parsedPhotos.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    setPhotos(parsedPhotos);
  }, []);

  return (
    <div className="px-5 py-6 flex flex-col gap-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          className="inline-block mb-3"
        >
          <Heart className="w-8 h-8 text-love-pink fill-love-pink drop-shadow-[0_0_12px_rgba(255,107,157,0.5)]" />
        </motion.div>
        <h1 className="text-3xl font-serif font-bold text-eid-dark tracking-tight">
          Our Memories
        </h1>
        <p className="text-eid-gray text-sm font-medium mt-1">
          Every moment with you is a treasure
        </p>
      </motion.div>

      {/* Section Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowLetter(true)}
          className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${showLetter
            ? "bg-gradient-to-r from-love-pink to-love-rose text-white shadow-lg shadow-love-pink/20"
            : "liquid-glass text-eid-gray"
            }`}
        >
          💌 Love Letter
        </button>
        <button
          onClick={() => setShowLetter(false)}
          className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${!showLetter
            ? "bg-gradient-to-r from-eid-accent to-eid-accent2 text-white shadow-lg shadow-eid-accent/20"
            : "liquid-glass text-eid-gray"
            }`}
        >
          📸 Gallery
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showLetter ? (
          /* ─── Love Letter Section ─── */
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            {/* Decorative petals */}
            <div className="absolute -top-4 -left-2 text-2xl opacity-40 animate-float-slow">
              🌸
            </div>
            <div className="absolute -top-2 -right-3 text-xl opacity-30 animate-float">
              🌺
            </div>
            <div className="absolute bottom-8 -right-1 text-lg opacity-35 animate-float-slow" style={{ animationDelay: "2s" }}>
              💐
            </div>

            {/* Letter Card */}
            <div className="liquid-glass-subtle rounded-[32px] p-8 relative overflow-hidden iridescent-border">
              {/* Inner ambient glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-love-pink/5 via-transparent to-eid-accent2/5 pointer-events-none" />
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-love-pink/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-eid-accent2/10 rounded-full blur-3xl" />

              {/* Letter content with typewriter */}
              <div className="relative z-10">
                <p
                  className="text-[22px] leading-[1.8] text-eid-dark/85 whitespace-pre-line"
                  style={{ fontFamily: "var(--font-handwritten)" }}
                >
                  {displayText}
                  {!isComplete && (
                    <span className="inline-block w-0.5 h-6 bg-love-pink ml-0.5 animate-typewriter-cursor border-r-2 border-love-pink" />
                  )}
                </p>
              </div>

              {/* Signature flourish */}
              {isComplete && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="mt-6 flex items-center justify-center gap-2"
                >
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-love-pink/30" />
                  <Heart className="w-5 h-5 text-love-pink fill-love-pink animate-heartbeat" />
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-love-pink/30" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          /* ─── Photo Gallery Section ─── */
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {photos.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {photos.map((photo, i) => (
                  <PhotoCard key={photo.src} photo={photo} index={i} />
                ))}
              </div>
            ) : (
              /* Empty state — waiting for photos */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 liquid-glass-subtle rounded-3xl flex items-center justify-center mb-6">
                  <Camera className="w-10 h-10 text-eid-gray/50" />
                </div>
                <h3 className="text-lg font-bold text-eid-dark/70 mb-2">
                  Memories Coming Soon
                </h3>
                <p className="text-eid-gray text-sm max-w-[240px] font-medium">
                  Beautiful photos of our journey together will appear here 💕
                </p>
                <p className="text-eid-gray/50 text-xs mt-4 font-mono">
                  Add photos to /src/assets/memories/
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
