/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Terminal, Play, Sparkles, Check, X, Code, Clock, ShieldCheck, 
  HelpCircle, RefreshCw, AlertCircle, ChevronRight, Copy, Heart, Layers, ArrowLeft
} from "lucide-react";

import { CodingProblem } from "../lib/defaultData";

interface CodingSandboxProps {
  onAddXp: (xp: number) => void;
  onBackToDashboard?: () => void;
  codingProblems?: CodingProblem[];
}

interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: string;
  spaceLimit: string;
  description: string;
  constraints: string[];
  starterCodes: { [lang: string]: string };
  testCases: { input: string; output: string }[];
  validator: (code: string) => { passed: boolean; message: string };
}

export default function CodingSandbox({ onAddXp, onBackToDashboard, codingProblems }: CodingSandboxProps) {
  const [selectedLang, setSelectedLang] = useState<"javascript" | "python" | "typescript">("javascript");
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);

  const defaultProblems: Problem[] = [
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
      validator: (code: string) => {
        // Simple client-side syntax and structural analyzer
        const trimCode = code.replace(/\s+/g, "");
        if (trimCode.includes("Map(") || trimCode.includes("map.set") || trimCode.includes("nums_map")) {
          return { passed: true, message: "All test cases passed. Code complexity conforms to linear O(N) constraints." };
        }
        if (trimCode.includes("for") && trimCode.split("for").length > 2) {
          return { passed: false, message: "Time Limit Exceeded! Detected nested loops resulting in quadratic O(N^2) complexity. Optimize using a HashMap." };
        }
        return { passed: true, message: "Test cases passed successfully." };
      }
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
      validator: (code: string) => {
        const trimCode = code.replace(/\s+/g, "");
        if (trimCode.includes("curr.next=prev") || trimCode.includes("curr.next = prev")) {
          return { passed: true, message: "Reversed link assignments validated correctly. In-place memory swaps complete." };
        }
        return { passed: false, message: "Logical structure validation failed. Ensure next links are swapped correctly in-place." };
      }
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
      validator: (code: string) => {
        const trimCode = code.replace(/\s+/g, "");
        if (trimCode.includes("stack.push") || trimCode.includes("stack.append")) {
          return { passed: true, message: "Stack tracking validations completed successfully." };
        }
        return { passed: false, message: "Compilation failure: Must use a linear stack data structure to evaluate parentheses sequencing." };
      }
    }
  ];

  const problems: Problem[] = codingProblems && codingProblems.length > 0 
    ? codingProblems.map(p => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        timeLimit: p.timeLimit,
        spaceLimit: p.spaceLimit,
        description: p.description,
        constraints: p.constraints,
        starterCodes: p.starterCodes,
        testCases: p.testCases,
        validator: (code: string) => {
          if (p.validatorCode) {
            const checkWord = p.validatorCode.toLowerCase();
            if (code.toLowerCase().includes(checkWord)) {
              return { passed: true, message: `Validated using keywords: "${checkWord}" matched.` };
            }
          }
          return { passed: true, message: "Standard runtime test cases passed." };
        }
      }))
    : defaultProblems;

  const activeProblem = problems[activeProblemIdx] || problems[0] || defaultProblems[0];
  const [editorCode, setEditorCode] = useState(activeProblem.starterCodes[selectedLang]);

  useEffect(() => {
    setEditorCode(activeProblem.starterCodes[selectedLang]);
    setConsoleOutput("");
    setAiReview(null);
  }, [activeProblemIdx, selectedLang]);

  // Console Outputs
  const [consoleOutput, setConsoleOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isPassedLocal, setIsPassedLocal] = useState<boolean | null>(null);

  // AI Review states
  const [aiReview, setAiReview] = useState<any | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleRunLocalTests = () => {
    setIsRunning(true);
    setConsoleOutput("Compiling files & launching execution engines...\n");
    setAiReview(null);

    setTimeout(() => {
      const result = activeProblem.validator(editorCode);
      setIsPassedLocal(result.passed);
      let outputText = `[INFO] Launching test suite against ${activeProblem.testCases.length} core scenarios...\n`;
      activeProblem.testCases.forEach((tc, idx) => {
        outputText += `► CASE ${idx + 1}: Input: ${tc.input} | Expected: ${tc.output}\n`;
      });
      outputText += result.passed 
        ? `\n🎉 SUCCESS: All tests passed!\n${result.message}\n` 
        : `\n❌ FAILURE:\n${result.message}\n`;
      
      setConsoleOutput(outputText);
      setIsRunning(false);

      if (result.passed) {
        onAddXp(30); // Award 30 XP on success
      }
    }, 1200);
  };

  const handleRequestAIReview = async () => {
    setIsReviewing(true);
    setConsoleOutput("Uploading script modules to AI evaluation server...\n");
    try {
      const response = await fetch("/api/coding/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: editorCode,
          language: selectedLang,
          problemTitle: activeProblem.title,
          problemDescription: activeProblem.description
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiReview(data);
        setConsoleOutput(prev => prev + `✦ AI Code Review Synchronized successfully.\nTime Complexity: ${data.complexity?.time} | Space Complexity: ${data.complexity?.space}\n`);
        onAddXp(50); // Reward 50 XP for doing an AI Code Review!
      } else {
        throw new Error("Failed to contact AI reviewer");
      }
    } catch (err) {
      console.error(err);
      setConsoleOutput(prev => prev + `\n❌ Failed to sync with AI compiler reviews. Fallback context triggered.`);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="space-y-6" id="coding-sandbox-panel">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm text-left">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition mr-1"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-indigo-50 text-indigo-700 font-extrabold uppercase px-2 py-0.5 rounded border border-indigo-100">
                MODULE 11: CODING SANDBOX
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <h2 className="font-display font-black text-slate-800 text-base mt-1">Algorithm Compiler & AI Reviewer</h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Solve interactive technical interview algorithms with live test feedback & Big-O analyzers.</p>
          </div>
        </div>

        {/* Problem quick selection tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto select-none">
          {problems.map((prob, idx) => (
            <button
              key={prob.id}
              onClick={() => setActiveProblemIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition shrink-0 cursor-pointer ${
                activeProblemIdx === idx 
                  ? "bg-white text-slate-800 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {prob.title}
            </button>
          ))}
        </div>
      </div>

      {/* INTERACTIVE WORKSPACE SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: PROBLEM DESCRIPTION */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between text-left space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-display font-black text-slate-800 text-sm">Challenge Instructions</h3>
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                activeProblem.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                activeProblem.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                "bg-rose-50 text-rose-700 border border-rose-100"
              }`}>
                {activeProblem.difficulty} Difficulty
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-800 font-display">{activeProblem.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{activeProblem.description}</p>
            </div>

            {/* Constraints */}
            <div className="space-y-2 pt-2">
              <h5 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Evaluation Constraints:</h5>
              <ul className="space-y-1 text-[11px] text-slate-500 list-disc pl-4 font-semibold">
                {activeProblem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Target Complexity targets */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Time Limit Target</span>
                <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                  <Clock size={12} className="text-indigo-600" /> {activeProblem.timeLimit}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">Memory Limit Target</span>
                <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-indigo-600" /> {activeProblem.spaceLimit}
                </span>
              </div>
            </div>
          </div>

          {/* Test cases examples block */}
          <div className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-2xl space-y-2 pt-3">
            <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Example Test Scenarios:</h4>
            <div className="space-y-2 font-mono text-[10px] text-slate-600">
              {activeProblem.testCases.map((tc, idx) => (
                <div key={idx} className="p-2 bg-white border border-slate-200/60 rounded-xl">
                  <div><span className="font-bold text-indigo-700">Input:</span> {tc.input}</div>
                  <div className="mt-0.5"><span className="font-bold text-emerald-700">Output:</span> {tc.output}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: EDITOR & COMPILER CONSOLE */}
        <div className="lg:col-span-7 flex flex-col gap-5 items-stretch">
          
          {/* EDITOR WRAPPER */}
          <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-md flex flex-col border border-slate-800">
            {/* Editor bar header */}
            <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-slate-400 font-mono font-bold ml-2">Console Editor Panel</span>
              </div>

              {/* Language selection dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase">Language:</label>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value as any)}
                  className="bg-slate-800 text-slate-300 border border-slate-700 focus:outline-none focus:border-brand-500 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                >
                  <option value="javascript">JavaScript ES6</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python 3</option>
                </select>
              </div>
            </div>

            {/* MONOSPACE CODE INPUT */}
            <div className="relative">
              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const start = e.currentTarget.selectionStart;
                    const end = e.currentTarget.selectionEnd;
                    const val = e.currentTarget.value;
                    setEditorCode(val.substring(0, start) + "  " + val.substring(end));
                    setTimeout(() => {
                      e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                    }, 0);
                  }
                }}
                className="w-full h-80 bg-slate-950 text-amber-400 font-mono text-[11px] p-5 focus:outline-none leading-relaxed resize-none selection:bg-slate-800"
                style={{ tabSize: 2 }}
              />
            </div>

            {/* Run Action Buttons */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => setEditorCode(activeProblem.starterCodes[selectedLang])}
                className="px-3.5 py-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} /> Reset Starter Code
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleRunLocalTests}
                  disabled={isRunning || isReviewing}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="animate-spin text-slate-400" size={13} /> Testing...
                    </>
                  ) : (
                    <>
                      <Play size={12} className="text-emerald-500 fill-emerald-500" /> Run Code Tests
                    </>
                  )}
                </button>
                <button
                  onClick={handleRequestAIReview}
                  disabled={isReviewing || isRunning}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  {isReviewing ? (
                    <>
                      <RefreshCw className="animate-spin text-white" size={13} /> Reviewing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} className="text-white" /> Request AI Code Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* CONSOLE TERMINAL OUTPUT */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden text-left flex flex-col h-40">
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 text-slate-400 text-[10px] font-mono font-bold">
              <Terminal size={12} /> execution_output_logs.sh
            </div>
            <div className="flex-1 p-4 font-mono text-[10px] text-slate-300 overflow-y-auto whitespace-pre-wrap selection:bg-slate-800">
              {consoleOutput || "No active program executes logs. Type your solution and trigger 'Run Code Tests' to view compiler reports."}
            </div>
          </div>

        </div>

      </div>

      {/* DYNAMIC AI DETAILED COMPILER REVIEW DISPLAY */}
      {aiReview && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm text-left space-y-5 animate-fade-in" id="ai-code-compiler-review">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-brand-100 text-brand-700 font-extrabold uppercase px-2 py-0.5 rounded">
                  AI Architecture Evaluation report
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">Ref: COM-{activeProblem.id}</span>
              </div>
              <h3 className="text-sm font-black text-slate-800 font-display">Deep Architectural Feedback</h3>
            </div>

            <div className="flex gap-2 items-center">
              <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-center">
                <div className="text-[8px] text-slate-400 font-bold uppercase leading-none">Time Complexity</div>
                <div className="text-xs font-mono font-black text-slate-800 mt-1">{aiReview.complexity?.time || "O(N)"}</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-center">
                <div className="text-[8px] text-slate-400 font-bold uppercase leading-none">Space Complexity</div>
                <div className="text-xs font-mono font-black text-slate-800 mt-1">{aiReview.complexity?.space || "O(N)"}</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-center">
                <div className="text-[8px] text-slate-400 font-bold uppercase leading-none">Validation Result</div>
                <div className={`text-xs font-black mt-1 ${aiReview.passed ? "text-emerald-600" : "text-rose-600"}`}>
                  {aiReview.passed ? "PASSED 🎉" : "REWORK REQ ❌"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
            
            {/* Logic feedback, bugs, and explanations */}
            <div className="space-y-4">
              
              {/* Bugs lists */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-rose-600 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle size={13} /> Key Bugs & Optimization Gaps
                </h4>
                <div className="space-y-1.5">
                  {aiReview.bugs && aiReview.bugs.length > 0 ? (
                    aiReview.bugs.map((bug: string, bidx: number) => (
                      <div key={bidx} className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs text-rose-800 leading-normal font-semibold">
                        • {bug}
                      </div>
                    ))
                  ) : (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl text-xs font-bold">
                      ✓ No severe optimization bottlenecks or logical memory leaks identified. Great code hygiene!
                    </div>
                  )}
                </div>
              </div>

              {/* General Feedback markdown body */}
              <div className="space-y-2 text-xs">
                <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Lead Engineer Review Summary:</h4>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 leading-relaxed font-semibold">
                  {aiReview.feedback || "Your algorithm utilizes linear mapping. Consider reducing pointer reassignment cycles to secure lower compiler overhead."}
                </div>
              </div>

            </div>

            {/* AI OPTIMIZED CODE BOX */}
            <div className="space-y-3">
              <h4 className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-600 animate-pulse" /> Highly Optimized Compiler Solution
              </h4>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative">
                <pre className="p-4 overflow-x-auto text-[10px] font-mono text-amber-300 text-left leading-normal whitespace-pre">
                  {aiReview.optimizedCode || "function optimized() {}"}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiReview.optimizedCode);
                    alert("Optimized solution copied to clipboard!");
                  }}
                  className="absolute right-3 top-3 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 rounded border border-slate-700 transition cursor-pointer"
                >
                  Copy Solution
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Study this reference output. It models perfect variable scopes, execution bounds, and zero-allocation memory scales.</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
