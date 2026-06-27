/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Play, Settings, User, FileText, Briefcase, ChevronRight, 
  Sparkles, ShieldAlert, Award, Clock, Speech, AlertCircle
} from "lucide-react";
import { 
  InterviewMode, DifficultyLevel, InterviewerPersonality, 
  Resume, JobDescription 
} from "../types";
import { InterviewerProfile } from "../lib/defaultData";

interface InterviewSetupProps {
  resumes: Resume[];
  jds: JobDescription[];
  onStartInterview: (config: {
    mode: InterviewMode;
    difficulty: DifficultyLevel;
    personality: InterviewerPersonality;
    resumeId?: string;
    jdId?: string;
    company?: string;
    actuarialFocus?: string;
  }) => Promise<void>;
  interviewers?: InterviewerProfile[];
}

export default function InterviewSetup({ resumes, jds, onStartInterview, interviewers }: InterviewSetupProps) {
  const [mode, setMode] = useState<InterviewMode>(InterviewMode.Technical);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.Medium);
  const [personality, setPersonality] = useState<InterviewerPersonality>(InterviewerPersonality.SeniorEngineer);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJdId, setSelectedJdId] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedActuarialFocus, setSelectedActuarialFocus] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const defaultPersonalities = [
    {
      id: InterviewerPersonality.Friendly,
      name: "Friendly Coach",
      role: "Supportive Mentor",
      description: "Encouraging and constructive. Helps you with gentle hints, focusing heavily on confidence building.",
      avatar: "🌸"
    },
    {
      id: InterviewerPersonality.Strict,
      name: "Strict Evaluator",
      role: "No-Nonsense Lead",
      description: "Highly formal, rigorous, and quick to spot structural gaps. Mimics high-pressure elite stress tests.",
      avatar: "👤"
    },
    {
      id: InterviewerPersonality.RealHR,
      name: "HR Recruiter",
      role: "Culture Matcher",
      description: "Speaks elegantly. Analyzes personal integrity, communication, behavioral growth, and team culture.",
      avatar: "💼"
    },
    {
      id: InterviewerPersonality.SeniorEngineer,
      name: "Tech Lead",
      role: "Senior System Architect",
      description: "Focuses deeply on code quality, design patterns, algorithmic optimization, and technical depth.",
      avatar: "💻"
    },
    {
      id: InterviewerPersonality.HiringManager,
      name: "Hiring Manager",
      role: "Product & Engineering Director",
      description: "Bridges technical accuracy with business value. Evaluates project scope, delivery, and roadmap thinking.",
      avatar: "⚙️"
    },
    {
      id: InterviewerPersonality.Partner,
      name: "Partner",
      role: "Executive Consultant",
      description: "Focuses on strategic commercial alignment, client relationships, case study results, and leadership vision.",
      avatar: "🎯"
    },
    {
      id: InterviewerPersonality.Actuary,
      name: "Chief Actuary",
      role: "Capital & Risk Lead",
      description: "Specialized in actuarial mathematical modeling, reserving, GLM pricing, and IFRS17 requirements.",
      avatar: "📈"
    }
  ];

  const personalities = interviewers && interviewers.length > 0 
    ? interviewers.map(p => ({
        id: p.id as InterviewerPersonality,
        name: p.name,
        role: p.role,
        description: p.description,
        avatar: p.avatar
      }))
    : defaultPersonalities;

  const handleLaunch = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      await onStartInterview({
        mode,
        difficulty,
        personality,
        resumeId: selectedResumeId || undefined,
        jdId: selectedJdId || undefined,
        company: selectedCompany || undefined,
        actuarialFocus: mode === InterviewMode.Actuarial ? (selectedActuarialFocus || undefined) : undefined
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start interview. Check connection or GEMINI_API_KEY configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" id="interview-setup-panel">
      {/* Header */}
      <div>
        <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
          <Settings className="text-indigo-600 animate-spin-slow" size={22} /> Configure Mock Interview
        </h2>
        <p className="text-xs text-slate-500">Tailor the AI model, evaluation parameters, and context boundaries to match your target criteria.</p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-center gap-2" id="setup-error-banner">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Mode & Difficulty */}
        <div className="space-y-5 md:col-span-1">
          {/* Mode selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Speech size={14} className="text-brand-500" /> 1. Interview Mode
            </h3>
            <div className="space-y-2">
              {Object.values(InterviewMode).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium border transition ${
                    mode === m 
                      ? "bg-brand-50 text-brand-700 border-brand-300" 
                      : "bg-slate-50/50 hover:bg-slate-100/50 text-slate-600 border-slate-200/60"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Award size={14} className="text-brand-500" /> 2. Complexity Level
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(DifficultyLevel).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                    difficulty === lvl
                      ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                      : "bg-slate-50/50 hover:bg-slate-100/50 text-slate-600 border-slate-200/60"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 2: Choose Personality */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 md:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-emerald-500" /> 3. Coach Personality
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {personalities.map((p) => (
              <button
                key={p.id}
                onClick={() => setPersonality(p.id)}
                className={`text-left p-3.5 rounded-xl border transition flex gap-3 ${
                  personality === p.id
                    ? "bg-emerald-50/40 text-slate-800 border-emerald-300 shadow-sm"
                    : "bg-slate-50/50 hover:bg-slate-100/30 text-slate-600 border-slate-200/60"
                }`}
              >
                <span className="text-2xl mt-0.5">{p.avatar}</span>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-700">{p.name}</h4>
                  <p className="text-[10px] text-emerald-600 font-semibold">{p.role}</p>
                  <p className="text-[10px] text-slate-500 leading-normal">{p.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 3: Resume Awareness and JDs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4" id="setup-aware-docs">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={14} className="text-amber-500" /> 4. Contextual AI Awareness
        </h3>
        
        <p className="text-[11px] text-slate-500">
          Linking your resume and target JD allows the AI Coach Agent to craft customized, realistic questions targeting your concrete experience gaps, skillsets, and organizational roles.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <FileText size={13} className="text-brand-500" /> Bind Parsed Resume
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
            >
              <option value="">-- Let AI generate standard profile --</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.name} (ATS: {r.parsedData?.atsScore}%)</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Briefcase size={13} className="text-emerald-500" /> Bind Target Job context
            </label>
            <select
              value={selectedJdId}
              onChange={(e) => setSelectedJdId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
            >
              <option value="">-- Let AI use standard industry requirements --</option>
              {jds.map(j => (
                <option key={j.id} value={j.id}>{j.name}</option>
              ))}
            </select>
          </div>

          {/* Company Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <Sparkles size={13} className="text-indigo-500" /> Target Company Preset Style
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
            >
              <option value="">-- Standard Professional Interview Style --</option>
              <option value="Google">Google (Complex algorithms, scalability, open-ended systems)</option>
              <option value="Microsoft">Microsoft (Robust architecture, engineering rigor, system logic)</option>
              <option value="Amazon">Amazon (Deep focus on Leadership Principles & STAR behavior)</option>
              <option value="McKinsey & Co">McKinsey & Co (Case analysis, mental estimation, business value)</option>
              <option value="EY">EY (Professional advisory, financial audit, corporate risk)</option>
              <option value="Deloitte">Deloitte (Strategic implementation, client relations, enterprise solutions)</option>
            </select>
          </div>

          {/* Actuarial Focus (Dynamic) */}
          {mode === InterviewMode.Actuarial && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Award size={13} className="text-amber-500" /> Actuarial Specialization Focus
              </label>
              <select
                value={selectedActuarialFocus}
                onChange={(e) => setSelectedActuarialFocus(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-amber-500 bg-slate-50/50 font-medium text-slate-700"
              >
                <option value="">-- Select Actuarial Domain --</option>
                <option value="Pricing & Product Development">Pricing & Product Development (GLMs, demand elasticity)</option>
                <option value="Reserving & Valuation">Reserving & Valuation (Chain Ladder, Bornhuetter-Ferguson)</option>
                <option value="IFRS 17 Implementation">IFRS 17 Implementation (GMM, PAA, risk adjustment parameters)</option>
                <option value="Solvency II & Risk Capital">Solvency II & Risk Capital (SCR, MCR, standard formula vs internal model)</option>
                <option value="Capital Modelling & Stress Testing">Capital Modelling & Stress Testing (Stochastic projections, Copulas)</option>
                <option value="GLMs & Predictive Analytics">Generalized Linear Models (GLMs) & Machine Learning in Insurance</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleLaunch}
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-50 text-white rounded-lg font-semibold text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition"
        >
          {loading ? (
            <>
              <Clock className="animate-spin" size={15} /> Launching AI Interview Space...
            </>
          ) : (
            <>
              <Play size={15} fill="currentColor" /> Start Mock Interview Simulation <ChevronRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
