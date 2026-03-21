import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Coins, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAudio } from "@/hooks/useAudio";
import { db } from "@/firebase";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

const QUESTIONS: Question[] = [
  {
    id: "1",
    question: "Where was our first date?",
    options: ["Coffee Shop", "Park", "Cinema", "Mall"],
    correctAnswer: "Mall",
  },
  {
    id: "2",
    question: "What is my favorite color?",
    options: ["Green", "Blue", "Rose Gold", "Black"],
    correctAnswer: "Black",
  },
  {
    id: "3",
    question: "Which month did we first meet?",
    options: ["January", "March", "July", "September"],
    correctAnswer: "July",
  },
  {
    id: "4",
    question: "What's my favorite comfort food?",
    options: ["Pizza", "Icecream", "Pasta", "Biriyani"],
    correctAnswer: "Biriyani",
  },
  {
    id: "5",
    question: "What is my favorite subject?",
    options: ["Politics", "Physics", "Maths", "Chemistry"],
    correctAnswer: "Physics",
  },

];

interface CoupleQuizProps {
  onClose: () => void;
}

export function CoupleQuiz({ onClose }: CoupleQuizProps) {
  const { user, completedActivities } = useAuth();
  const { playClick, playSuccess, playCoin } = useAudio();

  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Shuffle questions on mount
  useEffect(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5)
    }));
    setShuffledQuestions(shuffled);
  }, []);

  const currentQuestion = shuffledQuestions[currentIndex];

  const handleAnswer = (option: string) => {
    if (selectedAnswer || isGameOver) return;

    setSelectedAnswer(option);
    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      playCoin();
    } else {
      playClick();
    }

    // Wait a bit then move to next or show results
    setTimeout(() => {
      if (currentIndex < shuffledQuestions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setIsGameOver(true);
        handleGameOver(score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  };

  const handleGameOver = async (finalScore: number) => {
    if (!user) return;

    const coinsEarned = finalScore * 10;
    const isPerfect = finalScore === shuffledQuestions.length;

    try {
      const userRef = doc(db, "users", user.uid);
      const updateData: any = {
        coins: increment(coinsEarned),
        lastUpdated: new Date().toISOString()
      };

      if (!completedActivities.includes("couple-quiz")) {
        updateData.completedActivities = arrayUnion("couple-quiz");
      }

      if (isPerfect && !completedActivities.includes("couple-quiz-perfect")) {
        updateData.rewardAmount = increment(1500);
        updateData.completedActivities = arrayUnion("couple-quiz-perfect");
      }

      await updateDoc(userRef, updateData);

      if (isPerfect) {
        playSuccess();
      } else {
        playClick();
      }
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  if (shuffledQuestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6"
    >
      <div className="absolute inset-0 bg-[#060D18]/90 backdrop-blur-xl" />

      <div className="w-full max-w-sm relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-white">Couple Quiz</h2>
            <p className="text-eid-gray text-sm">How well do you know me?</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 liquid-glass rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!isGameOver ? (
            <motion.div
              key={currentIndex}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-eid-accent uppercase tracking-widest">
                  Question {currentIndex + 1} of {shuffledQuestions.length}
                </span>
                <div className="flex items-center gap-1.5 text-eid-gold">
                  <Coins className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{score * 10}</span>
                </div>
              </div>

              {/* Question Card */}
              <div className="liquid-glass-strong rounded-[32px] p-8 border border-white/10 shadow-2xl">
                <h3 className="text-xl font-bold text-white text-center leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const showCorrect = selectedAnswer && isCorrect;
                  const showWrong = selectedAnswer && isSelected && !isCorrect;

                  return (
                    <motion.button
                      key={option}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedAnswer}
                      className={`
                        w-full p-5 rounded-2xl text-left font-semibold transition-all relative overflow-hidden
                        ${isSelected ? 'ring-2 ring-white/20' : 'liquid-glass hover:bg-white/10'}
                        ${showCorrect ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : ''}
                        ${showWrong ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : ''}
                        ${!selectedAnswer ? 'text-white/80' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span>{option}</span>
                        {showCorrect && <CheckCircle2 className="w-5 h-5" />}
                        {showWrong && <XCircle className="w-5 h-5" />}
                      </div>
                      {isSelected && (
                        <motion.div
                          layoutId="active-bg"
                          className="absolute inset-0 bg-white/5"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="liquid-glass-strong rounded-[40px] p-10 text-center space-y-8 border border-white/20"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-eid-gold to-eid-gold-dark rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(212,168,83,0.4)]">
                <Trophy className="w-12 h-12 text-white" />
              </div>

              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-white">
                  {score === shuffledQuestions.length ? "Congratulations!" : "Quiz Complete!"}
                </h3>
                <p className="text-eid-gray font-medium">
                  {score === shuffledQuestions.length
                    ? "Perfect Score! Go back to hub for your reward ❤️"
                    : "Try again to win! 😄"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="liquid-glass-subtle rounded-2xl p-4">
                  <span className="block text-[10px] font-bold text-eid-gray uppercase tracking-widest mb-1">Score</span>
                  <span className="text-2xl font-bold text-white">{score}/{shuffledQuestions.length}</span>
                </div>
                <div className="liquid-glass-subtle rounded-2xl p-4">
                  <span className="block text-[10px] font-bold text-eid-gray uppercase tracking-widest mb-1">Coins</span>
                  <span className="text-2xl font-bold text-eid-gold">+{score * 10}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-eid-accent text-white font-bold shadow-lg shadow-eid-accent/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                Back to Hub
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
