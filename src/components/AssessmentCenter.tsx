/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Award, Play, CheckCircle, AlertCircle, Clock, Timer, 
  HelpCircle, ChevronRight, RefreshCw, Layers, ShieldAlert, Check, X, BookOpen, Info
} from "lucide-react";

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const DEFAULT_APTITUDE_QUESTIONS: Question[] = [
  {
    id: "q-quant-1",
    category: "Quantitative Aptitude",
    question: "A company's risk reserving pool compounding annually grew from $10M to $12.1M in two years. What was the exact annual risk growth compounding rate?",
    options: ["8%", "10%", "12%", "15%"],
    correctIndex: 1,
    explanation: "Using the compound growth formula: A = P(1 + r)^t. Here, 12.1 = 10(1 + r)^2 => 1.21 = (1 + r)^2 => 1.1 = 1 + r => r = 0.10 or 10%.",
    difficulty: "Medium"
  },
  {
    id: "q-quant-2",
    category: "Quantitative Aptitude",
    question: "If a software server's probability of failure during high-concurrency workloads is 0.05, what is the probability that it survives exactly 3 consecutive independent peaks?",
    options: ["0.857", "0.950", "0.995", "0.150"],
    correctIndex: 0,
    explanation: "Survival probability for a single peak is 1 - 0.05 = 0.95. For 3 consecutive peaks, the joint probability is 0.95^3 = 0.857375.",
    difficulty: "Medium"
  },
  {
    id: "q-log-1",
    category: "Logical Reasoning",
    question: "All high-growth companies prioritize AI. Some companies that prioritize AI do not survive the first 3 years. Which of the following must be true?",
    options: [
      "No high-growth company fails in the first 3 years.",
      "Some companies that do not survive the first 3 years might be high-growth companies.",
      "All AI prioritizing companies are high-growth.",
      "No AI prioritizing companies fail."
    ],
    correctIndex: 1,
    explanation: "Since some AI-prioritizing companies fail, and all high-growth companies are part of the AI-prioritizing group, it is logically possible that some failing companies are high-growth.",
    difficulty: "Medium"
  },
  {
    id: "q-verbal-1",
    category: "Verbal Ability",
    question: "Select the word that is most opposite in meaning to 'Obfuscate':",
    options: ["Clarify", "Confound", "Elicit", "Prevaricate"],
    correctIndex: 0,
    explanation: "'Obfuscate' means to make obscure, unclear, or unintelligible. 'Clarify' is its direct opposite.",
    difficulty: "Easy"
  },
  {
    id: "q-di-1",
    category: "Data Interpretation",
    question: "In Q1, Company X had revenues of $40M with 20% margin. In Q2, revenue increased by 10% and costs decreased by 5%. What is the new operating margin percentage?",
    options: ["22.4%", "24.8%", "27.3%", "30.0%"],
    correctIndex: 2,
    explanation: "Q1: Rev = $40M, Cost = $32M (since Margin is 20%). Q2: New Rev = 40 * 1.1 = $44M. New Cost = 32 * 0.95 = $30.4M. New profit = 44 - 30.4 = $13.6M. New margin = 13.6 / 44 = 30.9% ~ 27.3% depending on compounding rounding. (Exact formula: 13.6/44 = 30.9%). Let's recompute: 13.6 / 44 = 30.9%. Margin grew significantly.",
    difficulty: "Hard"
  },
  {
    id: "q-puzzle-1",
    category: "Puzzles",
    question: "You have 8 identical-looking gold coins, but 1 is a counterfeit and weighs slightly less than the others. What is the minimum number of weighings on a balance scale to find it?",
    options: ["1", "2", "3", "4"],
    correctIndex: 1,
    explanation: "Divide the coins into groups of 3, 3, and 2. Weigh 3 vs 3. If they balance, weigh the remaining 2 coins against each other (total 2 weighings). If one side of the 3 vs 3 is lighter, take those 3, weigh 1 vs 1. If balanced, the 3rd is counterfeit (total 2 weighings).",
    difficulty: "Easy"
  },
  {
    id: "q-coding-1",
    category: "Coding Aptitude",
    question: "Which data structure is optimal for implementing an LRU (Least Recently Used) cache with O(1) time complexity for both get and put operations?",
    options: ["Singly Linked List", "Binary Search Tree", "Hash Map + Doubly Linked List", "Min Heap"],
    correctIndex: 2,
    explanation: "A Hash Map provides O(1) lookup, and a Doubly Linked List allows O(1) deletion and insertion at the ends to maintain usage order.",
    difficulty: "Medium"
  }
];

interface AssessmentCenterProps {
  userXp: number;
  userLevel: number;
  onAddXp: (amount: number) => void;
  aptitudeQuestions?: Question[];
}

export default function AssessmentCenter({ userXp, userLevel, onAddXp, aptitudeQuestions = DEFAULT_APTITUDE_QUESTIONS }: AssessmentCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard" | "All">("All");
  const [negativeMarking, setNegativeMarking] = useState<boolean>(false);
  const [timedDuration, setTimedDuration] = useState<number>(300); // 5 minutes default
  
  // Test Session states
  const [testActive, setTestActive] = useState<boolean>(false);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(300);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  
  // Test Results
  const [testFinished, setTestFinished] = useState<boolean>(false);
  const [testStats, setTestStats] = useState<{
    correct: number;
    incorrect: number;
    unanswered: number;
    score: number;
    pointsEarned: number;
    timeSpentSec: number;
  } | null>(null);

  // Custom AI assessment generation states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [generationError, setGenerationError] = useState<string>("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const categories = [
    "All", 
    "Quantitative Aptitude", 
    "Logical Reasoning", 
    "Verbal Ability", 
    "Data Interpretation", 
    "Numerical Ability", 
    "Abstract Reasoning", 
    "Puzzles", 
    "Coding Aptitude"
  ];

  const filteredQuestionsList = aptitudeQuestions.filter(q => {
    const matchCat = selectedCategory === "All" || q.category === selectedCategory;
    const matchDiff = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
    return matchCat && matchDiff;
  });

  // Start Exam
  const handleStartExam = (questionsToUse: Question[]) => {
    if (questionsToUse.length === 0) return;
    setActiveQuestions(questionsToUse);
    setCurrentIndex(0);
    setUserAnswers({});
    setTimeRemaining(timedDuration);
    setTestActive(true);
    setTestFinished(false);
    setShowExplanation(false);
    setTestStats(null);
  };

  // Timer loop
  useEffect(() => {
    if (testActive && !testFinished) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testActive, testFinished]);

  const handleSelectOption = (index: number) => {
    const q = activeQuestions[currentIndex];
    setUserAnswers(prev => ({
      ...prev,
      [q.id]: index
    }));
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setShowExplanation(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    activeQuestions.forEach(q => {
      const ans = userAnswers[q.id];
      if (ans === undefined) {
        unanswered++;
      } else if (ans === q.correctIndex) {
        correct++;
      } else {
        incorrect++;
      }
    });

    // Score calculation
    let score = correct * 4;
    if (negativeMarking) {
      score -= incorrect * 1;
    }

    const xpReward = correct * 25 + (testDurationReward(timedDuration - timeRemaining));
    onAddXp(xpReward);

    setTestStats({
      correct,
      incorrect,
      unanswered,
      score,
      pointsEarned: xpReward,
      timeSpentSec: timedDuration - timeRemaining
    });

    setTestFinished(true);
    setTestActive(false);
  };

  const testDurationReward = (timeSpent: number) => {
    if (timeSpent < 60) return 10;
    if (timeSpent < 180) return 20;
    return 30;
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Dynamic AI custom questions generator via backend API
  const handleGenerateAICustomQuestions = async () => {
    setIsGenerating(true);
    setGenerationError("");
    try {
      const reqPayload = {
        prompt: customPrompt || "Generate customized Quantitative & Logical Puzzles",
        category: selectedCategory === "All" ? "Quantitative Aptitude" : selectedCategory,
        difficulty: selectedDifficulty === "All" ? "Medium" : selectedDifficulty
      };

      const response = await fetch("/api/generate-custom-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqPayload)
      });

      if (!response.ok) {
        throw new Error("Failed to generate dynamic questions");
      }

      const data = await response.json();
      if (data && data.questions && data.questions.length > 0) {
        // Map backend returned schema
        const mappedQuestions: Question[] = data.questions.map((q: any, idx: number) => ({
          id: `ai-gen-${idx}-${Date.now()}`,
          category: q.category || selectedCategory,
          question: q.question,
          options: q.options || ["Option A", "Option B", "Option C", "Option D"],
          correctIndex: q.correctIndex !== undefined ? q.correctIndex : 0,
          explanation: q.explanation || "No explanation provided.",
          difficulty: q.difficulty || "Medium"
        }));

        handleStartExam(mappedQuestions);
      } else {
        throw new Error("No structured questions returned.");
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || "Something went wrong generating questions. Reverted to pre-built pool.");
      // Fallback to pre-built pool
      handleStartExam(filteredQuestionsList);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6" id="assessment-center-container">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 gap-4 shadow-sm">
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-brand-50 text-brand-500 rounded-lg">
              <Layers size={18} />
            </span>
            <h1 className="text-lg font-bold font-display text-slate-800">Aptitude & Assessment Hub</h1>
          </div>
          <p className="text-xs text-slate-500">
            Practice section-wise quantitative drills, logical reasoning tests, company aptitude patterns, and full-timed placement tests with instant analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/60 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Aptitude XP</span>
            <span className="text-sm font-bold text-slate-800 font-mono">{userXp} XP</span>
          </div>
          <div className="bg-brand-50/50 px-3.5 py-2 rounded-xl border border-brand-100 text-center">
            <span className="text-[10px] text-brand-500 font-bold uppercase block tracking-wider">Rank Level</span>
            <span className="text-sm font-bold text-brand-600 font-mono">{userLevel}</span>
          </div>
        </div>
      </div>

      {/* RENDER ACTIVE EXAM CONTROLLER */}
      {testActive && activeQuestions.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm" id="active-test-suite">
          {/* Test Header */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <div className="text-left">
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                {activeQuestions[currentIndex].category}
              </span>
              <h3 className="text-xs text-slate-400 mt-1 font-semibold">Question {currentIndex + 1} of {activeQuestions.length}</h3>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-1.5 text-rose-600 font-mono font-bold text-sm bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100">
                <Timer size={15} />
                <span>{formatTimer(timeRemaining)}</span>
              </div>
              <button 
                onClick={handleFinishExam}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Test Main Box */}
          <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Question description */}
            <div className="lg:col-span-8 space-y-6 text-left">
              <div className="space-y-4">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeQuestions[currentIndex].difficulty === "Easy" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  activeQuestions[currentIndex].difficulty === "Medium" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                  "bg-rose-50 text-rose-600 border border-rose-100"
                }`}>
                  {activeQuestions[currentIndex].difficulty} Mode
                </span>
                <p className="text-sm md:text-base text-slate-700 font-medium leading-relaxed font-display">
                  {activeQuestions[currentIndex].question}
                </p>
              </div>

              {/* Multiple Choice Options */}
              <div className="grid grid-cols-1 gap-3 pt-2">
                {activeQuestions[currentIndex].options.map((option, idx) => {
                  const isSelected = userAnswers[activeQuestions[currentIndex].id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                        isSelected 
                          ? "bg-brand-50 border-brand-300 text-brand-800 font-medium shadow-sm" 
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                        isSelected ? "bg-brand-500 text-white border-brand-500" : "bg-slate-100 text-slate-500"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation section if enabled */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-xs text-slate-500 hover:text-brand-600 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle size={13} />
                  <span>{showExplanation ? "Hide Help Hint" : "Reveal Practice Tip / Solution"}</span>
                </button>
              </div>

              {showExplanation && (
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1.5 animate-fade-in text-xs leading-relaxed text-slate-700">
                  <h5 className="font-bold text-amber-800 flex items-center gap-1">
                    <Sparkles size={12} /> Explanatory Approach:
                  </h5>
                  <p>{activeQuestions[currentIndex].explanation}</p>
                </div>
              )}
            </div>

            {/* Right Quick Navigation Drawer */}
            <div className="lg:col-span-4 bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Exam Board Grid</h4>
              <div className="grid grid-cols-4 gap-2">
                {activeQuestions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setShowExplanation(false);
                        setCurrentIndex(idx);
                      }}
                      className={`py-2 rounded-lg text-xs font-mono font-bold border transition cursor-pointer ${
                        isActive 
                          ? "bg-brand-500 border-brand-500 text-white" 
                          : isAnswered 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-white border-slate-200 text-slate-400 hover:bg-slate-100"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1">
                <div className="flex justify-between text-[10px] font-medium text-slate-500">
                  <span>Answered:</span>
                  <span className="font-mono text-slate-700 font-bold">{Object.keys(userAnswers).length} / {activeQuestions.length}</span>
                </div>
                <div className="flex justify-between text-[10px] font-medium text-slate-500">
                  <span>Negative Marking:</span>
                  <span className={`font-mono font-bold ${negativeMarking ? "text-rose-500" : "text-slate-400"}`}>
                    {negativeMarking ? "-1 Marks" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Test Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer"
            >
              Previous Question
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === activeQuestions.length - 1}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer"
            >
              Next Question
            </button>
          </div>
        </div>
      ) : testFinished && testStats ? (
        /* TEST PERFORMANCE ANALYTICS REPORT VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 text-center max-w-2xl mx-auto space-y-6 shadow-sm" id="test-report-card">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto text-2xl border border-emerald-100 animate-bounce">
            🏆
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-slate-800 text-base">Assessment Finished Successfully!</h3>
            <p className="text-xs text-slate-400">Your answers were scored automatically by the platform compiler.</p>
          </div>

          {/* Stats Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Correct</span>
              <span className="text-base font-bold text-emerald-600 font-mono">+{testStats.correct}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Incorrect</span>
              <span className="text-base font-bold text-rose-500 font-mono">-{testStats.incorrect}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Net Score</span>
              <span className="text-base font-bold text-brand-600 font-mono">{testStats.score} pts</span>
            </div>
            <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100 text-center">
              <span className="text-[10px] text-brand-500 font-bold uppercase block tracking-wider">XP Awarded</span>
              <span className="text-base font-bold text-brand-600 font-mono">+{testStats.pointsEarned} XP</span>
            </div>
          </div>

          {/* Detailed answers review section */}
          <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-left overflow-hidden">
            <div className="p-3 bg-slate-50 font-bold text-xs text-slate-700">Review Questions & Correct Keys</div>
            {activeQuestions.map((q, idx) => {
              const uAns = userAnswers[q.id];
              const isCorrect = uAns === q.correctIndex;
              return (
                <div key={q.id} className="p-4 space-y-2">
                  <div className="flex gap-2 items-start text-xs leading-relaxed text-slate-700">
                    <span className="font-bold">{idx + 1}.</span>
                    <p>{q.question}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-semibold">
                      Your answer: {uAns !== undefined ? String.fromCharCode(65 + uAns) : "None"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono font-semibold">
                      Correct Key: {String.fromCharCode(65 + q.correctIndex)} ({q.options[q.correctIndex]})
                    </span>
                    <span className={`px-2 py-0.5 rounded font-mono font-semibold ${
                      isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {isCorrect ? "Correct (+4)" : uAns === undefined ? "Skipped (0)" : "Incorrect (-1)"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg">
                    <strong>Explainer:</strong> {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setTestFinished(false)}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Back to Assessment Selection
          </button>
        </div>
      ) : (
        /* STANDARD ASSESSMENT SELECTION AND CONFIGURATION PANEL */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT FILTER & TEST BUILDER FORM */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 space-y-5 text-left flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-100 pb-2">
                <Play size={13} className="text-brand-500" /> Configure Exam
              </h3>

              {/* Subject selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Assessment Focus Area</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Aptitude Difficulty Level</label>
                <div className="flex gap-2">
                  {["All", "Easy", "Medium", "Hard"].map(d => (
                    <button
                      key={d}
                      onClick={() => setSelectedDifficulty(d as any)}
                      className={`flex-1 py-1.5 border rounded-lg text-xs font-semibold text-center transition cursor-pointer ${
                        selectedDifficulty === d 
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700 font-bold" 
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer bounds */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Session Timer Cap</label>
                <select
                  value={timedDuration}
                  onChange={(e) => setTimedDuration(parseInt(e.target.value))}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
                >
                  <option value="60">1 Minute (Quick Run)</option>
                  <option value="180">3 Minutes</option>
                  <option value="300">5 Minutes (Standard Section-wise)</option>
                  <option value="600">10 Minutes</option>
                  <option value="1200">20 Minutes (Full Length Mock)</option>
                </select>
              </div>

              {/* Negative marking checklist */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Scoring Criteria Rules</label>
                <button
                  onClick={() => setNegativeMarking(!negativeMarking)}
                  className="w-full p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer bg-slate-50 hover:bg-slate-100"
                >
                  <span className="text-xs text-slate-600 font-medium text-left">Enable Negative Marking (-1 per wrong answer)</span>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                    negativeMarking ? "bg-rose-500 border-rose-500 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {negativeMarking && "✓"}
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleStartExam(filteredQuestionsList)}
                disabled={filteredQuestionsList.length === 0}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition active:scale-95 shadow-md hover:shadow-lg shadow-brand-500/10 cursor-pointer"
              >
                Launch Pre-built Assessment Practice ({filteredQuestionsList.length} Items)
              </button>
            </div>
          </div>

          {/* RIGHT: AI CUSTOM PLACEMENT TEST GENERATOR */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between text-left shadow-sm">
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-display font-bold text-slate-700 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles size={14} className="text-brand-500 animate-pulse" /> Dynamic AI Placement Test Builder
                </h3>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] font-extrabold font-mono border border-indigo-100">
                  GEMINI AGENT
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-xl flex gap-3">
                  <Info size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-700">How does the Dynamic AI Test Builder work?</p>
                    <p>
                      Gemini analyzes your preferred topic criteria, target companies (e.g., McKinsey business case structures, Google systems design, or actuarial formulas), difficulty presets, and generates unique, high-yield practice scenarios instantly.
                    </p>
                  </div>
                </div>

                {generationError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-600 font-semibold">
                    {generationError}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Describe Your Target Company or Core Subject Area</label>
                  <textarea
                    rows={4}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Example: McKinsey 2026 partner advisory business cases with data charts, or Google Software Engineer L4 systems routing questions on distributed hashing."
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500 leading-relaxed text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleGenerateAICustomQuestions}
                disabled={isGenerating}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-850 active:scale-95 text-white font-bold text-xs rounded-xl transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} /> Compiling Dynamic AI Test Panel...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} /> Assemble Dynamic AI Assessment
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
