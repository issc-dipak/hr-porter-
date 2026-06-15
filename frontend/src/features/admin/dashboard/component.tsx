"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, Clock, FileText, DollarSign, TrendingUp, Calendar, 
  Loader2, Sparkles, Briefcase, Search, Filter, CheckCircle2, 
  XCircle, ArrowUpRight, ArrowDownRight, AlertTriangle, Gift, 
  Award, ChevronRight, ChevronDown, RefreshCcw, Mail, MapPin, FileDown, 
  MessageSquare, ShieldCheck, UserCheck, AlertCircle, HelpCircle,
  FileSpreadsheet, Lock, UserMinus, ShieldAlert, Plus, HelpCircle as HelpIcon,
  BookOpen, Network, CheckSquare, Trash2, Laptop, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Modular admin sub-components
import { StatCard } from './components/StatCard';
import HrAdminAiAssistant from './components/HrAdminAiAssistant';
import { NotificationBellDropdown } from './components/NotificationBellDropdown';

export default function DashboardPage({ 
  role = 'HR',
  setCurrentPage
}: { 
  role?: string;
  setCurrentPage?: (page: string) => void;
}) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [liveDateTime, setLiveDateTime] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active Sub-Tab Workspace
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [orgTreeData, setOrgTreeData] = useState<any[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);

  // Export center state
  const [selectedExportType, setSelectedExportType] = useState<'workforce' | 'attendance' | 'leaves' | 'payroll'>('workforce');
  const [selectedExportFormat, setSelectedExportFormat] = useState<'pdf' | 'excel' | 'csv'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [isFormatMenuOpen, setIsFormatMenuOpen] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const formatMenuRef = useRef<HTMLDivElement>(null);

  // Search & Filter States
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('All');
  
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementContent, setAnnouncementContent] = useState('');
  const [announcementCategory, setAnnouncementCategory] = useState('General');
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
        setIsTypeMenuOpen(false);
      }
      if (formatMenuRef.current && !formatMenuRef.current.contains(event.target as Node)) {
        setIsFormatMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Action Center tabs state
  const [actionTab, setActionTab] = useState<'leaves' | 'corrections' | 'documents' | 'onboarding' | 'escalations'>('leaves');

  // DSR Filters state
  const [dsrSearchQuery, setDsrSearchQuery] = useState('');
  const [dsrDeptFilter, setDsrDeptFilter] = useState('All');
  const [dsrDateFilter, setDsrDateFilter] = useState('');

  // Attendance Trend chart timeframe
  const [attendanceTimeframe, setAttendanceTimeframe] = useState<'Week' | 'Month' | 'Year'>('Month');

  // Local data fetching for precise attendance trends calculation
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  // Format date and clock
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

  // Fetch command center data from consolidated backend endpoint
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const isAdmin = role === 'Admin' || role === 'Company Admin';
      const endpoint = isAdmin ? '/api/admin/dashboard' : '/api/hr/dashboard';

      const res = await fetch(`${endpoint}?t=${Date.now()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (e) {
      console.error("Failed to fetch dashboard data:", e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Fetch local historical data for chart trend calculations
  const fetchHistoricalData = async () => {
    try {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const empRes = await fetch(`/api/employees?t=${Date.now()}`, { headers });
      if (empRes.ok) {
        const empData = await empRes.json();
        if (Array.isArray(empData)) {
          setEmployeesList(empData);
        }
      }

      const attRes = await fetch(`/api/attendance?t=${Date.now()}`, { headers });
      if (attRes.ok) {
        const attData = await attRes.json();
        if (Array.isArray(attData)) {
          setAttendanceList(attData);
        }
      }
    } catch (e) {
      console.error("Failed to fetch historical attendance data:", e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchHistoricalData();

    const interval = setInterval(() => {
      fetchDashboardData();
      fetchHistoricalData();
    }, 30000);
    return () => clearInterval(interval);
  }, [role]);

  useEffect(() => {
    if (activeSubTab === 'workforce') {
      const fetchOrgTree = async () => {
        setLoadingTree(true);
        try {
          const token = localStorage.getItem('hr_system_token');
          const res = await fetch(`/api/organization-chart/tree?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setOrgTreeData(data);
          }
        } catch (err) {
          console.error("Failed to fetch Org Chart tree:", err);
        } finally {
          setLoadingTree(false);
        }
      };
      fetchOrgTree();
    }
  }, [activeSubTab]);

  // Handle Copilot Command state routing
  const handleCopilotCommand = (cmd: string) => {
    const query = cmd.toLowerCase();
    if (query.includes('attendance')) {
      setActiveSubTab('overview');
    } else if (query.includes('payroll')) {
      setActiveSubTab('payroll');
    } else if (query.includes('inactive') || query.includes('performance') || query.includes('summary')) {
      setActiveSubTab('workforce');
    } else if (query.includes('approvals')) {
      setActiveSubTab('overview');
      setActionTab('leaves');
    } else if (query.includes('hiring') || query.includes('recruit')) {
      setActiveSubTab('recruitment');
    } else if (query.includes('growth')) {
      setActiveSubTab('overview');
    }
  };

  const handleHrAction = async (type: 'leave' | 'ticket' | 'document' | 'correction' | 'onboarding', id: string, action: 'approve' | 'reject') => {
    setToastMsg(`Processing ${action} action...`);
    try {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;



      const res = await fetch('/api/hr/action', {
        method: 'POST',
        headers,
        body: JSON.stringify({ type, id, action })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setToastMsg(`Successfully ${action === 'approve' ? 'approved' : 'rejected'} ${type}!`);
          fetchDashboardData();
        } else {
          setToastMsg(`Action failed: ${result.error || 'Unknown error'}`);
        }
      } else {
        setToastMsg('Failed to communicate with HR backend service.');
      }
    } catch (e) {
      console.error("Error triggering HR action:", e);
      setToastMsg('Network error while processing HR action.');
    } finally {
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  // Handle post announcement
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;

    setIsPostingAnnouncement(true);
    setToastMsg('Publishing announcement...');

    try {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent,
          category: announcementCategory,
          postedBy: role === 'HR' ? 'HR Manager' : 'Admin'
        })
      });

      if (res.ok) {
        setToastMsg('Announcement published successfully!');
        setAnnouncementTitle('');
        setAnnouncementContent('');
        fetchDashboardData();
      } else {
        setToastMsg('Failed to post announcement.');
      }
    } catch (err) {
      console.error(err);
      setToastMsg('Error connecting to announcements service.');
    } finally {
      setIsPostingAnnouncement(false);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  // Export Report Handler (supports PDF, CSV, Excel)
  const handleExportReport = async () => {
    setIsExporting(true);
    setToastMsg(`Exporting ${selectedExportType} report as ${selectedExportFormat.toUpperCase()}...`);
    
    try {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (selectedExportFormat === 'pdf') {
        const url = `/api/reports/export/pdf?type=${selectedExportType}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error('Failed to export PDF');
        const html = await res.text();
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
        }
        setToastMsg('Report generated and opened for printing.');
      } else {
        const formatPath = selectedExportFormat === 'excel' ? 'excel' : 'csv';
        const url = `/api/reports/export/${formatPath}?type=${selectedExportType}`;
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error(`Failed to export ${selectedExportFormat.toUpperCase()}`);
        
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        
        const ext = selectedExportFormat === 'excel' ? 'xls' : 'csv';
        a.download = `${selectedExportType}_report_${new Date().toISOString().split('T')[0]}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        setToastMsg('Report downloaded successfully!');
      }
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
      setToastMsg(`Export failed: ${err.message}`);
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  // Helper calculations for local trends
  const getWeeklyAttendance = (attendance: any[], totalEmps: number) => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    if (!attendance || attendance.length === 0) return counts;
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon);
    monday.setHours(0,0,0,0);

    const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toDateString();
    });

    attendance.forEach((att: any) => {
      const date = att.date || att.createdAt;
      if (!date) return;
      const attDateStr = new Date(date).toDateString();
      const dayIdx = daysOfWeek.indexOf(attDateStr);
      if (dayIdx !== -1) {
        counts[dayIdx]++;
      }
    });

    const denominator = Math.max(1, totalEmps);
    return counts.map(c => Math.min(100, Math.round((c / denominator) * 100)));
  };

  const getMonthlyAttendance = (attendance: any[], totalEmps: number) => {
    const counts = Array(12).fill(0);
    if (!attendance || attendance.length === 0) return counts;
    const currentYear = new Date().getFullYear();
    const monthDateMaps: Record<number, Set<string>> = {};
    for (let m = 0; m < 12; m++) {
      monthDateMaps[m] = new Set();
    }

    attendance.forEach((att: any) => {
      const date = att.date || att.createdAt;
      if (!date) return;
      const d = new Date(date);
      if (d.getFullYear() === currentYear) {
        const month = d.getMonth();
        counts[month]++;
        monthDateMaps[month].add(d.toDateString());
      }
    });

    const denominator = Math.max(1, totalEmps);
    return counts.map((c, m) => {
      const uniqueDays = monthDateMaps[m].size || 1;
      const avgPresent = c / uniqueDays;
      return Math.min(100, Math.round((avgPresent / denominator) * 100));
    });
  };

  const getYearlyQuarterlyAttendance = (attendance: any[], totalEmps: number) => {
    const counts = Array(12).fill(0);
    if (!attendance || attendance.length === 0) return counts;
    const quarterMaps: Record<number, Set<string>> = {};
    for (let i = 0; i < 12; i++) quarterMaps[i] = new Set();

    const today = new Date();
    const currentYear = today.getFullYear();

    attendance.forEach((att: any) => {
      const date = att.date || att.createdAt;
      if (!date) return;
      const d = new Date(date);
      const diffYears = currentYear - d.getFullYear();
      if (diffYears >= 0 && diffYears < 3) {
        const q = Math.floor(d.getMonth() / 3);
        const index = 11 - ((2 - diffYears) * 4 + (3 - q));
        if (index >= 0 && index < 12) {
          counts[index]++;
          quarterMaps[index].add(d.toDateString());
        }
      }
    });

    const denominator = Math.max(1, totalEmps);
    return counts.map((c, idx) => {
      const uniqueDays = quarterMaps[idx].size || 1;
      const avgPresent = c / uniqueDays;
      return Math.min(100, Math.round((avgPresent / denominator) * 100));
    });
  };

  const chartData = useMemo(() => {
    const totalEmps = employeesList.length || 10;
    return {
      'Week': getWeeklyAttendance(attendanceList, totalEmps),
      'Month': getMonthlyAttendance(attendanceList, totalEmps),
      'Year': getYearlyQuarterlyAttendance(attendanceList, totalEmps)
    };
  }, [attendanceList, employeesList]);

  // Compute DSR filtered updates
  const filteredDsrUpdates = useMemo(() => {
    let list = dashboardData?.dsr?.updates || [];
    if (dsrSearchQuery) {
      list = list.filter((u: any) => u.name?.toLowerCase().includes(dsrSearchQuery.toLowerCase()));
    }
    if (dsrDeptFilter && dsrDeptFilter !== 'All') {
      list = list.filter((u: any) => u.dept?.toLowerCase() === dsrDeptFilter.toLowerCase());
    }
    if (dsrDateFilter) {
      list = list.filter((u: any) => {
        if (!u.date) return false;
        const itemDate = new Date(u.date).toISOString().split('T')[0];
        return itemDate === dsrDateFilter;
      });
    }
    return list;
  }, [dashboardData, dsrSearchQuery, dsrDeptFilter, dsrDateFilter]);

  // Filter Audit Logs
  const filteredAuditLogs = useMemo(() => {
    let list = dashboardData?.auditLogs || [];
    if (auditSearchQuery) {
      list = list.filter((log: any) => 
        log.user?.toLowerCase().includes(auditSearchQuery.toLowerCase()) || 
        log.details?.toLowerCase().includes(auditSearchQuery.toLowerCase())
      );
    }
    if (auditActionFilter && auditActionFilter !== 'All') {
      list = list.filter((log: any) => log.action?.toLowerCase().includes(auditActionFilter.toLowerCase()));
    }
    return list;
  }, [dashboardData, auditSearchQuery, auditActionFilter]);

  // Recursive renderer for Org Chart node
  const renderTreeNode = (node: any) => {
    return (
      <div key={node._id} className="pl-3.5 border-l border-slate-200 dark:border-slate-800 space-y-1.5 mt-2">
        <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-xl flex items-center gap-2 shadow-sm max-w-[280px]">
          {node.profilePicture ? (
            <img src={node.profilePicture} className="w-5.5 h-5.5 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-5.5 h-5.5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-[8.5px] font-black shrink-0 uppercase">
              {node.fullName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <span className="text-[9px] font-black text-slate-800 dark:text-white block leading-none truncate">{node.fullName}</span>
            <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5 truncate">{node.designation}</span>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="space-y-1.5">
            {node.children.map((child: any) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const isAdmin = role === 'Admin' || role === 'Company Admin';
  const kpis = dashboardData?.kpis || {};
  const health = dashboardData?.companyHealth || {};
  const company = dashboardData?.companyDetails || {};

  // Define tabs dynamically based on role
  const subTabs = isAdmin ? [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'workforce', label: 'Workforce Analytics', icon: Users },
    { id: 'payroll', label: 'Payroll & Cost', icon: DollarSign },
    { id: 'recruitment', label: 'Recruitment Analytics', icon: Briefcase },
    { id: 'security', label: 'Security & Audits', icon: ShieldCheck },
    { id: 'system', label: 'System Admin & Storage', icon: Settings }
  ] : [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'attendance', label: 'Attendance Hub', icon: Clock },
    { id: 'leave', label: 'Leave Center', icon: FileText },
    { id: 'recruitment', label: 'Recruitment Pipeline', icon: Briefcase },
    { id: 'lifecycle', label: 'Lifecycle & Onboarding', icon: UserCheck },
    { id: 'support', label: 'Employee Support', icon: HelpCircle },
    { id: 'engagement', label: 'Engagement', icon: Award }
  ];

  // Validate activeTab for current role
  useEffect(() => {
    const isValidTab = subTabs.some(tab => tab.id === activeSubTab);
    if (!isValidTab) {
      setActiveSubTab('overview');
    }
  }, [subTabs, activeSubTab]);

  if (loadingDashboard && !dashboardData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Initializing Control Center...</h3>
      </div>
    );
  }

  // Handle Admin governance actions
  const handleAdminAction = async (actionType: string, targetId?: string, data?: any) => {
    setToastMsg(`Running admin action: ${actionType}...`);
    try {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/action', {
        method: 'POST',
        headers,
        body: JSON.stringify({ actionType, targetId, data })
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success) {
          setToastMsg(`Admin action ${actionType} completed successfully!`);
          fetchDashboardData();
        } else {
          setToastMsg(`Action failed: ${result.error || 'Unknown error'}`);
        }
      } else {
        setToastMsg('Failed to communicate with Admin backend service.');
      }
    } catch (e) {
      console.error("Error triggering admin action:", e);
      setToastMsg('Network error while processing admin action.');
    } finally {
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  // PLACEHOLDER: renderAdminDashboard
  const renderAdminDashboard = () => {
    const kpis = dashboardData?.kpis || {};
    const health = dashboardData?.companyHealth || {};
    const security = dashboardData?.security || {};
    const subscription = dashboardData?.subscription || {};
    const system = dashboardData?.systemHealth || {};
    const activityFeed = dashboardData?.activityFeed || [];
    const auditLogsSummary = dashboardData?.auditLogsSummary || [];
    const roleSummary = dashboardData?.roleSummary || {};

    const storagePercent = (() => {
      const usageStr = subscription.storageUsage || '0 GB / 10 GB';
      const parsed = parseFloat(usageStr.split(' ')[0]) || 0;
      return Math.min(100, Math.max(0.5, (parsed / 10) * 100));
    })();

    const filteredAudit = auditLogsSummary.filter((log: any) => {
      const query = auditSearchQuery.toLowerCase();
      const matchQuery = !query || 
        log.user?.toLowerCase().includes(query) || 
        log.action?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query);
      
      const filter = auditActionFilter;
      const matchFilter = filter === 'All' || 
        (filter === 'Employee' && log.action?.includes('EMPLOYEE')) ||
        (filter === 'Payroll' && log.action?.includes('PAYROLL')) ||
        (filter === 'Leave' && log.action?.includes('LEAVE')) ||
        (filter === 'Recruitment' && log.action?.includes('JOB')) ||
        (filter === 'Login' && log.action?.includes('LOGIN'));
        
      return matchQuery && matchFilter;
    });

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {activeSubTab === 'overview' && (
            <div className="space-y-4">
              {/* Top KPIs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard 
                  icon={Users} 
                  label="Total Employees" 
                  value={kpis.totalEmployees || 0} 
                  trend="Company wide active roster" 
                  trendType="up" 
                  color="bg-blue-500" 
                  onRefresh={fetchDashboardData} 
                />
                <StatCard 
                  icon={UserCheck} 
                  label="Total HR Managers" 
                  value={kpis.totalHrManagers || 0} 
                  trend="Active HR operators" 
                  trendType="up" 
                  color="bg-indigo-500" 
                  onRefresh={fetchDashboardData} 
                />
                <StatCard 
                  icon={Network} 
                  label="Active Departments" 
                  value={kpis.activeDepartments || 0} 
                  trend="Distinct operations areas" 
                  trendType="up" 
                  color="bg-emerald-500" 
                  onRefresh={fetchDashboardData} 
                />
                <StatCard 
                  icon={DollarSign} 
                  label="Monthly Payroll Cost" 
                  value={kpis.monthlyPayroll >= 100000 
                    ? `₹${(kpis.monthlyPayroll / 100000).toFixed(1)}L` 
                    : `₹${(kpis.monthlyPayroll || 0).toLocaleString('en-IN')}`
                  } 
                  trend="Total monthly salary cost" 
                  trendType="up" 
                  color="bg-purple-500" 
                  onRefresh={fetchDashboardData} 
                />
                <StatCard 
                  icon={Briefcase} 
                  label="Open Recruitments" 
                  value={kpis.openRecruitments || 0} 
                  trend="Active job vacancies" 
                  trendType="up" 
                  color="bg-orange-500" 
                  onRefresh={fetchDashboardData} 
                />
                <StatCard 
                  icon={HelpCircle} 
                  label="Open Tickets" 
                  value={kpis.openTickets || 0} 
                  trend="Unresolved helpdesk tickets" 
                  trendType="down" 
                  color="bg-rose-500" 
                  onRefresh={fetchDashboardData} 
                />
              </div>

              {/* Main Content Row: Company Growth Gauge & Activity Feed & System Health / Billing */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5">
                {/* Left side: Health Score & Recent Logins / Activity Feed */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Organization Health Score Panel */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 shadow-sm rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="54" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="8"/>
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="54" 
                          className="stroke-emerald-500 fill-none transition-all duration-1000" 
                          strokeWidth="8"
                          strokeDasharray={339.29}
                          strokeDashoffset={339.29 - (339.29 * (health.orgHealthScore || 92)) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{health.orgHealthScore || 92}%</span>
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest text-center mt-0.5">Org Health</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 w-full">
                      <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-500" />
                          Company Health Overview
                        </h3>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Calculated metrics based on attendance, performance, and retention rate.</p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div className="p-2 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-xl">
                          <span className="text-[7.5px] text-slate-400 font-bold uppercase block">Employee Growth</span>
                          <span className="text-xs font-black text-slate-850 dark:text-white">+{health.employeeGrowth || 0}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-xl">
                          <span className="text-[7.5px] text-slate-400 font-bold uppercase block">Attendance today</span>
                          <span className="text-xs font-black text-slate-850 dark:text-white">{health.attendance || 0}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-xl">
                          <span className="text-[7.5px] text-slate-400 font-bold uppercase block">Leaves today</span>
                          <span className="text-xs font-black text-slate-850 dark:text-white">{health.leave || 0}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-xl">
                          <span className="text-[7.5px] text-slate-400 font-bold uppercase block">Avg Performance</span>
                          <span className="text-xs font-black text-slate-850 dark:text-white">{health.performance || 0}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-xl">
                          <span className="text-[7.5px] text-slate-400 font-bold uppercase block">Attrition Rate</span>
                          <span className="text-xs font-black text-rose-500">{health.attritionRate || 0}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-xl">
                          <span className="text-[7.5px] text-slate-400 font-bold uppercase block">Retention Rate</span>
                          <span className="text-xs font-black text-emerald-500">{health.retentionRate || 0}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Activity Feed */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 shadow-sm rounded-2xl p-4 flex flex-col h-[320px]">
                    <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-3">
                      <Network className="w-3.5 h-3.5 text-blue-500" />
                      Company Governance Activity Feed
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                      {activityFeed.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500/60 mb-2" />
                          <span className="text-[8.5px] font-black uppercase tracking-wider">No recent admin activities recorded.</span>
                        </div>
                      ) : (
                        activityFeed.map((act: any) => (
                          <div key={act.id} className="p-2 bg-slate-50 dark:bg-slate-850/30 rounded-xl border border-slate-200/10 flex items-start gap-2.5">
                            <div className="p-1 rounded bg-indigo-500/10 text-indigo-500 mt-0.5 animate-pulse">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <span className="text-[9.5px] font-black text-slate-900 dark:text-white">{act.activity}</span>
                                <span className="text-[7.5px] text-slate-400">{new Date(act.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-[9.5px] text-slate-500 mt-0.5">{act.details}</p>
                              <span className="text-[7.5px] text-slate-400 font-extrabold uppercase mt-1 block">Triggered by: {act.user}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Subscription & Billing overview card, and System health details */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Subscription Billing Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 shadow-sm rounded-2xl p-4 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      <div>
                        <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          Billing & Subscription
                        </h2>
                        <p className="text-[8px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">SaaS tier overview</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-black uppercase text-[7px] tracking-wider border border-emerald-500/15">
                        {subscription.status || 'Active'}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between text-[9.5px]">
                        <span className="font-extrabold text-slate-400 uppercase tracking-wider">Current Plan</span>
                        <span className="font-black text-slate-900 dark:text-white">{subscription.plan || 'Enterprise Premium SaaS'}</span>
                      </div>
                      <div className="flex justify-between text-[9.5px]">
                        <span className="font-extrabold text-slate-400 uppercase tracking-wider">Billing Cycle</span>
                        <span className="font-black text-slate-900 dark:text-white">{subscription.billingCycle || 'Monthly'}</span>
                      </div>
                      <div className="flex justify-between text-[9.5px]">
                        <span className="font-extrabold text-slate-400 uppercase tracking-wider">Next Renewal Date</span>
                        <span className="font-black text-slate-900 dark:text-white">{subscription.nextBillingDate || '2026-07-01'}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9.5px]">
                          <span className="font-extrabold text-slate-400 uppercase tracking-wider">Data Storage Consumed</span>
                          <span className="font-black text-slate-900 dark:text-white">{subscription.storageUsage || '0 GB / 10 GB'}</span>
                        </div>
                        {/* Storage progress bar */}
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${storagePercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Administration & Status */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 shadow-sm rounded-2xl p-4 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                      <div>
                        <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                          <Laptop className="w-3.5 h-3.5 text-blue-500" />
                          System Health Check
                        </h2>
                        <p className="text-[8px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">Database & Application Nodes</p>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-black uppercase text-[7px] tracking-wider border",
                        system.status === 'Operational'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/15'
                      )}>
                        {system.status || 'Operational'}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-slate-700 dark:text-slate-350">
                      <div className="flex justify-between text-[9.5px]">
                        <span className="font-extrabold text-slate-400 uppercase tracking-wider">MongoDB Connection</span>
                        <span className="font-black text-emerald-500">{system.dbStatus || 'Connected'}</span>
                      </div>
                      <div className="flex justify-between text-[9.5px]">
                        <span className="font-extrabold text-slate-400 uppercase tracking-wider">Node Memory Usage</span>
                        <span className="font-black text-slate-900 dark:text-white">{system.memoryUsage || '120 MB'}</span>
                      </div>
                      <div className="flex justify-between text-[9.5px]">
                        <span className="font-extrabold text-slate-400 uppercase tracking-wider">Active Admin Users</span>
                        <span className="font-black text-slate-900 dark:text-white">{roleSummary.adminCount || 0}</span>
                      </div>
                      <div className="flex justify-between text-[9.5px]">
                        <span className="font-extrabold text-slate-400 uppercase tracking-wider">Active HR Managers</span>
                        <span className="font-black text-slate-900 dark:text-white">{roleSummary.hrCount || 0}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={() => handleAdminAction('diagnostics')}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-[8.5px] font-black uppercase tracking-widest text-white dark:text-slate-950 rounded-xl cursor-pointer transition-all active:scale-[0.98] border-none shadow-sm"
                      >
                        Run System Diagnostics
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WORKFORCE ANALYTICS SUB-TAB */}
          {activeSubTab === 'workforce' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Workforce Roster Summary (Left) */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 space-y-4">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  Workforce User Roster Distribution
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-slate-50 dark:bg-slate-850/50 p-3 rounded-2xl border border-slate-200/10">
                    <span className="text-lg font-black text-slate-900 dark:text-white block">{roleSummary.activeUsers || 0}</span>
                    <span className="text-[7.5px] font-black text-slate-455 uppercase tracking-widest mt-1 block">Active Users</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-850/50 p-3 rounded-2xl border border-slate-200/10">
                    <span className="text-lg font-black text-indigo-500 block">{roleSummary.adminCount || 0}</span>
                    <span className="text-[7.5px] font-black text-slate-455 uppercase tracking-widest mt-1 block">Admins</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-850/50 p-3 rounded-2xl border border-slate-200/10">
                    <span className="text-lg font-black text-emerald-500 block">{roleSummary.hrCount || 0}</span>
                    <span className="text-[7.5px] font-black text-slate-455 uppercase tracking-widest mt-1 block">HR Managers</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-850/50 p-3 rounded-2xl border border-slate-200/10">
                    <span className="text-lg font-black text-blue-500 block">{roleSummary.employeeCount || 0}</span>
                    <span className="text-[7.5px] font-black text-slate-455 uppercase tracking-widest mt-1 block">Employees</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[8.5px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Growth & Attrition Performance Index</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                      <span className="text-[7.5px] font-black text-slate-450 uppercase block mb-1">Workforce Growth Trend</span>
                      <p className="text-[9.5px] text-slate-600 dark:text-slate-350">Company size has increased by <strong className="text-emerald-500">+{health.employeeGrowth || 0}%</strong> in the last 30 days based on active onboarding vs exit transitions.</p>
                    </div>
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                      <span className="text-[7.5px] font-black text-slate-450 uppercase block mb-1">Retention Index</span>
                      <p className="text-[9.5px] text-slate-600 dark:text-slate-350">Annual retention index stands at <strong className="text-emerald-500">{health.retentionRate || 0}%</strong> with a calculated company-wide attrition rate of <strong className="text-rose-500">{health.attritionRate || 0}%</strong>.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department spreads (Right) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-[320px]">
                <div>
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Network className="w-3.5 h-3.5 text-blue-500" />
                    Operational Hierarchy
                  </h2>
                  <p className="text-[8px] text-slate-450 font-bold uppercase tracking-wider mb-4">Hierarchical tree representation preview</p>
                  
                  <div className="border border-slate-100 dark:border-slate-800/60 p-3 rounded-2xl bg-slate-50/40 dark:bg-slate-950/20 space-y-2 h-44 overflow-y-auto">
                    {orgTreeData.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <span className="text-[8.5px] font-black uppercase tracking-wider">Loading Tree Node...</span>
                      </div>
                    ) : (
                      orgTreeData.map(rootNode => renderTreeNode(rootNode))
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentPage && setCurrentPage('orgchart')}
                  className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-[8.5px] font-black uppercase tracking-widest text-white dark:text-slate-950 rounded-xl border-none cursor-pointer transition-all hover:shadow-md"
                >
                  Open Corporate Hierarchy Chart
                </button>
              </div>
            </div>
          )}

          {/* PAYROLL & COST SUB-TAB */}
          {activeSubTab === 'payroll' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 space-y-4">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  Governance Financial Metrics
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-2xl">
                    <span className="text-[7.5px] font-black text-slate-450 uppercase tracking-widest">Monthly Payroll Cost</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
                      ₹{(kpis.monthlyPayroll || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-2xl">
                    <span className="text-[7.5px] font-black text-slate-450 uppercase tracking-widest">Provident Fund (PF)</span>
                    <span className="text-lg font-black text-indigo-500 block mt-1">
                      ₹{(kpis.pfContribution || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-2xl">
                    <span className="text-[7.5px] font-black text-slate-450 uppercase tracking-widest">Tax Deductions (TDS)</span>
                    <span className="text-lg font-black text-rose-500 block mt-1">
                      ₹{(kpis.taxDeductions || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-1.5">
                  <h3 className="text-[8.5px] font-black text-blue-600 uppercase tracking-wider">Strategic Cost Analysis</h3>
                  <p className="text-[9.5px] text-slate-600 dark:text-slate-350">Admins can review standard tax configurations, basic base salary structures, and PF parameters under settings. Any adjustments to the structural cost elements will log audit logs automatically.</p>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-[280px]">
                <div>
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                    Financial Governance Checkpoints
                  </h2>
                  <div className="space-y-3 mt-3 text-[9.5px]">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-slate-850 dark:text-white">Verify monthly payroll disbursements</strong>
                        <span className="text-slate-400 text-[8px] uppercase">Automated checks configured</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-slate-850 dark:text-white">PF & TDS ledger records audit</strong>
                        <span className="text-slate-400 text-[8px] uppercase">Compliant with dynamic Mongoose schema mappings</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentPage && setCurrentPage('payroll')}
                  className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-[8.5px] font-black uppercase tracking-widest text-white dark:text-slate-950 rounded-xl cursor-pointer transition-all border-none"
                >
                  Access Payroll Control Console
                </button>
              </div>
            </div>
          )}

          {/* RECRUITMENT ANALYTICS SUB-TAB */}
          {activeSubTab === 'recruitment' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 space-y-4">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                  Talent Acquisition Statistics
                </h2>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-2xl">
                    <span className="text-xl font-black text-indigo-500 block">{kpis.openRecruitments || 0}</span>
                    <span className="text-[7.5px] font-black text-slate-455 uppercase tracking-widest mt-1 block">Active Vacancies</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-2xl">
                    <span className="text-xl font-black text-emerald-500 block">+{health.hiringGrowth || 0}%</span>
                    <span className="text-[7.5px] font-black text-slate-455 uppercase tracking-widest mt-1 block">Hiring Growth Ratio</span>
                  </div>
                </div>

                <p className="text-[9.5px] text-slate-500 leading-relaxed">System-wide recruitment analytics aggregate applications and job openings to compute current onboarding capacities. Real-time hiring pipeline updates are available under the operational dashboard.</p>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-[220px]">
                <div>
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    ATS Sourcing
                  </h2>
                  <p className="text-[9.5px] text-slate-500">Corporate sourcing trends are dynamically tracked through distinct source channel filters LinkedIn, website portal, and referrals.</p>
                </div>
                
                <button 
                  onClick={() => setCurrentPage && setCurrentPage('recruitment')}
                  className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-[8.5px] font-black uppercase tracking-widest text-white dark:text-slate-950 rounded-xl cursor-pointer transition-all border-none"
                >
                  Manage Recruitment Funnels
                </button>
              </div>
            </div>
          )}

          {/* SECURITY & AUDIT SUB-TAB */}
          {activeSubTab === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
                {/* Security Metrics */}
                <div className="md:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-500" />
                    Security Oversight Parameters
                  </h2>
                  
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center">
                      <span className="text-[7.5px] font-black text-slate-450 uppercase block">Failed Logins (24h)</span>
                      <span className="text-xl font-black text-rose-500 mt-1 block">{security.failedAttempts || 0}</span>
                    </div>
                    <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center">
                      <span className="text-[7.5px] font-black text-slate-450 uppercase block">Password Resets</span>
                      <span className="text-xl font-black text-amber-500 mt-1 block">{security.passwordResets || 0}</span>
                    </div>
                    <div className="p-3 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/10 rounded-2xl text-center">
                      <span className="text-[7.5px] font-black text-slate-450 uppercase block">Suspended Accounts</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{security.lockedAccounts || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Active security alerts */}
                <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 h-[180px] overflow-y-auto flex flex-col justify-between">
                  <div>
                    <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      Active Security Alerts
                    </h2>
                    <div className="space-y-2 max-h-[100px] overflow-y-auto">
                      {!security.alerts || security.alerts.length === 0 ? (
                        <span className="text-[8.5px] font-bold text-slate-400 block text-center py-4 uppercase">No active security alerts</span>
                      ) : (
                        security.alerts.map((al: any) => (
                          <div key={al.id} className="p-2 bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/10 rounded-xl flex items-center justify-between text-[8px] font-bold">
                            <div>
                              <span className="text-rose-600 font-black">{al.action}</span>
                              <p className="text-slate-450 uppercase mt-0.5">{al.user} ({al.ipAddress})</p>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-black text-[6.5px] uppercase tracking-widest">{al.severity}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full System Audit Logs */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      Comprehensive System Audit Trail
                    </h2>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Track modifications across the company directory, database, and settings</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search logs..." 
                        value={auditSearchQuery}
                        onChange={e => setAuditSearchQuery(e.target.value)}
                        className="pl-7 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-[9px] focus:outline-none text-slate-800 dark:text-white"
                      />
                    </div>
                    <select
                      value={auditActionFilter}
                      onChange={e => setAuditActionFilter(e.target.value)}
                      className="px-2 py-1.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-xl text-[9px] focus:outline-none text-slate-800 dark:text-white font-bold"
                    >
                      <option value="All">All Actions</option>
                      <option value="Employee">Employee Changes</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Leave">Leaves</option>
                      <option value="Recruitment">Recruitment</option>
                      <option value="Login">Logins</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[9.5px]">
                    <thead>
                      <tr className="border-b border-slate-150 dark:border-slate-800 text-[8px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="pb-2">User</th>
                        <th className="pb-2">Action</th>
                        <th className="pb-2">Details</th>
                        <th className="pb-2">IP Address</th>
                        <th className="pb-2 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAudit.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400 font-bold uppercase tracking-widest text-[8.5px]">No audit trails logged.</td>
                        </tr>
                      ) : (
                        filteredAudit.map((log: any) => (
                          <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-850/20">
                            <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{log.user}</td>
                            <td className="py-2.5 font-black text-indigo-600 dark:text-indigo-400 uppercase text-[8px] tracking-wider">{log.action}</td>
                            <td className="py-2.5 text-slate-500 dark:text-slate-350">{log.details}</td>
                            <td className="py-2.5 text-slate-400">{log.ipAddress}</td>
                            <td className="py-2.5 text-right text-slate-450">{new Date(log.timestamp).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM ADMIN & STORAGE SUB-TAB */}
          {activeSubTab === 'system' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* System Admin Settings (Left) */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 space-y-4">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <Laptop className="w-3.5 h-3.5 text-blue-500" />
                  System Management & Storage Details
                </h2>

                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-[9.5px]">
                    <span className="font-extrabold text-slate-400 uppercase">MongoDB status</span>
                    <span className="font-black text-emerald-500">{system.dbStatus || 'Connected'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9.5px]">
                    <span className="font-extrabold text-slate-400 uppercase">Heap Memory allocation</span>
                    <span className="font-black text-slate-900 dark:text-white">{system.memoryUsage || '120 MB'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9.5px]">
                    <span className="font-extrabold text-slate-400 uppercase">Total Audit log count</span>
                    <span className="font-black text-slate-900 dark:text-white">{auditLogsSummary.length}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9.5px]">
                      <span className="font-extrabold text-slate-400 uppercase">SaaS storage footprint</span>
                      <span className="font-black text-slate-850 dark:text-white">{subscription.storageUsage || '0 GB / 10 GB'}</span>
                    </div>
                    {/* Storage progress bar */}
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${storagePercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-850/50 rounded-2xl border border-slate-205/10">
                  <h3 className="text-[8.5px] font-black text-slate-800 dark:text-white uppercase tracking-wider mb-1">Company settings & governance</h3>
                  <p className="text-[9.5px] text-slate-400 leading-relaxed">Company data storage calculations are updated every 30 seconds dynamically based on document collections byte-size. Ensure regular cleanup of audit log databases to prevent reaching the standard 10 GB limit.</p>
                </div>
              </div>

              {/* Roles Summary Panel (Right) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-[320px]">
                <div>
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                    Role Distribution Summaries
                  </h2>
                  <div className="space-y-3 mt-3 text-[9.5px]">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-655 dark:text-slate-350">Company Admins</span>
                      <span className="font-black text-slate-900 dark:text-white">{roleSummary.adminCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-655 dark:text-slate-350">HR Managers</span>
                      <span className="font-black text-slate-900 dark:text-white">{roleSummary.hrCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-655 dark:text-slate-350">Registered Employees</span>
                      <span className="font-black text-slate-900 dark:text-white">{roleSummary.employeeCount || 0}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleAdminAction('garbage_collection')}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-[8.5px] font-black uppercase tracking-widest text-white rounded-xl cursor-pointer transition-all active:scale-[0.98] border-none shadow-sm"
                >
                  Clear Cached Logs & Optimize Storage
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  // Upgraded role-based HR Operations dashboard renderer
  const renderHrDashboard = () => {
    const kpis = dashboardData?.kpis || {};
    const health = dashboardData?.companyHealth || {};
    const leavesToday = dashboardData?.leavesToday || [];
    const attendanceExceptions = dashboardData?.attendanceExceptions || [];
    const probationEmployees = dashboardData?.probationEmployees || [];
    const birthdaysList = dashboardData?.birthdaysList || [];
    const anniversariesList = dashboardData?.anniversariesList || [];
    const exitTrackingList = dashboardData?.exitTrackingList || [];
    const actionCenter = dashboardData?.actionCenter || {};
    const dsr = dashboardData?.dsr || {};
    const satisfactionScore = dashboardData?.satisfactionScore || 88;
    const workforce = dashboardData?.workforce || {};
    const recruitments = dashboardData?.recruitments || {};
    const payroll = dashboardData?.payroll || {};

    const filteredDsrUpdates = dashboardData?.dsr?.updates || [];

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* TAB 1: OVERVIEW */}
          {activeSubTab === 'overview' && (
            <div className="space-y-4">
              {/* Top KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard 
                  icon={Users} 
                  label="Total Employees" 
                  value={kpis.totalEmployees?.count || 0} 
                  trend={`Act: ${kpis.totalEmployees?.active || 0} • New: ${kpis.totalEmployees?.newJoiners || 0}`} 
                  trendType="up" 
                  color="bg-blue-500" 
                  onRefresh={fetchDashboardData} 
                />
                <StatCard 
                  icon={Clock} 
                  label="Present Today" 
                  value={kpis.attendanceOverview?.present || 0} 
                  trend={`WFH: ${kpis.attendanceOverview?.wfh || 0} • Late: ${kpis.attendanceOverview?.late || 0} • Abs: ${kpis.attendanceOverview?.absent || 0}`} 
                  trendType="up" 
                  color="bg-indigo-500" 
                  onRefresh={fetchDashboardData} 
                />
                <StatCard 
                  icon={FileText} 
                  label="Pending Leaves" 
                  value={kpis.pendingLeaves?.pending || 0} 
                  trend={`Approved Today: ${kpis.pendingLeaves?.approvedToday || 0}`} 
                  trendType="up" 
                  color="bg-emerald-500" 
                  onRefresh={fetchDashboardData} 
                />
                <StatCard 
                  icon={HelpCircle} 
                  label="Open Help Desk" 
                  value={kpis.openTickets?.open || 0} 
                  trend={`High: ${kpis.openTickets?.highPriority || 0} • Res: ${kpis.openTickets?.resolved || 0}`} 
                  trendType="down" 
                  color="bg-purple-500" 
                  onRefresh={fetchDashboardData} 
                />
                <StatCard 
                  icon={Briefcase} 
                  label="Open Recruitments" 
                  value={kpis.openRecruitments?.activeJobs || 0} 
                  trend={`Applications: ${kpis.openRecruitments?.applicationsReceived || 0}`} 
                  trendType="up" 
                  color="bg-orange-500" 
                  onRefresh={fetchDashboardData} 
                />
                <StatCard 
                  icon={DollarSign} 
                  label="Monthly Payroll" 
                  value={kpis.monthlyPayroll?.totalCost >= 100000 
                    ? `₹${(kpis.monthlyPayroll.totalCost / 100000).toFixed(1)}L` 
                    : `₹${(kpis.monthlyPayroll?.totalCost || 0).toLocaleString('en-IN')}`
                  } 
                  trend={`Release: ${kpis.monthlyPayroll?.upcomingDate || 'N/A'}`} 
                  trendType="up" 
                  color="bg-rose-500" 
                  onRefresh={fetchDashboardData} 
                />
              </div>

              {/* Action Center & DSR Log */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5">
                {/* Action Center (Col span 3) */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 shadow-sm rounded-2xl p-3 flex flex-col h-[320px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                    <div>
                      <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                        Operational Action Center
                      </h2>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Approve leaves, corrections, docs, and onboarding checklist</p>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800/60 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800 overflow-x-auto shrink-0">
                      {(['leaves', 'corrections', 'documents', 'onboarding', 'escalations'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActionTab(tab)}
                          className={cn(
                            "px-2 py-1 rounded-md text-[7.5px] font-black uppercase tracking-widest transition-all cursor-pointer border-none",
                            actionTab === tab 
                              ? "bg-emerald-600 text-white shadow-md" 
                              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-350"
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={actionTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        {actionTab === 'leaves' && (
                          <>
                            {(!actionCenter.pendingLeaves || actionCenter.pendingLeaves.length === 0) ? (
                              <div className="h-44 flex flex-col items-center justify-center text-slate-400">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500/60 mb-2" />
                                <span className="text-[8.5px] font-black uppercase tracking-wider">All leaves approved!</span>
                              </div>
                            ) : (
                              actionCenter.pendingLeaves.map((l: any) => (
                                <div key={l.id} className="p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/40 flex justify-between items-center">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9.5px] font-black text-slate-900 dark:text-white">{l.name}</span>
                                      <span className="text-[7px] font-bold bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">{l.dept}</span>
                                    </div>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Requested {l.type} • {l.date}</p>
                                    <p className="text-[9px] text-slate-500 italic">"{l.reason}"</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleHrAction('leave', l.id, 'reject')}
                                      className="px-2 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-[7.5px] font-black uppercase tracking-widest border border-rose-500/10 cursor-pointer transition-all"
                                    >
                                      Reject
                                    </button>
                                    <button 
                                      onClick={() => handleHrAction('leave', l.id, 'approve')}
                                      className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[7.5px] font-black uppercase tracking-widest cursor-pointer border-none transition-all"
                                    >
                                      Approve
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </>
                        )}

                        {actionTab === 'corrections' && (
                          <>
                            {(!actionCenter.pendingCorrections || actionCenter.pendingCorrections.length === 0) ? (
                              <div className="h-44 flex flex-col items-center justify-center text-slate-400">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500/60 mb-2" />
                                <span className="text-[8.5px] font-black uppercase tracking-wider">No pending corrections.</span>
                              </div>
                            ) : (
                              actionCenter.pendingCorrections.map((c: any) => (
                                <div key={c.id} className="p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/40 flex justify-between items-center">
                                  <div>
                                    <span className="text-[9.5px] font-black text-slate-900 dark:text-white">{c.name}</span>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Late arrival correction requested today (Clock In: {c.timeIn})</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleHrAction('correction', c.id, 'reject')}
                                      className="px-2 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-[7.5px] font-black uppercase tracking-widest border border-rose-500/10 cursor-pointer transition-all"
                                    >
                                      Reject
                                    </button>
                                    <button 
                                      onClick={() => handleHrAction('correction', c.id, 'approve')}
                                      className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[7.5px] font-black uppercase tracking-widest cursor-pointer border-none transition-all"
                                    >
                                      Verify
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </>
                        )}

                        {actionTab === 'documents' && (
                          <>
                            {(!actionCenter.pendingDocuments || actionCenter.pendingDocuments.length === 0) ? (
                              <div className="h-44 flex flex-col items-center justify-center text-slate-400">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500/60 mb-2" />
                                <span className="text-[8.5px] font-black uppercase tracking-wider">All documents verified!</span>
                              </div>
                            ) : (
                              actionCenter.pendingDocuments.map((d: any) => (
                                <div key={d.id} className="p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/40 flex justify-between items-center">
                                  <div>
                                    <span className="text-[9.5px] font-black text-slate-900 dark:text-white">{d.name}</span>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Upload Verification: {d.docs?.join(', ')}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleHrAction('document', d.id, 'reject')}
                                      className="px-2 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-[7.5px] font-black uppercase tracking-widest border border-rose-500/10 cursor-pointer transition-all"
                                    >
                                      Reject
                                    </button>
                                    <button 
                                      onClick={() => handleHrAction('document', d.id, 'approve')}
                                      className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[7.5px] font-black uppercase tracking-widest cursor-pointer border-none transition-all"
                                    >
                                      Verify
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </>
                        )}

                        {actionTab === 'onboarding' && (
                          <>
                            {(!actionCenter.pendingOnboarding || actionCenter.pendingOnboarding.length === 0) ? (
                              <div className="h-44 flex flex-col items-center justify-center text-slate-400">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500/60 mb-2" />
                                <span className="text-[8.5px] font-black uppercase tracking-wider">All checklists completed!</span>
                              </div>
                            ) : (
                              actionCenter.pendingOnboarding.map((o: any) => (
                                <div key={o.id} className="p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/40 flex justify-between items-center">
                                  <div>
                                    <span className="text-[9.5px] font-black text-slate-900 dark:text-white">{o.name}</span>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Onboarding Task Checklist • {o.designation}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleHrAction('onboarding', o.id, 'approve')}
                                      className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[7.5px] font-black uppercase tracking-widest cursor-pointer border-none transition-all active:scale-[0.98]"
                                    >
                                      Complete Checks
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </>
                        )}

                        {actionTab === 'escalations' && (
                          <>
                            {(!actionCenter.pendingEscalations || actionCenter.pendingEscalations.length === 0) ? (
                              <div className="h-44 flex flex-col items-center justify-center text-slate-400">
                                <CheckCircle2 className="w-6 h-6 text-emerald-500/60 mb-2" />
                                <span className="text-[8.5px] font-black uppercase tracking-wider">No tickets escalated!</span>
                              </div>
                            ) : (
                              actionCenter.pendingEscalations.map((e: any) => (
                                <div key={e.id} className="p-2 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/40 flex justify-between items-center">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9.5px] font-black text-slate-900 dark:text-white">{e.name}</span>
                                      <span className="text-[7px] font-bold bg-rose-500/10 text-rose-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider">{e.priority} Escalation</span>
                                    </div>
                                    <p className="text-[8px] text-slate-450 font-bold uppercase tracking-wider">Subject: "{e.subject}"</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleHrAction('ticket', e.id, 'reject')}
                                      className="px-2 py-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg text-[7.5px] font-black uppercase tracking-widest border border-rose-500/10 cursor-pointer transition-all"
                                    >
                                      Dismiss
                                    </button>
                                    <button 
                                      onClick={() => handleHrAction('ticket', e.id, 'approve')}
                                      className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-[7.5px] font-black uppercase tracking-widest cursor-pointer border-none transition-all"
                                    >
                                      Resolve
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* DSR updates logger (Col span 2) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/85 shadow-sm rounded-2xl p-3 flex flex-col h-[320px]">
                  <div className="mb-3">
                    <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
                      Daily Status Reports (DSR)
                    </h2>
                    <div className="grid grid-cols-4 gap-1 mt-1.5 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800/20 text-center">
                      <div>
                        <div className="text-[10px] font-black text-slate-800 dark:text-white">{dsr.metrics?.total || 0}</div>
                        <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Total</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-emerald-600">{dsr.metrics?.completed || 0}</div>
                        <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Done</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-blue-600">{dsr.metrics?.inProgress || 0}</div>
                        <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Progress</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-amber-600">{dsr.metrics?.blocked || 0}</div>
                        <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Blocked</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1.5 mb-2.5 bg-slate-50 dark:bg-slate-800/40 p-1.5 rounded-xl border border-slate-100/50 dark:border-slate-800/40">
                    <div className="flex-1 relative">
                      <Search className="absolute left-2 top-2 w-3 h-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search Employee..."
                        value={dsrSearchQuery}
                        onChange={e => setDsrSearchQuery(e.target.value)}
                        className="w-full pl-6 pr-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-lg text-[8px] font-bold focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
                      />
                    </div>
                    <select
                      value={dsrDeptFilter}
                      onChange={e => setDsrDeptFilter(e.target.value)}
                      className="px-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-lg text-[8px] font-bold focus:outline-none text-slate-800 dark:text-white"
                    >
                      <option value="All">All Depts</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filteredDsrUpdates.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center text-slate-400">
                        <Search className="w-6 h-6 text-slate-300 mb-2" />
                        <span className="text-[8.5px] font-black uppercase tracking-wider">No matching updates.</span>
                      </div>
                    ) : (
                      filteredDsrUpdates.map((u: any) => (
                        <div key={u.id} className="p-2 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-slate-100 dark:border-slate-800/40 text-[9px] hover:scale-[1.002] transition-all">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <span className="font-black text-slate-900 dark:text-white">{u.name}</span>
                              <span className="text-[6.5px] font-bold bg-slate-150 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-1.5 py-0.5 rounded-full ml-1 uppercase tracking-wider">{u.dept}</span>
                            </div>
                            <span className={cn(
                              "text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border",
                              u.status === 'Completed' || u.status === 'Reviewed' 
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15'
                                : u.status === 'Blocked'
                                ? 'bg-rose-500/10 text-rose-600 border-rose-500/15'
                                : 'bg-blue-500/10 text-blue-600 border-blue-500/15'
                            )}>
                              {u.status}
                            </span>
                          </div>
                          <div className="space-y-0.5 text-[8.5px] text-slate-500 dark:text-slate-350">
                            <p className="text-slate-500"><strong className="text-[7px] uppercase text-slate-450 block">Yesterdays Work:</strong> "{u.yesterdaysWork}"</p>
                            <p className="text-slate-650 dark:text-slate-300"><strong className="text-[7px] uppercase text-slate-450 block">Todays Plan:</strong> "{u.todaysPlan}"</p>
                            {u.blockers && u.blockers !== 'None' && <p className="text-rose-500 font-bold"><strong className="text-[7px] uppercase block">Blocker:</strong> "{u.blockers}"</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ATTENDANCE HUB SUB-TAB */}
          {activeSubTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5">
                {/* Attendance Trends (Col span 3) */}
                <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-sm rounded-2xl p-4 flex flex-col h-[320px]">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        Workforce Attendance Trends
                      </h2>
                      <p className="text-[8px] text-slate-455 font-bold uppercase tracking-wider mt-0.5">{attendanceTimeframe}ly active engagement ratio</p>
                    </div>
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800 shadow-inner">
                      {(['Week', 'Month', 'Year'] as const).map((t) => (
                        <button 
                          key={t} 
                          onClick={() => setAttendanceTimeframe(t)}
                          className={cn(
                            "px-2 py-0.5 rounded-md text-[7.5px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer border-none",
                            attendanceTimeframe === t 
                              ? "bg-emerald-600 text-white shadow-md" 
                              : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 px-1 h-36">
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={attendanceTimeframe}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-end justify-between w-full h-full gap-1.5 sm:gap-3"
                      >
                        {chartData[attendanceTimeframe].map((h, i) => (
                          <div key={i} className="flex-1 group relative h-full flex items-end">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: i * 0.02, duration: 0.5, ease: "easeOut" }}
                              className="w-full bg-gradient-to-t from-emerald-600 to-teal-500 rounded-t-xl relative group-hover:from-emerald-500 group-hover:to-teal-400 transition-all shadow-sm min-h-[4px]"
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-[8px] font-black py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-20" style={{ background: '#0f172a' }}>
                                {h}% Attendance
                              </div>
                            </motion.div>
                          </div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex justify-between mt-2.5 text-[8px] font-black text-slate-450 uppercase tracking-widest px-1 border-t border-slate-100 dark:border-slate-800/40 pt-1.5">
                    {attendanceTimeframe === 'Week' ? (
                      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d} className="flex-1 text-center font-extrabold">{d}</span>)
                    ) : attendanceTimeframe === 'Month' ? (
                      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => <span key={m} className="flex-1 text-center font-extrabold">{m}</span>)
                    ) : (
                      ['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => <span key={i} className="flex-1 text-center font-extrabold">{q}</span>)
                    )}
                  </div>
                </div>

                {/* Exceptions & Late Approvals (Col span 2) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-sm rounded-2xl p-4 flex flex-col h-[320px]">
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Today's Attendance Exceptions
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {attendanceExceptions.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <CheckSquare className="w-6 h-6 text-emerald-500/60 mb-2" />
                        <span className="text-[8.5px] font-black uppercase tracking-wider">All clock-ins are clear and verified.</span>
                      </div>
                    ) : (
                      attendanceExceptions.map((ex: any, idx: number) => (
                        <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800/40 rounded-xl flex justify-between items-center text-[9px]">
                          <div>
                            <span className="font-black text-slate-900 dark:text-white">{ex.name}</span>
                            <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">In: {ex.timeIn} • Out: {ex.timeOut || '-'}</p>
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border border-amber-500/10",
                            ex.status === 'Late' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                          )}>
                            {ex.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LEAVE CENTER SUB-TAB */}
          {activeSubTab === 'leave' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Leave request queue (Col span 3) */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/60 mb-3">
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  Leave Request Approvals Queue
                </h2>
                <div className="space-y-3.5">
                  {(!actionCenter.pendingLeaves || actionCenter.pendingLeaves.length === 0) ? (
                    <div className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
                      <span className="text-[9px] font-black uppercase tracking-widest block">No leave requests require operational review.</span>
                    </div>
                  ) : (
                    actionCenter.pendingLeaves.map((l: any) => (
                      <div key={l.id} className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-2xl flex justify-between items-center">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-900 dark:text-white">{l.name}</span>
                            <span className="text-[7.5px] font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">{l.dept}</span>
                          </div>
                          <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Type: {l.type} • Date: {l.date}</p>
                          <p className="text-[9.5px] text-slate-500 italic mt-1">"{l.reason}"</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleHrAction('leave', l.id, 'reject')}
                            className="px-3 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl text-[8.5px] font-black uppercase tracking-widest border border-rose-500/10 cursor-pointer transition-all active:scale-[0.98]"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleHrAction('leave', l.id, 'approve')}
                            className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer border-none transition-all active:scale-[0.98]"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Leaves today list (Col span 2) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col h-[320px]">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-3">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  Employees On Leave Today ({leavesToday.length})
                </h2>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {leavesToday.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Users className="w-6 h-6 text-slate-350 mb-2" />
                      <span className="text-[8.5px] font-black uppercase tracking-wider">No employees on leave today.</span>
                    </div>
                  ) : (
                    leavesToday.map((lt: any, idx: number) => (
                      <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-850/40 border border-slate-200/10 rounded-xl flex justify-between items-center text-[9px]">
                        <div>
                          <span className="font-black text-slate-900 dark:text-white">{lt.name}</span>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">{lt.dept} • {lt.reason}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-black uppercase text-[7px] tracking-wider">On Leave</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RECRUITMENT PIPELINE SUB-TAB */}
          {activeSubTab === 'recruitment' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Active Jobs List (Col span 3) */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/60 mb-3">
                  <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                  Active Recruitment Pipelines
                </h2>
                <div className="space-y-3">
                  {!recruitments.activeJobsList || recruitments.activeJobsList.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <Briefcase className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <span className="text-[9px] font-black uppercase tracking-widest block">No active vacancies published.</span>
                    </div>
                  ) : (
                    recruitments.activeJobsList.map((j: any, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="text-[10px] font-black text-slate-900 dark:text-white">{j.title}</span>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">{j.dept} • Posted: {new Date(j.date).toLocaleDateString()}</p>
                        </div>
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-600 font-black text-[9px] uppercase tracking-wider rounded-xl">
                          {j.applicants || 0} Applicants
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sourced/Interview stages Funnel (Col span 2) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-[320px]">
                <div>
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    ATS Application Funnel Stages
                  </h2>
                  <div className="space-y-3 mt-3 text-[9.5px]">
                    {(() => {
                      const totalSourced = recruitments.funnel?.sourced || 0;
                      const totalSourcedDenom = Math.max(1, totalSourced);
                      const interviewCount = recruitments.funnel?.interview || 0;
                      const offerCount = recruitments.funnel?.offer || 0;
                      const hiredCount = recruitments.funnel?.hired || 0;
                      
                      const interviewPct = Math.round((interviewCount / totalSourcedDenom) * 100);
                      const offerPct = Math.round((offerCount / totalSourcedDenom) * 100);
                      const hiredPct = Math.round((hiredCount / totalSourcedDenom) * 100);

                      return (
                        <>
                          <div>
                            <div className="flex justify-between font-bold text-slate-500 dark:text-slate-400 mb-1">
                              <span>Total Sourced candidates</span>
                              <span className="font-black text-slate-900 dark:text-white">{totalSourced}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between font-bold text-slate-500 dark:text-slate-400 mb-1">
                              <span>In active Interview rounds</span>
                              <span className="font-black text-slate-900 dark:text-white">{interviewCount}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${interviewPct}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between font-bold text-slate-500 dark:text-slate-400 mb-1">
                              <span>Offer negotiation letters</span>
                              <span className="font-black text-slate-900 dark:text-white">{offerCount}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${offerPct}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between font-bold text-slate-500 dark:text-slate-400 mb-1">
                              <span>Hired candidates</span>
                              <span className="font-black text-slate-900 dark:text-white">{hiredCount}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${hiredPct}%` }} />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <button 
                  onClick={() => setCurrentPage && setCurrentPage('recruitment')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-[8.5px] font-black uppercase tracking-widest text-white dark:text-slate-950 rounded-xl cursor-pointer transition-all border-none"
                >
                  Manage Jobs ATS Pipelines
                </button>
              </div>
            </div>
          )}

          {/* LIFECYCLE & ONBOARDING SUB-TAB */}
          {activeSubTab === 'lifecycle' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Onboarding Checklist Tasks (Col span 3) */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col h-[320px]">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/60 mb-3">
                  <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                  Employee Onboarding Checklists ({actionCenter.pendingOnboarding?.length || 0})
                </h2>
                <div className="flex-1 overflow-y-auto space-y-3">
                  {(!actionCenter.pendingOnboarding || actionCenter.pendingOnboarding.length === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500/60 mb-2" />
                      <span className="text-[8.5px] font-black uppercase tracking-widest block">All joiners are onboarded successfully!</span>
                    </div>
                  ) : (
                    actionCenter.pendingOnboarding.map((o: any) => (
                      <div key={o.id} className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-2xl flex justify-between items-center text-[9px]">
                        <div>
                          <span className="font-black text-slate-900 dark:text-white">{o.name}</span>
                          <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">{o.designation} • Onboarding steps pending</p>
                        </div>
                        <button 
                          onClick={() => handleHrAction('onboarding', o.id, 'approve')}
                          className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer border-none transition-all active:scale-[0.98]"
                        >
                          Verify Tasks
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Probation & Exit process logs (Col span 2) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col h-[152px]">
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Probation Review Tracking
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {probationEmployees.length === 0 ? (
                      <span className="text-[8.5px] font-bold text-slate-400 block uppercase tracking-wider py-4 text-center">No employees on probation.</span>
                    ) : (
                      probationEmployees.map((p: any, idx: number) => (
                        <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-850/40 border border-slate-200/10 rounded-xl flex justify-between items-center text-[9px]">
                          <div>
                            <span className="font-black text-slate-900 dark:text-white">{p.name}</span>
                            <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">{p.designation}</p>
                          </div>
                          <span className="text-[7.5px] font-black text-amber-600 uppercase tracking-wider">Under Review</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col h-[152px]">
                  <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                    <UserMinus className="w-3.5 h-3.5 text-rose-500" />
                    Resignation & Exit Center
                  </h2>
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {exitTrackingList.length === 0 ? (
                      <span className="text-[8.5px] font-bold text-slate-400 block uppercase tracking-wider py-4 text-center">No active exit processes.</span>
                    ) : (
                      exitTrackingList.map((ex: any, idx: number) => (
                        <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-850/40 border border-slate-200/10 rounded-xl flex justify-between items-center text-[9px]">
                          <div>
                            <span className="font-black text-slate-900 dark:text-white">{ex.name}</span>
                            <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider">{ex.department}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 font-black uppercase text-[7px] tracking-wider">{ex.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EMPLOYEE SUPPORT SUB-TAB */}
          {activeSubTab === 'support' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4">
              <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800/60 mb-3">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                Helpdesk Tickets & Escalations Center
              </h2>
              <div className="space-y-3.5">
                {(!actionCenter.pendingEscalations || actionCenter.pendingEscalations.length === 0) ? (
                  <div className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/60 mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest block">No employee escalations require attention.</span>
                  </div>
                ) : (
                  actionCenter.pendingEscalations.map((ticket: any) => (
                    <div key={ticket.id} className="p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200/10 rounded-2xl flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white">{ticket.name}</span>
                          <span className={cn(
                            "text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                            ticket.priority === 'High' || ticket.priority === 'Critical' 
                              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/15'
                              : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/15'
                          )}>
                            {ticket.priority} Priority
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-500 dark:text-slate-350 italic">Subject: "{ticket.subject}"</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleHrAction('ticket', ticket.id, 'reject')}
                          className="px-3 py-1.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl text-[8.5px] font-black uppercase tracking-widest border border-rose-500/10 cursor-pointer transition-all active:scale-[0.98]"
                        >
                          Dismiss
                        </button>
                        <button 
                          onClick={() => handleHrAction('ticket', ticket.id, 'approve')}
                          className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer border-none transition-all active:scale-[0.98]"
                        >
                          Resolve Ticket
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ENGAGEMENT SUB-TAB */}
          {activeSubTab === 'engagement' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* Satisfaction Score Progress (Col span 2) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col items-center justify-center h-[320px] text-center">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-4 self-start">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  Workforce Engagement Index
                </h2>
                
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="72" cy="72" r="62" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="8"/>
                    <circle 
                      cx="72" 
                      cy="72" 
                      r="62" 
                      className="stroke-emerald-500 fill-none transition-all duration-1000" 
                      strokeWidth="8"
                      strokeDasharray={389.56}
                      strokeDashoffset={389.56 - (389.56 * satisfactionScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{satisfactionScore}%</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Satisfaction</span>
                  </div>
                </div>

                <p className="text-[9.5px] text-slate-455 mt-4 leading-relaxed">Calculated dynamically based on employee performance logs, goal completion targets, and DSR report counts</p>
              </div>

              {/* Birthdays & Anniversaries logs (Col span 3) */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col h-[320px]">
                <h2 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-1.5 mb-3">
                  <Gift className="w-3.5 h-3.5 text-blue-500" />
                  Upcoming Team Birthdays & Anniversaries
                </h2>
                <div className="flex-1 overflow-y-auto space-y-2.5">
                  {birthdaysList.length === 0 && anniversariesList.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                      <Gift className="w-6 h-6 text-slate-300 mb-2 animate-bounce" />
                      <span className="text-[8.5px] font-black uppercase tracking-wider">No team events scheduled for this month.</span>
                    </div>
                  ) : (
                    <>
                      {birthdaysList.map((b: any, idx: number) => (
                        <div key={`dob-${idx}`} className="p-2.5 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between text-[9px]">
                          <div className="flex items-center gap-2">
                            {b.avatar ? (
                              <img src={b.avatar} className="w-6 h-6 rounded-full object-cover border border-blue-500/20" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-black uppercase text-[8px]">{b.name.charAt(0)}</div>
                            )}
                            <div>
                              <span className="font-black text-slate-900 dark:text-white">{b.name}</span>
                              <p className="text-[7.5px] text-slate-450 uppercase font-bold tracking-wider">Birthday: {new Date(b.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-black uppercase text-[7px] tracking-wider flex items-center gap-1">
                            <Gift className="w-2.5 h-2.5" />
                            Birthday
                          </span>
                        </div>
                      ))}
                      {anniversariesList.map((ann: any, idx: number) => (
                        <div key={`ann-${idx}`} className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between text-[9px]">
                          <div className="flex items-center gap-2">
                            {ann.avatar ? (
                              <img src={ann.avatar} className="w-6 h-6 rounded-full object-cover border border-emerald-500/20" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black uppercase text-[8px]">{ann.name.charAt(0)}</div>
                            )}
                            <div>
                              <span className="font-black text-slate-900 dark:text-white">{ann.name}</span>
                              <p className="text-[7.5px] text-slate-450 uppercase font-bold tracking-wider">Anniversary: {new Date(ann.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-black uppercase text-[7px] tracking-wider flex items-center gap-1">
                            <Award className="w-2.5 h-2.5" />
                            Anniversary
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="p-3 lg:p-4 max-w-7xl mx-auto space-y-3.5 min-h-screen text-slate-800 dark:text-slate-200">
      
      {/* Toast Alert Banner */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {toastMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 20 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800/80 max-w-[90vw]"
              style={{ background: '#0f172a' }}
            >
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-150/40 dark:border-slate-800/40 relative z-30">
        <div>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-1.5 mb-1"
          >
            <div className="p-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
              {company.companyName || 'HCP Index Labs'} control panel
            </span>
          </motion.div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
            {role === 'HR' ? 'HR Operations Command Center' : 'Company Command Center'}
          </h1>
          <p className="text-[10px] font-bold text-slate-400 mt-1">
            Welcome, <span className="text-emerald-600 dark:text-emerald-400 font-extrabold uppercase">{role === 'HR' ? 'HR Manager' : `${role} Admin`}</span>. System subscription is <span className="text-emerald-500 font-black">{company.status}</span> ({company.subscriptionPlan}).
          </p>
        </div>
        
        {/* Actions & Export Center */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-350 shadow-sm hover:shadow-md transition-all cursor-default">
            <Calendar className="w-2.5 h-2.5 text-emerald-500" />
            {liveDateTime || 'Loading Clock...'}
          </button>
          
          <NotificationBellDropdown onNavigate={(page) => setCurrentPage && setCurrentPage(page)} />

          {/* Export Panel Block */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 p-0.5 rounded-lg shadow-sm gap-0.5 relative">
            <div className="relative" ref={typeMenuRef}>
              <button 
                onClick={() => {
                  setIsTypeMenuOpen(!isTypeMenuOpen);
                  setIsFormatMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1 bg-transparent border-none text-[8.5px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-md cursor-pointer transition-colors"
              >
                {selectedExportType}
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>
              <AnimatePresence>
                {isTypeMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute left-0 mt-1 z-[999] min-w-[120px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-xl p-1"
                  >
                    {(['workforce', 'attendance', 'leaves', 'payroll'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setSelectedExportType(t);
                          setIsTypeMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-colors duration-150 cursor-pointer border-none",
                          selectedExportType === t 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : "text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        <span>{t}</span>
                        {selectedExportType === t && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-4 w-px bg-slate-200/40 dark:bg-slate-800/60" />

            <div className="relative" ref={formatMenuRef}>
              <button 
                onClick={() => {
                  setIsFormatMenuOpen(!isFormatMenuOpen);
                  setIsTypeMenuOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1 bg-transparent border-none text-[8.5px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-md cursor-pointer transition-colors"
              >
                {selectedExportFormat === 'csv' ? 'CSV' : selectedExportFormat === 'excel' ? 'Excel' : 'PDF'}
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>
              <AnimatePresence>
                {isFormatMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute left-0 mt-1 z-[999] min-w-[120px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl rounded-xl p-1"
                  >
                    {(['csv', 'excel', 'pdf'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => {
                          setSelectedExportFormat(fmt);
                          setIsFormatMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-colors duration-150 cursor-pointer border-none",
                          selectedExportFormat === fmt 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            : "text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        <span>{fmt === 'csv' ? 'CSV' : fmt === 'excel' ? 'Excel' : 'PDF'}</span>
                        {selectedExportFormat === fmt && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleExportReport}
              disabled={isExporting}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[8px] font-black uppercase tracking-widest transition-all disabled:opacity-75 cursor-pointer border-none ml-1 shadow-sm hover:shadow"
            >
              {isExporting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <FileDown className="w-2.5 h-2.5" />}
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex bg-slate-150/70 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/80 w-fit max-w-full overflow-x-auto scrollbar-none z-20 relative gap-1 shadow-inner print:hidden mt-2">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                "flex items-center gap-1.2 px-3 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-widest transition-all duration-350 cursor-pointer border-none whitespace-nowrap shrink-0 active:scale-[0.98]",
                isActive 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-500/15" 
                  : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/40 dark:hover:bg-slate-800/30"
              )}
            >
              <Icon className="w-3 h-3 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {isAdmin ? renderAdminDashboard() : renderHrDashboard()}

      {/* Floating AI widget at the bottom */}
      <HrAdminAiAssistant onCommandExecuted={handleCopilotCommand} />

    </div>
  );
}
