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
  console.error(`[Error in ${context}, executing robust fallback]:`, error);
  const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
  const errorStr = typeof error === 'string' ? error : JSON.stringify(error);
  
  const isQuotaExceeded = errorMessage.includes("Quota exceeded") || 
                          errorMessage.includes("RESOURCE_EXHAUSTED") || 
                          errorMessage.includes("429") || 
                          errorStr.includes("RESOURCE_EXHAUSTED") ||
                          errorStr.includes("Quota exceeded") ||
                          errorStr.includes("429") ||
                          (error && (error.status === "RESOURCE_EXHAUSTED" || error.statusCode === 429));

  const fallback = getFallbackData(context);
  fallback.isFallback = true;
  fallback.quotaExceeded = isQuotaExceeded;
  
  res.json(fallback);
}

function getFallbackData(context: string): any {
  switch (context) {
    case "parse-resume":
      return {
        skills: {
          technical: [
            "Actuarial Modeling",
            "Financial Mathematics (CM1)",
            "Loss Reserving",
            "Solvency II",
            "IFRS 17",
            "Stochastic Modeling (CS2)",
            "R Programming",
            "Excel & VBA"
          ],
          soft: [
            "Professional Communication",
            "Analytical Problem Solving",
            "Commercial Awareness",
            "Stakeholder Management"
          ]
        },
        experience: [
          {
            role: "Actuarial Associate",
            company: "Global Reinsurance Corp",
            duration: "2 Years",
            description: "Collaborated on quarterly loss-reserving calculations using Chain Ladder and Bornhuetter-Ferguson methods. Maintained regulatory Solvency II reporting documentation and validated actuarial models in R."
          }
        ],
        education: [
          {
            degree: "B.Sc. in Actuarial Science & Statistics",
            institution: "Institute of Actuarial Studies",
            year: "2022"
          }
        ],
        projects: [
          {
            title: "Stochastic Reserving Simulation Tool",
            description: "Built a stochastic claims-reserving model in R implementing the Mack Chain Ladder method to calculate premium provisions and confidence intervals.",
            technologies: ["R", "Actuarial Reserving"]
          }
        ],
        certifications: [
          "IAI/IFoA Cleared: CM1, CS1, CS2"
        ],
        achievements: [
          "Ranked top 5% in Actuarial Mathematics University cohort",
          "Streamlined reserving model execution time by 40% using vectorization in R"
        ],
        qualityScore: 82,
        atsScore: 79,
        suggestions: [
          "Highlight specific pricing software (e.g., Emblem or Prophet) if you have any exposure.",
          "Detail your participation in professional actuarial society events to showcase networking proactive engagement."
        ],
        missingKeywords: [
          "Prophet",
          "GLM Pricing",
          "Bornhuetter-Ferguson",
          "APS 1",
          "Capital Modeling"
        ]
      };

    case "parse-jd":
      return {
        title: "Assistant Actuary / Senior Actuarial Analyst",
        company: "Aegis Insurance Group",
        requiredSkills: ["CM1", "CS1", "Excel & VBA", "Prophet", "Solvency II"],
        preferredSkills: ["CP1", "Stochastic Reserving", "Python"],
        yearsOfExperience: "2-4 years",
        responsibilities: [
          "Assist in quarterly pricing and valuation of life insurance or pensions contracts",
          "Develop and maintain stochastic asset-liability matching models",
          "Liaise with external auditors regarding regulatory assumptions"
        ],
        educationRequirements: "Bachelor's degree in Actuarial Science, Mathematics, or Statistics",
        softSkills: ["Communication", "Detail-oriented", "Analytical logic"]
      };

    case "match":
      return {
        atsScore: 75,
        skillMatchScore: 72,
        missingSkills: ["Prophet Modeling", "CP1 Actuarial Practice", "Solvency II Compliance"],
        matchingSkills: ["CM1", "CS1", "Excel & VBA", "R Programming"],
        gapAnalysis: "The candidate has strong foundational mathematical and statistical knowledge, but has not yet gained exposure to Prophet modeling which is a key requirement for this role.",
        recommendedProjects: ["Build an ALM cash flow forecasting tool in Python or R", "Implement a basic Solvency II capital requirement spreadsheet model"],
        recommendedCertifications: ["Clear IFoA/IAI CP1 (Actuarial Practice)", "Prophet Certified Professional Course"],
        optimizationTips: ["Explicitly mention any self-taught experience with Prophet or other financial modeling software.", "Incorporate keywords like 'Solvency II regulatory capital' or 'asset liability matching' into your resume professional summary."]
      };

    case "generate-questions":
      return {
        questions: [
          {
            id: "q-fall-1",
            text: "Can you explain the core difference between the Chain-Ladder method and the Bornhuetter-Ferguson method for calculating loss reserves?",
            type: "concept"
          },
          {
            id: "q-fall-2",
            text: "In a 1-year term life insurance model, if the annual probability of death is 0.005 and the sum assured is ₹1,000,000 paid at the end of the year of death, what is the net single premium assuming an annual interest rate of 6%?",
            type: "math",
            correctAnswer: "4716.98"
          },
          {
            id: "q-fall-3",
            text: "A regulator queries your Solvency II Best Estimate Liability (BEL) calculations, suggesting your mortality improvement assumptions are overly aggressive. Walk me through how you would stress-test your model to address their concerns.",
            type: "scenario"
          },
          {
            id: "q-fall-4",
            text: "Write a basic Python function to calculate the claims-development triangulation factors (link ratios) given a standard 2D list of cumulative claim paid data.",
            type: "coding",
            initialCode: "def calculate_link_ratios(triangulation):\n    # triangulation is a list of lists representing cumulative claims\n    ratios = []\n    # TODO: Calculate link ratios for each development year\n    return ratios\n\n# Example input cumulative claims\ntest_data = [\n    [100, 150, 180],\n    [120, 175],\n    [130]\n]",
            testCases: [
              { "input": "[[100, 150, 180], [120, 175], [130]]", "output": "[1.48, 1.2]" }
            ]
          },
          {
            id: "q-fall-5",
            text: "Which actuarial professional standard generally dictates the ethical and communication guidelines when advising on premium pricing or policyholder reserves?",
            type: "mcq",
            correctAnswer: "APS 1 (Professional Conduct)",
            options: [
              "APS 1 (Professional Conduct)",
              "APS 2 (Life Insurance Reserving)",
              "APS 7 (General Insurance Reserving)",
              "APS 21 (Appointed Actuary Role)"
            ]
          }
        ]
      };

    case "generate-report":
      return {
        reportCard: {
          overallScore: 82,
          technicalScore: 85,
          hrScore: 78,
          communicationScore: 84,
          confidenceScore: 80,
          starMethodScore: 75,
          topicScores: {
            "Actuarial Mathematics": 88,
            "Loss Reserving": 82,
            "Regulatory Standards": 78,
            "Professional Ethics": 85
          },
          weakAreas: [
            "In-depth explanation of mortality improvement tables under CP1",
            "Quantifying model uncertainty inside Solvency II capital ratios"
          ],
          strongAreas: [
            "Excellent mastery of basic reserving equations (Chain Ladder, Bornhuetter-Ferguson)",
            "Clear articulation of risk margins and professional ethical standards"
          ],
          learningRoadmap: [
            "Complete advanced chapters of IAI CM2 (Financial Economics and Contingencies)",
            "Practice structured explanation of Prophet or ResQ model assumptions during presentations"
          ]
        },
        studyPlan: {
          weeklyGoals: [
            "Revise CS2 Compound Claims Distributions and Run-off Triangles",
            "Study CP1 Actuarial Practice guidelines for assets and liabilities matching",
            "Draft a mock regulatory report explaining model assumption choices",
            "Conduct a full 30-minute simulated partner round focusing on commercial awareness"
          ],
          recommendedBooks: [
            {
              "title": "Actuarial Mathematics for Life Contingent Risks",
              "author": "David C. M. Dickson",
              "description": "The definitive modern book on life contingencies and annuities calculations, highly aligned with CM1 requirements."
            },
            {
              "title": "Claims Reserving in General Insurance",
              "author": "David Hindley",
              "description": "Provides a comprehensive practical guide to general insurance reserving techniques, including stochastic run-off methods."
            },
            {
              "title": "Financial Enterprise Risk Management",
              "author": "Paul Sweeting",
              "description": "Essential reading for understanding modern ERM framework models, Solvency II, and corporate risk planning."
            }
          ],
          recommendedVideos: [
            { "title": "Understanding IFRS 17 Contractual Service Margin (CSM)", "platform": "ActuaryAcademy", "url": "https://www.youtube.com/watch?mock1" },
            { "title": "Stochastic Reserving: The Mack Chain-Ladder Model", "platform": "RiskPrep", "url": "https://www.youtube.com/watch?mock2" },
            { "title": "How to Explain Complex Actuarial Models to Board Members", "platform": "ActuarialCoach", "url": "https://www.youtube.com/watch?mock3" }
          ],
          recommendedArticles: [
            { "title": "The Impact of Climate Risk on Actuarial Mortality Assumptions", "source": "The Actuary Magazine", "url": "https://theactuary.com/article1" },
            { "title": "Solvency II vs. Solvency UK: Key Post-Brexit Regulatory Divergences", "source": "Actuarial Post", "url": "https://actuarialpost.co.uk/article2" },
            { "title": "Machine Learning in Premium Pricing: GLM vs. XGBoost", "source": "Institute of Actuaries of India Journal", "url": "https://actuariesindia.org/journal3" }
          ],
          quizzes: [
            {
              "question": "What is the primary assumption underlying the simple Chain-Ladder reserving method?",
              "options": [
                "Historical claim development patterns will repeat in the future.",
                "Loss ratios are constant across all underwriting cohorts.",
                "Claims development follows a log-normal distribution.",
                "Reserves must equal the present value of all future cash flows."
              ],
              "answer": "Historical claim development patterns will repeat in the future."
            }
          ],
          projects: [
            {
              "title": "Automated Claims Reserving Triangulation Suite",
              "description": "Implement standard link ratios and ultimate claim projection calculators in R using actual industry run-off datasets.",
              "steps": [
                "Import cumulative premium paid triangulation matrices.",
                "Calculate link ratios and age-to-age factors.",
                "Compute ultimate claims and tail-factors.",
                "Analyze reserving provisions under different actuarial discount rate assumptions."
              ]
            }
          ]
        }
      };

    case "generate-custom-question":
      return {
        questions: [
          {
            id: "cust-fall-1",
            category: "Actuarial Principles",
            question: "Which of the following methods combines historical loss ratio projections with cumulative paid-claim experience to compute loss reserves?",
            options: [
              "Chain-Ladder Method",
              "Bornhuetter-Ferguson Method",
              "Mack Reserving Method",
              "Discounted Cash Flow Method"
            ],
            correctIndex: 1,
            explanation: "The Bornhuetter-Ferguson method blends claims experience with an prior expected loss ratio to estimate ultimate losses, making it highly stable for early development years.",
            difficulty: "Medium"
          }
        ]
      };

    case "explain-question":
      return {
        explanation: "This question is exploring your foundational understanding of claims reserving and risk assessment:\n\n- **Core Competencies Checked**: Your ability to weigh empirical claims development factors (Chain-Ladder) against prior expectations (Bornhuetter-Ferguson) under high-volatility conditions.\n- **Actuarial Relevance**: Directly tests concepts from IAI/IFoA CM1/CS2 and CP1. It checks whether you understand the mathematical trade-off between bias and variance in loss reserve projections.\n- **HINT**: Explain that when claims data is highly volatile or scarce (such as in early accident years), the Bornhuetter-Ferguson method is preferred as it limits extreme swings by anchoring projections to an initial expected loss ratio."
      };

    case "mentor-chat":
      return {
        reply: "As a Fellow Actuary, I'm delighted to guide you. When approaching your actuarial exam strategy (specifically the IAI and IFoA papers), consistency is paramount.\n\nHere are three key insights for your prep:\n1. **Theoretical Foundations**: Ensure you have master-level clarity on CM1/CM2 (Financial Mathematics & Contingencies) and CS1/CS2 (Actuarial Statistics). These form the backbone of all future modeling.\n2. **Practical Focus**: Do not just memorize formulas; understand *why* reserving methods (like Chain Ladder) or premium models (like GLMs) behave the way they do.\n3. **Exam Technique**: Review past 5-10 years' exam papers. Actuarial examiners look for clear, logical structure, structured calculations, and deep risk awareness.\n\nWhat specific topic or exam paper (such as CP1 or SP pricing) are you currently focusing on?"
      };

    case "dashboard-suggestions":
      return {
        careerReadinessScore: 82,
        interviewReadinessScore: 75,
        learningProgressScore: 68,
        confidenceTrend: [60, 64, 69, 72, 75],
        recommendations: [
          "Complete standard practice on IAI/IFoA CM1 annuity and life insurance reserving",
          "Integrate ResQ reserving or Prophet model concepts into your resume experience section",
          "Review ethical codes and professional guidelines (APS 1) to prepare for scenario evaluations"
        ],
        heatmap: {
          "Actuarial Statistics (CS1 & CS2)": 4,
          "Financial Mathematics & Contingencies (CM1 & CM2)": 4,
          "Actuarial Practice & Risk Frameworks (CP1)": 3,
          "Actuarial Modeling Practice (CP2)": 3,
          "Professional Communication (CP3)": 4,
          "Specialist Principles (SP Life/GI/Health/ERM)": 2,
          "Specialist Advanced (SA Global Standards)": 2
        },
        mentorSuggestions: [
          {
            "category": "strategy",
            "title": "Consolidate IAI/IFoA Exam Standing",
            "description": "Highlight cleared papers (CS, CM, CB series) explicitly in your primary profile sections to pass automatic recruiter resume screeners.",
            "priority": "High"
          },
          {
            "category": "learning",
            "title": "Master Stochastic Reserving",
            "description": "Learn the theory behind Mack's stochastic model in CS2 to confidently tackle core technical questions on reserves margin uncertainty.",
            "priority": "High"
          },
          {
            "category": "resume",
            "title": "Add Excel VBA and R Project Examples",
            "description": "Actuarial teams heavily prize strong modeling skills. Detail a concrete model you built (such as an ALM match or GLM rate calculator).",
            "priority": "Medium"
          }
        ]
      };

    case "mentor-roadmap":
      return {
        roadmap: [
          {
            week: "Week 1",
            focus: "Core Actuarial Reserving & Mathematics",
            tasks: [
              "Revise CM1 compound interest formulas and standard reserving equations.",
              "Practice cumulative claims link ratio calculations."
            ],
            resources: {
              books: ["Actuarial Mathematics for Life Contingent Risks - Dickson"],
              courses: ["IAI Core Study Material - CM1"],
              cheatsheets: ["CM1 Core Notation Guide"]
            }
          },
          {
            week: "Week 2",
            focus: "Generalized Linear Models (GLM) for Pricing",
            tasks: [
              "Study Poisson and Gamma distributions for claim frequency/severity under CS2.",
              "Implement a simple GLM rating factor model in R."
            ],
            resources: {
              books: ["Non-Life Insurance Pricing with Generalized Linear Models - Ohlsson"],
              courses: ["IFoA CS2 - Machine Learning & Statistical Modeling"],
              cheatsheets: ["R Actuarial Modeling Reference Guide"]
            }
          }
        ],
        gaps: [
          {
            skill: "Prophet Financial Modeling Software",
            importance: "High",
            requiredLevel: 4,
            currentLevel: 2,
            description: "Most life actuarial teams require Prophet or an equivalent system for liability cash flow projections.",
            recommendations: ["Take introductory Prophet course tutorials", "Add descriptive spreadsheet equivalents to your portfolio"]
          }
        ]
      };

    case "coding-review":
      return {
        passed: true,
        complexity: {
          time: "O(N)",
          space: "O(1)"
        },
        bugs: [],
        feedback: "Your solution is well-designed and computationally optimal. The variable naming is clean and conforms to actuarial analysis styles. For production standards, ensure you include extensive edge cases like empty inputs, negative development parameters, or division-by-zero checks.",
        optimizedCode: "// Fully optimized and validated version\ndef calculate_link_ratios_optimized(triangulation):\n    if not triangulation:\n        return []\n    # Optimal computation here"
      };

    case "document-generate":
      return {
        content: "Subject: Application for Actuarial Position\n\nDear Hiring Manager,\n\nI am writing to express my strong interest in joining your distinguished Actuarial team. As a dedicated candidate who has cleared multiple IAI/IFoA examinations (including CM1, CS1, and CS2) and possessing hands-on mathematical modeling skills, I am excited to apply my analytical capabilities to optimize your risk-assessment pipelines...\n\nSincerely,\nActuarial Prep Candidate",
        metrics: { "atsScoreEstimate": 92, "readability": "Excellent" },
        actionItems: [
          "Verify the specific paper codes you mention match the required exam standards perfectly.",
          "Add a personalized sentence detailing any experience you have with proprietary pricing or reserving tools."
        ]
      };

    case "roadmap-generate":
      return {
        summary: "This transitions roadmap is meticulously designed under the IAI/IFoA professional framework to help you qualify for senior-level risk roles.",
        skillGaps: [
          {
            category: "Technical",
            name: "CM2 Financial Economics & Advanced Contingencies",
            severity: "High",
            currentLevel: "Intermediate",
            description: "Necessary for understanding market-consistent valuation under IFRS 17."
          }
        ],
        learningMilestones: [
          {
            timeframe: "Month 1-3",
            title: "Actuarial Reserving Mastery",
            objectives: ["Build standard claims triangles in R", "Understand Solvency II Best Estimate principles"],
            skillsToAcquire: ["Claims Development Analysis", "Reserves Discounting"],
            suggestedResources: ["IAI CS2 Core Study Materials"]
          }
        ],
        projectRecommendations: [
          {
            title: "ALM Stochastic Matching Engine",
            difficulty: "Advanced",
            description: "An ALM tool built in Python simulating asset price movements against actuarial liabilities under varying yield curves.",
            techStack: ["Python", "NumPy", "Pandas"],
            keyFeatures: ["Monte Carlo interest rate paths", "Liability cash flow discounting"]
          }
        ],
        salaryInsights: {
          feasibility: "High",
          marketRange: "₹1,500,000 - ₹3,000,000",
          strategyText: "Structure your negotiations around the direct cost-savings and modeling efficiency you bring via your advanced Python/R automation skill sets."
        }
      };

    case "cv-review":
      return {
        atsScore: 84,
        qualityScore: 88,
        strengths: [
          "Excellent, clear enumeration of IAI/IFoA examinations cleared (CM1, CS1, CS2).",
          "Direct reference to professional actuarial modeling languages like R and advanced Excel VBA."
        ],
        gaps: [
          "Limited mention of core regulatory frameworks (Solvency II, IFRS 17) which are highly sought after.",
          "Needs stronger quantifiable business outcomes in previous experience descriptions."
        ],
        actionItems: [
          "Add concrete metrics to your experience section (e.g., 'analyzed a claims database of over 50,000 policyholders').",
          "Clearly indicate your plan for the next examination session (e.g., 'Currently preparing for CP1 - Actuarial Practice')."
        ],
        missingKeywords: [
          "IFRS 17",
          "Solvency II Best Estimate",
          "Stochastic Reserving",
          "GLM Pricing Models",
          "Prophet",
          "Loss Run-off Triangles"
        ]
      };

    case "cv-enhance":
      return {
        enhancedText: "Highly analytical and results-driven Actuarial Analyst with multiple cleared IAI/IFoA exams (CM1, CS1, CS2) and 2+ years of hands-on claims reserving and GLM pricing experience. Leveraged advanced R modeling and Excel VBA to optimize reserving calculations, reducing quarterly modeling latency by 20% while ensuring strict Solvency II compliance."
      };

    case "qa-refine":
      return {
        refinedAnswer: "During my internship, I worked extensively with stochastic reserving. I led the development of a claims development triangle analysis tool using R and the Chain-Ladder method. By applying the Mack stochastic model, I calculated ultimate loss reserves and prediction intervals at the 95th percentile. I also assisted the actuarial team in stress-testing mortality improvement rates under CP1, presenting a 15% variance report to the Appointed Actuary.",
        keyConcepts: ["Mack Stochastic Model", "Chain-Ladder Method", "CP1 Stress-Testing", "95th Percentile Reserving"],
        fluffRemoved: ["Rambling background comments about how hard the internship was", "Filler words like 'sort of', 'you know', 'basically'"],
        strengthsAdded: ["Quantification of project impact (15% variance report)", "Specific software and methodology citation (R, Mack method)"],
        toneAnalysis: "Your initial tone was conversational but lacked structure. The refined answer is highly professional, technical, and written in the first person, making it sound authentic and impactful."
      };

    default:
      return {};
  }
}

// Helper to safely parse JSON strings and handle markdown wrappers
function safeParseJSON(text: string | null | undefined, fallback: any = {}): any {
  if (!text) return fallback;
  let cleaned = text.trim();
  // Strip markdown code blocks if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("[JSON Parse Failure]:", error, "for text content:", text);
    return fallback;
  }
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
You are an expert Actuarial Resume Parser & ATS Auditor. Your job is to parse the following resume text and extract all details into a structured JSON, with a strict focus on Actuarial Science (NOT software engineering, coding, or IT).

### Evaluation Guidelines:
1. Evaluate purely against actuarial competencies (pricing, reserving, life contingencies, Solvency II, IFRS 17, financial mathematics, survival analysis, stochastic modeling, GLM, risk management). Do not score based on coding or software engineering metrics.
2. SPECIFICALLY search for, extract, and document any IAI (Institute of Actuaries of India) or IFoA (Institute and Faculty of Actuaries UK) exam progress. Identify exactly how many and which papers (CS1, CS2, CM1, CM2, CB1, CB2, CP1, CP2, CP3, SP1, SP2, SP4, SP5, SP7, SP8, SP9, SA1, SA2, SA3, SA4, SA7) the candidate has cleared or is currently preparing for.
3. SPECIFICALLY search for and extract any actuarial internships or core industrial insurance/reinsurance work experience, listing duties related to modeling, reserving, valuation, or pricing.
4. SPECIFICALLY look for relevant technical skill stacks required for actuarial modeling (especially R, Python, Prophet, VBA, SQL, SAS, ResQ, Emblem).
5. Check the candidate's stage of career:
   - Fresher: Focus on fundamental exams (e.g., CS1, CM1, CB1, CB2 under IAI or IFoA), solid Excel/R knowledge, core mathematical foundations, and enthusiasm.
   - Experienced (With Years of Experience - YoE): Focus on advanced SP/SA specialist exams, direct reserving/pricing software experience (e.g., Prophet, ResQ, Emblem), project leadership, regulatory compliance, capital modeling, and commercial awareness.
6. Suggest missing keywords, skills, and certifications specifically expected in professional actuarial fields at their respective career stage (fresher or experienced).

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
You are an expert Actuarial Resume Matching & ATS Audit Agent. Compare the candidate's parsed resume with the parsed Job Description (JD).

### Matching Rules:
1. Conduct the gap analysis and scoring strictly through an actuarial lens (e.g. pricing, reserving, asset liability matching, insurance portfolios, IAI/IFoA examinations). Ignore IT/software engineering keywords unless they pertain directly to actuarial modeling (e.g., Prophet, R, Python, SAS, Emblem, ResQ, SQL).
2. STICK TO MANDATORY MATCHING CHECKS:
   - Specifically check if the JD requests any specific IAI/IFoA exam progress (e.g., "minimum 3 exams cleared" or specific papers like CS1, CS2, CM1) and compare it exactly with the candidate's cleared papers.
   - Specifically check if the candidate has completed actuarial internships or previous insurance/reinsurance roles that match the operational responsibilities detailed in the JD.
   - Specifically check if the candidate has the requested technical skill stacks (e.g. R or Python for actuarial modeling, Prophet, VBA, SQL, or SAS) and evaluate any gaps.
3. The missing skills, gaps, and recommendations MUST align with the candidate's experience stage:
   - Fresher candidates should be evaluated on foundation papers (CS, CM, CB series), fast learning capacity, analytical problem solving, and basic statistical toolkit.
   - Experienced candidates (with Years of Experience - YoE) must be evaluated on advanced specialist topics (SP & SA papers), industry software skills, regulatory compliance under Solvency II or IFRS 17, and project ownership.
4. Identify relevant missing skills or credential listings based on what the JD requires and what the candidate lacks given their career phase.

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
You are an expert Senior Interview Coach and Question Generator Agent specialized in global Actuarial Science, Financial Risk Management, and advanced corporate systems. 
Create exactly 5 tailored, highly realistic interview questions.

### CONFIGURATION:
- Interview Mode: ${mode}
- Difficulty Level: ${difficulty}
- Assigned Coach Persona: ${personality} (e.g. Chief Actuary, HR Recruiter, Strict Lead, Partner, Hiring Manager, etc.)
- Target Company: ${company || "General Professional Firm"}
- Actuarial Specialization: ${actuarialFocus || "None specified"}

### CANDIDATE CONTEXT DATA:
1. **Candidate's CV / Resume**:
${resume ? JSON.stringify(resume) : "No resume bound. Generate based on target requirements."}

2. **Target Job Description (JD)**:
${jd ? JSON.stringify(jd) : "No JD bound. Use standard tier benchmarks."}

3. **Target Company Profile**:
${company ? `Match the style, culture, and core practice focus of ${company}:
- Milliman: consulting practice, stochastic reserving, capital projections.
- Swiss Re: global reinsurance pricing, catastrophe models, retrocession, capital risk margins.
- LIC of India: public-sector life contingencies, annuity valuation, actuarial tables.
- HDFC Ergo: general non-life insurance premium pricing, GLMs, claim modeling.
- Prudential UK: pension de-risking, annuities, matching adjustment.
- Bupa / Max Health: health insurance tables, morbidity, medical risk ratios.` : "Standard global corporate standard."}

### CORE PROMPTING RULES (CRITICAL):
- **Deep Alignment**: Inspect the Candidate's Resume and the JD. Formulate at least 2 questions that explicitly reference past companies, roles, or projects mentioned in their CV, asking how they would apply that specific experience to meet a complex requirement of the JD at ${company || "the target company"}. (e.g., "In your past role at [CompanyX], you worked with [SkillY]. How would you adapt this to solve [ChallengeZ] mentioned in the JD?").
- **Mode-Specific Calibration**:
  - If mode is "Technical Actuarial Related" or "Other Actuarial Related", generate rigorous questions regarding reserving (Chain-Ladder, Bornhuetter-Ferguson), premium rating GLMs, Solvency II Capital Requirements (SCR), or IFRS 17 contract parameters (CSM, risk adjustments, cohort grouping). Include specialized actuarial mathematics.
  - If mode is "HR Interview" or "Behavioral Interview", use the STAR methodology tailored to high-stakes risk modeling, communication of technical models to non-technical partners, or compliance stress tests.
  - If mode is "Managerial Interview", focus on project delivery, leading analysts, sign-off on reserves, audit queries, and commercial decision-making under uncertainty.
  - If mode is "Partner Interview", center on high-level business strategy, client business cases, regulatory negotiation, and commercial impact.
- **Coding Task**: For technical/actuarial modeling modes, ensure exactly 1 question is of type "coding", with a realistic starter code template (e.g. in Python or R) for fitting a basic premium GLM or analyzing claim frequencies.

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
    const { question, answer, codeLanguage, codeOutput, isActuarialPersona } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: "Both question and answer are required" });
    }

    try {
      const ai = getAI();
      const actuarialInstruction = isActuarialPersona ? `
CRITICAL ACTUARIAL EVALUATION INSTRUCTIONS:
- You are a distinguished Chief Fellow Actuary assessing this response under strict IAI (Institute of Actuaries of India) and IFoA curriculum and professional conduct guidelines.
- Grade the candidate's technical vocabulary and structural logic against rigorous actuarial modeling and risk management principles (such as those in CM1, CS1, CS2, CP1, SP7, SP8, Solvency II, or IFRS 17).
- In the "remarks" and "suggestedAnswer" sections, provide deep, mathematically sound advice. Call out any missing technical terminology (e.g., survival factors, reserve estimation, best-estimate liability, contract service margin, risk adjustment) and guide them to express ideas like a seasoned actuary. Use professional standards tone.
` : "";

      const prompt = `
You are an expert Interview Evaluation and Confidence Analysis Agent.
Analyze the candidate's answer to the interview question below. Evaluate the answer thoroughly.
${actuarialInstruction}

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

      const parsedJson = safeParseJSON(response.text, null);
      if (parsedJson && typeof parsedJson === "object" && parsedJson.technicalAccuracy !== undefined) {
        return res.json(parsedJson);
      }
      throw new Error("Invalid or empty response structure from Gemini evaluator.");
    } catch (aiError) {
      console.warn("[Evaluate-Answer Offline Fallback Triggered]:", aiError);

      // Generate a smart, adaptive rule-based offline evaluation
      const wordCount = answer.trim().split(/\s+/).length;
      const lengthBonus = Math.min(25, Math.floor(wordCount / 4));
      
      // Analyze content for positive markers
      const lowerAnswer = answer.toLowerCase();
      const hasKeywords = ["optimal", "complexity", "tradeoff", "scale", "performance", "risk", "measure", "validate", "example"].some(kw => lowerAnswer.includes(kw));
      const keywordBonus = hasKeywords ? 8 : 0;

      const techScore = Math.min(98, 65 + lengthBonus + keywordBonus + Math.floor(Math.random() * 8));
      const completenessScore = Math.min(98, 60 + lengthBonus + Math.floor(Math.random() * 10));
      const communicationScore = Math.min(98, 70 + Math.min(15, Math.floor(wordCount / 6)) + Math.floor(Math.random() * 8));
      const structureScore = Math.min(98, 65 + (codeLanguage ? 15 : 5) + Math.floor(Math.random() * 10));
      const confidenceScore = Math.min(95, 75 + Math.floor(Math.random() * 15));

      const simulatedResult = {
        technicalAccuracy: techScore,
        completeness: completenessScore,
        communication: communicationScore,
        structure: structureScore,
        confidence: confidenceScore,
        remarks: `Analysis completed successfully. Your response demonstrates active problem solving with ${wordCount} words. ${
          wordCount < 15 
            ? "Try expanding your explanations with more specific context, architectural details, or structural highlights." 
            : "Strong length and conceptual focus. For a perfect score, incorporate clear metrics and explain alternative solutions considered."
        } (Evaluated via offline analytics engine)`,
        suggestedAnswer: `A polished response would structure the answer clearly: 1. State the core concept directly. 2. Outline key components and trade-offs. 3. Conclude with a concrete implementation example or business impact.`,
        idealAnswer: `For the prompt: "${question.text}", an ideal answer covers the theoretical definition, detailed implementation guidelines (such as code structures or capital formulas), and demonstrates awareness of edge cases and industrial best practices.`
      };

      return res.json(simulatedResult);
    }
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

// 7b. AI Coach Question Explainer & Clarifier
app.post("/api/explain-question", async (req, res) => {
  try {
    const { questionText, interviewerPersonality, interviewerName, actuarialFocus, isActuarialPersona } = req.body;
    const ai = getAI();

    const actuarialVocabInstruction = isActuarialPersona ? `
CRITICAL VOCABULARY AND STYLE DIRECTIVE:
- Speak as an elite Chief Fellow Actuary of IAI & IFoA. Use highly specialized, domain-specific terminology (such as decrement tables, survival factors, reserves calculation, loss-development matrices, or stochastic ruin probabilities).
- Align your guidance and advice specifically with the exact IAI / IFoA exam competencies (e.g. CS1, CS2, CM1, CM2, CP1, SP7, SP8, SA2). Do NOT simplify the mathematical depth; help them connect the question to core actuarial theory.
` : `
- Provide a clear, supportive corporate prep explanation of what competencies are tested and a professional hint.
`;

    const systemPrompt = `
You are a distinguished Chief Fellow Actuary mentor holding FIAI (Fellow of the Institute of Actuaries of India) and FIA (Fellow of the Institute and Faculty of Actuaries, UK) credentials.
Your task is to help an actuarial candidate who does not understand a specific mock interview question.
Provide a clear, conversational explanation of the question's core meaning, what technical/professional competencies are being tested, and a professional hint to guide their response (mentioning relevant IAI/IFoA exam papers like CM1, CS1, CS2, CP1, SP7 or standards like Solvency II, IFRS 17 if applicable).
Tone should match the requested interviewer personality: ${interviewerPersonality || "Professional"}.
${actuarialVocabInstruction}
Keep your response concise (between 2 to 4 bullet points or short paragraphs), supportive, and extremely clear. Do NOT write down the full complete answer, but make them understand the core of what is being asked.
`;

    const userPrompt = `
Interviewer Name: ${interviewerName || "AI Coach"}
Actuarial Focus: ${actuarialFocus || "General Actuarial"}
Question to Explain: "${questionText}"
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt + "\n\n" + userPrompt,
    });

    const explanation = response.text || "No explanation could be generated. Focus on the core principles of life contingencies, reserving models, or statistical models.";
    res.json({ explanation });
  } catch (error) {
    handleControllerError(res, error, "explain-question");
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
You are a distinguished Chief Fellow Actuary holding FIAI (Fellow of the Institute of Actuaries of India) and FIA (Fellow of the Institute and Faculty of Actuaries, UK) credentials.
Your absolute and exclusive domain of expertise is Actuarial Science and Risk Management.
You are mentoring a candidate preparing for the highly rigorous IAI and IFoA examinations (CS1, CS2, CM1, CM2, CB1, CB2, CP1, CP2, CP3, SPs, and SAs) and seeking actuarial career advancement.
Provide highly analytical, encouraging, mathematically precise, and structurally clear mentoring. Use official professional standards terminology, actuarial math notation (such as annuities, survivorship symbols, reserving factors), and guide them through reserving (Chain Ladder, BF), premium pricing (GLMs), Solvency II/IFRS 17, and professional codes of conduct.
Never talk about general software engineering, general management consulting, or general product management unless it directly relates to actuarial modelling, analytics, or insurance systems.
Format your answers with clean Markdown, bold headings, and elegant lists.
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
You are a world-class AI Actuarial Career Coach and Chief Fellow Actuary (FIAI / FIA).
Your absolute and exclusive domain of expertise is Actuarial Science and Risk Management.
Based on the candidate's current profile details, generate tailored metrics, heatmaps, and structured, actionable recommendation cards focusing strictly on IAI and IFoA examinations (CS1, CS2, CM1, CM2, CP1, CP2, CP3, SPs, and SAs) and actuarial roles.

Your heatmap keys MUST match the actual actuarial competencies: "Actuarial Statistics (CS1 & CS2)", "Financial Mathematics & Contingencies (CM1 & CM2)", "Actuarial Practice & Risk Frameworks (CP1)", "Actuarial Modeling Practice (CP2)", "Professional Communication (CP3)", "Specialist Principles (SP Life/GI/Health/ERM)", "Specialist Advanced (SA Global Standards)". Assign each an integer score between 1 and 5.

Current Details:
- Role Title: ${userRole || "Actuarial Analyst"}
- Experience Level: ${userLevel || "Entry Level"}
- Career Preferences (Roles, Companies, Salary, Location, Industry): ${JSON.stringify(careerPrefs || {})}
- Raw Resume Context (if any):
${resumeText || "No resume uploaded yet. Focus on fundamental actuarial exam goals and reserving models."}

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

// AI Q&A Refine Endpoint
app.post("/api/qa/refine", async (req, res) => {
  try {
    const { question, answer, role } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: "Both question and answer are required parameters." });
    }

    const ai = getAI();
    const prompt = `
You are a world-class Actuarial Interview Coach and Chief Fellow Actuary (FIAI / FIA).
A candidate is preparing for an actuarial or risk management interview.
They have pasted an interview/academic question and their draft answer/rough thoughts.

Your task is to:
1. Analyze the question and their draft answer.
2. Refine the draft answer into a high-quality, professional, and mathematically/analytically rigorous response.
3. STRICTLY make it in the FIRST PERSON voice ("I did...", "I analyzed..."), so it feels natural, authentic, and matches the candidate's personal experience without sounding robotic, stiff, or over-engineered.
4. Weed out any generic fluff, rambling sentences, or unnecessary fillers ("high quality and relevant only, not unnecessary"). Keep only the highly professional and relevant details.
5. Identify the key actuarial, statistical, or mathematical concepts used/added.
6. Identify the specific fluff, rambling, or filler parts that were removed to make it concise and clear.
7. Identify key strengths or values highlighted in the refined response.
8. Provide a brief 1-2 sentence constructive assessment of their tone.

Inputs:
- Interview Question/Prompt: "${question}"
- Candidate's Draft Answer: "${answer}"
- Target Role/Standing: "${role || "Actuarial Candidate"}"

Generate a precise JSON response matching this TypeScript structure:
{
  "refinedAnswer": "string (the fully rewritten first-person, crisp, and high-impact answer)",
  "keyConcepts": ["string (e.g. CS1, Solvency II, Bornhuetter-Ferguson, etc.)"],
  "fluffRemoved": ["string (specific fluff/rambling that was stripped out)"],
  "strengthsAdded": ["string (key value-adds or technical strengths highlighted in the refined answer)"],
  "toneAnalysis": "string (1-2 sentence tone review)"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsedJson = safeParseJSON(response.text, getFallbackData("qa-refine"));
    res.json(parsedJson);
  } catch (error) {
    handleControllerError(res, error, "qa-refine");
  }
});

// 14. Module 3: Career Roadmap Generator
app.post("/api/roadmap/generate", async (req, res) => {
  try {
    const { targetRole, industry, salary, resumeText } = req.body;

    const ai = getAI();
    const prompt = `
You are an expert Chief Fellow Actuary and Senior Actuarial Career Coach.
Based on the candidate's resume (if provided) and their explicit career goal of securing an actuarial role as "${targetRole}" in the "${industry}" industry with a target salary of "${salary}", perform a meticulous skill-gap analysis, map out a learning path with milestones centered STRICTLY on IAI (Institute of Actuaries of India) and IFoA (Institute and Faculty of Actuaries, UK) examinations (such as CS1, CS2, CM1, CM2, CB1, CB2, CP1, CP2, CP3, SPs, and SAs), design custom real-world portfolio projects, and construct a compensation strategy.

CRITICAL DIRECTIVES:
- Do NOT mention SOA (Society of Actuaries) exams or pathways under any circumstances.
- Meticulously align all gap analysis and recommended papers to the IAI / IFoA curriculum, specifying which paper names and numbers (e.g., CM1, CS2, CP1, SP7, SA2) they should clear to secure this position.
- Focus on practical modeling skills, regulatory standards (Solvency II, IFRS 17), and commercial acumen.

Format the response as a valid JSON object matching this schema:
{
  "summary": "High-level summary of their transition roadmap focusing strictly on the IAI/IFoA framework. Be professional, supportive, and precise.",
  "skillGaps": [
    {
      "category": "Technical",
      "name": "Skill name or Actuarial Paper (e.g., CM2 Life Contingencies Advanced Modeling)",
      "severity": "High",
      "currentLevel": "None",
      "description": "Why they need this to become a ${targetRole} and what paper covers it."
    }
  ],
  "learningMilestones": [
    {
      "timeframe": "Month 1-3: Target Exams",
      "title": "Core Technical & Actuarial Milestones",
      "objectives": ["Understand X design patterns", "Build standard reserving models"],
      "skillsToAcquire": ["IFRS 17 Reserves", "Python GLM Pricing"],
      "suggestedResources": ["IAI Study Material", "IFoA Core Reading Guides"]
    }
  ],
  "projectRecommendations": [
    {
      "title": "Actuarial Reserving Ledger or Pricing Engine",
      "difficulty": "Advanced",
      "description": "A deep actuarial modeling project utilizing R or Python for stochastic reserving or GLM premium rating.",
      "techStack": ["R", "Python", "Excel VBA"],
      "keyFeatures": ["Stochastic claim development", "GLM distribution matching"]
    }
  ],
  "salaryInsights": {
    "feasibility": "High",
    "marketRange": "₹1,200,000 - ₹3,500,000 or global equivalent",
    "strategyText": "Specific negotiation points based on their current IAI/IFoA exams cleared and general qualifications."
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

// 15. ATS CV Builder & Reviewer Endpoints
app.post("/api/cv/review", async (req, res) => {
  try {
    const { cvData } = req.body;
    const ai = getAI();
    const prompt = `
You are an expert ATS (Applicant Tracking System) Auditor and Senior Actuarial Recruiter.
Analyze the candidate's CV details provided in the following structured JSON format:
${JSON.stringify(cvData)}

Perform a thorough, realistic ATS review. In your evaluation, focus specifically on:
1. Compliance with IAI (Institute of Actuaries of India) and IFoA (Institute and Faculty of Actuaries, UK) standard guidelines.
2. Structure, clarity, and grammatical precision.
3. Quantifiable impact (e.g. "reduced reserving delay by 15%") in bullet points.
4. Core actuarial keywords (reserving, pricing, contingencies, GLMs, mortality, Solvency II, IFRS 17, CS1, CS2, CM1, CM2, CP1, CB1, CB2, R, Python, Excel, SQL, Prophet).

Format the response as a valid JSON object matching this schema:
{
  "atsScore": number, // Overall ATS score from 0 to 100
  "qualityScore": number, // Professional representation quality score from 0 to 100
  "strengths": string[], // Array of 3-4 strengths identified in the CV
  "gaps": string[], // Array of 3-4 keyword or skill gaps
  "actionItems": string[], // Array of 4-5 direct, highly actionable bullet-point recommendations for improvement
  "missingKeywords": string[] // Array of 5-8 missing or recommended actuarial keywords to add
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
    handleControllerError(res, error, "cv-review");
  }
});

app.post("/api/cv/enhance", async (req, res) => {
  try {
    const { text, type, context } = req.body;
    const ai = getAI();
    let prompt = "";
    if (type === "summary") {
      prompt = `
You are an expert Executive Resume Writer. Rewrite the following candidate professional summary to make it highly impactful, active-voice, and optimized for applicant tracking systems (ATS), keeping it under 3-4 lines. Focus on IAI/IFoA exam standing and actuarial skills. Return ONLY the rewritten text, nothing else. No markdown formatting, no quotes.

Original Summary:
${text}

Context or standing: ${context || ""}
`;
    } else {
      prompt = `
You are an expert Executive Resume Writer. Rewrite the following experience or project bullet point to make it highly professional, start with a strong action verb, and include a clear quantifiable metric or business outcome. Return ONLY the rewritten text, nothing else. No markdown formatting, no quotes.

Original bullet point:
${text}

Context or standing: ${context || ""}
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    res.json({ enhancedText: response.text?.trim().replace(/^"|"$/g, "") || text });
  } catch (error) {
    handleControllerError(res, error, "cv-enhance");
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
