/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Award, User, Target, Calendar, CheckSquare, MessageSquare, 
  Send, BrainCircuit, TrendingUp, AlertTriangle, Lightbulb, Check, Compass, 
  RefreshCw, BookOpen, ChevronRight, HelpCircle, ArrowRight, Layers, HelpCircle as QuizIcon,
  Search, Bookmark, Sliders, PlayCircle, Star, ThumbsUp, RotateCcw
} from "lucide-react";
import { CareerPreferences } from "../types";

interface AIMentorHubProps {
  userXp: number;
  userLevel: number;
  userStreak: number;
  userBadges: string[];
  userRole: string;
  careerPrefs: CareerPreferences;
  onAddXp: (xp: number) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "mentor";
  text: string;
  timestamp: string;
}

interface RoadmapWeek {
  week: string;
  focus: string;
  tasks: string[];
  resources: {
    books: string[];
    courses: string[];
    cheatsheets: string[];
  };
}

interface SkillGapItem {
  skill: string;
  importance: "Critical" | "High" | "Medium";
  requiredLevel: number;
  currentLevel: number;
  description: string;
  recommendations: string[];
}

interface Flashcard {
  id: string;
  category: "Quantitative" | "System Design" | "Behavioral" | "Finance & Risk";
  question: string;
  answer: string;
  difficulty?: "Easy" | "Medium" | "Hard";
}

interface CheatSheetItem {
  title: string;
  category: string;
  formula?: string;
  explanation: string;
  example: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export default function AIMentorHub({ 
  userXp, 
  userLevel, 
  userStreak, 
  userBadges,
  userRole,
  careerPrefs,
  onAddXp 
}: AIMentorHubProps) {
  const [activeSegment, setActiveSegment] = useState<"coach" | "roadmap" | "learning" | "analytics">("coach");
  
  // Dynamic Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-init",
      sender: "mentor",
      text: `Hello! I am your AI Career Mentor. I've custom-tailored my models to target your dream role of ${userRole || "Strategic Practitioner"} at ${careerPrefs.targetCompanies.join(", ") || "elite enterprises"}.\n\nAsk me anything about resume optimizations, mathematical formulas, case-study prep, system design scaling, or offer negotiation tactics!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendChatMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputMessage;
    if (!rawText.trim() || isSending) return;
    
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: rawText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/mentor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          userStats: { xp: userXp, level: userLevel, streak: userStreak }
        })
      });

      if (!response.ok) throw new Error("Failed to contact mentor");

      const data = await response.json();
      const mentorMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        sender: "mentor",
        text: data.reply || "I am processing your criteria. Try structured learning pathways.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, mentorMsg]);
    } catch (err) {
      console.error(err);
      const mentorMsgFallback: ChatMessage = {
        id: `m-${Date.now()}`,
        sender: "mentor",
        text: "I am having minor communication issues, but here's an elite performance tip: Ensure your technical answers start with high-level architecture before drilling into specific details. Try practicing an aptitude test!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, mentorMsgFallback]);
    } finally {
      setIsSending(false);
    }
  };

  // MODULE 3: ROADMAP & SKILL GAP STATE
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapWeek[]>([
    {
      week: "Week 1",
      focus: "Quantitative Foundations & Core Aptitudes",
      tasks: [
        "Solve 10 Practice Questions inside Sectional Aptitude Hub",
        "Revise Bayes' Theorem and Compound Rate probability models",
        "Perform initial ATS resume scan for target role keyword frequency"
      ],
      resources: {
        books: ["Quantitative Aptitude for Competitive Examinations", "Cracking the Coding Interview"],
        courses: ["Advanced Discrete Mathematics Fundamentals", "Systematic Consulting Frameworks"],
        cheatsheets: ["Probability Cheat Sheet", "Big-O Notation Matrix"]
      }
    },
    {
      week: "Week 2",
      focus: "Technical Architecture & System Design Frameworks",
      tasks: [
        "Study cache synchronization and horizonal database splitting models",
        "Conduct mock stress simulator session with 'Strict' AI Interviewer",
        "Review resume bullet points targeting high-impact metric layouts"
      ],
      resources: {
        books: ["Designing Data-Intensive Applications", "System Design Interview"],
        courses: ["Distributed Systems Masterclass", "Cloud Engineering Paradigms"],
        cheatsheets: ["Database Scalability Matrix", "Microservices Design Cheat Sheet"]
      }
    },
    {
      week: "Week 3",
      focus: "Behavioral Alignment & STAR Messaging",
      tasks: [
        "Rephrase core conflict achievements using Action-Result metrics",
        "Take adaptive behavioral simulations under Stress Personality model",
        "Participate in daily written business essay and communication practices"
      ],
      resources: {
        books: ["The 2-Hour Job Search", "Highly Effective Behavioral Interviews"],
        courses: ["Executive Communications & Leadership", "SaaS Business Case Studies"],
        cheatsheets: ["STAR Framework Formula", "Aptitude Vocabulary Builder"]
      }
    },
    {
      week: "Week 4",
      focus: "Company-specific Mock Evaluations & Offer Prep",
      tasks: [
        "Simulate complete 30-minute Panel Mock interview on target companies",
        "Resolve finance valuation calculations and black-scholes options",
        "Fine-tune salary negotiation counters and networking scripts"
      ],
      resources: {
        books: ["Case In Point: Complete Case Prep", "Never Split the Difference"],
        courses: ["Advanced Option Pricing Models", "McKinsey Profitability Frameworks"],
        cheatsheets: ["Finance Formulation Sheet", "Offer Negotiation Framework"]
      }
    }
  ]);

  const [skillGaps, setSkillGaps] = useState<SkillGapItem[]>([
    {
      skill: "System Design & Distributed Scalability",
      importance: "Critical",
      requiredLevel: 4,
      currentLevel: 2,
      description: "Targeting elite tech firms requires a strong understanding of high-concurrency caches, message queues, and replication logs.",
      recommendations: ["Read chapter 4 of Designing Data-Intensive Applications", "Review the Distributed Scalability Cheat Sheet in our Learning Hub"]
    },
    {
      skill: "Quantitative Speed & Probability resourcing",
      importance: "High",
      requiredLevel: 5,
      currentLevel: 3,
      description: "Analytical finance and consultant roles evaluate numerical solving speed for complex risk assessments.",
      recommendations: ["Practice timed quantitative sectional tests", "Review Bayes Theorem and Poisson distributions formulation grids"]
    },
    {
      skill: "Structured Case Operations Frameworks",
      importance: "Medium",
      requiredLevel: 4,
      currentLevel: 2,
      description: "Consulting and business analysts must structure answers using strategic profitability trees and cost isolating structures.",
      recommendations: ["Study profitability trees and operational case studies", "Solve McKinsey framework practices"]
    }
  ]);

  const fetchDynamicRoadmapAndGaps = async () => {
    setIsRoadmapLoading(true);
    try {
      const response = await fetch("/api/mentor/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userRole: userRole || "Practitioner Candidate",
          careerPrefs,
          userLevel: `Level ${userLevel}`
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.roadmap) setRoadmap(data.roadmap);
        if (data.gaps) setSkillGaps(data.gaps);
      }
    } catch (err) {
      console.error("Failed to generate dynamic roadmap:", err);
    } finally {
      setIsRoadmapLoading(false);
    }
  };

  // MODULE 8: LEARNING HUB - FLASHCARDS & REVISION STATE
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: "f-1",
      category: "Quantitative",
      question: "What is Bayes' Theorem formula, and what does it calculate?",
      answer: "P(A|B) = [P(B|A) * P(A)] / P(B)\n\nIt calculates the conditional probability of event A occurring given that event B has occurred, updating prior beliefs with objective observational evidence."
    },
    {
      id: "f-2",
      category: "System Design",
      question: "Explain the CAP Theorem and its three fundamental trade-offs.",
      answer: "A distributed system can guarantee at most two of three criteria:\n\n1. Consistency (C): Every read returns the most recent write.\n2. Availability (A): Every non-failing node returns a response.\n3. Partition Tolerance (P): The system continues operating despite message losses.\n\nIn partition cases, you must choose either Consistency (CP) or Availability (AP)."
    },
    {
      id: "f-3",
      category: "Behavioral",
      question: "What are the components of the STAR Method for behavioral interview answers?",
      answer: "STAR stands for:\n\n1. Situation: Set the scene and context.\n2. Task: Describe your responsibility in the scenario.\n3. Action: Detail the explicit steps you personally executed.\n4. Result: State the quantified business outcomes and metrics achieved."
    },
    {
      id: "f-4",
      category: "Finance & Risk",
      question: "What is the capital asset pricing model (CAPM) formula and purpose?",
      answer: "Expected Return = Rf + β * (Rm - Rf)\n\nWhere Rf is risk-free rate, β is asset sensitivity, and Rm is market return.\n\nIt calculates the theoretically appropriate required rate of return of an asset, accounting for systematic portfolio risk."
    },
    {
      id: "f-5",
      category: "System Design",
      question: "What is horizontal scaling vs vertical scaling?",
      answer: "Vertical Scaling: Adding more power (CPU, RAM, Storage) to a single machine.\nHorizontal Scaling: Adding more machines to your network pool, distributing database load through sharding, routing, and horizontal replicas."
    }
  ]);

  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardFilter, setFlashcardFilter] = useState<string>("All");

  const filteredFlashcards = flashcardFilter === "All" 
    ? flashcards 
    : flashcards.filter(c => c.category === flashcardFilter);

  const activeCard = filteredFlashcards[currentCardIdx % filteredFlashcards.length] || flashcards[0];

  const handleFlashcardRating = (difficulty: "Easy" | "Medium" | "Hard") => {
    onAddXp(15); // Reward 15 XP for reviewing flashcards
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIdx(prev => (prev + 1) % filteredFlashcards.length);
    }, 200);
  };

  // MODULE 8: FORMULAS & CHEAT SHEETS
  const [searchFormulaQuery, setSearchFormulaQuery] = useState("");
  const cheatSheets: CheatSheetItem[] = [
    {
      title: "Bayes' Theorem",
      category: "Probability",
      formula: "P(A|B) = [ P(B|A) * P(A) ] / P(B)",
      explanation: "Calculates updated conditional probability based on prior probability parameters and new observations.",
      example: "Used in medical diagnostic false-positives and spam filtering algorithms."
    },
    {
      title: "Black-Scholes Options Model",
      category: "Finance & Risk",
      formula: "C = S * N(d1) - K * e^(-r*t) * N(d2)",
      explanation: "A mathematical valuation model used to calculate the theoretical pricing of European call and put options.",
      example: "Employed globally by insurance funds and financial desks for option pricing valuations."
    },
    {
      title: "Compound Interest Metric",
      category: "Aptitude Mathematics",
      formula: "A = P * (1 + r/n)^(n*t)",
      explanation: "Isolates the future value of an initial investment principal under compound interest cycles.",
      example: "Priceless calculation in bank placement tests and financial aptitude questions."
    },
    {
      title: "Amdahl's Law",
      category: "System Design",
      formula: "Latency(S) = 1 / [ (1 - p) + (p / s) ]",
      explanation: "Estimates the theoretical speedup of execution of a program when utilizing horizontal parallel processors.",
      example: "Used to justify high-performance computing clusters and multi-core architectures."
    },
    {
      title: "Weighted Average Cost of Capital (WACC)",
      category: "Corporate Valuation",
      formula: "WACC = (E/V * Re) + (D/V * Rd * (1 - Tc))",
      explanation: "Calculates a firm's average cost of raising financing across equity, debt, and corporate tax rates.",
      example: "Strategic metric in consulting profitability frameworks and corporate accounting interviews."
    }
  ];

  const filteredCheatSheets = cheatSheets.filter(cs => 
    cs.title.toLowerCase().includes(searchFormulaQuery.toLowerCase()) ||
    cs.category.toLowerCase().includes(searchFormulaQuery.toLowerCase()) ||
    cs.explanation.toLowerCase().includes(searchFormulaQuery.toLowerCase())
  );

  // MODULE 8: DAILY QUICK QUIZ CHALLENGE
  const [dailyQuizCompleted, setDailyQuizCompleted] = useState(false);
  const [currentQuizQuestionIdx, setCurrentQuizQuestionIdx] = useState(0);
  const [selectedQuizOptionIdx, setSelectedQuizOptionIdx] = useState<number | null>(null);
  const [showQuizAnswerFeedback, setShowQuizAnswerFeedback] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const quizQuestions: QuizQuestion[] = [
    {
      id: "q-1",
      question: "Which pattern is used to distribute database write loads horizontally across multiple database node clusters?",
      options: [
        "Horizontal Database Sharding",
        "Distributed In-Memory Caching",
        "Single-Leader Replication logs",
        "Continuous Database Compression"
      ],
      answerIndex: 0,
      explanation: "Database sharding partitions database rows and schemas across multiple node clusters, effectively scaling write and storage capacity horizontally."
    },
    {
      id: "q-2",
      question: "A company doubles its parallel server counts from 2 to 4. If only 40% of the program can be parallelized, what is the maximum speedup estimated by Amdahl's Law?",
      options: [
        "1.25x speedup",
        "1.43x speedup",
        "2.00x speedup",
        "1.67x speedup"
      ],
      answerIndex: 1,
      explanation: "By Amdahl's Law: Latency = 1 / [(1 - 0.4) + (0.4 / 2)] = 1.25 for 2 cores, and 1 / [(1 - 0.4) + (0.4 / 4)] = 1 / [0.6 + 0.1] = 1 / 0.7 ≈ 1.43x speedup."
    },
    {
      id: "q-3",
      question: "Which of the following behavioral answers best structures the STAR Framework outcome criteria?",
      options: [
        "Explaining that the overall task was highly stressful and fast-paced",
        "Stating: 'We launched the API and boosted daily active queries by 24% in Week 2'",
        "Listing all team members who contributed to writing code modules",
        "Describing the general business history of the company in detail"
      ],
      answerIndex: 1,
      explanation: "The STAR Framework's 'Result' criteria requires quantified, clear business outcomes like 'boosted active queries by 24% in Week 2'."
    }
  ];

  const handleQuizAnswerSubmit = (optionIdx: number) => {
    if (showQuizAnswerFeedback) return;
    setSelectedQuizOptionIdx(optionIdx);
    setShowQuizAnswerFeedback(true);
    if (optionIdx === quizQuestions[currentQuizQuestionIdx].answerIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizOptionIdx(null);
    setShowQuizAnswerFeedback(false);
    if (currentQuizQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuizQuestionIdx(prev => prev + 1);
    } else {
      setDailyQuizCompleted(true);
      onAddXp(50); // Give 50 XP upon daily quiz completion!
    }
  };

  const handleResetQuiz = () => {
    setDailyQuizCompleted(false);
    setCurrentQuizQuestionIdx(0);
    setSelectedQuizOptionIdx(null);
    setShowQuizAnswerFeedback(false);
    setQuizScore(0);
  };

  return (
    <div className="space-y-6" id="ai-mentor-hub-suite">
      
      {/* SECTOR SELECTOR BAR */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex-wrap gap-3" id="mentor-hub-segments">
        <div className="flex gap-1 flex-wrap">
          {[
            { id: "coach", label: "Interactive AI Coach", icon: BrainCircuit },
            { id: "roadmap", label: "Strategic Roadmap & Skill Gaps", icon: Target },
            { id: "learning", label: "Learning Hub & Flashcards", icon: BookOpen },
            { id: "analytics", label: "Performance Mastery Analytics", icon: TrendingUp }
          ].map(segment => {
            const Icon = segment.icon;
            const isActive = activeSegment === segment.id;
            return (
              <button
                key={segment.id}
                onClick={() => {
                  setActiveSegment(segment.id as any);
                  if (segment.id === "roadmap") {
                    fetchDynamicRoadmapAndGaps();
                  }
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isActive 
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/10" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                }`}
              >
                <Icon size={14} />
                <span>{segment.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-xl border border-amber-100/60 shrink-0">
          <span className="text-[10px] text-amber-700 font-bold font-mono">STREAK: {userStreak} DAYS 🔥</span>
        </div>
      </div>

      {/* RENDER INTERACTIVE COACH CHAT */}
      {activeSegment === "coach" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch" id="interactive-coaching-suite">
          
          {/* Chat main body */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm flex flex-col h-[520px]">
            {/* Chat Header */}
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-left">
              <div>
                <span className="text-[9px] bg-brand-100 text-brand-700 font-extrabold uppercase px-2 py-0.5 rounded">
                  Mentor AI Co-pilot
                </span>
                <h3 className="text-xs text-slate-400 font-semibold mt-1">Chat live about formulas, distributed systems scaling, and career strategies.</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /> Live Client
              </div>
            </div>

            {/* Messages Scrollbox */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left">
              {messages.map(m => {
                const isMentor = m.sender === "mentor";
                return (
                  <div key={m.id} className={`flex gap-3 max-w-[85%] ${isMentor ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isMentor ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-slate-900 text-white"
                    }`}>
                      {isMentor ? "🤖" : "ME"}
                    </div>
                    <div className={`space-y-1 p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMentor ? "bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100" : "bg-indigo-600 text-white rounded-tr-none"
                    }`}>
                      <p className="whitespace-pre-line font-medium">{m.text}</p>
                      <span className="text-[9px] opacity-40 block text-right pt-1 font-mono">{m.timestamp}</span>
                    </div>
                  </div>
                );
              })}
              {isSending && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs">
                    🤖
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input control */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendChatMessage();
                }}
                placeholder="Ask: 'How to structure case study revenue questions?' or 'Explain CAP Theorem'"
                className="flex-1 bg-white border border-slate-200 focus:border-brand-500 focus:outline-none px-4 py-2.5 rounded-xl text-xs text-slate-700"
              />
              <button
                onClick={() => handleSendChatMessage()}
                disabled={isSending || !inputMessage.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* Quick-Start Prompts & Static Tutoring Tips */}
          <div className="lg:col-span-4 space-y-4 text-left">
            
            {/* Quick start tags */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" /> Strategic Prompt Starters
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Select any item to launch an automated coach consultation response:</p>
              
              <div className="flex flex-col gap-2 pt-1">
                {[
                  "Explain McKinsey Case profitability trees",
                  "What is Solvency II reserving in Insurance?",
                  "Give 3 technical system design scalability hacks",
                  "Explain STAR methodology with a software engineer example",
                  "What are high impact salary negotiation strategies?"
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendChatMessage(promptText)}
                    disabled={isSending}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-xl text-[11px] font-bold text-slate-600 hover:text-indigo-700 transition text-left cursor-pointer truncate"
                  >
                    ✦ {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Coaching Tips */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 space-y-3 shadow-md">
              <h4 className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest flex items-center gap-1">
                <Award size={13} className="text-amber-400" /> Executive Coaching Rule
              </h4>
              <p className="text-xs font-medium leading-relaxed text-indigo-100">
                "When simulating stress mock interviews, never jump straight to the final answer. Real directors evaluate your logical framework, structuring processes, and how you handle pushbacks and edge cases."
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-indigo-300 font-bold font-mono">
                <span>— Boardroom Recruiter Agent</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODULE 3: STRATEGIC ROADMAP & SKILL GAP ANALYSIS */}
      {activeSegment === "roadmap" && (
        <div className="space-y-6" id="strategic-roadmap-panel">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 border border-slate-200 rounded-2xl shadow-sm text-left">
            <div>
              <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
                <Target className="text-indigo-600 animate-pulse" size={16} /> Targeted Week-by-Week Action Plan
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Custom career roadmaps generated by analyzed target job descriptions & profile choices.</p>
            </div>
            <button
              onClick={fetchDynamicRoadmapAndGaps}
              disabled={isRoadmapLoading}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isRoadmapLoading ? (
                <>
                  <RefreshCw className="animate-spin text-indigo-600" size={13} /> Generating Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="text-indigo-600" size={13} /> Recalculate Roadmap Plan
                </>
              )}
            </button>
          </div>

          {/* Roadmaps Week Timeline cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="week-timeline-grid">
            {roadmap.map((weekItem, idx) => (
              <div key={idx} className="bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between text-left transition hover:shadow-md">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                      {weekItem.week}
                    </span>
                    <span className="text-xs">📅</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-800 leading-snug">{weekItem.focus}</h4>
                  
                  {/* Tasks inside week */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Priority Tasks:</span>
                    {weekItem.tasks.map((task, tid) => (
                      <div key={tid} className="flex items-start gap-1.5 text-[11px] text-slate-600 font-semibold">
                        <span className="text-indigo-500 shrink-0 mt-0.5">✓</span>
                        <span className="leading-normal">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Week resources */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Targeted Resources:</span>
                  <div className="text-[10px] text-slate-500 font-semibold space-y-1 pl-1">
                    {weekItem.resources?.books?.slice(0, 1).map((b, i) => (
                      <div key={i} className="truncate">📚 {b}</div>
                    ))}
                    {weekItem.resources?.courses?.slice(0, 1).map((c, i) => (
                      <div key={i} className="truncate">🎓 {c}</div>
                    ))}
                    {weekItem.resources?.cheatsheets?.slice(0, 1).map((cs, i) => (
                      <div key={i} className="truncate">📄 {cs} Cheat sheet</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SKILL GAP ANALYSIS SECTION */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 text-left space-y-5 shadow-sm" id="skill-gap-analysis-board">
            <div>
              <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
                <Sliders className="text-indigo-600" size={15} /> Core Skill Gap Analytics
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">A comparison between skills required for your target role and your calculated performance metrics.</p>
            </div>

            <div className="space-y-4">
              {skillGaps.map((gap, i) => {
                const gapScore = gap.requiredLevel - gap.currentLevel;
                const progressPercentage = Math.round((gap.currentLevel / gap.requiredLevel) * 100);

                return (
                  <div key={i} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black text-slate-800">{gap.skill}</h4>
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.2 rounded ${
                          gap.importance === "Critical" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                          gap.importance === "High" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                          "bg-blue-50 text-blue-700 border border-blue-100"
                        }`}>
                          {gap.importance} Importance
                        </span>
                        {gapScore > 0 && (
                          <span className="text-[8px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.2 rounded border border-indigo-100">
                            Gap: {gapScore} Levels
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{gap.description}</p>
                      
                      {/* Recs */}
                      <div className="flex flex-col gap-1 pl-1 pt-1">
                        {gap.recommendations.map((rec, ri) => (
                          <div key={ri} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold">
                            <span className="text-indigo-500">•</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Competency Level indicator bars */}
                    <div className="w-full md:w-56 space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Current: L{gap.currentLevel} / Required: L{gap.requiredLevel}</span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-500 h-full" style={{ width: `${(gap.currentLevel / 5) * 100}%` }} />
                        <div className="bg-rose-300 h-full" style={{ width: `${((gap.requiredLevel - gap.currentLevel) / 5) * 100}%` }} />
                      </div>
                      <span className="text-[8px] text-slate-400 block text-right font-semibold leading-none">Green: Current competence | Rose: Active Skill Gap</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* MODULE 8: LEARNING HUB & FLASHCARDS & REVISION BOARD */}
      {activeSegment === "learning" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="learning-hub-board">
          
          {/* FLASHCARD STACK COLUMN */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4 text-left" id="spaced-repetition-flashcards">
            <div className="space-y-3">
              <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
                <Layers className="text-indigo-600" size={15} /> Spaced Repetition Stack
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Flip cards to test memory retention of key architectural patterns, formula configurations, or behavior STAR parameters. Earn 15 XP for every card reviewed.
              </p>

              {/* Filters */}
              <div className="flex gap-1 overflow-x-auto pb-1 select-none">
                {["All", "Quantitative", "System Design", "Behavioral", "Finance & Risk"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFlashcardFilter(cat);
                      setCurrentCardIdx(0);
                      setIsFlipped(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition shrink-0 cursor-pointer ${
                      flashcardFilter === cat 
                        ? "bg-indigo-600 text-white border-indigo-600" 
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Flipped Card */}
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className={`h-60 w-full rounded-2xl border cursor-pointer select-none relative transition-all duration-300 flex flex-col justify-between p-5 text-left ${
                isFlipped 
                  ? "bg-slate-950 text-slate-100 border-slate-800 shadow-lg" 
                  : "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 shadow-sm"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.2 rounded font-mono ${
                  isFlipped ? "bg-white/10 text-indigo-300" : "bg-slate-100 text-slate-500"
                }`}>
                  {activeCard?.category}
                </span>
                <span className={`text-[9px] font-bold ${isFlipped ? "text-indigo-400" : "text-slate-400"}`}>
                  {isFlipped ? "Answer Card" : "Question Card"}
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center py-4">
                <p className={`text-xs font-bold leading-relaxed text-center ${isFlipped ? "text-indigo-100 font-mono" : "text-slate-800 font-display"}`}>
                  {isFlipped ? activeCard?.answer : activeCard?.question}
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold opacity-60">
                <span>Card {currentCardIdx + 1} of {filteredFlashcards.length}</span>
                <span>Click card to {isFlipped ? "see question" : "flip answer"}</span>
              </div>
            </div>

            {/* Repetitive Rating controls */}
            <div className="space-y-2 pt-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Select Retention Status:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "Hard", key: "Hard", color: "hover:bg-rose-50 border-slate-200 hover:text-rose-600 hover:border-rose-300" },
                  { label: "Medium", key: "Medium", color: "hover:bg-amber-50 border-slate-200 hover:text-amber-600 hover:border-amber-300" },
                  { label: "Easy", key: "Easy", color: "hover:bg-emerald-50 border-slate-200 hover:text-emerald-600 hover:border-emerald-300" }
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => handleFlashcardRating(r.key as any)}
                    className={`py-2 bg-slate-50 border rounded-xl text-[10px] font-bold transition text-center cursor-pointer ${r.color}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* INTERACTIVE FORMULAS & CHEAT SHEET DIRECTORY */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4 text-left" id="cheat-sheets-directory">
            <div className="space-y-3.5">
              <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
                <BookOpen className="text-indigo-600" size={15} /> Cheat Sheets & Formulas
              </h3>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search formulas or concepts..."
                  value={searchFormulaQuery}
                  onChange={(e) => setSearchFormulaQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700"
                />
              </div>

              {/* Formulas scroll stack */}
              <div className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
                {filteredCheatSheets.map((cs, i) => (
                  <div key={i} className="p-3 bg-slate-50/60 border border-slate-150 rounded-xl space-y-1.5 hover:bg-slate-50 transition text-left">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[11px] font-black text-slate-800">{cs.title}</h4>
                      <span className="text-[8px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded border border-indigo-100">
                        {cs.category}
                      </span>
                    </div>
                    {cs.formula && (
                      <code className="block p-1.5 bg-slate-900 text-amber-400 font-mono text-[10px] rounded border border-slate-800 leading-tight">
                        {cs.formula}
                      </code>
                    )}
                    <p className="text-[10px] text-slate-500 leading-normal font-semibold">{cs.explanation}</p>
                    <p className="text-[9px] text-slate-400 leading-none italic font-medium">Ex: {cs.example}</p>
                  </div>
                ))}
                {filteredCheatSheets.length === 0 && (
                  <div className="py-10 text-center text-slate-400 italic text-xs">No matching formulas found.</div>
                )}
              </div>
            </div>

            <p className="text-[9px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2 italic">
              These reference formulas are integrated dynamically as hints inside relevant aptitude queries.
            </p>
          </div>

          {/* DAILY QUICK QUIZ CHALLENGE */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4 text-left" id="daily-quick-quizzes">
            
            <div className="space-y-1.5 pb-2 border-b border-slate-100">
              <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
                <QuizIcon className="text-emerald-600 animate-bounce" size={15} /> Daily Mind Challenge
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Test your mastery! Solve 3 random daily analytical questions to secure a **+50 XP bonus** booster.
              </p>
            </div>

            {!dailyQuizCompleted ? (
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold font-mono">
                    <span>QUESTION {currentQuizQuestionIdx + 1} OF {quizQuestions.length}</span>
                    <span className="text-indigo-600">Points Secured: {quizScore}</span>
                  </div>

                  <p className="text-xs font-bold text-slate-800 leading-relaxed text-left">
                    {quizQuestions[currentQuizQuestionIdx].question}
                  </p>

                  {/* Options */}
                  <div className="space-y-2 pt-1">
                    {quizQuestions[currentQuizQuestionIdx].options.map((opt, oIdx) => {
                      let btnStyle = "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50";
                      
                      if (showQuizAnswerFeedback) {
                        const isCorrect = oIdx === quizQuestions[currentQuizQuestionIdx].answerIndex;
                        const isSelected = oIdx === selectedQuizOptionIdx;
                        
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-50 border-rose-300 text-rose-800";
                        } else {
                          btnStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={showQuizAnswerFeedback}
                          onClick={() => handleQuizAnswerSubmit(oIdx)}
                          className={`w-full p-2.5 rounded-xl border text-xs text-left transition leading-snug cursor-pointer ${btnStyle}`}
                        >
                          <span className="font-mono font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation Feedback Block */}
                {showQuizAnswerFeedback && (
                  <div className="space-y-2">
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1 text-[10px] text-slate-600 leading-relaxed text-left">
                      <span className="font-bold text-indigo-800 block">Strategic Explanation:</span>
                      <p>{quizQuestions[currentQuizQuestionIdx].explanation}</p>
                    </div>

                    <button
                      onClick={handleNextQuizQuestion}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {currentQuizQuestionIdx < quizQuestions.length - 1 ? "Next Challenge Question" : "Complete Challenge"} <ArrowRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 py-8">
                <span className="text-4xl animate-bounce">🥳</span>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-800">Mind Challenge Completed!</h4>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    You answered <strong className="text-indigo-600 font-bold">{quizScore} / {quizQuestions.length}</strong> questions correctly.
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 font-black rounded-lg text-xs font-mono animate-pulse">
                  +50 XP SECURED BONUS!
                </div>
                <button
                  onClick={handleResetQuiz}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={12} /> Play Challenge Again
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODULE PERFORMANCE MASTERY ANALYTICS */}
      {activeSegment === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch" id="performance-dashboard-view">
          
          {/* Circular Readiness Indicator */}
          <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 text-center space-y-5 shadow-sm flex flex-col justify-center items-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hiring Readiness Score</h3>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* SVG Radial Progress */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="62" stroke="#e2e8f0" strokeWidth="11" fill="transparent" />
                <circle cx="72" cy="72" r="62" stroke="#6366f1" strokeWidth="11" fill="transparent" 
                        strokeDasharray={389.5} strokeDashoffset={389.5 - (389.5 * 78) / 100}
                        strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-slate-800 font-mono">78%</span>
                <span className="text-[10px] text-slate-400 block font-bold uppercase mt-0.5">High Potential</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-extrabold uppercase">
                Active Assessment Level
              </span>
              <p className="text-[11px] text-slate-500 max-w-[200px] leading-relaxed mx-auto">
                Evaluated across quantitative aptitude, behavioral STAR alignments, and system design answers.
              </p>
            </div>
          </div>

          {/* Strongest vs Weakest subjects & Quick Metrics */}
          <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 text-left space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-extrabold text-slate-800 text-sm">Subject Mastery Metrics</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Updated live</span>
            </div>

            {/* Subject horizontal progress grids */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Award size={12} /> Key Strongest Areas
                </h4>
                
                <div className="space-y-3">
                  {[
                    { subject: "Quantitative Aptitude", score: 92 },
                    { subject: "Data Structures & Algorithms", score: 85 },
                    { subject: "Behavioral Formats (STAR)", score: 80 }
                  ].map(item => (
                    <div key={item.subject} className="space-y-1 text-xs font-semibold">
                      <div className="flex justify-between text-slate-600">
                        <span>{item.subject}</span>
                        <span className="font-mono font-bold text-emerald-600">{item.score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] text-amber-600 font-bold uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={12} /> Growth Potential / Weak Areas
                </h4>

                <div className="space-y-3">
                  {[
                    { subject: "Actuarial Science Formulas", score: 55 },
                    { subject: "Logical Case Structure", score: 60 },
                    { subject: "Abstract Reasoning Scales", score: 62 }
                  ].map(item => (
                    <div key={item.subject} className="space-y-1 text-xs font-semibold">
                      <div className="flex justify-between text-slate-600">
                        <span>{item.subject}</span>
                        <span className="font-mono font-bold text-amber-600">{item.score}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${item.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations footer cards */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-xl flex gap-3 items-start text-xs text-slate-600 leading-relaxed">
              <Lightbulb size={16} className="text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-1">
                <p className="font-bold text-slate-700">AI Mentor Strategic Recommendation:</p>
                <p>
                  Your Quantitative skills are outstanding. Earmark more practice cycles on <strong>Actuarial Reserving models</strong> and <strong>McKinsey case structures</strong> inside the Assessment Hub to raise your global Hiring Readiness score to &gt;85%.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
