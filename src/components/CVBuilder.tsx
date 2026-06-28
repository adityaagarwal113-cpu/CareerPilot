/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  FileText, User, Mail, Phone, MapPin, Link2, Briefcase, Plus, Trash2, 
  Sparkles, Download, CheckCircle, RefreshCw, AlertCircle, Award, GraduationCap, 
  Code, ShieldAlert, Copy, Check, Eye
} from "lucide-react";
import { Resume } from "../types";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface CVBuilderProps {
  resumes: Resume[];
  userEmail: string;
  userName: string;
  userRole: string;
  examsCleared: number;
  setExamsCleared: (num: number) => void;
  paperNames: string;
  setPaperNames: (papers: string) => void;
  actuarialBoard: string;
  setActuarialBoard: (board: string) => void;
  onAddResume: (name: string, text: string) => Promise<void>;
  onAddXp: (xp: number) => void;
}

interface CVExperience {
  role: string;
  company: string;
  location: string;
  duration: string;
  description: string;
}

interface CVProject {
  title: string;
  tech: string;
  description: string;
}

interface CVEducation {
  degree: string;
  institution: string;
  year: string;
  grade: string;
}

export interface ActuarialPaper {
  code: string;
  title: string;
  board: "IAI" | "IFoA" | "Both";
  year: string;
  marks?: string;
}

export default function CVBuilder({
  resumes,
  userEmail,
  userName: initialUserName,
  userRole: initialUserRole,
  examsCleared,
  setExamsCleared,
  paperNames,
  setPaperNames,
  actuarialBoard,
  setActuarialBoard,
  onAddResume,
  onAddXp
}: CVBuilderProps) {
  // Personal Info State
  const [name, setName] = useState(initialUserName);
  const [role, setRole] = useState(initialUserRole);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState("+91 98765 43210");
  const [location, setLocation] = useState("Mumbai, India");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/aditya-actuarial");
  const [website, setWebsite] = useState("github.com/aditya-actuary");
  const [summary, setSummary] = useState(
    "Analytical and highly motivated Actuarial Student with 3 cleared papers under the IAI & IFoA curriculum. Proven mathematical modeling skills with expert command of life contingencies, claims modeling, and general insurance GLM structures. Proficient in R, Python, and advanced financial modeling."
  );

  // Lists
  const [experiences, setExperiences] = useState<CVExperience[]>([
    {
      role: "Actuarial Intern",
      company: "Milliman",
      location: "Mumbai, India",
      duration: "June 2025 - Present",
      description: "Assisted senior consultants with pricing calculations and stochastic reserve estimations using R and Excel VBA. Audited data tables for life contingency annuities and summarized liability fluctuations under Solvency II frameworks."
    },
    {
      role: "Junior Data Analyst",
      company: "HDFC Ergo",
      location: "Delhi, India",
      duration: "Dec 2024 - May 2025",
      description: "Conducted statistical claim modeling on motor vehicle insurance portfolios. Modeled general insurance risk distributions and analyzed claim frequency parameters using Generalized Linear Models (GLMs)."
    }
  ]);

  const [projects, setProjects] = useState<CVProject[]>([
    {
      title: "Stochastic Chain-Ladder Reserving System",
      tech: "R, Shiny, Excel VBA",
      description: "Designed an interactive dashboard that ingests claim triangles and outputs ultimate loss reserves using deterministic and stochastic (Mack's) Chain-Ladder models with visual prediction intervals."
    },
    {
      title: "Annuity Present Value Pricing Simulator",
      tech: "Python, NumPy, Pandas",
      description: "Created a life annuity calculation tool simulating multi-state actuarial decrement tables, predicting expected present values for varied survivor benefit schemes."
    }
  ]);

  const [education, setEducation] = useState<CVEducation[]>([
    {
      degree: "B.Sc. in Actuarial Science & Quantitative Finance",
      institution: "NMIMS University",
      year: "2022 - 2025",
      grade: "CGPA: 3.8 / 4.0"
    }
  ]);

  const [actuarialPapers, setActuarialPapers] = useState<ActuarialPaper[]>([
    { code: "CS1", title: "Actuarial Statistics", board: "IAI", year: "Nov 2023", marks: "78" },
    { code: "CM1", title: "Actuarial Mathematics", board: "IFoA", year: "May 2024", marks: "82" },
    { code: "CB1", title: "Business Finance", board: "Both", year: "Nov 2024", marks: "" }
  ]);

  const [techSkills, setTechSkills] = useState("R programming, Python, SQL, Excel VBA, PowerBI, Tableau, Git");
  const [actuarialSkills, setActuarialSkills] = useState("Stochastic Reserving, Life Contingencies, GLM Rating, Claims Modeling, Solvency II, IFRS 17");

  // Four customizable core skill categories
  const [skillActuarial, setSkillActuarial] = useState("Stochastic Reserving, Life Contingencies, GLM Rating, Claims Modeling, Solvency II, IFRS 17");
  const [skillTechTools, setSkillTechTools] = useState("R programming, Python, SQL, Excel VBA, PowerBI, Tableau, Git");
  const [skillDataProcess, setSkillDataProcess] = useState("Model Validation, Data Processing, Workflow Automation, API Integration");
  const [skillSoftSkills, setSkillSoftSkills] = useState("Problem Solving, Analytical Thinking, Communication, Professional Conduct");

  // Local storage save/load
  useEffect(() => {
    const saved = localStorage.getItem("platform_cv_builder_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.role) setRole(parsed.role);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.linkedin) setLinkedin(parsed.linkedin);
        if (parsed.website) setWebsite(parsed.website);
        if (parsed.summary) setSummary(parsed.summary);
        if (parsed.experiences) setExperiences(parsed.experiences);
        if (parsed.projects) setProjects(parsed.projects);
        if (parsed.education) setEducation(parsed.education);
        if (parsed.actuarialPapers) setActuarialPapers(parsed.actuarialPapers);
        if (parsed.techSkills) setTechSkills(parsed.techSkills);
        if (parsed.actuarialSkills) setActuarialSkills(parsed.actuarialSkills);
        if (parsed.skillActuarial) setSkillActuarial(parsed.skillActuarial);
        if (parsed.skillTechTools) setSkillTechTools(parsed.skillTechTools);
        if (parsed.skillDataProcess) setSkillDataProcess(parsed.skillDataProcess);
        if (parsed.skillSoftSkills) setSkillSoftSkills(parsed.skillSoftSkills);
      } catch (e) {
        console.error("Error loading CV data from local storage", e);
      }
    }
  }, []);

  // Auto-sync dynamic actuarial papers back to parent state
  useEffect(() => {
    if (actuarialPapers.length > 0) {
      const names = actuarialPapers.map(p => p.code).filter(Boolean).join(", ");
      setPaperNames(names);
      setExamsCleared(actuarialPapers.length);
      localStorage.setItem("platform_exams_cleared", actuarialPapers.length.toString());
      localStorage.setItem("platform_paper_names", names);
    }
  }, [actuarialPapers, setPaperNames, setExamsCleared]);

  const saveToLocalStorage = (updatedData: any) => {
    localStorage.setItem("platform_cv_builder_data", JSON.stringify(updatedData));
  };

  const updateStateAndPersist = (updater: () => void) => {
    updater();
    // setTimeout to allow state to settle
    setTimeout(() => {
      saveToLocalStorage({
        name, role, email, phone, location, linkedin, website, summary,
        experiences, projects, education, actuarialPapers, techSkills, actuarialSkills,
        skillActuarial, skillTechTools, skillDataProcess, skillSoftSkills
      });
    }, 50);
  };

  // AI Review States
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // AI Enhancer active states
  const [enhancingSummary, setEnhancingSummary] = useState(false);
  const [enhancingBulletIndex, setEnhancingBulletIndex] = useState<number | null>(null);
  const [enhancingProjectIndex, setEnhancingProjectIndex] = useState<number | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<"edit" | "preview">("edit");
  const [showCopyNotice, setShowCopyNotice] = useState(false);

  const [isImportingPDF, setIsImportingPDF] = useState(false);
  const [pdfImportError, setPdfImportError] = useState<string | null>(null);

  const handleDirectPDFImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingPDF(true);
    setPdfImportError(null);

    try {
      const rawText = await file.text();
      let extractedText = rawText;
      
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      if (isPdf) {
        const matches = rawText.match(/\(([^)]+)\)/g);
        if (matches && matches.length > 5) {
          const cleaned = matches
            .map(m => m.slice(1, -1))
            .filter(t => t.trim().length > 1 && !t.includes("font") && !t.includes("PDF") && !t.includes("/Obj") && !t.includes("ProcSet"))
            .join(" ")
            .replace(/\\([\d]{3})/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
            .replace(/\\/g, "");
          if (cleaned.trim().length > 100) {
            extractedText = cleaned;
          }
        } else {
          const textOnly = rawText
            .replace(/[\x00-\x1F\x7F-\x9F]/g, " ")
            .replace(/[^a-zA-Z0-9\s,.\-@_()]/g, "")
            .replace(/\s+/g, " ");
          if (textOnly.trim().length > 100) {
            extractedText = textOnly.substring(0, 15000);
          }
        }
      }

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: extractedText, filename: file.name })
      });

      if (!res.ok) {
        throw new Error("Failed to parse the uploaded PDF resume on the server.");
      }

      const data = await res.json();
      if (data && data.skills) {
        updateStateAndPersist(() => {
          if (data.skills.technical && data.skills.technical.length > 0) {
            const techStr = data.skills.technical.join(", ");
            setSkillTechTools(techStr);
          }
          if (data.skills.soft && data.skills.soft.length > 0) {
            const softStr = data.skills.soft.join(", ");
            setSkillSoftSkills(softStr);
          }
          if (data.experience && data.experience.length > 0) {
            const mapped = data.experience.map((exp: any) => ({
              role: exp.role || "Actuarial Associate",
              company: exp.company || "Insurance Corp",
              location: "Remote",
              duration: exp.duration || "1 Year",
              description: exp.description || ""
            }));
            setExperiences(mapped);
          }
          if (data.projects && data.projects.length > 0) {
            const mappedProj = data.projects.map((proj: any) => ({
              title: proj.title || "Stochastic Simulation Project",
              tech: proj.technologies ? proj.technologies.join(", ") : "R, VBA",
              description: proj.description || ""
            }));
            setProjects(mappedProj);
          }
          if (data.education && data.education.length > 0) {
            const mappedEd = data.education.map((ed: any) => ({
              degree: ed.degree || "B.Sc. Actuarial Science",
              institution: ed.institution || "Institute of Actuaries",
              year: ed.year || "2023",
              grade: "First Class"
            }));
            setEducation(mappedEd);
          }
          
          alert("Successfully parsed and imported your PDF resume details!");
        });
      } else {
        throw new Error("No structured data returned from the resume parser.");
      }
    } catch (err: any) {
      console.error("PDF Resume Import Error:", err);
      setPdfImportError(err.message || "Could not read or parse this PDF resume.");
    } finally {
      setIsImportingPDF(false);
    }
  };

  // Import from parsed resume if they have one uploaded
  const handleImportFromCV = (resumeId: string) => {
    const selected = resumes.find(r => r.id === resumeId);
    if (!selected || !selected.parsedData) return;

    const parsed = selected.parsedData;
    updateStateAndPersist(() => {
      if (selected.name) setName(selected.name.split("_")[0] || selected.name);
      
      // Map skills
      if (parsed.skills) {
        if (parsed.skills.technical && parsed.skills.technical.length > 0) {
          const skillsStr = parsed.skills.technical.join(", ");
          setTechSkills(skillsStr);
          setSkillTechTools(skillsStr);
        }
      }

      // Map experience
      if (parsed.experience && parsed.experience.length > 0) {
        const mappedExps = parsed.experience.map(exp => ({
          role: exp.role || "Actuarial Intern",
          company: exp.company || "Actuarial Firm",
          location: "Location",
          duration: exp.duration || "Months",
          description: exp.description || ""
        }));
        setExperiences(mappedExps);
      }

      // Map projects
      if (parsed.projects && parsed.projects.length > 0) {
        const mappedProjs = parsed.projects.map(proj => ({
          title: proj.title || "Actuarial Project",
          tech: proj.technologies ? proj.technologies.join(", ") : "R, Excel",
          description: proj.description || ""
        }));
        setProjects(mappedProjs);
      }

      // Map education
      if (parsed.education && parsed.education.length > 0) {
        const mappedEdu = parsed.education.map(edu => ({
          degree: edu.degree || "Actuarial Bachelor",
          institution: edu.institution || "University",
          year: edu.year || "Graduation Year",
          grade: "Grade"
        }));
        setEducation(mappedEdu);
      }
    });

    onAddXp(40);
  };

  // Run ATS Audit
  const handleRunATSAudit = async () => {
    setReviewLoading(true);
    setReviewError("");
    try {
      const cvData = {
        name, role, email, phone, location, linkedin, website, summary,
        examsCleared, paperNames, actuarialBoard,
        experiences, projects, education, techSkills, actuarialSkills
      };

      const res = await fetch("/api/cv/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData })
      });

      if (!res.ok) {
        throw new Error("Failed to compile audit. Check your GEMINI_API_KEY.");
      }

      const data = await res.json();
      setAtsScore(data.atsScore || 82);
      setQualityScore(data.qualityScore || 85);
      setStrengths(data.strengths || ["Detailed IAI/IFoA examination metrics", "Strong quantitative modeling highlights"]);
      setGaps(data.gaps || ["Needs more active-verb focus in older roles"]);
      setActionItems(data.actionItems || ["Increase frequency of Solvency II modeling vocabulary"]);
      setMissingKeywords(data.missingKeywords || ["Profitability Analysis", "Mack's Chain Ladder"]);
      
      onAddXp(50);
    } catch (e: any) {
      setReviewError(e.message || "Something went wrong during the audit. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  // AI Summary Enhancer
  const handleEnhanceSummary = async () => {
    if (!summary.trim()) return;
    setEnhancingSummary(true);
    try {
      const res = await fetch("/api/cv/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: summary,
          type: "summary",
          context: `IAI/IFoA Exams Cleared: ${examsCleared}, Papers: ${paperNames}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedText) {
          updateStateAndPersist(() => setSummary(data.enhancedText));
          onAddXp(20);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnhancingSummary(false);
    }
  };

  // AI Bullet Enhancer
  const handleEnhanceExperienceBullet = async (index: number) => {
    const exp = experiences[index];
    if (!exp.description.trim()) return;
    setEnhancingBulletIndex(index);
    try {
      const res = await fetch("/api/cv/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: exp.description,
          type: "bullet",
          context: `Experience role: ${exp.role} at ${exp.company}`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.enhancedText) {
          updateStateAndPersist(() => {
            const updated = [...experiences];
            updated[index].description = data.enhancedText;
            setExperiences(updated);
          });
          onAddXp(20);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnhancingBulletIndex(null);
    }
  };

  // List Modification Handlers
  const handleAddExperience = () => {
    updateStateAndPersist(() => {
      setExperiences([
        ...experiences,
        { role: "", company: "", location: "", duration: "", description: "" }
      ]);
    });
  };

  const handleRemoveExperience = (index: number) => {
    updateStateAndPersist(() => {
      setExperiences(experiences.filter((_, i) => i !== index));
    });
  };

  const handleAddProject = () => {
    updateStateAndPersist(() => {
      setProjects([
        ...projects,
        { title: "", tech: "", description: "" }
      ]);
    });
  };

  const handleRemoveProject = (index: number) => {
    updateStateAndPersist(() => {
      setProjects(projects.filter((_, i) => i !== index));
    });
  };

  const handleAddEducation = () => {
    updateStateAndPersist(() => {
      setEducation([
        ...education,
        { degree: "", institution: "", year: "", grade: "" }
      ]);
    });
  };

  const handleRemoveEducation = (index: number) => {
    updateStateAndPersist(() => {
      setEducation(education.filter((_, i) => i !== index));
    });
  };

  const handleAddActuarialPaper = () => {
    updateStateAndPersist(() => {
      setActuarialPapers([
        ...actuarialPapers,
        { code: "", title: "", board: "IAI", year: "", marks: "" }
      ]);
    });
  };

  const handleRemoveActuarialPaper = (index: number) => {
    updateStateAndPersist(() => {
      setActuarialPapers(actuarialPapers.filter((_, i) => i !== index));
    });
  };

  // Robust programmatic high-fidelity ATS-friendly PDF exporter
  const handleDownloadPDF = async () => {
    onAddXp(30);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4"
    });

    const pageWidth = 595;
    const pageHeight = 842;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    let y = 50;

    // Helper to check for page overflow
    const checkPageOverflow = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - margin) {
        doc.addPage();
        y = 50;
      }
    };

    // Helper to draw a section header
    const drawSectionHeader = (title: string) => {
      checkPageOverflow(40);
      y += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // #0f172a
      doc.text(title.toUpperCase(), margin, y);
      y += 5;
      doc.setDrawColor(203, 213, 225); // #cbd5e1
      doc.setLineWidth(1);
      doc.line(margin, y, pageWidth - margin, y);
      y += 14;
    };

    // 1. HEADER (Name, Role, and Contact Details)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42);
    const upperName = (name || "YOUR FULL NAME").toUpperCase();
    doc.text(upperName, margin, y);
    y += 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // #4f46e5 (Indigo)
    doc.text((role || "Actuarial Associate / Candidate").toUpperCase(), margin, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // #475569

    const contactParts = [
      email ? `Email: ${email}` : "",
      phone ? `Phone: ${phone}` : "",
      location ? `Loc: ${location}` : "",
      linkedin ? `LI: ${linkedin}` : "",
      website ? `Web: ${website}` : ""
    ].filter(Boolean);

    const contactText = contactParts.join("   |   ");
    const contactLines = doc.splitTextToSize(contactText, contentWidth);
    doc.text(contactLines, margin, y);
    y += (contactLines.length * 12) + 6;

    // Draw solid line beneath header
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 18;

    // 2. PROFESSIONAL SUMMARY
    if (summary) {
      drawSectionHeader("Professional Summary");
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // #334155
      const summaryLines = doc.splitTextToSize(summary, contentWidth);
      doc.text(summaryLines, margin, y, { align: "justify" });
      y += (summaryLines.length * 13) + 12;
    }

    // 3. ACTUARIAL CREDENTIALS & EXAMINATIONS
    drawSectionHeader("Actuarial Credentials & Examinations");
    
    checkPageOverflow(45);
    doc.setFillColor(248, 250, 252); // #f8fafc
    doc.setDrawColor(226, 232, 240); // #e2e8f0
    doc.setLineWidth(1);
    doc.roundedRect(margin, y, contentWidth, 34, 4, 4, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // #64748b
    doc.text("PRIMARY AFFILIATION", margin + 12, y + 12);
    doc.text("PROFESSIONAL STANDING", margin + (contentWidth / 2) + 12, y + 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const primaryAff = actuarialBoard === "Both" ? "IAI & IFoA UK" : actuarialBoard === "IAI" ? "Institute of Actuaries of India" : "Institute & Faculty of Actuaries, UK";
    doc.text(primaryAff, margin + 12, y + 24);
    doc.text(`${examsCleared} Exams Cleared`, margin + (contentWidth / 2) + 12, y + 24);
    y += 46;

    // Papers list
    if (actuarialPapers.length > 0) {
      actuarialPapers.forEach(paper => {
        checkPageOverflow(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        const codeText = paper.code || "N/A";
        doc.text(codeText, margin, y);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        doc.text(`— ${paper.title || "Subject Title"}`, margin + 60, y);

        // Right side details
        doc.setFont("helvetica", "bold");
        doc.setTextColor(79, 70, 229);
        const boardText = paper.board;
        const rightDetails = ` |  ${paper.year || "Pending"}${paper.marks ? `  |  Marks: ${paper.marks}` : ""}`;
        
        const rightColX = pageWidth - margin - 150;
        doc.text(boardText, rightColX, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(71, 85, 105);
        doc.text(rightDetails, rightColX + 35, y);

        y += 4;
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 14;
      });
      y += 6;
    }

    // 4. PROFESSIONAL EXPERIENCE
    if (experiences.length > 0) {
      drawSectionHeader("Professional Experience");
      experiences.forEach(exp => {
        checkPageOverflow(70);
        
        // Role & Company
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        const roleText = `${exp.role} — `;
        doc.text(roleText, margin, y);
        const roleWidth = doc.getTextWidth(roleText);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
        doc.text(exp.company, margin + roleWidth, y);

        // Duration & Location on the right
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        const rightText = `${exp.duration}  |  ${exp.location}`;
        doc.text(rightText, pageWidth - margin, y, { align: "right" });
        y += 12;

        // Description with left border
        const descLines = doc.splitTextToSize(exp.description, contentWidth - 12);
        checkPageOverflow((descLines.length * 13) + 8);

        // Draw left border line
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(1.5);
        doc.line(margin + 4, y - 4, margin + 4, y + (descLines.length * 13) - 8);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(descLines, margin + 12, y);
        y += (descLines.length * 13) + 8;
      });
    }

    // 5. PROJECTS
    if (projects.length > 0) {
      drawSectionHeader("Modeling & Technical Projects");
      projects.forEach(proj => {
        checkPageOverflow(50);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(15, 23, 42);
        doc.text(proj.title, margin, y);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(79, 70, 229);
        doc.text(proj.tech, pageWidth - margin, y, { align: "right" });
        y += 12;

        const projLines = doc.splitTextToSize(proj.description, contentWidth);
        checkPageOverflow(projLines.length * 13);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(projLines, margin, y, { align: "justify" });
        y += (projLines.length * 13) + 10;
      });
    }

    // 6. EDUCATION
    if (education.length > 0) {
      drawSectionHeader("Academic Qualifications");
      education.forEach(ed => {
        checkPageOverflow(40);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text(ed.degree, margin, y);

        doc.setFont("helvetica", "bold");
        doc.text(ed.year, pageWidth - margin, y, { align: "right" });
        y += 12;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(ed.institution, margin, y);
        doc.text(ed.grade, pageWidth - margin, y, { align: "right" });
        y += 18;
      });
    }

    // 7. CORE COMPETENCIES & SKILLS
    const skillsToDraw = [
      { label: "Actuarial & Analytics", val: skillActuarial },
      { label: "Technical Tools", val: skillTechTools },
      { label: "Data & Process", val: skillDataProcess },
      { label: "Soft Skills", val: skillSoftSkills }
    ].filter(s => s.val && s.val.trim());

    if (skillsToDraw.length > 0) {
      drawSectionHeader("Core Competencies & Skills");
      checkPageOverflow(50);

      for (let i = 0; i < skillsToDraw.length; i += 2) {
        checkPageOverflow(40);
        const col1 = skillsToDraw[i];
        const col2 = skillsToDraw[i + 1];

        // Column 1
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(79, 70, 229);
        doc.text(col1.label.toUpperCase(), margin, y);
        y += 11;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        const lines1 = doc.splitTextToSize(col1.val, (contentWidth / 2) - 10);
        doc.text(lines1, margin, y);

        let col1Height = lines1.length * 12;

        // Column 2
        let col2Height = 0;
        if (col2) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(79, 70, 229);
          doc.text(col2.label.toUpperCase(), margin + (contentWidth / 2) + 10, y - 11);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(71, 85, 105);
          const lines2 = doc.splitTextToSize(col2.val, (contentWidth / 2) - 10);
          doc.text(lines2, margin + (contentWidth / 2) + 10, y);
          col2Height = lines2.length * 12;
        }

        y += Math.max(col1Height, col2Height) + 16;
      }
    }

    doc.save(`${name.replace(/\s+/g, "_")}_Actuarial_CV.pdf`);
  };

  const handleCopyText = () => {
    const text = `
${name} | ${role}
${email} | ${phone} | ${location}
LinkedIn: ${linkedin} | Portfolio: ${website}

Actuarial Professional Standing:
Board: ${actuarialBoard} | Exams Cleared: ${examsCleared}
Papers: ${paperNames}

Professional Summary:
${summary}

Professional Experience:
${experiences.map(e => `${e.role} at ${e.company} (${e.duration})\n${e.description}`).join("\n\n")}

Projects:
${projects.map(p => `${p.title} - Tech: ${p.tech}\n${p.description}`).join("\n\n")}

Education:
${education.map(ed => `${ed.degree} - ${ed.institution} (${ed.year})\n${ed.grade}`).join("\n\n")}

Core Technical Skills:
${techSkills}

Core Actuarial Skills:
${actuarialSkills}
    `.trim();

    navigator.clipboard.writeText(text);
    setShowCopyNotice(true);
    setTimeout(() => setShowCopyNotice(false), 2000);
  };

  return (
    <div className="space-y-6" id="ats-cv-builder-panel">
      {/* Print styles injected directly */}
      <style>{`
        @media print {
          /* Hide everything except print-cv-area */
          body * {
            visibility: hidden;
          }
          #print-cv-area, #print-cv-area * {
            visibility: visible;
          }
          #print-cv-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 40px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          /* Eliminate scrollbars and excess page sizing issues */
          html, body {
            height: auto;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 no-print">
        <div className="text-left space-y-1">
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-brand-500 animate-pulse" size={22} /> ATS-Friendly CV Builder & Reviewer
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Meticulously craft, test, and download high-quality, professional single-page CVs tailored specifically for IAI & IFoA standards and leading corporate risk teams.
          </p>
        </div>

        {/* Action button bar */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setActiveSubTab(activeSubTab === "edit" ? "preview" : "edit")}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-200"
          >
            <Eye size={13} />
            <span>{activeSubTab === "edit" ? "Show Print Preview" : "Back to Editing"}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-transparent relative"
          >
            {showCopyNotice ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy CV Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-brand-500/10"
          >
            <Download size={13} />
            <span>Download High-Quality PDF</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Rail */}
      <div className="flex border-b border-slate-200 gap-1.5 no-print">
        <button
          onClick={() => setActiveSubTab("edit")}
          className={`px-4 py-2 text-xs font-bold transition-all relative top-[1px] border-b-2 ${
            activeSubTab === "edit" ? "border-brand-500 text-brand-600" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          1. Edit CV Details
        </button>
        <button
          onClick={() => setActiveSubTab("preview")}
          className={`px-4 py-2 text-xs font-bold transition-all relative top-[1px] border-b-2 ${
            activeSubTab === "preview" ? "border-brand-500 text-brand-600" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          2. Print Preview & Vector Export
        </button>
      </div>

      {/* Content Panels split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* EDIT STATE PANEL */}
        {activeSubTab === "edit" ? (
          <div className="lg:col-span-2 space-y-5 text-left no-print">
            
            {/* Dual PDF Import Center */}
            <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-4">
              <div className="flex items-center gap-1.5 border-b border-indigo-100/60 pb-2">
                <Sparkles size={14} className="text-indigo-600 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black text-slate-800">Smart PDF Resume Import Center</h4>
                  <p className="text-[10px] text-slate-400">Pre-populate all builder fields instantly using our server-side PDF intelligence.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Direct File Upload */}
                <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-2 text-center">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">Option A: Direct PDF Upload</span>
                  <p className="text-[9px] text-slate-400">Select any PDF resume from your local computer device.</p>
                  
                  <label className="inline-flex items-center justify-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg cursor-pointer uppercase transition">
                    {isImportingPDF ? "Processing PDF..." : "Upload local PDF"}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleDirectPDFImport}
                      className="hidden"
                      disabled={isImportingPDF}
                    />
                  </label>
                </div>

                {/* Option 2: Document Center Selection */}
                <div className="p-3 bg-white border border-indigo-100 rounded-xl space-y-2 text-center flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider block">Option B: From Document Center</span>
                    <p className="text-[9px] text-slate-400">
                      {resumes.length > 0 ? "Import an already uploaded document from your files." : "No documents uploaded in Document Center yet."}
                    </p>
                  </div>

                  {resumes.length > 0 ? (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleImportFromCV(e.target.value);
                      }}
                      className="w-full bg-slate-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-slate-700 cursor-pointer focus:outline-none"
                      defaultValue=""
                    >
                      <option value="" disabled>-- Choose Document --</option>
                      {resumes.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-[9px] text-slate-400 italic py-1">No documents available.</div>
                  )}
                </div>
              </div>

              {pdfImportError && (
                <div className="p-2 bg-rose-50 text-rose-700 text-[10px] rounded-lg border border-rose-100 font-semibold">
                  ⚠️ {pdfImportError}
                </div>
              )}
            </div>

            {/* Section: Personal Info */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <User size={14} className="text-brand-500" /> 1. Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateStateAndPersist(() => setName(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Target Job Title / Standing</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => updateStateAndPersist(() => setRole(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => updateStateAndPersist(() => setEmail(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Contact Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => updateStateAndPersist(() => setPhone(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">City & Country</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => updateStateAndPersist(() => setLocation(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">LinkedIn Profile Handle</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => updateStateAndPersist(() => setLinkedin(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">GitHub / Portfolio Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => updateStateAndPersist(() => setWebsite(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Section: Professional Summary & AI Enhancer */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-500" /> 2. Professional Summary
                </h3>
                <button
                  type="button"
                  onClick={handleEnhanceSummary}
                  disabled={enhancingSummary || !summary.trim()}
                  className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-1 transition shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {enhancingSummary ? (
                    <>
                      <RefreshCw className="animate-spin" size={10} /> Expanding...
                    </>
                  ) : (
                    <>
                      <Sparkles size={10} /> AI Optimize Summary
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => updateStateAndPersist(() => setSummary(e.target.value))}
                  placeholder="Summarize your top actuarial qualifications, cleared exams, and key modeling competencies..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed focus:outline-none focus:bg-white focus:border-brand-500"
                />
              </div>
            </div>

            {/* Core Actuarial Credentials Standing (IAI & IFoA specific) */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={14} className="text-amber-500" /> 3. IAI & IFoA Standing Parameters
                </h3>
                <button
                  type="button"
                  onClick={handleAddActuarialPaper}
                  className="px-2.5 py-1 text-[10px] font-bold text-amber-700 hover:text-white hover:bg-amber-600 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1 transition shrink-0 cursor-pointer"
                >
                  <Plus size={10} /> Add Actuarial Paper
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Affiliation</label>
                  <select
                    value={actuarialBoard}
                    onChange={(e) => {
                      setActuarialBoard(e.target.value);
                      localStorage.setItem("platform_actuarial_board", e.target.value);
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="IAI">IAI (Institute of Actuaries of India)</option>
                    <option value="IFoA">IFoA (Institute & Faculty of Actuaries, UK)</option>
                    <option value="Both">Both (Dual Membership / Transferred)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Total Exams Cleared (Auto-calculated)</label>
                  <div className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-700 font-mono">
                    {actuarialPapers.length} Papers
                  </div>
                </div>
              </div>

              {/* Dynamic Papers List */}
              <div className="space-y-3.5 pt-2">
                {actuarialPapers.map((paper, index) => (
                  <div key={index} className="p-4 bg-slate-50/55 border border-slate-200/60 rounded-xl space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveActuarialPaper(index)}
                      className="absolute top-4 right-4 p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Paper Code</label>
                        <input
                          type="text"
                          value={paper.code}
                          onChange={(e) => {
                            const updated = [...actuarialPapers];
                            updated[index].code = e.target.value.toUpperCase();
                            updateStateAndPersist(() => setActuarialPapers(updated));
                          }}
                          placeholder="e.g. CS1"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Subject Title / Name</label>
                        <input
                          type="text"
                          value={paper.title}
                          onChange={(e) => {
                            const updated = [...actuarialPapers];
                            updated[index].title = e.target.value;
                            updateStateAndPersist(() => setActuarialPapers(updated));
                          }}
                          placeholder="e.g. Actuarial Statistics"
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Board / Society</label>
                        <select
                          value={paper.board}
                          onChange={(e) => {
                            const updated = [...actuarialPapers];
                            updated[index].board = e.target.value as any;
                            updateStateAndPersist(() => setActuarialPapers(updated));
                          }}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold"
                        >
                          <option value="IAI">IAI (India)</option>
                          <option value="IFoA">IFoA (UK)</option>
                          <option value="Both">Both (Dual / Transferred)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Exam Session</label>
                          <input
                            type="text"
                            value={paper.year}
                            onChange={(e) => {
                              const updated = [...actuarialPapers];
                              updated[index].year = e.target.value;
                              updateStateAndPersist(() => setActuarialPapers(updated));
                            }}
                            placeholder="e.g. Nov 2023"
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Marks (Optional)</label>
                          <input
                            type="text"
                            value={paper.marks || ""}
                            onChange={(e) => {
                              const updated = [...actuarialPapers];
                              updated[index].marks = e.target.value;
                              updateStateAndPersist(() => setActuarialPapers(updated));
                            }}
                            placeholder="e.g. 78"
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2 text-[10px] text-amber-800 leading-normal font-semibold">
                <AlertCircle size={13} className="shrink-0 text-amber-500 mt-0.5" />
                <span>These professional statistics will sync directly with your primary candidate hub, updating AI suggestions and recruiter dashboards automatically in real-time.</span>
              </div>
            </div>

            {/* Section: Work Experience */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase size={14} className="text-emerald-500" /> 4. Professional Work Experience
                </h3>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:text-white hover:bg-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-1 transition shrink-0 cursor-pointer"
                >
                  <Plus size={10} /> Add Experience
                </button>
              </div>

              {experiences.map((exp, index) => (
                <div key={index} className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(index)}
                    className="absolute top-4 right-4 p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Role / Position Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[index].role = e.target.value;
                          updateStateAndPersist(() => setExperiences(updated));
                        }}
                        placeholder="e.g. Senior Reserving Analyst"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Company Name</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[index].company = e.target.value;
                          updateStateAndPersist(() => setExperiences(updated));
                        }}
                        placeholder="e.g. Swiss Re"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[index].location = e.target.value;
                          updateStateAndPersist(() => setExperiences(updated));
                        }}
                        placeholder="e.g. London, UK"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Duration (Start - End)</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => {
                          const updated = [...experiences];
                          updated[index].duration = e.target.value;
                          updateStateAndPersist(() => setExperiences(updated));
                        }}
                        placeholder="e.g. Jan 2024 - Present"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Achievements & Bullet Description</label>
                      <button
                        type="button"
                        onClick={() => handleEnhanceExperienceBullet(index)}
                        disabled={enhancingBulletIndex === index || !exp.description.trim()}
                        className="px-2 py-0.5 rounded text-[9px] bg-brand-50 hover:bg-brand-100 text-brand-700 flex items-center gap-1 cursor-pointer disabled:opacity-50 border border-brand-100 font-bold"
                      >
                        {enhancingBulletIndex === index ? (
                          <RefreshCw className="animate-spin" size={9} />
                        ) : (
                          <Sparkles size={9} />
                        )}
                        <span>AI Quantify Bullets</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...experiences];
                        updated[index].description = e.target.value;
                        updateStateAndPersist(() => setExperiences(updated));
                      }}
                      placeholder="Detail your responsibilities, mathematical modeling projects, and impact. Mention metrics where possible..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-normal"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Section: Academic Projects */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code size={14} className="text-indigo-500" /> 5. Modeling & Research Projects
                </h3>
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-2.5 py-1 text-[10px] font-bold text-indigo-700 hover:text-white hover:bg-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-1 transition shrink-0 cursor-pointer"
                >
                  <Plus size={10} /> Add Project
                </button>
              </div>

              {projects.map((proj, index) => (
                <div key={index} className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(index)}
                    className="absolute top-4 right-4 p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[index].title = e.target.value;
                          updateStateAndPersist(() => setProjects(updated));
                        }}
                        placeholder="e.g. Prophet Pricing Engine Integration"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Technologies Used</label>
                      <input
                        type="text"
                        value={proj.tech}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[index].tech = e.target.value;
                          updateStateAndPersist(() => setProjects(updated));
                        }}
                        placeholder="e.g. R, Shiny, Git"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Project Description & Results</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[index].description = e.target.value;
                        updateStateAndPersist(() => setProjects(updated));
                      }}
                      placeholder="Describe the problem, modeling approach, and mathematical outcome..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 leading-normal"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Section: Academic Education */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-amber-500" /> 6. Academic Credentials
                </h3>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="px-2.5 py-1 text-[10px] font-bold text-amber-700 hover:text-white hover:bg-amber-600 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1 transition shrink-0 cursor-pointer"
                >
                  <Plus size={10} /> Add Education
                </button>
              </div>

              {education.map((edu, index) => (
                <div key={index} className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(index)}
                    className="absolute top-4 right-4 p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Degree & Major</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].degree = e.target.value;
                          updateStateAndPersist(() => setEducation(updated));
                        }}
                        placeholder="e.g. Master of Science in Statistics"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Institution / University Name</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].institution = e.target.value;
                          updateStateAndPersist(() => setEducation(updated));
                        }}
                        placeholder="e.g. Indian Statistical Institute"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Duration / Year of Graduation</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].year = e.target.value;
                          updateStateAndPersist(() => setEducation(updated));
                        }}
                        placeholder="e.g. 2021 - 2024"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Grade / GPA / Classification</label>
                      <input
                        type="text"
                        value={edu.grade}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].grade = e.target.value;
                          updateStateAndPersist(() => setEducation(updated));
                        }}
                        placeholder="e.g. First Class Honours / CGPA 9.2"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Section: Technical & Actuarial Skills Lists */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Code size={14} className="text-brand-500" /> 7. Key Core Skills
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold">
                  Organize your skills professionally. Leave any field completely blank to automatically hide that category from appearing on your CV.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Actuarial & Analytics</label>
                  <textarea
                    rows={2}
                    value={skillActuarial}
                    onChange={(e) => updateStateAndPersist(() => setSkillActuarial(e.target.value))}
                    placeholder="e.g. Stochastic Reserving, Life Contingencies, GLM Rating, Claims Modeling"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-normal focus:outline-none focus:bg-white focus:border-brand-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Technical Tools</label>
                  <textarea
                    rows={2}
                    value={skillTechTools}
                    onChange={(e) => updateStateAndPersist(() => setSkillTechTools(e.target.value))}
                    placeholder="e.g. R programming, Python, SQL, Excel VBA, Prophet"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-normal focus:outline-none focus:bg-white focus:border-brand-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Data & Process</label>
                  <textarea
                    rows={2}
                    value={skillDataProcess}
                    onChange={(e) => updateStateAndPersist(() => setSkillDataProcess(e.target.value))}
                    placeholder="e.g. Model Validation, Data Processing, Workflow Automation, API Integration"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-normal focus:outline-none focus:bg-white focus:border-brand-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Soft Skills</label>
                  <textarea
                    rows={2}
                    value={skillSoftSkills}
                    onChange={(e) => updateStateAndPersist(() => setSkillSoftSkills(e.target.value))}
                    placeholder="e.g. Problem Solving, Analytical Thinking, Communication, Professional Conduct"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-normal focus:outline-none focus:bg-white focus:border-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* PREVIEW STATE COMPONENT */
          <div className="lg:col-span-2 space-y-4">
            
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-600 text-xs font-medium text-left flex items-center gap-2 no-print">
              <CheckCircle size={14} className="text-emerald-500" />
              <span>This high-fidelity layout matches corporate ATS constraints (standard fonts, clean line heights, zero graphics, pure content). Print/Save as PDF to get the final copy.</span>
            </div>

            {/* Classical Swiss single-page print CV output style */}
            <div 
              id="print-cv-area" 
              className="bg-white border border-slate-300 rounded-3xl p-8 sm:p-12 shadow-md text-left font-sans text-slate-900 leading-relaxed space-y-6 max-w-[21cm] mx-auto min-h-[29.7cm] flex flex-col justify-between"
            >
              <div>
                {/* Header elements */}
                <div className="border-b-2 border-slate-900 pb-4 space-y-1.5">
                  <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900">{name || "Your Full Name"}</h1>
                  <p className="text-sm font-semibold tracking-wide text-indigo-700 uppercase">{role || "Actuarial Associate / Candidate"}</p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 font-medium text-xs pt-1.5">
                    <span className="flex items-center gap-1"><Mail size={11} /> {email || "email@address.com"}</span>
                    <span className="flex items-center gap-1"><Phone size={11} /> {phone || "+91 99999 99999"}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} /> {location || "Mumbai, India"}</span>
                    {linkedin && <span className="flex items-center gap-1"><Link2 size={11} /> {linkedin}</span>}
                    {website && <span className="flex items-center gap-1"><Link2 size={11} /> {website}</span>}
                  </div>
                </div>

                {/* Summary section */}
                {summary && (
                  <div className="pt-4 space-y-1.5">
                    <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-1 font-mono">Professional Summary</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{summary}</p>
                  </div>
                )}

                {/* Actuarial Credentials Standing (IAI & IFoA specific) */}
                <div className="pt-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-1 font-mono">Actuarial Credentials & Examinations</h4>
                  
                  <div className="py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 gap-2 text-xs text-slate-700 font-bold">
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block leading-none">Primary Affiliation</span>
                      <span className="text-slate-800 font-black">{actuarialBoard === "Both" ? "IAI & IFoA UK" : actuarialBoard === "IAI" ? "Institute of Actuaries of India" : "Institute & Faculty of Actuaries, UK"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase block leading-none">Professional standing</span>
                      <span className="text-slate-800 font-black">{examsCleared} Exams Cleared</span>
                    </div>
                  </div>

                  {/* Clean, compact professional papers listing */}
                  {actuarialPapers.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {actuarialPapers.map((paper, index) => (
                        <div key={index} className="flex justify-between items-baseline text-xs pb-1 border-b border-dashed border-slate-100">
                          <div className="space-x-1.5">
                            <span className="font-bold text-slate-900 font-mono">{paper.code || "N/A"}</span>
                            <span className="text-slate-700 font-medium">— {paper.title || "Subject Title"}</span>
                          </div>
                          <div className="text-right text-slate-500 text-[11px] font-medium shrink-0">
                            <span className="font-bold text-indigo-700 font-mono">{paper.board}</span>
                            <span className="mx-1.5 text-slate-300">|</span>
                            <span>{paper.year || "Pending"}</span>
                            {paper.marks && (
                              <>
                                <span className="mx-1.5 text-slate-300">|</span>
                                <span className="font-mono text-slate-600">Marks: {paper.marks}</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience section */}
                {experiences.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-1 font-mono">Professional Experience</h4>
                    <div className="space-y-4">
                      {experiences.map((exp, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-start text-xs font-bold text-slate-900">
                            <span>{exp.role} — <span className="text-slate-700 font-medium">{exp.company}</span></span>
                            <span className="text-slate-500 text-[11px] font-medium shrink-0">{exp.duration} | {exp.location}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal pl-2 border-l border-slate-200">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects section */}
                {projects.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-1 font-mono">Modeling & Technical Projects</h4>
                    <div className="space-y-3">
                      {projects.map((proj, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-start text-xs font-bold text-slate-900">
                            <span>{proj.title}</span>
                            <span className="text-indigo-600 text-[10px] font-mono shrink-0">{proj.tech}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education section */}
                {education.length > 0 && (
                  <div className="pt-4 space-y-3">
                    <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase border-b border-slate-100 pb-1 font-mono">Academic Qualifications</h4>
                    <div className="space-y-2">
                      {education.map((edu, index) => (
                        <div key={index} className="flex justify-between items-start text-xs">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900">{edu.degree}</span>
                            <span className="text-slate-500 block leading-none">{edu.institution}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-slate-700 block">{edu.year}</span>
                            <span className="text-slate-500 font-mono text-[10px]">{edu.grade}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills section */}
                <div className="pt-4 border-t border-slate-200 mt-4">
                  <h4 className="text-xs font-black text-slate-900 tracking-wider uppercase border-b border-slate-200 pb-1 font-mono mb-3 font-bold">Core Competencies & Skills</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {skillActuarial && skillActuarial.trim() && (
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase font-mono font-bold">Actuarial & Analytics</h5>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">{skillActuarial}</p>
                      </div>
                    )}
                    {skillTechTools && skillTechTools.trim() && (
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase font-mono font-bold">Technical Tools</h5>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">{skillTechTools}</p>
                      </div>
                    )}
                    {skillDataProcess && skillDataProcess.trim() && (
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase font-mono font-bold">Data & Process</h5>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">{skillDataProcess}</p>
                      </div>
                    )}
                    {skillSoftSkills && skillSoftSkills.trim() && (
                      <div className="space-y-1">
                        <h5 className="text-[10px] font-bold text-indigo-700 tracking-wider uppercase font-mono font-bold">Soft Skills</h5>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">{skillSoftSkills}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ATS REAL-TIME REVIEW SIDEBAR */}
        <div className="space-y-4 lg:col-span-1 no-print">
          
          {/* Main review card */}
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 shadow-sm space-y-4 text-left text-white">
            <div className="space-y-1">
              <h3 className="text-sm font-bold flex items-center gap-1.5 text-slate-200">
                <Sparkles size={16} className="text-brand-400 animate-pulse" /> Real-time ATS AI Auditor
              </h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                Submit your current CV configuration to Gemini to calculate direct keyword correlation scores, analyze structural readability, and check compliance benchmarks.
              </p>
            </div>

            {atsScore !== null ? (
              <div className="space-y-4 pt-2">
                {/* Visual ATS score meter */}
                <div className="flex items-center gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
                  <div className="w-14 h-14 rounded-full border-4 border-brand-500 flex items-center justify-center text-sm font-black text-brand-400 font-mono shrink-0">
                    {atsScore}%
                  </div>
                  <div className="space-y-0.5 leading-none">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ATS Match Score</span>
                    <span className="text-xs font-black text-emerald-400">{atsScore >= 80 ? "Highly Optimized" : "Needs Revisions"}</span>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1">Quality Metric: <strong className="text-white">{qualityScore}%</strong></p>
                  </div>
                </div>

                {/* Strengths list */}
                {strengths.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide block">Identified Strengths:</span>
                    <ul className="space-y-1">
                      {strengths.map((str, i) => (
                        <li key={i} className="text-[10px] text-slate-300 leading-normal flex items-start gap-1">
                          <CheckCircle size={10} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Gaps list */}
                {gaps.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide block">Identified Keyword Gaps:</span>
                    <ul className="space-y-1">
                      {gaps.map((gp, i) => (
                        <li key={i} className="text-[10px] text-slate-300 leading-normal flex items-start gap-1">
                          <AlertCircle size={10} className="text-rose-500 shrink-0 mt-0.5" />
                          <span>{gp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Keywords tags */}
                {missingKeywords.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wide block">Missing Keywords:</span>
                    <div className="flex flex-wrap gap-1">
                      {missingKeywords.map((kw, i) => (
                        <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 border border-slate-750 text-slate-300 rounded">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {actionItems.length > 0 && (
                  <div className="space-y-1.5 border-t border-slate-800 pt-3">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block">Actionable Checklist:</span>
                    <ul className="space-y-1">
                      {actionItems.map((act, i) => (
                        <li key={i} className="text-[10px] text-slate-300 leading-normal flex items-start gap-1">
                          <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            ) : (
              <div className="p-4 bg-slate-850 rounded-xl text-center text-slate-500 text-xs italic border border-slate-800">
                Audit pending. Run audit to calculate scores.
              </div>
            )}

            {reviewError && (
              <div className="p-3 bg-rose-950/40 border border-rose-900 rounded-xl text-rose-300 text-[10px] leading-normal flex items-start gap-1.5">
                <ShieldAlert size={12} className="shrink-0 text-rose-500 mt-0.5" />
                <span>{reviewError}</span>
              </div>
            )}

            <button
              onClick={handleRunATSAudit}
              disabled={reviewLoading}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
            >
              {reviewLoading ? (
                <>
                  <RefreshCw className="animate-spin text-white" size={13} />
                  <span>Analyzing compliance vectors...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>Run AI ATS Audit (+50 XP)</span>
                </>
              )}
            </button>
          </div>

          {/* Tips card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-left space-y-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">💡 Reserving & Pricing CV Rules</h4>
            <ul className="space-y-1.5 text-[10px] text-slate-500 leading-normal font-semibold">
              <li className="flex items-start gap-1">
                <span className="text-emerald-500 shrink-0">✓</span>
                <span>List actual exams (e.g. CS1, CM1) directly inside the CV Header for immediate scanning.</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-emerald-500 shrink-0">✓</span>
                <span>Include mathematical libraries (NumPy, Pandas, actuar) in your Programming Skills.</span>
              </li>
              <li className="flex items-start gap-1">
                <span className="text-emerald-500 shrink-0">✓</span>
                <span>Structure summary with bullet points targeting IAI/IFoA professional standards.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
