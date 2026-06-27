# AI Career Operating System (AI-COS)
## Comprehensive Enterprise System Architecture & Design Document (Module 20)

This document details the software architecture, database schemas, agent workflows, and API specifications for **AI Career Operating System (AI-COS)**, an all-in-one SaaS platform enabling candidates to navigate their full professional lifecycle from learning to receiving offers.

---

## 1. Executive Summary & Product Vision
AI-COS transitions the standard interview preparation application into a comprehensive career growth engine. By linking resume analysis, skill-gap detection, customized learning, timed exams, and high-fidelity interview environments with automated multi-agent AI assessment, the system operates as an end-to-end recruiter, mentor, and mock interviewer.

---

## 2. Technology Stack
The platform uses an elite, high-performance modern web stack optimized for developer speed, type safety, and seamless runtime capabilities:

*   **Frontend**: React 18 with Vite, designed as a fast-rendering Single Page Application (SPA).
*   **Styling**: Tailwind CSS for responsive, accessible, and high-contrast user interfaces with Inter and JetBrains Mono typography.
*   **Animations**: Framer Motion (`motion/react`) for fluid transitions, micro-interactions, and route morphs.
*   **Charts & Visualization**: Recharts & D3 for dynamic skill heatmaps, confidence trends, and assessment breakdown analytics.
*   **Backend**: Node.js & Express using modern TypeScript with strict type declarations.
*   **Database & Storage**: Firebase Firestore for persistent user data, resume states, roadmap models, and transcripts.
*   **AI Orchestration**: Gemini 2.5 & 3.5 Models via the modern `@google/genai` TypeScript SDK.
*   **Speech Services**: Browser Web Speech API for low-latency Speech-to-Text (STT) and native Speech Synthesis (TTS).

---

## 3. Directory & Folder Structure
A highly modular structure guarantees that backend logic and React components can scale to 20+ feature blocks without file clutter or merge conflicts:

```text
/
├── .env.example                # Environment variable templates
├── firebase-blueprint.json     # Initial Firestore collections and documents setup
├── firestore.rules             # Database security policies
├── package.json                # Project dependencies and script declarations
├── server.ts                   # Express Backend Entrypoint & Vite Hot Middleware
├── metadata.json               # Sandbox frame permissions & name meta
├── docs/
│   └── SYSTEM_DESIGN.md        # This document
└── src/
    ├── main.tsx                # Client bundle mounting entrypoint
    ├── index.css               # Global Tailwind directives & custom CSS variables
    ├── App.tsx                 # Core App Shell & Global Router Layer
    ├── types.ts                # Strict Shared TypeScript interfaces & enums
    ├── components/             # Reusable UI Blocks & Modals
    │   ├── AIMentorHub.tsx      # Module 15: Coaching Hub & Analytics
    │   ├── AssessmentCenter.tsx # Module 10: Aptitude & Technical Exam Center
    │   ├── Dashboard.tsx        # Module 2: Metrics, Scorecard, and Goal Tracker
    │   ├── DocumentUpload.tsx   # Module 4: Resume Center, ATS score, Parsing
    │   ├── InterviewSession.tsx # Module 13: Immersive Simulated Room Interface
    │   ├── InterviewSetup.tsx   # Module 12: Interview Parameters Setup
    │   ├── QuestionBankHub.tsx  # Module 9: Browse, filter, and dynamic AI Practice sandbox
    │   ├── ReportViewer.tsx     # Module 12: Performance report cards
    │   ├── CareerRoadmap.tsx    # Module 3: Interactive Roadmap generation
    │   ├── CoverLetterHub.tsx   # Module 5: Tailored letter builder & Review
    │   ├── LinkedInOptimizer.tsx# Module 6: Profile auditor and upgrade suggestion card
    │   ├── PortfolioReview.tsx  # Module 7: Repository & website checklist review
    │   ├── LearningHub.tsx      # Module 8: Flashcard Revision & Formulas board
    │   ├── CodingSandbox.tsx    # Module 11: Editor and hidden test cases
    │   ├── JobTracker.tsx       # Module 16: Kanban application pipeline
    │   ├── RecruiterMode.tsx    # Module 18: Scorecards & candidate management panel
    │   └── common/              # Shared visual widgets (buttons, badges)
    └── lib/
        └── utils.ts            # Classnames merges (cn) helper
```

---

## 4. Database Schema & Data Models
The data layer leverages Firestore's collection-document architecture, providing fast query times, live subscription hooks, and flexible nesting.

### Entity Relationship Model Overview
```text
  [Users] 1 ------- 0..* [Resumes]
     |
     1
     |
     +---------- 0..* [JobDescriptions]
     |
     +---------- 0..* [InterviewSessions] --- 1..* [AnswerRecords]
     |
     +---------- 0..* [AptitudeTestAttempts]
     |
     +---------- 0..* [JobApplications]
     |
     +---------- 1    [UserStats]
```

### Collection: `/users`
Stores core authentication profile references, preferences, and settings.
*   **Fields**:
    *   `id`: `string` (Primary Key, matching Auth UID)
    *   `email`: `string`
    *   `displayName`: `string`
    *   `careerPreferences`: `map` { `targetRoles`: `array`, `targetCompanies`: `array`, `experienceLevel`: `string` }
    *   `createdAt`: `timestamp`

### Collection: `/resumes`
Holds uploaded files and structured parser outputs.
*   **Fields**:
    *   `id`: `string`
    *   `userId`: `string` (Foreign Key -> `/users`)
    *   `name`: `string`
    *   `rawText`: `string`
    *   `parsedData`: `map` (Structured parsed experience, skills, metrics matching `ParsedResume` type)
    *   `createdAt`: `timestamp`

### Collection: `/interviewSessions`
Captures metadata, active questions, transcripts, and evaluation scorecards for mock runs.
*   **Fields**:
    *   `id`: `string`
    *   `userId`: `string` (Foreign Key -> `/users`)
    *   `resumeId`: `string`
    *   `jdId`: `string`
    *   `mode`: `string` (e.g., "Technical", "Behavioral", "Case Study")
    *   `difficulty`: `string`
    *   `personality`: `string`
    *   `company`: `string`
    *   `questions`: `array` of questions with IDs, texts, types, and model options
    *   `currentQuestionIndex`: `number`
    *   `transcript`: `array` of answer structures, user drafts, voice transcripts, and immediate metrics
    *   `reportCard`: `map` (Aggregate score, feedback paragraphs, STAR ratings, topic trends)
    *   `status`: `string` ("setup" | "active" | "completed")

### Collection: `/aptitudeAttempts`
Tracks results from timed quantitative or abstract test suites.
*   **Fields**:
    *   `id`: `string`
    *   `userId`: `string`
    *   `category`: `string`
    *   `score`: `number`
    *   `totalQuestions`: `number`
    *   `correctCount`: `number`
    *   `durationSecs`: `number`
    *   `completedAt`: `timestamp`

### Collection: `/jobApplications`
Drives the Job Application Pipeline (Kanban format).
*   **Fields**:
    *   `id`: `string`
    *   `userId`: `string`
    *   `company`: `string`
    *   `role`: `string`
    *   `status`: `string` ("Saved" | "Applied" | "OA" | "Interview" | "Offer" | "Rejected")
    *   `salary`: `string`
    *   `reminderDate`: `timestamp`
    *   `notes`: `string`

---

## 5. Sequence Diagrams

### Interactive Interview Generation & Real-time Evaluation
```text
User/Client                Express Server            Gemini API
   │                             │                       │
   │─── Post Interview Setup ───>│                       │
   │    Parameters               │─── Build prompt with ─>│
   │                             │    Resume + JD        │
   │                             │                       │
   │                             │<── Questions JSON ────│
   │<── Render Questions List ───│                       │
   │                             │                       │
   │─── Submit Response ────────>│                       │
   │    (Text / Voice text)      │─── Request detailed ─>│
   │                             │    evaluation metrics │
   │                             │                       │
   │                             │<── Scorecard JSON ────│
   │<── Display Feedbacks ───────│                       │
```

---

## 6. Detailed API Specifications
Backend routing is exposed under `/api/*` prefix, keeping sensitive API keys and logical scoring server-side.

### 1. Resume Parser (`POST /api/parse-resume`)
Extracts structural parameters from raw resumes.
*   **Payload**: `{ text: string }`
*   **Response**: `{ success: boolean, parsedData: ParsedResume }`

### 2. Job Match & Alignment Analyzer (`POST /api/match-job`)
Performs ATS alignment check, gap analysis, and generates recommended projects.
*   **Payload**: `{ resumeText: string, jdText: string }`
*   **Response**: `{ success: boolean, match: MatchResult }`

### 3. Interview Generator (`POST /api/generate-interview`)
Creates customized interview questions.
*   **Payload**: `{ resumeText: string, jdText: string, mode: string, difficulty: string, company: string }`
*   **Response**: `{ questions: InterviewQuestion[] }`

### 4. Answer Evaluator (`POST /api/evaluate-answer`)
Generates structural score breakdowns, remarks, and model responses for a given answer.
*   **Payload**: `{ question: InterviewQuestion, answer: string }`
*   **Response**: `{ technicalAccuracy: number, completeness: number, communication: number, structure: number, confidence: number, remarks: string, suggestedAnswer: string, idealAnswer: string }`

### 5. Final Report Generator (`POST /api/generate-report`)
Assembles the multi-week custom roadmap and final overall score matrix.
*   **Payload**: `{ transcript: AnswerRecord[], mode: string }`
*   **Response**: `{ reportCard: ReportCard }`

---

## 7. Multi-Agent Orchestration Layer
To provide authentic SaaS coaching and prevent bloated singular AI instructions, the core leverages specialized agents linked via a shared controller:

1.  **ATS & Career Coach Agent**: Specialized in scanning resume layouts, matching keywords against JD text, and scoring alignment.
2.  **Aptitude Generator Agent**: Focuses on formulating logical matrices, quantitative math questions, and business-focused cases with detailed step-by-step proofs.
3.  **Technical & Coding Agent**: Generates code challenges, designs unit tests, checks performance complexity ($O(N)$ etc.), and suggests memory optimizations.
4.  **Interviewer Agent**: Takes on distinctive persona profiles (Strict, Friendly, Partner) and drives realistic contextual follow-up questioning during mocks.
5.  **Mentor Chatbot Agent**: General expert advisor on networking, salaries, offer negotiation, and motivational feedback loops.

---

## 8. Caching, Security & Performance Strategy
*   **State Management**: Transient visual and checklist states reside in clean client-side React contexts to maintain an immediate, reactive UI experience without network overhead.
*   **Security Rules**: Firestore security policies prevent users from accessing or modifying transcripts and scorecards belonging to other candidate accounts.
*   **Error Boundaries**: Robust client-side error handling guarantees that if an API gateway or Gemini query runs into rate limits, the app seamlessly falls back to local databases.
*   **Network & Port Constraint**: The full application strictly listens on port `3000` via Express + Vite middleware, complying with proxy setups.

---
This architecture establishes the structural scaffolding. We can now implement and upgrade individual modules sequentially to form the world-class AI Career Operating System.
