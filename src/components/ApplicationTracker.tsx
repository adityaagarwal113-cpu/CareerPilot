/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Layers, Plus, Briefcase, MapPin, DollarSign, Calendar, ChevronRight, 
  ChevronLeft, Trash2, Edit3, ArrowRight, TrendingUp, Sliders, Calculator, 
  CheckCircle, HelpCircle, Save, Star, Search, Filter, ShieldCheck, Heart
} from "lucide-react";

interface ApplicationTrackerProps {
  userRole?: string;
  onAddXp: (xp: number) => void;
  onBackToDashboard?: () => void;
}

interface JobCard {
  id: string;
  company: string;
  role: string;
  salary: number;
  location: string;
  dateApplied: string;
  notes: string;
  status: "Bookmarked" | "Applied" | "Interviewing" | "Offer Secured" | "Archived";
  equity?: number;
  bonus?: number;
}

export default function ApplicationTracker({ userRole, onAddXp, onBackToDashboard }: ApplicationTrackerProps) {
  const [activeView, setActiveView] = useState<"kanban" | "comparator">("kanban");
  
  // Kanban Pipeline state
  const [jobs, setJobs] = useState<JobCard[]>([
    {
      id: "j-1",
      company: "Google",
      role: "AI Developer / SWE III",
      salary: 165000,
      equity: 120000, // over 4 yrs (30k/yr)
      bonus: 25000,
      location: "Mountain View, CA (Hybrid)",
      dateApplied: "2026-06-15",
      notes: "ATS score match optimized at 94%. Recruiter initial screening call completed. Prepping for technical systems round.",
      status: "Interviewing"
    },
    {
      id: "j-2",
      company: "Stripe",
      role: "Staff Full-Stack Architect",
      salary: 190000,
      equity: 160000,
      bonus: 30000,
      location: "San Francisco, CA (In-Office)",
      dateApplied: "2026-06-18",
      notes: "Tailored resume to highlight merchant ledger architecture and concurrency improvements. Applied through referral.",
      status: "Applied"
    },
    {
      id: "j-3",
      company: "Morgan Stanley",
      role: "Senior Quantitative Associate",
      salary: 175000,
      equity: 40000,
      bonus: 50000,
      location: "New York, NY (In-Office)",
      dateApplied: "2026-06-20",
      notes: "Mathematical testing completed. High emphasis on option valuation matrices, multi-core threading, and Bayes' theorem.",
      status: "Offer Secured"
    },
    {
      id: "j-4",
      company: "McKinsey & Co",
      role: "Associate Strategy Consultant",
      salary: 160000,
      equity: 0,
      bonus: 40000,
      location: "Chicago, IL",
      dateApplied: "2026-06-10",
      notes: "Researching profitability case trees. Bookmarked standard case frameworks inside our Mentor Question Bank.",
      status: "Bookmarked"
    }
  ]);

  // Form states for adding a new Job Application
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState(userRole || "");
  const [newSalary, setNewSalary] = useState("120000");
  const [newEquity, setNewEquity] = useState("0");
  const [newBonus, setNewBonus] = useState("0");
  const [newLocation, setNewLocation] = useState("Remote");
  const [newNotes, setNewNotes] = useState("");
  const [newStatus, setNewStatus] = useState<JobCard["status"]>("Bookmarked");

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("career_os_jobs");
    if (saved) {
      try {
        setJobs(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveJobsToStorage = (updatedList: JobCard[]) => {
    setJobs(updatedList);
    localStorage.setItem("career_os_jobs", JSON.stringify(updatedList));
  };

  const handleAddJobCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    const newJob: JobCard = {
      id: `j-${Date.now()}`,
      company: newCompany,
      role: newRole,
      salary: Number(newSalary) || 0,
      equity: Number(newEquity) || 0,
      bonus: Number(newBonus) || 0,
      location: newLocation,
      dateApplied: new Date().toISOString().split("T")[0],
      notes: newNotes,
      status: newStatus
    };

    const updated = [newJob, ...jobs];
    saveJobsToStorage(updated);
    onAddXp(40); // Reward 40 XP for tracking applications!
    
    // Reset form states
    setNewCompany("");
    setNewRole("");
    setNewSalary("120000");
    setNewEquity("0");
    setNewBonus("0");
    setNewLocation("Remote");
    setNewNotes("");
    setShowAddForm(false);
  };

  const handleDeleteJobCard = (id: string) => {
    const updated = jobs.filter(j => j.id !== id);
    saveJobsToStorage(updated);
  };

  const handleMoveJobStatus = (id: string, dir: "left" | "right") => {
    const statuses: JobCard["status"][] = ["Bookmarked", "Applied", "Interviewing", "Offer Secured", "Archived"];
    const updated = jobs.map(j => {
      if (j.id === id) {
        const idx = statuses.indexOf(j.status);
        let newIdx = idx;
        if (dir === "left" && idx > 0) newIdx = idx - 1;
        if (dir === "right" && idx < statuses.length - 1) newIdx = idx + 1;
        
        // Give bonus XP if offer is secured!
        if (statuses[newIdx] === "Offer Secured" && j.status !== "Offer Secured") {
          onAddXp(100);
        }
        
        return { ...j, status: statuses[newIdx] };
      }
      return j;
    });
    saveJobsToStorage(updated);
  };

  // OFFER COMPARATOR EVALUATION CALCULATIONS
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const toggleOfferSelection = (id: string) => {
    setSelectedOffers(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getComparedJobs = () => jobs.filter(j => selectedOffers.includes(j.id));

  // Visual helper for salary progress bars
  const maxCompValue = Math.max(...jobs.map(j => (j.salary || 0) + ((j.equity || 0) / 4) + (j.bonus || 0)), 200000);

  return (
    <div className="space-y-6" id="job-tracking-suite">
      
      {/* HEADER CONTROLS BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 border border-slate-200/80 rounded-2xl shadow-sm text-left">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition mr-1"
              title="Back to Dashboard"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold uppercase px-2 py-0.5 rounded border border-emerald-100">
                MODULE 16: PIPELINES & OFFER COMP
              </span>
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            </div>
            <h2 className="font-display font-black text-slate-800 text-base mt-1">Application Pipeline & Package Evaluator</h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Manage target roles, schedule interviews, and run mathematical package comparisons on saved offers.</p>
          </div>
        </div>

        {/* View togglers */}
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto select-none">
          <button
            onClick={() => setActiveView("kanban")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === "kanban" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Layers size={13} /> Kanban Board
          </button>
          <button
            onClick={() => setActiveView("comparator")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeView === "comparator" 
                ? "bg-white text-slate-800 shadow-sm" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Calculator size={13} /> Offer Comparator
          </button>
        </div>
      </div>

      {/* RENDER KANBAN PIPELINE BOARD */}
      {activeView === "kanban" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Action Trigger Row */}
          <div className="flex justify-between items-center bg-white px-5 py-3.5 border border-slate-200/80 rounded-2xl shadow-sm">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              🚀 Candidate Pipeline Tracker
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Job Application
            </button>
          </div>

          {/* ADD JOB APPLICATION FORM DRAWER/CARD */}
          {showAddForm && (
            <form onSubmit={handleAddJobCard} className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-md text-left space-y-4 max-w-2xl mx-auto animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black text-slate-800 uppercase">New Application Parameters</h4>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OpenAI"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-slate-700"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior AI Research Engineer"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Base Salary ($)</label>
                  <input
                    type="number"
                    placeholder="120000"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Equity Grant ($)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newEquity}
                    onChange={(e) => setNewEquity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Sign-on Bonus ($)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newBonus}
                    onChange={(e) => setNewBonus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Office Location</label>
                  <input
                    type="text"
                    placeholder="SF, NYC, or Remote"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 font-semibold text-slate-500 text-xs">
                  <label className="text-[11px] font-bold">Initial Column Pipeline Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-bold"
                  >
                    <option value="Bookmarked">Bookmarked</option>
                    <option value="Applied">Applied (Resume Tailored)</option>
                    <option value="Interviewing">Active Interviewing</option>
                    <option value="Offer Secured">Offer Secured 🎉</option>
                    <option value="Archived">Archived / Declined</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500">Core Strategy Notes / Deadlines</label>
                  <input
                    type="text"
                    placeholder="e.g. Recruiter connection on LinkedIn, tailored cover letter sent"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-500 rounded-xl px-3.5 py-2 text-xs text-slate-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Save size={13} /> Save Job Application Card
              </button>
            </form>
          )}

          {/* THE KANBAN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch overflow-x-auto pb-4 select-none" id="kanban-columns-scroller">
            
            {/* COLUMN BUILDER */}
            {(["Bookmarked", "Applied", "Interviewing", "Offer Secured", "Archived"] as JobCard["status"][]).map(column => {
              const columnJobs = jobs.filter(j => j.status === column);
              
              let columnHeaderStyle = "bg-slate-100 text-slate-700 border-slate-200";
              if (column === "Interviewing") columnHeaderStyle = "bg-amber-50 text-amber-800 border-amber-200/50";
              if (column === "Offer Secured") columnHeaderStyle = "bg-emerald-50 text-emerald-800 border-emerald-200/50";

              return (
                <div key={column} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col space-y-3 min-h-[460px] w-full md:min-w-[210px]">
                  {/* Column Title */}
                  <div className={`px-3 py-1.5 rounded-xl border flex justify-between items-center font-bold text-[10px] ${columnHeaderStyle}`}>
                    <span className="uppercase tracking-tight">{column}</span>
                    <span className="font-mono bg-white/60 px-1.5 rounded">{columnJobs.length}</span>
                  </div>

                  {/* Column applications lists */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto pr-0.5">
                    {columnJobs.map(job => (
                      <div key={job.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 shadow-sm space-y-2.5 text-left transition hover:shadow-md">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-[11px] font-black text-slate-800 truncate pr-1" title={job.company}>
                              {job.company}
                            </h4>
                            <button
                              type="button"
                              onClick={() => handleDeleteJobCard(job.id)}
                              className="text-slate-300 hover:text-rose-600 transition p-0.5"
                              title="Delete Application"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 font-semibold truncate" title={job.role}>
                            💼 {job.role}
                          </p>
                        </div>

                        {/* Money & Geography */}
                        <div className="space-y-1 text-[10px] text-slate-400 font-semibold">
                          <div className="flex items-center gap-1">
                            <MapPin size={10} className="text-slate-300 shrink-0" />
                            <span className="truncate" title={job.location}>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-slate-600 font-bold">
                            <DollarSign size={10} className="text-emerald-500 shrink-0" />
                            <span>{(job.salary / 1000).toFixed(0)}k Base</span>
                            {job.bonus ? <span className="text-slate-400"> | +{(job.bonus / 1000).toFixed(0)}k Bonus</span> : null}
                          </div>
                        </div>

                        {/* Strategy Notes */}
                        {job.notes && (
                          <p className="text-[9px] text-slate-400 leading-normal line-clamp-2 border-t border-slate-50 pt-1.5 font-medium italic">
                            "{job.notes}"
                          </p>
                        )}

                        {/* Drag Column pipeline controllers */}
                        <div className="flex justify-between items-center border-t border-slate-50 pt-2 text-[9px] font-extrabold text-slate-400 select-none">
                          <button
                            type="button"
                            onClick={() => handleMoveJobStatus(job.id, "left")}
                            className="p-1 hover:bg-slate-50 hover:text-slate-700 rounded transition flex items-center gap-0.5 cursor-pointer"
                          >
                            <ChevronLeft size={10} /> Prev
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveJobStatus(job.id, "right")}
                            className="p-1 hover:bg-slate-50 hover:text-slate-700 rounded transition flex items-center gap-0.5 cursor-pointer"
                          >
                            Next <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {columnJobs.length === 0 && (
                      <div className="h-28 flex items-center justify-center border border-dashed border-slate-200 rounded-xl text-[10px] text-slate-400 font-semibold italic text-center p-3 select-none">
                        No applications in this phase.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* RENDER OFFER COMPARATOR EVALUATION PANEL */}
      {activeView === "comparator" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 text-left space-y-6 shadow-sm animate-fade-in" id="offer-comparator-panel">
          
          <div className="space-y-1.5 border-b border-slate-100 pb-4">
            <h3 className="font-display font-black text-slate-800 text-sm flex items-center gap-1.5">
              <Calculator size={15} className="text-indigo-600" /> Package Comparator Calculator
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold">
              Select job tracks to calculate four-year compound liquid values (Base Salary + 4-year RSUs + Cash Sign-on Bonuses) for strategic comparison.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Offer check list selection */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Select packages to compare:</h4>
              <div className="space-y-2">
                {jobs.map(job => {
                  const isChecked = selectedOffers.includes(job.id);
                  const annualValue = job.salary + ((job.equity || 0) / 4) + (job.bonus || 0);

                  return (
                    <button
                      key={job.id}
                      onClick={() => toggleOfferSelection(job.id)}
                      className={`w-full p-3.5 border rounded-2xl text-left transition flex items-start gap-3.5 cursor-pointer ${
                        isChecked 
                          ? "bg-indigo-50 border-indigo-200" 
                          : "bg-white hover:bg-slate-50 border-slate-200/80"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full border text-[9px] flex items-center justify-center shrink-0 mt-0.5 transition ${
                        isChecked ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300"
                      }`}>
                        {isChecked && "✓"}
                      </span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h5 className="text-xs font-black text-slate-800 truncate">{job.company}</h5>
                        <p className="text-[10px] text-slate-500 font-semibold truncate">{job.role}</p>
                        <span className="text-[9px] font-mono font-bold text-indigo-700 block">
                          Annualized: ${(annualValue / 1000).toFixed(0)}k/yr
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual breakdown & charts calculation comparison */}
            <div className="lg:col-span-8 bg-slate-50/50 border border-slate-200/60 rounded-2xl p-5 space-y-5">
              <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Compound Annual Cash Flow Breakdown:</h4>
              
              {selectedOffers.length > 0 ? (
                <div className="space-y-6">
                  {getComparedJobs().map(job => {
                    const annualBase = job.salary;
                    const annualEquity = (job.equity || 0) / 4;
                    const annualBonus = job.bonus || 0;
                    const grandTotal = annualBase + annualEquity + annualBonus;
                    const percentageOfMax = Math.min(Math.round((grandTotal / maxCompValue) * 100), 100);

                    return (
                      <div key={job.id} className="space-y-2 text-xs font-semibold">
                        <div className="flex justify-between items-baseline flex-wrap">
                          <h5 className="font-black text-slate-800">{job.company} <span className="text-slate-400 font-normal">({job.role})</span></h5>
                          <span className="font-mono font-black text-indigo-700 text-xs">${(grandTotal).toLocaleString()} / yr</span>
                        </div>

                        {/* Bar chart stacks */}
                        <div className="w-full bg-slate-200 h-6 rounded-lg overflow-hidden flex shadow-inner border border-slate-300/30">
                          {/* Base */}
                          <div 
                            className="bg-emerald-500 h-full flex items-center justify-center text-[8px] font-bold text-white transition-all truncate" 
                            style={{ width: `${(annualBase / grandTotal) * percentageOfMax}%` }}
                            title={`Base: $${annualBase.toLocaleString()}`}
                          >
                            Base
                          </div>
                          {/* Equity */}
                          {annualEquity > 0 && (
                            <div 
                              className="bg-sky-500 h-full flex items-center justify-center text-[8px] font-bold text-white transition-all truncate" 
                              style={{ width: `${(annualEquity / grandTotal) * percentageOfMax}%` }}
                              title={`Equity: $${annualEquity.toLocaleString()}`}
                            >
                              Equity
                            </div>
                          )}
                          {/* Bonus */}
                          {annualBonus > 0 && (
                            <div 
                              className="bg-amber-500 h-full flex items-center justify-center text-[8px] font-bold text-white transition-all truncate" 
                              style={{ width: `${(annualBonus / grandTotal) * percentageOfMax}%` }}
                              title={`Bonus: $${annualBonus.toLocaleString()}`}
                            >
                              Bonus
                            </div>
                          )}
                        </div>

                        {/* Legends and detailed matrix totals */}
                        <div className="grid grid-cols-3 gap-2 text-[9px] font-bold text-slate-400 font-mono">
                          <div>🟢 Base Salary: ${annualBase.toLocaleString()}</div>
                          <div>🔵 Annual Equity: ${annualEquity.toLocaleString()}</div>
                          <div>🟡 Annualized Bonus: ${annualBonus.toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Recruiter Strategy negotiations assistance */}
                  <div className="p-4 bg-indigo-50 border border-indigo-100/50 rounded-xl flex gap-3 text-xs leading-relaxed text-slate-600">
                    <TrendingUp className="text-indigo-600 shrink-0 mt-0.5 animate-pulse" size={16} />
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800">Recruitment Negotiation Analytics:</p>
                      <p>
                        When comparing packages, notice the liquidity: Stripe has higher base cash whereas MS offers substantial upfront performance bonuses. Use Stripe's higher base package offer to negotiate Google's sign-on cash metrics or raise MS's base allocation by 10%.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-14 text-center text-slate-400 italic text-xs space-y-2 flex flex-col items-center">
                  <span>No offers checked. Select job application tracks in the left sidebar directory to evaluate compound cash weights.</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
