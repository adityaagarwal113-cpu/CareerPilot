/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, Briefcase, Play, Calendar, Star, TrendingUp, AlertCircle, 
  Award, Trash2, CheckCircle, ChevronRight, User, ShieldAlert, Sparkles, BookOpen,
  Plus, Check, Sliders, Clock, Compass, MapPin, DollarSign, LayoutGrid, Target,
  RefreshCw, ListTodo, Activity, LayoutDashboard
} from "lucide-react";
import { Resume, JobDescription, InterviewSession, CareerPreferences } from "../types";

interface DashboardProps {
  resumes: Resume[];
  jds: JobDescription[];
  interviews: InterviewSession[];
  userXp: number;
  userLevel: number;
  userBadges: string[];
  userStreak: number;
  userRole: string;
  careerPrefs: CareerPreferences;
  onAddXp: (xp: number) => void;
  onUploadRedirect: () => void;
  onStartInterviewRedirect: (session?: InterviewSession) => void;
  onSelectResume: (id: string) => void;
  onSelectJd: (id: string) => void;
  onDeleteResume: (id: string) => void;
  onDeleteJd: (id: string) => void;
  onViewReport: (session: InterviewSession) => void;
  onDeleteInterview?: (id: string) => void;
  examsCleared?: number;
  paperNames?: string;
  actuarialBoard?: string;
  onChangeTab?: (tab: string) => void;
}

interface MentorSuggestion {
  category: "resume" | "learning" | "networking" | "strategy";
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

interface DashboardSuggestionsResponse {
  careerReadinessScore?: number;
  interviewReadinessScore?: number;
  learningProgressScore?: number;
  confidenceTrend?: number[];
  recommendations?: string[];
  heatmap?: { [key: string]: number };
  mentorSuggestions?: MentorSuggestion[];
}

export default function Dashboard({
  resumes,
  jds,
  interviews,
  userXp,
  userLevel,
  userBadges,
  userStreak,
  userRole,
  careerPrefs,
  onAddXp,
  onUploadRedirect,
  onStartInterviewRedirect,
  onSelectResume,
  onSelectJd,
  onDeleteResume,
  onDeleteJd,
  onViewReport,
  onDeleteInterview,
  examsCleared = 3,
  paperNames = "CS1, CM1, CB1",
  actuarialBoard = "IAI",
  onChangeTab
}: DashboardProps) {
  
  // Clean, high-fidelity default recommendations
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<MentorSuggestion[]>([
    {
      category: "strategy",
      title: "Review Claim Reserving Claim Triangles",
      description: "Practice claim development tables, Bornhuetter-Ferguson expected loss ratios, and Solvency II reserving frameworks for premium general insurance lines.",
      priority: "High"
    },
    {
      category: "resume",
      title: "Elevate Technical Paper Codes Prominently",
      description: "State your CS1, CM1 and CB1 passes clearly on your top resume header to pass automated applicant tracking systems.",
      priority: "High"
    },
    {
      category: "learning",
      title: "IFRS 17 Contract Service Margin (CSM)",
      description: "Understand amortization and amortization release rules for long-duration contract liabilities under modern compliance standards.",
      priority: "Medium"
    }
  ]);

  const [scores, setScores] = useState({
    careerReadiness: 78,
    interviewReadiness: 65,
    learningProgress: 55,
    confidenceTrend: [62, 65, 68, 70, 75]
  });

  const [customRecommendations, setCustomRecommendations] = useState<string[]>([
    "Revise CM1 Compound Interest & Life Contingencies equations",
    "Practice SP7/SP8 general insurance reserving methods",
    "Review Professional Conduct Standards (APS) under IAI and IFoA guidelines"
  ]);

  // Dynamic AI Suggestions API fetch
  const fetchAiDashboardSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/dashboard/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userRole: userRole || "Practitioner Candidate",
          userLevel: `Level ${userLevel}`,
          careerPrefs,
          resumeText: resumes[0]?.text || ""
        })
      });
      if (response.ok) {
        const data: DashboardSuggestionsResponse = await response.json();
        if (data.careerReadinessScore) {
          setScores({
            careerReadiness: data.careerReadinessScore || 78,
            interviewReadiness: data.interviewReadinessScore || 65,
            learningProgress: data.learningProgressScore || 55,
            confidenceTrend: data.confidenceTrend || [62, 65, 68, 70, 75]
          });
        }
        if (data.recommendations) {
          setCustomRecommendations(data.recommendations);
        }
        if (data.mentorSuggestions) {
          setAiSuggestions(data.mentorSuggestions);
        }
      }
    } catch (err) {
      console.error("Dashboard suggestions API error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiDashboardSuggestions();
  }, [userRole]);

  // Key metrics calculation
  const completedInterviews = interviews.filter(i => i.status === "completed" && i.reportCard);
  const totalCompleted = completedInterviews.length;
  
  const avgOverallScore = totalCompleted 
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.reportCard?.overallScore || 0), 0) / totalCompleted)
    : 72;

  // Static core objectives for candidates to track (Replaces messy custom task adder)
  const coreObjectives = [
    { text: "Launch and complete an adaptive actuarial interview simulation", done: totalCompleted > 0 },
    { text: "Review ATS resume matching report against target JDs", done: resumes.length > 0 },
    { text: "Refine paper codes and credentials in the account settings setup", done: examsCleared > 0 }
  ];

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto p-2" id="professional-actuarial-dashboard">
      
      {/* SECTION 1: HEADER & PROFILE CONTEXT */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">
              <LayoutDashboard size={18} />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300">
              Actuarial Intelligence Platform
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            Welcome back, {careerPrefs.targetCompanies[0] ? `Candidate for ${careerPrefs.targetCompanies[0]}` : "Actuarial Associate"}
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Active Profile Track: <strong className="text-indigo-300 font-bold">{userRole || "Pricing/Reserving Specialist"}</strong> with focus on <strong className="text-slate-200">{careerPrefs.industry || "General & Life Insurance"}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onChangeTab?.("setup")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-sm transition flex items-center gap-1 cursor-pointer"
          >
            <Play size={12} fill="currentColor" />
            <span>Simulate Interview</span>
          </button>
          <button
            onClick={() => onChangeTab?.("cv-builder")}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-black rounded-xl shadow-sm transition flex items-center gap-1 cursor-pointer"
          >
            <FileText size={12} />
            <span>ATS CV Builder</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: STANDING & CREDENTIALS BANNER */}
      <div className="bg-gradient-to-r from-indigo-50/70 to-indigo-50/20 border border-indigo-100/80 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-900">
            <Award className="text-indigo-600 shrink-0" size={16} />
            <span className="text-xs font-black uppercase tracking-wider">Professional Board Standing</span>
          </div>
          <p className="text-xs text-slate-700 font-semibold">
            Affiliated to <strong className="text-indigo-800 font-extrabold">{actuarialBoard === "Both" ? "IAI & IFoA UK (Dual Status)" : actuarialBoard}</strong> with <strong className="text-indigo-800 font-extrabold">{examsCleared} Exam Passes</strong> verified.
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Passed:</span>
            <div className="flex flex-wrap gap-1">
              {paperNames.split(",").map(p => p.trim()).filter(Boolean).map(paper => (
                <span key={paper} className="text-[9px] font-mono font-black bg-indigo-100 text-indigo-800 border border-indigo-200/50 px-2.5 py-0.5 rounded">
                  {paper}
                </span>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => onChangeTab?.("cv-builder")}
          className="text-xs font-black text-indigo-700 hover:text-indigo-900 transition flex items-center gap-0.5"
        >
          <span>Modify Credentials</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* SECTION 3: KEY PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Career Readiness */}
        <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wide">Readiness Index</span>
            <Target size={16} className="text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800">{scores.careerReadiness}</span>
            <span className="text-slate-400 text-xs font-semibold">/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${scores.careerReadiness}%` }} />
          </div>
        </div>

        {/* Completed Runs */}
        <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wide">Simulations Completed</span>
            <Activity size={16} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800">{totalCompleted}</span>
            <span className="text-slate-400 text-xs font-semibold">run{totalCompleted !== 1 && "s"}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold leading-none">
            {totalCompleted > 0 ? `Average valuation rating of ${avgOverallScore}%` : "No simulation data logged yet"}
          </p>
        </div>

        {/* Streak Counter */}
        <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wide">Daily Prep Streak</span>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-800">{userStreak}</span>
            <span className="text-slate-400 text-xs font-semibold">days active</span>
          </div>
          <p className="text-[10px] text-amber-600 font-black flex items-center gap-0.5">
            🔥 Keep up the compounding momentum!
          </p>
        </div>

        {/* Tier Accumulator */}
        <div className="bg-slate-900 text-white p-5 border border-slate-800 rounded-2xl shadow-sm space-y-2.5">
          <div className="flex justify-between items-center text-indigo-300">
            <span className="text-xs font-bold uppercase tracking-wide">Valuation Level</span>
            <Award size={16} className="text-amber-400 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">Tier {userLevel}</span>
            <span className="text-indigo-300 text-xs font-semibold">({userXp} XP)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(userXp % 500) / 5}%` }} />
          </div>
        </div>

      </div>

      {/* SECTION 4: BENTO COLUMNS - RECOMMENDATIONS & DOCUMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* RECOMMENDATIONS (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div className="space-y-0.5">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-600" />
                Targeted AI Professional Recommendations
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">Derived from your target firms and current actuarial standing.</p>
            </div>
            {isAiLoading && (
              <span className="text-[10px] text-indigo-600 font-mono font-bold flex items-center gap-1">
                <RefreshCw size={11} className="animate-spin" /> Analyzing...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiSuggestions.map((sug, idx) => (
              <div 
                key={idx} 
                className={`p-3.5 bg-slate-50 border rounded-xl flex flex-col justify-between space-y-2 relative transition hover:bg-slate-50/40 ${
                  sug.priority === "High" ? "border-l-4 border-l-rose-500 border-slate-200" :
                  sug.priority === "Medium" ? "border-l-4 border-l-amber-500 border-slate-200" :
                  "border-l-4 border-l-blue-500 border-slate-200"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide">
                      {sug.category}
                    </span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                      sug.priority === "High" ? "bg-rose-50 text-rose-700" :
                      sug.priority === "Medium" ? "bg-amber-50 text-amber-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>
                      {sug.priority}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-black text-slate-800 line-clamp-1">{sug.title}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">{sug.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Core Target Milestones Check list (Static & Premium) */}
          <div className="bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-xl space-y-2">
            <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1">
              <Compass size={12} /> Key Target Milestones
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-600 font-semibold">
              {coreObjectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                    obj.done ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white"
                  }`}>
                    {obj.done && <Check size={10} strokeWidth={3} />}
                  </span>
                  <span className={`truncate ${obj.done ? "line-through text-slate-400" : "text-slate-700"}`}>{obj.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DOCUMENT REPOSITORIES (1/3 width) */}
        <div className="bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                <FileText size={14} className="text-indigo-600" /> Active Materials
              </h3>
              <button 
                onClick={onUploadRedirect} 
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Upload Center
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {resumes.map(res => (
                <div 
                  key={res.id} 
                  onClick={() => onSelectResume(res.id)}
                  className="group flex justify-between items-center p-2.5 bg-slate-50 hover:bg-indigo-50/40 rounded-xl border border-slate-200/30 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <FileText size={12} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-bold text-slate-700 truncate">{res.name}</h4>
                      <p className="text-[9px] text-slate-400 font-mono">ATS Match: {res.parsedData?.atsScore || "85"}/100</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteResume(res.id); }}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 cursor-pointer shrink-0 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {jds.map(jd => (
                <div 
                  key={jd.id} 
                  onClick={() => onSelectJd(jd.id)}
                  className="group flex justify-between items-center p-2.5 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200/30 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                      <Briefcase size={12} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-bold text-slate-700 truncate">{jd.name}</h4>
                      <p className="text-[9px] text-slate-400 font-mono">{jd.parsedData?.company || "Job Profile"}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteJd(jd.id); }}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 cursor-pointer shrink-0 transition"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {resumes.length === 0 && jds.length === 0 && (
                <div className="py-8 text-center text-slate-400 italic text-xs">No active CVs or Target JDs.</div>
              )}
            </div>
          </div>

          <button
            onClick={() => onStartInterviewRedirect()}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-sm"
          >
            <Play size={11} fill="currentColor" /> Configure New Simulator Session
          </button>
        </div>

      </div>

      {/* SECTION 5: HISTORICAL SESSION LOG */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <Activity size={14} className="text-slate-700" /> Professional Simulation Log
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Record of adaptive mock video sessions and score reports.</p>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
            {interviews.length} Total Runs
          </span>
        </div>

        {interviews.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
            No mock interviews recorded yet. Start your first session to capture deep AI evaluation reports.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-extrabold text-[9px]">
                  <th className="pb-3 pl-2">Simulation Topic</th>
                  <th className="pb-3">Difficulty Target</th>
                  <th className="pb-3">Personality Model</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center">AI Rating Score</th>
                  <th className="pb-3 pr-2 text-right">Interactive Review</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map(session => (
                  <tr key={session.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition align-middle">
                    <td className="py-3 pl-2 font-bold text-slate-700 flex items-center gap-2">
                      <span className="p-1 bg-indigo-50 text-indigo-600 rounded-md shrink-0">
                        <Play size={10} fill="currentColor" />
                      </span>
                      {session.mode}
                    </td>
                    <td className="py-3 text-slate-600 font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        session.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        session.difficulty === "Medium" ? "bg-blue-50 text-blue-700 border-blue-100" :
                        session.difficulty === "Hard" ? "bg-amber-50 text-amber-700 border-amber-100" :
                        "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {session.difficulty}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 font-semibold">{session.personality}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        session.status === "completed" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-amber-50 text-amber-800 border border-amber-100"
                      }`}>
                        {session.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono font-black text-slate-800 text-sm">
                      {session.reportCard?.overallScore !== undefined ? (
                        <div className="inline-flex items-center gap-1">
                          <Star size={11} className="text-amber-400" fill="currentColor" />
                          {session.reportCard.overallScore}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {session.status === "completed" ? (
                          <button
                            onClick={() => onViewReport(session)}
                            className="px-2.5 py-1 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-xl font-bold transition inline-flex items-center gap-1 cursor-pointer text-xs"
                          >
                            Feedback <ChevronRight size={12} />
                          </button>
                        ) : (
                          <button
                            onClick={() => onStartInterviewRedirect(session)}
                            className="px-2.5 py-1 text-amber-600 hover:bg-amber-50 border border-amber-100 rounded-xl font-bold transition inline-flex items-center gap-1 cursor-pointer text-xs"
                          >
                            Resume <ChevronRight size={12} />
                          </button>
                        )}
                        {onDeleteInterview && (
                          <button
                            onClick={() => onDeleteInterview(session.id)}
                            className="p-1 text-slate-400 hover:bg-rose-50 border border-transparent hover:border-rose-100 hover:text-rose-600 rounded-lg transition cursor-pointer"
                            title="Delete this interview session"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
