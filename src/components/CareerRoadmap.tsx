/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Award, Sparkles, RefreshCw, BookOpen, TrendingUp, CheckCircle, 
  Calendar, DollarSign, Layers, Briefcase, ArrowRight, ChevronRight, 
  ChevronLeft, HelpCircle, Save, Trash2, Play, Sliders, CheckSquare, 
  Target, Zap, Compass, ChevronDown, ListChecks, Landmark, ExternalLink
} from "lucide-react";
import { Resume } from "../types";

interface CareerRoadmapProps {
  resumes: Resume[];
  userRole?: string;
  careerPrefs?: any;
  onAddXp: (xp: number) => void;
  onBackToDashboard?: () => void;
}

interface SkillGap {
  category: string;
  name: string;
  severity: "High" | "Medium" | "Low";
  currentLevel: string;
  description: string;
  isCompleted?: boolean;
}

interface LearningMilestone {
  timeframe: string;
  title: string;
  objectives: string[];
  completedObjectives?: string[];
  skillsToAcquire: string[];
  suggestedResources: string[];
}

interface ProjectRecommendation {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  techStack: string[];
  keyFeatures: string[];
  completedFeatures?: string[];
}

interface SalaryInsights {
  feasibility: "High" | "Medium" | "Stretch" | string;
  marketRange: string;
  strategyText: string;
}

interface RoadmapData {
  summary: string;
  skillGaps: SkillGap[];
  learningMilestones: LearningMilestone[];
  projectRecommendations: ProjectRecommendation[];
  salaryInsights: SalaryInsights;
}

export default function CareerRoadmap({ 
  resumes, 
  userRole, 
  careerPrefs, 
  onAddXp, 
  onBackToDashboard 
}: CareerRoadmapProps) {
  
  // Goals State
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");
  const [targetIndustry, setTargetIndustry] = useState<string>("");
  const [targetSalary, setTargetSalary] = useState<string>("");
  
  // App States
  const [loading, setLoading] = useState<boolean>(false);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  
  // Interactive / Tracking States
  const [activeTab, setActiveTab] = useState<"overview" | "gaps" | "milestones" | "projects" | "negotiation">("overview");
  const [expandedMilestone, setExpandedMilestone] = useState<number>(0);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  // Initialize form default values from user profile info
  useEffect(() => {
    if (resumes && resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
    if (userRole && !targetRole) {
      setTargetRole(userRole);
    } else if (!targetRole) {
      setTargetRole("Actuarial Associate (CS1/CM1 Cleared)");
    }
    if (careerPrefs) {
      if (careerPrefs.industry && !targetIndustry) {
        setTargetIndustry(careerPrefs.industry);
      }
      if (careerPrefs.expectedSalary && !targetSalary) {
        setTargetSalary(careerPrefs.expectedSalary);
      }
    } else {
      setTargetSalary("₹12,00,000 - ₹18,00,000");
      setTargetIndustry("Life Insurance");
    }
  }, [resumes, userRole, careerPrefs]);

  // Load saved roadmap on startup
  useEffect(() => {
    const saved = localStorage.getItem("career_os_roadmap");
    if (saved) {
      try {
        setRoadmap(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading roadmap from storage", e);
      }
    }
  }, []);

  const saveToStorage = (updatedRoadmap: RoadmapData) => {
    setRoadmap(updatedRoadmap);
    localStorage.setItem("career_os_roadmap", JSON.stringify(updatedRoadmap));
  };

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !targetRole.trim()) {
      setErrorMsg("Please select a resume and fill out your Target Role.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    const selectedResume = resumes.find(r => r.id === selectedResumeId);
    const resumeText = selectedResume?.parsedData 
      ? JSON.stringify(selectedResume.parsedData) 
      : selectedResume?.text || "";

    try {
      const response = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          targetRole,
          industry: targetIndustry || "Technology",
          salary: targetSalary || "$150,000",
          resumeText
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate roadmap from the server cluster.");
      }

      const data: RoadmapData = await response.json();
      
      // Initialize completed arrays
      if (data.skillGaps) {
        data.skillGaps = data.skillGaps.map(g => ({ ...g, isCompleted: false }));
      }
      if (data.learningMilestones) {
        data.learningMilestones = data.learningMilestones.map(m => ({ ...m, completedObjectives: [] }));
      }
      if (data.projectRecommendations) {
        data.projectRecommendations = data.projectRecommendations.map(p => ({ ...p, completedFeatures: [] }));
      }

      saveToStorage(data);
      onAddXp(60); // Award 60 XP for mapping out a career roadmap!
      setActiveTab("overview");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred while mapping the roadmap. Make sure your central API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSkill = (index: number) => {
    if (!roadmap) return;
    const updatedGaps = [...roadmap.skillGaps];
    const target = updatedGaps[index];
    const prevVal = !!target.isCompleted;
    target.isCompleted = !prevVal;
    
    const updated = { ...roadmap, skillGaps: updatedGaps };
    saveToStorage(updated);
    
    if (!prevVal) {
      onAddXp(15); // Award XP for addressing a gap!
    }
  };

  const handleToggleObjective = (milestoneIndex: number, objective: string) => {
    if (!roadmap) return;
    const updatedMilestones = [...roadmap.learningMilestones];
    const currentMilestone = updatedMilestones[milestoneIndex];
    
    if (!currentMilestone.completedObjectives) {
      currentMilestone.completedObjectives = [];
    }

    const index = currentMilestone.completedObjectives.indexOf(objective);
    if (index > -1) {
      currentMilestone.completedObjectives.splice(index, 1);
    } else {
      currentMilestone.completedObjectives.push(objective);
      onAddXp(10); // Award XP for finishing a milestone goal!
    }

    const updated = { ...roadmap, learningMilestones: updatedMilestones };
    saveToStorage(updated);
  };

  const handleToggleProjectFeature = (projectIndex: number, feature: string) => {
    if (!roadmap) return;
    const updatedProjects = [...roadmap.projectRecommendations];
    const currentProject = updatedProjects[projectIndex];

    if (!currentProject.completedFeatures) {
      currentProject.completedFeatures = [];
    }

    const index = currentProject.completedFeatures.indexOf(feature);
    if (index > -1) {
      currentProject.completedFeatures.splice(index, 1);
    } else {
      currentProject.completedFeatures.push(feature);
      onAddXp(15); // Award 15 XP for ticking off advanced design requirements!
    }

    const updated = { ...roadmap, projectRecommendations: updatedProjects };
    saveToStorage(updated);
  };

  const handleClearRoadmap = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
      setTimeout(() => setIsConfirmingClear(false), 3000); // Reset confirmation state after 3 seconds
    } else {
      localStorage.removeItem("career_os_roadmap");
      setRoadmap(null);
      setIsConfirmingClear(false);
    }
  };

  // Progress metrics
  const getOverallProgress = () => {
    if (!roadmap) return 0;
    
    // Calculate total items
    let totalItems = 0;
    let completedItems = 0;

    // Gaps (each counts as 1 item)
    if (roadmap.skillGaps) {
      totalItems += roadmap.skillGaps.length;
      completedItems += roadmap.skillGaps.filter(g => g.isCompleted).length;
    }

    // Milestone objectives
    if (roadmap.learningMilestones) {
      roadmap.learningMilestones.forEach(m => {
        totalItems += m.objectives.length;
        completedItems += (m.completedObjectives || []).length;
      });
    }

    // Project features
    if (roadmap.projectRecommendations) {
      roadmap.projectRecommendations.forEach(p => {
        totalItems += p.keyFeatures.length;
        completedItems += (p.completedFeatures || []).length;
      });
    }

    if (totalItems === 0) return 0;
    return Math.round((completedItems / totalItems) * 100);
  };

  const progressPercent = getOverallProgress();

  return (
    <div className="space-y-6" id="career-roadmap-generator-suite">
      
      {/* HEADER HERO BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm text-left">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition mr-1"
              title="Back to Dashboard"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-brand-50 text-brand-700 font-extrabold uppercase px-2 py-0.5 rounded border border-brand-100">
                MODULE 3: CAREER ROADMAP GENERATOR
              </span>
              <span className="w-2 h-2 rounded-full bg-brand-500" />
            </div>
            <h2 className="font-display font-black text-slate-800 text-base mt-1">AI Career Roadmap & Skill-Gap Analysis</h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Map out custom milestones, align skill deficiencies with direct project recommendations, and secure your compensation goals.</p>
          </div>
        </div>

        {/* Saved indicator and action */}
        {roadmap && (
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-between">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold">ROADMAP PROGRESS</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-brand-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-xs font-black font-mono text-brand-600">{progressPercent}%</span>
              </div>
            </div>
            <button
              onClick={handleClearRoadmap}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                isConfirmingClear 
                  ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-500 animate-pulse" 
                  : "hover:bg-rose-50 hover:text-rose-600 text-slate-400 border-slate-200/60"
              }`}
              title={isConfirmingClear ? "Click again to confirm clear" : "Clear & Start New Roadmap"}
            >
              <Trash2 size={13} />
              {isConfirmingClear && <span>Confirm Clear?</span>}
            </button>
          </div>
        )}
      </div>

      {/* STATE 1: NO ROADMAP (INPUT SETUP CONFIG) */}
      {!roadmap && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-8 space-y-6 text-left animate-fade-in">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
              <Compass size={24} className="animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <h3 className="font-display font-black text-slate-800 text-base">Setup Your Transition Parameters</h3>
            <p className="text-xs text-slate-400 font-medium">Configure your core career goals, and the Gemini agent will synthesize a meticulous path to cross the line.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs font-medium leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleGenerateRoadmap} className="space-y-4">
            {/* Resume Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">1. Select Reference Resume</label>
              {resumes.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2">
                  <span>No resumes found in the Document Center. Go upload one first to get a personalized gap analysis, or generate one from profile info.</span>
                </div>
              ) : (
                <select
                  required
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-bold cursor-pointer"
                >
                  <option value="">-- Choose Resume --</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.name} (Uploaded {new Date(r.createdAt).toLocaleDateString()})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Target Role & Industry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">2. Target Role / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Actuarial Associate"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">3. Target Industry</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Life Insurance, Pensions, General Insurance"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/80 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-slate-700"
                />
              </div>
            </div>

            {/* Expected Compensation */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">4. Expected Salary Goals (₹ INR)</label>
              <input
                type="text"
                required
                placeholder="e.g. ₹12,00,000 - ₹18,00,000"
                value={targetSalary}
                onChange={(e) => setTargetSalary(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-slate-700 font-mono font-bold"
              />
            </div>

            {/* Trigger Button */}
            <button
              type="submit"
              disabled={loading || resumes.length === 0}
              className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                loading || resumes.length === 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-brand-500 hover:bg-brand-600 active:scale-95 text-white shadow-md shadow-brand-500/10 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin text-white shrink-0" size={14} />
                  <span>Consulting Elite Coach Agents...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-white" />
                  <span>Synthesize Personalized Career Roadmap (+60 XP)</span>
                </>
              )}
            </button>
          </form>

          {loading && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 animate-pulse space-y-2 text-center text-xs text-slate-500 font-semibold">
              <div className="font-bold text-slate-700">Analyzing professional background, credentials and target role...</div>
              <div className="text-[10px] text-slate-400">Performing architectural gap analysis & mapping learning milestones. This can take up to 10 seconds. Please hold on!</div>
            </div>
          )}
        </div>
      )}

      {/* STATE 2: ROADMAP CONTEXT SHOWN */}
      {roadmap && (
        <div className="space-y-6 animate-fade-in">
          
          {/* NAVIGATION TABS RAIL */}
          <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-full overflow-x-auto select-none border border-slate-200/40">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === "overview" 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Compass size={13} className="text-brand-500" /> Strategic Overview
            </button>
            <button
              onClick={() => setActiveTab("gaps")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === "gaps" 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Target size={13} className="text-amber-500" /> Skill Gaps ({roadmap.skillGaps?.filter(s => !s.isCompleted).length || 0} left)
            </button>
            <button
              onClick={() => setActiveTab("milestones")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === "milestones" 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Calendar size={13} className="text-indigo-500" /> Learning Path
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === "projects" 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers size={13} className="text-emerald-500" /> Project Lab
            </button>
            <button
              onClick={() => setActiveTab("negotiation")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === "negotiation" 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <DollarSign size={13} className="text-teal-500" /> Compensation Strategy
            </button>
          </div>

          {/* TAB 1: OVERVIEW SUMMARY */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column Strategy Summary */}
              <div className="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs">
                    <Target size={15} /> EXECUTIVE PROFILE SUMMARY
                  </div>
                  <h3 className="font-display font-black text-slate-800 text-lg leading-tight">
                    The Path to securing: <span className="text-brand-600">{targetRole}</span>
                  </h3>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 leading-relaxed font-medium italic">
                    "{roadmap.summary}"
                  </div>

                  {/* Highlights Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="p-3 bg-brand-50/50 border border-brand-100/50 rounded-2xl">
                      <div className="text-[10px] text-brand-700 font-extrabold uppercase">Target Compensation</div>
                      <div className="text-xs font-black font-mono text-brand-900 mt-1">{targetSalary}</div>
                    </div>
                    <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-2xl">
                      <div className="text-[10px] text-amber-700 font-extrabold uppercase">Target Sector</div>
                      <div className="text-xs font-black text-amber-900 mt-1 truncate" title={targetIndustry}>{targetIndustry}</div>
                    </div>
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl">
                      <div className="text-[10px] text-indigo-700 font-extrabold uppercase">Skill Gaps Tracked</div>
                      <div className="text-xs font-black text-indigo-900 mt-1 font-mono">
                        {roadmap.skillGaps?.length || 0} Core Elements
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 mt-6 flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span className="flex items-center gap-1">🛡️ Automated Career Matrix Engine</span>
                  <button
                    onClick={() => setActiveTab("gaps")}
                    className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-black rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    Examine Gaps <ChevronRight size={11} />
                  </button>
                </div>
              </div>

              {/* Right Column Gamified Transition Card */}
              <div className="lg:col-span-4 bg-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -z-10" />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] bg-brand-500 text-white font-extrabold px-2 py-0.5 rounded uppercase">
                      GOAL SYNCED
                    </span>
                    <Compass size={18} className="text-brand-400 animate-spin" style={{ animationDuration: "12s" }} />
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Transition Score</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl font-black font-mono text-brand-400">{100 - (roadmap.skillGaps?.filter(s => !s.isCompleted).length * 10 || 30)}</span>
                      <span className="text-slate-400 font-semibold text-xs">/ 100 compatibility</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                    Address core technical gaps, complete your curated milestone objectives, and check off project parameters to raise your target transition score to 100%!
                  </p>
                </div>

                <div className="space-y-3 mt-6 border-t border-slate-800 pt-5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Roadmap Progress:</span>
                    <span className="text-brand-400 font-mono">{progressPercent}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-brand-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SKILL GAPS AUDIT */}
          {activeTab === "gaps" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 text-left space-y-6 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                  <Target size={16} className="text-brand-500" /> Career Technical & Soft Skill Gap Analysis
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Meticulous audit mapping your current resume credentials against target recruiter expectations. Click to address and clear resolved gaps!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roadmap.skillGaps?.map((gap, i) => {
                  let badgeStyle = "bg-rose-50 border-rose-100 text-rose-800";
                  if (gap.severity === "Medium") badgeStyle = "bg-amber-50 border-amber-100 text-amber-800";
                  if (gap.severity === "Low") badgeStyle = "bg-slate-50 border-slate-100 text-slate-600";

                  return (
                    <div 
                      key={i} 
                      onClick={() => handleToggleSkill(i)}
                      className={`p-4 border rounded-2xl transition cursor-pointer text-left flex items-start gap-3 select-none ${
                        gap.isCompleted 
                          ? "bg-slate-50/50 border-slate-200 opacity-60" 
                          : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 transition ${
                        gap.isCompleted ? "bg-brand-500 border-brand-500 text-white" : "bg-white border-slate-300"
                      }`}>
                        {gap.isCompleted && "✓"}
                      </div>
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex justify-between items-start gap-2 flex-wrap">
                          <h4 className={`text-xs font-black truncate ${gap.isCompleted ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {gap.name}
                          </h4>
                          <div className="flex gap-1">
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold uppercase px-1.5 py-0.5 rounded border border-indigo-100 shrink-0">
                              {gap.category}
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 ${badgeStyle}`}>
                              {gap.severity} Priority
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          {gap.description}
                        </p>
                        <div className="text-[9px] font-bold font-mono text-slate-400">
                          Current Level detected: <span className="text-slate-600 font-extrabold">{gap.currentLevel || "None"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(!roadmap.skillGaps || roadmap.skillGaps.length === 0) && (
                  <div className="col-span-2 py-12 border border-dashed border-slate-200 rounded-3xl text-center text-xs text-slate-400 italic">
                    No major skill gaps detected. You are highly aligned for this target role!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LEARNING MILESTONES TIMELINE */}
          {activeTab === "milestones" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left sidebar milestones directories lists */}
              <div className="lg:col-span-4 space-y-3 text-left">
                <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Learning Phases Timeline:</h4>
                <div className="space-y-2 select-none">
                  {roadmap.learningMilestones?.map((milestone, idx) => {
                    const isSelected = expandedMilestone === idx;
                    const completedCount = milestone.completedObjectives?.length || 0;
                    const totalCount = milestone.objectives.length;
                    const isDone = completedCount === totalCount;

                    return (
                      <button
                        key={idx}
                        onClick={() => setExpandedMilestone(idx)}
                        className={`w-full p-3.5 border rounded-2xl text-left transition flex items-start gap-3 cursor-pointer ${
                          isSelected 
                            ? "bg-brand-50/50 border-brand-200 shadow-sm" 
                            : "bg-white hover:bg-slate-50/50 border-slate-200"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold transition ${
                          isDone 
                            ? "bg-emerald-500 text-white" 
                            : isSelected 
                              ? "bg-brand-600 text-white" 
                              : "bg-slate-100 text-slate-500"
                        }`}>
                          {isDone ? "✓" : idx + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wide text-brand-600 block">
                            {milestone.timeframe}
                          </span>
                          <h5 className="text-xs font-black text-slate-800 truncate">{milestone.title}</h5>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 font-mono">
                            <span>Objectives:</span>
                            <span className="text-slate-600">{completedCount} / {totalCount}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right detailed workspace parameters for active milestone */}
              <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 text-left space-y-6 shadow-sm">
                {roadmap.learningMilestones && roadmap.learningMilestones[expandedMilestone] ? (
                  (() => {
                    const activeMilestone = roadmap.learningMilestones[expandedMilestone];
                    
                    return (
                      <div className="space-y-5 animate-fade-in">
                        <div className="border-b border-slate-100 pb-4">
                          <span className="text-[9px] bg-brand-50 text-brand-700 font-black uppercase px-2 py-0.5 rounded border border-brand-100">
                            {activeMilestone.timeframe}
                          </span>
                          <h3 className="font-display font-black text-slate-800 text-base mt-2">
                            {activeMilestone.title}
                          </h3>
                        </div>

                        {/* Objectives Checklists */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1">
                            <ListChecks size={13} className="text-brand-500" /> Milestone Action Objectives:
                          </h4>
                          <div className="space-y-2">
                            {activeMilestone.objectives.map((obj, i) => {
                              const isChecked = activeMilestone.completedObjectives?.includes(obj);

                              return (
                                <div 
                                  key={i}
                                  onClick={() => handleToggleObjective(expandedMilestone, obj)}
                                  className={`p-3 border rounded-xl transition cursor-pointer flex items-center gap-3 select-none ${
                                    isChecked 
                                      ? "bg-slate-50/50 border-slate-200 opacity-65" 
                                      : "bg-white hover:bg-slate-50/30 border-slate-200/60"
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border text-[9px] flex items-center justify-center shrink-0 transition ${
                                    isChecked ? "bg-brand-500 border-brand-500 text-white" : "bg-white border-slate-300"
                                  }`}>
                                    {isChecked && "✓"}
                                  </div>
                                  <span className={`text-xs font-semibold ${isChecked ? "line-through text-slate-400" : "text-slate-700"}`}>
                                    {obj}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Skills acquired */}
                        {activeMilestone.skillsToAcquire && activeMilestone.skillsToAcquire.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Skills to Acquire:</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {activeMilestone.skillsToAcquire.map((skill, i) => (
                                <span key={i} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-black px-2.5 py-1 rounded-xl transition cursor-default">
                                  ⚡ {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggested resources */}
                        {activeMilestone.suggestedResources && activeMilestone.suggestedResources.length > 0 && (
                          <div className="space-y-2 bg-indigo-50/30 border border-indigo-100/30 p-4 rounded-2xl">
                            <h4 className="text-[10px] text-indigo-700 font-black uppercase tracking-wider flex items-center gap-1">
                              <BookOpen size={12} /> Curated Learning Resources:
                            </h4>
                            <ul className="space-y-1.5 pt-1">
                              {activeMilestone.suggestedResources.map((res, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition cursor-pointer">
                                  <span className="text-brand-500">•</span>
                                  <span>{res}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="py-20 text-center text-xs text-slate-400 italic">
                    Select a learning milestone phase to see your detailed training instructions.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: PORTFOLIO PROJECT LAB */}
          {activeTab === "projects" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 text-left space-y-6 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                  <Layers size={16} className="text-emerald-500" /> Custom Project Blueprint Recommendations
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Custom-tailored, production-ready portfolio project outlines designed to prove your competency in identified gaps. Use these checkmarks to track feature builds!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roadmap.projectRecommendations?.map((project, pIdx) => {
                  let diffColor = "bg-indigo-50 text-indigo-700 border-indigo-100";
                  if (project.difficulty === "Advanced") diffColor = "bg-rose-50 text-rose-700 border-rose-100";

                  const completedFeatures = project.completedFeatures || [];
                  const isFinished = completedFeatures.length === project.keyFeatures.length;

                  return (
                    <div 
                      key={pIdx} 
                      className={`border rounded-3xl p-5 space-y-4 flex flex-col justify-between transition ${
                        isFinished 
                          ? "bg-slate-50/60 border-slate-200 opacity-70" 
                          : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2 flex-wrap">
                          <h4 className="text-xs font-black text-slate-800 truncate max-w-[200px]" title={project.title}>
                            📂 {project.title}
                          </h4>
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${diffColor}`}>
                            {project.difficulty} Build
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                          {project.description}
                        </p>

                        {/* Tech Stack Badges */}
                        <div className="flex flex-wrap gap-1">
                          {project.techStack?.map((tech, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 font-extrabold text-slate-600 px-2 py-0.5 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Features checklists */}
                        <div className="space-y-2 border-t border-slate-50 pt-3">
                          <h5 className="text-[10px] text-slate-400 font-extrabold uppercase">Required Architecture Checklist:</h5>
                          <div className="space-y-1.5">
                            {project.keyFeatures?.map((feat, i) => {
                              const isChecked = completedFeatures.includes(feat);

                              return (
                                <div 
                                  key={i}
                                  onClick={() => handleToggleProjectFeature(pIdx, feat)}
                                  className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition ${
                                    isChecked 
                                      ? "bg-emerald-50/20 border-emerald-100 text-slate-400" 
                                      : "bg-slate-50/50 border-slate-100 hover:bg-slate-100/40 text-slate-600"
                                  }`}
                                >
                                  <div className={`w-3.5 h-3.5 rounded border text-[8px] flex items-center justify-center shrink-0 mt-0.5 transition ${
                                    isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-slate-300"
                                  }`}>
                                    {isChecked && "✓"}
                                  </div>
                                  <span className={`text-[10px] font-semibold ${isChecked ? "line-through" : ""}`}>{feat}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-50 pt-3 mt-4 flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold">
                        <span>XP potential: +15 XP/feature</span>
                        <span>{completedFeatures.length} / {project.keyFeatures?.length} completed</span>
                      </div>
                    </div>
                  );
                })}

                {(!roadmap.projectRecommendations || roadmap.projectRecommendations.length === 0) && (
                  <div className="col-span-2 py-12 border border-dashed border-slate-200 rounded-3xl text-center text-xs text-slate-400 italic">
                    No target projects synthesized.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: COMPENSATION STRATEGY */}
          {activeTab === "negotiation" && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 text-left space-y-6 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                  <DollarSign size={16} className="text-teal-500" /> Career Compensation & Negotiation Strategy
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Meticulous financial insights based on your target salary request of <span className="text-slate-700 font-extrabold">{targetSalary}</span> in the <span className="text-slate-700 font-extrabold">{targetIndustry}</span> sector.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Feasibility gauges */}
                <div className="lg:col-span-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-4">
                  <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Salary Feasibility:</h4>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-500">Reach Level</span>
                      <span className="text-xs font-black text-teal-700 font-mono">
                        {roadmap.salaryInsights?.feasibility || "Medium"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                      <div className={`h-full rounded-full ${
                        roadmap.salaryInsights?.feasibility === "High" ? "bg-emerald-500 w-full" :
                        roadmap.salaryInsights?.feasibility === "Medium" ? "bg-teal-500 w-2/3" : "bg-indigo-500 w-1/3"
                      }`} />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Estimated Market Range:</span>
                    <span className="text-sm font-black text-slate-800 font-mono block">
                      {roadmap.salaryInsights?.marketRange || "₹12,00,000 - ₹25,00,000"}
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-slate-200/60 rounded-xl text-[10px] text-slate-500 leading-relaxed font-semibold">
                    💡 <span className="text-slate-700 font-extrabold">Negotiation Pro Tip:</span> Always align your salary requests with direct exam standing and project outcomes. Highlight the concrete models ticked off inside your curated Project Lab!
                  </div>
                </div>

                {/* Tactical details box */}
                <div className="lg:col-span-8 space-y-3">
                  <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Compensation Negotiation Playbook:</h4>
                  <div className="p-4 bg-teal-50/30 border border-teal-100/30 rounded-2xl text-xs text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                    {roadmap.salaryInsights?.strategyText || "Focus on establishing concrete mathematical value proof. Clear the target IAI/IFoA actuarial exam papers analyzed inside our Roadmap Suite, and show up to interview assessments with actual statistical models hosted on GitHub."}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
