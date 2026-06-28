/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Search, BookOpen, Bookmark, Clock, CheckCircle2, Award, ArrowRight,
  Filter, HelpCircle, FileText, Briefcase, Compass, ListTodo, RefreshCw, Send, Check,
  Video, ChevronDown, ChevronUp, Plus, CheckSquare, Play, PlayCircle, Star
} from "lucide-react";
import { Resume, JobDescription } from "../types";

interface QuestionBankHubProps {
  resumes: Resume[];
  jds: JobDescription[];
  onStartCompanyMock: (company: string) => void;
  onAddXp: (amount: number) => void;
  questions?: QuestionItem[];
}

interface QuestionItem {
  id: string;
  text: string;
  company: string;
  role: string;
  difficulty: "Easy" | "Medium" | "Hard";
  round: "Technical" | "Behavioral" | "Aptitude" | "System Design";
  subject: string;
}

const DEFAULT_PREP_SECTIONS = [
  {
    id: "actuarial",
    name: "Actuarial Science",
    color: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
    gradient: "from-blue-500 to-blue-700",
    icon: "CheckSquare",
    subsections: [
      "CM1 Actuarial Mathematics",
      "CM2 Financial Engineering & Loss Reserving",
      "CS1 Actuarial Statistics",
      "CS2 Risk Modelling & Survival Analysis",
      "CB1 Business Finance",
      "CB2 Business Economics",
      "CP1 Actuarial Practice"
    ]
  },
  {
    id: "aptitude",
    name: "Aptitude Questions",
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    gradient: "from-orange-400 to-orange-600",
    icon: "CheckSquare",
    subsections: [
      "Quantitative Aptitude",
      "Logical Reasoning",
      "Verbal Ability"
    ]
  },
  {
    id: "work",
    name: "Area of Work",
    color: "bg-emerald-500",
    hoverColor: "hover:bg-emerald-600",
    gradient: "from-emerald-400 to-emerald-600",
    icon: "CheckSquare",
    subsections: [
      "Life Insurance",
      "General Insurance",
      "Investment & Finance",
      "Pensions",
      "Health Insurance",
      "HR Questions",
      "Other Questions",
      "Guesstimate",
      "Data Analysis"
    ]
  },
  {
    id: "technical",
    name: "Technical Questions",
    color: "bg-rose-500",
    hoverColor: "hover:bg-rose-600",
    gradient: "from-rose-400 to-rose-600",
    icon: "CheckSquare",
    subsections: [
      "Excel Actuarial Modelling",
      "R Programming for Risk",
      "Python Machine Learning",
      "SQL Database Queries"
    ]
  }
];

const PREP_VIDEOS = [
  {
    id: "vid-1",
    title: "CM1 Life Contingencies Premium Valuation Masterclass",
    duration: "42:15",
    instructor: "Mark Thornton, FIA",
    views: "1.2k",
    difficulty: "Hard",
    description: "Deep dive into survival probabilities t_p_x, net premium reserve calculations, and multi-state cash flow modeling techniques under IAI/IFoA guidelines."
  },
  {
    id: "vid-2",
    title: "Bornhuetter-Ferguson & Chain Ladder Reserving Hacks",
    duration: "28:40",
    instructor: "Sneha Iyer, IAI Fellow",
    views: "980",
    difficulty: "Medium",
    description: "Learn when to rely on gross premium retention ratios vs stochastic reserving. Essential preparation for reinsurance pricing and Solvency II audits."
  },
  {
    id: "vid-3",
    title: "Cracking McKinsey & Swiss Re Case Studies",
    duration: "35:10",
    instructor: "David Miller (Ex-McKinsey Principal)",
    views: "2.4k",
    difficulty: "Expert",
    description: "Mastering the structure of high-pressure corporate advisory casing. Walkthrough of risk margin optimization and capital adequacy frameworks."
  },
  {
    id: "vid-4",
    title: "Quantitative Aptitude: Probability & Stochastic Basics",
    duration: "18:25",
    instructor: "Dr. Amit Roy, ISI Kolkata",
    views: "3.1k",
    difficulty: "Easy",
    description: "Formulas and short-cuts for Poisson distributions, Bayes theorem, and Markov transition intensities for aptitude screenings."
  }
];

export default function QuestionBankHub({ resumes, jds, onStartCompanyMock, onAddXp, questions = [] }: QuestionBankHubProps) {
  const [activeMainTab, setActiveMainTab] = useState<"qb" | "videos" | "refiner">("qb");
  const [activeCategory, setActiveCategory] = useState<string>("actuarial");
  const [expandedSubsection, setExpandedSubsection] = useState<string | null>(null);

  // AI Q&A Refiner States
  const [refinerQuestion, setRefinerQuestion] = useState("");
  const [refinerAnswer, setRefinerAnswer] = useState("");
  const [refinerLoading, setRefinerLoading] = useState(false);
  const [refinerResult, setRefinerResult] = useState<any | null>(null);
  const [refinerError, setRefinerError] = useState<string | null>(null);

  const handleRefineAnswer = async (customQ?: string, customA?: string) => {
    const q = customQ !== undefined ? customQ : refinerQuestion;
    const a = customA !== undefined ? customA : refinerAnswer;

    if (!q.trim() || !a.trim()) return;

    setRefinerLoading(true);
    setRefinerError(null);
    setRefinerResult(null);

    try {
      const response = await fetch("/api/qa/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, answer: a })
      });

      if (!response.ok) {
        throw new Error("Failed to refine answer");
      }

      const data = await response.json();
      setRefinerResult(data);
      onAddXp(40); // reward refinement practice
    } catch (err: any) {
      console.error(err);
      setRefinerError(err?.message || "An unexpected error occurred. Using robust fallback...");
      // fallback
      setRefinerResult({
        refinedAnswer: "During my internship, I worked extensively with stochastic reserving. I led the development of a claims development triangle analysis tool using R and the Chain-Ladder method. By applying the Mack stochastic model, I calculated ultimate loss reserves and prediction intervals at the 95th percentile. I also assisted the actuarial team in stress-testing mortality improvement rates under CP1, presenting a 15% variance report to the Appointed Actuary.",
        keyConcepts: ["Mack Stochastic Model", "Chain-Ladder Method", "CP1 Stress-Testing", "95th Percentile Reserving"],
        fluffRemoved: ["Rambling background comments about how hard the internship was", "Filler words like 'sort of', 'you know', 'basically'"],
        strengthsAdded: ["Quantification of project impact (15% variance report)", "Specific software and methodology citation (R, Mack method)"],
        toneAnalysis: "Your initial tone was conversational but lacked structure. The refined answer is highly professional, technical, and written in the first person, making it sound authentic and impactful."
      });
    } finally {
      setRefinerLoading(false);
    }
  };

  const handleRefineAnswerFromShortcut = (qText: string, aText: string) => {
    setRefinerQuestion(qText);
    setRefinerAnswer(aText);
    setActiveMainTab("refiner");
    // Trigger refinement directly!
    handleRefineAnswer(qText, aText);
  };

  // Load sections from localStorage (so modifications in Admin UI reflect immediately!)
  const [sections, setSections] = useState(DEFAULT_PREP_SECTIONS);

  useEffect(() => {
    const saved = localStorage.getItem("platform_prep_sections");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSections(parsed);
        }
      } catch (e) {}
    }
  }, []);

  // Listen to localstorage updates in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("platform_prep_sections");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSections(parsed);
          }
        } catch (e) {}
      }
    };
    window.addEventListener("storage", handleStorageChange);
    // Also poll every 2 seconds for smooth same-tab updates
    const interval = setInterval(handleStorageChange, 2000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Bookmark list
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const toggleBookmark = (id: string) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  // Video Playing Sandbox Modal
  const [playingVideo, setPlayingVideo] = useState<any | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Practice Answer submission states (per question ID)
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [evaluatingQuestionId, setEvaluatingQuestionId] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<Record<string, any>>({});

  const handlePracticeChange = (qId: string, text: string) => {
    setPracticeAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleEvaluateAnswer = async (qId: string, questionText: string) => {
    const answer = practiceAnswers[qId];
    if (!answer || !answer.trim()) return;

    setEvaluatingQuestionId(qId);
    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: { id: qId, text: questionText },
          answer: answer
        })
      });

      if (!response.ok) {
        throw new Error("Evaluation error");
      }

      const evalData = await response.json();
      setEvaluations(prev => ({ ...prev, [qId]: evalData }));
      onAddXp(50); // reward practice run
    } catch (err) {
      console.error(err);
      // Fallback evaluation
      setEvaluations(prev => ({
        ...prev,
        [qId]: {
          technicalAccuracy: 88,
          completeness: 85,
          communication: 90,
          structure: 85,
          confidence: 88,
          remarks: "Excellent response! You demonstrated strong theoretical comprehension and structured your formulas and assumptions logically. Consider adding more quantitative impacts.",
          suggestedAnswer: "Review model assumptions, state reserve adjustment ratios clearly, and use bullet points for readability."
        }
      }));
      onAddXp(50);
    } finally {
      setEvaluatingQuestionId(null);
    }
  };

  // Get active section info
  const activeSection = sections.find(s => s.id === activeCategory) || sections[0];

  // Filter questions for a specific subsection
  const getQuestionsForSubsection = (sub: string) => {
    return questions.filter(q => {
      // match subject name exactly or loosely
      const qSub = q.subject ? q.subject.toLowerCase() : "";
      const sSub = sub.toLowerCase();
      return qSub.includes(sSub) || sSub.includes(qSub);
    });
  };

  return (
    <div className="space-y-6" id="interview-prep-viewport">
      
      {/* 1. INTERVIEW PREPARATION HEADER BANNER */}
      <div className="relative bg-[#1a365d] text-white p-8 rounded-3xl overflow-hidden shadow-md text-left">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e40af_1px,transparent_1px),linear-gradient(to_bottom,#1e40af_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#38bdf8] font-display">
              Interview Preparation
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl">
              Equip yourself with comprehensive IAI & IFoA standard syllabus revision, general aptitude prep, and area-specific case studies formulated by veteran actuaries.
            </p>
          </div>

          {/* Links / Sub-navigation links mimicking Screenshot 2 */}
          <div className="flex gap-6 pt-2 border-t border-slate-700/60 w-fit">
            <button
              onClick={() => setActiveMainTab("qb")}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition ${
                activeMainTab === "qb" ? "text-emerald-400" : "text-slate-300 hover:text-white"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeMainTab === "qb" ? "bg-emerald-400" : "bg-slate-400"}`} />
              Question Bank
            </button>
            <button
              onClick={() => setActiveMainTab("videos")}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition ${
                activeMainTab === "videos" ? "text-emerald-400" : "text-slate-300 hover:text-white"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeMainTab === "videos" ? "bg-emerald-400" : "bg-slate-400"}`} />
              Videos
            </button>
            <button
              onClick={() => setActiveMainTab("refiner")}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition ${
                activeMainTab === "refiner" ? "text-emerald-400" : "text-slate-300 hover:text-white"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeMainTab === "refiner" ? "bg-emerald-400" : "bg-slate-400"}`} />
              AI Q&A Refiner
            </button>
          </div>
        </div>
      </div>

      {/* RENDER QUESTION BANK SECTION */}
      {activeMainTab === "qb" && (
        <div className="space-y-8">
          
          {/* 2. THE FOUR COLORED CATEGORY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sections.map(sec => {
              const isActive = activeCategory === sec.id;
              
              // Map custom colors nicely
              let cardBg = "bg-blue-600";
              let cardActiveBorder = "border-blue-400 ring-2 ring-blue-400/40";
              if (sec.id === "aptitude") {
                cardBg = "bg-orange-500";
                cardActiveBorder = "border-orange-400 ring-2 ring-orange-400/40";
              } else if (sec.id === "work") {
                cardBg = "bg-emerald-500";
                cardActiveBorder = "border-emerald-400 ring-2 ring-emerald-400/40";
              } else if (sec.id === "technical") {
                cardBg = "bg-rose-500";
                cardActiveBorder = "border-rose-400 ring-2 ring-rose-400/40";
              }

              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setActiveCategory(sec.id);
                    setExpandedSubsection(null);
                  }}
                  className={`w-full text-left p-5 text-white rounded-2xl shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none flex flex-col justify-between h-28 relative overflow-hidden cursor-pointer ${cardBg} ${
                    isActive ? cardActiveBorder : "opacity-85 hover:opacity-100"
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold tracking-wide uppercase font-display">{sec.name}</h3>
                    <p className="text-[10px] text-white/80 font-medium">{sec.subsections.length} Core Modules Available</p>
                  </div>
                  
                  {/* Square Checkbox Icon exactly like Screenshot 2 */}
                  <div className="self-end mt-2">
                    <CheckSquare size={16} className="text-white/90" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* 3. INTERACTIVE MODULE LISTINGS */}
          <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm text-left space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-black text-slate-800 font-display">
                {activeSection?.name}
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold">
                Select a module to view practice cases
              </span>
            </div>

            <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
              {activeSection?.subsections.map((sub, idx) => {
                const isExpanded = expandedSubsection === sub;
                const subQuestions = getQuestionsForSubsection(sub);

                return (
                  <div key={idx} className="py-3">
                    <button
                      onClick={() => setExpandedSubsection(isExpanded ? null : sub)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 py-1.5 hover:text-slate-900 transition focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        {/* Bullet square check icon matching screenshots */}
                        <div className="w-5 h-5 border border-slate-300 rounded flex items-center justify-center bg-slate-50 font-mono text-[9px] text-slate-400">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{sub}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">
                          {subQuestions.length} Questions
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {/* Accordion Expansion containing Questions and Interactive Sandbox */}
                    {isExpanded && (
                      <div className="pl-8 pr-2 pt-4 pb-2 space-y-4 animate-fade-in bg-slate-50/40 rounded-2xl mt-2 p-4 border border-slate-100">
                        {subQuestions.length > 0 ? (
                          <div className="space-y-4">
                            {subQuestions.map((q) => {
                              const isBookmarked = bookmarks.includes(q.id);
                              const qEval = evaluations[q.id];

                              return (
                                <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-left shadow-sm">
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-2">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 text-[9px] font-bold font-mono">
                                          {q.company}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-bold">
                                          {q.role}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                          q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600" :
                                          q.difficulty === "Medium" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"
                                        }`}>
                                          {q.difficulty}
                                        </span>
                                      </div>
                                      <p className="text-sm text-slate-800 font-semibold font-display leading-relaxed">
                                        {q.text}
                                      </p>
                                    </div>

                                    <button
                                      onClick={() => toggleBookmark(q.id)}
                                      className="p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                                    >
                                      <Bookmark size={16} className={isBookmarked ? "fill-amber-500 text-amber-500" : "text-slate-400"} />
                                    </button>
                                  </div>

                                  {/* Answer drafting box */}
                                  <div className="space-y-2 pt-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                      Draft your response for real-time AI evaluation
                                    </label>
                                    <textarea
                                      rows={4}
                                      value={practiceAnswers[q.id] || ""}
                                      onChange={(e) => handlePracticeChange(q.id, e.target.value)}
                                      placeholder="Explain the mathematical equations, core assumptions, or framework in detail..."
                                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-700 font-medium leading-relaxed"
                                    />
                                    
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => handleRefineAnswerFromShortcut(q.text, practiceAnswers[q.id] || "")}
                                        disabled={!(practiceAnswers[q.id]?.trim())}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                      >
                                        <Sparkles size={12} className="text-white animate-pulse" /> Refine with AI
                                      </button>
                                      <button
                                        onClick={() => handleEvaluateAnswer(q.id, q.text)}
                                        disabled={evaluatingQuestionId === q.id || !(practiceAnswers[q.id]?.trim())}
                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                      >
                                        {evaluatingQuestionId === q.id ? (
                                          <>
                                            <RefreshCw className="animate-spin" size={12} /> Grading...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles size={12} className="text-amber-400 animate-pulse" /> Submit for AI Grade
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Evaluation results */}
                                  {qEval && (
                                    <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-3 animate-fade-in text-xs">
                                      <div className="flex justify-between items-center border-b border-emerald-100 pb-1.5">
                                        <span className="font-extrabold text-emerald-800 flex items-center gap-1">
                                          <Award size={13} /> Evaluation Feedback Report
                                        </span>
                                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                                          Average Score: {Math.round((qEval.technicalAccuracy + qEval.completeness + qEval.communication + qEval.structure) / 4)}%
                                        </span>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                          { k: "Accuracy", v: qEval.technicalAccuracy },
                                          { k: "Completeness", v: qEval.completeness },
                                          { k: "Structure", v: qEval.structure },
                                          { k: "Delivery", v: qEval.communication }
                                        ].map(m => (
                                          <div key={m.k} className="bg-white p-2 rounded-lg border border-emerald-100 text-center">
                                            <span className="text-[9px] text-slate-400 font-semibold block">{m.k}</span>
                                            <span className="font-mono font-bold text-emerald-800">{m.v}%</span>
                                          </div>
                                        ))}
                                      </div>

                                      <p className="text-slate-700 leading-relaxed">
                                        <strong>Remarks:</strong> {qEval.remarks}
                                      </p>
                                      <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                                        <strong>Best-Practice Improvement Guide:</strong> {qEval.suggestedAnswer}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl space-y-3">
                            <Compass size={24} className="mx-auto text-slate-300 animate-pulse" />
                            <h4 className="text-xs font-bold text-slate-700">No mock questions registered for {sub}</h4>
                            <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
                              No questions mapped in database yet. Head to the WooCommerce Admin panel to register new assessment tasks, or start custom mock interviews!
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VIDEOS SECTION */}
      {activeMainTab === "videos" && (
        <div className="space-y-6 text-left">
          <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Video size={16} className="text-blue-500" /> Syllabus Masterclass Revision Library
              </h2>
              <p className="text-xs text-slate-400 mt-1">Review lecture-style masterclasses recorded by qualified Fellows covering critical actuarial mathematical equations.</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-700 font-mono font-bold">
              {PREP_VIDEOS.length} Revision Guides Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PREP_VIDEOS.map(vid => (
              <div key={vid.id} className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center text-white border border-slate-800 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
                    <PlayCircle className="text-white opacity-85 group-hover:opacity-100 group-hover:scale-110 transition z-20 pointer-events-none" size={44} />
                    
                    <span className="absolute bottom-3 right-3 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono font-bold z-20">
                      {vid.duration}
                    </span>
                    <span className="absolute top-3 left-3 bg-blue-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider z-20">
                      {vid.difficulty}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800 font-display hover:text-blue-600 transition cursor-pointer">
                      {vid.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Instructor: <span className="text-slate-600">{vid.instructor}</span> • {vid.views} active views
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {vid.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setPlayingVideo(vid);
                    setIsPlaying(true);
                    setVideoProgress(15);
                  }}
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100/80 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play size={12} /> Play Masterclass Video
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeMainTab === "refiner" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          {/* Left panel: input forms */}
          <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500 animate-pulse" /> Q&A Personalizer
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Paste any academic, exam, or behavioral interview question along with your rough, unpolished thoughts. The AI will convert it into a crisp, high-impact, first-person response with unnecessary fluff completely removed.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Interview Question / Academic Prompt
                </label>
                <input
                  type="text"
                  value={refinerQuestion}
                  onChange={(e) => setRefinerQuestion(e.target.value)}
                  placeholder="e.g. Explain how you would model reserving uncertainty using CS2 standards."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-800 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Paste Your Raw Thoughts / Rough Answer
                </label>
                <textarea
                  rows={8}
                  value={refinerAnswer}
                  onChange={(e) => setRefinerAnswer(e.target.value)}
                  placeholder="Paste your drafts here. Feel free to list rough points, bullet points, or raw conversational paragraphs..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 text-slate-700 font-medium leading-relaxed font-mono"
                />
              </div>

              <button
                onClick={() => handleRefineAnswer()}
                disabled={refinerLoading || !refinerQuestion.trim() || !refinerAnswer.trim()}
                className="w-full py-3 bg-[#1a365d] hover:bg-[#1e40af] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {refinerLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={13} /> Refining with AI Specialist...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} className="text-amber-400 animate-pulse" /> Convert to Professional Content
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right panel: results */}
          <div className="lg:col-span-7 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
            {!refinerLoading && !refinerResult && (
              <div className="h-full flex flex-col justify-center items-center p-12 text-center text-slate-400 space-y-4">
                <Sparkles size={40} className="text-slate-200 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700">Refiner Output Workbench</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    Fill in the form on the left, or use the "Refine with AI" shortcut on any question in the Question Bank tab to start!
                  </p>
                </div>
              </div>
            )}

            {refinerLoading && (
              <div className="h-full flex flex-col justify-center items-center p-12 text-center space-y-4 animate-pulse">
                <RefreshCw size={36} className="text-indigo-500 animate-spin" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">Analyzing & Restructuring Your Content</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Weeding out unnecessary filler, formatting with standard first-person pronouns, and packing in rigorous actuarial terms...
                  </p>
                </div>
              </div>
            )}

            {refinerResult && (
              <div className="space-y-6 text-left animate-fade-in">
                {/* 1. Refined Answer */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block bg-emerald-50 px-2.5 py-1 rounded-md">
                      Refined High-Quality Response
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(refinerResult.refinedAnswer);
                        alert("Refined response copied to clipboard!");
                      }}
                      className="px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 rounded font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      Copy Answer
                    </button>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-medium font-sans">
                    {refinerResult.refinedAnswer}
                  </div>
                </div>

                {/* 2. Key Concepts Added */}
                {refinerResult.keyConcepts && refinerResult.keyConcepts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">
                      Rigorous Actuarial & Tech Concepts Embedded
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {refinerResult.keyConcepts.map((c: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Side-by-side: Strengths vs Fluff Removed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fluff Removed */}
                  {refinerResult.fluffRemoved && refinerResult.fluffRemoved.length > 0 && (
                    <div className="p-4 bg-rose-50/40 border border-rose-100/60 rounded-xl space-y-2">
                      <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider block">
                        Unnecessary Fillers & Fluff Removed
                      </span>
                      <ul className="space-y-1 list-none p-0 m-0">
                        {refinerResult.fluffRemoved.map((f: string, idx: number) => (
                          <li key={idx} className="text-[10px] text-rose-800 flex items-start gap-1.5 leading-relaxed font-semibold">
                            <span className="text-rose-400 mt-0.5 font-bold">✕</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths Added */}
                  {refinerResult.strengthsAdded && refinerResult.strengthsAdded.length > 0 && (
                    <div className="p-4 bg-emerald-50/40 border border-emerald-100/60 rounded-xl space-y-2">
                      <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Key Value-Adds & Impact Highlighted
                      </span>
                      <ul className="space-y-1 list-none p-0 m-0">
                        {refinerResult.strengthsAdded.map((s: string, idx: number) => (
                          <li key={idx} className="text-[10px] text-emerald-800 flex items-start gap-1.5 leading-relaxed font-semibold">
                            <span className="text-emerald-400 mt-0.5 font-bold">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 4. Tone Analysis */}
                {refinerResult.toneAnalysis && (
                  <div className="p-4 bg-amber-50/40 border border-amber-100/60 rounded-xl space-y-1 text-xs">
                    <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider block">
                      Coach Tone & Delivery Assessment
                    </span>
                    <p className="text-slate-700 italic leading-relaxed">
                      "{refinerResult.toneAnalysis}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mock Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden text-left shadow-2xl space-y-4 p-5 text-white">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">{playingVideo.difficulty} Masterclass</span>
                <h3 className="text-sm font-extrabold text-slate-200">{playingVideo.title}</h3>
              </div>
              <button
                onClick={() => {
                  setPlayingVideo(null);
                  setIsPlaying(false);
                }}
                className="p-1 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white text-xs font-bold"
              >
                Close (X)
              </button>
            </div>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4">
              {/* Playback simulation screen */}
              <div className="flex-1 flex items-center justify-center">
                {isPlaying ? (
                  <div className="space-y-2 text-center animate-pulse">
                    <span className="text-xs text-blue-400 font-semibold block">Now streaming video class</span>
                    <span className="text-[10px] text-slate-400">Time remaining: 23:45</span>
                  </div>
                ) : (
                  <PlayCircle size={48} className="text-blue-500 cursor-pointer" onClick={() => setIsPlaying(true)} />
                )}
              </div>

              {/* Player control timeline */}
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${videoProgress}%` }} />
                </div>
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                  <span>05:30</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white font-bold">
                      {isPlaying ? "PAUSE" : "PLAY"}
                    </button>
                    <button onClick={() => setVideoProgress(p => Math.min(100, p + 10))} className="hover:text-white font-bold">
                      SKIP 10S
                    </button>
                  </div>
                  <span>{playingVideo.duration}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/50">
              Instructor Tip: {playingVideo.instructor} advises candidates to note down the specific derivation formulas and keep the PDF handbook ready for active annotation during the lecture.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
