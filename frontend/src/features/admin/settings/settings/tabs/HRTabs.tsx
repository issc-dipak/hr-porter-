"use client";

import React from 'react';
import { 
  Trash2, X, Briefcase, Users, Clock, Calendar, Target, 
  Bell, Plus, ShieldAlert, Award, FileText, CheckCircle, HelpCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface HRTabsProps {
  activeCategory: string;
  hiringWorkflow: string;
  setHiringWorkflow: (val: string) => void;
  interviewSetup: string;
  setInterviewSetup: (val: string) => void;
  onboardingDocs: Array<{ id: number; docName: string; mandatory: boolean }>;
  setOnboardingDocs: React.Dispatch<React.SetStateAction<any[]>>;
  newOnboardingDoc: string;
  setNewOnboardingDoc: (val: string) => void;
  employeeCategories: string[];
  setEmployeeCategories: React.Dispatch<React.SetStateAction<string[]>>;
  newCategory: string;
  setNewCategory: (val: string) => void;
  attendanceMonitoringActive: boolean;
  setAttendanceMonitoringActive: (val: boolean) => void;
  shiftRosterRule: string;
  setShiftRosterRule: (val: string) => void;
  leaveConfig: {
    approvalFlow: string;
  };
  kpiWeightage: {
    kpiScore: number;
    peerScore: number;
    managerScore: number;
    cycleType: string;
  };
  setKpiWeightage: React.Dispatch<React.SetStateAction<any>>;
  notificationConfig: {
    hrAlerts: boolean;
    employeeReminders: boolean;
  };
  setNotificationConfig: React.Dispatch<React.SetStateAction<any>>;
  triggerToast: (msg: string) => void;
  chatConfig: {
    workspaceName: string;
    workspaceLogo: string;
    allowEmployeeChannelCreate: boolean;
    allowEmployeeChannelPrivateCreate: boolean;
    allowAnnouncementsPostAll: boolean;
    allowEmployeeEditDelete: boolean;
    restrictedKeywords: string;
  };
  setChatConfig: React.Dispatch<React.SetStateAction<any>>;
}

export function HRTabs({
  activeCategory,
  hiringWorkflow,
  setHiringWorkflow,
  interviewSetup,
  setInterviewSetup,
  onboardingDocs,
  setOnboardingDocs,
  newOnboardingDoc,
  setNewOnboardingDoc,
  employeeCategories,
  setEmployeeCategories,
  newCategory,
  setNewCategory,
  attendanceMonitoringActive,
  setAttendanceMonitoringActive,
  shiftRosterRule,
  setShiftRosterRule,
  leaveConfig,
  kpiWeightage,
  setKpiWeightage,
  notificationConfig,
  setNotificationConfig,
  triggerToast,
  chatConfig,
  setChatConfig
}: HRTabsProps) {
  
  // Calculate total weightage for Performance scoring
  const totalWeight = (kpiWeightage.kpiScore || 0) + (kpiWeightage.peerScore || 0) + (kpiWeightage.managerScore || 0);

  return (
    <div className="space-y-6">
      
      {/* 1. RECRUITMENT SETUP */}
      {activeCategory === 'hr-recruitment' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-500" />
              Recruitment & Interview Parameters
            </h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Configure pipelines, screening phases, and automated panel coordination criteria.</p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="saas-card bg-slate-50/50 dark:bg-slate-950/20 p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Hiring Pipeline Workflow Rules</label>
                <input 
                  type="text" 
                  value={hiringWorkflow}
                  onChange={e => setHiringWorkflow(e.target.value)}
                  className="saas-input w-full px-3 py-2 text-xs"
                  placeholder="e.g. CV Screening -> Technical -> HR Round"
                />
                <p className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">Defines the default sequence of interview stages for corporate job postings.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Panel Interview Scheduling Protocols</label>
                <input 
                  type="text" 
                  value={interviewSetup}
                  onChange={e => setInterviewSetup(e.target.value)}
                  className="saas-input w-full px-3 py-2 text-xs"
                  placeholder="e.g. Multi-stage rounds with calendar blockout triggers"
                />
                <p className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">Define variables for automated video meetings integration setup.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ONBOARDING & LIFECYCLE */}
      {activeCategory === 'hr-onboarding' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Onboarding Checklist & Categories
            </h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Manage mandatory candidate verification documents and configure employment categories.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Checklist Vault */}
            <div className="saas-card bg-slate-50/50 dark:bg-slate-950/20 p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-900 pb-2">
                Mandatory Onboarding Document Checklist
              </span>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {onboardingDocs.map(doc => (
                  <div key={doc.id} className="p-3 bg-white dark:bg-slate-900 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-850">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      {doc.docName}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setOnboardingDocs(onboardingDocs.filter(d => d.id !== doc.id))}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input 
                  type="text" 
                  placeholder="e.g. Relieving Certificate..."
                  value={newOnboardingDoc}
                  onChange={e => setNewOnboardingDoc(e.target.value)}
                  className="saas-input w-full px-3 py-1.5 text-xs"
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (!newOnboardingDoc.trim()) return;
                    setOnboardingDocs([...onboardingDocs, { id: Date.now(), docName: newOnboardingDoc.trim(), mandatory: true }]);
                    setNewOnboardingDoc('');
                    triggerToast('Onboarding document check added');
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>

            {/* Employment Categories */}
            <div className="saas-card bg-slate-50/50 dark:bg-slate-950/20 p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-900 pb-2">
                Corporate Employment Categories
              </span>
              
              <div className="flex flex-wrap gap-2 max-h-[220px] overflow-y-auto py-1">
                {employeeCategories.map(cat => (
                  <span key={cat} className="px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-100 dark:border-slate-850">
                    {cat}
                    <button 
                      type="button"
                      onClick={() => setEmployeeCategories(employeeCategories.filter(c => c !== cat))}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input 
                  type="text" 
                  placeholder="e.g. Apprentice..."
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="saas-input w-full px-3 py-1.5 text-xs"
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (!newCategory.trim()) return;
                    if (employeeCategories.includes(newCategory.trim())) return;
                    setEmployeeCategories([...employeeCategories, newCategory.trim()]);
                    setNewCategory('');
                    triggerToast('Category added to configuration');
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. ATTENDANCE Timings */}
      {activeCategory === 'hr-attendance' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              HR Attendance Timings & Shifts
            </h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Monitor shift timers, enforce active logging controls, and setup penalty parameters.</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/60">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-800 dark:text-white">Active Shift Monitoring Logs</span>
                <p className="text-[8.5px] text-slate-450 uppercase mt-0.5">Enables tracking reminders and alerts to HR panel if login thresholds are ignored.</p>
              </div>
              <button
                type="button"
                onClick={() => setAttendanceMonitoringActive(!attendanceMonitoringActive)}
                className={cn(
                  "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                  attendanceMonitoringActive ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
                )}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            <div className="saas-card bg-slate-50/50 dark:bg-slate-950/20 p-5 border border-slate-100 dark:border-slate-800/60 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Shift Roster Allocation Rule</label>
              <input 
                type="text" 
                value={shiftRosterRule}
                onChange={e => setShiftRosterRule(e.target.value)}
                className="saas-input w-full px-3 py-2 text-xs"
                placeholder="e.g. Standard monthly rotation rules"
              />
              <p className="text-[8px] text-slate-400 dark:text-slate-500 font-medium">Automatic system logic to rotate and allot shift timetables for teams.</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. LEAVE RULES */}
      {activeCategory === 'hr-leaves' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              HR Leave Workflows & Allocations
            </h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Observe leave parameters and approval logic across teams.</p>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-900/10 to-indigo-900/5 border border-blue-500/10 rounded-2xl space-y-3">
            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 block tracking-wider">Active Leave Approval Flowchart</span>
            <p className="text-[10px] leading-relaxed uppercase text-slate-450 font-bold">
              Currently leave requests require approvals in the order: <span className="text-blue-500 font-black">{leaveConfig.approvalFlow}</span>.
            </p>
            <div className="pt-2 flex items-center gap-2.5 text-[8.5px] font-semibold text-slate-450 uppercase">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              Approval chain sequencing can be fully customized from the Super Admin Panel settings.
            </div>
          </div>
        </div>
      )}

      {/* 5. PERFORMANCE SCORING */}
      {activeCategory === 'hr-performance' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              HR Performance weightage & Cycles
            </h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Configure KPIs, Peer feedbacks, and Manager score ratios for quarterly appraisal metrics.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Weight inputs */}
            <div className="lg:col-span-2 saas-card bg-slate-50/50 dark:bg-slate-950/20 p-5 border border-slate-100 dark:border-slate-800/60 space-y-4">
              <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block border-b border-slate-100 dark:border-slate-900 pb-2">
                Score Weight Distribution
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">KPI Targets weight (%)</label>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    value={kpiWeightage.kpiScore}
                    onChange={e => setKpiWeightage({ ...kpiWeightage, kpiScore: parseInt(e.target.value) || 0 })}
                    className="saas-input w-full px-3 py-2 font-mono text-xs text-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Peer feedback weight (%)</label>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    value={kpiWeightage.peerScore}
                    onChange={e => setKpiWeightage({ ...kpiWeightage, peerScore: parseInt(e.target.value) || 0 })}
                    className="saas-input w-full px-3 py-2 font-mono text-xs text-center"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Manager scores weight (%)</label>
                  <input 
                    type="number" 
                    min={0}
                    max={100}
                    value={kpiWeightage.managerScore}
                    onChange={e => setKpiWeightage({ ...kpiWeightage, managerScore: parseInt(e.target.value) || 0 })}
                    className="saas-input w-full px-3 py-2 font-mono text-xs text-center"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Appraisal Cycle Frequency</label>
                <select
                  value={kpiWeightage.cycleType}
                  onChange={e => setKpiWeightage({ ...kpiWeightage, cycleType: e.target.value })}
                  className="saas-input w-full px-3 py-2.5 cursor-pointer font-bold text-xs"
                >
                  <option>Quarterly</option>
                  <option>Semi-Annually</option>
                  <option>Annually</option>
                </select>
              </div>
            </div>

            {/* Visual breakdown progress bars */}
            <div className="lg:col-span-1 saas-card bg-slate-50/50 dark:bg-slate-950/20 p-5 border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">Weight Distribution Ratio</span>
                <p className="text-[8px] text-slate-400 uppercase mt-0.5">Sum total must equal 100%.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                    <span>KPI Targets</span>
                    <span className="font-mono text-slate-700 dark:text-slate-350">{kpiWeightage.kpiScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, kpiWeightage.kpiScore)}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                    <span>Peer Feedback</span>
                    <span className="font-mono text-slate-700 dark:text-slate-350">{kpiWeightage.peerScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, kpiWeightage.peerScore)}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                    <span>Manager Review</span>
                    <span className="font-mono text-slate-700 dark:text-slate-350">{kpiWeightage.managerScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, kpiWeightage.managerScore)}%` }} />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-900 text-center">
                <span className={cn(
                  "inline-block px-3 py-1 rounded-full text-[9px] font-bold border",
                  totalWeight === 100 
                    ? "bg-green-500/10 text-green-600 border-green-500/20" 
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                )}>
                  Total Weight: {totalWeight}% {totalWeight === 100 ? "✓ Balanced" : "⚠ Must equal 100%"}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 6. HR NOTIFICATION ALERTS */}
      {activeCategory === 'hr-notifications' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-500" />
              HR Notification Alerts
            </h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Configure active dispatch triggers and missing records notifications thresholds.</p>
          </div>

          <div className="space-y-4">
            {[
              { id: 'hrAlerts', title: 'Onboarding progress alert triggers', desc: 'Notify HR panels instantly when mandatory onboarding documents remain incomplete.' },
              { id: 'employeeReminders', title: 'Automated review reminders dispatch', desc: 'Send automated email/push reminders to team members to submit pending self-reviews.' }
            ].map(alert => (
              <div key={alert.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-white block">{alert.title}</span>
                  <p className="text-[8.5px] text-slate-450 uppercase mt-0.5">{alert.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationConfig({ ...notificationConfig, [alert.id]: !notificationConfig[alert.id as keyof typeof notificationConfig] })}
                  className={cn(
                    "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                    notificationConfig[alert.id as keyof typeof notificationConfig] ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
                  )}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workplace Chat Setup */}
      {activeCategory === 'hr-chat' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              Workplace Chat Setup
            </h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Configure Slack-style company workspace branding and message controls.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Workspace Chat Name */}
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Workplace Chat Name</label>
              <input 
                type="text" 
                value={chatConfig.workspaceName}
                onChange={e => setChatConfig({ ...chatConfig, workspaceName: e.target.value })}
                className="saas-input w-full px-3 py-2 text-xs"
              />
              <p className="text-[8px] text-slate-400 uppercase font-medium">Custom branding name displayed inside the chat sidebar header.</p>
            </div>

            {/* Workspace Chat Logo URL */}
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Workplace Chat Logo URL</label>
              <input 
                type="text" 
                value={chatConfig.workspaceLogo}
                placeholder="https://example.com/logo.png"
                onChange={e => setChatConfig({ ...chatConfig, workspaceLogo: e.target.value })}
                className="saas-input w-full px-3 py-2 text-xs"
              />
              <p className="text-[8px] text-slate-400 uppercase font-medium">Optional logo url displayed in the chat panels headers.</p>
            </div>

            {/* Restricted keywords */}
            <div className="space-y-2 col-span-1 md:col-span-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Restricted Keywords (Comma Separated)</label>
              <input 
                type="text" 
                value={chatConfig.restrictedKeywords}
                onChange={e => setChatConfig({ ...chatConfig, restrictedKeywords: e.target.value })}
                className="saas-input w-full px-3 py-2 text-xs"
              />
              <p className="text-[8px] text-slate-400 uppercase font-medium">Define words to restrict. These will trigger filters or logs when posted.</p>
            </div>

            {/* Switches */}
            {[
              { id: 'allowEmployeeChannelCreate', title: 'Allow Employees to Create Public Channels', desc: 'Allows regular employees to launch public discussion groups.' },
              { id: 'allowEmployeeChannelPrivateCreate', title: 'Allow Employees to Create Private Channels', desc: 'Allows regular employees to launch lock-restricted rooms.' },
              { id: 'allowAnnouncementsPostAll', title: 'Allow Everyone to Post in #announcements', desc: 'If disabled, only Admin and HR roles can broadcast to announcements channel.' },
              { id: 'allowEmployeeEditDelete', title: 'Allow Employees to Edit or Delete Sent Messages', desc: 'If disabled, employees cannot edit or recall sent messages.' }
            ].map(rule => (
              <div key={rule.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/60 col-span-1 md:col-span-2 text-left">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-800 dark:text-white block">{rule.title}</span>
                  <p className="text-[8.5px] text-slate-450 uppercase mt-0.5">{rule.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setChatConfig({ ...chatConfig, [rule.id]: !chatConfig[rule.id as keyof typeof chatConfig] })}
                  className={cn(
                    "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                    chatConfig[rule.id as keyof typeof chatConfig] ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
                  )}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            ))}

          </div>
        </div>
      )}
    </div>
  );
}
