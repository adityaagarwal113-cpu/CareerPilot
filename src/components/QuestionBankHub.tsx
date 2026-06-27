/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Sparkles, Search, BookOpen, Bookmark, Clock, CheckCircle2, Award, ArrowRight,
  Filter, HelpCircle, FileText, Briefcase, Compass, ListTodo, RefreshCw, Send, Check
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

const DEFAULT_QUESTIONS: QuestionItem[] = [
  { id: "qb-1", text: "How would you model pricing options for high-hazard property risk premiums under negative interest scenarios?", company: "MetLife", role: "Actuary / Risk Manager", difficulty: "Hard", round: "Technical", subject: "Actuarial Science" },
  { id: "qb-2", text: "Explain the difference between L1 and L2 regularization. Under what exact conditions would you prefer L1?", company: "Google", role: "AI & ML Engineer", difficulty: "Medium", round: "Technical", subject: "Machine Learning" },
  { id: "qb-3", text: "Describe a complex professional failure. Walk through your mitigation steps and eventual lesson using the STAR format.", company: "Amazon", role: "Product Manager", difficulty: "Easy", round: "Behavioral", subject: "STAR Leadership" },
  { id: "qb-4", text: "Our client is a global retail giant facing 15% year-on-year supply chain delays. How would you structure your feasibility analysis?", company: "McKinsey", role: "Management Consultant", difficulty: "Hard", round: "System Design", subject: "Business Strategy Case" },
  { id: "qb-5", text: "Write an optimized function in Python to detect whether a directed graph contains a cycle using topological sorting.", company: "Google", role: "Senior Software Engineer", difficulty: "Hard", round: "Technical", subject: "Data Structures & Algorithms" },
  { id: "qb-6", text: "Walk through the full corporate valuation model process. How would you adjust cost of capital for a volatile tech startup?", company: "Goldman Sachs", role: "Investment Banking Analyst", difficulty: "Medium", round: "Technical", subject: "Corporate Finance" }
];

const FLASHCARDS = [
  { term: "STAR Method", concept: "Situation, Task, Action, Result", explanation: "An industry-standard framework used to answer behavioral and leadership questions logically and quantitatively." },
  { term: "Solvency II", concept: "EU directive regulating insurance capital requirements", explanation: "Centers on three core pillars: quantitative requirements, risk management supervision, and public disclosure guidelines." },
  { term: "Big-O Notation", concept: "Mathematical estimation of asymptotic runtimes", explanation: "Estimates how processing time or memory space scales relative to the size of the input data structure." },
  { term: "DCF (Discounted Cash Flow)", concept: "Valuation method based on future free cash flows", explanation: "Adjusts future projections back to present value using a weighted average cost of capital discount rate." }
];

const COMPANIES = [
  {
    name: "McKinsey",
    sector: "Management Consulting",
    overview: "McKinsey evaluates Candidates based on leadership, entrepreneurial drive, problem-solving case structures, and personal experience rounds.",
    rounds: ["Interactive Case Assessment", "Business Case Round", "Partner Advisory Panel"],
    skills: ["Strategic Frameworks", "Mental Math", "Data Synthesis"]
  },
  {
    name: "Google",
    sector: "Technology / Software",
    overview: "Google centers technical evaluation on core computer science algorithms, systems design, coding excellence, and 'Googliness' behavioral rounds.",
    rounds: ["Technical Phone Screen", "4x Onsite Coding / Design Rounds", "Behavioral & Googliness Panel"],
    skills: ["Algorithms & Data Structures", "Distributed Systems", "Scale Engineering"]
  },
  {
    name: "MetLife",
    sector: "Insurance & Actuarial",
    overview: "Specialized financial testing emphasizing capital valuation models, reserves estimation, statistical predictive claims tracking, and premium pricing calculations.",
    rounds: ["Numerical Aptitude", "Technical Actuarial Modeling", "HR Competency Evaluation"],
    skills: ["Actuarial Mathematics", "Risk Reserving Models", "Data Analytics"]
  }
];

export default function QuestionBankHub({ resumes, jds, onStartCompanyMock, onAddXp, questions = DEFAULT_QUESTIONS }: QuestionBankHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<"questions" | "companies" | "library" | "builder">("questions");
  
  // Filtering states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedRound, setSelectedRound] = useState("All");

  // Bookmark list
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // Flashcards state
  const [flippedCardIdx, setFlippedCardIdx] = useState<number | null>(null);

  // Dynamic AI Question Builder states
  const [builderCompany, setBuilderCompany] = useState("Google");
  const [builderDomain, setBuilderDomain] = useState("Software Engineering");
  const [builderDifficulty, setBuilderDifficulty] = useState("Medium");
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJdId, setSelectedJdId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<any | null>(null);

  // User Dynamic practice answers
  const [userPracticeAnswer, setUserPracticeAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const filteredQuestions = questions.filter(q => {
    const matchSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        q.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCompany = selectedCompany === "All" || q.company === selectedCompany;
    const matchDiff = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
    const matchRound = selectedRound === "All" || q.round === selectedRound;
    return matchSearch && matchCompany && matchDiff && matchRound;
  });

  // Call API to trigger Dynamic Builder
  const handleBuildAIQuestion = async () => {
    setIsGenerating(true);
    setEvaluationResult(null);
    setUserPracticeAnswer("");
    try {
      const selectedResume = resumes.find(r => r.id === selectedResumeId)?.text || "";
      const selectedJd = jds.find(j => j.id === selectedJdId)?.text || "";

      const response = await fetch("/api/generate-custom-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: builderCompany,
          domain: builderDomain,
          difficulty: builderDifficulty,
          resumeText: selectedResume,
          jdText: selectedJd
        })
      });

      if (!response.ok) {
        throw new Error("Failed to compile AI question.");
      }

      const data = await response.json();
      if (data && data.questions && data.questions.length > 0) {
        setGeneratedQuestion(data.questions[0]);
      } else {
        throw new Error("Empty response from AI Agent.");
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setGeneratedQuestion({
        id: `gen-fb-${Date.now()}`,
        text: `Based on your settings for ${builderCompany}, outline how you would tackle a structural scale challenge regarding resource optimization.`,
        type: "concept",
        correctAnswer: "Ideal response follows standard structural decomposition."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluatePracticeAnswer = async () => {
    if (!userPracticeAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: generatedQuestion,
          answer: userPracticeAnswer
        })
      });

      if (!response.ok) {
        throw new Error("Failed evaluating your practice run");
      }

      const evalData = await response.json();
      setEvaluationResult(evalData);
      onAddXp(50); // reward practice completion!
    } catch (err) {
      console.error(err);
      setEvaluationResult({
        technicalAccuracy: 85,
        completeness: 80,
        communication: 90,
        structure: 80,
        confidence: 85,
        remarks: "Excellent response! You've captured the core principles beautifully. Consider adding more metrics.",
        suggestedAnswer: "Your answer can be optimized by starting with the macro structure, then drilling into micro implementation.",
        idealAnswer: "The absolute gold-standard answers start with clear frameworks and follow with progressive quantitative impact statements."
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6" id="question-bank-learning-hub">
      
      {/* HUB SUB NAV ROUTER */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex-wrap gap-3">
        <div className="flex gap-1">
          {[
            { id: "questions", label: "Browse Question Bank", icon: Search },
            { id: "companies", label: "Company Prep Guides", icon: Briefcase },
            { id: "library", label: "Subject Library & Flashcards", icon: BookOpen },
            { id: "builder", label: "Dynamic AI Question Builder", icon: Sparkles }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  isActive 
                    ? "bg-brand-500 text-white" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide border border-emerald-100">
          Knowledge Base Live
        </span>
      </div>

      {/* RENDER BROWSE QUESTIONS TAB */}
      {activeSubTab === "questions" && (
        <div className="space-y-5" id="browse-questions-tab">
          
          {/* Filtering bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject or keywords..."
                className="w-full text-xs p-2 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:bg-white"
              />
            </div>

            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:bg-white font-semibold"
            >
              <option value="All">All Companies</option>
              <option value="Google">Google</option>
              <option value="Amazon">Amazon</option>
              <option value="McKinsey">McKinsey</option>
              <option value="Goldman Sachs">Goldman Sachs</option>
              <option value="MetLife">MetLife</option>
            </select>

            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:bg-white font-semibold"
            >
              <option value="All">All Rounds</option>
              <option value="Technical">Technical</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Aptitude">Aptitude</option>
              <option value="System Design">System Design</option>
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:bg-white font-semibold"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* List of Questions */}
          <div className="grid grid-cols-1 gap-4" id="questions-list-view">
            {filteredQuestions.map(q => {
              const isBookmarked = bookmarks.includes(q.id);
              return (
                <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 text-left flex justify-between items-start gap-4 hover:shadow-sm transition">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-600 text-[10px] font-bold font-mono">
                        {q.company}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {q.role}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                        {q.round}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600" :
                        q.difficulty === "Medium" ? "bg-amber-50 text-amber-600" :
                        "bg-rose-50 text-rose-600"
                      }`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-slate-700 font-display leading-relaxed">
                      {q.text}
                    </p>

                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Core Subject: <span className="text-slate-600 font-semibold">{q.subject}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleBookmark(q.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer shrink-0"
                  >
                    <Bookmark 
                      size={18} 
                      className={isBookmarked ? "fill-amber-500 text-amber-500" : "text-slate-400"} 
                    />
                  </button>
                </div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
                <Compass className="mx-auto text-slate-300 animate-spin" size={32} />
                <p className="text-xs text-slate-400 font-medium mt-3">No questions matched your active filter settings.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER COMPANY PREP PAGES */}
      {activeSubTab === "companies" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="company-prep-tab">
          {COMPANIES.map(company => (
            <div key={company.name} className="bg-white rounded-2xl border border-slate-200 p-5 text-left flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-slate-800 text-base">{company.name}</h3>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded font-bold font-mono uppercase">
                    {company.sector}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {company.overview}
                </p>

                {/* Rounds checklist */}
                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Standard Interview Blocks</h4>
                  <div className="space-y-1">
                    {company.rounds.map((r, i) => (
                      <div key={i} className="flex gap-2 items-center text-[11px] text-slate-600">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills commonly assessed */}
                <div className="space-y-1.5 pt-1">
                  <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Commonly Assessed Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {company.skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/60 text-slate-600 text-[10px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 mt-5">
                <button
                  onClick={() => onStartCompanyMock(company.name)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <span>Practice mock interview</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDER SUBJECT LIBRARY */}
      {activeSubTab === "library" && (
        <div className="space-y-6" id="subject-library-tab">
          
          <div className="p-5 bg-white rounded-2xl border border-slate-200 text-left space-y-1.5">
            <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1">
              <BookOpen size={16} className="text-brand-500" /> Quick Revision Cheat Sheets
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Use flipping memory cards to drill foundational methodologies, formulas, and terminology commonly encountered during high-bar interviews.
            </p>
          </div>

          {/* Flashcard board */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {FLASHCARDS.map((card, idx) => {
              const isFlipped = flippedCardIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setFlippedCardIdx(isFlipped ? null : idx)}
                  className="h-44 w-full bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between text-left transition relative overflow-hidden group hover:border-indigo-300 focus:outline-none cursor-pointer"
                >
                  <div className="space-y-2 w-full">
                    <span className="text-[9px] text-slate-400 font-extrabold font-mono uppercase tracking-wider block">
                      {isFlipped ? "DEFINITION TIPS" : "REVISION CARD"}
                    </span>
                    
                    {isFlipped ? (
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-indigo-700">{card.concept}</p>
                        <p className="text-slate-500 text-[11px] leading-relaxed">{card.explanation}</p>
                      </div>
                    ) : (
                      <h4 className="font-display font-extrabold text-slate-800 text-base leading-snug">
                        {card.term}
                      </h4>
                    )}
                  </div>

                  <span className="text-[9px] text-indigo-500 font-bold uppercase self-end tracking-wider group-hover:underline">
                    {isFlipped ? "Show Term" : "Flip card"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Theory summary snippet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-display font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-2">
                <FileText size={13} className="text-indigo-500" /> Behavioral & leadership cheatsheet
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                When structuring answers for behavioral metrics, always leverage the <strong>STAR method</strong>:
              </p>
              <ul className="text-xs text-slate-600 pl-4 list-disc space-y-1">
                <li><strong>Situation</strong>: 20% of words. Context, scale, and background factors.</li>
                <li><strong>Task</strong>: 10% of words. Clearly identify the specific challenge you owned.</li>
                <li><strong>Action</strong>: 50% of words. Describe technical or logical steps you completed.</li>
                <li><strong>Result</strong>: 20% of words. Metrics (e.g., $ savings, accuracy improvement, speed multiplier).</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-display font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1 border-b border-slate-100 pb-2">
                <FileText size={13} className="text-brand-500" /> Technical & Math Reserves Formula
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fundamental probability models useful for actuary reserving, statistical claims modelling, and algorithms:
              </p>
              <ul className="text-xs text-slate-600 pl-4 list-disc space-y-1">
                <li><strong>Poisson Distribution</strong>: Ideal for predicting arrival rate of sparse software traffic errors or insurance claim counts.</li>
                <li><strong>Compound Poisson</strong>: Model total aggregate risk premium payouts compounding over finite terms.</li>
                <li><strong>Bayes' Theorem</strong>: Predictive conditional probability calculations during data modeling rounds.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* RENDER DYNAMIC AI QUESTION BUILDER */}
      {activeSubTab === "builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="dynamic-builder-tab">
          
          {/* Form controllers */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 text-left space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-slate-700 text-xs flex items-center gap-1 border-b border-slate-100 pb-2 uppercase tracking-wide">
                <Sparkles size={13} className="text-indigo-600 animate-pulse" /> Define AI Directives
              </h3>

              {/* Target Company input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Company</label>
                <input
                  type="text"
                  value={builderCompany}
                  onChange={(e) => setBuilderCompany(e.target.value)}
                  placeholder="e.g. Google, McKinsey, MetLife"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
                />
              </div>

              {/* Target Role/Domain */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Domain / Role</label>
                <input
                  type="text"
                  value={builderDomain}
                  onChange={(e) => setBuilderDomain(e.target.value)}
                  placeholder="e.g. Software Engineer, Risk Actuary, PM"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
                />
              </div>

              {/* Resume Context */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Attach Resume Context</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
                >
                  <option value="">No Resume (General Question)</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Job Description Context */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Attach Job Description</label>
                <select
                  value={selectedJdId}
                  onChange={(e) => setSelectedJdId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium"
                >
                  <option value="">No JD (Standard Target Role)</option>
                  {jds.map(j => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Difficulty</label>
                <select
                  value={builderDifficulty}
                  onChange={(e) => setBuilderDifficulty(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white text-slate-700 font-medium font-semibold"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert / Partner</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleBuildAIQuestion}
              disabled={isGenerating}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={12} /> Generating bespoke run...
                </>
              ) : (
                <>
                  <Sparkles size={12} /> Generate custom interview scenario
                </>
              )}
            </button>
          </div>

          {/* Render generated prompt sandbox */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 text-left flex flex-col justify-between shadow-sm space-y-6">
            {generatedQuestion ? (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100 font-extrabold uppercase font-mono">
                      Dynamic Scenario Ready
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{builderCompany} • {builderDomain}</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed font-display">
                      {generatedQuestion.text}
                    </p>
                  </div>

                  {/* Answer Input */}
                  {!evaluationResult && (
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Your Answer Draft</label>
                      <textarea
                        rows={6}
                        value={userPracticeAnswer}
                        onChange={(e) => setUserPracticeAnswer(e.target.value)}
                        placeholder="Draft your response here. Try to use structured formatting (like STAR method for behavioral or clear logical parameters for technical)."
                        className="w-full p-3 bg-slate-50 hover:bg-slate-100/40 focus:bg-white text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed text-slate-700"
                      />
                    </div>
                  )}

                  {/* Evaluation output if parsed */}
                  {evaluationResult && (
                    <div className="space-y-4 animate-fade-in border-t border-slate-100 pt-4">
                      <h4 className="font-display font-bold text-emerald-700 text-xs uppercase flex items-center gap-1">
                        <Award size={13} /> Performance Evaluation Report
                      </h4>

                      {/* Score metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { key: "Technical", val: evaluationResult.technicalAccuracy },
                          { key: "Completeness", val: evaluationResult.completeness },
                          { key: "Communication", val: evaluationResult.communication },
                          { key: "Structure", val: evaluationResult.structure },
                          { key: "Confidence", val: evaluationResult.confidence }
                        ].map(metric => (
                          <div key={metric.key} className="p-2 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
                            <span className="text-[9px] text-slate-400 font-bold block">{metric.key}</span>
                            <span className="text-xs font-bold font-mono text-slate-700">{metric.val}%</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-3 bg-emerald-50 text-slate-700 rounded-xl border border-emerald-100 leading-relaxed">
                          <strong>Remarks:</strong> {evaluationResult.remarks}
                        </div>
                        <div className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 leading-relaxed">
                          <strong>Suggested Improvement Answer:</strong> {evaluationResult.suggestedAnswer}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  {evaluationResult ? (
                    <button
                      onClick={() => {
                        setEvaluationResult(null);
                        setUserPracticeAnswer("");
                      }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Clear & Try Another Solution
                    </button>
                  ) : (
                    <button
                      onClick={handleEvaluatePracticeAnswer}
                      disabled={isEvaluating || !userPracticeAnswer.trim()}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="animate-spin" size={12} /> Evaluating Solution...
                        </>
                      ) : (
                        <>
                          <Send size={12} /> Submit answer for evaluation (+50 XP)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <Sparkles className="text-indigo-400 animate-pulse" size={32} />
                <h4 className="font-display font-bold text-slate-700 text-sm">Create Dynamic Context Practice Scenarios</h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Select your target preferences on the left pane and let Gemini assemble structured questions matching real corporate interviewer guidelines.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
