/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Briefcase, FileText, Settings, Play, Award, HelpCircle, User, LogOut, 
  Sparkles, Bell, Check, BookOpen, Layers, LogIn, Mail, ShieldAlert, ChevronRight,
  Lock, RefreshCw, ChevronLeft, Sliders, ArrowLeft, ArrowRight,
  LayoutDashboard, Compass, Terminal, Trello, Menu, X, MessageSquare, Radio, Users, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { 
  Resume, JobDescription, InterviewSession, InterviewQuestion, 
  AnswerRecord, ReportCard, StudyPlan, InterviewMode, DifficultyLevel, 
  InterviewerPersonality, NotificationItem, CareerPreferences, UserSettings, SavedCompany, SavedJobRole
} from "./types";

import Dashboard from "./components/Dashboard";
import DocumentUpload from "./components/DocumentUpload";
import InterviewSetup from "./components/InterviewSetup";
import InterviewSessionComponent from "./components/InterviewSession";
import ReportViewer from "./components/ReportViewer";
import AssessmentCenter from "./components/AssessmentCenter";
import QuestionBankHub from "./components/QuestionBankHub";
import AIMentorHub from "./components/AIMentorHub";
import UserProfileSettings from "./components/UserProfileSettings";
import CodingSandbox from "./components/CodingSandbox";
import ApplicationTracker from "./components/ApplicationTracker";
import CareerRoadmap from "./components/CareerRoadmap";
import { RecruiterDashboard } from "./components/RecruiterDashboard";
import CVBuilder from "./components/CVBuilder";
import { 
  DEFAULT_QUESTIONS, DEFAULT_APTITUDE_QUESTIONS, DEFAULT_CODING_PROBLEMS, DEFAULT_INTERVIEWERS,
  QuestionItem, AptitudeQuestion, CodingProblem, InterviewerProfile
} from "./lib/defaultData";

export default function App() {
  // Navigation Router: "dashboard" | "upload" | "setup" | "interview" | "report" | "profile"
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Feature Toggles state
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("platform_enabled_features");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      dashboard: true,
      upload: true,
      mentor: true,
      assessment: true,
      questionbank: true,
      coding: false,
      setup: true,
      roadmap: true,
      tracker: true,
    };
  });

  useEffect(() => {
    localStorage.setItem("platform_enabled_features", JSON.stringify(enabledFeatures));
  }, [enabledFeatures]);

  // Dynamic navigation tracking stack for proper back navigation
  const [navHistory, setNavHistory] = useState<string[]>(["dashboard"]);
  // Animation slide direction: 1 for forward, -1 for backward
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Helper order to compare positions for animations
  const getTabOrderIndex = (tab: string) => {
    const order = ["dashboard", "upload", "roadmap", "setup", "assessment", "questionbank", "mentor", "coding", "tracker", "recruit", "interview", "report"];
    return order.indexOf(tab);
  };

  const changeTab = (tab: string, bypassHistory = false) => {
    const currentIndex = getTabOrderIndex(activeTab);
    const targetIndex = getTabOrderIndex(tab);
    
    if (targetIndex > currentIndex) {
      setSlideDirection(1);
    } else if (targetIndex < currentIndex) {
      setSlideDirection(-1);
    }

    setActiveTab(tab);

    if (!bypassHistory) {
      setNavHistory(prev => {
        if (prev[prev.length - 1] === tab) return prev;
        return [...prev, tab];
      });
    }
  };

  const handleGoBack = () => {
    if (navHistory.length > 1) {
      const updated = [...navHistory];
      updated.pop(); // pop current tab
      const prevTab = updated[updated.length - 1];
      
      const currentIndex = getTabOrderIndex(activeTab);
      const targetIndex = getTabOrderIndex(prevTab);
      
      if (targetIndex > currentIndex) {
        setSlideDirection(1);
      } else {
        setSlideDirection(-1);
      }

      setNavHistory(updated);
      setActiveTab(prevTab);
    } else {
      setSlideDirection(-1);
      setActiveTab("dashboard");
    }
  };

  const [userPortalMode, setUserPortalMode] = useState<"candidate" | "admin">("candidate");
  const [loginPersona, setLoginPersona] = useState<"candidate" | "admin">("candidate");

  const changePortalMode = (mode: "candidate" | "admin") => {
    setUserPortalMode(mode);
    localStorage.setItem("platform_portal_mode", mode);
    if (mode === "admin") {
      setActiveTab("recruit");
      setNavHistory(["recruit"]);
    } else {
      setActiveTab("dashboard");
      setNavHistory(["dashboard"]);
    }
  };

  // Local storage state keys
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jds, setJds] = useState<JobDescription[]>([]);
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Gamification states
  const [userXp, setUserXp] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [userBadges, setUserBadges] = useState<string[]>(["Quick Starter"]);
  const [userStreak, setUserStreak] = useState<number>(1);

  // Selected details
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [selectedReportSession, setSelectedReportSession] = useState<InterviewSession | null>(null);

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false); // starts at login screen for robust Demo
  const [userEmail, setUserEmail] = useState("adityaagarwal113@gmail.com");
  const [userName, setUserName] = useState("Aditya Agarwal");
  const [userRole, setUserRole] = useState("Actuarial Analyst (IAI & IFoA Candidate)");

  // IAI & IFoA specific state variables (No of exams, paper names, and other details)
  const [examsCleared, setExamsCleared] = useState<number>(() => {
    const saved = localStorage.getItem("platform_exams_cleared");
    return saved ? parseInt(saved, 10) : 3;
  });
  const [paperNames, setPaperNames] = useState<string>(() => {
    const saved = localStorage.getItem("platform_paper_names");
    return saved || "CS1, CM1, CB1";
  });
  const [actuarialBoard, setActuarialBoard] = useState<string>(() => {
    const saved = localStorage.getItem("platform_actuarial_board");
    return saved || "IAI"; // "IAI" | "IFoA" | "Both"
  });
  const [authError, setAuthError] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Save/Remember credentials & Forgot password states
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [storedPassword, setStoredPassword] = useState("password123");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Module 1 Core states
  const [careerPrefs, setCareerPrefs] = useState<CareerPreferences>({
    targetRoles: ["Actuarial Associate", "Pricing Actuary", "Valuation Actuary"],
    targetCompanies: ["Milliman", "Swiss Re", "LIC of India", "HDFC Ergo"],
    expectedSalary: "₹1,500,000 - ₹3,500,000",
    preferredLocation: "Mumbai / London / Remote",
    experienceLevel: "Entry",
    industry: "Actuarial Science & Risk Management"
  });

  const [userSettings, setUserSettings] = useState<UserSettings>({
    darkMode: false,
    soundEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    language: "English",
    dailyReminderHour: 9
  });

  // --- Dynamic Platform Datasets States ---
  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    const saved = localStorage.getItem("aicos_questions");
    return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS;
  });

  const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>(() => {
    const saved = localStorage.getItem("aicos_aptitude_questions");
    return saved ? JSON.parse(saved) : DEFAULT_APTITUDE_QUESTIONS;
  });

  const [codingProblems, setCodingProblems] = useState<CodingProblem[]>(() => {
    const saved = localStorage.getItem("aicos_coding_problems");
    return saved ? JSON.parse(saved) : DEFAULT_CODING_PROBLEMS;
  });

  const [interviewers, setInterviewers] = useState<InterviewerProfile[]>(() => {
    const saved = localStorage.getItem("aicos_interviewers");
    return saved ? JSON.parse(saved) : DEFAULT_INTERVIEWERS;
  });

  useEffect(() => {
    localStorage.setItem("aicos_questions", JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem("aicos_aptitude_questions", JSON.stringify(aptitudeQuestions));
  }, [aptitudeQuestions]);

  useEffect(() => {
    localStorage.setItem("aicos_coding_problems", JSON.stringify(codingProblems));
  }, [codingProblems]);

  useEffect(() => {
    localStorage.setItem("aicos_interviewers", JSON.stringify(interviewers));
  }, [interviewers]);

  const [savedCompanies, setSavedCompanies] = useState<SavedCompany[]>([
    { id: "sc-1", name: "Google", industry: "Technology", overview: "Search, Cloud, AI & Hardware innovations.", savedAt: new Date().toLocaleDateString() },
    { id: "sc-2", name: "McKinsey", industry: "Management Consulting", overview: "Top global advisory on framework feasibility and metrics.", savedAt: new Date().toLocaleDateString() },
    { id: "sc-3", name: "MetLife", industry: "Actuarial & Insurance", overview: "Global leader in actuarial risk model valuations.", savedAt: new Date().toLocaleDateString() }
  ]);

  const [savedJobRoles, setSavedJobRoles] = useState<SavedJobRole[]>([
    { id: "sjr-1", title: "Senior AI Engineer", company: "Google", expectedSalary: "$180,000", savedAt: new Date().toLocaleDateString() },
    { id: "sjr-2", title: "Management Consultant", company: "McKinsey", expectedSalary: "$165,000", savedAt: new Date().toLocaleDateString() }
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("");

  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/user/sync-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userEmail,
          profile: { name: userName, role: userRole },
          preferences: careerPrefs,
          settings: userSettings,
          savedCompanies,
          savedJobRoles
        })
      });
      if (response.ok) {
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        triggerNotification(
          "Cloud Sync Successful",
          "All resumes, preferences, targets, and settings are fully aligned with the central cloud workspace.",
          "achievement"
        );
      } else {
        throw new Error("Failed to sync profile");
      }
    } catch (err) {
      console.error(err);
      triggerNotification(
        "Sync Warning",
        "Could not communicate with the authentication cluster. Saved locally.",
        "reminder"
      );
    } finally {
      setIsSyncing(false);
    }
  };
  
  // UI Panels
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<"account" | "career" | "entities" | "settings" | "badges">("account");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load from local storage on startup
  useEffect(() => {
    try {
      // 1. Initialize or load stored password
      const localPassword = localStorage.getItem("platform_user_password");
      if (localPassword) {
        setStoredPassword(localPassword);
      } else {
        localStorage.setItem("platform_user_password", "password123");
        setStoredPassword("password123");
      }

      // 2. Check Remember Me settings and auto-fill login details
      const isRememberEnabled = localStorage.getItem("remember_me") === "true";
      setRememberMe(isRememberEnabled);
      if (isRememberEnabled) {
        const savedEmail = localStorage.getItem("saved_email") || "adityaagarwal113@gmail.com";
        const savedPass = localStorage.getItem("saved_password") || "password123";
        setLoginEmail(savedEmail);
        setLoginPassword(savedPass);
      }

      // 3. Auto Login if a session was previously marked active
      const isSessionActive = localStorage.getItem("platform_session_active") === "true";
      if (isSessionActive) {
        const currentUserEmail = localStorage.getItem("current_user_email") || "adityaagarwal113@gmail.com";
        const currentUserName = localStorage.getItem("current_user_name") || "Aditya Agarwal";
        const currentUserRole = localStorage.getItem("current_user_role") || "Senior AI Engineer";
        const storedMode = localStorage.getItem("platform_portal_mode") as "candidate" | "admin";
        setUserEmail(currentUserEmail);
        setUserName(currentUserName);
        setUserRole(currentUserRole);
        setIsLoggedIn(true);
        if (storedMode === "admin") {
          setUserPortalMode("admin");
          setActiveTab("recruit");
        } else {
          setUserPortalMode("candidate");
          setActiveTab("dashboard");
        }
      } else {
        setIsLoggedIn(false);
      }

      const storedResumes = localStorage.getItem("platform_resumes");
      if (storedResumes) setResumes(JSON.parse(storedResumes));

      const storedJds = localStorage.getItem("platform_jds");
      if (storedJds) setJds(JSON.parse(storedJds));

      const storedInterviews = localStorage.getItem("platform_interviews");
      if (storedInterviews) setInterviews(JSON.parse(storedInterviews));

      const storedNotifications = localStorage.getItem("platform_notifications");
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        // seed initial achievements/notifications
        const initialNotifications: NotificationItem[] = [
          {
            id: "notif-1",
            title: "Welcome Champion!",
            message: "Welcome to the AI Interview Preparation Studio. Get started by uploading your resume.",
            type: "achievement",
            timestamp: new Date().toLocaleDateString(),
            read: false
          }
        ];
        setNotifications(initialNotifications);
        localStorage.setItem("platform_notifications", JSON.stringify(initialNotifications));
      }

      // Load gamification progress on startup
      const storedXp = localStorage.getItem("platform_xp");
      if (storedXp) setUserXp(parseInt(storedXp));
      const storedLevel = localStorage.getItem("platform_level");
      if (storedLevel) setUserLevel(parseInt(storedLevel));
      
      const storedBadges = localStorage.getItem("platform_badges");
      let activeBadges = ["Quick Starter"];
      if (storedBadges) {
        try {
          activeBadges = JSON.parse(storedBadges);
          setUserBadges(activeBadges);
        } catch (err) {
          setUserBadges(activeBadges);
        }
      } else {
        localStorage.setItem("platform_badges", JSON.stringify(activeBadges));
        setUserBadges(activeBadges);
      }

      // Sync completion dates
      try {
        const storedDates = localStorage.getItem("platform_badges_dates");
        const dates = storedDates ? JSON.parse(storedDates) : {};
        let datesUpdated = false;
        activeBadges.forEach(b => {
          if (!dates[b]) {
            dates[b] = new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            });
            datesUpdated = true;
          }
        });
        if (datesUpdated || !storedDates) {
          localStorage.setItem("platform_badges_dates", JSON.stringify(dates));
        }
      } catch (err) {
        console.error("Error syncing badge dates", err);
      }

      const storedStreak = localStorage.getItem("platform_streak");
      if (storedStreak) setUserStreak(parseInt(storedStreak));

      // Check current active session if left incomplete
      const activeSes = localStorage.getItem("platform_active_session");
      if (activeSes) {
        const parsed = JSON.parse(activeSes);
        if (parsed.status === "active") {
          setCurrentSession(parsed);
          // Load but do not automatically navigate to ensure dashboard is default on load
        }
      }
    } catch (e) {
      console.error("Local storage sync error:", e);
    }
  }, []);

  // Save states to local storage on change
  const saveXp = (xp: number) => {
    setUserXp(xp);
    localStorage.setItem("platform_xp", xp.toString());
    const newLvl = Math.floor(xp / 500) + 1;
    if (newLvl > userLevel) {
      setUserLevel(newLvl);
      localStorage.setItem("platform_level", newLvl.toString());
      triggerNotification("Level Up! 🎉", `Congratulations! You reached Level ${newLvl} as an Interview Professional!`, "achievement");
    }
  };

  const saveBadges = (badges: string[]) => {
    setUserBadges(badges);
    localStorage.setItem("platform_badges", JSON.stringify(badges));
    try {
      const storedDates = localStorage.getItem("platform_badges_dates");
      const dates = storedDates ? JSON.parse(storedDates) : {};
      let updated = false;
      badges.forEach(badge => {
        if (!dates[badge]) {
          dates[badge] = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          });
          updated = true;
        }
      });
      if (updated || !storedDates) {
        localStorage.setItem("platform_badges_dates", JSON.stringify(dates));
      }
    } catch (e) {
      console.error("Error saving badge dates", e);
    }
  };

  const saveStreak = (streak: number) => {
    setUserStreak(streak);
    localStorage.setItem("platform_streak", streak.toString());
  };

  const saveResumes = (updated: Resume[]) => {
    setResumes(updated);
    localStorage.setItem("platform_resumes", JSON.stringify(updated));
  };

  const saveJds = (updated: JobDescription[]) => {
    setJds(updated);
    localStorage.setItem("platform_jds", JSON.stringify(updated));
  };

  const saveInterviews = (updated: InterviewSession[]) => {
    setInterviews(updated);
    localStorage.setItem("platform_interviews", JSON.stringify(updated));
  };

  const saveNotifications = (updated: NotificationItem[]) => {
    setNotifications(updated);
    localStorage.setItem("platform_notifications", JSON.stringify(updated));
  };

  // --- ACTIONS ---

  // 1. Resume Parser Agent call
  const handleAddResume = async (name: string, text: string) => {
    const response = await fetch("/api/parse-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, filename: name })
    });

    if (!response.ok) {
      let errMsg = "Failed to analyze resume.";
      try {
        const errText = await response.text();
        try {
          const errData = JSON.parse(errText);
          errMsg = errData.error || errMsg;
        } catch (e) {
          errMsg = errText || errMsg;
        }
      } catch (e) {}
      throw new Error(errMsg);
    }

    let parsedData;
    try {
      const resText = await response.text();
      parsedData = JSON.parse(resText);
    } catch (e) {
      throw new Error("Unable to parse resume details. Please try again.");
    }
    const newResume: Resume = {
      id: "res-" + Date.now(),
      name,
      text,
      createdAt: new Date().toLocaleDateString(),
      parsedData
    };

    const updated = [newResume, ...resumes];
    saveResumes(updated);

    // Trigger Notification
    triggerNotification("Resume Parsed!", `Successfully extracted technical and soft skills from ${name}.`, "report");
  };

  // 2. JD Parser Agent call
  const handleAddJd = async (name: string, text: string) => {
    const response = await fetch("/api/parse-jd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      let errMsg = "Failed to analyze job description.";
      try {
        const errText = await response.text();
        try {
          const errData = JSON.parse(errText);
          errMsg = errData.error || errMsg;
        } catch (e) {
          errMsg = errText || errMsg;
        }
      } catch (e) {}
      throw new Error(errMsg);
    }

    let parsedData;
    try {
      const resText = await response.text();
      parsedData = JSON.parse(resText);
    } catch (e) {
      throw new Error("Unable to parse job description details. Please try again.");
    }
    const newJd: JobDescription = {
      id: "jd-" + Date.now(),
      name,
      text,
      createdAt: new Date().toLocaleDateString(),
      parsedData
    };

    const updated = [newJd, ...jds];
    saveJds(updated);

    triggerNotification("Job Parsed!", `Successfully compiled structured requirements list for ${name}.`, "report");
  };

  // Delete Resume
  const handleDeleteResume = (id: string) => {
    const filtered = resumes.filter(r => r.id !== id);
    saveResumes(filtered);
  };

  // Delete JD
  const handleDeleteJd = (id: string) => {
    const filtered = jds.filter(j => j.id !== id);
    saveJds(filtered);
  };

  // Delete Interview Session
  const handleDeleteInterview = (id: string) => {
    const filtered = interviews.filter(s => s.id !== id);
    saveInterviews(filtered);
    if (currentSession && currentSession.id === id) {
      setCurrentSession(null);
      localStorage.removeItem("platform_active_session");
      if (activeTab === "interview") {
        setActiveTab("dashboard");
      }
    }
    triggerNotification("Session Deleted", "The interview session has been deleted.", "reminder");
  };

  // 3. Questions Generator Agent: Starting Interview
  const handleStartInterview = async (config: {
    mode: InterviewMode;
    difficulty: DifficultyLevel;
    personality: InterviewerPersonality;
    resumeId?: string;
    jdId?: string;
    company?: string;
    actuarialFocus?: string;
    webcamEnabled?: boolean;
  }) => {
    // Select the bound documents context
    const boundResume = resumes.find(r => r.id === config.resumeId)?.parsedData;
    const boundJd = jds.find(j => j.id === config.jdId)?.parsedData;

    const response = await fetch("/api/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: boundResume,
        jd: boundJd,
        mode: config.mode,
        difficulty: config.difficulty,
        personality: config.personality,
        company: config.company,
        actuarialFocus: config.actuarialFocus
      })
    });

    if (!response.ok) {
      let errMsg = "Failed to generate interview space.";
      try {
        const errText = await response.text();
        try {
          const errData = JSON.parse(errText);
          errMsg = errData.error || errMsg;
        } catch (e) {
          errMsg = errText || errMsg;
        }
      } catch (e) {}
      throw new Error(errMsg);
    }

    let data;
    try {
      const resText = await response.text();
      data = JSON.parse(resText);
    } catch (e) {
      throw new Error("Unable to parse generated interview questions. Please try again.");
    }
    const generatedQuestions: InterviewQuestion[] = data.questions || [];

    if (generatedQuestions.length === 0) {
      throw new Error("No adaptive questions generated by AI Agent.");
    }

    const newSession: InterviewSession = {
      id: "session-" + Date.now(),
      resumeId: config.resumeId,
      jdId: config.jdId,
      mode: config.mode,
      difficulty: config.difficulty,
      personality: config.personality,
      questions: generatedQuestions,
      currentQuestionIndex: 0,
      transcript: [],
      status: "active",
      company: config.company,
      actuarialFocus: config.actuarialFocus,
      webcamEnabled: config.webcamEnabled
    };

    setCurrentSession(newSession);
    localStorage.setItem("platform_active_session", JSON.stringify(newSession));
    
    // add to list
    const updated = [newSession, ...interviews];
    saveInterviews(updated);

    changeTab("interview");
    triggerNotification("Interview Started", `Best of luck with your ${config.mode} simulation!`, "reminder");
  };

  // 4. Answer Evaluator Agent call
  const handleSubmitAnswer = async (answer: string, codeLanguage?: string, codeOutput?: string, actuarialPersonaEnabled?: boolean) => {
    if (!currentSession) return;
    const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];

    const response = await fetch("/api/evaluate-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: currentQuestion,
        answer,
        codeLanguage,
        codeOutput,
        isActuarialPersona: actuarialPersonaEnabled
      })
    });

    if (!response.ok) {
      let errMsg = "Failed to submit evaluation review.";
      try {
        const errText = await response.text();
        try {
          const errData = JSON.parse(errText);
          errMsg = errData.error || errMsg;
        } catch (e) {
          errMsg = errText || errMsg;
        }
      } catch (e) {}
      throw new Error(errMsg);
    }

    let evaluationResult;
    try {
      const resText = await response.text();
      evaluationResult = JSON.parse(resText);
    } catch (e) {
      throw new Error("Unable to parse evaluation review feedback. Please try again.");
    }

    const record: AnswerRecord = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      userAnswer: answer,
      codeOutput,
      evaluation: evaluationResult,
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedTranscript = [...currentSession.transcript, record];
    const isLast = currentSession.currentQuestionIndex + 1 >= currentSession.questions.length;

    const updatedSession: InterviewSession = {
      ...currentSession,
      currentQuestionIndex: currentSession.currentQuestionIndex + 1,
      transcript: updatedTranscript,
      // If it's last, wait for the user to trigger report generation
    };

    setCurrentSession(updatedSession);
    localStorage.setItem("platform_active_session", JSON.stringify(updatedSession));

    // update master list
    const updatedInterviews = interviews.map(s => s.id === currentSession.id ? updatedSession : s);
    saveInterviews(updatedInterviews);
  };

  // 5. Final Report Card & Study Planner Generator Agent
  const handleCompleteSession = async () => {
    if (!currentSession) return;

    // fetch linked resumes
    const boundResume = resumes.find(r => r.id === currentSession.resumeId)?.parsedData;
    const boundJd = jds.find(j => j.id === currentSession.jdId)?.parsedData;

    const response = await fetch("/api/generate-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume: boundResume,
        jd: boundJd,
        transcript: currentSession.transcript,
        mode: currentSession.mode,
        difficulty: currentSession.difficulty,
        company: currentSession.company,
        actuarialFocus: currentSession.actuarialFocus
      })
    });

    if (!response.ok) {
      let errMsg = "Failed to generate performance scorecard.";
      try {
        const errText = await response.text();
        try {
          const errData = JSON.parse(errText);
          errMsg = errData.error || errMsg;
        } catch (e) {
          errMsg = errText || errMsg;
        }
      } catch (e) {}
      throw new Error(errMsg);
    }

    let data;
    try {
      const resText = await response.text();
      data = JSON.parse(resText);
    } catch (e) {
      throw new Error("Unable to parse performance scorecard and study plan. Please try again.");
    }
    const finalReportCard: ReportCard = data.reportCard;
    const finalStudyPlan: StudyPlan = data.studyPlan;

    // Attach study plan to report card
    finalReportCard.studyPlan = finalStudyPlan;

    // Calculate XP reward points
    const xpReward = 150 + Math.round((finalReportCard.overallScore || 0) * 1.5);
    const updatedXp = userXp + xpReward;
    saveXp(updatedXp);

    // Dynamic Badge Unlocking
    const newBadges = [...userBadges];
    if (finalReportCard.overallScore >= 90 && !newBadges.includes("Elite Performer")) {
      newBadges.push("Elite Performer");
      triggerNotification("New Badge Unlocked! 🏆", "Unlocked 'Elite Performer' for scoring >= 90%!", "achievement");
    }
    if ((currentSession.mode === InterviewMode.TechnicalActuarial || currentSession.mode === InterviewMode.OtherActuarial) && !newBadges.includes("Risk Specialist")) {
      newBadges.push("Risk Specialist");
      triggerNotification("New Badge Unlocked! 📈", "Unlocked 'Risk Specialist' for completing an actuarial session!", "achievement");
    }
    if (currentSession.company && !newBadges.includes("Corporate Ready")) {
      newBadges.push("Corporate Ready");
      triggerNotification("New Badge Unlocked! 🎯", `Unlocked 'Corporate Ready' for testing at ${currentSession.company}!`, "achievement");
    }
    if (userStreak >= 3 && !newBadges.includes("Dedicated Streak")) {
      newBadges.push("Dedicated Streak");
      triggerNotification("New Badge Unlocked! 🔥", "Unlocked 'Dedicated Streak' for continuous discipline!", "achievement");
    }
    saveBadges(newBadges);

    const completedSession: InterviewSession = {
      ...currentSession,
      status: "completed",
      reportCard: finalReportCard,
      xpEarned: xpReward
    };

    // Clean active session cache
    setCurrentSession(null);
    localStorage.removeItem("platform_active_session");

    // Save back to master array
    const updatedInterviews = interviews.map(s => s.id === currentSession.id ? completedSession : s);
    saveInterviews(updatedInterviews);

    setSelectedReportSession(completedSession);
    changeTab("report");

    triggerNotification(
      "Report Generated! 🌟", 
      `Mock complete! Overall Score: ${finalReportCard.overallScore}. Check out your personalized study planner!`, 
      "achievement"
    );
  };

  const triggerNotification = (title: string, message: string, type: "reminder" | "achievement" | "report") => {
    const newItem: NotificationItem = {
      id: "notif-" + Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    saveNotifications([newItem, ...notifications]);
  };

  const handleSimulatedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.includes("@")) {
      setAuthError("Please provide a valid corporate email address.");
      return;
    }

    // Verify against the actual stored password
    if (loginPassword !== storedPassword) {
      setAuthError("Incorrect access key. Default key is 'password123'. Click 'Forgot Password?' to reset it.");
      return;
    }

    setIsLoggedIn(true);
    setUserEmail(loginEmail);
    const mockName = loginEmail.split("@")[0];
    const computedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
    setUserName(computedName);
    setAuthError("");

    const isAdmin = loginEmail === "adityaagarwal113@gmail.com" || loginEmail.toLowerCase() === "admin@example.com";
    const finalPersona = isAdmin ? loginPersona : "candidate";
    changePortalMode(finalPersona);

    localStorage.setItem("platform_session_active", "true");
    localStorage.setItem("current_user_email", loginEmail);
    localStorage.setItem("current_user_name", computedName);
    localStorage.setItem("current_user_role", userRole || "Senior AI Engineer");

    // Persist credentials on 'Remember Me'
    if (rememberMe) {
      localStorage.setItem("remember_me", "true");
      localStorage.setItem("saved_email", loginEmail);
      localStorage.setItem("saved_password", loginPassword);
    } else {
      localStorage.removeItem("remember_me");
      localStorage.removeItem("saved_email");
      localStorage.removeItem("saved_password");
    }

    triggerNotification("Logged In", `Welcome back to your workspace, ${computedName}!`, "reminder");
  };

  const handleForgotPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.includes("@")) {
      setAuthError("Please provide a valid email address.");
      return;
    }
    if (forgotNewPassword.length < 4) {
      setAuthError("Password must be at least 4 characters long.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setAuthError("New Password and Confirm Password fields must match.");
      return;
    }

    // Save newly reset password
    localStorage.setItem("platform_user_password", forgotNewPassword);
    setStoredPassword(forgotNewPassword);
    setAuthError("");
    setResetSuccessMessage("Password successfully updated! You can now sign in using your new password.");

    // Update form password fields if Remember Me was set
    if (localStorage.getItem("remember_me") === "true") {
      localStorage.setItem("saved_password", forgotNewPassword);
      setLoginPassword(forgotNewPassword);
    }

    // Clear fields
    setForgotEmail("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
  };

  const handleStandardLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("platform_session_active");
    setShowProfileModal(false);
    setShowLogoutConfirm(false);
    triggerNotification("Signed Out", "You have signed out successfully.", "reminder");
  };

  const handleForgetAndLogout = () => {
    setIsLoggedIn(false);
    setLoginEmail("");
    setLoginPassword("");
    setRememberMe(false);

    localStorage.removeItem("platform_session_active");
    localStorage.removeItem("remember_me");
    localStorage.removeItem("saved_email");
    localStorage.removeItem("saved_password");

    setShowProfileModal(false);
    setShowLogoutConfirm(false);
    triggerNotification("Signed Out & Cleared", "Logged out. Saved local credentials have been permanently erased.", "reminder");
  };

  const getAvailableTabs = () => {
    const list = [
      { key: "dashboard", label: "Dashboard" },
      { key: "upload", label: "Document Center" },
      { key: "roadmap", label: "Career Roadmap" },
      { key: "setup", label: "Start Simulation" },
      { key: "assessment", label: "Aptitude Tests" },
      { key: "questionbank", label: "Question Bank" },
      { key: "mentor", label: "AI Mentor" },
      { key: "coding", label: "Coding Sandbox" },
      { key: "tracker", label: "Pipeline Tracker" },
      { key: "recruit", label: "RecruitAI Platform" }
    ];
    if (currentSession) {
      list.push({ key: "interview", label: "Active Interview" });
    }
    if (selectedReportSession) {
      list.push({ key: "report", label: "Evaluation Report" });
    }
    return list;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900">
      
      {/* 1. AUTHENTICATION PRE-SCREEN */}
      {!isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950">
          <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200/50 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Briefcase size={22} />
              </div>
              <h2 className="text-xl font-display font-black text-slate-800">ActuaryPrep</h2>
              <p className="text-[10px] text-indigo-600 font-bold tracking-wide uppercase">AI-Powered Actuarial Exam & Career Prep Platform</p>
            </div>

            {/* Error notifications */}
            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2">
                <ShieldAlert size={14} className="shrink-0 mt-0.5 text-rose-500" />
                <span>{authError}</span>
              </div>
            )}

            {/* Success notifications */}
            {resetSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-medium flex items-start gap-2">
                <Check size={14} className="shrink-0 mt-0.5 text-emerald-500" />
                <span>{resetSuccessMessage}</span>
              </div>
            )}

            {!isForgotView ? (
              /* LOGIN FORM VIEW */
              <div className="space-y-4">
                {/* Select Persona / Role */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold shadow-inner">
                  <button
                    type="button"
                    onClick={() => setLoginPersona("candidate")}
                    className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginPersona === "candidate"
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <User size={13} /> Candidate Access
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginPersona("admin")}
                    className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginPersona === "admin"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:text-indigo-600"
                    }`}
                  >
                    <Shield size={13} /> Recruiter Admin
                  </button>
                </div>

                <form onSubmit={handleSimulatedLogin} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-400" size={15} />
                      <input
                        type="email"
                        placeholder="adityaagarwal113@gmail.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-600">Access Key / Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotView(true);
                          setAuthError("");
                          setResetSuccessMessage("");
                        }}
                        className="text-[11px] text-brand-600 hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={15} />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  {/* Remember Me credentials checkbox */}
                  <div className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-500 font-medium cursor-pointer selection:bg-transparent">
                      Remember my login credentials on this browser
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5"
                  >
                    <LogIn size={14} /> Sign In to Platform
                  </button>
                </form>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Hint: Default key is <strong className="text-slate-600">password123</strong>
                  </span>
                </div>

                <hr className="border-slate-100" />

                <button
                  onClick={() => {
                    setIsLoggedIn(true);
                    setUserEmail("google.user@gmail.com");
                    setUserName("Google User");
                    setUserRole("Staff AI Specialist");
                    localStorage.setItem("platform_session_active", "true");
                    localStorage.setItem("current_user_email", "google.user@gmail.com");
                    localStorage.setItem("current_user_name", "Google User");
                    localStorage.setItem("current_user_role", "Staff AI Specialist");
                    triggerNotification("Logged In", "Successfully signed in via Google Account.", "reminder");
                  }}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold rounded-lg text-slate-600 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.7 12.3c0-.8-.1-1.7-.2-2.5H12v4.8h6.6c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.6-5.2 3.6-9.1z" />
                    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3.1c-1.1.7-2.5 1.2-4.1 1.2-3.2 0-5.8-2.1-6.8-5H1.3v3.2C3.3 21.3 7.4 24 12 24z" />
                    <path fill="#FBBC05" d="M5.2 14.2c-.2-.7-.4-1.4-.4-2.2s.2-1.5.4-2.2V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l3.9-3.2z" />
                    <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2.5 12 .5 7.4.5 3.3 3.2 1.3 7.1l3.9 3.2c1-2.9 3.6-5.5 6.8-5.5z" />
                  </svg>
                  Google Workspace OAuth Login
                </button>
              </div>
            ) : (
              /* FORGOT PASSWORD FORM VIEW */
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left space-y-1">
                  <h4 className="text-xs font-bold text-slate-700">Password Reset Assistant</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Enter your account email to establish a new access key. The mock directory updates live inside your local storage container.
                  </p>
                </div>

                <form onSubmit={handleForgotPasswordReset} className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Registered Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-400" size={15} />
                      <input
                        type="email"
                        placeholder="adityaagarwal113@gmail.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">New Password / Access Key</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={15} />
                      <input
                        type="password"
                        placeholder="Min 4 characters"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={15} />
                      <input
                        type="password"
                        placeholder="Re-type password"
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        className="w-full text-xs pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={13} /> Save & Reset Password
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotView(false);
                    setAuthError("");
                    setResetSuccessMessage("");
                  }}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2. THE MASTER SAAS APP WITH PROFESSIONAL SIDEBAR */
        <div className="flex-1 flex flex-col md:flex-row min-h-screen relative overflow-hidden bg-slate-50">
          
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden md:flex flex-col w-64 bg-slate-950 text-slate-100 border-r border-slate-800/60 h-screen sticky top-0 shrink-0 select-none z-30 justify-between">
            {/* Logo/Brand Header */}
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-5 border-b border-slate-800/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { if (userPortalMode === "admin") { changePortalMode("candidate"); } else { changeTab("dashboard"); } }}>
                  <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
                    <Briefcase size={16} />
                  </div>
                  <div className="text-left">
                    <h1 className="text-xs font-display font-black text-white tracking-tight leading-none">ActuaryPrep</h1>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Actuarial Prep Platform</span>
                  </div>
                </div>
              </div>

              {/* Portal Mode Switcher Toggle */}
              {(userEmail === "adityaagarwal113@gmail.com" || userEmail.toLowerCase() === "admin@example.com") && (
                <div className="px-5 py-3 border-b border-slate-800/40 bg-slate-900/10 shrink-0">
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                    <button
                      onClick={() => changePortalMode("candidate")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        userPortalMode === "candidate"
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/10"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <User size={12} /> User Portal
                    </button>
                    <button
                      onClick={() => changePortalMode("admin")}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        userPortalMode === "admin"
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Shield size={12} /> Admin
                    </button>
                  </div>
                </div>
              )}

              {userPortalMode === "candidate" ? (
                /* Gamified Level Progress */
                <div className="px-5 py-4 border-b border-slate-800/40 bg-slate-950/40 shrink-0">
                  <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <span>Level {userLevel} Professional</span>
                    <span className="text-brand-400 font-mono font-bold">{userXp % 500} / 500 XP</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-brand-500 h-full transition-all duration-500 rounded-full" 
                      style={{ width: `${((userXp % 500) / 500) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      🔥 {userStreak} Day Streak
                    </span>
                    <span className="text-slate-500 hover:text-slate-300 transition cursor-pointer" onClick={() => { setShowProfileModal(true); setProfileModalTab("badges"); }}>
                      Badges ({userBadges.length})
                    </span>
                  </div>
                </div>
              ) : (
                /* Admin System Monitor Status Block */
                <div className="px-5 py-4 border-b border-slate-800/40 bg-slate-950/40 shrink-0">
                  <div className="flex justify-between items-center text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                    <span>Admin System Monitor</span>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded text-[8px] font-bold">LIVE ONLINE</span>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div className="text-left text-[10px] text-slate-400 leading-none">
                      <span className="font-extrabold uppercase tracking-wide block text-[8px] text-slate-500 mb-0.5">Workspace Mode</span>
                      <strong className="font-semibold text-slate-300">Recruiter Console</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links Loop inside Sidebar */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                {/* Active Sessions */}
                {(currentSession || selectedReportSession) && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-rose-500/80 px-3 block">
                      Active Sessions
                    </span>
                    <div className="space-y-0.5">
                      {currentSession && (
                        <button
                          onClick={() => changeTab("interview")}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                            activeTab === "interview" 
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold shadow-sm" 
                              : "text-rose-400/80 hover:bg-rose-500/5 hover:text-rose-400 border-transparent"
                          }`}
                        >
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                          <Radio size={14} className="shrink-0 animate-pulse" />
                          <span className="truncate">Active Interview</span>
                        </button>
                      )}
                      {selectedReportSession && (
                        <button
                          onClick={() => changeTab("report")}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                            activeTab === "report" 
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold shadow-sm" 
                              : "text-indigo-400/80 hover:bg-indigo-500/5 hover:text-indigo-400 border-transparent"
                          }`}
                        >
                          <FileText size={14} className="shrink-0" />
                          <span className="truncate">Evaluation Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Categorized Menu Groups */}
                {(userPortalMode === "candidate" ? [
                  {
                    title: "Learn & Prepare",
                    items: [
                      { key: "dashboard", label: "Dashboard Hub", icon: LayoutDashboard },
                      { key: "cv-builder", label: "ATS CV Builder", icon: FileText },
                      { key: "upload", label: "Document Center", icon: FileText },
                      { key: "mentor", label: "AI Mentor & Tutor", icon: MessageSquare },
                    ]
                  },
                  {
                    title: "Mock Simulations",
                    items: [
                      { key: "setup", label: "Start Simulation", icon: Play },
                      { key: "assessment", label: "Aptitude Tests", icon: Award },
                      { key: "questionbank", label: "Question Bank", icon: BookOpen },
                    ]
                  },
                  {
                    title: "Career Tracking",
                    items: [
                      { key: "roadmap", label: "Career Roadmap", icon: Compass },
                      { key: "tracker", label: "Pipeline Tracker", icon: Trello },
                    ]
                  }
                ] : [
                  {
                    title: "Recruiter Console",
                    items: [
                      { key: "recruit", label: "Recruiter Dashboard", icon: Users },
                    ]
                  }
                ]).map(group => {
                  const filteredItems = group.items.filter(item => enabledFeatures[item.key] !== false);
                  if (filteredItems.length === 0) return null;
                  return (
                    <div key={group.title} className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-3 block">
                        {group.title}
                      </span>
                      <div className="space-y-0.5">
                        {filteredItems.map(item => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.key;
                          return (
                            <button
                              key={item.key}
                              onClick={() => changeTab(item.key)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                                isActive 
                                  ? "bg-brand-500/10 text-brand-400 border-brand-500/20 font-bold shadow-sm" 
                                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border-transparent"
                              }`}
                            >
                              <Icon size={14} className={`shrink-0 ${isActive ? "text-brand-400" : "text-slate-500"}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Profile Row */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between gap-2.5 shrink-0">
              <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2.5 text-left min-w-0 flex-1 hover:bg-slate-800/40 p-1.5 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-800/40"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
                  <User size={14} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-200 truncate leading-none">{userName}</h4>
                  <span className="text-[9px] text-slate-500 truncate block mt-1">{userRole}</span>
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                  className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/30 hover:bg-slate-800 rounded-xl border border-slate-800/60 transition relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={13} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  )}
                </button>
                
                <button 
                  onClick={() => setShowProfileModal(true)}
                  className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/30 hover:bg-slate-800 rounded-xl border border-slate-800/60 transition cursor-pointer"
                  title="Profile Settings"
                >
                  <Settings size={13} />
                </button>
              </div>
            </div>
          </aside>

          {/* MOBILE SLIDE-OVER MENU DRAWER */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black z-40 md:hidden"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 220 }}
                  className="fixed inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-800 z-50 md:hidden flex flex-col justify-between"
                >
                  <div className="flex flex-col h-full relative">
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/40 rounded-xl cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                    
                    <div className="p-5 border-b border-slate-800/60 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => { changeTab("dashboard"); setIsMobileMenuOpen(false); }}>
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
                          <Briefcase size={16} />
                        </div>
                        <div className="text-left">
                          <h1 className="text-xs font-display font-black text-white tracking-tight leading-none">AICOS</h1>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">AI Career OS</span>
                        </div>
                      </div>
                    </div>

                    {/* Portal Mode Switcher Toggle */}
                    <div className="px-5 py-3 border-b border-slate-800/40 bg-slate-900/10 shrink-0">
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                        <button
                          onClick={() => { changePortalMode("candidate"); setIsMobileMenuOpen(false); }}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            userPortalMode === "candidate"
                              ? "bg-brand-500 text-white shadow-md shadow-brand-500/10"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <User size={12} /> User Portal
                        </button>
                        <button
                          onClick={() => { changePortalMode("admin"); setIsMobileMenuOpen(false); }}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            userPortalMode === "admin"
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Shield size={12} /> Admin
                        </button>
                      </div>
                    </div>

                    {userPortalMode === "candidate" ? (
                      /* Gamified Level Progress */
                      <div className="px-5 py-4 border-b border-slate-800/40 bg-slate-950/40 shrink-0">
                        <div className="flex justify-between items-center text-slate-400 text-[10px] font-black uppercase tracking-wider">
                          <span>Level {userLevel} Professional</span>
                          <span className="text-brand-400 font-mono font-bold">{userXp % 500} / 500 XP</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="bg-brand-500 h-full transition-all duration-500 rounded-full" 
                            style={{ width: `${((userXp % 500) / 500) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2.5 text-[10px] text-slate-400 font-bold">
                          <span className="flex items-center gap-1">
                            🔥 {userStreak} Day Streak
                          </span>
                          <span className="text-slate-500 hover:text-slate-300 transition cursor-pointer" onClick={() => { setShowProfileModal(true); setProfileModalTab("badges"); setIsMobileMenuOpen(false); }}>
                            Badges ({userBadges.length})
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Admin System Monitor Status Block */
                      <div className="px-5 py-4 border-b border-slate-800/40 bg-slate-950/40 shrink-0">
                        <div className="flex justify-between items-center text-indigo-400 text-[10px] font-black uppercase tracking-wider">
                          <span>Admin System Monitor</span>
                          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded text-[8px] font-bold">LIVE ONLINE</span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <div className="text-left text-[10px] text-slate-400 leading-none">
                            <span className="font-extrabold uppercase tracking-wide block text-[8px] text-slate-500 mb-0.5">Workspace Mode</span>
                            <strong className="font-semibold text-slate-300">Recruiter Console</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                      {(currentSession || selectedReportSession) && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-rose-500/80 px-3 block">
                            Active Sessions
                          </span>
                          <div className="space-y-0.5">
                            {currentSession && (
                              <button
                                onClick={() => { changeTab("interview"); setIsMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                                  activeTab === "interview" 
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold shadow-sm" 
                                    : "text-rose-400/80 hover:bg-rose-500/5 hover:text-rose-400 border-transparent"
                                }`}
                              >
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                                <Radio size={14} className="shrink-0" />
                                <span className="truncate">Active Interview</span>
                              </button>
                            )}
                            {selectedReportSession && (
                              <button
                                onClick={() => { changeTab("report"); setIsMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                                  activeTab === "report" 
                                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold shadow-sm" 
                                    : "text-indigo-400/80 hover:bg-indigo-500/5 hover:text-indigo-400 border-transparent"
                                }`}
                              >
                                <FileText size={14} className="shrink-0" />
                                <span className="truncate">Evaluation Report</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {(userPortalMode === "candidate" ? [
                        {
                          title: "Learn & Prepare",
                          items: [
                            { key: "dashboard", label: "Dashboard Hub", icon: LayoutDashboard },
                            { key: "cv-builder", label: "ATS CV Builder", icon: FileText },
                            { key: "upload", label: "Document Center", icon: FileText },
                            { key: "mentor", label: "AI Mentor & Tutor", icon: MessageSquare },
                          ]
                        },
                        {
                          title: "Mock Simulations",
                          items: [
                            { key: "setup", label: "Start Simulation", icon: Play },
                            { key: "assessment", label: "Aptitude Tests", icon: Award },
                            { key: "questionbank", label: "Question Bank", icon: BookOpen },
                          ]
                        },
                        {
                          title: "Career Tracking",
                          items: [
                            { key: "roadmap", label: "Career Roadmap", icon: Compass },
                            { key: "tracker", label: "Pipeline Tracker", icon: Trello },
                          ]
                        }
                      ] : [
                        {
                          title: "Recruiter Console",
                          items: [
                            { key: "recruit", label: "Recruiter Dashboard", icon: Users },
                          ]
                        }
                      ]).map(group => {
                        const filteredItems = group.items.filter(item => enabledFeatures[item.key] !== false);
                        if (filteredItems.length === 0) return null;
                        return (
                          <div key={group.title} className="space-y-1">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 px-3 block">
                              {group.title}
                            </span>
                            <div className="space-y-0.5">
                              {filteredItems.map(item => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.key;
                                return (
                                  <button
                                    key={item.key}
                                    onClick={() => { changeTab(item.key); setIsMobileMenuOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                                      isActive 
                                        ? "bg-brand-500/10 text-brand-400 border-brand-500/20 font-bold shadow-sm" 
                                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border-transparent"
                                    }`}
                                  >
                                    <Icon size={14} className={`shrink-0 ${isActive ? "text-brand-400" : "text-slate-500"}`} />
                                    <span className="truncate">{item.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between gap-2.5 shrink-0">
                      <button
                        onClick={() => { setShowProfileModal(true); setIsMobileMenuOpen(false); }}
                        className="flex items-center gap-2.5 text-left min-w-0 flex-1 hover:bg-slate-800/40 p-1.5 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-800/40"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-400 shrink-0">
                          <User size={14} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 truncate leading-none">{userName}</h4>
                          <span className="text-[9px] text-slate-500 truncate block mt-1">{userRole}</span>
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          onClick={() => { setShowNotificationDrawer(!showNotificationDrawer); setIsMobileMenuOpen(false); }}
                          className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/30 hover:bg-slate-800 rounded-xl border border-slate-800/60 transition relative cursor-pointer"
                        >
                          <Bell size={13} />
                          {notifications.some(n => !n.read) && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
                          )}
                        </button>
                        
                        <button 
                          onClick={() => { setShowProfileModal(true); setIsMobileMenuOpen(false); }}
                          className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/30 hover:bg-slate-800 rounded-xl border border-slate-800/60 transition cursor-pointer"
                        >
                          <Settings size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* MAIN WRAPPER CONTAINER & MOBILE HEADER */}
          <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-y-auto">
            
            {/* MOBILE HEADER */}
            <header className="md:hidden sticky top-0 z-45 bg-white border-b border-slate-200/80 shadow-sm px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
                  title="Open Navigation"
                >
                  <Menu size={18} />
                </button>
                
                {navHistory.length > 1 && (
                  <button
                    onClick={handleGoBack}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
                    title="Go Back"
                  >
                    <ChevronLeft size={18} className="stroke-[2.5px]" />
                  </button>
                )}

                <div className="flex items-center gap-2 cursor-pointer" onClick={() => changeTab("dashboard")}>
                  <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-brand-500/15">
                    <Briefcase size={14} />
                  </div>
                  <h1 className="text-xs font-display font-extrabold text-slate-800 tracking-tight leading-none">AICOS</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                  className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/50 transition relative cursor-pointer"
                >
                  <Bell size={14} />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500 cursor-pointer"
                >
                  <User size={13} />
                </button>
              </div>
            </header>

            {/* CONTENT VIEWPORT CONTAINER */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: slideDirection * 120 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -slideDirection * 120 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="w-full"
              >
                {activeTab === "dashboard" && (
                  <Dashboard
                    resumes={resumes}
                    jds={jds}
                    interviews={interviews}
                    userXp={userXp}
                    userLevel={userLevel}
                    userBadges={userBadges}
                    userStreak={userStreak}
                    userRole={userRole}
                    careerPrefs={careerPrefs}
                    onAddXp={saveXp}
                    onUploadRedirect={() => changeTab("upload")}
                    onStartInterviewRedirect={(session) => {
                      if (session) {
                        setCurrentSession(session);
                        localStorage.setItem("platform_active_session", JSON.stringify(session));
                        changeTab("interview");
                      } else {
                        changeTab("setup");
                      }
                    }}
                    onSelectResume={(id) => {
                      changeTab("upload");
                    }}
                    onSelectJd={(id) => {
                      changeTab("upload");
                    }}
                    onDeleteResume={handleDeleteResume}
                    onDeleteJd={handleDeleteJd}
                    onViewReport={(session) => {
                      setSelectedReportSession(session);
                      changeTab("report");
                    }}
                    onDeleteInterview={handleDeleteInterview}
                    examsCleared={examsCleared}
                    paperNames={paperNames}
                    actuarialBoard={actuarialBoard}
                    onChangeTab={(tab) => changeTab(tab)}
                  />
                )}

                {activeTab === "cv-builder" && (
                  <CVBuilder
                    resumes={resumes}
                    userEmail={userEmail}
                    userName={userName}
                    userRole={userRole}
                    examsCleared={examsCleared}
                    setExamsCleared={setExamsCleared}
                    paperNames={paperNames}
                    setPaperNames={setPaperNames}
                    actuarialBoard={actuarialBoard}
                    setActuarialBoard={setActuarialBoard}
                    onAddResume={handleAddResume}
                    onAddXp={saveXp}
                  />
                )}

                {activeTab === "upload" && (
                  <DocumentUpload
                    resumes={resumes}
                    jds={jds}
                    onAddResume={handleAddResume}
                    onAddJd={handleAddJd}
                    onDeleteResume={handleDeleteResume}
                    onDeleteJd={handleDeleteJd}
                  />
                )}

                {activeTab === "setup" && (
                  <InterviewSetup
                    resumes={resumes}
                    jds={jds}
                    onStartInterview={handleStartInterview}
                    interviewers={interviewers}
                  />
                )}

                 {activeTab === "assessment" && (
                  <AssessmentCenter
                    userXp={userXp}
                    userLevel={userLevel}
                    onAddXp={saveXp}
                    aptitudeQuestions={aptitudeQuestions}
                  />
                )}

                {activeTab === "questionbank" && (
                  <QuestionBankHub
                    resumes={resumes}
                    jds={jds}
                    onStartCompanyMock={(company) => {
                      handleStartInterview({
                        resumeId: resumes[0]?.id || undefined,
                        jdId: jds[0]?.id || undefined,
                        mode: InterviewMode.TechnicalActuarial,
                        difficulty: DifficultyLevel.Medium,
                        personality: InterviewerPersonality.HiringManager,
                        company: company
                      });
                    }}
                    onAddXp={saveXp}
                    questions={questions}
                  />
                )}

                {activeTab === "mentor" && (
                  <AIMentorHub
                    userXp={userXp}
                    userLevel={userLevel}
                    userStreak={userStreak}
                    userBadges={userBadges}
                    userRole={userRole}
                    careerPrefs={careerPrefs}
                    onAddXp={saveXp}
                  />
                )}

                {activeTab === "coding" && (
                  <CodingSandbox
                    onAddXp={saveXp}
                    onBackToDashboard={() => changeTab("dashboard")}
                    codingProblems={codingProblems}
                  />
                )}

                {activeTab === "roadmap" && (
                  <CareerRoadmap
                    resumes={resumes}
                    userRole={userRole}
                    careerPrefs={careerPrefs}
                    onAddXp={saveXp}
                    onBackToDashboard={() => changeTab("dashboard")}
                  />
                )}

                {activeTab === "tracker" && (
                  <ApplicationTracker
                    userRole={userRole}
                    onAddXp={saveXp}
                    onBackToDashboard={() => changeTab("dashboard")}
                  />
                )}

                {activeTab === "recruit" && (
                  <RecruiterDashboard
                    onAddXp={saveXp}
                    userName={userName}
                    setUserName={setUserName}
                    userRole={userRole}
                    setUserRole={setUserRole}
                    userEmail={userEmail}
                    setUserEmail={setUserEmail}
                    userXp={userXp}
                    setUserXp={setUserXp}
                    userLevel={userLevel}
                    setUserLevel={setUserLevel}
                    userStreak={userStreak}
                    setUserStreak={setUserStreak}
                    userBadges={userBadges}
                    setUserBadges={setUserBadges}
                    questions={questions}
                    setQuestions={setQuestions}
                    aptitudeQuestions={aptitudeQuestions}
                    setAptitudeQuestions={setAptitudeQuestions}
                    codingProblems={codingProblems}
                    setCodingProblems={setCodingProblems}
                    interviewers={interviewers}
                    setInterviewers={setInterviewers}
                    enabledFeatures={enabledFeatures}
                    setEnabledFeatures={setEnabledFeatures}
                  />
                )}

                {activeTab === "interview" && currentSession && (
                  <div className="space-y-4">
                    {/* Active interview warning wrapper */}
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 font-semibold flex items-center gap-1.5 justify-center max-w-xl mx-auto">
                      <ShieldAlert size={14} /> Close or reloading this browser canvas will pause your active mock interview progress.
                    </div>
                    <InterviewSessionComponent
                      session={currentSession}
                      onSubmitAnswer={handleSubmitAnswer}
                      onCompleteSession={handleCompleteSession}
                      onDeleteSession={() => handleDeleteInterview(currentSession.id)}
                    />
                  </div>
                )}

                {activeTab === "report" && selectedReportSession && (
                  <ReportViewer
                    session={selectedReportSession}
                    onBackToDashboard={() => {
                      setSelectedReportSession(null);
                      changeTab("dashboard");
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

          {/* 3. PROFILE MODAL */}
          {showProfileModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-5 border border-slate-200 shadow-2xl relative">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
                      <Settings className="text-indigo-600 shrink-0 animate-spin" style={{ animationDuration: '6s' }} size={16} />
                      AI-COS Profile & Executive Preferences
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manage your credential tokens, career targets, saved records, and synchronization states.</p>
                  </div>
                  <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-xs p-1">
                    ✕
                  </button>
                </div>

                <UserProfileSettings
                  userName={userName}
                  setUserName={setUserName}
                  userEmail={userEmail}
                  userRole={userRole}
                  setUserRole={setUserRole}
                  rememberMe={rememberMe}
                  setRememberMe={setRememberMe}
                  storedPassword={storedPassword}
                  setStoredPassword={setStoredPassword}
                  careerPrefs={careerPrefs}
                  setCareerPrefs={setCareerPrefs}
                  userSettings={userSettings}
                  setUserSettings={setUserSettings}
                  savedCompanies={savedCompanies}
                  setSavedCompanies={setSavedCompanies}
                  savedJobRoles={savedJobRoles}
                  setSavedJobRoles={setSavedJobRoles}
                  isSyncing={isSyncing}
                  lastSyncedTime={lastSyncedTime}
                  handleCloudSync={handleCloudSync}
                  showLogoutConfirm={showLogoutConfirm}
                  setShowLogoutConfirm={setShowLogoutConfirm}
                  onStandardLogout={handleStandardLogout}
                  onForgetAndLogout={handleForgetAndLogout}
                  userBadges={userBadges}
                  activeTab={profileModalTab}
                  setActiveTab={setProfileModalTab}
                  examsCleared={examsCleared}
                  setExamsCleared={setExamsCleared}
                  paperNames={paperNames}
                  setPaperNames={setPaperNames}
                  actuarialBoard={actuarialBoard}
                  setActuarialBoard={setActuarialBoard}
                />

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Save & Close Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. NOTIFICATION DRAWER */}
          {showNotificationDrawer && (
            <div className="fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-slate-200 shadow-2xl p-5 flex flex-col justify-between">
              <div className="space-y-5 flex-1">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Bell size={15} /> Achievement & Reminder Log
                  </h3>
                  <button onClick={() => setShowNotificationDrawer(false)} className="text-slate-400 hover:text-slate-700 font-bold text-xs">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 max-h-[80vh] overflow-y-auto">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      className={`p-3 rounded-xl border text-xs text-left space-y-1.5 relative ${
                        n.read ? "bg-slate-50 border-slate-100 text-slate-500" : "bg-indigo-50/50 border-indigo-100 text-slate-800"
                      }`}
                      onClick={() => {
                        const updated = notifications.map(notif => notif.id === n.id ? { ...notif, read: true } : notif);
                        saveNotifications(updated);
                      }}
                    >
                      <h4 className="font-bold flex items-center gap-1">
                        {n.type === "achievement" ? "🌟" : "✔"} {n.title}
                      </h4>
                      <p className="text-[11px] leading-relaxed text-slate-600">{n.message}</p>
                      <span className="text-[9px] text-slate-400 block text-right font-mono">{n.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  const cleared = notifications.map(n => ({ ...n, read: true }));
                  saveNotifications(cleared);
                }}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 border border-slate-200/60"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
