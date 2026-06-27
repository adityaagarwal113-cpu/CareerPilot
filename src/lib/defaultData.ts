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
  { id: "qb-1", text: "How would you model pricing options for high-hazard property risk premiums under negative interest scenarios?", company: "MetLife", role: "Actuary / Risk Manager", difficulty: "Hard", round: "Technical", subject: "Actuarial Science" },
  { id: "qb-2", text: "Explain the difference between L1 and L2 regularization. Under what exact conditions would you prefer L1?", company: "Google", role: "AI & ML Engineer", difficulty: "Medium", round: "Technical", subject: "Machine Learning" },
  { id: "qb-3", text: "Describe a complex professional failure. Walk through your mitigation steps and eventual lesson using the STAR format.", company: "Amazon", role: "Product Manager", difficulty: "Easy", round: "Behavioral", subject: "STAR Leadership" },
  { id: "qb-4", text: "Our client is a global retail giant facing 15% year-on-year supply chain delays. How would you structure your feasibility analysis?", company: "McKinsey", role: "Management Consultant", difficulty: "Hard", round: "System Design", subject: "Business Strategy Case" },
  { id: "qb-5", text: "Write an optimized function in Python to detect whether a directed graph contains a cycle using topological sorting.", company: "Google", role: "Senior Software Engineer", difficulty: "Hard", round: "Technical", subject: "Data Structures & Algorithms" },
  { id: "qb-6", text: "Walk through the full corporate valuation model process. How would you adjust cost of capital for a volatile tech startup?", company: "Goldman Sachs", role: "Investment Banking Analyst", difficulty: "Medium", round: "Technical", subject: "Corporate Finance" }
];

export const DEFAULT_APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  {
    id: "q-quant-1",
    category: "Quantitative Aptitude",
    question: "A company's risk reserving pool compounding annually grew from $10M to $12.1M in two years. What was the exact annual risk growth compounding rate?",
    options: ["8%", "10%", "12%", "15%"],
    correctIndex: 1,
    explanation: "Using the compound growth formula: A = P(1 + r)^t. Here, 12.1 = 10(1 + r)^2 => 1.21 = (1 + r)^2 => 1.1 = 1 + r => r = 0.10 or 10%.",
    difficulty: "Medium"
  },
  {
    id: "q-quant-2",
    category: "Quantitative Aptitude",
    question: "If a software server's probability of failure during high-concurrency workloads is 0.05, what is the probability that it survives exactly 3 consecutive independent peaks?",
    options: ["0.857", "0.950", "0.995", "0.150"],
    correctIndex: 0,
    explanation: "Survival probability for a single peak is 1 - 0.05 = 0.95. For 3 consecutive peaks, the joint probability is 0.95^3 = 0.857375.",
    difficulty: "Medium"
  },
  {
    id: "q-log-1",
    category: "Logical Reasoning",
    question: "All high-growth companies prioritize AI. Some companies that prioritize AI do not survive the first 3 years. Which of the following must be true?",
    options: [
      "No high-growth company fails in the first 3 years.",
      "Some companies that do not survive the first 3 years might be high-growth companies.",
      "All AI prioritizing companies are high-growth.",
      "No AI prioritizing companies fail."
    ],
    correctIndex: 1,
    explanation: "Since some AI-prioritizing companies fail, and all high-growth companies are part of the AI-prioritizing group, it is logically possible that some failing companies are high-growth.",
    difficulty: "Medium"
  },
  {
    id: "q-verbal-1",
    category: "Verbal Ability",
    question: "Select the word that is most opposite in meaning to 'Obfuscate':",
    options: ["Clarify", "Confound", "Elicit", "Prevaricate"],
    correctIndex: 0,
    explanation: "To obfuscate means to make obscure, unclear, or unintelligible. Its opposite is to clarify, which means to make clear and easy to understand.",
    difficulty: "Easy"
  }
];

export const DEFAULT_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: "p-1",
    title: "Two Sum",
    difficulty: "Easy",
    timeLimit: "O(n)",
    spaceLimit: "O(n)",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ],
    starterCodes: {
      javascript: `function twoSum(nums, target) {\n  // Write your O(n) solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your O(n) solution here\n    nums_map = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in nums_map:\n            return [nums_map[complement], i]\n        nums_map[num] = i\n    return []`,
      typescript: `function twoSum(nums: number[], target: number): number[] {\n  // Write your O(n) solution here\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`
    },
    testCases: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
    ],
    validatorCode: "map.set, Map"
  },
  {
    id: "p-2",
    title: "Reverse Linked List",
    difficulty: "Easy",
    timeLimit: "O(n)",
    spaceLimit: "O(1)",
    description: "Given the `head` of a singly linked list, reverse the list, and return the reversed list.\n\nCould you reverse it both iteratively and recursively?",
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000"
    ],
    starterCodes: {
      javascript: `function reverseList(head) {\n  // Write your iterative O(n) time, O(1) space solution here\n  let prev = null;\n  let curr = head;\n  while (curr !== null) {\n    let nextTemp = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nextTemp;\n  }\n  return prev;\n}`,
      python: `def reverse_list(head):\n    # Write your iterative O(n) time, O(1) space solution here\n    prev = None\n    curr = head\n    while curr:\n        next_temp = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_temp\n    return prev`,
      typescript: `class ListNode {\n  val: number;\n  next: ListNode | null;\n  constructor(val?: number, next?: ListNode | null) {\n    this.val = (val===undefined ? 0 : val);\n    this.next = (next===undefined ? null : next);\n  }\n}\n\nfunction reverseList(head: ListNode | null): ListNode | null {\n  let prev: ListNode | null = null;\n  let curr = head;\n  while (curr !== null) {\n    let nextTemp: ListNode | null = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nextTemp;\n  }\n  return prev;\n}`
    },
    testCases: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" }
    ],
    validatorCode: "curr.next"
  },
  {
    id: "p-3",
    title: "Valid Parentheses",
    difficulty: "Easy",
    timeLimit: "O(n)",
    spaceLimit: "O(n)",
    description: "Given a string `s` containing just the characters `'(', ')', '{', '}', '[' and ']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses characters only: '()[]{}'"
    ],
    starterCodes: {
      javascript: `function isValid(s) {\n  const stack = [];\n  const map = {\n    ')': '(',\n    '}': '{',\n    ']': '['\n  };\n  for (let char of s) {\n    if (char === '(' || char === '{' || char === '[') {\n      stack.push(char);\n    } else {\n      if (stack.pop() !== map[char]) {\n        return false;\n      }\n    }\n  }\n  return stack.length === 0;\n}`,
      python: `def is_valid(s: str) -> bool:\n    stack = []\n    bracket_map = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in bracket_map.values():\n            stack.append(char)\n        elif char in bracket_map:\n            if not stack or stack.pop() != bracket_map[char]:\n                return False\n    return len(stack) == 0`,
      typescript: `function isValid(s: string): boolean {\n  const stack: string[] = [];\n  const map: { [key: string]: string } = {\n    ')': '(',\n    '}': '{',\n    ']': '['\n  };\n  for (let char of s) {\n    if (char === '(' || char === '{' || char === '[') {\n      stack.push(char);\n    } else {\n      if (stack.pop() !== map[char]) {\n        return false;\n      }\n    }\n  }\n  return stack.length === 0;\n}`
    },
    testCases: [
      { input: "s = '()[]{}'", output: "true" },
      { input: "s = '(]'", output: "false" }
    ],
    validatorCode: "stack.push, stack.append"
  }
];

export const DEFAULT_INTERVIEWERS: InterviewerProfile[] = [
  {
    id: InterviewerPersonality.Friendly,
    name: "Friendly Coach",
    role: "Supportive Mentor",
    description: "Encouraging and constructive. Helps you with gentle hints, focusing heavily on confidence building.",
    avatar: "🌸"
  },
  {
    id: InterviewerPersonality.Strict,
    name: "Strict Evaluator",
    role: "No-Nonsense Lead",
    description: "Highly formal, rigorous, and quick to spot structural gaps. Mimics high-pressure elite stress tests.",
    avatar: "👤"
  },
  {
    id: InterviewerPersonality.RealHR,
    name: "HR Recruiter",
    role: "Culture Matcher",
    description: "Speaks elegantly. Analyzes personal integrity, communication, behavioral growth, and team culture.",
    avatar: "💼"
  },
  {
    id: InterviewerPersonality.SeniorEngineer,
    name: "Tech Lead",
    role: "Senior System Architect",
    description: "Focuses deeply on code quality, design patterns, algorithmic optimization, and technical depth.",
    avatar: "💻"
  },
  {
    id: InterviewerPersonality.HiringManager,
    name: "Hiring Manager",
    role: "Product & Engineering Director",
    description: "Bridges technical accuracy with business value. Evaluates project scope, delivery, and roadmap thinking.",
    avatar: "⚙️"
  },
  {
    id: InterviewerPersonality.Partner,
    name: "Partner",
    role: "Executive Consultant",
    description: "Focuses on strategic commercial alignment, client relationships, case study results, and leadership vision.",
    avatar: "🎯"
  },
  {
    id: InterviewerPersonality.Actuary,
    name: "Chief Actuary",
    role: "Capital & Risk Lead",
    description: "Specialized in actuarial mathematical modeling, reserving, GLM pricing, and IFRS17 requirements.",
    avatar: "📈"
  }
];
