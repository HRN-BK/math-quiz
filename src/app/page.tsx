"use client";

import React, { useState } from 'react';
import questionsData from '@/data/questions.json';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Fraction, FractionExpression } from '@/components/Fraction';
import { GeometryRenderer } from '@/components/GeometryRenderer';
import { DragDropQuestion } from '@/components/DragDropQuestion';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight, Sparkles, Star, ClipboardList } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  selectedOption: string | null;
}

export default function MathQuizApp() {
  const [hasStarted, setHasStarted] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [selectedTopic, setSelectedTopic] = useState<string>('fraction');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('mixed');
  const [currentQuestions, setCurrentQuestions] = useState<any[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  
  // Track answer history
  const [answersHistory, setAnswersHistory] = useState<AnswerRecord[]>([]);

  const question = currentQuestions[currentIndex];
  const progress = ((currentIndex) / totalQuestions) * 100;

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ffc107', '#ff4081', '#00bcd4', '#4caf50', '#7c4dff']
    });
  };

  const startQuiz = () => {
    let filteredQuestions = questionsData;
    if (selectedTopic !== 'all') {
      filteredQuestions = filteredQuestions.filter((q: any) => q.topic === selectedTopic);
    }
    if (selectedDifficulty !== 'mixed') {
      filteredQuestions = filteredQuestions.filter((q: any) => q.difficulty === selectedDifficulty);
    }
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    const finalCount = Math.min(totalQuestions, shuffled.length);
    
    setCurrentQuestions(shuffled.slice(0, finalCount));
    setTotalQuestions(finalCount);
    setHasStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setAnswersHistory([]);
  };

  const handleAnswerClick = (optionId: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(optionId);
  };

  const checkAnswer = () => {
    if (!selectedAnswer) return;
    
    setIsAnswerChecked(true);
    const isCorrect = selectedAnswer === question.correctAnswerId;
    
    if (isCorrect) {
      setScore(s => s + 1);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      toast.success("Chính xác! Giỏi quá!", {
        icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
        duration: 2000,
      });
    } else {
      toast.error("Sai mất rồi! Cố gắng câu sau nhé.", {
        icon: <XCircle className="w-6 h-6 text-red-500" />,
        duration: 3000,
      });
    }

    setAnswersHistory(prev => [...prev, {
      questionId: question.id,
      isCorrect,
      selectedOption: selectedAnswer
    }]);
  };

  const handleDragDropComplete = (isCorrect: boolean) => {
    setIsAnswerChecked(true);
    if (isCorrect) {
      setScore(s => s + 1);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      toast.success("Tuyệt vời! Bạn ghép đúng hết rồi!", {
        icon: <CheckCircle2 className="w-6 h-6 text-green-500" />
      });
    } else {
      toast.error("Chưa chính xác! Bạn kiểm tra lại nhé.", {
        icon: <XCircle className="w-6 h-6 text-red-500" />
      });
    }

    setAnswersHistory(prev => [...prev, {
      questionId: question.id,
      isCorrect,
      selectedOption: "drag-drop"
    }]);
  };

  const nextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setShowResult(true);
      setTimeout(() => triggerConfetti(), 300);
    }
  };

  const restartQuiz = () => {
    setHasStarted(false);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setAnswersHistory([]);
  };

  if (showResult) {
    const scoreScale10 = ((score / totalQuestions) * 10).toFixed(1).replace('.0', '');

    return (
      <div className="h-screen h-[100dvh] bg-slate-100 flex flex-col items-center justify-center font-sans overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 z-0 animate-[pulse_10s_ease-in-out_infinite]"></div>
        
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="w-full max-w-5xl h-full sm:h-[90vh] flex flex-col md:flex-row gap-4 relative z-10">
          
          {/* Left: Summary Card */}
          <Card className="w-full md:w-1/3 flex flex-col items-center justify-center text-center p-6 shadow-2xl border-4 border-white rounded-[2rem] bg-gradient-to-b from-white to-blue-50 relative shrink-0">
            <motion.div 
              animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }} 
              transition={{ repeat: Infinity, duration: 3 }}
              className="bg-gradient-to-br from-yellow-300 to-orange-400 w-24 h-24 flex items-center justify-center rounded-[1.5rem] mb-4 shadow-lg border-4 border-white rotate-3"
            >
              <Trophy className="w-12 h-12 text-white drop-shadow-md" />
            </motion.div>
            
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              Hoàn Thành!
            </h2>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-blue-100 w-full my-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-widest uppercase">
                Điểm số
              </div>
              <div className="text-6xl font-black text-blue-600 mt-2">
                {scoreScale10}
              </div>
              <div className="text-slate-400 font-bold mt-1">/ 10 điểm</div>
            </div>

            <div className="text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 mb-6">
              Trả lời đúng: <span className="text-green-600 text-lg">{score}</span> / {totalQuestions} câu
            </div>

            <Button onClick={restartQuiz} className="w-full rounded-2xl h-14 text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg border-b-4 border-indigo-700 active:translate-y-1 active:border-b-0">
              <RotateCcw className="w-5 h-5 mr-2" /> Chơi Lại Nào!
            </Button>
          </Card>

          {/* Right: History Scrollable List */}
          <Card className="flex-1 shadow-2xl border-4 border-white rounded-[2rem] bg-white flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white shrink-0 shadow-sm flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-blue-200" />
              <h3 className="text-xl font-bold">Chi tiết bài làm</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-50 space-y-4">
              {currentQuestions.map((q, idx) => {
                const record = answersHistory[idx];
                if (!record) return null;
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                    key={q.id + idx} 
                    className={`p-4 sm:p-5 rounded-[1.5rem] border-2 shadow-sm relative ${
                      record.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    <div className="absolute top-4 right-4">
                      {record.isCorrect ? (
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
                          <CheckCircle2 className="w-4 h-4" /> ĐÚNG
                        </div>
                      ) : (
                        <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-200">
                          <XCircle className="w-4 h-4" /> SAI
                        </div>
                      )}
                    </div>

                    <div className="font-bold text-slate-800 text-base sm:text-lg mb-3 pr-20">
                      <span className="text-slate-400 mr-2">Câu {idx + 1}.</span>
                      {q.question}
                    </div>

                    {/* Question Content (Visuals) */}
                    {(q.fractions || q.geometry || q.arithmetic) && (
                      <div className="bg-white p-3 rounded-xl border border-slate-100 inline-flex items-center justify-center mb-3 min-w-[120px] shadow-sm overflow-hidden">
                        <div className="scale-75 sm:scale-90 origin-left">
                          {q.fractions && <FractionExpression fractions={q.fractions} />}
                          {q.geometry && <GeometryRenderer geom={q.geometry} />}
                          {q.arithmetic && (
                            <div className="text-3xl font-black text-slate-700 tracking-wider">
                              {q.arithmetic}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="text-sm font-medium text-slate-700 bg-white p-3 rounded-xl border border-slate-100 flex items-start gap-2 shadow-inner">
                        <Sparkles className={`w-5 h-5 shrink-0 ${record.isCorrect ? 'text-green-500' : 'text-amber-500'}`} />
                        <div>
                          <strong className="text-slate-900">Giải thích: </strong>
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </Card>

        </motion.div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="h-screen h-[100dvh] bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 45, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute top-10 left-10 text-cyan-300 opacity-50">
          <Sparkles size={80} />
        </motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -45, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute bottom-10 right-10 text-indigo-300 opacity-50">
          <Star size={100} />
        </motion.div>

        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="w-full h-full max-w-6xl max-h-[90vh] flex flex-col md:flex-row bg-white/90 backdrop-blur-md shadow-2xl rounded-[2.5rem] border-4 border-white overflow-hidden relative z-10 m-4">
            
            {/* Left Hero Section */}
            <div className="flex-1 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-8 flex flex-col items-center justify-center text-white relative overflow-hidden hidden md:flex">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 mb-6 rounded-full bg-white/10 p-2 shadow-2xl backdrop-blur-sm border-2 border-white/20">
                  <img src="/math_mascot.png" alt="Math Mascot" className="w-full h-full object-contain rounded-full drop-shadow-2xl" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-center mb-4 tracking-tight drop-shadow-lg leading-tight">
                  Vui Học <span className="text-yellow-300">Toán</span>
                </h1>
                <p className="text-lg sm:text-xl text-blue-100 text-center max-w-sm font-medium">
                  Cùng phiêu lưu vào thế giới toán học đầy màu sắc! Cú thông thái đang chờ bạn!
                </p>
              </div>
            </div>

            {/* Right Configuration Section */}
            <div className="flex-1 flex flex-col p-6 sm:p-10 lg:p-12 overflow-y-auto bg-slate-50">
              <div className="md:hidden flex flex-col items-center mb-8">
                <div className="w-32 h-32 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-lg">
                  <img src="/math_mascot.png" alt="Math Mascot" className="w-full h-full object-contain rounded-full bg-white" />
                </div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-center">Vui Học Toán</h2>
              </div>
              
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black">1</div>
                  <h3 className="text-xl font-bold text-slate-700">Chọn Chủ Đề</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {[
                    { id: 'fraction', icon: '½', title: 'Phân số', desc: 'Cộng trừ nhân chia', color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/30' },
                    { id: 'geometry', icon: '▲', title: 'Hình học', desc: 'Chu vi & Diện tích', color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/30' },
                    { id: 'basic_1_digit', icon: '1', title: 'Cơ bản', desc: 'Số 1 chữ số', color: 'from-emerald-400 to-green-500', shadow: 'shadow-green-500/30' },
                    { id: 'basic_2_digit', icon: '10', title: 'Nâng cao', desc: 'Số 2 chữ số', color: 'from-rose-400 to-red-500', shadow: 'shadow-red-500/30' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTopic(t.id)}
                      className={`relative flex flex-col items-start p-4 sm:p-5 rounded-2xl transition-all duration-300 border-2 text-left group overflow-hidden ${
                        selectedTopic === t.id 
                        ? `border-transparent bg-gradient-to-br ${t.color} text-white shadow-lg ${t.shadow} scale-[1.02]`
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {selectedTopic === t.id && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full blur-2xl -mr-8 -mt-8"></div>
                      )}
                      <div className={`text-2xl sm:text-3xl font-black mb-2 px-3 py-1 rounded-lg ${selectedTopic === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                        {t.icon}
                      </div>
                      <div className={`font-bold text-base sm:text-xl ${selectedTopic === t.id ? 'text-white' : 'text-slate-800'}`}>{t.title}</div>
                      <div className={`text-xs sm:text-sm font-medium mt-1 ${selectedTopic === t.id ? 'text-white/80' : 'text-slate-400'}`}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black">2</div>
                  <h3 className="text-xl font-bold text-slate-700">Mức Độ Khó</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { id: 'easy', icon: '🌱', label: 'Dễ' },
                    { id: 'medium', icon: '🚀', label: 'Vừa' },
                    { id: 'hard', icon: '🔥', label: 'Khó' },
                    { id: 'mixed', icon: '🎲', label: 'Trộn' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDifficulty(d.id)}
                      className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all duration-300 ${
                        selectedDifficulty === d.id
                        ? 'bg-blue-50 border-blue-500 shadow-md scale-105'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{d.icon}</div>
                      <div className={`font-bold text-sm ${selectedDifficulty === d.id ? 'text-blue-700' : 'text-slate-600'}`}>{d.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black">3</div>
                  <h3 className="text-xl font-bold text-slate-700">Số Câu Hỏi</h3>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {[10, 20, 30, 40, 50].map((num) => (
                    <button
                      key={num}
                      onClick={() => setTotalQuestions(num)}
                      className={`flex-1 min-w-[60px] h-12 sm:h-14 rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 flex items-center justify-center ${
                        totalQuestions === num
                        ? 'bg-slate-800 text-white shadow-md scale-105'
                        : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {num} câu
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 flex justify-center">
                <Button 
                  onClick={startQuiz}
                  className="w-full max-w-md py-6 sm:py-8 text-xl sm:text-2xl font-black rounded-3xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white shadow-[0_15px_40px_-10px_rgba(20,184,166,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 border-b-[6px] border-teal-700 active:border-b-0 active:translate-y-[6px] relative overflow-hidden group animate-pulse hover:animate-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                  <span className="flex items-center gap-3 drop-shadow-md">
                    BẮT ĐẦU NGAY 🚀
                  </span>
                </Button>
              </div>

            </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen h-[100dvh] bg-slate-50 flex flex-col font-sans overflow-hidden relative">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div animate={{ x: [0, 30, 0], y: [0, 40, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -left-20 w-[30rem] h-[30rem] bg-blue-200/40 rounded-full blur-3xl"></motion.div>
        <motion.div animate={{ x: [0, -30, 0], y: [0, -40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute -bottom-20 -right-20 w-[40rem] h-[40rem] bg-indigo-200/40 rounded-full blur-3xl"></motion.div>
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
      </div>

      {/* Header with Duolingo-style Progress */}
      <header className="relative z-10 w-full px-4 py-4 shrink-0 max-w-4xl mx-auto flex items-center gap-4">
        <button onClick={restartQuiz} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
          <XCircle className="w-8 h-8" strokeWidth={2.5} />
        </button>
        <div className="flex-1 h-5 bg-slate-200 rounded-full overflow-hidden relative shadow-inner border-[3px] border-slate-100">
          <motion.div 
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 50 }}
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 relative"
          >
            <div className="absolute top-1 left-2 right-2 h-1.5 bg-white/30 rounded-full"></div>
          </motion.div>
        </div>
        <div className="flex items-center gap-2 text-amber-500 font-black text-xl shrink-0">
          <svg className="w-8 h-8 drop-shadow-sm fill-amber-400 stroke-amber-600 stroke-[1.5]" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          {score}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto p-2 sm:p-4 flex flex-col justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full h-full flex flex-col md:flex-row shadow-2xl border-4 border-white rounded-[2rem] overflow-hidden bg-white max-h-[90vh]"
          >
            {/* Left Column: Question & Options */}
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 border-b md:border-b-0 md:border-r-2 border-slate-100">
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-3 sm:p-4 text-white shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-lg"></div>
                <h2 className="text-base sm:text-lg font-bold leading-snug relative z-10 drop-shadow-md text-center">
                  {question.question}
                </h2>
              </div>
              
              <div className="p-2 sm:p-4 flex-1 flex flex-col justify-evenly">
                {/* Visual Elements */}
                {(question.fractions || question.geometry || question.arithmetic || question.type !== 'drag-drop') && (
                  <div className="mb-2 sm:mb-4 min-h-[70px] flex items-center justify-center bg-white rounded-2xl p-2 sm:p-3 border-2 border-slate-100 shadow-sm shrink-0">
                    {question.fractions && <FractionExpression fractions={question.fractions} />}
                    {question.geometry && <GeometryRenderer geom={question.geometry} />}
                    {question.arithmetic && (
                      <div className="text-5xl sm:text-6xl font-black text-slate-700 tracking-wider">
                        {question.arithmetic}
                      </div>
                    )}
                    {(!question.fractions && !question.geometry && !question.arithmetic && question.type !== 'drag-drop') && (
                      <span className="text-slate-400 font-medium">Chọn một đáp án đúng nhất</span>
                    )}
                  </div>
                )}

                {/* Question Interactions */}
                {question.type === 'multiple-choice' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {question.options?.map((option: any, index: number) => {
                      const isSelected = selectedAnswer === option.id;
                      const isCorrect = option.id === question.correctAnswerId;
                      
                      let btnStateClass = "bg-white border-slate-200 border-b-[6px] hover:border-blue-400 hover:bg-blue-50 hover:-translate-y-1 hover:shadow-md text-slate-700 active:border-b-0 active:translate-y-[6px]";
                      
                      if (isAnswerChecked) {
                        if (isCorrect) {
                          btnStateClass = "bg-green-50 border-green-500 border-b-[6px] text-green-800 shadow-md";
                        } else if (isSelected && !isCorrect) {
                          btnStateClass = "bg-red-50 border-red-400 border-b-[6px] text-red-700 opacity-70";
                        } else {
                          btnStateClass = "bg-slate-50 border-slate-200 border-b-[6px] opacity-40";
                        }
                      } else if (isSelected) {
                        btnStateClass = "bg-blue-50 border-blue-500 border-b-[6px] text-blue-800 shadow-md scale-[1.02] transform ring-4 ring-blue-500/20";
                      }

                      return (
                        <motion.button
                          key={option.id + question.id}
                          initial={{ opacity: 0, y: 20, scale: 0.9 }}
                          animate={
                            isAnswerChecked && isSelected && !isCorrect 
                            ? { opacity: 1, y: 0, scale: 1, x: [-5, 5, -5, 5, 0], transition: { duration: 0.3 } }
                            : { opacity: 1, y: 0, scale: 1 }
                          }
                          transition={{ duration: 0.2, delay: index * 0.08 }}
                          onClick={() => handleAnswerClick(option.id)}
                          disabled={isAnswerChecked}
                          className={`relative p-3 sm:p-4 rounded-2xl text-base font-bold transition-all text-left flex items-center gap-3 border-2 ${btnStateClass}`}
                        >
                          <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shadow-inner
                            ${isAnswerChecked && isCorrect ? 'bg-green-500 text-white' : 
                              isAnswerChecked && isSelected && !isCorrect ? 'bg-red-500 text-white' : 
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}
                          `}>
                            {option.id}
                          </span>
                          
                          <div className="flex-1 flex justify-center text-xl font-bold">
                            {option.type === 'fraction' ? (
                              <Fraction numerator={option.value.numerator} denominator={option.value.denominator} />
                            ) : (
                              <span>{option.value}</span>
                            )}
                          </div>
                          
                          {isAnswerChecked && isCorrect && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg z-10">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </motion.div>
                          )}
                          {isAnswerChecked && isSelected && !isCorrect && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg z-10">
                              <XCircle className="w-5 h-5 text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {question.type === 'drag-drop' && (
                  <DragDropQuestion question={question} onComplete={handleDragDropComplete} />
                )}
              </div>
            </div>

            {/* Right Column: Progress, Feedback & Actions */}
            <div className="w-full md:w-1/3 flex flex-col bg-white shrink-0">
              
              {/* Progress Section Removed from here */}

              {/* Feedback Section */}
              <div className="flex-1 p-5 flex flex-col justify-center min-h-[140px] bg-white relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none"></div>
                {isAnswerChecked && question.explanation ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl text-amber-900 shadow-md relative z-10"
                  >
                    <strong className="flex items-center gap-1.5 text-amber-600 mb-2 text-sm uppercase tracking-wider">
                      <Sparkles className="w-5 h-5 animate-pulse" /> Lời giải:
                    </strong>
                    <p className="text-base font-bold leading-relaxed">{question.explanation}</p>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300 opacity-60 space-y-3 relative z-10">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center shadow-inner">
                      <Star className="w-8 h-8 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-center px-4 tracking-wide">Chọn đáp án để xem giải thích nhé!</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t-2 border-slate-100 mt-auto">
                {question.type === 'multiple-choice' && !isAnswerChecked ? (
                  <Button 
                    onClick={checkAnswer} 
                    disabled={!selectedAnswer}
                    className="w-full rounded-2xl h-14 text-xl font-bold bg-blue-500 hover:bg-blue-600 border-b-[6px] border-blue-700 active:translate-y-[6px] active:border-b-0 shadow-sm"
                  >
                    Kiểm Tra
                  </Button>
                ) : null}

                {isAnswerChecked && (
                  <Button 
                    onClick={nextQuestion} 
                    className="w-full rounded-2xl h-14 text-xl font-bold bg-green-500 hover:bg-green-600 text-white border-b-[6px] border-green-700 active:translate-y-[6px] active:border-b-0 shadow-md"
                  >
                    {currentIndex < totalQuestions - 1 ? 'Tiếp Tục' : 'Hoàn Thành'} 
                  </Button>
                )}
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
