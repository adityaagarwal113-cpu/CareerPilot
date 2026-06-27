/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Play, Settings, User, FileText, Briefcase, ChevronRight, 
  Sparkles, ShieldAlert, Award, Clock, Speech, AlertCircle,
  Video, VideoOff
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
    webcamEnabled?: boolean;
  }) => Promise<void>;
  interviewers?: InterviewerProfile[];
}

function getPersonalityForMode(m: InterviewMode): InterviewerPersonality {
  switch (m) {
    case InterviewMode.TechnicalActuarial:
      return InterviewerPersonality.Actuary;
    case InterviewMode.HR:
      return InterviewerPersonality.RealHR;
    case InterviewMode.Behavioral:
      return InterviewerPersonality.Friendly;
    case InterviewMode.Managerial:
      return InterviewerPersonality.HiringManager;
    case InterviewMode.Partner:
      return InterviewerPersonality.Partner;
    case InterviewMode.OtherActuarial:
      return InterviewerPersonality.Strict;
    default:
      return InterviewerPersonality.Actuary;
  }
}

export default function InterviewSetup({ resumes, jds, onStartInterview, interviewers }: InterviewSetupProps) {
  const [mode, setMode] = useState<InterviewMode>(InterviewMode.TechnicalActuarial);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DifficultyLevel.Medium);
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
    const chosenPersonality = getPersonalityForMode(mode);
    try {
      await onStartInterview({
        mode,
        difficulty,
        personality: chosenPersonality,
        resumeId: selectedResumeId || undefined,
        jdId: selectedJdId || undefined,
        company: selectedCompany || undefined,
        actuarialFocus: (mode === InterviewMode.TechnicalActuarial || mode === InterviewMode.OtherActuarial) ? (selectedActuarialFocus || undefined) : undefined,
        webcamEnabled: true
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to start interview. Check connection or GEMINI_API_KEY configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" id="interview-setup-panel">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="text-indigo-600 animate-spin-slow" size={22} /> Actuarial Mock Interview Lab
          </h2>
          <p className="text-xs text-slate-500">Configure corporate mock simulations, calibrating the AI interviewer, sector specialization, and credentials context.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 font-bold shrink-0">
          <Sparkles size={11} className="animate-pulse" />
          <span>Powered by Gemini 2.5 Flash</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-center gap-2" id="setup-error-banner">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN (7 COLS): SESSION PARAMETERS & CONTEXT BINDING */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Primary Parameters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Speech size={14} className="text-indigo-600" /> 01. Interview Type & Level
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">Interview Mode / Focus</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as InterviewMode)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  {Object.values(InterviewMode).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase">Complexity Level</label>
                <div className="grid grid-cols-5 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  {Object.values(DifficultyLevel).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition text-center cursor-pointer ${
                        difficulty === lvl
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card: Contextual Awareness */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sparkles size={14} className="text-amber-500 animate-pulse" /> 02. Contextual AI Awareness
            </h3>

            <p className="text-[11px] text-slate-500 leading-normal">
              Binding your candidate document and target vacancy profile allows the AI Interviewer to construct highly targeted, hyper-realistic questions for actuarial standing evaluation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                  <FileText size={11} className="text-brand-500" /> Bind Active Resume
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none bg-slate-50/50 font-bold text-slate-700"
                >
                  <option value="">-- Let AI generate standard profile --</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.name} (ATS: {r.parsedData?.atsScore}%)</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                  <Briefcase size={11} className="text-emerald-500" /> Bind Target Job Description
                </label>
                <select
                  value={selectedJdId}
                  onChange={(e) => setSelectedJdId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none bg-slate-50/50 font-bold text-slate-700"
                >
                  <option value="">-- Let AI use standard industry requirements --</option>
                  {jds.map(j => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                  <Sparkles size={11} className="text-indigo-500" /> Target Company Benchmark
                </label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none bg-slate-50/50 font-bold text-slate-700"
                >
                  <option value="">-- Standard Professional Interview Style --</option>
                  <option value="Milliman">Milliman (Actuarial consultancy, modeling, and strategic reserving)</option>
                  <option value="Swiss Re">Swiss Re (Reinsurance pricing, catastrophic risk models, and capital management)</option>
                  <option value="LIC of India">LIC of India (Public-sector life contingencies, annuity reserves, and mortality studies)</option>
                  <option value="HDFC Ergo">HDFC Ergo (General insurance premium pricing, claims reserving, and GLMs)</option>
                  <option value="Prudential UK">Prudential UK (Long-term pension modeling, annuities, and SA2 life assurance)</option>
                  <option value="Bupa / Max Health">Bupa / Max Health (Health insurance pricing, critical illness, and morbidity tables)</option>
                </select>
              </div>

              {(mode === InterviewMode.TechnicalActuarial || mode === InterviewMode.OtherActuarial) && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                    <Award size={11} className="text-amber-500" /> Actuarial Specialization Focus
                  </label>
                  <select
                    value={selectedActuarialFocus}
                    onChange={(e) => setSelectedActuarialFocus(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none bg-slate-50/50 font-bold text-slate-700"
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
        </div>

        {/* RIGHT COLUMN (5 COLS): INTERVIEWER PROFILE & WEBCAM CALIBRATION */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* Assigned Coach */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User size={14} className="text-emerald-500" /> 03. Assigned AI Partner
            </h3>
            
            {(() => {
              const activeCoach = personalities.find(p => p.id === getPersonalityForMode(mode)) || personalities[0];
              return (
                <div className="p-4 bg-emerald-50/20 border border-emerald-100 rounded-xl flex gap-3.5 items-start text-left">
                  <span className="text-3xl p-2 bg-white shadow-sm rounded-xl border border-slate-100/80 shrink-0">{activeCoach?.avatar || "📈"}</span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-850">{activeCoach?.name}</h4>
                    <p className="text-[10px] text-emerald-600 font-black">{activeCoach?.role}</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{activeCoach?.description}</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Webcam Calibration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Video size={14} className="text-rose-500 animate-pulse" /> 04. Video Feed & Posture
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[8px] font-black border border-emerald-200 flex items-center gap-1 leading-none uppercase tracking-wider">
                Active
              </span>
            </div>

            <p className="text-[10px] text-slate-500 leading-normal">
              Camera feed is initialized automatically to enable visual proctoring, focus tracking, and presentation feedback metrics.
            </p>

            <div className="pt-1">
              <WebcamPreviewer />
            </div>
          </div>

        </div>
      </div>

      {/* Action triggers */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleLaunch}
          disabled={loading}
          className="w-full sm:w-auto px-10 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs inline-flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer hover:shadow-indigo-600/30"
        >
          {loading ? (
            <>
              <Clock className="animate-spin" size={15} /> Activating AI Interview Engine...
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" /> Initialize Simulation Session <ChevronRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function WebcamPreviewer() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const previewVideoRef = React.useRef<HTMLVideoElement | null>(null);

  const startPreview = async () => {
    setError(null);
    setLoading(true);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      setStream(s);
      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = s;
      }
    } catch (err: any) {
      console.warn("Setup camera preview blocked:", err);
      setError("Cannot access webcam. Make sure permissions are granted.");
    } finally {
      setLoading(false);
    }
  };

  const stopPreview = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [stream]);

  // Handle re-binding if the ref mounts after stream is set
  React.useEffect(() => {
    if (stream && previewVideoRef.current) {
      previewVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="space-y-2 border border-slate-100 rounded-lg p-2.5 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-600">Hardware Preview</span>
        {!stream ? (
          <button
            onClick={startPreview}
            disabled={loading}
            className="text-[9px] px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded font-bold transition flex items-center gap-1"
          >
            {loading ? "Checking..." : "Test Webcam"}
          </button>
        ) : (
          <button
            onClick={stopPreview}
            className="text-[9px] px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-bold transition"
          >
            Stop Test
          </button>
        )}
      </div>

      {error && (
        <p className="text-[9px] text-rose-500 font-medium leading-relaxed bg-rose-50 p-1.5 rounded border border-rose-100">
          ⚠️ {error}
        </p>
      )}

      {stream ? (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-200">
          <video
            ref={previewVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <span className="absolute bottom-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      ) : (
        <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-[10px] border border-dashed border-slate-200">
          Camera offline (Click Test to preview)
        </div>
      )}
    </div>
  );
}
