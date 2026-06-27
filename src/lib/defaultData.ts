/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InterviewerPersonality } from "../types";

export interface QuestionItem {
  id: string;
  text: string;
  company: string;
  role: string;
  difficulty: "Easy" | "Medium" | "Hard";
  round: "Technical" | "Behavioral" | "Aptitude" | "System Design";
  subject: string;
}

export interface AptitudeQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: string;
  spaceLimit: string;
  description: string;
  constraints: string[];
  starterCodes: { [lang: string]: string };
  testCases: { input: string; output: string }[];
  validatorCode?: string; // Optional custom validation rule description
}

export interface InterviewerProfile {
  id: InterviewerPersonality;
  name: string;
  role: string;
  description: string;
  avatar: string;
}

export const DEFAULT_QUESTIONS: QuestionItem[] = [
  { 
    id: "qb-1", 
    text: "How would you model and price options for high-hazard property risk premiums under negative interest scenarios using CM2 / financial economics principles?", 
    company: "Milliman", 
    role: "Actuarial Associate (P&C)", 
    difficulty: "Hard", 
    round: "Technical", 
    subject: "Actuarial Science - CM2" 
  },
  { 
    id: "qb-2", 
    text: "Under what conditions of claims development would you prefer the Bornhuetter-Ferguson reserving method over the basic Chain Ladder technique for an SP7 General Insurance analysis?", 
    company: "Swiss Re", 
    role: "Valuation Actuary", 
    difficulty: "Medium", 
    round: "Technical", 
    subject: "Reserving & Capital - SP7" 
  },
  { 
    id: "qb-3", 
    text: "Describe a situation where you had to explain a complex actuarial modeling surplus variance or IFRS 17 contract service margin (CSM) calculation to non-actuarial corporate executives. Walk through your strategy using the CP3 Communication guidelines.", 
    company: "Max Life Insurance", 
    role: "Appointed Actuary Consultant", 
    difficulty: "Easy", 
    round: "Behavioral", 
    subject: "Actuarial Communication - CP3" 
  },
  { 
    id: "qb-4", 
    text: "Design an Enterprise Risk Management (ERM) framework under SP9 / Solvency II for an insurer writing high-volume micro-health insurance in India. What are your main underwriting risk mitigants?", 
    company: "HDFC Ergo", 
    role: "Risk Management Actuary", 
    difficulty: "Hard", 
    round: "System Design", 
    subject: "ERM & Solvency - SP9" 
  },
  { 
    id: "qb-5", 
    text: "Explain how transition intensities in a Markov multi-state model can be used to model critical illness policy premiums with multiple recovery states under CS2 guidelines.", 
    company: "LIC of India", 
    role: "Product Development Actuary", 
    difficulty: "Hard", 
    round: "Technical", 
    subject: "Survival Models - CS2" 
  },
  { 
    id: "qb-6", 
    text: "Formulate the net level premium equation for an n-year term assurance policy issued to a life aged x, detailing how you account for survival probabilities (t_p_x) and force of mortality (μ_x+t).", 
    company: "Prudential UK", 
    role: "Life Insurance Pricing Analyst", 
    difficulty: "Medium", 
    round: "Technical", 
    subject: "Life Contingencies - CM1" 
  }
];

export const DEFAULT_APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  {
    id: "q-quant-1",
    category: "Actuarial Mathematics (CM1)",
    question: "An insurer's claims reserving fund compounded annually grew from ₹10.0M to ₹12.1M over exactly two years. What was the exact annual effective compound interest rate (i) earned by the fund?",
    options: ["8.0%", "10.0%", "11.0%", "12.1%"],
    correctIndex: 1,
    explanation: "Using the compound interest formula: A = P(1 + i)^t. Here, 12.1 = 10(1 + i)^2 => 1.21 = (1 + i)^2 => 1.1 = 1 + i => i = 0.10 or 10.0% effective annual rate.",
    difficulty: "Easy"
  },
  {
    id: "q-quant-2",
    category: "Actuarial Statistics (CS1)",
    question: "Assuming a constant force of mortality μ = 0.02 per annum, what is the exact probability that a life aged x survives for at least another 10 years (10p_x)?",
    options: ["0.2000", "0.8000", "0.8187", "0.9802"],
    correctIndex: 2,
    explanation: "Under a constant force of mortality μ, the survival probability is t_p_x = e^(-μ * t). For t = 10 and μ = 0.02, we get 10p_x = e^(-0.02 * 10) = e^(-0.2) ≈ 0.81873.",
    difficulty: "Medium"
  },
  {
    id: "q-log-1",
    category: "Risk & Capital Management (CP1)",
    question: "Under Solvency II / IAI guidelines, if a general insurer increases its reinsurance retention ratio while keeping gross written premium constant, how does this affect its Solvency Capital Requirement (SCR) and Net Profit Margin variance?",
    options: [
      "SCR decreases and variance of net profit decreases.",
      "SCR increases and variance of net profit decreases.",
      "SCR decreases and variance of net profit increases.",
      "SCR increases and variance of net profit increases."
    ],
    correctIndex: 3,
    explanation: "Increasing the reinsurance retention ratio means retaining more risk on the insurer's own balance sheet. This increases potential claim volatility (variance of net profit increases) and increases capital needed for self-insurance, thereby increasing the SCR.",
    difficulty: "Hard"
  },
  {
    id: "q-verbal-1",
    category: "Actuarial Professional Standards (APS)",
    question: "According to IAI and IFoA professional codes of conduct, which principles represent the absolute duty of an actuary to ensure work is carried out with professional competence and care?",
    options: ["Integrity and Competence", "Profitable Underwriting", "Asset Optimization", "Statistical Superiority"],
    correctIndex: 0,
    explanation: "The core principles of the Actuarial Code are Integrity, Competence and Care, Impartiality, Compliance, and Communication. Professional competence and care are fundamental ethical requirements.",
    difficulty: "Easy"
  }
];

export const DEFAULT_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "p-1",
    title: "Annuity Expected Present Value (EPV)",
    difficulty: "Easy",
    timeLimit: "O(n)",
    spaceLimit: "O(1)",
    description: "Write an algorithm to calculate the Expected Present Value (EPV) of a whole life annuity-due of 1 payable annually in advance, issued to a life aged x.\n\nYou are given the effective annual interest rate `r` (as a float, e.g. 0.05) and a list `px` containing the single-year survival probabilities starting from age x (i.e. `px[0]` is p_x, `px[1]` is p_x+1, etc.).\n\nRecall that the EPV of an annuity-due is calculated as:\n`EPV = 1 + v * 1p_x + v^2 * 2p_x + v^3 * 3p_x + ...` where `v = 1 / (1 + r)` and `t_p_x = p_x * p_x+1 * ... * p_x+t-1`.",
    constraints: [
      "0.01 <= r <= 0.20",
      "1 <= px.length <= 100",
      "0.5 <= px[i] <= 1.0"
    ],
    starterCodes: {
      javascript: `function calculateAnnuityEPV(r, px) {\n  // Write your actuarial present value calculator\n  const v = 1 / (1 + r);\n  let epv = 1;\n  let t_p_x = 1;\n  for (let t = 0; t < px.length; t++) {\n    t_p_x *= px[t];\n    epv += Math.pow(v, t + 1) * t_p_x;\n  }\n  return parseFloat(epv.toFixed(4));\n}`,
      python: `def calculate_annuity_epv(r: float, px: list[float]) -> float:\n    # Write your actuarial present value calculator\n    v = 1 / (1 + r)\n    epv = 1.0\n    t_p_x = 1.0\n    for t in range(len(px)):\n        t_p_x *= px[t]\n        epv += (v ** (t + 1)) * t_p_x\n    return round(epv, 4)`,
      typescript: `function calculateAnnuityEPV(r: number, px: number[]): number {\n  const v = 1 / (1 + r);\n  let epv = 1;\n  let t_p_x = 1;\n  for (let t = 0; t < px.length; t++) {\n    t_p_x *= px[t];\n    epv += Math.pow(v, t + 1) * t_p_x;\n  }\n  return parseFloat(epv.toFixed(4));\n}`
    },
    testCases: [
      { input: "r = 0.05, px = [0.99, 0.98, 0.97]", output: "3.7145" },
      { input: "r = 0.08, px = [0.95, 0.90]", output: "2.6245" }
    ],
    validatorCode: "t_p_x, epv"
  },
  {
    id: "p-2",
    title: "Chain Ladder Age-to-Age Factors",
    difficulty: "Medium",
    timeLimit: "O(n^2)",
    spaceLimit: "O(n)",
    description: "In general insurance claims reserving (CS2 / SP7), the Chain Ladder method is used to project ultimate claims. Given a cumulative run-off claims triangle with `n` origin years and `n` development years, calculate the age-to-age factors (also called Link Ratios) for each development step.\n\nThe input `triangle` is a list of lists representing a symmetric cumulative claims matrix where values beyond the diagonal are not fully developed (represented as zeros). The age-to-age factor `f_j` from development year `j` to `j+1` is calculated as the sum of cumulative claims at development year `j+1` divided by the sum of cumulative claims at development year `j` for all origin years where both are observed.\n\nFormally: `f_j = sum_{i=0}^{n-j-2} triangle[i][j+1] / sum_{i=0}^{n-j-2} triangle[i][j]`.\n\nReturn a list of development factors rounded to 3 decimal places.",
    constraints: [
      "triangle is an n x n symmetric matrix of cumulative claims (floats).",
      "n >= 3",
      "All non-zero entries are positive."
    ],
    starterCodes: {
      javascript: `function chainLadderFactors(triangle) {\n  const n = triangle.length;\n  const factors = [];\n  for (let j = 0; j < n - 1; j++) {\n    let sumCurrent = 0;\n    let sumNext = 0;\n    for (let i = 0; i < n - j - 1; i++) {\n      sumCurrent += triangle[i][j];\n      sumNext += triangle[i][j+1];\n    }\n    factors.push(parseFloat((sumNext / sumCurrent).toFixed(3)));\n  }\n  return factors;\n}`,
      python: `def chain_ladder_factors(triangle: list[list[float]]) -> list[float]:\n    n = len(triangle)\n    factors = []\n    for j in range(n - 1):\n        sum_current = 0.0\n        sum_next = 0.0\n        for i in range(n - j - 1):\n            sum_current += triangle[i][j]\n            sum_next += triangle[i][j+1]\n        factors.append(round(sum_next / sum_current, 3))\n    return factors`,
      typescript: `function chainLadderFactors(triangle: number[][]): number[] {\n  const n = triangle.length;\n  const factors: number[] = [];\n  for (let j = 0; j < n - 1; j++) {\n    let sumCurrent = 0;\n    let sumNext = 0;\n    for (let i = 0; i < n - j - 1; i++) {\n      sumCurrent += triangle[i][j];\n      sumNext += triangle[i][j+1];\n    }\n    factors.push(parseFloat((sumNext / sumCurrent).toFixed(3)));\n  }\n  return factors;\n}`
    },
    testCases: [
      { 
        input: "triangle = [[100, 150, 180], [120, 175, 0], [140, 0, 0]]", 
        output: "[1.477, 1.2]" 
      }
    ],
    validatorCode: "sumNext, sumCurrent"
  },
  {
    id: "p-3",
    title: "Black-Scholes Option Pricing (d1 Parameter)",
    difficulty: "Easy",
    timeLimit: "O(1)",
    spaceLimit: "O(1)",
    description: "In Financial Economics (CM2 / SP5), standard European options are priced using the Black-Scholes-Merton model. One of the core inputs is the parameter `d1`.\n\nFormulate and calculate the `d1` parameter given:\n- `S`: Current price of the underlying asset\n- `K`: Strike price of the option\n- `r`: Risk-free interest rate (annual compound continuous force of interest)\n- `t`: Time to maturity (in years)\n- `sigma` (σ): Volatility of the underlying asset\n\nRecall that:\n`d1 = ( ln(S / K) + (r + (sigma^2) / 2) * t ) / ( sigma * sqrt(t) )`.\n\nReturn `d1` rounded to 4 decimal places.",
    constraints: [
      "S > 0, K > 0, r >= 0, t > 0, sigma > 0"
    ],
    starterCodes: {
      javascript: `function calculateBSd1(S, K, r, t, sigma) {\n  const numerator = Math.log(S / K) + (r + Math.pow(sigma, 2) / 2) * t;\n  const denominator = sigma * Math.sqrt(t);\n  return parseFloat((numerator / denominator).toFixed(4));\n}`,
      python: `import math\n\ndef calculate_bs_d1(S: float, K: float, r: float, t: float, sigma: float) -> float:\n    numerator = math.log(S / K) + (r + (sigma ** 2) / 2) * t\n    denominator = sigma * math.sqrt(t)\n    return round(numerator / denominator, 4)`,
      typescript: `function calculateBSd1(S: number, K: number, r: number, t: number, sigma: number): number {\n  const numerator = Math.log(S / K) + (r + Math.pow(sigma, 2) / 2) * t;\n  const denominator = sigma * Math.sqrt(t);\n  return parseFloat((numerator / denominator).toFixed(4));\n}`
    },
    testCases: [
      { input: "S = 100, K = 95, r = 0.05, t = 0.5, sigma = 0.2", output: "0.5515" },
      { input: "S = 50, K = 50, r = 0.06, t = 1.0, sigma = 0.3", output: "0.3500" }
    ],
    validatorCode: "Math.log, math.log"
  }
];

export const DEFAULT_INTERVIEWERS: InterviewerProfile[] = [
  {
    id: InterviewerPersonality.Friendly,
    name: "Friendly Coach",
    role: "Actuarial Associate Mentor",
    description: "Encouraging and constructive. Helps you with gentle hints on IAI/IFoA principles, focusing heavily on confidence building.",
    avatar: "🌸"
  },
  {
    id: InterviewerPersonality.Strict,
    name: "Strict Evaluator",
    role: "No-Nonsense Lead Actuary",
    description: "Highly formal, rigorous, and quick to spot structural capital gaps. Mimics high-pressure peer reviews.",
    avatar: "👤"
  },
  {
    id: InterviewerPersonality.RealHR,
    name: "HR Recruiter",
    role: "Insurance Group HR Lead",
    description: "Speaks elegantly. Analyzes personal integrity, communication, professional standards (APS), and corporate team culture.",
    avatar: "💼"
  },
  {
    id: InterviewerPersonality.SeniorEngineer,
    name: "Actuarial Tech Lead",
    role: "Senior Model & System Architect",
    description: "Focuses deeply on code quality in Python/R, database management, and building automated reporting pipelines.",
    avatar: "💻"
  },
  {
    id: InterviewerPersonality.HiringManager,
    name: "Hiring Manager",
    role: "Head of Pricing & Underwriting",
    description: "Bridges technical premium calculations with commercial value. Evaluates pricing models, retention levels, and portfolio growth.",
    avatar: "⚙️"
  },
  {
    id: InterviewerPersonality.Partner,
    name: "Partner",
    role: "Consulting Partner (Actuarial Practice)",
    description: "Focuses on strategic commercial alignment, financial reports, client relationships, and high-level executive vision.",
    avatar: "🎯"
  },
  {
    id: InterviewerPersonality.Actuary,
    name: "Chief Actuary",
    role: "Capital & Risk Executive Lead",
    description: "Specialized in complex mathematical modeling, reserving techniques, GLM, risk margins, Solvency II, and IFRS 17 guidelines.",
    avatar: "📈"
  }
];
