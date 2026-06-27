/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  UploadCloud, FileText, Briefcase, ChevronRight, CheckCircle, 
  AlertTriangle, Sparkles, BookOpen, Layers, RefreshCw, Trash2, ArrowLeftRight
} from "lucide-react";
import { Resume, JobDescription, MatchResult } from "../types";

interface DocumentUploadProps {
  resumes: Resume[];
  jds: JobDescription[];
  onAddResume: (name: string, text: string) => Promise<void>;
  onAddJd: (name: string, text: string) => Promise<void>;
  onDeleteResume: (id: string) => void;
  onDeleteJd: (id: string) => void;
}

export default function DocumentUpload({
  resumes,
  jds,
  onAddResume,
  onAddJd,
  onDeleteResume,
  onDeleteJd
}: DocumentUploadProps) {
  const [activeTab, setActiveTab] = useState<"resume" | "jd" | "match" | "tailor">("resume");
  const [resumeName, setResumeName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jdName, setJdName] = useState("");
  const [jdText, setJdText] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Matching selections
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJdId, setSelectedJdId] = useState("");
  const [matchingResult, setMatchingResult] = useState<MatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);

  // Module 4-7 Tailoring States
  const [tailorType, setTailorType] = useState<"cover_letter" | "linkedin" | "portfolio_review" | "resume_tailoring">("cover_letter");
  const [tailorResult, setTailorResult] = useState<any | null>(null);
  const [tailorLoading, setTailorLoading] = useState(false);

  const selectedResume = resumes.find(r => r.id === selectedResumeId);
  const selectedJd = jds.find(j => j.id === selectedJdId);

  // Drag & drop mock state
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent, type: "resume" | "jd") => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const text = await file.text();
      const sanitizedName = file.name.replace(/\.[^/.]+$/, ""); // strip extension
      
      if (type === "resume") {
        setResumeName(sanitizedName);
        setResumeText(text);
      } else {
        setJdName(sanitizedName);
        setJdText(text);
      }
    }
  };

  const handleAddResumeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeName.trim() || !resumeText.trim()) {
      setErrorMsg("Please provide both a name and resume contents.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await onAddResume(resumeName, resumeText);
      setResumeName("");
      setResumeText("");
      // select the newly added resume automatically for matching
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze resume. Make sure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddJdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdName.trim() || !jdText.trim()) {
      setErrorMsg("Please provide both a job title/name and description context.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await onAddJd(jdName, jdText);
      setJdName("");
      setJdText("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze JD. Make sure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatching = async () => {
    if (!selectedResume || !selectedJd) {
      setErrorMsg("Please select both a resume and a job description to perform matching.");
      return;
    }
    setMatchLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: selectedResume.parsedData,
          jd: selectedJd.parsedData
        })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to align resumes.");
      }
      const data = await res.json();
      setMatchingResult(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to match elements.");
    } finally {
      setMatchLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="upload-module-container">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-800 flex items-center gap-2">
            <Layers className="text-brand-500" size={22} /> Document Analyzer & Alignment
          </h2>
          <p className="text-xs text-slate-500">Analyze your resume formatting and compare with target job descriptions instantly.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/50">
          <button
            onClick={() => { setActiveTab("resume"); setErrorMsg(""); }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "resume" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Resumes
          </button>
          <button
            onClick={() => { setActiveTab("jd"); setErrorMsg(""); }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === "jd" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Job Descriptions
          </button>
          <button
            onClick={() => { setActiveTab("match"); setErrorMsg(""); }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === "match" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <ArrowLeftRight size={13} /> ATS Matching
          </button>
          <button
            onClick={() => { setActiveTab("tailor"); setErrorMsg(""); }}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === "tailor" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles size={13} className="text-indigo-600 animate-pulse" /> AI Optimization Suite
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-center gap-2" id="error-banner">
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs View */}

      {/* 1. RESUME TAB */}
      {activeTab === "resume" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="resume-tab-view">
          {/* Form & Upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Upload or Paste Resume</h3>
            
            <form onSubmit={handleAddResumeSubmit} className="space-y-4">
              {/* Drag n Drop Box */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={(e) => handleDrop(e, "resume")}
                className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition ${
                  dragActive ? "border-brand-500 bg-brand-50/40" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud size={30} className={dragActive ? "text-brand-500" : "text-slate-400"} />
                  <p className="text-xs font-medium text-slate-600">Drag PDF, TXT or DOCX here</p>
                  <p className="text-[10px] text-slate-400">or click to choose file</p>
                </div>
                <input
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const text = await file.text();
                      setResumeName(file.name.replace(/\.[^/.]+$/, ""));
                      setResumeText(text);
                    }
                  }}
                  className="hidden"
                  id="resume-file-input"
                />
                <label htmlFor="resume-file-input" className="block text-slate-500 text-xs mt-2 hover:underline cursor-pointer">
                  Browse Files
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Resume Label / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aditya Agarwal - Principal Engineer"
                  value={resumeName}
                  onChange={(e) => setResumeName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Paste Full Resume Text</label>
                <textarea
                  rows={8}
                  placeholder="Paste whole resume content here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-slate-50/50 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 active:scale-95 transition disabled:opacity-50 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} /> Parsing Resume Agent...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Parse & Analyze Resume
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List & Parsed Results Preview */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Resume Library & Analysis</h3>

            {resumes.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs shadow-sm">
                No resumes currently inside library. Upload above to run parsing metrics.
              </div>
            ) : (
              <div className="space-y-4">
                {resumes.map(resume => (
                  <div key={resume.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileText className="text-brand-500" size={16} />
                        <h4 className="text-xs font-bold text-slate-700">{resume.name}</h4>
                      </div>
                      <button
                        onClick={() => onDeleteResume(resume.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Meta Score */}
                    {resume.parsedData ? (
                      <div className="p-5 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">ATS Compatibility Score</p>
                              <h5 className="text-xl font-display font-bold text-indigo-600 mt-1">{resume.parsedData.atsScore}%</h5>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                              <Sparkles size={16} className="text-indigo-500" />
                            </div>
                          </div>

                          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold">Resume Quality Score</p>
                              <h5 className="text-xl font-display font-bold text-blue-600 mt-1">{resume.parsedData.qualityScore}%</h5>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                              <CheckCircle size={16} className="text-blue-500" />
                            </div>
                          </div>
                        </div>

                        {/* Extracted Skills */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Technical Skills Extracted</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {resume.parsedData.skills.technical.slice(0, 15).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200/50">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Soft Skills Extracted</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {resume.parsedData.skills.soft.slice(0, 15).map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium border border-slate-200/50">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Missing Keywords & Improvement Suggestions */}
                        <div className="space-y-3 pt-2">
                          {resume.parsedData.missingKeywords.length > 0 && (
                            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100/70 space-y-1.5">
                              <h6 className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                                <AlertTriangle size={13} /> Recommended Missing Keywords
                              </h6>
                              <div className="flex flex-wrap gap-1">
                                {resume.parsedData.missingKeywords.map((kw, i) => (
                                  <span key={i} className="text-[10px] bg-amber-100/60 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {resume.parsedData.suggestions.length > 0 && (
                            <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/70 space-y-1.5">
                              <h6 className="text-xs font-semibold text-blue-800 flex items-center gap-1">
                                <BookOpen size={13} /> ATS Optimization Roadmap
                              </h6>
                              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                                {resume.parsedData.suggestions.map((sug, i) => (
                                  <li key={i}>{sug}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 text-center text-slate-400 text-xs">
                        No parsed metrics loaded. Try deleting and re-uploading.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. JOB DESCRIPTION TAB */}
      {activeTab === "jd" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="jd-tab-view">
          {/* Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Add Job Description</h3>
            
            <form onSubmit={handleAddJdSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Job Title / Company Label</label>
                <input
                  type="text"
                  placeholder="e.g. Google - Senior Frontend Architect"
                  value={jdName}
                  onChange={(e) => setJdName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 bg-slate-50/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">Paste Full Job Description Context</label>
                <textarea
                  rows={10}
                  placeholder="Paste the target requirements, qualifications, and role responsibilities..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 bg-slate-50/50 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition disabled:opacity-50 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} /> Extracting JD...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Analyze & Extract Job Context
                  </>
                )}
              </button>
            </form>
          </div>

          {/* List & Extracted Details */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Parsed Job Contexts</h3>

            {jds.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-xs shadow-sm">
                No Job Descriptions currently. Analyze above to align interview modes.
              </div>
            ) : (
              <div className="space-y-4">
                {jds.map(jd => (
                  <div key={jd.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Briefcase className="text-emerald-500" size={16} />
                        <h4 className="text-xs font-bold text-slate-700">{jd.name}</h4>
                      </div>
                      <button
                        onClick={() => onDeleteJd(jd.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {jd.parsedData ? (
                      <div className="p-5 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Extracted Title & Company</p>
                            <p className="font-semibold text-slate-700 mt-1">
                              {jd.parsedData.title} @ {jd.parsedData.company}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Years of Experience Requirement</p>
                            <p className="font-semibold text-slate-700 mt-1">{jd.parsedData.yearsOfExperience || "Not Specified"}</p>
                          </div>
                        </div>

                        <hr className="border-slate-100" />

                        <div className="space-y-2">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Key Skills</h5>
                          <div className="flex flex-wrap gap-1.5">
                            {jd.parsedData.requiredSkills.map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium border border-emerald-100">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Responsibilities Extracted</h5>
                          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600 pl-1">
                            {jd.parsedData.responsibilities.slice(0, 6).map((resp, i) => (
                              <li key={i}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 text-center text-slate-400 text-xs">
                        No parsed data fields loaded.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. RESUME VS JD ATS MATCHING TAB */}
      {activeTab === "match" && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6" id="ats-alignment-matching">
          <div className="flex flex-col md:flex-row justify-between gap-4 bg-slate-50 rounded-xl p-5 border border-slate-100/80">
            {/* Selection Column 1 */}
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <FileText size={14} className="text-brand-500" /> Choose Candidate Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => { setSelectedResumeId(e.target.value); setMatchingResult(null); }}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-brand-500 bg-white"
              >
                <option value="">-- Select Resume --</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Selection Column 2 */}
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Briefcase size={14} className="text-emerald-500" /> Choose Target Job context
              </label>
              <select
                value={selectedJdId}
                onChange={(e) => { setSelectedJdId(e.target.value); setMatchingResult(null); }}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 bg-white"
              >
                <option value="">-- Select Job Description --</option>
                {jds.map(j => (
                  <option key={j.id} value={j.id}>{j.name}</option>
                ))}
              </select>
            </div>

            {/* Run Button */}
            <div className="flex items-end">
              <button
                onClick={handleRunMatching}
                disabled={matchLoading || !selectedResumeId || !selectedJdId}
                className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-medium rounded-lg shadow-md hover:shadow-indigo-600/10 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {matchLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} /> Matching Core...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight size={14} /> Run Match Alignment
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Comparison */}
          {matchingResult ? (
            <div className="space-y-6 pt-2" id="matching-report-view">
              {/* Score highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Candidate Match Score</span>
                    <h5 className="text-3xl font-display font-extrabold text-indigo-600 mt-1">{matchingResult.atsScore}%</h5>
                  </div>
                  <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${matchingResult.atsScore}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500">Overall compliance to ATS sorting & resume density filters.</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Skill Compliance Match</span>
                    <h5 className="text-3xl font-display font-extrabold text-emerald-600 mt-1">{matchingResult.skillMatchScore}%</h5>
                  </div>
                  <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${matchingResult.skillMatchScore}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-500">Overlap of technical stacks & hard skills mentioned in the JD.</p>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matching */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={14} /> Matching Credentials Found ({matchingResult.matchingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 p-3 border border-slate-200 bg-slate-50/20 rounded-lg min-h-[100px] content-start">
                    {matchingResult.matchingSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={14} /> Key Gaps Identified ({matchingResult.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 p-3 border border-slate-200 bg-slate-50/20 rounded-lg min-h-[100px] content-start">
                    {matchingResult.missingSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[10px] font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gap Analysis and Learning Roadmap */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-500" /> Deep Gap Analysis
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{matchingResult.gapAnalysis}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Recommended Projects to Bridge Gaps</h5>
                    <ul className="list-disc list-inside text-xs text-slate-600 pl-1 space-y-1">
                      {matchingResult.recommendedProjects.map((proj, i) => (
                        <li key={i}>{proj}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Target Certifications</h5>
                    <ul className="list-disc list-inside text-xs text-slate-600 pl-1 space-y-1">
                      {matchingResult.recommendedCertifications.map((cert, i) => (
                        <li key={i}>{cert}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Optimization tips */}
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 space-y-3">
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-600" /> Resume Copy-Writing & Optimization Roadmap
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchingResult.optimizationTips.slice(0, 4).map((tip, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-slate-700">
                      <span className="font-bold text-indigo-500">{idx + 1}.</span>
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-400 text-xs">
              Select a resume and job description above, then click Run Match Alignment to see detailed gap and compliance analytics.
            </div>
          )}
        </div>
      )}

      {/* 4. AI OPTIMIZATION SUITE TAB */}
      {activeTab === "tailor" && (
        <div className="space-y-6 text-left animate-fade-in" id="ai-document-tailoring-suite">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Column */}
            <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-5">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <Sparkles size={13} className="text-indigo-600" /> Tailoring Parameters
              </h3>

              {/* Select Resume */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-500">
                <label className="text-[11px] font-bold">1. Select Reference Document</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold"
                >
                  <option value="">-- Choose Resume --</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Select Target JD */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-500">
                <label className="text-[11px] font-bold">2. Select Target Job Description</label>
                <select
                  value={selectedJdId}
                  onChange={(e) => setSelectedJdId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold"
                >
                  <option value="">-- Choose Target JD (Optional) --</option>
                  {jds.map(j => (
                    <option key={j.id} value={j.id}>{j.name}</option>
                  ))}
                </select>
              </div>

              {/* Generator Type Cards */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 block">3. Select Optimization Engine</label>
                
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setTailorType("cover_letter")}
                    className={`w-full p-2.5 border rounded-xl text-left transition text-[11px] font-bold flex items-center gap-2 cursor-pointer ${
                      tailorType === "cover_letter" ? "bg-indigo-50 border-indigo-200 text-indigo-800" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    <span>✉️</span> Cover Letter Tailoring
                  </button>
                  <button
                    type="button"
                    onClick={() => setTailorType("linkedin")}
                    className={`w-full p-2.5 border rounded-xl text-left transition text-[11px] font-bold flex items-center gap-2 cursor-pointer ${
                      tailorType === "linkedin" ? "bg-indigo-50 border-indigo-200 text-indigo-800" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    <span>🌐</span> LinkedIn SEO branding
                  </button>
                  <button
                    type="button"
                    onClick={() => setTailorType("resume_tailoring")}
                    className={`w-full p-2.5 border rounded-xl text-left transition text-[11px] font-bold flex items-center gap-2 cursor-pointer ${
                      tailorType === "resume_tailoring" ? "bg-indigo-50 border-indigo-200 text-indigo-800" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    <span>📝</span> Bullet-Point Rewriting
                  </button>
                  <button
                    type="button"
                    onClick={() => setTailorType("portfolio_review")}
                    className={`w-full p-2.5 border rounded-xl text-left transition text-[11px] font-bold flex items-center gap-2 cursor-pointer ${
                      tailorType === "portfolio_review" ? "bg-indigo-50 border-indigo-200 text-indigo-800" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                    }`}
                  >
                    <span>🛡️</span> Portfolio & GitHub Audit
                  </button>
                </div>
              </div>

              {/* Trigger Button */}
              <button
                type="button"
                disabled={tailorLoading || !selectedResumeId}
                onClick={async () => {
                  setTailorLoading(true);
                  setErrorMsg("");
                  try {
                    const response = await fetch("/api/document/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: tailorType,
                        resumeText: selectedResume?.parsedData ? JSON.stringify(selectedResume.parsedData) : selectedResume?.text,
                        jdText: selectedJd?.parsedData ? JSON.stringify(selectedJd.parsedData) : selectedJd?.text
                      })
                    });
                    if (!response.ok) {
                      const err = await response.json();
                      throw new Error(err.error || "Failed to trigger generator.");
                    }
                    const data = await response.json();
                    setTailorResult(data);
                  } catch (err: any) {
                    setErrorMsg(err.message || "Failed to process content generation.");
                  } finally {
                    setTailorLoading(false);
                  }
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  !selectedResumeId 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10"
                }`}
              >
                {tailorLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={13} /> Generating Material...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} /> Run AI Optimization
                  </>
                )}
              </button>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-8 bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-5 minimum-h-[350px]">
              {tailorResult ? (
                <div className="space-y-5 animate-fade-in text-left">
                  
                  {/* Top quick stats widgets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated ATS Score</p>
                        <h4 className="text-lg font-black font-mono text-indigo-700 mt-1">
                          {tailorResult.metrics?.atsScoreEstimate || 90}%
                        </h4>
                      </div>
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                        ✓
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Copy Readability Rating</p>
                        <h4 className="text-lg font-black font-mono text-emerald-700 mt-1">
                          {tailorResult.metrics?.readability || "Exceptional"}
                        </h4>
                      </div>
                      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                        A+
                      </div>
                    </div>
                  </div>

                  {/* Outcome generated textbox */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-inner">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                        📋 Generated Optimized Assets
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(tailorResult.content);
                          alert("Copying materials to system clipboard successful!");
                        }}
                        className="px-2.5 py-1 hover:bg-slate-50 text-[10px] border border-slate-200 text-slate-500 hover:text-slate-700 font-bold rounded transition"
                      >
                        Copy Assets
                      </button>
                    </div>
                    
                    <div className="whitespace-pre-wrap text-xs text-slate-600 leading-relaxed font-sans max-h-[380px] overflow-y-auto pr-2">
                      {tailorResult.content}
                    </div>
                  </div>

                  {/* Specific checklists next items */}
                  {tailorResult.actionItems && tailorResult.actionItems.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        🎯 Smart Next-Step Action Items:
                      </h4>
                      <ul className="space-y-2">
                        {tailorResult.actionItems.map((item: string, i: number) => (
                          <li key={i} className="flex gap-2 text-xs text-slate-600 font-medium">
                            <span className="text-emerald-500 shrink-0">✔</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              ) : (
                <div className="h-full py-20 text-center text-slate-400 text-xs italic flex flex-col items-center justify-center space-y-2">
                  <span>No tailored outcomes available yet.</span>
                  <span>Select a document reference in the left sidebar directory, pick your optimization target, and hit "Run AI Optimization".</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
