import { useCallback, useRef, useState } from "react";

// ─── Multiple Romantic Melodies ───

const MELODIES = [
  // Melody 1 — Gentle Lullaby
  [
    { freq: 523.25, dur: 0.8 },   // C5
    { freq: 659.25, dur: 0.6 },   // E5
    { freq: 783.99, dur: 0.8 },   // G5
    { freq: 659.25, dur: 0.4 },   // E5
    { freq: 698.46, dur: 0.6 },   // F5
    { freq: 587.33, dur: 0.6 },   // D5
    { freq: 523.25, dur: 1.0 },   // C5
    { freq: 493.88, dur: 0.5 },   // B4
    { freq: 523.25, dur: 0.8 },   // C5
    { freq: 587.33, dur: 0.6 },   // D5
    { freq: 659.25, dur: 0.8 },   // E5
    { freq: 523.25, dur: 1.0 },   // C5
  ],
  // Melody 2 — Angelic Ascending
  [
    { freq: 392.00, dur: 0.7 },   // G4
    { freq: 440.00, dur: 0.5 },   // A4
    { freq: 523.25, dur: 0.8 },   // C5
    { freq: 587.33, dur: 0.6 },   // D5
    { freq: 659.25, dur: 1.0 },   // E5
    { freq: 587.33, dur: 0.5 },   // D5
    { freq: 523.25, dur: 0.7 },   // C5
    { freq: 440.00, dur: 0.6 },   // A4
    { freq: 392.00, dur: 1.2 },   // G4
    { freq: 349.23, dur: 0.5 },   // F4
    { freq: 392.00, dur: 0.8 },   // G4
    { freq: 440.00, dur: 1.0 },   // A4
  ],
  // Melody 3 — Sweet Waltz
  [
    { freq: 659.25, dur: 0.6 },   // E5
    { freq: 587.33, dur: 0.4 },   // D5
    { freq: 523.25, dur: 0.6 },   // C5
    { freq: 493.88, dur: 0.4 },   // B4
    { freq: 440.00, dur: 0.8 },   // A4
    { freq: 523.25, dur: 0.6 },   // C5
    { freq: 493.88, dur: 0.5 },   // B4
    { freq: 440.00, dur: 0.6 },   // A4
    { freq: 392.00, dur: 1.0 },   // G4
    { freq: 440.00, dur: 0.4 },   // A4
    { freq: 493.88, dur: 0.6 },   // B4
    { freq: 523.25, dur: 1.2 },   // C5
  ],
  // Melody 4 — Calm Heavenly
  [
    { freq: 261.63, dur: 1.0 },   // C4
    { freq: 329.63, dur: 0.8 },   // E4
    { freq: 392.00, dur: 0.6 },   // G4
    { freq: 523.25, dur: 1.0 },   // C5
    { freq: 493.88, dur: 0.5 },   // B4
    { freq: 440.00, dur: 0.7 },   // A4
    { freq: 392.00, dur: 0.8 },   // G4
    { freq: 329.63, dur: 0.6 },   // E4
    { freq: 349.23, dur: 1.0 },   // F4
    { freq: 329.63, dur: 0.5 },   // E4
    { freq: 293.66, dur: 0.7 },   // D4
    { freq: 261.63, dur: 1.2 },   // C4
  ],
  // Melody 5 — Angelic Chimes
  [
    { freq: 783.99, dur: 0.5 },   // G5
    { freq: 698.46, dur: 0.4 },   // F5
    { freq: 659.25, dur: 0.6 },   // E5
    { freq: 523.25, dur: 0.8 },   // C5
    { freq: 587.33, dur: 0.5 },   // D5
    { freq: 659.25, dur: 0.7 },   // E5
    { freq: 783.99, dur: 1.0 },   // G5
    { freq: 880.00, dur: 0.6 },   // A5
    { freq: 783.99, dur: 0.5 },   // G5
    { freq: 659.25, dur: 0.7 },   // E5
    { freq: 587.33, dur: 0.8 },   // D5
    { freq: 523.25, dur: 1.2 },   // C5
  ],
];

// ─── Ambient Music State (module-level singleton) ───
let ambientCtx: AudioContext | null = null;
let ambientInterval: ReturnType<typeof setInterval> | null = null;
let ambientPlaying = false;
let currentMelodyIndex = -1;

function pickRandomMelody() {
  let idx = Math.floor(Math.random() * MELODIES.length);
  // Avoid repeating the same melody
  while (idx === currentMelodyIndex && MELODIES.length > 1) {
    idx = Math.floor(Math.random() * MELODIES.length);
  }
  currentMelodyIndex = idx;
  return MELODIES[idx];
}

export function useAudio() {
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(ambientPlaying);

  const playOscillator = useCallback((freq: number, type: OscillatorType = 'sine', duration: number = 0.1, volume: number = 0.1) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio context failed to start", e);
    }
  }, []);

  const playClick = useCallback(() => {
    playOscillator(880, 'sine', 0.1, 0.05);
  }, [playOscillator]);

  const playSuccess = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => playOscillator(freq, 'sine', 0.3, 0.05), i * 100);
    });
  }, [playOscillator]);

  const playCoin = useCallback(() => {
    playOscillator(987.77, 'sine', 0.2, 0.05);
    setTimeout(() => playOscillator(1318.51, 'sine', 0.4, 0.05), 100);
  }, [playOscillator]);

  // ─── Ambient Melody ───
  const playAmbientNote = useCallback((ctx: AudioContext, freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Soft envelope for calm angelic feel
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.025, startTime + 0.1);
    gain.gain.setValueAtTime(0.025, startTime + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }, []);

  const startAmbient = useCallback(() => {
    if (ambientPlaying) return;

    try {
      ambientCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      ambientPlaying = true;
      setIsAmbientPlaying(true);

      const playNextMelody = () => {
        if (!ambientCtx || !ambientPlaying) return;

        const melody = pickRandomMelody();
        let time = ambientCtx.currentTime + 0.1;
        melody.forEach(note => {
          playAmbientNote(ambientCtx!, note.freq, time, note.dur);
          time += note.dur * 0.85; // slight overlap for legato
        });
      };

      playNextMelody();

      // Calculate average melody duration for loop timing
      const avgDuration = MELODIES.reduce((sum, m) =>
        sum + m.reduce((s, n) => s + n.dur * 0.85, 0), 0
      ) / MELODIES.length * 1000;

      ambientInterval = setInterval(playNextMelody, avgDuration + 2000); // gap between melodies
    } catch (e) {
      console.warn("Ambient music failed:", e);
    }
  }, [playAmbientNote]);

  const stopAmbient = useCallback(() => {
    ambientPlaying = false;
    setIsAmbientPlaying(false);
    if (ambientInterval) {
      clearInterval(ambientInterval);
      ambientInterval = null;
    }
    if (ambientCtx) {
      ambientCtx.close().catch(() => {});
      ambientCtx = null;
    }
  }, []);

  const toggleAmbient = useCallback(() => {
    if (ambientPlaying) {
      stopAmbient();
    } else {
      startAmbient();
    }
  }, [startAmbient, stopAmbient]);

  return { playClick, playSuccess, playCoin, startAmbient, stopAmbient, toggleAmbient, isAmbientPlaying };
}
