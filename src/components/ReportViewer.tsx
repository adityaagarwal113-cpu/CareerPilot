/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Award, ArrowLeft, Download, Star, CheckCircle, AlertCircle, Sparkles, 
  BookOpen, Play, ClipboardList, MessageSquareCode, Book, Video, Newspaper, ChevronDown, ChevronUp, Copy, HelpCircle
} from "lucide-react";
import { InterviewSession, ReportCard, StudyPlan } from "../types";

interface ReportViewerProps {
  session: InterviewSession;
  onBackToDashboard: () => void;
}

export default function ReportViewer({ session, onBackToDashboard }: ReportViewerProps) {
  const report: ReportCard | undefined = session.reportCard;
  const study: StudyPlan | undefined = report?.studyPlan;

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [downloading, setDownloading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: number]: string }>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [completedGoals, setCompletedGoals] = useState<{ [key: number]: boolean }>({});
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean }>({});

  if (!report) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-sm max-w-lg mx-auto">
        <AlertCircle size={40} className="text-amber-500 mx-auto" />
        <h3 className="font-display font-bold text-slate-800 text-lg">Report Card Loading...</h3>
        <p className="text-xs text-slate-500">Your mock session logs are being evaluated by our report generator agent.</p>
        <button onClick={onBackToDashboard} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-medium">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleCopyCode = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadPDF = () => {
    setDownloading(true);
    
    // Attempt to invoke print dialog for clean styled PDF export
    try {
      window.print();
    } catch (e) {
      console.warn("Print blocked by container sandbox", e);
    }

    setTimeout(() => {
      // Create text content blob to export
      let textContent = `==================================================\n`;
      textContent += `INTERVIEW PREPARATION AI PLATFORM - PERFORMANCE REPORT\n`;
      textContent += `==================================================\n\n`;
      textContent += `Interview Mode: ${session.mode}\n`;
      textContent += `Difficulty Level: ${session.difficulty}\n`;
      textContent += `Overall Performance Score: ${report.overallScore}/100\n`;
      textContent += `Technical Accuracy: ${report.technicalScore}/100\n`;
      textContent += `HR Fit & Behavioral: ${report.hrScore}/100\n`;
      textContent += `Communication: ${report.communicationScore}/100\n`;
      textContent += `Estimated Confidence: ${report.confidenceScore}/100\n\n`;
      
      textContent += `--------------------------------------------------\n`;
      textContent += `STRENGTHS & FOCUS AREAS\n`;
      textContent += `--------------------------------------------------\n`;
      textContent += `Strong Areas:\n` + report.strongAreas.map(a => ` - ${a}`).join("\n") + `\n\n`;
      textContent += `Weak Areas:\n` + report.weakAreas.map(a => ` - ${a}`).join("\n") + `\n\n`;
      
      textContent += `--------------------------------------------------\n`;
      textContent += `TRANSCRIPT EVALUATION\n`;
      textContent += `--------------------------------------------------\n`;
      session.transcript.forEach((record, idx) => {
        textContent += `Q${idx+1}: ${record.questionText}\n`;
        textContent += `Your Answer: ${record.userAnswer}\n`;
        textContent += `Evaluation Rating: ${record.evaluation?.remarks || "N/A"}\n\n`;
      });

      const blob = new Blob([textContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Interview_Report_${session.id.slice(0, 6)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloading(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto" id="report-viewer-panel">
      {/* Header and Back actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={onBackToDashboard}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Back to Coach Workspace
        </button>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition shadow-md"
        >
          <Download size={13} /> {downloading ? "Exporting transcript..." : "Download Report PDF"}
        </button>
      </div>

      {/* Main Scorecard Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circle scorecard */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall score card</span>
          
          {/* SVG Progress Circle */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#f1f5f9"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#4a7aff"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * report.overallScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute text-center space-y-0.5">
              <span className="text-3xl font-display font-extrabold text-slate-800">{report.overallScore}</span>
              <span className="text-[10px] text-slate-400 block font-semibold">/ 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-700">{session.mode} Completion</h4>
            <p className="text-[10px] text-slate-400">Complexity set to: {session.difficulty}</p>
          </div>
        </div>

        {/* Breakdown sub-scores */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-display font-semibold text-slate-800 text-sm border-b border-slate-100 pb-2">Sub-Grade Breakdowns</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {/* Technical */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600">Technical Accuracy</span>
                <span className="font-bold text-slate-800">{report.technicalScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${report.technicalScore}%` }} />
              </div>
            </div>

            {/* HR / Culture fit */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600">HR Fit & Behavioral Alignment</span>
                <span className="font-bold text-slate-800">{report.hrScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${report.hrScore}%` }} />
              </div>
            </div>

            {/* Communication */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600">Communication & Clarity</span>
                <span className="font-bold text-slate-800">{report.communicationScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${report.communicationScore}%` }} />
              </div>
            </div>

            {/* Confidence */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600">Estimated Confidence Rate</span>
                <span className="font-bold text-slate-800">{report.confidenceScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${report.confidenceScore}%` }} />
              </div>
            </div>

            {/* STAR Method Score */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-600">STAR Structure Compliance</span>
                <span className="font-bold text-slate-800">{report.starMethodScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${report.starMethodScore}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="report-feedback-highlights">
        {/* Strengths */}
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-5 space-y-3">
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle size={15} /> Key Strengths Tracked
          </h3>
          <ul className="list-disc list-inside text-xs text-slate-700 pl-1 space-y-1.5 leading-relaxed">
            {report.strongAreas.map((area, i) => (
              <li key={i}>{area}</li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-rose-50/50 rounded-xl border border-rose-100 p-5 space-y-3">
          <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle size={15} /> Gaps & Critical Improvement Areas
          </h3>
          <ul className="list-disc list-inside text-xs text-slate-700 pl-1 space-y-1.5 leading-relaxed">
            {report.weakAreas.map((area, i) => (
              <li key={i}>{area}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Transcript Evaluation Expandable lists */}
      <div className="space-y-4" id="transcript-evaluations-list">
        <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2">
          <MessageSquareCode size={18} className="text-brand-500" /> Active Question Transcript & Analysis
        </h3>

        <div className="space-y-3">
          {session.transcript.map((record, idx) => {
            const isExpanded = expandedIndex === idx;
            const evalObj = record.evaluation;
            return (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header toggle */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full flex justify-between items-center p-4 bg-slate-50/50 hover:bg-slate-50/80 transition text-left"
                >
                  <div className="flex gap-3 items-center min-w-0 pr-2">
                    <span className="font-mono text-xs font-bold text-slate-400">Q{idx + 1}</span>
                    <p className="text-xs font-bold text-slate-700 truncate">{record.questionText}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {evalObj && (
                      <span className="text-[10px] font-bold text-brand-600 bg-brand-100/60 px-2 py-0.5 rounded">
                        Score: {evalObj.technicalAccuracy}%
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                {/* Content */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-100 space-y-5 text-xs">
                    {/* User Answer */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-400 uppercase tracking-wide">Your Submitted Response</h4>
                        <button
                          onClick={() => handleCopyCode(record.userAnswer, idx)}
                          className="text-[10px] text-brand-600 hover:underline flex items-center gap-1"
                        >
                          <Copy size={11} /> {copiedIndex === idx ? "Copied" : "Copy Response"}
                        </button>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                        {record.userAnswer}
                      </div>
                    </div>

                    {/* Evaluator Remarks */}
                    {evalObj ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                        {/* Analytical Remarks */}
                        <div className="space-y-2 p-4 bg-blue-50/40 rounded-xl border border-blue-100/60">
                          <h5 className="font-bold text-blue-900 flex items-center gap-1.5">
                            <Sparkles size={14} className="text-blue-500" /> AI Coach Evaluation
                          </h5>
                          <p className="text-slate-600 leading-relaxed leading-normal">{evalObj.remarks}</p>
                        </div>

                        {/* Suggested Improvement */}
                        <div className="space-y-2 p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/60">
                          <h5 className="font-bold text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-emerald-500" /> Suggested Optimization
                          </h5>
                          <p className="text-slate-600 leading-relaxed leading-normal">{evalObj.suggestedAnswer}</p>
                        </div>

                        {/* Ideal Model Answer */}
                        <div className="space-y-2 md:col-span-2 p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/60">
                          <h5 className="font-bold text-indigo-950 flex items-center gap-1.5">
                            <BookOpen size={14} className="text-indigo-600" /> Ideal Model Response Guide
                          </h5>
                          <p className="text-slate-600 leading-relaxed leading-normal whitespace-pre-wrap">{evalObj.idealAnswer}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">No evaluated feedback available for this response.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* AI STUDY PLANNER TAB */}
      {study && (
        <div className="space-y-6" id="ai-study-planner">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="font-display font-semibold text-slate-800 text-base flex items-center gap-2">
              <BookOpen size={18} className="text-indigo-600" /> AI Tailored Study Planner
            </h3>
            <p className="text-xs text-slate-500">A personalized, dynamic learning plan generated based on gaps discovered during this interview.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Weekly goals */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 md:col-span-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <ClipboardList size={14} className="text-indigo-500" /> 4-Week Study Roadmap
              </h4>
              <div className="space-y-3">
                 {study.weeklyGoals.map((goal, idx) => {
                   const isCompleted = !!completedGoals[idx];
                   return (
                     <button
                       key={idx}
                       onClick={() => setCompletedGoals(prev => ({ ...prev, [idx]: !prev[idx] }))}
                       className="w-full text-left flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer"
                     >
                       <span className={`w-5 h-5 rounded-full font-bold flex items-center justify-center shrink-0 border text-[10px] ${
                         isCompleted 
                           ? "bg-emerald-500 text-white border-emerald-500" 
                           : "bg-indigo-50 text-indigo-600 border-indigo-100"
                       }`}>
                         {isCompleted ? "✓" : idx + 1}
                       </span>
                       <p className={`text-xs pt-0.5 leading-relaxed ${
                         isCompleted ? "text-slate-400 line-through italic" : "text-slate-700 font-medium"
                       }`}>{goal}</p>
                     </button>
                   );
                 })}
              </div>
            </div>

            {/* Right: Resources */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 md:col-span-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommended Study Materials</h4>
              
              <div className="space-y-4">
                {/* Books */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Book size={12} className="text-indigo-500" /> Recommended Books
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {study.recommendedBooks.map((book, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                        <h5 className="text-[11px] font-bold text-slate-800 line-clamp-1">{book.title}</h5>
                        <p className="text-[9px] text-slate-500">By {book.author}</p>
                        <p className="text-[9px] text-slate-400 line-clamp-2">{book.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Videos & Articles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Video size={12} className="text-rose-500" /> Video Tutorials
                    </span>
                    <div className="space-y-2">
                      {study.recommendedVideos.map((video, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                          <div className="text-left">
                            <h5 className="text-[10px] font-bold text-slate-800 line-clamp-1">{video.title}</h5>
                            <p className="text-[9px] text-slate-400">{video.platform}</p>
                          </div>
                          <span className="text-[9px] text-rose-600 font-semibold hover:underline cursor-pointer">
                            Watch
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Newspaper size={12} className="text-emerald-500" /> Curated Technical Articles
                    </span>
                    <div className="space-y-2">
                      {study.recommendedArticles.map((art, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                          <div className="text-left">
                            <h5 className="text-[10px] font-bold text-slate-800 line-clamp-1">{art.title}</h5>
                            <p className="text-[9px] text-slate-400">Source: {art.source}</p>
                          </div>
                          <span className="text-[9px] text-emerald-600 font-semibold hover:underline cursor-pointer">
                            Read
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Practice Projects */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={14} className="text-amber-500" /> Customized Skill-Building Projects
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {study.projects.map((proj, idx) => (
                <div key={idx} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <h5 className="font-bold text-slate-800">{proj.title}</h5>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{proj.description}</p>
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Implementation Checklist:</span>
                    <div className="space-y-1 pl-1">
                      {proj.steps.map((step, i) => {
                        const stepKey = `${idx}-${i}`;
                        const isDone = !!completedSteps[stepKey];
                        return (
                          <button
                            key={i}
                            onClick={() => setCompletedSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }))}
                            className="w-full text-left flex gap-2 items-center text-[10px] text-slate-600 hover:text-slate-900 transition py-0.5 cursor-pointer"
                          >
                            <span className={`w-3 h-3 rounded flex items-center justify-center border text-[8px] transition ${
                              isDone ? "bg-emerald-500 text-white border-emerald-500" : "bg-slate-100 border-slate-300"
                            }`}>
                              {isDone && "✓"}
                            </span>
                            <p className={isDone ? "line-through text-slate-400 italic" : ""}>{step}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Quiz Segment */}
          <div className="bg-indigo-950 text-white rounded-xl p-5 shadow-md space-y-4">
            <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle size={15} /> Topic-Aware Practice Quiz
            </h4>
            <div className="space-y-4">
              {study.quizzes.map((quiz, idx) => (
                <div key={idx} className="space-y-2 text-xs border-b border-indigo-900/50 pb-4 last:border-none">
                  <p className="font-semibold text-indigo-100">{idx+1}. {quiz.question}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                    {quiz.options.map((opt, i) => {
                      const isSelected = quizAnswers[idx] === opt;
                      const isCorrect = opt === quiz.answer;
                      return (
                        <button
                          key={i}
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [idx]: opt }))}
                          className={`text-left p-2.5 rounded-lg border text-[11px] font-medium transition ${
                            isSelected 
                              ? "bg-indigo-600 text-white border-indigo-500" 
                              : "bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-200 border-indigo-900/50"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {quizAnswers[idx] && (
                    <p className={`text-[10px] font-bold pt-1 ${
                      quizAnswers[idx] === quiz.answer ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {quizAnswers[idx] === quiz.answer ? "✔ Correct Answer!" : `✘ Incomplete. Correct: "${quiz.answer}"`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
