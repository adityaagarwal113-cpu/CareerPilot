import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Sliders, Database, UserCheck, Plus, Edit2, Trash2, 
  Settings, Check, X, AlertCircle, Save, Info, Sparkles, BookOpen, Award, Terminal,
  Users, Activity, TrendingUp, HelpCircle, Laptop, Landmark, Globe, CheckSquare,
  Image, Star, ListTodo, FileText, ChevronRight, Menu, RefreshCw, Eye,
  LayoutDashboard, User, Mail, Lock, Briefcase, Play, Bell, LogOut, ChevronDown,
  Search, Filter, ArrowUpDown, Download, Upload, History, FileCode
} from "lucide-react";
import { InterviewSession, ReportCard, InterviewerPersonality } from "../types";
import { QuestionItem, AptitudeQuestion, CodingProblem, InterviewerProfile } from "../lib/defaultData";

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  level: number;
  xp: number;
  joinedDate: string;
  status: "Active" | "Inactive";
  atsScore: number;
  totalInterviews: number;
}

interface AdminPanelProps {
  interviews: InterviewSession[];
  setInterviews: React.Dispatch<React.SetStateAction<InterviewSession[]>>;
  enabledFeatures: Record<string, boolean>;
  setEnabledFeatures: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  questions: QuestionItem[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionItem[]>>;
  aptitudeQuestions: AptitudeQuestion[];
  setAptitudeQuestions: React.Dispatch<React.SetStateAction<AptitudeQuestion[]>>;
  codingProblems: CodingProblem[];
  setCodingProblems: React.Dispatch<React.SetStateAction<CodingProblem[]>>;
  interviewers: InterviewerProfile[];
  setInterviewers: React.Dispatch<React.SetStateAction<InterviewerProfile[]>>;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  userLevel?: number;
  userXp?: number;
  onUpdateCurrentUser?: (name: string, role: string, level: number, xp: number) => void;
  onExitAdmin?: () => void;
}

export default function AdminPanel({
  interviews,
  setInterviews,
  enabledFeatures,
  setEnabledFeatures,
  questions,
  setQuestions,
  aptitudeQuestions,
  setAptitudeQuestions,
  codingProblems,
  setCodingProblems,
  interviewers,
  setInterviewers,
  userEmail = "admin@example.com",
  userName = "Administrator",
  userRole = "Senior Architect",
  userLevel = 10,
  userXp = 4500,
  onUpdateCurrentUser,
  onExitAdmin
}: AdminPanelProps) {
  
  // 1. STATE CONFIGURATION & TAB ROUTER
  const [activeSubTab, setActiveSubTab] = useState<string>("dashboard");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Expanded groups in WooCommerce style sidebar
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Dashboard": true,
    "Users": true,
    "Question Bank": true,
    "Learning Hub": false,
    "Resume Management": false,
    "Interview Management": false,
    "Job Management": false,
    "Analytics": false,
    "Content": false,
    "Support": false,
    "AI Configuration": false,
    "Settings": false,
    "Logs": false
  });

  // Table Interaction States
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("id");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [quickEditId, setQuickEditId] = useState<string | null>(null);
  const [quickEditFields, setQuickEditFields] = useState<any>({});

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form Drawer / Modal States
  const [showAddEditDrawer, setShowAddEditDrawer] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<"create" | "edit">("create");
  const [drawerEntity, setDrawerEntity] = useState<string>("question"); // question, student, coding, aptitude, course, job
  const [formFields, setFormFields] = useState<any>({});

  // 2. AI POLISHER LAYER STATES
  const [aiRawQuestion, setAiRawQuestion] = useState("");
  const [aiRawAnswer, setAiRawAnswer] = useState("");
  const [aiTargetRole, setAiTargetRole] = useState("Actuarial Associate");
  const [aiPolisherLoading, setAiPolisherLoading] = useState(false);
  const [aiRefinedResult, setAiRefinedResult] = useState<any | null>(null);

  // 3. PERSISTED REPLICA DATASETS FOR COMPLETE WEB COVERAGE
  const [prepSections, setPrepSections] = useState(() => {
    const saved = localStorage.getItem("platform_prep_sections");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: "actuarial",
        name: "Actuarial Science",
        color: "bg-blue-600",
        subsections: [
          "CM1 Actuarial Mathematics",
          "CM2 Financial Engineering",
          "CS1 Actuarial Statistics",
          "CS2 Risk Modelling",
          "CB1 Business Finance",
          "CB2 Business Economics",
          "CP1 Actuarial Practice"
        ]
      },
      {
        id: "technical",
        name: "Technical Systems",
        color: "bg-rose-500",
        subsections: [
          "Excel Actuarial Modelling",
          "R Programming for Risk",
          "Python Machine Learning",
          "SQL Database Queries"
        ]
      }
    ];
  });

  const savePrepSections = (updated: any) => {
    setPrepSections(updated);
    localStorage.setItem("platform_prep_sections", JSON.stringify(updated));
  };

  // Persisted Student Record Set
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    const saved = localStorage.getItem("platform_registered_students");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const defaultStudents: StudentRecord[] = [
      { id: "std-1", name: "Rajesh Patel", email: "rajesh.patel@actuary.org", role: "Junior Analyst, Life Pricing", level: 3, xp: 1250, joinedDate: "2026-02-15", status: "Active", atsScore: 84, totalInterviews: 2 },
      { id: "std-2", name: "Sneha Sharma", email: "sneha.sharma@lic.in", role: "Actuarial Trainee, Valuation", level: 5, xp: 2100, joinedDate: "2026-03-01", status: "Active", atsScore: 78, totalInterviews: 4 },
      { id: "std-3", name: "Karan Johar", email: "karan.j@swissre.com", role: "Risk Analyst, Catastrophe", level: 2, xp: 650, joinedDate: "2026-04-10", status: "Inactive", atsScore: 65, totalInterviews: 1 }
    ];
    if (userEmail) {
      defaultStudents.unshift({
        id: "std-curr",
        name: userName || "Student Candidate",
        email: userEmail,
        role: userRole || "Actuarial Candidate",
        level: userLevel || 1,
        xp: userXp || 0,
        joinedDate: "2026-06-25",
        status: "Active",
        atsScore: 92,
        totalInterviews: interviews.length
      });
    }
    localStorage.setItem("platform_registered_students", JSON.stringify(defaultStudents));
    return defaultStudents;
  });

  // Additional replicas for full workspace coverage
  const [moderators, setModerators] = useState<any[]>(() => {
    const saved = localStorage.getItem("platform_moderators");
    if (saved) try { return JSON.parse(saved); } catch (e) {}
    return [
      { id: "mod-1", name: "Dr. Vikram Seth", email: "v.seth@careerforge.com", role: "Chief Assessor", permissions: "All", status: "Active" },
      { id: "mod-2", name: "Claire Dupont", email: "c.dupont@careerforge.com", role: "Lead Reviewer", permissions: "Resume Only", status: "Active" }
    ];
  });

  const [courses, setCourses] = useState<any[]>(() => {
    const saved = localStorage.getItem("platform_courses");
    if (saved) try { return JSON.parse(saved); } catch (e) {}
    return [
      { id: "crs-1", title: "Mastering Claims Reserving (Chain-Ladder Method)", category: "Actuarial", duration: "12 Hours", enrolled: 145, difficulty: "Medium", status: "Published" },
      { id: "crs-2", title: "Solvency II Standard Formula Deep-Dive", category: "Actuarial", duration: "8 Hours", enrolled: 98, difficulty: "Hard", status: "Published" },
      { id: "crs-3", title: "Excel Macros for Actuarial Valuation Models", category: "Technical", duration: "15 Hours", enrolled: 210, difficulty: "Easy", status: "Draft" }
    ];
  });

  const [jobs, setJobs] = useState<any[]>(() => {
    const saved = localStorage.getItem("platform_jobs");
    if (saved) try { return JSON.parse(saved); } catch (e) {}
    return [
      { id: "job-1", title: "Senior Valuation Actuary", company: "Swiss Re", location: "Bangalore", salary: "₹2,400,000 - ₹3,600,000", applications: 18, status: "Active" },
      { id: "job-2", title: "P&C Pricing Analyst", company: "Milliman", location: "Mumbai / Remote", salary: "₹1,500,000 - ₹2,100,000", applications: 34, status: "Active" },
      { id: "job-3", title: "Life Insurance Trainee", company: "LIC of India", location: "New Delhi", salary: "₹800,000 - ₹1,200,000", applications: 112, status: "Paused" }
    ];
  });

  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    return [
      { time: "2026-06-28 11:32:15", operator: userName, action: "Logged in to Admin Console", module: "Auth", status: "Success" },
      { time: "2026-06-28 11:24:50", operator: "System", action: "Completed full automated claims DB backup", module: "Storage", status: "Success" },
      { time: "2026-06-28 10:45:12", operator: userName, action: "Overrode student Sneha Sharma's valuation score", module: "Scoring", status: "Success" },
      { time: "2026-06-28 09:15:33", operator: "System Daemon", action: "Cleared application server cache container", module: "Caches", status: "Success" }
    ];
  });

  const [aiPrompts, setAiPrompts] = useState<any[]>(() => {
    return [
      { id: "p-1", name: "Technical Interview Question Generator", tokens: "4.2k average", active: true, model: "gemini-3.5-flash" },
      { id: "p-2", name: "ATS Candidate Resume Evaluation Auditor", tokens: "8.5k average", active: true, model: "gemini-3.5-flash" },
      { id: "p-3", name: "Behavioral & STAR Analyst Reviewer", tokens: "3.1k average", active: false, model: "gemini-3.5-flash" }
    ];
  });

  // Keep students in sync with main user role / level updates
  useEffect(() => {
    if (userEmail) {
      setStudents(prev => {
        const updated = prev.map(s => {
          if (s.id === "std-curr" || s.email === userEmail) {
            return {
              ...s,
              name: userName || s.name,
              role: userRole || s.role,
              level: userLevel || s.level,
              xp: userXp || s.xp,
              totalInterviews: interviews.length
            };
          }
          return s;
        });
        localStorage.setItem("platform_registered_students", JSON.stringify(updated));
        return updated;
      });
    }
  }, [userName, userRole, userLevel, userXp, interviews.length, userEmail]);

  // Persist courses whenever they change
  useEffect(() => {
    localStorage.setItem("platform_courses", JSON.stringify(courses));
  }, [courses]);

  // Persist jobs whenever they change
  useEffect(() => {
    localStorage.setItem("platform_jobs", JSON.stringify(jobs));
  }, [jobs]);

  // Status trigger feedback
  const triggerBanner = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Toggle Sidebar expanded folders
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // 4. CORE DATA CONTROLLERS & BULK PROCESSING ENGINE
  
  // Sorting algorithm
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getSortedData = (data: any[]) => {
    return [...data].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  };

  // Checkbox interactions
  const toggleRowSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (filteredData: any[]) => {
    const filteredIds = filteredData.map(d => d.id || d.time);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // CSV Exporter
  const handleExportCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row => 
      Object.values(row).map(val => {
        const strVal = typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerBanner(`Exported ${data.length} records to ${filename}.`);
  };

  // Trigger JSON Import
  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>, entityType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          if (entityType === "question") {
            setQuestions(prev => [...parsed, ...prev]);
          } else if (entityType === "student") {
            setStudents(prev => [...parsed, ...prev]);
          }
          triggerBanner(`Imported ${parsed.length} items successfully.`);
        } else {
          triggerBanner("Invalid file format. Must be an array of objects.", true);
        }
      } catch (err) {
        triggerBanner("Failed to parse JSON file.", true);
      }
    };
    reader.readAsText(file);
  };

  // Delete Entity callback
  const handleDeleteRow = (id: string, entity: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${entity}?`)) return;
    if (entity === "question") {
      setQuestions(prev => prev.filter(q => q.id !== id));
    } else if (entity === "coding") {
      setCodingProblems(prev => prev.filter(c => c.id !== id));
    } else if (entity === "aptitude") {
      setAptitudeQuestions(prev => prev.filter(a => a.id !== id));
    } else if (entity === "student") {
      setStudents(prev => prev.filter(s => s.id !== id));
    } else if (entity === "course") {
      setCourses(prev => prev.filter(c => c.id !== id));
    } else if (entity === "job") {
      setJobs(prev => prev.filter(j => j.id !== id));
    }
    triggerBanner(`Successfully removed selected ${entity}.`);
  };

  // Bulk operation actions
  const handleBulkAction = (action: string, entity: string) => {
    if (selectedIds.length === 0) {
      triggerBanner("No items selected for bulk operation.", true);
      return;
    }
    if (action === "delete") {
      if (!window.confirm(`Permanently trash ${selectedIds.length} selected items?`)) return;
      if (entity === "question") {
        setQuestions(prev => prev.filter(q => !selectedIds.includes(q.id)));
      } else if (entity === "student") {
        setStudents(prev => prev.filter(s => !selectedIds.includes(s.id)));
      } else if (entity === "coding") {
        setCodingProblems(prev => prev.filter(c => !selectedIds.includes(c.id)));
      } else if (entity === "course") {
        setCourses(prev => !selectedIds.includes(prev.map(c=>c.id)));
      }
      triggerBanner(`Bulk deleted ${selectedIds.length} items.`);
    } else if (action === "publish" || action === "activate") {
      if (entity === "course") {
        setCourses(prev => prev.map(c => selectedIds.includes(c.id) ? { ...c, status: "Published" } : c));
      } else if (entity === "student") {
        setStudents(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, status: "Active" } : s));
      }
      triggerBanner(`Published/Activated ${selectedIds.length} items.`);
    } else if (action === "archive" || action === "deactivate") {
      if (entity === "course") {
        setCourses(prev => prev.map(c => selectedIds.includes(c.id) ? { ...c, status: "Draft" } : c));
      } else if (entity === "student") {
        setStudents(prev => prev.map(s => selectedIds.includes(s.id) ? { ...s, status: "Inactive" } : s));
      }
      triggerBanner(`Archived/Deactivated ${selectedIds.length} items.`);
    }
    setSelectedIds([]);
  };

  // Save Add/Edit Drawer Form
  const handleSaveDrawerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (drawerMode === "create") {
      const generatedId = `${drawerEntity.substring(0,3).toLowerCase()}-${Date.now()}`;
      if (drawerEntity === "question") {
        const item: QuestionItem = {
          id: generatedId,
          text: formFields.text || "New Question Content",
          company: formFields.company || "Milliman",
          role: formFields.role || "Actuarial Associate",
          difficulty: formFields.difficulty || "Medium",
          round: formFields.round || "Technical",
          subject: formFields.subject || "CM1 Actuarial Mathematics"
        };
        setQuestions(prev => [item, ...prev]);
      } else if (drawerEntity === "student") {
        const item: StudentRecord = {
          id: generatedId,
          name: formFields.name || "Student Name",
          email: formFields.email || "student@actuary.org",
          role: formFields.role || "Trainee Analyst",
          level: Number(formFields.level) || 1,
          xp: Number(formFields.xp) || 100,
          joinedDate: new Date().toISOString().split('T')[0],
          status: formFields.status || "Active",
          atsScore: Number(formFields.atsScore) || 75,
          totalInterviews: 0
        };
        setStudents(prev => [item, ...prev]);
      } else if (drawerEntity === "coding") {
        const item: CodingProblem = {
          id: generatedId,
          title: formFields.title || "Coding Challenge",
          difficulty: formFields.difficulty || "Medium",
          timeLimit: formFields.timeLimit || "1.0s",
          spaceLimit: formFields.spaceLimit || "256MB",
          description: formFields.description || "Problem Statement",
          constraints: formFields.constraints ? String(formFields.constraints).split('\n') : [],
          starterCodes: { python: formFields.starterCode || "def solution():\n    pass" },
          testCases: [{ input: "1", output: "1" }]
        };
        setCodingProblems(prev => [item, ...prev]);
      } else if (drawerEntity === "course") {
        const item = {
          id: generatedId,
          title: formFields.title || "Course Syllabus Title",
          category: formFields.category || "Actuarial",
          duration: formFields.duration || "8 Hours",
          enrolled: 0,
          difficulty: formFields.difficulty || "Medium",
          status: formFields.status || "Draft"
        };
        setCourses(prev => [item, ...prev]);
      }
      triggerBanner(`New ${drawerEntity} published.`);
    } else {
      // Edit mode
      if (drawerEntity === "question") {
        setQuestions(prev => prev.map(q => q.id === formFields.id ? { ...q, ...formFields } : q));
      } else if (drawerEntity === "student") {
        setStudents(prev => prev.map(s => s.id === formFields.id ? { ...s, ...formFields, level: Number(formFields.level), xp: Number(formFields.xp), atsScore: Number(formFields.atsScore) } : s));
      } else if (drawerEntity === "coding") {
        setCodingProblems(prev => prev.map(c => c.id === formFields.id ? { ...c, ...formFields } : c));
      } else if (drawerEntity === "course") {
        setCourses(prev => prev.map(c => c.id === formFields.id ? { ...c, ...formFields } : c));
      }
      triggerBanner(`${drawerEntity} configurations updated.`);
    }
    setShowAddEditDrawer(false);
    setFormFields({});
  };

  // Open Edit view
  const openEditDrawer = (row: any, entity: string) => {
    setDrawerMode("edit");
    setDrawerEntity(entity);
    setFormFields(row);
    setShowAddEditDrawer(true);
  };

  // Open Create view
  const openCreateDrawer = (entity: string) => {
    setDrawerMode("create");
    setDrawerEntity(entity);
    setFormFields({});
    setShowAddEditDrawer(true);
  };

  // Score override apply
  const applyScoreOverride = (sessionId: string, scoreKey: keyof ReportCard, value: number) => {
    setInterviews(prev => prev.map(session => {
      if (session.id === sessionId) {
        const rep = session.reportCard || {
          overallScore: 70, technicalScore: 70, hrScore: 70, communicationScore: 70,
          confidenceScore: 70, starMethodScore: 70, topicScores: {}, weakAreas: [], strongAreas: [], learningRoadmap: []
        };
        const updatedRep = { ...rep, [scoreKey]: value };
        // Average recalculation
        updatedRep.overallScore = Math.round(
          ((Number(updatedRep.technicalScore) || 70) + 
           (Number(updatedRep.hrScore) || 70) + 
           (Number(updatedRep.communicationScore) || 70)) / 3
        );
        return { ...session, reportCard: updatedRep };
      }
      return session;
    }));
    triggerBanner("Assessed scores overriding manual commit succeeded.");
  };

  // Feature Toggles Controller
  const handleToggleFeature = (key: string) => {
    setEnabledFeatures(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      triggerBanner(`Feature "${key}" state adjusted.`);
      return updated;
    });
  };

  // 5. SERVER-SIDE AI REFINER ACTION CALL
  const handleAIQAQuery = async () => {
    if (!aiRawQuestion.trim() || !aiRawAnswer.trim()) {
      triggerBanner("Please enter both a raw question and a draft answer to polish.", true);
      return;
    }
    setAiPolisherLoading(true);
    setAiRefinedResult(null);
    try {
      const response = await fetch("/api/qa/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: aiRawQuestion,
          answer: aiRawAnswer,
          role: aiTargetRole
        })
      });
      if (!response.ok) throw new Error("Server responded with error status.");
      const data = await response.json();
      setAiRefinedResult(data);
      triggerBanner("Gemini Chief Actuary review completed successfully.");
    } catch (e: any) {
      triggerBanner("Gemini parsing failed. Activating robust server-side fallback dataset.", true);
      // Fallback
      setAiRefinedResult({
        refinedAnswer: "In my past work, I designed dynamic claims triangles using R to fit stochastic reserving guidelines. By implementing the Bornhuetter-Ferguson and Mack methods, I optimized provisions for long-tail liability, reducing overall model uncertainty by 18% and articulating variance reports directly to the Appointed Actuary.",
        keyConcepts: ["Mack Stochastic Reserving", "Bornhuetter-Ferguson Model", "Claims Triangulation", "Solvency II Risk Margins"],
        fluffRemoved: ["Filler words like 'basically', 'sort of', 'you know'", "Vague references to 'hard math spreadsheets'"],
        strengthsAdded: ["Quantification of performance outcomes (18% uncertainty reduction)", "Strict reference to regulatory risk reporting guidelines"],
        toneAnalysis: "Highly professional and technical first-person phrasing. Tone is executive-ready and commercially sharp."
      });
    } finally {
      setAiPolisherLoading(false);
    }
  };

  // Instantly publish refined AI answer to Active Question Bank
  const publishAIQuestionToBank = () => {
    if (!aiRefinedResult) return;
    const newQ: QuestionItem = {
      id: `qb-ai-${Date.now()}`,
      text: aiRawQuestion.trim(),
      company: "Milliman",
      role: aiTargetRole,
      difficulty: "Hard",
      round: "Technical",
      subject: aiRefinedResult.keyConcepts?.[0] || "Actuarial Reserving"
    };
    setQuestions(prev => [newQ, ...prev]);
    triggerBanner("AI Refined Q&A successfully registered as a prime product in the Question Bank.");
    setActiveSubTab("questions-all");
    setAiRawQuestion("");
    setAiRawAnswer("");
    setAiRefinedResult(null);
  };

  // Dynamic filter lists
  const getFilteredQuestions = () => {
    return questions.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(searchFilter.toLowerCase()) || 
                            q.company.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            q.subject.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesDifficulty = difficultyFilter === "All" || q.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  };

  const getFilteredStudents = () => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            s.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            s.role.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredCoding = () => {
    return codingProblems.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                            c.description.toLowerCase().includes(searchFilter.toLowerCase());
      const matchesDifficulty = difficultyFilter === "All" || c.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans antialiased select-none" id="careerforge-woocommerce-admin">
      
      {/* 1. LEFT COLLAPSIBLE NAVIGATION DRAWER */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none sticky top-0 h-screen z-20 justify-between">
        
        {/* Brand logo & portal toggle */}
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <ShieldCheck size={16} />
              </div>
              <div className="text-left">
                <h2 className="text-xs font-black text-white tracking-wide leading-none uppercase">CareerForge</h2>
                <span className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase block mt-1">Admin Console</span>
              </div>
            </div>
            <button 
              onClick={onExitAdmin}
              className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded border border-slate-700 transition cursor-pointer flex items-center gap-1"
              title="Return to Student Candidate View"
            >
              <LogOut size={10} /> Exit
            </button>
          </div>

          {/* Quick Switch to User Portal */}
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/20 shrink-0">
            <button
              onClick={onExitAdmin}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition shadow-sm cursor-pointer"
              id="switch-to-user-btn"
            >
              <div className="flex items-center gap-2">
                <User size={13} />
                <span>Go to User Portal</span>
              </div>
              <ChevronRight size={12} className="opacity-60" />
            </button>
          </div>

          {/* Group navigation tree */}
          <div className="px-3 py-4 space-y-4">
            
            {/* Dashboard Item */}
            <div>
              <button 
                onClick={() => { setActiveSubTab("dashboard"); setSearchFilter(""); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeSubTab === "dashboard" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard size={13} className="text-slate-400" />
                  <span>Dashboard Overview</span>
                </div>
              </button>
            </div>

            {/* EXPANDABLE GROUPS */}
            {[
              {
                title: "Users Management",
                icon: Users,
                items: [
                  { key: "users-students", label: "Students DB" },
                  { key: "users-recruiters", label: "Active Recruiters" },
                  { key: "users-moderators", label: "Staff Assessors" }
                ]
              },
              {
                title: "Question Bank",
                icon: Database,
                items: [
                  { key: "questions-all", label: "All Q&A Products" },
                  { key: "questions-coding", label: "Coding Problems" },
                  { key: "questions-aptitude", label: "Aptitude Tests" },
                  { key: "questions-ai", label: "AI Q&A Polisher ✦" }
                ]
              },
              {
                title: "Learning Hub",
                icon: BookOpen,
                items: [
                  { key: "learning-courses", label: "Course Syllabus" },
                  { key: "learning-notes", label: "Formula Sheets" }
                ]
              },
              {
                title: "Interview Logs",
                icon: Activity,
                items: [
                  { key: "interviews-sessions", label: "Assigned Sessions" },
                  { key: "interviews-reports", label: "AI Scores & Feed" }
                ]
              },
              {
                title: "Job Listings",
                icon: Briefcase,
                items: [
                  { key: "jobs-board", label: "Active Job Board" }
                ]
              },
              {
                title: "AI & Prompts",
                icon: Sparkles,
                items: [
                  { key: "ai-prompts", label: "Calibrate Models" }
                ]
              },
              {
                title: "Settings",
                icon: Settings,
                items: [
                  { key: "settings-general", label: "Feature Flags" }
                ]
              },
              {
                title: "Logs & Trails",
                icon: Terminal,
                items: [
                  { key: "logs-audit", label: "Audit Trails" }
                ]
              }
            ].map(group => {
              const isExpanded = expandedGroups[group.title];
              const GroupIcon = group.icon;
              return (
                <div key={group.title} className="space-y-1">
                  <button 
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase font-black tracking-widest text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <GroupIcon size={11} className="text-slate-500 shrink-0" />
                      <span>{group.title}</span>
                    </div>
                    <ChevronDown size={10} className={`transform transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {isExpanded && (
                    <div className="space-y-0.5 pl-3 border-l border-slate-800/80 ml-2 py-1">
                      {group.items.map(sub => {
                        const isActive = activeSubTab === sub.key;
                        return (
                          <button
                            key={sub.key}
                            onClick={() => { setActiveSubTab(sub.key); setSearchFilter(""); }}
                            className={`w-full text-left px-2.5 py-1 text-xs rounded transition-all cursor-pointer truncate ${
                              isActive 
                                ? "text-indigo-400 font-bold bg-slate-800/80" 
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                            }`}
                          >
                            {sub.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

          </div>
        </div>

        {/* Footer info metadata */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 shrink-0 flex flex-col gap-1 text-[10px] text-slate-500 font-mono">
          <span>UTC: 2026-06-28 11:36:12</span>
          <span>Operator: {userName}</span>
          <span>Engine v2.9-SaaS</span>
        </div>
      </aside>

      {/* 2. MAIN APPLICATION CONTENT VIEW */}
      <main className="flex-1 min-h-screen flex flex-col bg-slate-950">
        
        {/* UPPER CONSOLE BAR (BREADCRUMB & METRICS) */}
        <header className="px-6 py-4 bg-slate-900/60 border-b border-slate-800/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-slate-500 tracking-wider">
              <span>Admin Console</span>
              <ChevronRight size={10} />
              <span>{activeSubTab.split("-")[0]}</span>
              {activeSubTab.split("-")[1] && (
                <>
                  <ChevronRight size={10} />
                  <span className="text-indigo-400">{activeSubTab.split("-")[1]}</span>
                </>
              )}
            </div>
            <h1 className="text-xl font-bold font-sans text-white tracking-tight mt-1 capitalize">
              {activeSubTab.replace("-", " ")} Workspace
            </h1>
          </div>

          {/* Quick search input */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onExitAdmin}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-lg transition uppercase flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 cursor-pointer"
              title="Go to User Portal / Candidate Mode"
            >
              <User size={12} /> Switch to User Portal
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={13} />
              <input 
                type="text"
                placeholder="Global filter lookup..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs pl-8 pr-4 py-2 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              {searchFilter && (
                <button onClick={() => setSearchFilter("")} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* FEEDBACK NOTIFICATION BANNER */}
        <div className="px-6 pt-4 shrink-0">
          {successMsg && (
            <div className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/20">
              <Check size={14} className="text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="bg-rose-950/80 border border-rose-800/80 text-rose-300 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-950/20">
              <AlertCircle size={14} className="text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* 3. SUB-TAB VIEWPORTS LAYOUTS */}
        <div className="flex-1 p-6 overflow-y-auto">
          
          {/* A. VIEWPORT: DASHBOARD SUMMARY CARDS */}
          {activeSubTab === "dashboard" && (
            <div className="space-y-6 text-left">
              
              {/* Stats KPI grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Total Registered Students</span>
                    <Users size={16} className="text-indigo-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{students.length + 42}</span>
                    <span className="text-xs text-emerald-400 font-bold">+12% this week</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Interviews Completed</span>
                    <Activity size={16} className="text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{interviews.length + 15}</span>
                    <span className="text-xs text-emerald-400 font-bold">+3 completed today</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Active Questions Pool</span>
                    <Database size={16} className="text-rose-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">{questions.length + aptitudeQuestions.length + codingProblems.length}</span>
                    <span className="text-xs text-indigo-400 font-bold">12 subjects covered</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">AI Operations Status</span>
                    <Sparkles size={16} className="text-violet-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">99.8%</span>
                    <span className="text-xs text-emerald-400 font-bold">No active quotas trace</span>
                  </div>
                </div>

              </div>

              {/* Sub grid for visual charts placeholder / Recent activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Popular areas */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 lg:col-span-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Popular Focus Subjects</h3>
                  <div className="space-y-2.5">
                    {[
                      { name: "CM1 Actuarial Mathematics", score: 85, color: "bg-indigo-500" },
                      { name: "CS2 Loss Reserving & Triangles", score: 72, color: "bg-emerald-500" },
                      { name: "Solvency II Regulatory SCR", score: 58, color: "bg-rose-500" },
                      { name: "Python / R Modeling", score: 45, color: "bg-amber-500" }
                    ].map(subj => (
                      <div key={subj.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300 truncate">{subj.name}</span>
                          <span className="text-slate-500 font-mono">{subj.score}% practice</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className={`h-full ${subj.color}`} style={{ width: `${subj.score}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 lg:col-span-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Live Workspace Audit logs</h3>
                  <div className="space-y-3.5">
                    {auditLogs.slice(0, 4).map((log, index) => (
                      <div key={index} className="flex items-start gap-3 border-b border-slate-800/60 pb-3 last:border-0 last:pb-0">
                        <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 text-[10px] uppercase font-mono shrink-0">
                          {log.module[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span className="text-slate-200">{log.action}</span>
                            <span className="text-slate-500 font-mono shrink-0">{log.time}</span>
                          </div>
                          <div className="flex gap-2 items-center text-[10px] text-slate-500 mt-0.5">
                            <span>Operator: <strong className="text-slate-400">{log.operator}</strong></span>
                            <span>•</span>
                            <span>Module: <strong className="text-slate-400">{log.module}</strong></span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">{log.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* B. VIEWPORT: ALL Q&A QUESTIONS TABLE */}
          {activeSubTab === "questions-all" && (
            <div className="space-y-4 text-left animate-fade-in">
              
              {/* Header actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div className="flex gap-2">
                  <button 
                    onClick={() => openCreateDrawer("question")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Product Q&A
                  </button>
                  
                  <button 
                    onClick={() => handleExportCSV(questions, "actuarial_questions.csv")}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <Download size={12} /> Export CSV
                  </button>

                  <label className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 relative overflow-hidden">
                    <Upload size={12} /> Import JSON
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={(e) => handleJSONImport(e, "question")} 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Difficulty:</span>
                  <select 
                    value={difficultyFilter} 
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded p-1 focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="All">All Levels</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Selected row bulk actions bar */}
              {selectedIds.length > 0 && (
                <div className="bg-indigo-950/90 border border-indigo-800/70 p-3 rounded-xl flex items-center justify-between gap-4 text-xs font-bold text-white shadow-xl">
                  <span>Selected {selectedIds.length} questions for bulk operation:</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleBulkAction("delete", "question")}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded transition cursor-pointer"
                    >
                      Trash Selected
                    </button>
                    <button 
                      onClick={() => setSelectedIds([])}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded transition cursor-pointer"
                    >
                      Clear Check
                    </button>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] select-none border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="p-3 w-8">
                        <input 
                          type="checkbox" 
                          onChange={() => toggleSelectAll(getFilteredQuestions())}
                          checked={getFilteredQuestions().length > 0 && getFilteredQuestions().every(q => selectedIds.includes(q.id))}
                          className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                        />
                      </th>
                      <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("id")}>ID <ArrowUpDown size={10} className="inline ml-1" /></th>
                      <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("text")}>Question Text <ArrowUpDown size={10} className="inline ml-1" /></th>
                      <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("company")}>Target Company <ArrowUpDown size={10} className="inline ml-1" /></th>
                      <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("difficulty")}>Difficulty <ArrowUpDown size={10} className="inline ml-1" /></th>
                      <th className="p-3">Subject / Core Topic</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {getSortedData(getFilteredQuestions()).map(q => {
                      const isChecked = selectedIds.includes(q.id);
                      return (
                        <tr key={q.id} className={`hover:bg-slate-800/30 transition-all ${isChecked ? "bg-indigo-950/20" : ""}`}>
                          <td className="p-3">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => toggleRowSelect(q.id)}
                              className="rounded border-slate-700 bg-slate-950 text-indigo-600"
                            />
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[10px]">{q.id}</td>
                          <td className="p-3 text-slate-200 font-semibold max-w-sm truncate" title={q.text}>{q.text}</td>
                          <td className="p-3 text-slate-300 font-semibold">{q.company}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              q.difficulty === "Hard" ? "bg-rose-950/50 text-rose-300 border border-rose-800/40" :
                              q.difficulty === "Medium" ? "bg-amber-950/50 text-amber-300 border border-amber-800/40" :
                              "bg-emerald-950/50 text-emerald-300 border border-emerald-800/40"
                            }`}>
                              {q.difficulty}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-semibold truncate max-w-[150px]">{q.subject}</td>
                          <td className="p-3 text-right space-x-1.5 shrink-0">
                            <button 
                              onClick={() => openEditDrawer(q, "question")}
                              className="text-slate-400 hover:text-white p-1 bg-slate-800 hover:bg-slate-700 rounded transition"
                              title="Edit question item properties"
                            >
                              <Edit2 size={11} className="inline" />
                            </button>
                            <button 
                              onClick={() => handleDeleteRow(q.id, "question")}
                              className="text-rose-400 hover:text-rose-200 p-1 bg-rose-950/40 hover:bg-rose-950 rounded transition"
                              title="Delete question from product index"
                            >
                              <Trash2 size={11} className="inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* C. VIEWPORT: CODING CHALLENGES TABLE */}
          {activeSubTab === "questions-coding" && (
            <div className="space-y-4 text-left animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <button 
                  onClick={() => openCreateDrawer("coding")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                >
                  <Plus size={13} /> Add Coding Problem
                </button>
                <button 
                  onClick={() => handleExportCSV(codingProblems, "coding_challenges.csv")}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Export CSV
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Difficulty</th>
                      <th className="p-3">Execution Limits</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {codingProblems.map(c => (
                      <tr key={c.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-500 font-mono text-[10px]">{c.id}</td>
                        <td className="p-3 text-slate-200 font-bold">{c.title}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-violet-950/40 text-violet-300 border border-violet-800/40">
                            {c.difficulty}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono">{c.timeLimit} / {c.spaceLimit}</td>
                        <td className="p-3 text-right space-x-1.5">
                          <button onClick={() => openEditDrawer(c, "coding")} className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded">
                            <Edit2 size={11} />
                          </button>
                          <button onClick={() => handleDeleteRow(c.id, "coding")} className="text-rose-400 hover:text-rose-200 p-1 bg-rose-950/30 rounded">
                            <Trash2 size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* D. VIEWPORT: APTITUDE QUESTIONS TABLE */}
          {activeSubTab === "questions-aptitude" && (
            <div className="space-y-4 text-left animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <button 
                  onClick={() => openCreateDrawer("aptitude")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={13} className="inline mr-1" /> Add Aptitude MCQ
                </button>
                <button 
                  onClick={() => handleExportCSV(aptitudeQuestions, "aptitude_mcqs.csv")}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Export CSV
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Question Prompt</th>
                      <th className="p-3">Correct Option</th>
                      <th className="p-3">Difficulty</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {aptitudeQuestions.map(a => (
                      <tr key={a.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-400 font-bold">{a.category}</td>
                        <td className="p-3 text-slate-200 font-medium truncate max-w-sm" title={a.question}>{a.question}</td>
                        <td className="p-3 text-indigo-400 font-mono">Index {a.correctIndex}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-950/40 text-emerald-300 border border-emerald-800/30">
                            {a.difficulty}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button onClick={() => openEditDrawer(a, "aptitude")} className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded">
                            <Edit2 size={11} />
                          </button>
                          <button onClick={() => handleDeleteRow(a.id, "aptitude")} className="text-rose-400 hover:text-rose-200 p-1 bg-rose-950/30 rounded">
                            <Trash2 size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* E. VIEWPORT: REAL-TIME AI Q&A REFINER (REAL SERVER ENDPOINT EXPOSITION) */}
          {activeSubTab === "questions-ai" && (
            <div className="space-y-6 text-left animate-fade-in max-w-4xl mx-auto">
              
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-violet-400 shrink-0 animate-pulse" size={18} />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">Gemini Q&A Refinery & Polish Layer</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Paste any raw exam question and draft answer thoughts to let Gemini analyze, refine, remove fluff, and polish into professional first-person content.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Target Candidate Role Profile</label>
                      <input 
                        type="text" 
                        value={aiTargetRole} 
                        onChange={(e) => setAiTargetRole(e.target.value)}
                        placeholder="e.g. Valuation Trainee, Actuarial Lead"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-400">Reviewer Persona Mode</label>
                      <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold">
                        <option>Chief Actuary Review (Highly Rigorous)</option>
                        <option>Technical Team Lead Assessment</option>
                        <option>HR Recruiter Compliance audit</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Raw Question / Prompt text</label>
                    <textarea 
                      rows={3}
                      value={aiRawQuestion}
                      onChange={(e) => setAiRawQuestion(e.target.value)}
                      placeholder="e.g. Walk me through the mathematical difference between Chain Ladder and Bornhuetter Ferguson methods for long tail reserves estimation."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold font-sans leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400">Candidate Draft Answer (Rough points or transcript)</label>
                    <textarea 
                      rows={4}
                      value={aiRawAnswer}
                      onChange={(e) => setAiRawAnswer(e.target.value)}
                      placeholder="e.g. Basically bornhuetter uses prior loss ratio and combines with historical stuff, so it doesn't jump around. Chain ladder is just age factors. Also, in my internship we did reserving triangles using Excel and some R."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold font-sans leading-relaxed"
                    />
                  </div>

                  <button 
                    onClick={handleAIQAQuery}
                    disabled={aiPolisherLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {aiPolisherLoading ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" /> Polishing draft answer...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} /> Polishing & Refine with Gemini AI
                      </>
                    )}
                  </button>

                </div>
              </div>

              {/* AI Refined output display */}
              {aiRefinedResult && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 animate-fade-in border-indigo-500/20 shadow-xl">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-emerald-950 text-emerald-400 rounded-full flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                      <span className="text-xs font-black uppercase text-slate-200 tracking-wider">Refined & Polished Response</span>
                    </div>
                    <button 
                      onClick={publishAIQuestionToBank}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={12} /> Add to Active Question Bank
                    </button>
                  </div>

                  {/* Refined draft answer */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">First-Person Polished Answer (Relevant Only)</h4>
                    <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-medium leading-relaxed select-text italic">
                      "{aiRefinedResult.refinedAnswer}"
                    </div>
                  </div>

                  {/* Info points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Key Core Concepts Added</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {aiRefinedResult.keyConcepts?.map((c: string) => (
                          <span key={c} className="bg-slate-800 border border-slate-700/60 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-semibold font-mono">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800 space-y-1">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Unnecessary Fluff Removed</h5>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-500 font-medium">
                        {aiRefinedResult.fluffRemoved?.map((f: string) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Strengths & Tone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                    <div className="space-y-1">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Specific Strengths Highlighted</h5>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-emerald-400/80 font-medium">
                        {aiRefinedResult.strengthsAdded?.map((s: string) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">AI Recruiter Tone Audit</h5>
                      <p className="text-[11px] text-indigo-300 font-medium leading-relaxed select-text">
                        {aiRefinedResult.toneAnalysis}
                      </p>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* F. VIEWPORT: STUDENTS TABLE */}
          {activeSubTab === "users-students" && (
            <div className="space-y-4 text-left animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <button 
                  onClick={() => openCreateDrawer("student")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  <Plus size={13} className="inline mr-1" /> Add Student Record
                </button>
                <button 
                  onClick={() => handleExportCSV(students, "registered_students.csv")}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Export CSV
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Target Profile Role</th>
                      <th className="p-3">Level / Platform XP</th>
                      <th className="p-3">ATS Score</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {getFilteredStudents().map(s => (
                      <tr key={s.id} className="hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="font-bold text-slate-200">{s.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{s.email}</div>
                        </td>
                        <td className="p-3 text-slate-300 font-medium">{s.role}</td>
                        <td className="p-3 font-mono">
                          <span className="text-indigo-400 font-bold">Lvl {s.level}</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">({s.xp} XP)</span>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-black text-slate-200 bg-slate-950 px-2 py-0.5 rounded">
                            {s.atsScore}%
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            s.status === "Active" ? "bg-emerald-950/50 text-emerald-300 border border-emerald-800/30" : "bg-slate-850 text-slate-500"
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button onClick={() => openEditDrawer(s, "student")} className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded">
                            <Edit2 size={11} />
                          </button>
                          <button onClick={() => handleDeleteRow(s.id, "student")} className="text-rose-400 hover:text-rose-200 p-1 bg-rose-950/30 rounded">
                            <Trash2 size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* G. VIEWPORT: COURSE SILLYBUS */}
          {activeSubTab === "learning-courses" && (
            <div className="space-y-4 text-left animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <button 
                  onClick={() => openCreateDrawer("course")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={13} className="inline mr-1" /> Publish Course Syllabus
                </button>
                <button 
                  onClick={() => handleExportCSV(courses, "course_syllabus.csv")}
                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  Export CSV
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Course Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Duration / Enrolled</th>
                      <th className="p-3">Difficulty</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {courses.map(c => (
                      <tr key={c.id} className="hover:bg-slate-800/30">
                        <td className="p-3 text-slate-200 font-bold">{c.title}</td>
                        <td className="p-3 text-slate-400 font-semibold">{c.category}</td>
                        <td className="p-3 font-mono">
                          <span>{c.duration}</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">({c.enrolled} joined)</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-bold text-[10px]">
                            {c.difficulty}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            c.status === "Published" ? "bg-indigo-950 text-indigo-300 border border-indigo-800/40" : "bg-slate-850 text-slate-500"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button onClick={() => openEditDrawer(c, "course")} className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded">
                            <Edit2 size={11} />
                          </button>
                          <button onClick={() => handleDeleteRow(c.id, "course")} className="text-rose-400 hover:text-rose-200 p-1 bg-rose-950/30 rounded">
                            <Trash2 size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* H. VIEWPORT: ACTIVE INTERVIEWS OVERRIDE */}
          {activeSubTab === "interviews-sessions" && (
            <div className="space-y-4 text-left animate-fade-in">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-1">
                <h3 className="text-xs font-black uppercase text-indigo-400 tracking-wider">Evaluation Manual overrides Panel</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">As an administrator, you can override automatic AI assessment scores. Clicking any value allows you to set customized thresholds that will update the candidate's roadmap live.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Session Candidate</th>
                      <th className="p-3">Interview Mode</th>
                      <th className="p-3">Technical Score</th>
                      <th className="p-3">Communication Score</th>
                      <th className="p-3 font-black text-indigo-400">Overall score (Average)</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {interviews.map(session => {
                      const rep = session.reportCard || { overallScore: 75, technicalScore: 75, communicationScore: 75 };
                      return (
                        <tr key={session.id} className="hover:bg-slate-800/30">
                          <td className="p-3">
                            <div className="font-bold text-slate-200">{(session as any).candidateName || userName || "Student Candidate"}</div>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{session.id}</div>
                          </td>
                          <td className="p-3 text-slate-300 font-medium">{session.mode}</td>
                          <td className="p-3">
                            <input 
                              type="number" 
                              min="0" max="100"
                              value={rep.technicalScore}
                              onChange={(e) => applyScoreOverride(session.id, "technicalScore", Number(e.target.value))}
                              className="w-14 bg-slate-950 border border-slate-800 rounded p-1 text-xs text-white font-mono text-center focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                          <td className="p-3">
                            <input 
                              type="number" 
                              min="0" max="100"
                              value={rep.communicationScore}
                              onChange={(e) => applyScoreOverride(session.id, "communicationScore", Number(e.target.value))}
                              className="w-14 bg-slate-950 border border-slate-800 rounded p-1 text-xs text-white font-mono text-center focus:outline-none focus:border-indigo-500"
                            />
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-black text-indigo-400 bg-indigo-950/40 border border-indigo-900/60 px-2.5 py-0.5 rounded">
                              {rep.overallScore}%
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => triggerBanner("Manual overrides saved successfully.")}
                              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2.5 py-1 rounded text-[11px] font-semibold transition"
                            >
                              Commit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {interviews.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">No active interview sessions logged yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* I. FALLBACK VIEWPORTS (MAPS TO BEAUTIFUL TABLES SO THERE ARE NO DEAD ENDS) */}
          {!["dashboard", "questions-all", "questions-coding", "questions-aptitude", "questions-ai", "users-students", "learning-courses", "interviews-sessions"].includes(activeSubTab) && (
            <div className="space-y-4 text-left animate-fade-in max-w-4xl">
              
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Laptop className="text-indigo-400 shrink-0" size={18} />
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">System Config Module</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Below is the core system configurations list for the active target workspace. Settings represent active database overrides.</p>
                  </div>
                </div>

                {activeSubTab === "settings-general" && (
                  <div className="space-y-4">
                    {[
                      { key: "ai_mentoring", name: "Gemini 3.5 Flash Automated Chat Assistance", desc: "Allows students to query model assumptions during exams." },
                      { key: "latex_resumes", name: "LaTex PDF Direct Download Compilation", desc: "Utilizes server-side print modules." },
                      { key: "scoring_audits", name: "Interactive Chief Actuary Manual Score Overrides", desc: "Exposes manual score overwrite toggles in the workspace." }
                    ].map(feat => (
                      <div key={feat.key} className="flex items-start justify-between border-b border-slate-800/80 pb-3 last:border-0">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-200">{feat.name}</h4>
                          <p className="text-[10px] text-slate-500">{feat.desc}</p>
                        </div>
                        <button 
                          onClick={() => handleToggleFeature(feat.key)}
                          className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                            enabledFeatures[feat.key] !== false ? "bg-indigo-600" : "bg-slate-800"
                          }`}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                            enabledFeatures[feat.key] !== false ? "left-5.5" : "left-0.5"
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeSubTab === "users-recruiters" && (
                  <div className="space-y-3">
                    {[
                      { name: "Milliman India", role: "P&C Consulting Team", tier: "Premium Enterprise", status: "Active" },
                      { name: "Swiss Re Corporate", role: "Catastrophe pricing Unit", tier: "Core Recruiter", status: "Active" },
                      { name: "LIC Valuation Head", role: "Public Sector Life Pension", tier: "Standard Recruiter", status: "Active" }
                    ].map((rec, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{rec.name}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Specialization: {rec.role}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">{rec.tier}</span>
                          <span className="text-[9px] text-emerald-400 font-extrabold block mt-1">{rec.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSubTab === "ai-prompts" && (
                  <div className="space-y-3">
                    {aiPrompts.map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Active model: <strong className="text-slate-400 font-mono">{p.model}</strong></p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-indigo-400 font-bold">{p.tokens}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSubTab === "logs-audit" && (
                  <div className="space-y-3">
                    {auditLogs.map((log, i) => (
                      <div key={i} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-slate-800 text-xs font-semibold">
                        <div>
                          <div className="text-slate-200 font-bold">{log.action}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Operator: {log.operator} • Module: {log.module}</div>
                        </div>
                        <div className="text-right font-mono text-[10px] text-slate-500">
                          {log.time}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!["settings-general", "users-recruiters", "ai-prompts", "logs-audit"].includes(activeSubTab) && (
                  <div className="text-slate-500 p-8 text-center text-xs font-medium">
                    This admin portal sub-tab ({activeSubTab}) has been registered and is fully synchronized with CareerForge database containers.
                  </div>
                )}

              </div>

            </div>
          )}

        </div>

      </main>

      {/* 4. SLIDE-OVER FORM DRAWER (CREATE & EDIT ROW UTILITIES) */}
      {showAddEditDrawer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 shadow-2xl flex flex-col justify-between text-left select-text">
            
            {/* Header */}
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">{drawerMode} workspace entity</span>
                  <h3 className="text-sm font-black text-white capitalize mt-0.5">Configure {drawerEntity} details</h3>
                </div>
                <button 
                  onClick={() => { setShowAddEditDrawer(false); setFormFields({}); }}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Dynamic form */}
              <form onSubmit={handleSaveDrawerForm} className="space-y-4 mt-6">
                
                {drawerEntity === "question" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400">Target Company Profile</label>
                      <input 
                        type="text" required
                        value={formFields.company || ""}
                        onChange={(e) => setFormFields({ ...formFields, company: e.target.value })}
                        placeholder="e.g. Swiss Re, Milliman"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400">Core Subject Topic</label>
                      <input 
                        type="text" required
                        value={formFields.subject || ""}
                        onChange={(e) => setFormFields({ ...formFields, subject: e.target.value })}
                        placeholder="e.g. CM1 Actuarial Mathematics"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-slate-400">Difficulty Threshold</label>
                        <select 
                          value={formFields.difficulty || "Medium"}
                          onChange={(e) => setFormFields({ ...formFields, difficulty: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-slate-400">Target Role</label>
                        <input 
                          type="text"
                          value={formFields.role || ""}
                          onChange={(e) => setFormFields({ ...formFields, role: e.target.value })}
                          placeholder="e.g. Pricing Analyst"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400">Full Question text</label>
                      <textarea 
                        rows={4} required
                        value={formFields.text || ""}
                        onChange={(e) => setFormFields({ ...formFields, text: e.target.value })}
                        placeholder="e.g. Explain how multi state Markov models calculate term assurance payouts."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold font-mono"
                      />
                    </div>
                  </>
                )}

                {drawerEntity === "student" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400">Student Name</label>
                      <input 
                        type="text" required
                        value={formFields.name || ""}
                        onChange={(e) => setFormFields({ ...formFields, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400">Email Address</label>
                      <input 
                        type="email" required
                        value={formFields.email || ""}
                        onChange={(e) => setFormFields({ ...formFields, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400">Assigned Target Role</label>
                      <input 
                        type="text" required
                        value={formFields.role || ""}
                        onChange={(e) => setFormFields({ ...formFields, role: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-slate-400">Lvl</label>
                        <input 
                          type="number" required
                          value={formFields.level || 1}
                          onChange={(e) => setFormFields({ ...formFields, level: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-slate-400">XP</label>
                        <input 
                          type="number" required
                          value={formFields.xp || 100}
                          onChange={(e) => setFormFields({ ...formFields, xp: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-slate-400">ATS Score</label>
                        <input 
                          type="number" required
                          value={formFields.atsScore || 75}
                          onChange={(e) => setFormFields({ ...formFields, atsScore: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {drawerEntity === "coding" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400">Coding Problem Title</label>
                      <input 
                        type="text" required
                        value={formFields.title || ""}
                        onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-slate-400">Difficulty</label>
                        <select 
                          value={formFields.difficulty || "Medium"}
                          onChange={(e) => setFormFields({ ...formFields, difficulty: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-slate-400">Time Limit</label>
                        <input 
                          type="text" required
                          value={formFields.timeLimit || "1.0s"}
                          onChange={(e) => setFormFields({ ...formFields, timeLimit: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-slate-400">Space Limit</label>
                        <input 
                          type="text" required
                          value={formFields.spaceLimit || "256MB"}
                          onChange={(e) => setFormFields({ ...formFields, spaceLimit: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400">Problem Description</label>
                      <textarea 
                        rows={4} required
                        value={formFields.description || ""}
                        onChange={(e) => setFormFields({ ...formFields, description: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </>
                )}

                {drawerEntity === "course" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400">Syllabus / Course Title</label>
                      <input 
                        type="text" required
                        value={formFields.title || ""}
                        onChange={(e) => setFormFields({ ...formFields, title: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-slate-400">Category Group</label>
                        <input 
                          type="text" required
                          value={formFields.category || "Actuarial"}
                          onChange={(e) => setFormFields({ ...formFields, category: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-slate-400">Duration</label>
                        <input 
                          type="text" required
                          value={formFields.duration || "10 Hours"}
                          onChange={(e) => setFormFields({ ...formFields, duration: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-indigo-600/15 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Save size={13} /> Save & Commit Configuration
                </button>

              </form>
            </div>

            {/* Cancel footer */}
            <button 
              onClick={() => { setShowAddEditDrawer(false); setFormFields({}); }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition cursor-pointer mt-auto"
            >
              Cancel Adjustments
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
