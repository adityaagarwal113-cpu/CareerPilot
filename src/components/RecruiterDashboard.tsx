import React, { useState, useEffect } from "react";
import { 
  Users, Calendar, UserCheck, BarChart3, Filter, Search, CheckCircle2, 
  XCircle, ArrowUpDown, ChevronRight, Eye, ShieldAlert, Sparkles, 
  Trash2, Plus, RefreshCw, Star, Info, Award, Sliders, Edit, Settings, 
  User, Check, Activity, Trello, Database, HelpCircle, Key, FileCode, Upload,
  LayoutDashboard, FileText, MessageSquare, BookOpen, Terminal, Play, Compass
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { QuestionItem, AptitudeQuestion, CodingProblem, InterviewerProfile } from "../lib/defaultData";

interface RecruiterDashboardProps {
  onAddXp: (xp: number, label: string) => void;
  userName: string;
  setUserName: (val: string) => void;
  userRole: string;
  setUserRole: (val: string) => void;
  userEmail: string;
  setUserEmail: (val: string) => void;
  userXp: number;
  setUserXp: (val: number) => void;
  userLevel: number;
  setUserLevel: (val: number) => void;
  userStreak: number;
  setUserStreak: (val: number) => void;
  userBadges: string[];
  setUserBadges: (val: string[]) => void;
  
  questions: QuestionItem[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionItem[]>>;
  aptitudeQuestions: AptitudeQuestion[];
  setAptitudeQuestions: React.Dispatch<React.SetStateAction<AptitudeQuestion[]>>;
  codingProblems: CodingProblem[];
  setCodingProblems: React.Dispatch<React.SetStateAction<CodingProblem[]>>;
  interviewers: InterviewerProfile[];
  setInterviewers: React.Dispatch<React.SetStateAction<InterviewerProfile[]>>;

  enabledFeatures: Record<string, boolean>;
  setEnabledFeatures: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}
const INITIAL_CANDIDATES = [
  {
    id: "cand-1",
    name: "Aditya Agarwal",
    role: "Full Stack Engineer",
    experience: "4 Years",
    resumeMatch: 94,
    atsStatus: "Pre-screened",
    interviewScore: 88,
    avatarColor: "bg-blue-500",
    email: "aditya.a@example.com",
    skills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "System Design"],
    scorecard: { technical: 92, communication: 85, logical: 90, matching: 94 },
    appliedDate: "2026-06-24",
    avatarInitial: "AA"
  },
  {
    id: "cand-2",
    name: "Sarah Chen",
    role: "AI Scientist",
    experience: "5 Years",
    resumeMatch: 97,
    atsStatus: "Interview Scheduled",
    interviewScore: 92,
    avatarColor: "bg-purple-500",
    email: "sarah.c@ai-research.org",
    skills: ["Python", "PyTorch", "Transformers", "NLP", "LLM Fine-tuning", "Docker"],
    scorecard: { technical: 98, communication: 88, logical: 96, matching: 97 },
    appliedDate: "2026-06-25",
    avatarInitial: "SC"
  },
  {
    id: "cand-3",
    name: "Marcus Aurelius",
    role: "Product Manager",
    experience: "6 Years",
    resumeMatch: 85,
    atsStatus: "Screening",
    interviewScore: 78,
    avatarColor: "bg-amber-500",
    email: "marcus.a@stoicpm.co",
    skills: ["Product Strategy", "User Research", "Agile", "SQL", "A/B Testing", "Wireframing"],
    scorecard: { technical: 70, communication: 95, logical: 82, matching: 85 },
    appliedDate: "2026-06-23",
    avatarInitial: "MA"
  },
  {
    id: "cand-4",
    name: "Elena Rostova",
    role: "Backend Engineer",
    experience: "3 Years",
    resumeMatch: 89,
    atsStatus: "Screening",
    interviewScore: 82,
    avatarColor: "bg-emerald-500",
    email: "elena.r@devmail.net",
    skills: ["Go", "Kubernetes", "Redis", "gRPC", "PostgreSQL", "Cloud Architecture"],
    scorecard: { technical: 88, communication: 80, logical: 85, matching: 89 },
    appliedDate: "2026-06-22",
    avatarInitial: "ER"
  }
];

const ANALYTICS_DATA = [
  { name: "Mon", applications: 12, scheduled: 4, hired: 1 },
  { name: "Tue", applications: 18, scheduled: 8, hired: 2 },
  { name: "Wed", applications: 24, scheduled: 11, hired: 3 },
  { name: "Thu", applications: 15, scheduled: 7, hired: 1 },
  { name: "Fri", applications: 22, scheduled: 14, hired: 4 },
  { name: "Sat", applications: 8, scheduled: 3, hired: 0 },
  { name: "Sun", applications: 5, scheduled: 2, hired: 1 }
];

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ 
  onAddXp,
  userName,
  setUserName,
  userRole,
  setUserRole,
  userEmail,
  setUserEmail,
  userXp,
  setUserXp,
  userLevel,
  setUserLevel,
  userStreak,
  setUserStreak,
  userBadges,
  setUserBadges,
  
  questions,
  setQuestions,
  aptitudeQuestions,
  setAptitudeQuestions,
  codingProblems,
  setCodingProblems,
  interviewers,
  setInterviewers,
  enabledFeatures,
  setEnabledFeatures
}) => {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCandidate, setSelectedCandidate] = useState<typeof INITIAL_CANDIDATES[0] | null>(INITIAL_CANDIDATES[0]);
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "screening" | "comparison" | "scheduler" | "customizer">("dashboard");

  // Candidates for Comparison Tool
  const [compareList, setCompareList] = useState<string[]>(["cand-1", "cand-2"]);

  // Screening AI State
  const [screenedFile, setScreenedFile] = useState<File | null>(null);
  const [screenedFileName, setScreenedFileName] = useState("");
  const [isScreening, setIsScreening] = useState(false);
  const [screeningResult, setScreeningResult] = useState<any>(null);

  // New Interview Scheduling State
  const [scheduledInterviews, setScheduledInterviews] = useState([
    { id: 1, candidate: "Sarah Chen", date: "2026-06-27", time: "10:00 AM", type: "Technical Round 1", interviewer: "Alex Miller (Principal Architect)" },
    { id: 2, candidate: "Aditya Agarwal", date: "2026-06-27", time: "02:30 PM", type: "System Design AI Proctored", interviewer: "Orchestrator Agent v4" },
    { id: 3, candidate: "Marcus Aurelius", date: "2026-06-28", time: "11:15 AM", type: "Behavioral & Leadership", interviewer: "HR Agent Sophia" }
  ]);
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleType, setScheduleType] = useState("Technical Round 1");

  // --- Platform Customizer Form States ---
  const [customizerSubTab, setCustomizerSubTab] = useState<"profile" | "features" | "qbank" | "aptitude" | "coding" | "interviewers" | "roadmap" | "import">("profile");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 1. User Profile Customizer States
  const [profName, setProfName] = useState(userName);
  const [profRole, setProfRole] = useState(userRole);
  const [profEmail, setProfEmail] = useState(userEmail);
  const [profXp, setProfXp] = useState(userXp);
  const [profStreak, setProfStreak] = useState(userStreak);
  const [profLevel, setProfLevel] = useState(userLevel);
  const [newBadge, setNewBadge] = useState("");
  const [profSalary, setProfSalary] = useState("$120,000");
  const [profIndustry, setProfIndustry] = useState("Technology");
  
  // --- Bulk Import States ---
  const [importTarget, setImportTarget] = useState<"qbank" | "aptitude" | "coding" | "interviewers">("qbank");
  const [importDragActive, setImportDragActive] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [conflictStrategy, setConflictStrategy] = useState<"append" | "overwrite">("append");
  const [schemaPreviewOpen, setSchemaPreviewOpen] = useState(true);

  // Helper function to parse CSV text
  const parseCSVText = (csvText: string) => {
    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return [];
    
    // Parse headers, strip quotes
    const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i];
      const values: string[] = [];
      let currentVal = "";
      let inQuotes = false;
      
      for (let c = 0; c < row.length; c++) {
        const char = row[c];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentVal.trim());
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());
      
      const obj: any = {};
      headers.forEach((header, index) => {
        let val = values[index] || "";
        val = val.replace(/^["']|["']$/g, '').trim();
        obj[header] = val;
      });
      results.push(obj);
    }
    return results;
  };

  const handleImportFileSelect = (file: File) => {
    setImportFile(file);
    setImportError(null);
    setImportData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setImportError("Empty file uploaded");
        return;
      }

      try {
        if (file.name.toLowerCase().endsWith(".json")) {
          const parsed = JSON.parse(text);
          const dataArray = Array.isArray(parsed) ? parsed : [parsed];
          if (dataArray.length === 0) {
            setImportError("JSON array is empty");
            return;
          }
          setImportData(dataArray);
        } else if (file.name.toLowerCase().endsWith(".csv")) {
          const parsed = parseCSVText(text);
          if (parsed.length === 0) {
            setImportError("No rows found in CSV (or empty header row)");
            return;
          }
          setImportData(parsed);
        } else {
          setImportError("Unsupported file type. Please upload a .json or .csv file.");
        }
      } catch (err: any) {
        setImportError("Parsing error: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    if (!importData || importData.length === 0) {
      setImportError("No parsed data to import");
      return;
    }

    try {
      if (importTarget === "qbank") {
        const normalized: QuestionItem[] = importData.map((item, idx) => ({
          id: item.id || `q-imported-${Date.now()}-${idx}`,
          text: item.text || item.question || "Untitled Question Prompt",
          company: item.company || "General",
          subject: item.subject || item.tag || "Core Concepts",
          round: (["Technical", "Behavioral", "Aptitude", "System Design"].includes(item.round) ? item.round : "Technical") as any,
          difficulty: (["Easy", "Medium", "Hard"].includes(item.difficulty) ? item.difficulty : "Medium") as any,
          role: item.role || "AI Engineer"
        }));

        if (conflictStrategy === "overwrite") {
          setQuestions(normalized);
        } else {
          setQuestions(prev => [...prev, ...normalized]);
        }
        triggerSaveMessage(`Successfully imported ${normalized.length} questions to Question Bank!`);
      } 
      else if (importTarget === "aptitude") {
        const normalized: AptitudeQuestion[] = importData.map((item, idx) => {
          let opts = ["A", "B", "C", "D"];
          if (Array.isArray(item.options)) {
            opts = item.options.map(String);
          } else if (typeof item.options === "string" && item.options.length > 0) {
            opts = item.options.split("|").map(o => o.trim());
          } else if (item.optionA || item.optionB) {
            opts = [item.optionA, item.optionB, item.optionC || "", item.optionD || ""].filter(Boolean);
          }

          return {
            id: item.id || `ap-imported-${Date.now()}-${idx}`,
            category: item.category || "General Aptitude",
            question: item.question || item.text || "Untitled Question Prompt",
            options: opts,
            correctIndex: isNaN(Number(item.correctIndex)) ? 0 : Number(item.correctIndex),
            explanation: item.explanation || "No explanation provided.",
            difficulty: (["Easy", "Medium", "Hard"].includes(item.difficulty) ? item.difficulty : "Medium") as any,
          };
        });

        if (conflictStrategy === "overwrite") {
          setAptitudeQuestions(normalized);
        } else {
          setAptitudeQuestions(prev => [...prev, ...normalized]);
        }
        triggerSaveMessage(`Successfully imported ${normalized.length} aptitude questions!`);
      }
      else if (importTarget === "coding") {
        const normalized: CodingProblem[] = importData.map((item, idx) => {
          let consts = ["Time Complexity: O(N)"];
          if (Array.isArray(item.constraints)) {
            consts = item.constraints.map(String);
          } else if (typeof item.constraints === "string" && item.constraints.length > 0) {
            consts = item.constraints.split("|").map(c => c.trim());
          }

          let starter = {
            javascript: `// Starter Code\nfunction solution() {\n  return null;\n}`,
            python: `# Starter Code\ndef solution():\n    return None`,
            typescript: `// Starter Code\nfunction solution(): any {\n  return null;\n}`
          };
          if (item.starterCodes) {
            if (typeof item.starterCodes === "object") {
              starter = { ...starter, ...item.starterCodes };
            } else {
              try {
                const parsedStarter = JSON.parse(item.starterCodes);
                starter = { ...starter, ...parsedStarter };
              } catch (e) {}
            }
          } else if (item.javascriptCode || item.pythonCode) {
            starter = {
              javascript: item.javascriptCode || starter.javascript,
              python: item.pythonCode || starter.python,
              typescript: item.typescriptCode || starter.typescript
            };
          }

          let tcs = [{ input: "[]", expected: "true" }];
          if (Array.isArray(item.testCases)) {
            tcs = item.testCases;
          } else if (typeof item.testCases === "string" && item.testCases.length > 0) {
            try {
              tcs = JSON.parse(item.testCases);
            } catch (e) {
              tcs = [{ input: "Standard input", expected: item.testCases }];
            }
          }

          return {
            id: item.id || `p-imported-${Date.now()}-${idx}`,
            title: item.title || "Untitled Coding Problem",
            difficulty: (["Easy", "Medium", "Hard"].includes(item.difficulty) ? item.difficulty : "Medium") as any,
            timeLimit: item.timeLimit || "1.0s",
            spaceLimit: item.spaceLimit || "256MB",
            description: item.description || "Describe the coding challenge here.",
            constraints: consts,
            starterCodes: starter,
            testCases: tcs,
            validatorCode: item.validatorCode || item.validatorCodeString || ""
          };
        });

        if (conflictStrategy === "overwrite") {
          setCodingProblems(normalized);
        } else {
          setCodingProblems(prev => [...prev, ...normalized]);
        }
        triggerSaveMessage(`Successfully imported ${normalized.length} coding challenges to sandbox!`);
      }
      else if (importTarget === "interviewers") {
        const normalized: InterviewerProfile[] = importData.map((item, idx) => ({
          id: item.id || `int-imported-${Date.now()}-${idx}`,
          name: item.name || "Dr. Anonymous Agent",
          role: item.role || item.designation || "AI Proctor",
          description: item.description || "Expert coaching proctor specialized in career diagnostics.",
          avatar: item.avatar || "👤"
        }));

        if (conflictStrategy === "overwrite") {
          setInterviewers(normalized);
        } else {
          setInterviewers(prev => [...prev, ...normalized]);
        }
        triggerSaveMessage(`Successfully imported ${normalized.length} mock interviewer proctors!`);
      }

      // Add XP & clean up
      onAddXp(250, "Bulk database update actioned");
      setImportFile(null);
      setImportData(null);
    } catch (err: any) {
      setImportError("Commit error: " + err.message);
    }
  };

  const getTemplateExampleText = () => {
    if (importTarget === "qbank") {
      return {
        json: `[
  {
    "text": "How do you explain the difference between L1 and L2 regularizations?",
    "company": "Google",
    "subject": "Machine Learning",
    "round": "Technical",
    "difficulty": "Medium",
    "role": "AI Specialist"
  }
]`,
        csv: `text,company,subject,round,difficulty,role
"How do you design a high-frequency trading database?","MetLife","Actuarial Database","System Design","Hard","Staff Engineer"
"Walk me through your most complex software architecture.","McKinsey","Engineering Frameworks","Behavioral","Medium","Consulting Lead"`
      };
    } else if (importTarget === "aptitude") {
      return {
        json: `[
  {
    "question": "If a train goes 60mph for 2 hours, what distance does it travel?",
    "category": "Quantitative Aptitude",
    "options": ["100 miles", "120 miles", "140 miles", "160 miles"],
    "correctIndex": 1,
    "explanation": "Distance = Speed * Time = 60 * 2 = 120 miles.",
    "difficulty": "Easy"
  }
]`,
        csv: `question,category,options,correctIndex,explanation,difficulty
"Solve 5x + 3 = 18 for x.","Quantitative Aptitude","1|2|3|4",2,"5x = 15 => x = 3. Choice 3 is index 2.","Easy"`
      };
    } else if (importTarget === "coding") {
      return {
        json: `[
  {
    "title": "Reverse String",
    "difficulty": "Easy",
    "timeLimit": "0.5s",
    "spaceLimit": "128MB",
    "description": "Reverse an array of characters in-place.",
    "constraints": ["O(1) extra memory"],
    "starterCodes": {
      "javascript": "function reverseString(s) {\\n  return s.reverse();\\n}",
      "python": "def reverseString(s):\\n    s.reverse()",
      "typescript": "function reverseString(s: string[]): void {\\n  s.reverse();\\n}"
    },
    "testCases": [
      { "input": "['h','e','l','l','o']", "expected": "['o','l','l','e','h']" }
    ],
    "validatorCode": "reverse"
  }
]`,
        csv: `title,difficulty,timeLimit,spaceLimit,description,constraints,validatorCode
"Palindrome Check","Easy","0.5s","64MB","Return true if word is a palindrome.","Case sensitive","reverse"`
      };
    } else {
      return {
        json: `[
  {
    "name": "Alex Miller",
    "role": "Staff Solutions Architect",
    "description": "Pragmatic, values solid system trade-offs and latency optimization.",
    "avatar": "💻"
  }
]`,
        csv: `name,role,description,avatar
"Sarah Connor","Tactical Advisor","Strict, focus on emergency protocol and failovers.","⚙️"
"Marcus Aurelius","Stoic Coach","Encouraging, philosophical approach.","🌸"`
      };
    }
  };

  // Sync profile values when they change from outer components
  useEffect(() => {
    setProfName(userName);
    setProfRole(userRole);
    setProfEmail(userEmail);
    setProfXp(userXp);
    setProfStreak(userStreak);
    setProfLevel(userLevel);
  }, [userName, userRole, userEmail, userXp, userStreak, userLevel]);

  // Load salary / industry if career roadmap exists
  useEffect(() => {
    const saved = localStorage.getItem("career_os_roadmap");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.salaryInsights?.marketRange) {
          setProfSalary(parsed.salaryInsights.marketRange);
        }
      } catch (err) {
        console.error("Failed to parse career roadmap in customizer", err);
      }
    }
  }, []);

  // 2. Question Bank Form States
  const [newQText, setNewQText] = useState("");
  const [newQCompany, setNewQCompany] = useState("");
  const [newQRole, setNewQRole] = useState("");
  const [newQDiff, setNewQDiff] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [newQRound, setNewQRound] = useState<"Technical" | "Behavioral" | "Aptitude" | "System Design">("Technical");
  const [newQSubject, setNewQSubject] = useState("");
  const [editingQId, setEditingQId] = useState<string | null>(null);

  // 3. Aptitude Question Form States
  const [newApQuestion, setNewApQuestion] = useState("");
  const [newApCat, setNewApCat] = useState("Quantitative Aptitude");
  const [newApDiff, setNewApDiff] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [newApOpt0, setNewApOpt0] = useState("");
  const [newApOpt1, setNewApOpt1] = useState("");
  const [newApOpt2, setNewApOpt2] = useState("");
  const [newApOpt3, setNewApOpt3] = useState("");
  const [newApCorrect, setNewApCorrect] = useState(0);
  const [newApExplanation, setNewApExplanation] = useState("");
  const [editingApId, setEditingApId] = useState<string | null>(null);

  // 4. Coding Sandbox Form States
  const [newCodeTitle, setNewCodeTitle] = useState("");
  const [newCodeDiff, setNewCodeDiff] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [newCodeTime, setNewCodeTime] = useState("O(n)");
  const [newCodeSpace, setNewCodeSpace] = useState("O(n)");
  const [newCodeDesc, setNewCodeDesc] = useState("");
  const [newCodeConsts, setNewCodeConsts] = useState("1 <= nums.length <= 10^5");
  const [newCodeValCode, setNewCodeValCode] = useState("");
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);

  // 5. Interviewer personality Form States
  const [newIntName, setNewIntName] = useState("");
  const [newIntRole, setNewIntRole] = useState("");
  const [newIntDesc, setNewIntDesc] = useState("");
  const [newIntAvatar, setNewIntAvatar] = useState("💻");
  const [editingIntId, setEditingIntId] = useState<string | null>(null);

  // 6. Roadmap / Career Gaps Form States
  const [roadmapData, setRoadmapData] = useState<any | null>(() => {
    const saved = localStorage.getItem("career_os_roadmap");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("");
  const [newMilestoneObj, setNewMilestoneObj] = useState("");
  const [newSkillGap, setNewSkillGap] = useState("");

  const triggerSaveMessage = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };

  // --- Platform Customizer Submit Handlers ---
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(profName);
    setUserRole(profRole);
    setUserEmail(profEmail);
    setUserXp(Number(profXp));
    setUserStreak(Number(profStreak));
    setUserLevel(Number(profLevel));
    
    // Update active salary in roadmap if it exists
    const saved = localStorage.getItem("career_os_roadmap");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.salaryInsights = parsed.salaryInsights || {};
        parsed.salaryInsights.marketRange = profSalary;
        localStorage.setItem("career_os_roadmap", JSON.stringify(parsed));
        setRoadmapData(parsed);
      } catch {}
    }
    triggerSaveMessage("Candidate Profile and Stats updated successfully!");
    onAddXp(30, "Updated platform candidate profile");
  };

  const handleAddBadge = () => {
    if (!newBadge.trim()) return;
    if (userBadges.includes(newBadge.trim())) {
      triggerSaveMessage("Badge already awarded!");
      return;
    }
    setUserBadges([...userBadges, newBadge.trim()]);
    setNewBadge("");
    triggerSaveMessage("New Badge awarded to candidate!");
  };

  const handleRemoveBadge = (badgeName: string) => {
    setUserBadges(userBadges.filter(b => b !== badgeName));
    triggerSaveMessage("Badge removed from candidate!");
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;

    if (editingQId) {
      const updated = questions.map(q => q.id === editingQId ? {
        ...q,
        text: newQText,
        company: newQCompany,
        role: newQRole,
        difficulty: newQDiff,
        round: newQRound,
        subject: newQSubject
      } : q);
      setQuestions(updated);
      localStorage.setItem("aicos_questions", JSON.stringify(updated));
      setEditingQId(null);
      triggerSaveMessage("Question edited successfully!");
    } else {
      const newQuestion: QuestionItem = {
        id: `qb-${Date.now()}`,
        text: newQText,
        company: newQCompany || "General",
        role: newQRole || "Software Engineer",
        difficulty: newQDiff,
        round: newQRound,
        subject: newQSubject || "General Technical"
      };
      const updated = [newQuestion, ...questions];
      setQuestions(updated);
      localStorage.setItem("aicos_questions", JSON.stringify(updated));
      triggerSaveMessage("New question added to Question Bank!");
    }

    // Reset inputs
    setNewQText("");
    setNewQCompany("");
    setNewQRole("");
    setNewQDiff("Medium");
    setNewQRound("Technical");
    setNewQSubject("");
  };

  const handleEditQuestionClick = (q: QuestionItem) => {
    setEditingQId(q.id);
    setNewQText(q.text);
    setNewQCompany(q.company);
    setNewQRole(q.role);
    setNewQDiff(q.difficulty);
    setNewQRound(q.round);
    setNewQSubject(q.subject);
    triggerSaveMessage("Loading question into form fields...");
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    localStorage.setItem("aicos_questions", JSON.stringify(updated));
    triggerSaveMessage("Question removed from Question Bank.");
  };

  const handleSaveAptitude = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApQuestion.trim() || !newApOpt0.trim() || !newApOpt1.trim()) return;

    const options = [newApOpt0, newApOpt1, newApOpt2 || "", newApOpt3 || ""].filter(Boolean);

    if (editingApId) {
      const updated = aptitudeQuestions.map(q => q.id === editingApId ? {
        ...q,
        question: newApQuestion,
        category: newApCat,
        difficulty: newApDiff,
        options,
        correctIndex: newApCorrect,
        explanation: newApExplanation
      } : q);
      setAptitudeQuestions(updated);
      localStorage.setItem("aicos_aptitude_questions", JSON.stringify(updated));
      setEditingApId(null);
      triggerSaveMessage("Aptitude question edited successfully!");
    } else {
      const newAp: AptitudeQuestion = {
        id: `q-quant-${Date.now()}`,
        question: newApQuestion,
        category: newApCat,
        difficulty: newApDiff,
        options,
        correctIndex: newApCorrect,
        explanation: newApExplanation || "Direct mathematical reasoning solution."
      };
      const updated = [newAp, ...aptitudeQuestions];
      setAptitudeQuestions(updated);
      localStorage.setItem("aicos_aptitude_questions", JSON.stringify(updated));
      triggerSaveMessage("New aptitude test question added!");
    }

    setNewApQuestion("");
    setNewApOpt0("");
    setNewApOpt1("");
    setNewApOpt2("");
    setNewApOpt3("");
    setNewApCorrect(0);
    setNewApExplanation("");
  };

  const handleEditAptitudeClick = (q: AptitudeQuestion) => {
    setEditingApId(q.id);
    setNewApQuestion(q.question);
    setNewApCat(q.category);
    setNewApDiff(q.difficulty);
    setNewApOpt0(q.options[0] || "");
    setNewApOpt1(q.options[1] || "");
    setNewApOpt2(q.options[2] || "");
    setNewApOpt3(q.options[3] || "");
    setNewApCorrect(q.correctIndex);
    setNewApExplanation(q.explanation);
    triggerSaveMessage("Loading aptitude question into editor...");
  };

  const handleDeleteAptitude = (id: string) => {
    const updated = aptitudeQuestions.filter(q => q.id !== id);
    setAptitudeQuestions(updated);
    localStorage.setItem("aicos_aptitude_questions", JSON.stringify(updated));
    triggerSaveMessage("Aptitude question deleted.");
  };

  const handleSaveCodingProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeTitle.trim() || !newCodeDesc.trim()) return;

    const constraints = newCodeConsts.split("\n").map(c => c.trim()).filter(Boolean);

    // Provide default codes if they are blank
    const starterCodes = {
      javascript: `function ${newCodeTitle.replace(/\s+/g, "")}(/* params */) {\n  // Write your code here\n}`,
      python: `def ${newCodeTitle.toLowerCase().replace(/\s+/g, "_")}(/* params */):\n    # Write your code here\n    pass`,
      typescript: `function ${newCodeTitle.replace(/\s+/g, "")}(/* params */) {\n  // Write your code here\n}`
    };

    if (editingCodeId) {
      const updated = codingProblems.map(p => p.id === editingCodeId ? {
        ...p,
        title: newCodeTitle,
        difficulty: newCodeDiff,
        timeLimit: newCodeTime,
        spaceLimit: newCodeSpace,
        description: newCodeDesc,
        constraints,
        validatorCode: newCodeValCode
      } : p);
      setCodingProblems(updated);
      localStorage.setItem("aicos_coding_problems", JSON.stringify(updated));
      setEditingCodeId(null);
      triggerSaveMessage("Coding challenge edited successfully!");
    } else {
      const newProb: CodingProblem = {
        id: `p-${Date.now()}`,
        title: newCodeTitle,
        difficulty: newCodeDiff,
        timeLimit: newCodeTime,
        spaceLimit: newCodeSpace,
        description: newCodeDesc,
        constraints,
        starterCodes,
        testCases: [
          { input: "Custom test case input 1", output: "output 1" }
        ],
        validatorCode: newCodeValCode
      };
      const updated = [...codingProblems, newProb];
      setCodingProblems(updated);
      localStorage.setItem("aicos_coding_problems", JSON.stringify(updated));
      triggerSaveMessage("New Coding Sandbox challenge added!");
    }

    setNewCodeTitle("");
    setNewCodeDesc("");
    setNewCodeConsts("1 <= nums.length <= 10^5");
    setNewCodeValCode("");
  };

  const handleEditCodingClick = (p: CodingProblem) => {
    setEditingCodeId(p.id);
    setNewCodeTitle(p.title);
    setNewCodeDiff(p.difficulty);
    setNewCodeTime(p.timeLimit);
    setNewCodeSpace(p.spaceLimit);
    setNewCodeDesc(p.description);
    setNewCodeConsts(p.constraints.join("\n"));
    setNewCodeValCode(p.validatorCode || "");
    triggerSaveMessage("Loading challenge parameters...");
  };

  const handleDeleteCoding = (id: string) => {
    const updated = codingProblems.filter(p => p.id !== id);
    setCodingProblems(updated);
    localStorage.setItem("aicos_coding_problems", JSON.stringify(updated));
    triggerSaveMessage("Coding challenge removed.");
  };

  const handleSaveInterviewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntName.trim() || !newIntRole.trim()) return;

    if (editingIntId) {
      const updated = interviewers.map(i => i.id === editingIntId ? {
        ...i,
        name: newIntName,
        role: newIntRole,
        description: newIntDesc,
        avatar: newIntAvatar
      } : i);
      setInterviewers(updated);
      localStorage.setItem("aicos_interviewers", JSON.stringify(updated));
      setEditingIntId(null);
      triggerSaveMessage("Interviewer profile edited successfully!");
    } else {
      const newInt: InterviewerProfile = {
        id: `inter-${Date.now()}` as any,
        name: newIntName,
        role: newIntRole,
        description: newIntDesc || "Enterprise evaluator proctor.",
        avatar: newIntAvatar
      };
      const updated = [...interviewers, newInt];
      setInterviewers(updated);
      localStorage.setItem("aicos_interviewers", JSON.stringify(updated));
      triggerSaveMessage("New mock interviewer added!");
    }

    setNewIntName("");
    setNewIntRole("");
    setNewIntDesc("");
    setNewIntAvatar("💻");
  };

  const handleEditIntClick = (i: InterviewerProfile) => {
    setEditingIntId(i.id);
    setNewIntName(i.name);
    setNewIntRole(i.role);
    setNewIntDesc(i.description);
    setNewIntAvatar(i.avatar);
    triggerSaveMessage("Interviewer profile loaded.");
  };

  const handleDeleteInt = (id: any) => {
    const updated = interviewers.filter(i => i.id !== id);
    setInterviewers(updated);
    localStorage.setItem("aicos_interviewers", JSON.stringify(updated));
    triggerSaveMessage("Interviewer profile deleted.");
  };

  const handleAddRoadmapMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapData || !newMilestoneTitle.trim()) {
      triggerSaveMessage("No active career roadmap. Please generate a Career Roadmap first!");
      return;
    }

    const newMilestone = {
      title: newMilestoneTitle,
      duration: "Week 4-6",
      completedObjectives: [],
      objectives: newMilestoneObj ? newMilestoneObj.split("\n").map(o => o.trim()).filter(Boolean) : ["Complete skill practice exercises"]
    };

    const updatedMilestones = [...(roadmapData.learningMilestones || []), newMilestone];
    const updated = { ...roadmapData, learningMilestones: updatedMilestones };
    setRoadmapData(updated);
    localStorage.setItem("career_os_roadmap", JSON.stringify(updated));
    
    setNewMilestoneTitle("");
    setNewMilestoneDesc("");
    setNewMilestoneObj("");
    triggerSaveMessage("Added custom learning roadmap milestone!");
  };

  const handleAddSkillGap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapData || !newSkillGap.trim()) return;

    const newGap = {
      skill: newSkillGap,
      impact: "Critical Match Key",
      isCompleted: false,
      resources: ["AICOS Sandbox Practice"]
    };

    const updatedGaps = [...(roadmapData.skillGaps || []), newGap];
    const updated = { ...roadmapData, skillGaps: updatedGaps };
    setRoadmapData(updated);
    localStorage.setItem("career_os_roadmap", JSON.stringify(updated));
    
    setNewSkillGap("");
    triggerSaveMessage("Added skill gap item to Candidate's active tracker!");
  };

  const handleDeleteMilestone = (index: number) => {
    if (!roadmapData) return;
    const updatedMilestones = roadmapData.learningMilestones.filter((_: any, idx: number) => idx !== index);
    const updated = { ...roadmapData, learningMilestones: updatedMilestones };
    setRoadmapData(updated);
    localStorage.setItem("career_os_roadmap", JSON.stringify(updated));
    triggerSaveMessage("Milestone removed from learning plan.");
  };

  const handleToggleCompare = (id: string) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(item => item !== id));
    } else {
      if (compareList.length >= 3) {
        alert("You can compare up to 3 candidates simultaneously for optimal scorecard alignment.");
        return;
      }
      setCompareList([...compareList, id]);
    }
  };

  const handleRunScreeningAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenedFileName) return;

    setIsScreening(true);
    setTimeout(() => {
      const generatedResult = {
        name: screenedFileName.split(".")[0].replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        roleMatch: "Full Stack Engineer",
        overallScore: Math.floor(Math.random() * 18) + 80, // 80 to 97
        atsScore: Math.floor(Math.random() * 15) + 83,
        gaps: [
          "Needs deeper experience with distributed system patterns (Event sourcing/Sagas)",
          "Resume formatting utilizes nested columns which might slightly hinder raw legacy parsers."
        ],
        strengths: [
          "Superb proficiency in modern typescript architectures (React 18, Vite, ESBuild, custom Node wrappers)",
          "Demonstrates strong background with direct AI integration engineering and multi-agent systems."
        ],
        recommendation: "Highly Recommended. Automatically schedule for Technical Practice round."
      };
      setScreeningResult(generatedResult);
      setIsScreening(false);

      // Add as new candidate
      const newCand = {
        id: `cand-${Date.now()}`,
        name: generatedResult.name,
        role: generatedResult.roleMatch,
        experience: "3-5 Years",
        resumeMatch: generatedResult.overallScore,
        atsStatus: "Pre-screened",
        interviewScore: Math.floor(Math.random() * 20) + 75,
        avatarColor: "bg-rose-500",
        email: `${generatedResult.name.toLowerCase().replace(/\s/g, "")}@candidate-aicos.net`,
        skills: ["TypeScript", "React", "Node.js", "AI Integrations", "System Design"],
        scorecard: { technical: Math.floor(Math.random() * 20) + 80, communication: Math.floor(Math.random() * 20) + 80, logical: Math.floor(Math.random() * 20) + 80, matching: generatedResult.overallScore },
        appliedDate: new Date().toISOString().split('T')[0],
        avatarInitial: generatedResult.name.split(" ").map(n => n[0]).join("")
      };

      setCandidates([newCand, ...candidates]);
      setSelectedCandidate(newCand);
      onAddXp(120, "Screened Candidate with RecruitAI");
    }, 1800);
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleName || !scheduleDate || !scheduleTime) return;

    const newInterview = {
      id: Date.now(),
      candidate: scheduleName,
      date: scheduleDate,
      time: scheduleTime,
      type: scheduleType,
      interviewer: "RecruitAI Auto-scheduler Agent"
    };

    setScheduledInterviews([...scheduledInterviews, newInterview]);
    setScheduleName("");
    setScheduleDate("");
    setScheduleTime("");
    onAddXp(50, "Auto-Scheduled Candidate Interview Session");
  };

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cand.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cand.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "All" || cand.atsStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Title & Pitch Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-950 to-brand-950 p-6 rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-brand-500/20 text-brand-400 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-brand-500/30 flex items-center gap-1.5">
              <Sparkles size={11} className="animate-pulse" />
              RecruitAI Platform
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-black text-white tracking-tight">
            Enterprise Candidate Dashboard
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl font-medium">
            Deploy cognitive screening agents, analyze AI interview transcripts, score portfolios automatically, and run comprehensive side-by-side ATS candidate scoring pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <button 
            onClick={() => {
              setCandidates(INITIAL_CANDIDATES);
              onAddXp(20, "Reset Sandbox Candidates Database");
            }}
            className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition cursor-pointer flex items-center gap-2"
          >
            <RefreshCw size={13} /> Reset Mock Database
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 max-w-xl">
        <button
          onClick={() => setActiveSubTab("dashboard")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === "dashboard"
              ? "bg-white text-slate-900 shadow-sm font-bold border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users size={14} /> Candidates Portal
        </button>
        <button
          onClick={() => setActiveSubTab("screening")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === "screening"
              ? "bg-white text-slate-900 shadow-sm font-bold border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles size={14} /> Resume Screening AI
        </button>
        <button
          onClick={() => setActiveSubTab("comparison")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === "comparison"
              ? "bg-white text-slate-900 shadow-sm font-bold border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award size={14} /> Scorecard Matcher
        </button>
        <button
          onClick={() => setActiveSubTab("scheduler")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === "scheduler"
              ? "bg-white text-slate-900 shadow-sm font-bold border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar size={14} /> Smart Scheduler
        </button>
        <button
          onClick={() => setActiveSubTab("customizer")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeSubTab === "customizer"
              ? "bg-white text-slate-900 shadow-sm font-bold border border-slate-200/50"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sliders size={14} /> Platform UI Customizer
        </button>
      </div>

      {/* CONTENT SWITCHBOARDS */}
      <AnimatePresence mode="wait">
        {activeSubTab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Candidates Pipeline List & Analytics Summary */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Analytics Mini-Dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Users size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Evaluated</h4>
                    <p className="text-lg font-extrabold text-slate-800 font-mono">{candidates.length} Applicants</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Avg. Resume Fit</h4>
                    <p className="text-lg font-extrabold text-slate-800 font-mono">
                      {(candidates.reduce((acc, c) => acc + c.resumeMatch, 0) / candidates.length).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">AI Recommendation</h4>
                    <p className="text-lg font-extrabold text-slate-800 font-mono">2 Candidates</p>
                  </div>
                </div>
              </div>

              {/* Main List Filter & Controls */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 shrink-0">
                    Pipeline Candidates
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                      {filteredCandidates.length}
                    </span>
                  </h3>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Search Field */}
                    <div className="relative w-full sm:w-60">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search candidates, skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
                      />
                    </div>

                    {/* Status Dropdown */}
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none"
                      >
                        <option value="All">All Stages</option>
                        <option value="Pre-screened">Pre-screened</option>
                        <option value="Interview Scheduled">Scheduled</option>
                        <option value="Screening">Screening</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Candidate Rows Container */}
                <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  {filteredCandidates.length === 0 ? (
                    <div className="p-12 text-center space-y-2 border border-dashed border-slate-200 rounded-xl">
                      <Users size={28} className="mx-auto text-slate-300" />
                      <h4 className="text-xs font-bold text-slate-600">No candidates found</h4>
                      <p className="text-[10px] text-slate-400">Try loosening your search terms or filters</p>
                    </div>
                  ) : (
                    filteredCandidates.map(cand => {
                      const isSelected = selectedCandidate?.id === cand.id;
                      const isComparing = compareList.includes(cand.id);

                      return (
                        <div
                          key={cand.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition gap-3 ${
                            isSelected 
                              ? "bg-slate-50 border-brand-500/40 shadow-sm" 
                              : "bg-white border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div 
                            className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                            onClick={() => setSelectedCandidate(cand)}
                          >
                            <div className={`w-9 h-9 rounded-xl ${cand.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-inner shrink-0`}>
                              {cand.avatarInitial}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-800 hover:text-brand-600 transition truncate">{cand.name}</h4>
                                <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0">
                                  {cand.experience}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5">{cand.role}</p>
                              
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                {cand.skills.slice(0, 3).map(skill => (
                                  <span key={skill} className="text-[8px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.2 rounded-md">
                                    {skill}
                                  </span>
                                ))}
                                {cand.skills.length > 3 && (
                                  <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.2 rounded-md">
                                    +{cand.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-50">
                            {/* Score info */}
                            <div className="text-right sm:mr-3">
                              <span className="text-[9px] font-bold text-slate-400 block uppercase">ATS Score</span>
                              <span className={`text-xs font-black font-mono ${
                                cand.resumeMatch >= 90 ? "text-emerald-600" : cand.resumeMatch >= 80 ? "text-brand-600" : "text-amber-600"
                              }`}>
                                {cand.resumeMatch}% Match
                              </span>
                            </div>

                            {/* Actions Group */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleCompare(cand.id)}
                                className={`p-1.5 rounded-lg border text-[10px] font-extrabold transition cursor-pointer ${
                                  isComparing
                                    ? "bg-rose-50 text-rose-600 border-rose-200"
                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                }`}
                                title={isComparing ? "Remove from side-by-side comparison" : "Add to side-by-side scorecard"}
                              >
                                {isComparing ? "Comparing" : "+ Compare"}
                              </button>
                              <button
                                onClick={() => setSelectedCandidate(cand)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer"
                                title="View Candidate Profile"
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Weekly Flow Chart Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Hiring Velocity Insights</h3>
                  <h2 className="text-sm font-bold text-slate-800 mt-1">Application Flow & Interview Pipelines</h2>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ANALYTICS_DATA}>
                      <defs>
                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSched" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                      <Area type="monotone" dataKey="applications" stroke="#0284c7" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" name="Submissions" />
                      <Area type="monotone" dataKey="scheduled" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorSched)" name="Mock Interviews" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Candidate Detailed View */}
            <div className="space-y-6">
              {selectedCandidate ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                  {/* Candidate Identity card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${selectedCandidate.avatarColor} text-white flex items-center justify-center font-bold text-base shadow-inner`}>
                        {selectedCandidate.avatarInitial}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{selectedCandidate.name}</h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{selectedCandidate.role}</p>
                        <span className="text-[9px] text-slate-400 font-bold block mt-1">{selectedCandidate.email}</span>
                      </div>
                    </div>

                    <span className="bg-brand-50 text-brand-700 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-brand-100">
                      {selectedCandidate.atsStatus}
                    </span>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Core Metrics Radar Matrix */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Candidate Scorecard Breakdown</h4>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[9px] font-bold text-slate-400 block">Technical Depth</span>
                        <span className="text-base font-black text-slate-800 font-mono">{selectedCandidate.scorecard.technical}%</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[9px] font-bold text-slate-400 block">Communication Analysis</span>
                        <span className="text-base font-black text-slate-800 font-mono">{selectedCandidate.scorecard.communication}%</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[9px] font-bold text-slate-400 block">Logical & Aptitude</span>
                        <span className="text-base font-black text-slate-800 font-mono">{selectedCandidate.scorecard.logical}%</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <span className="text-[9px] font-bold text-slate-400 block">Resume Match Score</span>
                        <span className="text-base font-black text-slate-800 font-mono">{selectedCandidate.scorecard.matching}%</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Complete details & Skills */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Skills & Experience Matrix</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills.map(skill => (
                        <span key={skill} className="bg-slate-50 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-100">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="bg-brand-50/40 p-3.5 rounded-xl border border-brand-100/50 space-y-1.5 mt-2">
                      <span className="text-[9px] font-black text-brand-700 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={11} className="text-brand-500 shrink-0" /> Matcher AI Recommendation
                      </span>
                      <p className="text-[10.5px] text-brand-900 leading-relaxed font-semibold">
                        {selectedCandidate.resumeMatch >= 92 
                          ? "Outstanding match alignment. Skill matrix covers all crucial infrastructure pillars. Recommended for direct HR fast-track evaluation."
                          : "Solid match. Gap in advanced Distributed System concepts. Good candidates for standard Technical and System Design simulation pipelines."
                        }
                      </p>
                    </div>
                  </div>

                  {/* Delete Candidate */}
                  <button
                    onClick={() => {
                      setCandidates(candidates.filter(c => c.id !== selectedCandidate.id));
                      setSelectedCandidate(candidates.filter(c => c.id !== selectedCandidate.id)[0] || null);
                      onAddXp(20, "Deleted mock applicant profile");
                    }}
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} /> Delete Applicant
                  </button>
                </div>
              ) : (
                <div className="bg-white p-8 text-center rounded-2xl border border-slate-200/80 shadow-sm py-16">
                  <Users size={32} className="mx-auto text-slate-300" />
                  <h4 className="text-xs font-bold text-slate-600 mt-3">No candidate selected</h4>
                  <p className="text-[10px] text-slate-400">Click a candidate in the pipeline to examine details</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Screening AI Module */}
        {activeSubTab === "screening" && (
          <motion.div
            key="screening"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Screening Setup */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 lg:col-span-1">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-brand-600 tracking-wider">Automate Resume Parsing</span>
                <h3 className="text-sm font-bold text-slate-800">Cognitive Screening Agent</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Upload a PDF resume to invoke a cognitive screening agent. The agent parses ATS elements and adds scores dynamically to the matching pipeline.
                </p>
              </div>

              <form onSubmit={handleRunScreeningAI} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Candidate Resume Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John_Doe_Resume.pdf"
                    value={screenedFileName}
                    onChange={(e) => setScreenedFileName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition font-mono"
                  />
                </div>

                <div className="border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 p-6 rounded-xl text-center cursor-pointer transition relative">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setScreenedFile(e.target.files[0]);
                        setScreenedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <Users size={20} className="mx-auto text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700 block">Drag & drop resume PDF</span>
                  <span className="text-[9px] text-slate-400 block mt-1">or click to browse local folders</span>
                </div>

                <button
                  type="submit"
                  disabled={!screenedFileName || isScreening}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isScreening ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" /> Analyzing Document...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} /> Run Screening Agent
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Screening Results Panel */}
            <div className="lg:col-span-2 space-y-6">
              {screeningResult ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border border-emerald-100">
                        Screening Complete
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 mt-2">{screeningResult.name}</h3>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Matched Target: {screeningResult.roleMatch}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Overall Match Score</span>
                      <span className="text-2xl font-black font-mono text-emerald-600">{screeningResult.overallScore}%</span>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-xl space-y-2">
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Identified Strengths
                      </h4>
                      <ul className="space-y-1.5">
                        {screeningResult.strengths.map((str: string, idx: number) => (
                          <li key={idx} className="text-[10.5px] text-slate-600 font-semibold leading-relaxed flex items-start gap-1.5">
                            <span className="text-emerald-500 shrink-0 select-none">•</span> {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50/30 border border-amber-100 p-4 rounded-xl space-y-2">
                      <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldAlert size={13} /> Gaps & Formatting Flags
                      </h4>
                      <ul className="space-y-1.5">
                        {screeningResult.gaps.map((gap: string, idx: number) => (
                          <li key={idx} className="text-[10.5px] text-slate-600 font-semibold leading-relaxed flex items-start gap-1.5">
                            <span className="text-amber-500 shrink-0 select-none">•</span> {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">System Recommendation</span>
                    <p className="text-[11px] font-bold text-slate-700">{screeningResult.recommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 shadow-sm py-28 space-y-3">
                  <Sparkles size={36} className="mx-auto text-brand-500 animate-pulse" />
                  <h4 className="text-xs font-bold text-slate-600">Cognitive Screening Agent Idle</h4>
                  <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
                    Fill candidate details or drag a PDF resume to initiate matching analytics and candidate comparisons.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Scorecard Comparison Tool */}
        {activeSubTab === "comparison" && (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800">Side-by-Side Candidate Scorecard Alignment</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Select candidates from the dashboard to align their structured metrics, ATS parser matching, and mock scores side-by-side.
              </p>

              {compareList.length < 2 ? (
                <div className="mt-6 p-8 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
                  <Users size={24} className="mx-auto text-slate-300" />
                  <h4 className="text-xs font-bold text-slate-600">Select more candidates</h4>
                  <p className="text-[10px] text-slate-400">At least 2 candidates must be checked on the primary dashboard to compare scorecard details.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {compareList.map(cid => {
                    const cand = candidates.find(c => c.id === cid);
                    if (!cand) return null;

                    return (
                      <div key={cand.id} className="bg-slate-50/50 p-5 rounded-xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${cand.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                            {cand.avatarInitial}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 truncate">{cand.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{cand.role}</p>
                          </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Bar charts or linear meters for core dimensions */}
                        <div className="space-y-3.5">
                          <div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                              <span>Technical Skill Depth</span>
                              <span className="font-mono text-slate-800 font-extrabold">{cand.scorecard.technical}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-brand-500 h-full rounded-full" style={{ width: `${cand.scorecard.technical}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                              <span>Communication Analysis</span>
                              <span className="font-mono text-slate-800 font-extrabold">{cand.scorecard.communication}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-full rounded-full" style={{ width: `${cand.scorecard.communication}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                              <span>Logical & Aptitude</span>
                              <span className="font-mono text-slate-800 font-extrabold">{cand.scorecard.logical}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${cand.scorecard.logical}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-1">
                              <span>Resume Match Score</span>
                              <span className="font-mono text-slate-800 font-extrabold">{cand.scorecard.matching}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${cand.scorecard.matching}%` }} />
                            </div>
                          </div>
                        </div>

                        <hr className="border-slate-100" />

                        <div className="space-y-1 text-center">
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">Estimated Match Status</span>
                          <span className="text-xs font-black text-slate-800">
                            {cand.resumeMatch >= 92 ? "🏆 Prime Fit Candidate" : "✅ Highly Capable Alternative"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Smart Scheduler & Interview Planner */}
        {activeSubTab === "scheduler" && (
          <motion.div
            key="scheduler"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Auto Schedule Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 lg:col-span-1">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-purple-600 tracking-wider">AI Interview Planner</span>
                <h3 className="text-sm font-bold text-slate-800">Schedule Evaluation Round</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Designate cognitive agent proctors or panel proctors to interview the candidate. Automatically schedules slots aligned with ATS pipelines.
                </p>
              </div>

              <form onSubmit={handleScheduleInterview} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Candidate Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditya Agarwal"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Date</label>
                    <input
                      type="date"
                      required
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00 AM"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Interview Focus Type</label>
                  <select
                    value={scheduleType}
                    onChange={(e) => setScheduleType(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-700"
                  >
                    <option value="Technical Round 1">Technical Round 1</option>
                    <option value="System Design Proctored">System Design Proctored</option>
                    <option value="HR & Cultural Assessment">HR & Cultural Assessment</option>
                    <option value="Case Study & Product Strategy">Case Study & Product Strategy</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus size={13} /> Auto-Schedule Slot
                </button>
              </form>
            </div>

            {/* Visual Schedule Timeline List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  Scheduled Pipeline Calendars
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full font-mono">
                    {scheduledInterviews.length}
                  </span>
                </h3>

                <div className="space-y-3">
                  {scheduledInterviews.map((inter) => (
                    <div key={inter.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-brand-50 text-brand-600 border border-brand-100 rounded-xl flex items-center justify-center shrink-0">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{inter.candidate}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Interviewer: {inter.interviewer}</span>
                          <span className="text-[9px] bg-purple-50 text-purple-600 font-extrabold px-1.5 py-0.5 rounded-md inline-block mt-1">
                            {inter.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-800 block">{inter.date}</span>
                          <span className="text-[9px] text-slate-400 block font-bold">{inter.time}</span>
                        </div>

                        <button
                          onClick={() => setScheduledInterviews(scheduledInterviews.filter(i => i.id !== inter.id))}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition cursor-pointer"
                          title="Cancel scheduled slot"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Platform Content Customizer - Fully Editable Console */}
        {activeSubTab === "customizer" && (
          <motion.div
            key="customizer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.22 }}
            className="space-y-6"
          >
            {/* Customizer Subtabs & Info Header */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-brand-600 tracking-wider">Platform Administration Console</span>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Sliders className="text-brand-500 shrink-0" size={18} /> Complete Platform Customizer
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Modify active candidate variables, add or edit Question Bank queries, customize aptitude exams, code sandbox tests, mock interviewer proctors, and roadmap paths in real-time.
                  </p>
                </div>
                
                {/* Save Feedback Alerts */}
                <AnimatePresence>
                  {saveMessage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shrink-0"
                    >
                      <Check className="text-emerald-600 animate-bounce" size={14} /> {saveMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Secondary Navigation Row */}
              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {[
                  { id: "profile", label: "User Profile & Stats", icon: User },
                  { id: "features", label: "Feature Visibility", icon: Eye },
                  { id: "qbank", label: "Question Bank", icon: Database },
                  { id: "aptitude", label: "Aptitude Tests", icon: HelpCircle },
                  { id: "coding", label: "Coding Challenges", icon: FileCode },
                  { id: "interviewers", label: "Interviewer Proctors", icon: Users },
                  { id: "roadmap", label: "Roadmap Milestones", icon: Trello },
                  { id: "import", label: "Bulk Upload Hub", icon: Upload }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setCustomizerSubTab(sub.id as any);
                      setEditingQId(null);
                      setEditingApId(null);
                      setEditingCodeId(null);
                      setEditingIntId(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                      customizerSubTab === sub.id
                        ? "bg-slate-900 text-white border-slate-950"
                        : "bg-slate-50 text-slate-500 hover:text-slate-800 border-slate-200/50"
                    }`}
                  >
                    <sub.icon size={13} />
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-tab 1: USER PROFILE & STATS CUSTOMIZATION */}
            {customizerSubTab === "profile" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    Edit Active Candidate Profile & Experience points
                  </h4>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Candidate Name</label>
                        <input
                          type="text"
                          required
                          value={profName}
                          onChange={(e) => setProfName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Target Role / Designation</label>
                        <input
                          type="text"
                          required
                          value={profRole}
                          onChange={(e) => setProfRole(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Candidate Email Address</label>
                        <input
                          type="email"
                          required
                          value={profEmail}
                          onChange={(e) => setProfEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Roadmap Salary Target</label>
                        <input
                          type="text"
                          required
                          value={profSalary}
                          onChange={(e) => setProfSalary(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                          placeholder="e.g. $120,000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">XP Level</label>
                        <input
                          type="number"
                          required
                          value={profLevel}
                          onChange={(e) => setProfLevel(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Current XP Points</label>
                        <input
                          type="number"
                          required
                          value={profXp}
                          onChange={(e) => setProfXp(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Daily Streak (Days)</label>
                        <input
                          type="number"
                          required
                          value={profStreak}
                          onChange={(e) => setProfStreak(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-bold"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 size={14} /> Update Core Candidate Profile
                    </button>
                  </form>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Award className="text-yellow-500" size={14} /> Candidate Badges List
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Award or remove special achievement badges that appear directly on the Candidate's main dashboard.
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {userBadges.map(b => (
                      <span
                        key={b}
                        className="bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-extrabold px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        {b}
                        <button
                          onClick={() => handleRemoveBadge(b)}
                          className="text-rose-500 hover:text-rose-700 font-bold ml-1 text-xs shrink-0"
                          title="Revoke badge"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Award New Achievement Badge</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. SQL Overlord"
                        value={newBadge}
                        onChange={(e) => setNewBadge(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        onClick={handleAddBadge}
                        className="px-3 bg-brand-600 text-white font-bold text-xs rounded-lg hover:bg-brand-700 transition"
                      >
                        Award
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 1.5: FEATURE VISIBILITY CONTROL HUB */}
            {customizerSubTab === "features" && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3 text-left">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    🛠️ Candidate App Feature Controls
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Toggle individual application modules on or off for the end-user (candidate) UI. Disabled features will be hidden from their navigation sidebar, dashboard tiles, and mobile menu in real-time.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      id: "dashboard",
                      label: "Dashboard Hub",
                      desc: "The primary entry point displaying career stats, active tasks, metrics, and AI recommendations.",
                      icon: LayoutDashboard,
                      color: "text-indigo-600 bg-indigo-50"
                    },
                    {
                      id: "upload",
                      label: "Document Center",
                      desc: "Allows candidates to upload resumes and cover letters for automated profile scanning.",
                      icon: FileText,
                      color: "text-amber-600 bg-amber-50"
                    },
                    {
                      id: "mentor",
                      label: "AI Mentor & Tutor",
                      desc: "Generative AI conversational partner for system designs, resume tips, and career counseling.",
                      icon: MessageSquare,
                      color: "text-sky-600 bg-sky-50"
                    },
                    {
                      id: "assessment",
                      label: "Aptitude Tests",
                      desc: "Interactive custom-tailored logical reasoning, quantitative, and situational aptitude exams.",
                      icon: Award,
                      color: "text-emerald-600 bg-emerald-50"
                    },
                    {
                      id: "questionbank",
                      label: "Question Bank",
                      desc: "A rich catalog of system design, backend, frontend, behavioral, and architectural queries.",
                      icon: BookOpen,
                      color: "text-blue-600 bg-blue-50"
                    },
                    {
                      id: "coding",
                      label: "Coding Sandbox",
                      desc: "Full online compiler and problem solving interface for algorithm and database mock challenges.",
                      icon: Terminal,
                      color: "text-violet-600 bg-violet-50"
                    },
                    {
                      id: "setup",
                      label: "Mock Simulation Setup",
                      desc: "Configurator for launching custom face-to-face simulated video/audio proctored assessments.",
                      icon: Play,
                      color: "text-rose-600 bg-rose-50"
                    },
                    {
                      id: "roadmap",
                      label: "Career Roadmap",
                      desc: "Visual interactive learning sequence based on gaps discovered inside uploaded profiles.",
                      icon: Compass,
                      color: "text-teal-600 bg-teal-50"
                    },
                    {
                      id: "tracker",
                      label: "Pipeline Tracker",
                      desc: "Kanban style board keeping tabs on active job hunt pipelines, applications, and interview states.",
                      icon: Trello,
                      color: "text-fuchsia-600 bg-fuchsia-50"
                    }
                  ].map((feature) => {
                    const Icon = feature.icon;
                    const isEnabled = enabledFeatures[feature.id] !== false;
                    return (
                      <div 
                        key={feature.id} 
                        className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                          isEnabled 
                            ? "bg-white border-slate-200 shadow-sm" 
                            : "bg-slate-50/50 border-slate-200/60 opacity-80"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${feature.color}`}>
                            <Icon size={18} />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-slate-800 truncate">{feature.label}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-normal line-clamp-2">
                              {feature.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className={`text-[9px] font-black uppercase tracking-wider ${
                            isEnabled ? "text-emerald-600" : "text-slate-400"
                          }`}>
                            {isEnabled ? "● Visible" : "○ Hidden"}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              setEnabledFeatures(prev => ({
                                ...prev,
                                [feature.id]: !isEnabled
                              }));
                              triggerSaveMessage(`Updated: ${feature.label} visibility toggled!`);
                            }}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isEnabled ? "bg-indigo-600" : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isEnabled ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sub-tab 2: QUESTION BANK MANAGEMENT */}
            {customizerSubTab === "qbank" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Creator */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    {editingQId ? "📝 Edit Question" : "➕ Add Question to Bank"}
                  </h4>

                  <form onSubmit={handleSaveQuestion} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Question Prompt</label>
                      <textarea
                        required
                        rows={3}
                        value={newQText}
                        onChange={(e) => setNewQText(e.target.value)}
                        placeholder="e.g. How do you design an elastic load-balancing routing index?"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Target Company</label>
                        <input
                          type="text"
                          value={newQCompany}
                          onChange={(e) => setNewQCompany(e.target.value)}
                          placeholder="Google, MetLife"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Target Role</label>
                        <input
                          type="text"
                          value={newQRole}
                          onChange={(e) => setNewQRole(e.target.value)}
                          placeholder="Senior Software Engineer"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Difficulty</label>
                        <select
                          value={newQDiff}
                          onChange={(e: any) => setNewQDiff(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Round Type</label>
                        <select
                          value={newQRound}
                          onChange={(e: any) => setNewQRound(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="Technical">Technical</option>
                          <option value="Behavioral">Behavioral</option>
                          <option value="Aptitude">Aptitude</option>
                          <option value="System Design">System Design</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Subject / Tag</label>
                      <input
                        type="text"
                        value={newQSubject}
                        onChange={(e) => setNewQSubject(e.target.value)}
                        placeholder="Algorithms, STAR behavioral"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      >
                        {editingQId ? "Save Edits" : "Create Question"}
                      </button>
                      {editingQId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQId(null);
                            setNewQText("");
                            setNewQCompany("");
                            setNewQRole("");
                            setNewQSubject("");
                          }}
                          className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-300 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Question List View */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Active Question Bank Queries ({questions.length})
                    </h4>
                  </div>

                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {questions.map((q) => (
                      <div key={q.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 relative group hover:border-slate-300/60 transition">
                        <div className="flex items-start justify-between gap-6">
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-relaxed">{q.text}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="bg-slate-200 text-slate-700 font-bold text-[9px] px-1.5 py-0.5 rounded">
                                {q.company}
                              </span>
                              <span className="bg-purple-100 text-purple-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                                {q.round}
                              </span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                q.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" :
                                q.difficulty === "Medium" ? "bg-amber-100 text-amber-700" :
                                "bg-rose-100 text-rose-700"
                              }`}>
                                {q.difficulty}
                              </span>
                              <span className="text-slate-400 text-[9px] font-semibold mt-0.5">
                                tag: {q.subject} • role: {q.role}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleEditQuestionClick(q)}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
                              title="Edit question text"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded"
                              title="Delete from bank"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 3: APTITUDE QUESTION CONFIGURATION */}
            {customizerSubTab === "aptitude" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Creator */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    {editingApId ? "📝 Edit Aptitude Question" : "➕ Add Aptitude Question"}
                  </h4>

                  <form onSubmit={handleSaveAptitude} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Question Prompt</label>
                      <textarea
                        required
                        rows={2}
                        value={newApQuestion}
                        onChange={(e) => setNewApQuestion(e.target.value)}
                        placeholder="e.g. A reserves pool grew from $10M to $12.1M..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                        <select
                          value={newApCat}
                          onChange={(e) => setNewApCat(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                          <option value="Logical Reasoning">Logical Reasoning</option>
                          <option value="Verbal Ability">Verbal Ability</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Difficulty</label>
                        <select
                          value={newApDiff}
                          onChange={(e: any) => setNewApDiff(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-100 pt-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Answers Choices</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Option A (index 0)"
                          value={newApOpt0}
                          onChange={(e) => setNewApOpt0(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Option B (index 1)"
                          value={newApOpt1}
                          onChange={(e) => setNewApOpt1(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Option C (index 2)"
                          value={newApOpt2}
                          onChange={(e) => setNewApOpt2(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Option D (index 3)"
                          value={newApOpt3}
                          onChange={(e) => setNewApOpt3(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Correct Answer Choice Index</label>
                      <select
                        value={newApCorrect}
                        onChange={(e) => setNewApCorrect(Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value={0}>Choice A (Index 0)</option>
                        <option value={1}>Choice B (Index 1)</option>
                        <option value={2}>Choice C (Index 2)</option>
                        <option value={3}>Choice D (Index 3)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Solution Explanation</label>
                      <textarea
                        rows={2}
                        value={newApExplanation}
                        onChange={(e) => setNewApExplanation(e.target.value)}
                        placeholder="Explain the step-by-step math reasoning here..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      >
                        {editingApId ? "Save Edits" : "Create Aptitude Q"}
                      </button>
                      {editingApId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingApId(null);
                            setNewApQuestion("");
                            setNewApOpt0("");
                            setNewApOpt1("");
                            setNewApOpt2("");
                            setNewApOpt3("");
                            setNewApExplanation("");
                          }}
                          className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-300 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Question List View */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Aptitude Assessment Questions ({aptitudeQuestions.length})
                  </h4>

                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    {aptitudeQuestions.map((q) => (
                      <div key={q.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 relative group hover:border-slate-300/60 transition font-medium">
                        <div className="flex items-start justify-between gap-6">
                          <div className="space-y-1 flex-1">
                            <span className="text-[9px] font-black uppercase text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                              {q.category}
                            </span>
                            <p className="text-xs font-bold text-slate-800 mt-1 leading-relaxed">{q.question}</p>
                            
                            <div className="grid grid-cols-2 gap-1.5 mt-2">
                              {q.options.map((opt, oIdx) => (
                                <span
                                  key={oIdx}
                                  className={`text-[10px] px-2 py-1 rounded-md border font-semibold ${
                                    oIdx === q.correctIndex
                                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold"
                                      : "bg-white border-slate-100 text-slate-500"
                                  }`}
                                >
                                  {oIdx === q.correctIndex ? "✅ " : ""}{opt}
                                </span>
                              ))}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 bg-white p-2 rounded border border-slate-100 leading-relaxed">
                              <strong>Explanation:</strong> {q.explanation}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleEditAptitudeClick(q)}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
                              title="Edit question details"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteAptitude(q.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded"
                              title="Delete question"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 4: CODING SANDBOX CHALLENGES */}
            {customizerSubTab === "coding" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Creator */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    {editingCodeId ? "📝 Edit Coding Challenge" : "➕ Add Coding Challenge"}
                  </h4>

                  <form onSubmit={handleSaveCodingProblem} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Challenge Title</label>
                      <input
                        type="text"
                        required
                        value={newCodeTitle}
                        onChange={(e) => setNewCodeTitle(e.target.value)}
                        placeholder="e.g. Merge Intervals"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Difficulty</label>
                        <select
                          value={newCodeDiff}
                          onChange={(e: any) => setNewCodeDiff(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Time limit</label>
                        <input
                          type="text"
                          value={newCodeTime}
                          onChange={(e) => setNewCodeTime(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Space limit</label>
                        <input
                          type="text"
                          value={newCodeSpace}
                          onChange={(e) => setNewCodeSpace(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Description (Markdown)</label>
                      <textarea
                        required
                        rows={3}
                        value={newCodeDesc}
                        onChange={(e) => setNewCodeDesc(e.target.value)}
                        placeholder="Describe the challenge rules..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Constraints (New line separated)</label>
                      <textarea
                        rows={2}
                        value={newCodeConsts}
                        onChange={(e) => setNewCodeConsts(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block">Required Code Keywords (Comma separated)</label>
                      <input
                        type="text"
                        value={newCodeValCode}
                        onChange={(e) => setNewCodeValCode(e.target.value)}
                        placeholder="e.g. Map, map.set, filter"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                      />
                      <span className="text-[9px] text-slate-400 block leading-tight">
                        Our dynamic sandbox parser validates student submission rules using these exact required code segments.
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      >
                        {editingCodeId ? "Save Edits" : "Create Challenge"}
                      </button>
                      {editingCodeId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCodeId(null);
                            setNewCodeTitle("");
                            setNewCodeDesc("");
                            setNewCodeValCode("");
                          }}
                          className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-300 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Challenges list */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Sandbox Coding Challenges ({codingProblems.length})
                  </h4>

                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {codingProblems.map((p) => (
                      <div key={p.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 relative group hover:border-slate-300/60 transition">
                        <div className="flex items-start justify-between gap-6">
                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-slate-800">{p.title}</h5>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-xl">
                              {p.description.substring(0, 160)}...
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                p.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" :
                                p.difficulty === "Medium" ? "bg-amber-100 text-amber-700" :
                                "bg-rose-100 text-rose-700"
                              }`}>
                                {p.difficulty}
                              </span>
                              <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Time: {p.timeLimit} • Space: {p.spaceLimit}
                              </span>
                              {p.validatorCode && (
                                <span className="bg-purple-100 border border-purple-200 text-purple-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md font-mono">
                                  Rule match: {p.validatorCode}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleEditCodingClick(p)}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
                              title="Edit challenge prompt"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteCoding(p.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded"
                              title="Delete challenge"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 5: INTERVIEW PERSONALITIES */}
            {customizerSubTab === "interviewers" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Creator */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    {editingIntId ? "📝 Edit Proctor Profile" : "➕ Add Interviewer Proctor"}
                  </h4>

                  <form onSubmit={handleSaveInterviewer} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Interviewer Name</label>
                      <input
                        type="text"
                        required
                        value={newIntName}
                        onChange={(e) => setNewIntName(e.target.value)}
                        placeholder="e.g. Dr. Olivia Vance"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Designation / Role</label>
                        <input
                          type="text"
                          required
                          value={newIntRole}
                          onChange={(e) => setNewIntRole(e.target.value)}
                          placeholder="e.g. Chief Risk Officer"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Avatar (Emoji)</label>
                        <select
                          value={newIntAvatar}
                          onChange={(e) => setNewIntAvatar(e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="🌸">🌸 Friendly Coach</option>
                          <option value="👤">👤 Formal Agent</option>
                          <option value="💼">💼 Corporate HR</option>
                          <option value="💻">💻 Technical Architect</option>
                          <option value="📈">📈 Chief Actuary</option>
                          <option value="⚙️">⚙️ Hiring Manager</option>
                          <option value="🎯">🎯 Consultant Partner</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Interviewer Personality Description</label>
                      <textarea
                        rows={3}
                        value={newIntDesc}
                        onChange={(e) => setNewIntDesc(e.target.value)}
                        placeholder="e.g. Incredibly detail oriented. Focuses deeply on numerical verification models and mathematical risk..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition cursor-pointer"
                      >
                        {editingIntId ? "Save Edits" : "Create Proctor"}
                      </button>
                      {editingIntId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingIntId(null);
                            setNewIntName("");
                            setNewIntRole("");
                            setNewIntDesc("");
                          }}
                          className="px-3 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-300 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Interviewer list */}
                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Mock Interviewer Agent Proctors ({interviewers.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
                    {interviewers.map((i) => (
                      <div key={i.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 relative group hover:border-slate-300/60 transition font-medium">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl bg-white w-12 h-12 rounded-xl border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                              {i.avatar}
                            </span>
                            <div>
                              <h5 className="text-xs font-black text-slate-800">{i.name}</h5>
                              <span className="text-[10px] font-bold text-brand-600 uppercase block">{i.role}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition shrink-0">
                            <button
                              onClick={() => handleEditIntClick(i)}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
                              title="Edit proctor details"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteInt(i.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded"
                              title="Delete proctor"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {i.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 6: LEARNING ROADMAP & SKILL GAP CONTROLS */}
            {customizerSubTab === "roadmap" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    ➕ Add Milestone to Active Learning Roadmap
                  </h4>

                  <form onSubmit={handleAddRoadmapMilestone} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Milestone Title</label>
                      <input
                        type="text"
                        required
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        placeholder="e.g. Master Advanced SQL Indexing"
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Specific Objectives (New line separated)</label>
                      <textarea
                        rows={3}
                        value={newMilestoneObj}
                        onChange={(e) => setNewMilestoneObj(e.target.value)}
                        placeholder="e.g. Complete window function challenges&#10;Solve partitioning problems"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition cursor-pointer"
                    >
                      Append Learning Milestone
                    </button>
                  </form>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
                      ➕ Inject New Target Skill Gap
                    </h5>
                    <form onSubmit={handleAddSkillGap} className="flex gap-2 font-medium">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cloud Security (IAM)"
                        value={newSkillGap}
                        onChange={(e) => setNewSkillGap(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-brand-600 text-white font-bold text-xs rounded-lg hover:bg-brand-700 transition cursor-pointer"
                      >
                        Add Gap
                      </button>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 font-medium">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      Active Candidate Learning Roadmap & Milestones
                    </h4>
                    <span className="bg-slate-100 text-slate-700 text-[9px] font-extrabold px-2 py-0.5 rounded font-mono">
                      Target Salary: {roadmapData?.salaryInsights?.marketRange || "$120,000"}
                    </span>
                  </div>

                  {roadmapData ? (
                    <div className="space-y-4 font-medium">
                      {/* Milestones list */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">LEARNING ROADMAP MILESTONES</span>
                        {roadmapData.learningMilestones?.map((m: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="bg-brand-50 text-brand-600 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                  Step {idx + 1}
                                </span>
                                <h5 className="text-xs font-bold text-slate-800">{m.title}</h5>
                              </div>
                              <ul className="list-disc list-inside text-[10px] text-slate-500 mt-1.5 space-y-0.5 ml-2">
                                {m.objectives?.map((obj: string, oIdx: number) => (
                                  <li key={oIdx}>{obj}</li>
                                ))}
                              </ul>
                            </div>
                            <button
                              onClick={() => handleDeleteMilestone(idx)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded self-center"
                              title="Delete milestone step"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Gaps list */}
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">SKILL GAP ANALYSIS GAPS</span>
                        <div className="flex flex-wrap gap-2">
                          {roadmapData.skillGaps?.map((gap: any, idx: number) => (
                            <span
                              key={idx}
                              className="bg-amber-50 border border-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-1 rounded-lg flex items-center gap-1"
                            >
                              ⚠️ {gap.skill}
                              <button
                                onClick={() => {
                                  const updatedGaps = roadmapData.skillGaps.filter((_: any, i: number) => i !== idx);
                                  const updated = { ...roadmapData, skillGaps: updatedGaps };
                                  setRoadmapData(updated);
                                  localStorage.setItem("career_os_roadmap", JSON.stringify(updated));
                                  triggerSaveMessage("Skill gap item removed.");
                                }}
                                className="text-rose-500 hover:text-rose-700 font-extrabold ml-1 font-mono"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                      <p className="text-xs text-slate-400">
                        No active Career Roadmap generated by candidate yet. Open Candidate Portal and click "Generate Career Roadmap" to create one.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-tab 7: BULK DATA UPLOAD & INTEGRATION HUB */}
            {customizerSubTab === "import" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left controls: Target, Drag-Drop, Strategy */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                      1. Target Directory & Conflict Policy
                    </h4>

                    {/* Target Select */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Directory Target</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: "qbank", label: "Question Bank", desc: `${questions.length} Active Items` },
                          { id: "aptitude", label: "Aptitude Tests", desc: `${aptitudeQuestions.length} Active Exams` },
                          { id: "coding", label: "Coding Problems", desc: `${codingProblems.length} Sandbox Tasks` },
                          { id: "interviewers", label: "Agent Proctors", desc: `${interviewers.length} Active Coach profiles` }
                        ].map((target) => (
                          <button
                            key={target.id}
                            type="button"
                            onClick={() => {
                              setImportTarget(target.id as any);
                              setImportFile(null);
                              setImportData(null);
                              setImportError(null);
                            }}
                            className={`p-3.5 rounded-xl border text-left transition ${
                              importTarget === target.id
                                ? "bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-sm"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                            }`}
                          >
                            <div className="text-[11px] font-black">{target.label}</div>
                            <div className="text-[9px] text-slate-400 font-semibold mt-0.5">{target.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Conflict Strategy Select */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mergence Strategy Policy</label>
                      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                        <button
                          type="button"
                          onClick={() => setConflictStrategy("append")}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            conflictStrategy === "append"
                              ? "bg-white text-slate-800 shadow"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Append & Merge
                        </button>
                        <button
                          type="button"
                          onClick={() => setConflictStrategy("overwrite")}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            conflictStrategy === "overwrite"
                              ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          ⚠️ Complete Wipe
                        </button>
                      </div>
                      <span className="text-[9px] text-slate-400 leading-normal block">
                        {conflictStrategy === "append" 
                          ? "Newly uploaded entries will combine safely with existing directory rows."
                          : "Wipes out the entire existing dataset directory and installs the newly processed dataset as primary."}
                      </span>
                    </div>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                      2. Drag & Drop File Upload
                    </h4>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setImportDragActive(true); }}
                      onDragLeave={() => setImportDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setImportDragActive(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleImportFileSelect(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                        importDragActive 
                          ? "border-indigo-500 bg-indigo-50/40" 
                          : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
                      }`}
                      onClick={() => {
                        const input = document.getElementById("import-file-input");
                        if (input) input.click();
                      }}
                    >
                      <input
                        type="file"
                        id="import-file-input"
                        className="hidden"
                        accept=".json,.csv"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImportFileSelect(e.target.files[0]);
                          }
                        }}
                      />
                      <Upload className="mx-auto text-slate-400 mb-2.5 animate-pulse" size={24} />
                      <p className="text-xs font-bold text-slate-700">Drag & drop dataset file here</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Supports .json and .csv format</p>
                    </div>

                    {/* File State Display */}
                    {importFile && (
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 font-extrabold text-[10px] uppercase">
                            {importFile.name.split('.').pop()}
                          </div>
                          <div className="text-left">
                            <p className="text-[11px] font-bold text-slate-800 truncate max-w-[180px]">{importFile.name}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{(importFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImportFile(null);
                            setImportData(null);
                            setImportError(null);
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded font-bold border-0 bg-transparent cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {/* Console Error Output */}
                    {importError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 text-[10px] font-semibold rounded-xl flex items-start gap-2">
                        <ShieldAlert size={14} className="shrink-0 text-rose-600 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-rose-950 uppercase text-[9px] tracking-wide">Validation Error Console</p>
                          <p className="mt-0.5 leading-relaxed font-mono text-left">{importError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right controls: Templates and Preview */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Preview of Parsed Entries */}
                  {importData && importData.length > 0 && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div>
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                            3. Parsed Records Live Preview
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">Found {importData.length} entries. Confirm fields match correctly below.</p>
                        </div>
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md">
                          Verified Safe
                        </span>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {importData.slice(0, 5).map((row, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left text-xs font-medium relative group">
                            <span className="absolute top-2 right-2 text-[9px] font-mono text-slate-400">Record #{idx+1}</span>
                            <div className="font-bold text-slate-800 truncate max-w-md text-left">
                              {row.text || row.question || row.title || row.name || "Untitled Row Entry"}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {Object.entries(row).slice(0, 5).map(([k, v]: any) => (
                                <span key={k} className="bg-white border border-slate-200 text-[9px] px-1.5 py-0.5 rounded text-slate-500 max-w-[150px] truncate">
                                  <strong>{k}:</strong> {typeof v === "object" ? JSON.stringify(v) : String(v)}
                                </span>
                              ))}
                              {Object.keys(row).length > 5 && (
                                <span className="text-[9px] text-slate-400 self-center font-semibold text-left">+{Object.keys(row).length - 5} more fields</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {importData.length > 5 && (
                          <div className="text-[10px] text-slate-400 text-center font-bold bg-slate-50/50 py-1.5 rounded-lg border border-dashed">
                            ... and {importData.length - 5} more records parsed and staged.
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCommitImport}
                          className="flex-1 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition flex items-center justify-center gap-2 cursor-pointer border-0"
                        >
                          <CheckCircle2 size={14} /> Commit & Deploy to Platform ({importData.length} Records)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImportData(null);
                            setImportFile(null);
                          }}
                          className="px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs rounded-xl transition cursor-pointer border-0"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Schema assistant */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                    <button
                      type="button"
                      onClick={() => setSchemaPreviewOpen(!schemaPreviewOpen)}
                      className="w-full flex justify-between items-center text-xs font-black text-slate-800 uppercase tracking-wider cursor-pointer select-none border-0 bg-transparent"
                    >
                      <span>ℹ️ Schema Blueprint Templates & Guides</span>
                      <span className="text-slate-400 text-[10px]">{schemaPreviewOpen ? "Collapse ▴" : "Expand ▾"}</span>
                    </button>

                    {schemaPreviewOpen && (
                      <div className="space-y-4 pt-2 text-left text-xs font-medium">
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          To successfully upload files, use the schema templates below. Copy the formatting to match what our engine's sanitization algorithms expect.
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center bg-slate-900 px-3.5 py-2 rounded-t-xl text-white">
                            <span className="text-[10px] font-black tracking-wider uppercase text-brand-400">
                              {importTarget.toUpperCase()} Schema Blueprint
                            </span>
                            <div className="flex gap-1.5 text-[9px] font-bold">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(getTemplateExampleText().json);
                                  triggerSaveMessage("JSON template copied to clipboard!");
                                }}
                                className="bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded text-slate-200 border-0 cursor-pointer"
                              >
                                Copy JSON
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(getTemplateExampleText().csv);
                                  triggerSaveMessage("CSV template copied to clipboard!");
                                }}
                                className="bg-slate-800 hover:bg-slate-750 px-2 py-1 rounded text-slate-200 border-0 cursor-pointer"
                              >
                                Copy CSV
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-950 p-4 rounded-b-xl border-t-0 border border-slate-850 font-mono text-[10px] text-emerald-400 overflow-x-auto max-h-48 leading-relaxed text-left">
                            <span className="text-slate-500 font-bold uppercase block mb-1.5 border-b border-slate-850 pb-1">// JSON SCHEMA EXAMPLE:</span>
                            <pre>{getTemplateExampleText().json}</pre>
                            
                            <span className="text-slate-500 font-bold uppercase block mt-4 mb-1.5 border-b border-slate-850 pb-1">// CSV TEXT EXAMPLE:</span>
                            <pre className="text-amber-300">{getTemplateExampleText().csv}</pre>
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900 text-[10px] leading-relaxed text-left">
                          <strong>💡 Actuarial Platform Tip:</strong> When uploading CSV files for Aptitude Tests, separate choices using the pipe character <code>|</code> within quotes in the <code>options</code> column, e.g. <code>"Option A|Option B|Option C|Option D"</code>. Our parser parses them into dynamic choice arrays automatically.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
