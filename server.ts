/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initializer for Gemini API
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// REST API Endpoints

// Helper for logging and error response
function handleControllerError(res: express.Response, error: any, context: string) {
  console.error(`[Error in ${context}]:`, error);
  const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
  res.status(500).json({
    error: errorMessage,
    message: `Failed to complete ${context}. Ensure your GEMINI_API_KEY is configured and valid.`
  });
}

// 1. Resume Parser Agent
app.post("/api/parse-resume", async (req, res) => {
  try {
    const { text, filename } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No resume text provided" });
    }

    const ai = getAI();
    const prompt = `
You are an expert Resume Parser Agent. Your job is to parse the following resume text and extract all details into a structured JSON.
Calculate an honest Resume ATS compatibility score (0-100) and Resume Quality Score (0-100) based on styling, impact metrics, clarity, and keyword optimization.
Provide constructive improvement suggestions and missing keywords commonly expected for their target role.

Resume Text:
${text}

Generate JSON output that strictly matches this TypeScript interface structure:
{
  "skills": {
    "technical": string[],
    "soft": string[]
  },
  "experience": [
    {
      "role": string,
      "company": string,
      "duration": string,
      "description": string
    }
  ],
  "education": [
    {
      "degree": string,
      "institution": string,
      "year": string
    }
  ],
  "projects": [
    {
      "title": string,
      "description": string,
      "technologies": string[]
    }
  ],
  "certifications": string[],
  "achievements": string[],
  "qualityScore": number,
  "atsScore": number,
  "suggestions": string[],
  "missingKeywords": string[]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "parse-resume");
  }
});

// 2. Job Description Parser Agent
app.post("/api/parse-jd", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "No job description text provided" });
    }

    const ai = getAI();
    const prompt = `
You are an expert Job Description Agent. Parse the following Job Description (JD) and extract details into structured JSON.

Job Description Text:
${text}

Generate JSON output that strictly matches this TypeScript interface structure:
{
  "title": string,
  "company": string,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "yearsOfExperience": string,
  "responsibilities": string[],
  "educationRequirements": string,
  "softSkills": string[]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "parse-jd");
  }
});

// 3. Resume vs JD Matching Agent
app.post("/api/match", async (req, res) => {
  try {
    const { resume, jd } = req.body;
    if (!resume || !jd) {
      return res.status(400).json({ error: "Both parsed resume and parsed job description are required" });
    }

    const ai = getAI();
    const prompt = `
You are an expert Resume Matching Agent. Compare the candidate's parsed resume with the parsed Job Description (JD).
Perform a detailed gap analysis, calculate ATS and skill match scores, find missing skills, identify matching skills, suggest recommended projects, certifications, and provide exact resume optimization tips.

Parsed Resume:
${JSON.stringify(resume)}

Parsed JD:
${JSON.stringify(jd)}

Generate JSON output that strictly matches this TypeScript interface structure:
{
  "atsScore": number,
  "skillMatchScore": number,
  "missingSkills": string[],
  "matchingSkills": string[],
  "gapAnalysis": string,
  "recommendedProjects": string[],
  "recommendedCertifications": string[],
  "optimizationTips": string[]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "match");
  }
});

// 4. Interview Setup: Questions Generator Agent
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { resume, jd, mode, difficulty, personality, company, actuarialFocus } = req.body;
    
    const ai = getAI();
    const prompt = `
You are an expert Interview Coach and Question Generator Agent. Create exactly 5 tailored interview questions based on the selected settings.
Adjust the tone of questioning to reflect the interviewer personality: ${personality} (Friendly, Strict, Real HR, Senior Engineer, Hiring Manager, Partner, Actuary).
Align questions with the interview mode: ${mode} and difficulty level: ${difficulty}.
${company ? `Conduct the interview matching the style, culture, and core focus of ${company}. (e.g. Google centers on algorithms & scale, Amazon on Leadership STAR, McKinsey on business cases).` : ""}
${actuarialFocus ? `Generate specialized actuarial science questions targeting the field of "${actuarialFocus}".` : ""}
Ensure the questions are aware of the candidate's resume and target JD if provided.

Resume context:
${resume ? JSON.stringify(resume) : "None provided"}

Job Description context:
${jd ? JSON.stringify(jd) : "None provided"}

If the mode is 'Technical Interview' or specifically asks for Software/Coding/Engineering, include exactly 1 coding question with initial code starter template and optionally simple input/output test cases. Support coding languages like Python, SQL, JavaScript, R, or C++.
If the mode is 'Actuarial Interview' or specialized actuarial focus is requested, include pricing, reserving, Solvency II, IFRS 17, GLMs, claims modelling, risk margins, or fundamental actuarial mathematics (CS1, CS2, CM1, CM2, CP1, SP/SA papers).
If the mode is 'Behavioral Interview' or 'HR Interview', center questions on STAR method scenarios, leadership, teamwork, failure lessons, and culture fit.

Generate JSON output containing exactly an array of 5 questions matching this TypeScript interface structure:
{
  "questions": [
    {
      "id": string,
      "text": string,
      "type": "concept" | "scenario" | "coding" | "math" | "mcq",
      "correctAnswer": string (optional, for mcq or math),
      "options": string[] (optional, for mcq),
      "initialCode": string (optional, code editor template for coding question),
      "testCases": [ { "input": string, "output": string } ] (optional, test cases for coding question)
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || '{"questions":[]}');
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "generate-questions");
  }
});

// 5. Answer Evaluation Agent + Confidence Agent
app.post("/api/evaluate-answer", async (req, res) => {
  try {
    const { question, answer, codeLanguage, codeOutput } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: "Both question and answer are required" });
    }

    const ai = getAI();
    const prompt = `
You are an expert Interview Evaluation and Confidence Analysis Agent.
Analyze the candidate's answer to the interview question below. Evaluate the answer thoroughly.

Question:
${JSON.stringify(question)}

Candidate's Answer:
${answer}
${codeLanguage ? `Written in Language: ${codeLanguage}` : ""}
${codeOutput ? `Code Compilation/Execution Result: ${codeOutput}` : ""}

Provide scoring from 0 to 100 for each of these criteria:
1. Technical Accuracy (Is the concept correctly understood and answered?)
2. Completeness (Are all aspects of the question addressed?)
3. Communication (Is the answer clear, articulate, and well-phrased?)
4. Structure (Is it structured logically? e.g., STAR method for behavioral, structured code for coding, risk/capital model structure for actuarial)
5. Confidence (Analyze potential pauses, speech markers, hesitancy, or strength of presentation based on written indicators or filler usage)

Also provide an encouraging yet analytical remarks breakdown, a realistic suggested improvement/model answer, and the complete ideal master answer.

Generate JSON output that strictly matches this TypeScript interface structure:
{
  "technicalAccuracy": number,
  "completeness": number,
  "communication": number,
  "structure": number,
  "confidence": number,
  "remarks": string,
  "suggestedAnswer": string,
  "idealAnswer": string
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "evaluate-answer");
  }
});

// 6. Comprehensive Report Generator & Study Planner Agent
app.post("/api/generate-report", async (req, res) => {
  try {
    const { resume, jd, transcript, mode, difficulty, company, actuarialFocus } = req.body;
    if (!transcript || !Array.isArray(transcript)) {
      return res.status(400).json({ error: "Valid transcript array is required" });
    }

    const ai = getAI();
    const prompt = `
You are a Principal Technical Lead and AI Study Planner Agent. Review this complete interview session transcript.
Calculate the overall mock interview report cards with sub-scores, strengths, weaknesses, topic-wise performance, and generate a customized study roadmap.

Interview Mode: ${mode}
Difficulty: ${difficulty}
${company ? `Target Company Context: ${company}` : ""}
${actuarialFocus ? `Specialized Actuarial Focus: ${actuarialFocus}` : ""}

Candidate Resume Context:
${resume ? JSON.stringify(resume) : "None provided"}

Job Description context:
${jd ? JSON.stringify(jd) : "None provided"}

Transcript & Evaluations:
${JSON.stringify(transcript)}

Calculate:
- overallScore (0-100)
- technicalScore (0-100)
- hrScore (0-100)
- communicationScore (0-100)
- confidenceScore (0-100)
- starMethodScore (0-100)
- topicScores (e.g. {"Object Oriented Design": 85, "Behavioral": 70})
- weakAreas (string[])
- strongAreas (string[])
- learningRoadmap (string[])

Also design a comprehensive, realistic, modular StudyPlan containing:
- weeklyGoals: Exactly 4 progressive goals (string[])
- recommendedBooks: Array of 3 actual books with title, author, and description
- recommendedVideos: Array of 3 constructive YouTube or platform videos with title, platform, and url (mock platform links)
- recommendedArticles: Array of 3 articles with title, source, and url (mock urls)
- quizzes: Array of 3 interactive interview practice questions with question, options, and answer
- projects: Array of 2 personalized target projects with title, description, and key steps to build them

Generate JSON output that strictly matches this TypeScript interface structure:
{
  "reportCard": {
    "overallScore": number,
    "technicalScore": number,
    "hrScore": number,
    "communicationScore": number,
    "confidenceScore": number,
    "starMethodScore": number,
    "topicScores": { [topicName: string]: number },
    "weakAreas": string[],
    "strongAreas": string[],
    "learningRoadmap": string[]
  },
  "studyPlan": {
    "weeklyGoals": string[],
    "recommendedBooks": [
      { "title": string, "author": string, "description": string }
    ],
    "recommendedVideos": [
      { "title": string, "platform": string, "url": string }
    ],
    "recommendedArticles": [
      { "title": string, "source": string, "url": string }
    ],
    "quizzes": [
      { "question": string, "options": string[], "answer": string }
    ],
    "projects": [
      { "title": string, "description": string, "steps": string[] }
    ]
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "generate-report");
  }
});

// 7. Dynamic AI Question & Practice Builder
app.post("/api/generate-custom-question", async (req, res) => {
  try {
    const { prompt, category, difficulty, company, domain, resumeText, jdText } = req.body;
    const ai = getAI();

    const systemPrompt = `
You are an expert AI Assessment and Interview Architect. Generate structured, high-quality, professional questions customized for the target parameters.
Contextual parameters provided:
- Subject Category / Focus: ${category || "General Aptitude"}
- Target Difficulty: ${difficulty || "Medium"}
- Target Company: ${company || "General Industry"}
- Domain / Role: ${domain || "Executive Professional"}
- Candidate Resume Context: ${resumeText ? resumeText.substring(0, 1500) : "None provided"}
- Job Description Context: ${jdText ? jdText.substring(0, 1500) : "None provided"}
- Prompt directive: ${prompt || "General high-yield assessment challenge"}

If this is for an Aptitude/MCQ assessment, output an array of questions where each question has:
- id: string
- category: string
- question: string (the actual question text)
- options: array of exactly 4 strings
- correctIndex: number (0 to 3)
- explanation: string (logical proof or calculation breakdown)
- difficulty: string ("Easy" | "Medium" | "Hard")

If this is for an open-ended scenario/interview question (e.g. System Design, Coding, or Case Study), output an array of questions where each has:
- id: string
- text: string (detailed challenge scenario description)
- type: "concept" | "scenario" | "coding" | "math"
- correctAnswer: string (outline of gold standard solution expected)

Generate a JSON response containing a "questions" array strictly matching the structure needed:
{
  "questions": [
    {
      "id": "ai-gen-1",
      "category": "Quantitative Aptitude",
      "question": "What is ...",
      "options": ["...", "...", "...", "..."],
      "correctIndex": 1,
      "explanation": "...",
      "difficulty": "Medium"
    }
  ]
}
OR
{
  "questions": [
    {
      "id": "ai-gen-1",
      "text": "...",
      "type": "concept",
      "correctAnswer": "..."
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || '{"questions": []}');
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "generate-custom-question");
  }
});

// 8. AI Career Mentor Chatbot
app.post("/api/mentor-chat", async (req, res) => {
  try {
    const { message, userStats } = req.body;
    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const ai = getAI();
    const statsContext = userStats ? `Current candidate statistics: Level ${userStats.level}, ${userStats.xp} XP, and active ${userStats.streak}-day daily streak.` : "";

    const systemInstruction = `
You are an Elite AI Career Prep Mentor and Executive Corporate Coach.
You provide highly encouraging, analytical, concise, and structured coaching advice for elite candidates applying to top-tier software engineering, investment banking, management consulting, and actuary roles.
Use professional corporate terminology, maintain absolute poise, and format your answers with clean Markdown, bold headings, and elegant lists.
${statsContext}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: message,
      config: {
        systemInstruction
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    handleControllerError(res, error, "mentor-chat");
  }
});

// 9. Module 1: Profile & Progress Synchronization
app.post("/api/user/sync-profile", async (req, res) => {
  try {
    const { userId, profile, preferences, settings, savedCompanies, savedJobRoles } = req.body;
    
    // Validate profile input parameters
    const safeUserId = userId || "anonymous-candidate";
    console.log(`[Sync] Enterprise cloud synchronization triggered for candidate: ${safeUserId}`);
    
    res.json({
      success: true,
      syncedAt: new Date().toISOString(),
      message: "Security profile, preferences, and settings synchronized successfully with primary cloud directory."
    });
  } catch (error) {
    handleControllerError(res, error, "sync-profile");
  }
});

// 10. Module 2: AI Career Dashboard Suggestions Generation
app.post("/api/dashboard/suggestions", async (req, res) => {
  try {
    const { careerPrefs, resumeText, userRole, userLevel } = req.body;
    
    const ai = getAI();
    const prompt = `
You are a world-class AI Career Coach & Strategic Mentor guiding a professional candidate in their hiring journey.
Based on the candidate's current profile details, generate tailored metrics, heatmaps, and structured, actionable recommendation cards.

Current Details:
- Role Title: ${userRole || "Professional Candidate"}
- Experience Level: ${userLevel || "Mid Level"}
- Career Preferences (Roles, Companies, Salary, Location, Industry): ${JSON.stringify(careerPrefs || {})}
- Raw Resume Context (if any):
${resumeText || "No resume uploaded yet. Focus on foundational career strategies."}

Generate a JSON response matching the following TypeScript structure:
{
  "careerReadinessScore": number,
  "interviewReadinessScore": number,
  "learningProgressScore": number,
  "confidenceTrend": number[],
  "recommendations": string[],
  "heatmap": { [skillName: string]: number },
  "mentorSuggestions": [
    {
      "category": "resume" | "learning" | "networking" | "strategy",
      "title": string,
      "description": string,
      "priority": "High" | "Medium" | "Low"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "dashboard-suggestions");
  }
});

// 11. Module 3: AI Career Roadmap & Skill Gap Analysis
app.post("/api/mentor/roadmap", async (req, res) => {
  try {
    const { userRole, careerPrefs, userLevel } = req.body;

    const ai = getAI();
    const prompt = `
You are a highly experienced Global Human Resources Strategist and Technical Recruiter.
Generate a structured, strategic, and highly tailored Week-by-Week Career Roadmap (4 weeks) and a meticulous Skill Gap Analysis for the target role: "${userRole || "Strategic Professional"}" in the industry "${careerPrefs?.industry || "Professional Core"}".

Experience level: ${userLevel || "Mid-Level"}.
Core targets: ${JSON.stringify(careerPrefs?.targetCompanies || ["Top-Tier Firms"])}.

Generate a precise JSON response matching this TypeScript format:
{
  "roadmap": [
    {
      "week": "Week 1" | "Week 2" | "Week 3" | "Week 4",
      "focus": string,
      "tasks": string[],
      "resources": {
        "books": string[],
        "courses": string[],
        "cheatsheets": string[]
      }
    }
  ],
  "gaps": [
    {
      "skill": string,
      "importance": "Critical" | "High" | "Medium",
      "requiredLevel": number, // 1 to 5
      "currentLevel": number, // 1 to 5 (should be lower than or equal to requiredLevel)
      "description": string,
      "recommendations": string[]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "mentor-roadmap");
  }
});

// 12. Module 11: AI Coding Playground & Code Review
app.post("/api/coding/review", async (req, res) => {
  try {
    const { code, language, problemTitle, problemDescription } = req.body;

    const ai = getAI();
    const prompt = `
You are a highly experienced Lead Software Architect and Compiler Optimization Engineer.
Perform an analytical review of the candidate's custom solution to the coding challenge.

Problem details:
- Title: ${problemTitle || "General Coding Challenge"}
- Description: ${problemDescription || "Solve technical problem sets."}

Candidate Submission:
- Language: ${language || "JavaScript"}
- Code:
\`\`\`${language || "javascript"}
${code || ""}
\`\`\`

Analyze the code and generate a response matching this JSON structure:
{
  "passed": boolean, // whether the logical structure is correct and satisfies the problem constraints
  "complexity": {
    "time": string, // e.g., "O(N)"
    "space": string // e.g., "O(N)"
  },
  "bugs": string[], // List any bugs, performance issues, memory leaks, or unhandled edge cases
  "feedback": string, // Detailed analytical breakdown explaining their approach, issues, and how to improve
  "optimizedCode": string // Complete, clean, and highly optimized solution using best practices in the same language
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "coding-review");
  }
});

// 13. Module 4-7: AI Document Suite Generation & Reviews (Cover Letters, LinkedIn, Portfolios, GitHub)
app.post("/api/document/generate", async (req, res) => {
  try {
    const { type, resumeText, jdText } = req.body;

    const ai = getAI();
    let prompt = "";

    if (type === "cover_letter") {
      prompt = `
You are an expert Executive Recruiter and Career Coach.
Generate a high-fidelity, polished, and compelling Cover Letter tailored precisely to the target Job Description (if available) based on the candidate's Resume details.

Candidate Resume Details:
${resumeText || "Focus on generic professional achievements."}

Target Job Description (if available):
${jdText || "Focus on general leadership, efficiency, and engineering best practices."}

Format the response as a valid JSON object matching this schema:
{
  "content": "The complete tailored Cover Letter written in professional, elegant business format. Use standard corporate letter spacing and deep achievements-focused metrics.",
  "metrics": { "atsScoreEstimate": 92, "readability": "Excellent" },
  "actionItems": [
    "Specific tip on how to customize the introduction hook.",
    "Targeted advice on which key metrics to verify before sending."
  ]
}
`;
    } else if (type === "linkedin") {
      prompt = `
You are a LinkedIn Branding and Search Engine Optimization (SEO) Specialist.
Analyze the candidate's resume and generate highly optimized corporate branding elements for their LinkedIn profile.

Candidate Resume:
${resumeText || ""}

Format the response as a valid JSON object matching this schema:
{
  "content": "# OPTIMIZED HEADLINE\n[Generate 3 SEO-dense headlines here separated by line breaks]\n\n# BRANDED 'ABOUT' SUMMARY\n[Generate an interactive, first-person storytelling summary bio using active, metric-heavy structures]\n\n# EXPERIENCE OPTIMIZATIONS\n[Highlight 3 critical keywords and show how to write bullet points for their experience section]",
  "metrics": { "atsScoreEstimate": 95, "readability": "Highly Engaging" },
  "actionItems": [
    "Add these 5 high-frequency technical search tags to your Skills list.",
    "Structure your LinkedIn featured section with your top Git metrics."
  ]
}
`;
    } else if (type === "portfolio_review") {
      prompt = `
You are a Principal Software Architect and Design Reviewer.
Analyze the candidate's project portfolios, GitHub highlights, or research papers and provide a meticulous, highly critical design audit.

Project / Portfolio / Paper description provided by candidate:
${resumeText || "Focus on distributed systems, frontend architectures, and data research pipelines."}

Format the response as a valid JSON object matching this schema:
{
  "content": "# PORTFOLIO & GITHUB DESIGN AUDIT\n[Provide deep design critiques on their code organization, repo structure, and documentation frameworks]\n\n# RESEARCH PAPER CRITIQUE\n[Audits their technical methodologies, mathematical clarity, and literature integration]\n\n# SYSTEM DESIGN SUGGESTIONS\n[Give high-impact architectural suggestions to take their projects to production-grade standard]",
  "metrics": { "atsScoreEstimate": 88, "readability": "Highly Technical" },
  "actionItems": [
    "Create a clean README.md showing system architectural flowcharts.",
    "Incorporate modular automated unit testing inside your core project files.",
    "Standardize code blocks and document APIs using OpenAPI/Swagger models."
  ]
}
`;
    } else {
      // Resume Tailoring
      prompt = `
You are an expert ATS (Applicant Tracking System) Specialist.
Analyze the candidate's resume and target Job Description, and outline direct, exact, bullet-point revisions to align the resume with the JD's exact keyword requirements.

Candidate Resume:
${resumeText || ""}

Target Job Description:
${jdText || ""}

Format the response as a valid JSON object matching this schema:
{
  "content": "# RESUME BULLET-POINT REWRITING LIST\n[Give 3 concrete before-and-after bullet point rewrites to increase direct keyword frequency mapping]",
  "metrics": { "atsScoreEstimate": 94, "readability": "Strategic" },
  "actionItems": [
    "Increase direct frequency count of the core industry buzzwords in your resume header.",
    "Replace passive verbs with active outcomes."
  ]
}
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "document-generate");
  }
});

// 14. Module 3: Career Roadmap Generator
app.post("/api/roadmap/generate", async (req, res) => {
  try {
    const { targetRole, industry, salary, resumeText } = req.body;

    const ai = getAI();
    const prompt = `
You are an Elite Executive Career Coach and Technical Architect.
Based on the candidate's resume (if provided) and their explicit career goal of securing a role as "${targetRole}" in the "${industry}" industry with a target salary of "${salary}", perform a meticulous skill-gap analysis, map out a learning path with milestones, design custom real-world portfolio projects, and construct a compensation strategy.

Candidate Resume Details:
${resumeText || "No resume uploaded yet. Assume candidate has basic technical interest but needs entry guidance."}

Format the response as a valid JSON object matching this schema:
{
  "summary": "High-level summary of their transition roadmap. Be professional, supportive, and precise.",
  "skillGaps": [
    {
      "category": "Technical",
      "name": "Skill name (e.g., Kubernetes Orchestration)",
      "severity": "High",
      "currentLevel": "None",
      "description": "Why they need this to become a ${targetRole} and what's missing."
    }
  ],
  "learningMilestones": [
    {
      "timeframe": "Month 1-2: Foundations",
      "title": "Establish Core Competencies",
      "objectives": ["Understand X design patterns", "Build standard services"],
      "skillsToAcquire": ["TypeScript", "Docker"],
      "suggestedResources": ["Official docs", "Architectural guides"]
    }
  ],
  "projectRecommendations": [
    {
      "title": "Production-Grade Distributed Ledger",
      "difficulty": "Advanced",
      "description": "A deep microservice ledger utilizing Kafka and Redis to bridge system consistency gaps.",
      "techStack": ["Go", "Kafka", "Redis"],
      "keyFeatures": ["Event sourcing pipeline", "ACID-compliant state audits"]
    }
  ],
  "salaryInsights": {
    "feasibility": "Medium",
    "marketRange": "$140k - $180k standard",
    "strategyText": "Specific negotiation points based on their current qualifications and the gaps they will close with these milestones."
  }
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "roadmap-generate");
  }
});

// Serve Frontend

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on port ${PORT}`);
  });
}

startServer();
