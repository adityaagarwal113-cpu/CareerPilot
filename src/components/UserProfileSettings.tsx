/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User, Shield, Compass, Settings, Check, RefreshCw, LogOut, Trash2, 
  MapPin, DollarSign, Briefcase, Building, Bell, Volume2, Globe, Sparkles,
  Award, Trophy, Lock, Zap, Flame, Calendar
} from "lucide-react";
import { CareerPreferences, UserSettings, SavedCompany, SavedJobRole } from "../types";

interface UserProfileSettingsProps {
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  userRole: string;
  setUserRole: (role: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  storedPassword: string;
  setStoredPassword: (pass: string) => void;
  careerPrefs: CareerPreferences;
  setCareerPrefs: React.Dispatch<React.SetStateAction<CareerPreferences>>;
  userSettings: UserSettings;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  savedCompanies: SavedCompany[];
  setSavedCompanies: React.Dispatch<React.SetStateAction<SavedCompany[]>>;
  savedJobRoles: SavedJobRole[];
  setSavedJobRoles: React.Dispatch<React.SetStateAction<SavedJobRole[]>>;
  isSyncing: boolean;
  lastSyncedTime: string;
  handleCloudSync: () => Promise<void>;
  showLogoutConfirm: boolean;
  setShowLogoutConfirm: (val: boolean) => void;
  onStandardLogout: () => void;
  onForgetAndLogout: () => void;
  userBadges: string[];
  activeTab: "account" | "career" | "entities" | "settings" | "badges";
  setActiveTab: (tab: "account" | "career" | "entities" | "settings" | "badges") => void;
  examsCleared?: number;
  setExamsCleared?: (val: number) => void;
  paperNames?: string;
  setPaperNames?: (val: string) => void;
  actuarialBoard?: string;
  setActuarialBoard?: (val: string) => void;
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  criteria: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  colorClass: string;
  borderColorClass: string;
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "Quick Starter",
    name: "Quick Starter",
    description: "Initialize your AI Career OS workspace and establish your professional target preferences.",
    criteria: "Unlocked by default upon creating your account.",
    icon: Zap,
    colorClass: "bg-amber-500 text-white shadow-amber-500/20",
    borderColorClass: "border-amber-200"
  },
  {
    id: "Elite Performer",
    name: "Elite Performer",
    description: "Score an overall percentage of 90% or higher on an AI-simulated interview session.",
    criteria: "Complete any interview round with a score of 90% or above.",
    icon: Trophy,
    colorClass: "bg-indigo-600 text-white shadow-indigo-500/20",
    borderColorClass: "border-indigo-200"
  },
  {
    id: "Risk Specialist",
    name: "Risk Specialist",
    description: "Complete a specialized simulation analyzing capital modeling and probability.",
    criteria: "Complete an Actuarial Interview simulation.",
    icon: Compass,
    colorClass: "bg-rose-500 text-white shadow-rose-500/20",
    borderColorClass: "border-rose-200"
  },
  {
    id: "Corporate Ready",
    name: "Corporate Ready",
    description: "Successfully complete a mock interview for an active target enterprise.",
    criteria: "Specify a company name during interview setup and finish the simulation.",
    icon: Building,
    colorClass: "bg-emerald-500 text-white shadow-emerald-500/20",
    borderColorClass: "border-emerald-200"
  },
  {
    id: "Dedicated Streak",
    name: "Dedicated Streak",
    description: "Maintain continuous practice to build and strengthen your professional muscle.",
    criteria: "Build a consistent learning streak of 3 days or more on the platform.",
    icon: Flame,
    colorClass: "bg-orange-500 text-white shadow-orange-500/20",
    borderColorClass: "border-orange-200"
  }
];

export default function UserProfileSettings({
  userName, setUserName, userEmail, userRole, setUserRole, rememberMe, setRememberMe,
  storedPassword, setStoredPassword, careerPrefs, setCareerPrefs, userSettings, setUserSettings,
  savedCompanies, setSavedCompanies, savedJobRoles, setSavedJobRoles, isSyncing, lastSyncedTime,
  handleCloudSync, showLogoutConfirm, setShowLogoutConfirm, onStandardLogout, onForgetAndLogout,
  userBadges, activeTab, setActiveTab,
  examsCleared = 3, setExamsCleared,
  paperNames = "CS1, CM1, CB1", setPaperNames,
  actuarialBoard = "IAI", setActuarialBoard
}: UserProfileSettingsProps) {
  const badgeDates = React.useMemo(() => {
    try {
      const stored = localStorage.getItem("platform_badges_dates");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  }, [userBadges]);

  const [newRoleInput, setNewRoleInput] = useState("");
  const [newCompanyInput, setNewCompanyInput] = useState("");

  const handleAddRolePreference = () => {
    if (newRoleInput.trim() && !careerPrefs.targetRoles.includes(newRoleInput.trim())) {
      setCareerPrefs(prev => ({
        ...prev,
        targetRoles: [...prev.targetRoles, newRoleInput.trim()]
      }));
      setNewRoleInput("");
    }
  };

  const handleRemoveRolePreference = (role: string) => {
    setCareerPrefs(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.filter(r => r !== role)
    }));
  };

  const handleAddCompanyPreference = () => {
    if (newCompanyInput.trim() && !careerPrefs.targetCompanies.includes(newCompanyInput.trim())) {
      setCareerPrefs(prev => ({
        ...prev,
        targetCompanies: [...prev.targetCompanies, newCompanyInput.trim()]
      }));
      setNewCompanyInput("");
    }
  };

  const handleRemoveCompanyPreference = (company: string) => {
    setCareerPrefs(prev => ({
      ...prev,
      targetCompanies: prev.targetCompanies.filter(c => c !== company)
    }));
  };

  const handleDeleteSavedCompany = (id: string) => {
    setSavedCompanies(prev => prev.filter(c => c.id !== id));
  };

  const handleDeleteSavedRole = (id: string) => {
    setSavedJobRoles(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[400px]" id="user-profile-settings-hub">
      
      {/* Sidebar Navigation */}
      <div className="md:col-span-1 border-r border-slate-100 pr-4 flex flex-col gap-1.5">
        {[
          { id: "account", label: "Account & Access", icon: User },
          { id: "career", label: "Career Goals", icon: Compass },
          { id: "entities", label: "Saved Roles/Firms", icon: Building },
          { id: "badges", label: "Badges Gallery", icon: Award },
          { id: "settings", label: "Preferences & Sync", icon: Settings }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? "bg-slate-900 text-white" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="mt-auto pt-6 border-t border-slate-100 space-y-2">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Control</div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-2 px-3 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>

      {/* Main Form Fields Panel */}
      <div className="md:col-span-3 flex flex-col justify-between">
        
        {/* RENDER ACCOUNT TAB */}
        {activeTab === "account" && (
          <div className="space-y-4 text-xs text-left" id="account-access-settings">
            <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Access & Security Settings</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Candidate Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    localStorage.setItem("current_user_name", e.target.value);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Corporate Email</label>
                <input
                  type="text"
                  value={userEmail}
                  disabled
                  className="w-full p-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Primary Career Role Title</label>
                <input
                  type="text"
                  value={userRole}
                  onChange={(e) => {
                    setUserRole(e.target.value);
                    localStorage.setItem("current_user_role", e.target.value);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Reset Access Password</label>
                <input
                  type="password"
                  value={storedPassword}
                  onChange={(e) => {
                    setStoredPassword(e.target.value);
                    localStorage.setItem("platform_user_password", e.target.value);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Remember Credentials Toggles */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="profileRememberMe"
                  checked={rememberMe}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setRememberMe(val);
                    if (val) {
                      localStorage.setItem("remember_me", "true");
                      localStorage.setItem("saved_email", userEmail);
                      localStorage.setItem("saved_password", storedPassword);
                    } else {
                      localStorage.removeItem("remember_me");
                      localStorage.removeItem("saved_email");
                      localStorage.removeItem("saved_password");
                    }
                  }}
                  className="rounded border-slate-300 text-brand-500 h-4 w-4"
                />
                <label htmlFor="profileRememberMe" className="text-slate-700 font-semibold cursor-pointer select-none">
                  Keep security token active in this browser
                </label>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal pl-6">
                Enabling this stores an encrypted session indicator in local storage to prevent signing out on refreshing.
              </p>
            </div>
          </div>
        )}

        {/* RENDER CAREER GOALS TAB */}
        {activeTab === "career" && (
          <div className="space-y-4 text-xs text-left" id="career-goals-settings">
            <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Target Career Preferences</h4>
            
            {/* Actuarial Credentials */}
            <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-3">
              <h5 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <Award size={14} className="text-indigo-600" />
                IAI & IFoA Credentials Setup
              </h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Actuarial Board / Affiliation</label>
                  <select
                    value={actuarialBoard}
                    onChange={(e) => {
                      setActuarialBoard?.(e.target.value);
                      localStorage.setItem("platform_actuarial_board", e.target.value);
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none"
                  >
                    <option value="IAI">Institute of Actuaries of India (IAI)</option>
                    <option value="IFoA">Institute and Faculty of Actuaries UK (IFoA)</option>
                    <option value="Both">Both (IAI & IFoA UK)</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Exams Cleared</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={examsCleared}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setExamsCleared?.(val);
                      localStorage.setItem("platform_exams_cleared", val.toString());
                    }}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Paper Codes (e.g. CS1, CM1)</label>
                  <input
                    type="text"
                    value={paperNames}
                    onChange={(e) => {
                      setPaperNames?.(e.target.value);
                      localStorage.setItem("platform_paper_names", e.target.value);
                    }}
                    placeholder="e.g. CS1, CM1, CB1"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Experience Level</label>
                <select
                  value={careerPrefs.experienceLevel}
                  onChange={(e) => setCareerPrefs(prev => ({ ...prev, experienceLevel: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:bg-white"
                >
                  <option value="Entry">Entry Level / Graduate</option>
                  <option value="Mid">Mid Level (2-5 yrs)</option>
                  <option value="Senior">Senior Professional (5-10 yrs)</option>
                  <option value="Lead/Executive">Lead / Principal / Executive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Target Industry</label>
                <input
                  type="text"
                  value={careerPrefs.industry}
                  onChange={(e) => setCareerPrefs(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g. Technology & SaaS, Management Consulting"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Expected Compensation Range</label>
                <input
                  type="text"
                  value={careerPrefs.expectedSalary}
                  onChange={(e) => setCareerPrefs(prev => ({ ...prev, expectedSalary: e.target.value }))}
                  placeholder="e.g. $140,000 - $180,000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Preferred Job Location</label>
                <input
                  type="text"
                  value={careerPrefs.preferredLocation}
                  onChange={(e) => setCareerPrefs(prev => ({ ...prev, preferredLocation: e.target.value }))}
                  placeholder="e.g. New York / Remote"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* List preferences additions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Target Roles */}
              <div className="space-y-2">
                <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Target Job Roles</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRoleInput}
                    onChange={(e) => setNewRoleInput(e.target.value)}
                    placeholder="Add e.g. Data Scientist"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddRolePreference(); }}
                  />
                  <button
                    onClick={handleAddRolePreference}
                    className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {careerPrefs.targetRoles.map(role => (
                    <span key={role} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium">
                      {role}
                      <button onClick={() => handleRemoveRolePreference(role)} className="text-[10px] text-indigo-400 hover:text-indigo-700">✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Target Companies */}
              <div className="space-y-2">
                <label className="font-bold text-slate-500 uppercase tracking-wide text-[9px]">Target Companies</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCompanyInput}
                    onChange={(e) => setNewCompanyInput(e.target.value)}
                    placeholder="Add e.g. Stripe"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddCompanyPreference(); }}
                  />
                  <button
                    onClick={handleAddCompanyPreference}
                    className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {careerPrefs.targetCompanies.map(company => (
                    <span key={company} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium">
                      {company}
                      <button onClick={() => handleRemoveCompanyPreference(company)} className="text-[10px] text-emerald-400 hover:text-emerald-700">✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RENDER SAVED LISTS */}
        {activeTab === "entities" && (
          <div className="space-y-4 text-xs text-left" id="saved-entities-settings">
            <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Saved Job Opportunities & Companies</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Saved Companies */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-600 flex items-center gap-1">
                  <Building size={12} /> Saved Companies ({savedCompanies.length})
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {savedCompanies.map(company => (
                    <div key={company.id} className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800">{company.name}</span>
                        <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-semibold ml-2 inline-block">
                          {company.industry}
                        </span>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{company.overview}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSavedCompany(company.id)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {savedCompanies.length === 0 && (
                    <div className="p-4 text-center text-slate-400 italic bg-slate-50 rounded-xl">No saved companies.</div>
                  )}
                </div>
              </div>

              {/* Saved Job Roles */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-600 flex items-center gap-1">
                  <Briefcase size={12} /> Saved Job Openings ({savedJobRoles.length})
                </h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {savedJobRoles.map(role => (
                    <div key={role.id} className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800">{role.title}</span>
                        <p className="text-[10px] text-slate-500">{role.company} • Expected {role.expectedSalary}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSavedRole(role.id)}
                        className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {savedJobRoles.length === 0 && (
                    <div className="p-4 text-center text-slate-400 italic bg-slate-50 rounded-xl">No saved roles.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* RENDER PREFERENCES & SYNC */}
        {activeTab === "settings" && (
          <div className="space-y-4 text-xs text-left" id="settings-preferences-tab">
            <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">System Preferences & Cloud Sync</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Settings checklist */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-600 uppercase tracking-wide text-[9px] flex items-center gap-1">
                  <Volume2 size={11} /> Feedback & Speech Configuration
                </h5>
                
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-700">Audio Speech Synthesis</span>
                    <p className="text-[10px] text-slate-400 leading-none">Voice output during simulated mock rounds</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userSettings.soundEnabled}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                    className="rounded border-slate-300 text-brand-500 h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-700">Dark Interface Simulation</span>
                    <p className="text-[10px] text-slate-400 leading-none">Simulate high-contrast dark panel scheme</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={userSettings.darkMode}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                    className="rounded border-slate-300 text-brand-500 h-4 w-4"
                  />
                </div>
              </div>

              {/* Notification preferences & language */}
              <div className="space-y-3">
                <h5 className="font-bold text-slate-600 uppercase tracking-wide text-[9px] flex items-center gap-1">
                  <Globe size={11} /> Regional & Alert Settings
                </h5>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold block">Primary Interface Language</label>
                  <select
                    value={userSettings.language}
                    onChange={(e) => setUserSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none"
                  >
                    <option value="English">English (United States)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Mandarin">Mandarin (中文)</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userSettings.emailNotifications}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="rounded border-slate-300 text-brand-500 h-4 w-4"
                    />
                    <span className="font-semibold text-slate-600 text-[11px]">Email alerts</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={userSettings.smsNotifications}
                      onChange={(e) => setUserSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                      className="rounded border-slate-300 text-brand-500 h-4 w-4"
                    />
                    <span className="font-semibold text-slate-600 text-[11px]">SMS alerts</span>
                  </label>
                </div>
              </div>

            </div>

            {/* PROGRESS SYNCHRONIZATION BAR */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4">
              <div className="text-left space-y-1 flex-1">
                <span className="text-[9px] bg-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded font-extrabold uppercase font-mono border border-indigo-300">
                  Cloud Synchronization Active
                </span>
                <p className="text-[11px] font-bold text-slate-700">Ensure progress and credentials are synchronized</p>
                {lastSyncedTime ? (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Last successful sync with secure repository: <strong className="text-slate-700">{lastSyncedTime}</strong>
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400">Offline changes saved locally in this session.</p>
                )}
              </div>

              <button
                onClick={handleCloudSync}
                disabled={isSyncing}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} /> Aligning files...
                  </>
                ) : (
                  <>
                    <RefreshCw size={12} /> Sync with Cloud
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* RENDER BADGES GALLERY */}
        {activeTab === "badges" && (
          <div className="space-y-4 text-xs text-left" id="badges-gallery-tab">
            <div>
              <h4 className="font-display font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Award className="text-indigo-600" size={16} /> Locked & Unlocked Professional Achievements
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                Build your professional operating profile and complete simulations to unlock exclusive badges.
              </p>
            </div>

            {/* Achievement Progress Header */}
            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1 flex-1 w-full">
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wide text-slate-500">
                  <span>Workspace Completion Progress</span>
                  <span className="text-indigo-600 font-mono text-xs">{userBadges.length} / {BADGE_DEFINITIONS.length} Badges</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-500 rounded-full" 
                    style={{ width: `${(userBadges.length / BADGE_DEFINITIONS.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-100 shadow-sm shrink-0">
                <Trophy className="text-amber-500 shrink-0" size={16} />
                <div className="text-left leading-none">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Level Standing</span>
                  <span className="text-xs font-black text-slate-800">Tier Elite Professional</span>
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-72 overflow-y-auto pr-1">
              {BADGE_DEFINITIONS.map(badge => {
                const isUnlocked = userBadges.includes(badge.id);
                const unlockDate = badgeDates[badge.id] || "Active Session";
                const BadgeIcon = badge.icon;

                return (
                  <div 
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border transition-all relative flex gap-3.5 ${
                      isUnlocked 
                        ? `bg-white ${badge.borderColorClass} shadow-md shadow-slate-100/40 border-l-4 border-l-indigo-500` 
                        : "bg-slate-50/50 border-slate-200/60 opacity-65"
                    }`}
                  >
                    {/* Badge Icon Container */}
                    <div className="relative shrink-0 flex items-center justify-center">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center relative shadow-sm ${
                        isUnlocked ? badge.colorClass : "bg-slate-200 text-slate-400"
                      }`}>
                        <BadgeIcon size={20} />
                      </div>
                      
                      {/* Locked/Unlocked status icon overlay */}
                      {!isUnlocked && (
                        <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 border border-white shadow">
                          <Lock size={8} />
                        </div>
                      )}
                    </div>

                    {/* Badge Details */}
                    <div className="space-y-1 flex-1 text-left">
                      <div className="flex justify-between items-start gap-1">
                        <span className={`font-display font-bold text-xs ${isUnlocked ? "text-slate-800" : "text-slate-500"}`}>
                          {badge.name}
                        </span>
                        {isUnlocked && (
                          <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.2 rounded font-black uppercase font-mono leading-none tracking-wide">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] leading-relaxed ${isUnlocked ? "text-slate-500" : "text-slate-400"}`}>
                        {badge.description}
                      </p>
                      
                      <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-semibold">
                            <Calendar size={10} className="text-slate-400 shrink-0" />
                            Unlocked: <strong className="font-mono text-slate-600 font-bold">{unlockDate}</strong>
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                            Challenge: {badge.criteria}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LOGOUT CONFIRMATION WRAPPER */}
        {showLogoutConfirm && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3 text-left mt-4">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Shield size={14} className="text-rose-500 shrink-0" /> Confirm Signing Out
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Would you like to preserve your saved credentials on this browser, or completely clear and forget them?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={onStandardLogout}
                className="flex-1 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold text-center transition cursor-pointer"
              >
                Standard Sign Out
              </button>
              <button
                onClick={onForgetAndLogout}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold text-center transition cursor-pointer"
              >
                Forget & Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2 px-3 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-[10px] font-bold text-center transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
