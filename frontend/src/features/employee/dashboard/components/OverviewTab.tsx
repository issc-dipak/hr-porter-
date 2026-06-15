"use client";

import React, { useState, useEffect } from 'react';
import { 
  Clock, Calendar, DollarSign, Target, Megaphone, 
  AlertCircle, ShieldAlert, Award, BookOpen, MessageSquare, 
  Send, Sparkles, Plus, Download, FileText, CheckCircle2 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { NotificationBellDropdown } from '../../../admin/dashboard/components/NotificationBellDropdown';

interface OverviewTabProps {
  profileData: any;
  isCheckedIn: boolean;
  isOnBreak: boolean;
  secondsWorked: number;
  breakSeconds: number;
  TARGET_SECONDS: number;
  formatTime: (sec: number) => string;
  toggleBreak: () => void;
  isCheckedInToggler: () => void;
  remainingLeaves: number;
  announcements: any[];
  jobs: any[];
  setActiveTab: (tab: string) => void;
  setShowLeaveModal: (show: boolean) => void;
  profile?: any;
  onOpenMessenger?: () => void;
  hoursLogged: string;
  sickLeavesAllowed: string;
  performanceRating: string;
  checkInTime?: string | null;
}

export function OverviewTab({
  profileData,
  isCheckedIn,
  isOnBreak,
  secondsWorked,
  breakSeconds,
  TARGET_SECONDS,
  formatTime,
  toggleBreak,
  isCheckedInToggler,
  remainingLeaves: initialRemainingLeaves,
  announcements: initialAnnouncements,
  jobs,
  setActiveTab,
  setShowLeaveModal,
  profile,
  onOpenMessenger,
  hoursLogged,
  sickLeavesAllowed,
  performanceRating,
  checkInTime
}: OverviewTabProps) {
  const [liveDateTime, setLiveDateTime] = useState('');
  
  // Dashboard state loaded from custom endpoint
  const [dbData, setDbData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Daily work update form state
  const [yesterdayWork, setYesterdayWork] = useState('');
  const [todayPlan, setTodayPlan] = useState('');
  const [blockers, setBlockers] = useState('');
  const [status, setStatus] = useState('In Progress');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync Date/Time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveDateTime(now.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) + ' • ' + now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch consolidated dashboard data
  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('hr_system_token');
      const res = await fetch('/api/employee/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbData(data);
      }
    } catch (err) {
      console.error("Failed to load dashboard endpoint data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [profileData.name]);

  // Handle Work Update Submission
  const handleWorkUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yesterdayWork.trim() || !todayPlan.trim()) {
      showNotice("Please fill in yesterday's accomplishments and today's plan.");
      return;
    }

    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('hr_system_token');
      const res = await fetch('/api/work-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          yesterdaysWork: yesterdayWork.trim(),
          todaysPlan: todayPlan.trim(),
          blockers: blockers.trim(),
          status: status
        })
      });

      if (res.ok) {
        showNotice("Work update submitted successfully!");
        setYesterdayWork('');
        setTodayPlan('');
        setBlockers('');
        loadDashboardData();
      } else {
        showNotice("Failed to submit work update.");
      }
    } catch (err) {
      showNotice("Error submitting work update.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Extract variables safely
  const attendanceToday = dbData?.attendance?.today;
  const leaveBalance = dbData?.leave || { casual: 8, sick: 12, earned: 10 };
  const payrollSummary = dbData?.payroll || { currentSalary: 38400, nextPayrollDate: '2026-06-30' };
  const perfData = dbData?.performance || { rating: '4.8', goalCompletion: 85 };
  const unreadAnnCount = dbData?.announcements?.unreadCount || 0;
  const eventsList = dbData?.events || [];
  const ticketsList = dbData?.tickets?.list || [];
  const growthData = dbData?.growth || { coursesCompleted: 4, certificatesEarned: 2, progress: 72 };
  const recognitionData = dbData?.recognition || { employeeOfMonth: 'raj r patil', kudosReceived: 3, badges: [] };

  return (
    <div className="space-y-6 text-left">
      {/* Toast Notice */}
      {notification && (
        <div className="fixed top-6 right-6 z-[500] px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-800">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header welcome row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Hello, <span className="text-blue-600 underline decoration-blue-200 decoration-4 underline-offset-2">{profileData.name ? profileData.name.split(' ')[0] : 'Employee'}</span> 👋
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Assigned to {profileData.department} • Live HRMS Sync Workspace
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/80 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-350 shadow-sm cursor-default">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            {liveDateTime || 'Syncing clock...'}
          </button>
          <NotificationBellDropdown onNavigate={(page) => setActiveTab(page === 'dashboard' ? 'overview' : page)} />
        </div>
      </div>
      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Attendance */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-3.5 shadow-lg shadow-blue-500/10 border-none group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-[160px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-white/85">Attendance Today</span>
              <Clock className="w-3.5 h-3.5 text-white/95" />
            </div>
            <div className="space-y-0.5 mt-2">
              <p className="text-base font-black text-white leading-tight">
                {isCheckedIn ? formatTime(secondsWorked) : 'Not Checked In'}
              </p>
              <div className="text-[8px] font-bold text-white/70 uppercase space-y-0.5 mt-1">
                <p>In: {attendanceToday?.checkIn || (checkInTime ? checkInTime : '-')}</p>
                <p>Out: {attendanceToday?.checkOut || '-'}</p>
                <p>Break: {formatTime(breakSeconds)}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={isCheckedInToggler}
            className={cn(
              "w-full py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md",
              isCheckedIn 
                ? "bg-rose-500 text-white hover:bg-rose-650" 
                : "bg-white text-blue-600 hover:bg-blue-50"
            )}
          >
            {isCheckedIn ? 'Clock Out' : 'Clock In'}
          </button>
        </div>

        {/* Leave Balance */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-3.5 shadow-lg shadow-emerald-500/10 border-none group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-[160px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-white/85">Leaves Left</span>
              <Calendar className="w-3.5 h-3.5 text-white/95" />
            </div>
            <div className="space-y-0.5 mt-2">
              <p className="text-base font-black text-white leading-tight">{initialRemainingLeaves} Days</p>
              <div className="text-[8px] font-bold text-white/70 uppercase space-y-0.5 mt-1">
                <p>Casual: 8 Allowed</p>
                <p>Sick: {sickLeavesAllowed}</p>
                <p>Earned: 10 Allowed</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('leaves')}
            className="w-full py-1.5 bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md"
          >
            Apply Leave
          </button>
        </div>

        {/* Payroll Snapshot */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-650 text-white rounded-2xl p-3.5 shadow-lg shadow-purple-500/10 border-none group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-[160px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-white/85">Net Salary</span>
              <DollarSign className="w-3.5 h-3.5 text-white/95" />
            </div>
            <div className="space-y-0.5 mt-2">
              <p className="text-base font-black text-white leading-tight">₹{payrollSummary.currentSalary.toLocaleString()}</p>
              <div className="text-[8px] font-bold text-white/70 uppercase space-y-0.5 mt-1">
                <p>Next Cycle: {payrollSummary.nextPayrollDate}</p>
                <p>Status: Processed</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('payroll')}
            className="w-full py-1.5 bg-white text-purple-600 hover:bg-purple-50 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md"
          >
            View Payslip
          </button>
        </div>

        {/* Performance Score */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl p-3.5 shadow-lg shadow-rose-500/10 border-none group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-[160px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-white/85">Performance</span>
              <Target className="w-3.5 h-3.5 text-white/95" />
            </div>
            <div className="space-y-0.5 mt-2">
              <p className="text-base font-black text-white leading-tight">{perfData.rating} Rating</p>
              <div className="text-[8px] font-bold text-white/70 uppercase space-y-0.5 mt-1">
                <p>Goal Completion: {perfData.goalCompletion}%</p>
                <p>Targets Reached: 4/5</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('performance')}
            className="w-full py-1.5 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md"
          >
            Open Reviews
          </button>
        </div>

        {/* Announcements */}
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-3.5 shadow-lg shadow-amber-500/10 border-none group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-[160px]">
          <div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-wider text-white/85">Announcements</span>
              <Megaphone className="w-3.5 h-3.5 text-white/95" />
            </div>
            <div className="space-y-0.5 mt-2">
              <p className="text-base font-black text-white leading-tight">{unreadAnnCount} Unread</p>
              <div className="text-[8px] font-bold text-white/70 uppercase space-y-0.5 mt-1">
                <p>Latest: Holiday Broadcast</p>
                <p>Category: Urgent</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('announcements')}
            className="w-full py-1.5 bg-white text-amber-600 hover:bg-amber-50 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all border-none cursor-pointer shadow-md"
          >
            Read Broadcasts
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2-span): Updates + Events + Recognition */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* MY WORK UPDATES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">My Daily Work Update</h3>
            </div>
            
            <form onSubmit={handleWorkUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Yesterday's Accomplishments</label>
                  <textarea
                    rows={3}
                    value={yesterdayWork}
                    onChange={e => setYesterdayWork(e.target.value)}
                    placeholder="Bullet points of what you finished yesterday..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Today's Target Plan</label>
                  <textarea
                    rows={3}
                    value={todayPlan}
                    onChange={e => setTodayPlan(e.target.value)}
                    placeholder="What are you focusing on today?"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Active Blockers / Challenges (Optional)</label>
                  <input
                    type="text"
                    value={blockers}
                    onChange={e => setBlockers(e.target.value)}
                    placeholder="e.g. Waiting for credential approvals"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Update Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border-none cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitLoading ? 'Submitting...' : 'Submit Daily Update'}
                </button>
              </div>
            </form>
          </div>

          {/* UPCOMING EVENTS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4">Upcoming Corporate Events & Holidays</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {eventsList.map((evt: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {evt.type === 'Birthday' ? '🎂' : '🎉'}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{evt.name}</h4>
                    <p className="text-[9px] text-slate-450 uppercase tracking-wide mt-0.5">{evt.type} • {new Date(evt.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECOGNITION & ACHIEVEMENTS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Recognition & Achievements</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center space-y-2">
                <span className="text-2xl">🏆</span>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">Employee of Month</h4>
                <p className="text-xs font-black text-amber-600 uppercase mt-1">{recognitionData.employeeOfMonth}</p>
              </div>

              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl text-center space-y-2">
                <span className="text-2xl">🙌</span>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">Kudos Received</h4>
                <p className="text-xs font-black text-blue-600 uppercase mt-1">{recognitionData.kudosReceived} Kudos</p>
              </div>

              <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-center space-y-2">
                <span className="text-2xl">🎖️</span>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white">Active Badges</h4>
                <div className="flex flex-wrap justify-center gap-1 mt-1">
                  {recognitionData.badges.map((badge: string, i: number) => (
                    <span key={i} className="px-1.5 py-0.5 bg-purple-500/10 text-purple-600 rounded text-[7px] font-bold uppercase">{badge}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1-span): Pending Actions + Helpdesk Widget + Payroll Details + Growth */}
        <div className="space-y-6">
          
          {/* PENDING ACTIONS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Pending Action Items</h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl flex items-start gap-2.5 text-rose-700 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold uppercase text-[9px] tracking-wider leading-none">Missing Documents</h4>
                  <p className="text-[9.5px] mt-1.5 font-semibold text-slate-500 dark:text-slate-400">Upload copy of PAN Card and Bank Verification form.</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl flex items-start gap-2.5 text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold uppercase text-[9px] tracking-wider leading-none">Pending Trainings</h4>
                  <p className="text-[9.5px] mt-1.5 font-semibold text-slate-500 dark:text-slate-400">Complete ISO Information Security compliance webinar.</p>
                </div>
              </div>
            </div>
          </div>

          {/* HELPDESK WIDGET */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Help Desk Status</h3>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-500">
                {ticketsList.length} Tickets
              </span>
            </div>
            <div className="space-y-2">
              {ticketsList.slice(0, 2).map((t: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150/45 dark:border-slate-850 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-450 uppercase">{t.ticketNumber || `#TCK-${idx}`}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-600">{t.status}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-none">{t.subject}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setActiveTab('helpdesk')} 
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border-none flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Ticket
            </button>
          </div>

          {/* PAYROLL WIDGET */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Salary Breakdown & PF</h3>
            <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 space-y-2">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                <span>Basic Salary</span>
                <span className="text-slate-800 dark:text-white">₹{profileData.salaryStructure?.basic?.toLocaleString() || '30,000'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                <span>HRA Allowance</span>
                <span className="text-slate-800 dark:text-white">₹{profileData.salaryStructure?.hra?.toLocaleString() || '10,000'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-1.5">
                <span>PF Contribution</span>
                <span className="text-slate-800 dark:text-white">₹{profileData.salaryStructure?.pf?.toLocaleString() || '3,600'}</span>
              </div>
              <div className="flex justify-between">
                <span>Income Tax (TDS)</span>
                <span className="text-slate-850 dark:text-white">₹{profileData.salaryStructure?.tax?.toLocaleString() || '2,000'}</span>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('payroll')} 
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border-none flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download Payslip
            </button>
          </div>

          {/* PERSONAL GROWTH */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">Personal Learning & Growth</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 mb-1">
                  <span>Learning Progress</span>
                  <span>{growthData.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${growthData.progress}%` }} />
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase space-y-1 mt-2">
                <p>✓ Training Courses: {growthData.coursesCompleted} Completed</p>
                <p>✓ Certificates Earned: {growthData.certificatesEarned} Active</p>
                <p>✓ Skills Added: {growthData.skillsAdded?.join(', ')}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
