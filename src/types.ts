/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum InterviewMode {
  TechnicalActuarial = "Technical Actuarial Related",
  HR = "HR Interview",
  Behavioral = "Behavioral Interview",
  Managerial = "Managerial Interview",
  Partner = "Partner Interview",
  OtherActuarial = "Other Actuarial Related"
}

export enum DifficultyLevel {
  Easy = "Easy",
  Medium = "Medium",
  Hard = "Hard",
  Expert = "Expert",
  Adaptive = "Adaptive"
}

export enum InterviewerPersonality {
  Friendly = "Friendly",
  Strict = "Strict",
  RealHR = "Real HR",
  SeniorEngineer = "Senior Engineer",
  HiringManager = "Hiring Manager",
  Partner = "Partner",
  Actuary = "Actuary"
}

export interface ParsedResume {
  skills: {
    technical: string[];
    soft: string[];
  };
  experience: {
    role: string;
    company: string;
    duration: string;
    description: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
  }[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
  }[];
  certifications: string[];
  achievements: string[];
  qualityScore: number;
  atsScore: number;
  suggestions: string[];
  missingKeywords: string[];
}

export interface Resume {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  parsedData?: ParsedResume;
}

export interface ParsedJobDescription {
  title: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  yearsOfExperience: string;
  responsibilities: string[];
  educationRequirements: string;
  softSkills: string[];
}

export interface JobDescription {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  parsedData?: ParsedJobDescription;
}

export interface MatchResult {
  atsScore: number;
  skillMatchScore: number;
  missingSkills: string[];
  matchingSkills: string[];
  gapAnalysis: string;
  recommendedProjects: string[];
  recommendedCertifications: string[];
  optimizationTips: string[];
}

export interface InterviewQuestion {
  id: string;
  text: string;
  type: "concept" | "scenario" | "coding" | "math" | "mcq";
  correctAnswer?: string;
  options?: string[];
  initialCode?: string;
  testCases?: { input: string; output: string }[];
}

export interface AnswerEvaluation {
  technicalAccuracy: number;
  completeness: number;
  communication: number;
  structure: number;
  confidence: number;
  remarks: string;
  suggestedAnswer: string;
  idealAnswer: string;
}

export interface AnswerRecord {
  questionId: string;
  questionText: string;
  userAnswer: string;
  codeOutput?: string;
  evaluation?: AnswerEvaluation;
  timestamp: string;
}

export interface ReportCard {
  overallScore: number;
  technicalScore: number;
  hrScore: number;
  communicationScore: number;
  confidenceScore: number;
  starMethodScore: number;
  topicScores: { [topic: string]: number };
  weakAreas: string[];
  strongAreas: string[];
  learningRoadmap: string[];
  studyPlan?: StudyPlan;
}

export interface InterviewSession {
  id: string;
  resumeId?: string;
  jdId?: string;
  mode: InterviewMode;
  difficulty: DifficultyLevel;
  personality: InterviewerPersonality;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  transcript: AnswerRecord[];
  status: "setup" | "active" | "completed";
  reportCard?: ReportCard;
  codeLanguage?: string;
  company?: string;
  actuarialFocus?: string;
  xpEarned?: number;
  webcamEnabled?: boolean;
}

export interface StudyPlan {
  weeklyGoals: string[];
  recommendedBooks: { title: string; author: string; description: string }[];
  recommendedVideos: { title: string; platform: string; url: string }[];
  recommendedArticles: { title: string; source: string; url: string }[];
  quizzes: { question: string; options: string[]; answer: string }[];
  projects: { title: string; description: string; steps: string[] }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "reminder" | "achievement" | "report";
  timestamp: string;
  read: boolean;
}

export interface CareerPreferences {
  targetRoles: string[];
  targetCompanies: string[];
  expectedSalary: string;
  preferredLocation: string;
  experienceLevel: "Entry" | "Mid" | "Senior" | "Lead/Executive";
  industry: string;
}

export interface UserSettings {
  darkMode: boolean;
  soundEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: string;
  dailyReminderHour: number;
}

export interface SavedCompany {
  id: string;
  name: string;
  industry: string;
  overview: string;
  savedAt: string;
}

export interface SavedJobRole {
  id: string;
  title: string;
  company: string;
  expectedSalary: string;
  savedAt: string;
}

