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
  onStartInterviewRedirect: () => void;
  onSelectResume: (id: string) => void;
  onSelectJd: (id: string) => void;
  onDeleteResume: (id: string) => void;
  onDeleteJd: (id: string) => void;
  onViewReport: (session: InterviewSession) => void;
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
  onViewReport
}: DashboardProps) {
  
  // Custom Today's Tasks
  const [tasks, setTasks] = useState([
    { id: "t-1", text: "Complete an AI-Simulated Mock Interview", xp: 150, done: false, category: "Practice" },
    { id: "t-2", text: "Review 5 complex Quantitative Aptitude queries", xp: 50, done: false, category: "Test" },
    { id: "t-3", text: "Tailor keyword density of top resume draft for ATS scoring", xp: 80, done: false, category: "Resume" },
    { id: "t-4", text: "Study System Design microservice pattern notes", xp: 60, done: false, category: "Learning" }
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("Practice");

  // Study Hours Tracker state
  const [studyMinutesToday, setStudyMinutesToday] = useState(45);
  const [weeklyStudyLogs, setWeeklyStudyLogs] = useState<{ day: string; mins: number }[]>([
    { day: "Mon", mins: 60 },
    { day: "Tue", mins: 45 },
    { day: "Wed", mins: 90 },
    { day: "Thu", mins: 30 },
    { day: "Fri", mins: studyMinutesToday }, // live updated
    { day: "Sat", mins: 0 },
    { day: "Sun", mins: 0 }
  ]);

  // Sync state with Live updated Friday log
  useEffect(() => {
    setWeeklyStudyLogs(prev => prev.map(log => log.day === "Fri" ? { ...log, mins: studyMinutesToday } : log));
  }, [studyMinutesToday]);

  // Weekly Goals Configuration
  const [weeklyInterviewGoal, setWeeklyInterviewGoal] = useState(3);
  const [weeklyStudyGoalMins, setWeeklyStudyGoalMins] = useState(300);

  // Completed interviews counts
  const completedInterviews = interviews.filter(i => i.status === "completed" && i.reportCard);
  const totalCompleted = completedInterviews.length;

  const avgOverall = totalCompleted 
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.reportCard?.overallScore || 0), 0) / totalCompleted)
    : 72; // default high-fidelity starting metric
  
  const avgTechnical = totalCompleted
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.reportCard?.technicalScore || 0), 0) / totalCompleted)
    : 70;

  const avgCommunication = totalCompleted
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.reportCard?.communicationScore || 0), 0) / totalCompleted)
    : 75;

  const avgConfidence = totalCompleted
    ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.reportCard?.confidenceScore || 0), 0) / totalCompleted)
    : 68;

  // Study Tracker Quick add buttons
  const handleAddStudyTime = (mins: number) => {
    setStudyMinutesToday(prev => prev + mins);
    onAddXp(Math.round(mins / 2)); // 1 XP per 2 minutes studied
  };

  // Add customized tasks
  const handleAddTask = () => {
    if (newTaskText.trim()) {
      setTasks(prev => [
        ...prev,
        {
          id: `t-custom-${Date.now()}`,
          text: newTaskText.trim(),
          xp: 40,
          done: false,
          category: newTaskCategory
        }
      ]);
      setNewTaskText("");
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.done;
        if (nextState) {
          onAddXp(t.xp);
        }
        return { ...t, done: nextState };
      }
      return t;
    }));
  };

  // Skill interactive heatmap competency scores (Level 1 to 5)
  const [heatmapSkills, setHeatmapSkills] = useState<{ [skill: string]: number }>({
    "Coding & Algorithmic Sandbox": 4,
    "Quantitative & Analytical Aptitude": 3,
    "Written & Business Essay Writing": 3,
    "Behavioral & Core Competencies": 4,
    "Case Study & Consulting Analytics": 2,
    "System Design & Cloud Architecture": 3,
    "Finance, Insurance & Risk Valuations": 2
  });

  const [selectedSkillTip, setSelectedSkillTip] = useState<string | null>(null);

  const getSkillTip = (skill: string, level: number) => {
    switch (skill) {
      case "Coding & Algorithmic Sandbox":
        return `Current Level ${level}: Strong command. Focus on memory complexity and edge-case code optimization.`;
      case "Quantitative & Analytical Aptitude":
        return `Current Level ${level}: Solid foundations. Recommended practice: Speed logical reasoning drills.`;
      case "Written & Business Essay Writing":
        return `Current Level ${level}: Proficient. Enhance with executive structural frameworks in mock written assessments.`;
      case "Behavioral & Core Competencies":
        return `Current Level ${level}: Expert-oriented. Focus on fine-tuning behavioral answers using STAR methodology formats.`;
      case "Case Study & Consulting Analytics":
        return `Current Level ${level}: Foundational. Build frameworks around strategic operations, financial cost structures, and profitability tree cases.`;
      case "System Design & Cloud Architecture":
        return `Current Level ${level}: Capable. Study horizontal scaling, database shard partitioning, and cached message queues.`;
      case "Finance, Insurance & Risk Valuations":
        return `Current Level ${level}: Novice target. Dedicate study hours to risk management valuations, actuarial models, and interest calculations.`;
      default:
        return "";
    }
  };

  // AI Mentor & Suggestions states
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<MentorSuggestion[]>([
    {
      category: "strategy",
      title: "Structure case strategy for McKinsey frameworks",
      description: "Since consulting is a target company, practice drawing structural profitability logic trees to isolate target metrics systematically.",
      priority: "High"
    },
    {
      category: "resume",
      title: "Integrate 'horizontal scaling' and 'distributed' keywords",
      description: "Based on your target of Senior AI Engineer at Google, tailormade keywords inside achievements will increase ATS relevance index by 18%.",
      priority: "High"
    },
    {
      category: "learning",
      title: "Dedicate Study time for Actuarial Risk assessment tables",
      description: "Prepare for MetLife's valuation processes by reading cumulative probability models and formula sheets under the learning center.",
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
    "Perform a friendly mock review focusing on leadership metrics",
    "Resolve 3 hard array manipulation challenges in coding sandbox",
    "Complete structured essay challenge on business ethics criteria",
    "Revise Flashcards regarding networking protocols inside Learning Hub"
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
        if (data.heatmap) {
          setHeatmapSkills(data.heatmap);
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

  // Fetch suggestions once on component mount or role changes
  useEffect(() => {
    fetchAiDashboardSuggestions();
  }, [userRole]);

  // Calculation parameters
  const nextLevelXp = 500;
  const currentXpInLevel = userXp % 500;
  const levelProgressPercent = Math.round((currentXpInLevel / nextLevelXp) * 100);

  // Total logged minutes this week
  const totalWeeklyMinsLogged = weeklyStudyLogs.reduce((sum, curr) => sum + curr.mins, 0);
  const studyGoalPercentage = Math.min(100, Math.round((totalWeeklyMinsLogged / weeklyStudyGoalMins) * 100));

  const completedTodayCount = tasks.filter(t => t.done).length;
  const dailyTasksPercentage = tasks.length ? Math.round((completedTodayCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6" id="career-operating-system-dashboard">
      
      {/* Dynamic Header Block with Career preferences summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm gap-4" id="dashboard-header-block">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
            <LayoutDashboard size={22} />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-display font-black text-slate-800">
                Welcome Back, Challenger
              </h2>
              <span className="text-[10px] font-mono font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100/50">
                {careerPrefs.industry || "General Professional Core"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Active Track: <strong className="text-slate-600 font-bold">{userRole || "Strategic Professional"}</strong> at {careerPrefs.targetCompanies.slice(0, 2).join(", ") || "Elite Tier Firms"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={fetchAiDashboardSuggestions}
            disabled={isAiLoading}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isAiLoading ? (
              <>
                <RefreshCw className="animate-spin text-indigo-600" size={13} /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="text-indigo-600 animate-pulse" size={13} /> Optimize suggestions
              </>
            )}
          </button>
        </div>
      </div>

      {/* THREE PILLAR METRICS & STREAKS row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="three-pillar-metrics-panel">
        
        {/* Readiness Index */}
        <div className="bg-white rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-600 p-5 shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Career Readiness Index</span>
            <Target className="text-indigo-600 shrink-0" size={18} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-display font-black text-indigo-600">{scores.careerReadiness}</span>
            <span className="text-slate-400 text-xs font-bold">/ 100</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${scores.careerReadiness}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-none">Aggregates ATS scoring, resume, & targets alignment</p>
          </div>
        </div>

        {/* Daily Progress */}
        <div className="bg-white rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-600 p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Daily Task Completion</span>
            <CheckCircle className="text-emerald-600 shrink-0" size={18} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-display font-black text-emerald-600">{dailyTasksPercentage}</span>
            <span className="text-slate-400 text-xs font-bold">%</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: `${dailyTasksPercentage}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-none">{completedTodayCount} of {tasks.length} tasks completed today</p>
          </div>
        </div>

        {/* Interview Readiness */}
        <div className="bg-white rounded-2xl border border-slate-200/80 border-t-4 border-t-blue-600 p-5 shadow-sm flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Interview Performance Matrix</span>
            <TrendingUp className="text-blue-600 shrink-0" size={18} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-display font-black text-blue-600">{scores.interviewReadiness}</span>
            <span className="text-slate-400 text-xs font-bold">/ 100</span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${scores.interviewReadiness}%` }} />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-none">Derived from technical and communication metrics</p>
          </div>
        </div>

        {/* Interactive XP & Leveling card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white flex flex-col justify-between space-y-2 shadow-md relative overflow-hidden">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1">
              <Award size={12} className="text-amber-500" /> Career Tier Accumulator
            </span>
            <span className="text-amber-400 text-xs font-extrabold">🔥 {userStreak} Day Streak</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Award className="text-amber-500 shrink-0 animate-pulse" size={24} />
            <div className="text-left space-y-0.5">
              <h4 className="text-xs font-black text-white">Practitioner Level {userLevel}</h4>
              <p className="text-[10px] text-indigo-200 font-mono font-medium">{userXp} Total XP points secured</p>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-indigo-300">
              <span className="font-semibold">Tier Level {userLevel + 1} Threshold</span>
              <span className="font-bold">{currentXpInLevel} / {nextLevelXp} XP ({levelProgressPercent}%)</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${levelProgressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* CORE BENTO GRID: Today's Tasks, Interactive Study Tracker, Skill Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="career-bento-grid-dashboard">
        
        {/* COLUMN 1: INTERACTIVE TODAY'S TASKS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 flex flex-col justify-between" id="bento-todays-tasks">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
                <ListTodo size={15} className="text-indigo-600" /> Daily Priorities Board
              </h3>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full border border-indigo-100">
                +{tasks.filter(t => !t.done).reduce((acc, curr) => acc + curr.xp, 0)} Pending XP
              </span>
            </div>

            {/* Tasks list */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-2.5 rounded-xl border transition-all text-left flex items-start gap-2.5 cursor-pointer select-none ${
                    task.done 
                      ? "bg-slate-50 border-slate-200 opacity-60 line-through text-slate-400" 
                      : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <button 
                    className={`h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition ${
                      task.done ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 bg-white hover:border-indigo-500"
                    }`}
                  >
                    {task.done && <Check size={11} strokeWidth={3} />}
                  </button>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-[11px] font-semibold text-slate-700 leading-snug truncate">{task.text}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] bg-slate-100 text-slate-500 font-extrabold uppercase px-1 py-0.2 rounded font-mono">
                        {task.category}
                      </span>
                      <span className="text-[9px] text-amber-600 font-bold font-mono">+{task.xp} XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick task adder */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex gap-1.5">
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 focus:outline-none"
              >
                <option value="Practice">Practice</option>
                <option value="Resume">Resume</option>
                <option value="Test">Test</option>
                <option value="Learning">Learning</option>
              </select>
              <input
                type="text"
                placeholder="Log a custom operational milestone..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddTask(); }}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white"
              />
              <button
                onClick={handleAddTask}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: INTERACTIVE STUDY TIME TRACKER */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 flex flex-col justify-between" id="bento-study-tracker">
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
                <Clock size={15} className="text-emerald-600 animate-pulse" /> Daily Learning Chronology
              </h3>
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                Week logged: {totalWeeklyMinsLogged} mins
              </span>
            </div>

            {/* Quick Increment buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "+15 Mins", val: 15, xp: 7 },
                { label: "+30 Mins", val: 30, xp: 15 },
                { label: "+60 Mins", val: 60, xp: 30 }
              ].map(inc => (
                <button
                  key={inc.val}
                  onClick={() => handleAddStudyTime(inc.val)}
                  className="py-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl text-[10px] font-bold transition flex flex-col items-center justify-center cursor-pointer"
                >
                  <span>{inc.label}</span>
                  <span className="text-[8px] text-emerald-500 font-mono">+{inc.xp} XP</span>
                </button>
              ))}
            </div>

            {/* Visual calendar tracker hours grid */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px]">
                <span className="font-bold text-slate-500">Weekly Goal Progression</span>
                <span className="font-bold text-slate-700 font-mono">{totalWeeklyMinsLogged}m / {weeklyStudyGoalMins}m ({studyGoalPercentage}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: `${studyGoalPercentage}%` }} />
              </div>
            </div>

            {/* Weekly Days Bar Graph representation */}
            <div className="flex justify-between items-end h-16 pt-2">
              {weeklyStudyLogs.map(log => {
                const heightPercent = Math.min(100, log.mins ? Math.round((log.mins / 120) * 100) : 4);
                return (
                  <div key={log.day} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-4 bg-slate-100 rounded-sm h-12 flex items-end relative group">
                      <div 
                        className={`w-full rounded-sm transition-all duration-500 ${
                          log.day === "Fri" ? "bg-emerald-500 shadow-sm" : "bg-indigo-300/60"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      {/* Tooltip */}
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 p-1 bg-slate-900 text-white rounded text-[8px] opacity-0 group-hover:opacity-100 transition duration-150 whitespace-nowrap font-mono z-10 pointer-events-none">
                        {log.mins} mins
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">{log.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-normal text-left pt-2 border-t border-slate-100 italic">
            Logging study minutes increments your Level progression metrics automatically and updates active skill heatmaps.
          </p>
        </div>

        {/* COLUMN 3: SKILL COMPETENCY HEATMAP */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 flex flex-col justify-between" id="bento-skill-heatmap">
          <div className="space-y-3.5 text-left">
            <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
              <Activity size={15} className="text-brand-500" /> Operational Skill Heatmap
            </h3>

            {/* Heatmap Grid blocks */}
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {Object.entries(heatmapSkills).map(([skill, levelVal]) => {
                const level = levelVal as number;
                let colorClass = "bg-slate-50 text-slate-600 border-slate-200";
                if (level === 2) colorClass = "bg-amber-50 text-amber-800 border-amber-200/60";
                if (level === 3) colorClass = "bg-sky-50 text-sky-800 border-sky-200/60";
                if (level === 4) colorClass = "bg-indigo-50 text-indigo-800 border-indigo-200/60";
                if (level === 5) colorClass = "bg-emerald-50 text-emerald-800 border-emerald-200/60";

                return (
                  <div
                    key={skill}
                    onClick={() => setSelectedSkillTip(getSkillTip(skill, level))}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition active:scale-95 flex flex-col justify-between h-16 ${colorClass}`}
                  >
                    <span className="text-[9px] font-bold line-clamp-2 leading-tight">{skill}</span>
                    <div className="flex justify-between items-center pt-0.5">
                      <span className="text-[8px] font-mono font-bold tracking-wider uppercase">Competency</span>
                      <span className="text-[10px] font-mono font-black">L{level}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Skill Tip view block */}
            {selectedSkillTip ? (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 font-medium leading-relaxed flex items-start gap-1.5">
                <Compass size={12} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>{selectedSkillTip}</span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">Select any skill block to inspect real-time tutoring feedback.</p>
            )}
          </div>
        </div>
      </div>

      {/* THREE INTERACTIVE BLOCKS: AI suggestions, Upcoming practices, Confidence Trend chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="dashboard-secondary-row">
        
        {/* LATEST AI MENTOR SUGGESTIONS (Module 15 / Module 19 integration) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 lg:col-span-2 text-left" id="ai-mentor-dashboard-hub">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles size={15} className="text-indigo-600 animate-spin" style={{ animationDuration: '8s' }} />
                Context-Aware Strategic Recommendations
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">AI-generated targeting suggestions based on target firms.</p>
            </div>
            
            <span className="text-[10px] text-indigo-700 font-mono font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
              {isAiLoading ? "Syncing API..." : "Model: gemini-3.5-flash"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiSuggestions.map((sug, idx) => {
              const renderCategoryIcon = () => {
                if (sug.category === "resume") return <FileText size={11} className="inline mr-1 text-indigo-500 shrink-0" />;
                if (sug.category === "learning") return <BookOpen size={11} className="inline mr-1 text-emerald-500 shrink-0" />;
                if (sug.category === "networking") return <User size={11} className="inline mr-1 text-sky-500 shrink-0" />;
                if (sug.category === "strategy") return <Target size={11} className="inline mr-1 text-amber-500 shrink-0" />;
                return <Briefcase size={11} className="inline mr-1 text-slate-500 shrink-0" />;
              };

              return (
                <div 
                  key={idx} 
                  className={`p-3 bg-slate-50/70 border rounded-2xl flex flex-col justify-between space-y-2 relative transition hover:bg-slate-50 hover:shadow-sm ${
                    sug.priority === "High" ? "border-l-4 border-l-rose-500 border-slate-200" :
                    sug.priority === "Medium" ? "border-l-4 border-l-amber-500 border-slate-200" :
                    "border-l-4 border-l-blue-500 border-slate-200"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono font-bold text-slate-600 uppercase flex items-center">
                        {renderCategoryIcon()} {sug.category}
                      </span>
                      <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        sug.priority === "High" ? "bg-rose-50 text-rose-700" :
                        sug.priority === "Medium" ? "bg-amber-50 text-amber-700" :
                        "bg-blue-50 text-blue-700"
                      }`}>
                        {sug.priority}
                      </span>
                    </div>
                    <h4 className="text-[11px] font-black text-slate-800 line-clamp-1 leading-snug">{sug.title}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">{sug.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-1.5">
            <h4 className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide flex items-center gap-1">
              <Compass size={11} /> Interactive Next Actions:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-600 font-semibold pl-2">
              {customRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-600 shrink-0">❖</span>
                  <span className="line-clamp-1">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STUDY COCH / SCHEDULE PRACTICES */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 text-left" id="upcoming-practices-schedule">
          <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
            <Calendar size={15} className="text-slate-600" /> Operational Agenda
          </h3>

          <div className="space-y-3">
            {[
              { title: "Quantitative Sectional Test", subtitle: "20 Questions • Time bounded", type: "Test", time: "Pending Launch" },
              { title: "HR Adaptive Conversation Simulation", subtitle: "Stress interview personality setup", type: "Interview", time: "Recommended" },
              { title: "Review 'Google' Saved Resume ATS Match", subtitle: "Requires Keyword optimizing review", type: "Resume", time: "Ready" }
            ].map((sch, i) => (
              <div key={i} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-2">
                <div className="text-left min-w-0">
                  <span className="text-[8px] bg-slate-200/80 text-slate-600 px-1.5 py-0.2 rounded font-extrabold uppercase font-mono mb-0.5 inline-block">
                    {sch.type}
                  </span>
                  <h4 className="text-[11px] font-black text-slate-700 truncate leading-snug">{sch.title}</h4>
                  <p className="text-[9px] text-slate-400 font-medium truncate">{sch.subtitle}</p>
                </div>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded border border-indigo-100 shrink-0 text-right">
                  {sch.time}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onStartInterviewRedirect}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Play size={12} fill="currentColor" /> Launch Active Simulator Setup
          </button>
        </div>
      </div>

      {/* TREND CHRONICLES & DOCUMENT REPOSITORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="dashboard-trend-repositories">
        
        {/* SV LINE CHART: CONFIDENCE TREND */}
        <div className="bg-white lg:col-span-2 rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between text-left" id="dashboard-confidence-graph">
          <div>
            <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
              <TrendingUp size={15} className="text-indigo-600" /> Historical Confidence Chronology
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold">Track estimated confidence indicators derived across successive simulated sessions</p>
          </div>

          <div className="my-6 h-40 w-full flex items-center justify-center relative">
            <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f8fafc" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f8fafc" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f8fafc" strokeWidth="1" />

              {/* Path */}
              <path
                d={scores.confidenceTrend.map((val, idx) => {
                  const x = (idx / 4) * 440 + 30;
                  const y = 135 - (val / 100) * 110;
                  return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                }).join(" ")}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Area Fill */}
              <path
                d={`${scores.confidenceTrend.map((val, idx) => {
                  const x = (idx / 4) * 440 + 30;
                  const y = 135 - (val / 100) * 110;
                  return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                }).join(" ")} L 470 135 L 30 135 Z`}
                fill="url(#indigoGrad)"
                opacity="0.08"
              />

              {/* Nodes */}
              {scores.confidenceTrend.map((val, idx) => {
                const x = (idx / 4) * 440 + 30;
                const y = 135 - (val / 100) * 110;
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="5.5"
                      fill="#6366f1"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    {/* Hover tooltip label */}
                    <rect
                      x={x - 20}
                      y={y - 25}
                      width="40"
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      className="opacity-0 group-hover:opacity-100 transition duration-150"
                    />
                    <text
                      x={x}
                      y={y - 13}
                      fill="#ffffff"
                      fontSize="9"
                      textAnchor="middle"
                      className="opacity-0 group-hover:opacity-100 transition duration-150 font-mono font-bold"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 px-4 font-semibold uppercase">
            <span>Attempt T-4</span>
            <span>Attempt T-3</span>
            <span>Attempt T-2</span>
            <span>Attempt T-1</span>
            <span>Latest Mock</span>
          </div>
        </div>

        {/* RESUME / JD QUICK LIBRARY COMPACT LISTS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 text-left" id="dashboard-repos-view">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
              <FileText size={15} className="text-brand-500" /> Active Repositories
            </h3>
            <button onClick={onUploadRedirect} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
              View All
            </button>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {resumes.map(res => (
              <div 
                key={res.id} 
                onClick={() => onSelectResume(res.id)}
                className="group flex justify-between items-center p-2.5 bg-slate-50/80 hover:bg-brand-50/50 rounded-xl border border-slate-200/40 cursor-pointer transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 bg-brand-50 text-brand-600 rounded-lg">
                    <FileText size={13} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-slate-700 truncate">{res.name}</h4>
                    <p className="text-[9px] text-slate-400 font-mono">ATS compatibility: {res.parsedData?.atsScore || "85"}/100</p>
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
                className="group flex justify-between items-center p-2.5 bg-slate-50/80 hover:bg-emerald-50/50 rounded-xl border border-slate-200/40 cursor-pointer transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Briefcase size={13} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-slate-700 truncate">{jd.name}</h4>
                    <p className="text-[9px] text-slate-400">{jd.parsedData?.company || "Target Role Match"}</p>
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
              <div className="py-8 text-center text-slate-400 italic text-xs">No active documents or target JDs.</div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED INTERVIEW LOG SESSION ENTRIES (Scrollable table lists) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm text-left" id="historical-sessions-log">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
              <Activity size={15} className="text-slate-700" /> Executive Interview Session Log
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Chronological record of mock interactive conversations with real score cards.</p>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
            {interviews.length} Total Runs
          </span>
        </div>

        {interviews.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs mt-3">
            No mock interviews recorded yet. Take your first simulated practice mock to trace evaluation summaries.
          </div>
        ) : (
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs border-collapse">
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
                    <td className="py-3.5 pl-2 font-bold text-slate-700 flex items-center gap-2">
                      <span className="p-1 bg-slate-100 text-slate-600 rounded-md">
                        <Play size={11} fill="currentColor" />
                      </span>
                      {session.mode}
                    </td>
                    <td className="py-3.5 text-slate-600 font-semibold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        session.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        session.difficulty === "Medium" ? "bg-blue-50 text-blue-700 border-blue-100" :
                        session.difficulty === "Hard" ? "bg-amber-50 text-amber-700 border-amber-100" :
                        "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {session.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500 font-semibold">{session.personality}</td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        session.status === "completed" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-amber-50 text-amber-800 border border-amber-100"
                      }`}>
                        {session.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </td>
                    <td className="py-3.5 text-center font-mono font-black text-slate-800 text-sm">
                      {session.reportCard?.overallScore !== undefined ? (
                        <div className="inline-flex items-center gap-1">
                          <Star size={11} className="text-amber-400" fill="currentColor" />
                          {session.reportCard.overallScore}
                        </div>
                      ) : "-"}
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      {session.status === "completed" ? (
                        <button
                          onClick={() => onViewReport(session)}
                          className="px-2.5 py-1.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-xl font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          Feedback <ChevronRight size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={onStartInterviewRedirect}
                          className="px-2.5 py-1.5 text-amber-600 hover:bg-amber-50 border border-amber-100 rounded-xl font-bold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          Resume <ChevronRight size={12} />
                        </button>
                      )}
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
