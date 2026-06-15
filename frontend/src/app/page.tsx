"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  BarChart3, Users, Clock, FileText, Briefcase, Target, CheckSquare, 
  Settings, LogOut, Menu, X, Plus, Edit2, Trash2, Search, Filter,
  Eye, Download, Calendar, MapPin, Phone, Mail, DollarSign, TrendingUp,
  AlertCircle, CheckCircle, Clock3, User, Home, ChevronDown, ChevronRight,
  Bell, ShieldCheck, UserCircle, Laptop, Megaphone, Sparkles, MessageSquare, Share2,
  HelpCircle, Network, Sun, Moon, ArrowRight, RefreshCcw, Cpu, Database, Fingerprint, KeyRound, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useLeaveStore } from '@/store/leaveStore';
import { useJobStore } from '@/store/jobStore';
import { useBrandingStore } from '@/store/useBrandingStore';
import { useChatStore } from '@/store/chatStore';
import { useSystemNotificationStore } from '@/store/useSystemNotificationStore';

import { LoginPage, SignupPage, ForgotPasswordPage, AcceptInvitePage } from '@/features/auth';

// Admin Feature Imports
import DashboardPage from '@/features/admin/dashboard/component';
import SettingsPage from '@/features/admin/settings/component';
import { AssetsPage } from '@/features/admin/assets/component';
import { AnnouncementsPage } from '@/features/admin/announcements/component';
import { AuditLogsPage } from '@/features/admin/auditlogs/component';
import { RolesPermissionsPage } from '@/features/admin/permissions/component';

// HR Feature Imports
import AttendancePage from '@/features/hr/attendance/component';
import EmployeeManagementPage from '@/features/admin/employees/component';
import LeaveManagementPage from '@/features/hr/leave/component';
import PayrollPage from '@/features/hr/payroll/component';
import PerformancePage from '@/features/hr/performance/component';
import RecruitmentPage from '@/features/hr/recruitment/component';
import ReportsPage from '@/features/hr/reports/component';

// Employee Feature Imports
import EmployeeDashboard from '@/features/employee/dashboard/component';

// Feed, Messages, Copilot Imports
import CommunityFeed from '@/features/employee/feed/component';
import WorkplaceChat from '@/features/employee/messages/component';
import HelpDeskPage from '@/features/helpdesk/component';
import OrgChartPage from '@/features/orgchart/component';

// Daily Updates DSR Imports
import DailyUpdatesManagement from '@/features/hr/daily-updates/component';
import DailyUpdatesAnalytics from '@/features/admin/daily-updates/component';
import ChatbotWidget from '@/features/chatbot/ChatbotWidget';

const SidebarItem = ({
  icon: Icon,
  label,
  page,
  roles,
  currentPage,
  userRole,
  isMobile,
  sidebarOpen,
  setCurrentPage,
  setSidebarOpen,
  badge,
}: {
  icon: any;
  label: string;
  page: string;
  roles?: string[];
  currentPage: string;
  userRole: string;
  isMobile: boolean;
  sidebarOpen: boolean;
  setCurrentPage: (p: string) => void;
  setSidebarOpen: (v: boolean) => void;
  badge?: number | boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const allowedRoles = roles || ['Admin', 'HR', 'Employee'];
  if (!allowedRoles.includes(userRole)) return null;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => {
        setCurrentPage(page);
        if (isMobile) setSidebarOpen(false);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "w-full flex items-center transition-all duration-300 ease-out group relative hover:translate-x-1 active:scale-[0.98]",
        sidebarOpen ? "gap-3 px-3 py-2.5 rounded-xl" : "p-2.5 justify-center mb-0.5 rounded-xl",
        currentPage === page
          ? "saas-sidebar-item-active"
          : "saas-sidebar-item hover:bg-[var(--sidebar-hover)]"
      )}
    >
      <div className="relative flex-shrink-0">
        {(() => {
          const iconColorMap: Record<string, string> = {
            dashboard: '#3b82f6',      // blue-500
            employees: '#10b981',      // emerald-500
            attendance: '#6366f1',     // indigo-500
            leaves: '#f43f5e',         // rose-500
            'daily-updates': '#f59e0b', // amber-500
            messages: '#14b8a6',       // teal-500
            helpdesk: '#8b5cf6',       // violet-500
            orgchart: '#d946ef',       // fuchsia-500
            payroll: '#10b981',        // emerald-500
            recruitment: '#ec4899',    // pink-500
            performance: '#0ea5e9',    // sky-500
            announcements: '#f97316',  // orange-500
            feed: '#06b6d4',           // cyan-500
            settings: '#64748b',       // slate-500
            assets: '#eab308',         // yellow-500
            reports: '#2563eb',        // blue-600
            auditlogs: '#ef4444',      // red-500
            permissions: '#7c3aed'     // violet-600
          };
          const iconHex = iconColorMap[page] || '#3b82f6';
          const isCurrent = currentPage === page;
          return (
            <Icon 
              className={cn(
                "w-4.5 h-4.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                isCurrent 
                  ? "text-blue-600 dark:text-white opacity-100" 
                  : "opacity-80 group-hover:opacity-100"
              )}
              stroke={isCurrent ? 'currentColor' : iconHex}
            />
          );
        })()}
        {badge && (!sidebarOpen || typeof badge === 'boolean') && (
          <span className="absolute -top-1.5 -right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </div>
      {sidebarOpen && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-semibold text-[12px] whitespace-nowrap tracking-tight transition-transform duration-300 group-hover:translate-x-0.5"
        >
          {label}
        </motion.span>
      )}

      {sidebarOpen && badge && typeof badge === 'number' && (
        <span className="ml-auto inline-flex items-center justify-center px-1.5 py-0.5 text-[8px] font-black leading-none text-white bg-rose-500 rounded-full min-w-[14px]">
          {badge}
        </span>
      )}

      {mounted && createPortal(
        <AnimatePresence>
          {!isMobile && !sidebarOpen && isHovered && coords && (
            <div 
              className="fixed left-[96px] z-[90] pointer-events-none"
              style={{ 
                top: `${coords.top}px`,
                transform: 'translateY(-50%)'
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -15, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -15, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="px-3 py-1.5 border border-slate-750 rounded-xl shadow-xl text-[10px] font-semibold whitespace-nowrap flex items-center gap-1.5"
                style={{ background: '#0f172a', color: '#fff' }}
              >
                {label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4" style={{ borderRightColor: '#0f172a' }} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {currentPage === page && (
        <div className="absolute left-0 w-[3px] h-4 bg-blue-500 dark:bg-blue-400 rounded-r-full" />
      )}
    </button>
  );
};

export default function HRManagementSystem() {
  const [mounted, setMounted] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'signup' | 'forgot'>('login');
  const [prefilledEmail, setPrefilledEmail] = useState('');
  const [prefilledCompany, setPrefilledCompany] = useState('');
  const [prefilledCompanyCode, setPrefilledCompanyCode] = useState('');
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [initialSignupStep, setInitialSignupStep] = useState<1 | 2 | 3>(1);
  const [welcomeInfo, setWelcomeInfo] = useState<{ userName: string; companyName: string } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState("Initializing secure session...");
  
  // Zustand State hooks
  const { 
    token, 
    isAuthenticated, 
    userRole, 
    profile, 
    setIsAuthenticated, 
    setUserRole, 
    setProfile, 
    logout 
  } = useAuthStore();

  const { 
    sidebarOpen, 
    isMobile, 
    currentPage, 
    showToast, 
    setSidebarOpen, 
    setIsMobile, 
    setCurrentPage, 
    triggerToast, 
    clearToast 
  } = useUIStore();

  const { leaves, setLeaves: setLeavesRaw } = useLeaveStore();
  const { jobs, setJobs: setJobsRaw } = useJobStore();
  const { branding, fetchBranding } = useBrandingStore();

  // Chat Zustand state hooks
  const {
    initSocket,
    disconnectSocket,
    loadConversations,
    loadNotifications,
    notifications,
    activeConversationId,
    markNotificationsRead,
  } = useChatStore();

  const totalUnreadMessages = notifications.length;

  // System Notifications state hooks
  const {
    notifications: systemNotifications,
    fetchNotifications: fetchSystemNotifications,
    markRead: markSystemNotificationRead,
    markAllRead: markAllSystemNotificationsRead,
  } = useSystemNotificationStore();

  // Connect socket and load conversations/notifications globally on auth
  useEffect(() => {
    if (isAuthenticated && token) {
      initSocket(token);
      loadConversations();
      loadNotifications();
      fetchSystemNotifications();
    }
    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, token, initSocket, loadConversations, loadNotifications, disconnectSocket, fetchSystemNotifications]);

  // Mark active conversation notifications read when opening Workplace Chat
  useEffect(() => {
    if (currentPage === 'messages' && activeConversationId) {
      const id = activeConversationId;
      const isDm = !id.includes(':') && id.includes('|');
      if (isDm) {
        const parts = id.split('|');
        const currentUserEmail = profile?.email || '';
        const partnerEmail = parts.find(p => p.toLowerCase().trim() !== currentUserEmail.toLowerCase().trim()) || parts[0];
        markNotificationsRead(undefined, partnerEmail);
      } else {
        markNotificationsRead(id);
      }
    }
  }, [currentPage, activeConversationId, profile?.email, markNotificationsRead]);

  const setLeaves = (value: any) => {
    if (typeof value === 'function') {
      setLeavesRaw(value(leaves));
    } else {
      setLeavesRaw(value);
    }
  };

  const setJobs = (value: any) => {
    if (typeof value === 'function') {
      setJobsRaw(value(jobs));
    } else {
      setJobsRaw(value);
    }
  };
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('hr_system_dark_mode');
      return stored === null ? true : stored === 'true';
    }
    return true;
  });

  const toggleTheme = (useDark: boolean) => {
    setIsDarkMode(useDark);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', useDark);
      localStorage.setItem('hr_system_dark_mode', String(useDark));
    }
    
    // Save to server database if authenticated
    if (isAuthenticated) {
      const savedToken = localStorage.getItem('hr_system_token');
      if (savedToken) {
        fetch('/api/settings/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${savedToken}`
          },
          body: JSON.stringify({
            appearance: {
              themeMode: useDark ? 'Dark' : 'Light'
            }
          })
        }).catch(err => console.error("Failed to auto-save theme mode:", err));
      }
    }
  };

  // Global Notification Settings
  const [notifSettings, setNotifSettings] = useState({
    email: true,
    push: true,
    sms: false,
    payroll: true,
    recruitment: false
  });

  const addNotification = (message: string) => {
    triggerToast(message);

    if (profile && profile.email) {
      fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, message })
      })
      .then(res => {
        if (!res.ok) console.warn('[Notification_Email_Dispatch] Server returned status', res.status);
      })
      .catch(err => console.error('[Notification_Email_Dispatch] Failed to send email:', err));
    }
  };

  const [liveTime, setLiveTime] = useState({ date: '', time: '' });

  // Sync state settings on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchBranding();
    }
  }, [isAuthenticated, fetchBranding]);

  useEffect(() => {
    const savedToken = localStorage.getItem('hr_system_token');
    const storedAuth = localStorage.getItem('hr_system_auth') === 'true';
    
    if (storedAuth && !savedToken) {
      setIsAuthenticated(false);
    }
    
    const storedPage = localStorage.getItem('hr_system_page') || 'dashboard';
    setCurrentPage(storedPage);
    
    const storedRole = localStorage.getItem('hr_system_role') || 'HR';
    setUserRole(storedRole);

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const emailParam = params.get('email');
    const companyParam = params.get('company');
    const companyCodeParam = params.get('companyCode');
    const inviteTokenParam = params.get('token');
    
    if (mode === 'signup') {
      setAuthScreen('signup');
      if (emailParam) setPrefilledEmail(emailParam);
      if (companyParam) setPrefilledCompany(companyParam);
      if (companyCodeParam) setPrefilledCompanyCode(companyCodeParam);
    } else if (mode === 'accept-invite' && inviteTokenParam) {
      setInviteToken(inviteTokenParam);
    }

    setMounted(true);

    if (typeof window !== 'undefined') {
      window.alert = (message: string) => {
        let type: 'success' | 'error' | 'info' | 'warning' = 'info';
        const lower = (message || '').toLowerCase();
        if (
          lower.includes('error') || 
          lower.includes('failed') || 
          lower.includes('insufficient') ||
          lower.includes('already exists') ||
          lower.includes('invalid') ||
          lower.includes('prevented') ||
          lower.includes('unable')
        ) {
          type = 'error';
        } else if (
          lower.includes('success') || 
          lower.includes('saved') || 
          lower.includes('uploaded') ||
          lower.includes('thank you') ||
          lower.includes('completed')
        ) {
          type = 'success';
        } else if (lower.includes('please') || lower.includes('warning') || lower.includes('attention')) {
          type = 'warning';
        }
        
        useUIStore.getState().triggerToast(message, type);
      };
    }

    const updateTime = () => {
      const now = new Date();
      setLiveTime({
        date: now.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        time: now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (welcomeInfo) {
      setLoadingStatus("Securing session...");
      
      const t1 = setTimeout(() => {
        setLoadingStatus("Synchronizing workspace...");
      }, 1000);

      const t2 = setTimeout(() => {
        setLoadingStatus("Preparing dashboard...");
      }, 2000);

      const t3 = setTimeout(() => {
        setWelcomeInfo(null);
      }, 3000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [welcomeInfo]);

  // Fetch user settings to sync theme mode
  useEffect(() => {
    if (isAuthenticated) {
      const savedToken = localStorage.getItem('hr_system_token');
      if (savedToken) {
        fetch('/api/settings/user', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${savedToken}`
          }
        })
        .then(res => {
          if (res.ok) return res.json();
        })
        .then(data => {
          if (data && data.settings && data.settings.appearance) {
            const serverTheme = data.settings.appearance.themeMode; // 'Dark' or 'Light'
            const isDark = serverTheme !== 'Light';
            setIsDarkMode(isDark);
            if (typeof window !== 'undefined') {
              document.documentElement.classList.toggle('dark', isDark);
              localStorage.setItem('hr_system_dark_mode', String(isDark));
            }
          } else {
            setIsDarkMode(true);
            if (typeof window !== 'undefined') {
              document.documentElement.classList.add('dark');
              localStorage.setItem('hr_system_dark_mode', 'true');
            }
          }
        })
        .catch(err => console.error("Error syncing theme settings on mount:", err));
      }
    }
  }, [isAuthenticated]);

  // Sync settings/pages to storage when mounted changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('hr_system_auth', String(isAuthenticated));
    }
  }, [isAuthenticated, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('hr_system_role', userRole);
    }
  }, [userRole, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('hr_system_page', currentPage);
    }
  }, [currentPage, mounted]);

  // Guard admin/hr only pages from employee role
  useEffect(() => {
    if (mounted && userRole === 'Employee') {
      const adminHrOnlyPages = ['employees', 'assets', 'auditlogs', 'permissions', 'reports'];
      if (adminHrOnlyPages.includes(currentPage)) {
        setCurrentPage('dashboard');
      }
    }
  }, [userRole, currentPage, mounted, setCurrentPage]);

  // Sync Leaves from API
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchAndSyncLeaves = () => {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      fetch(`/api/leaves?t=${Date.now()}`, { cache: 'no-store', headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setLeaves(data);
          }
        })
        .catch(err => console.warn("Could not sync leaves:", err.message));
    };

    fetchAndSyncLeaves();
    const interval = setInterval(fetchAndSyncLeaves, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Sync detailed profile
  useEffect(() => {
    if (isAuthenticated && profile.email) {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      fetch(`/api/employees?email=${encodeURIComponent(profile.email)}`, { headers })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setProfile({
              id: data._id,
              name: data.fullName,
              email: data.email,
              phone: data.phone || '',
              location: data.location || '',
              empId: data._id ? `EMP-${data._id.substring(data._id.length - 4).toUpperCase()}` : 'EMP-2026-NEW',
              joined: data.joinedDate ? new Date(data.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'May 2026',
              dept: data.department || '',
              role: data.designation || '',
              emergencyContact: data.emergencyContact || '',
              bankName: data.bankName || '',
              accountNumber: data.accountNumber || '',
              ifscCode: data.ifscCode || '',
              profilePicture: data.profilePicture || '',
              maxLeaves: data.maxLeaves,
            });
          }
        })
        .catch(err => console.warn("Error fetching profile details:", err.message));
    }
  }, [isAuthenticated, profile.email]);

  // Fetch and sync Jobs
  useEffect(() => {
    const savedJobs = localStorage.getItem('hr_system_jobs');
    if (savedJobs) {
      try {
        setJobs(JSON.parse(savedJobs));
      } catch (e) {
        console.warn("Failed to parse saved jobs", e);
      }
    }

    if (!isAuthenticated) return;

    const fetchAndSyncJobs = () => {
      const savedToken = localStorage.getItem('hr_system_token') || token;
      const headers: HeadersInit = {};
      if (savedToken) {
        headers['Authorization'] = `Bearer ${savedToken}`;
      }
      fetch('/api/jobs', { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setJobs(data);
          }
        })
        .catch(err => console.warn("Error fetching jobs:", err.message));
    };

    fetchAndSyncJobs();
    const interval = setInterval(fetchAndSyncJobs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  // Save jobs
  useEffect(() => {
    if (mounted && jobs.length > 0) {
      localStorage.setItem('hr_system_jobs', JSON.stringify(jobs));
    }
  }, [jobs, mounted]);

  // Sync profile and settings
  useEffect(() => {
    const savedProfile = localStorage.getItem('hr_system_profile');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    
    const savedSettings = localStorage.getItem('hr_system_notif_settings');
    if (savedSettings) setNotifSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('hr_system_profile', JSON.stringify(profile));
    }
  }, [profile, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('hr_system_notif_settings', JSON.stringify(notifSettings));
    }
  }, [notifSettings, mounted]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(currentPage !== 'chat');
    }
  }, [currentPage, isMobile]);

  const handleLogin = (role: string, userObj?: any) => {
    setUserRole(role);
    setIsAuthenticated(true);
    if (userObj) {
      const company = userObj.companyName || 'Corporate';
      setProfile({
        name: userObj.fullName || profile.name,
        email: userObj.email || profile.email,
        companyName: company,
      });
      setWelcomeInfo({
        userName: userObj.fullName || 'User',
        companyName: company,
      });
    } else {
      setWelcomeInfo({
        userName: 'User',
        companyName: 'HR Core HRMS',
      });
    }
  };

  const handleLogout = () => {
    logout();
    setAuthScreen('login');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        {inviteToken ? (
          <AcceptInvitePage 
            token={inviteToken}
            onSuccess={() => {
              setInviteToken(null);
              const url = new URL(window.location.href);
              url.searchParams.delete('mode');
              url.searchParams.delete('token');
              window.history.replaceState({}, '', url.pathname + url.search);
              setAuthScreen('login');
            }}
            onBackToLogin={() => {
              setInviteToken(null);
              const url = new URL(window.location.href);
              url.searchParams.delete('mode');
              url.searchParams.delete('token');
              window.history.replaceState({}, '', url.pathname + url.search);
              setAuthScreen('login');
            }}
          />
        ) : authScreen === 'login' ? (
          <LoginPage 
            onLogin={handleLogin} 
            onSwitchToSignup={() => {
              setInitialSignupStep(1);
              setAuthScreen('signup');
            }} 
            onSwitchToForgot={() => setAuthScreen('forgot')} 
            onUnverifiedUser={(email) => {
              setPrefilledEmail(email);
              setInitialSignupStep(3);
              setAuthScreen('signup');
            }}
          />
        ) : authScreen === 'forgot' ? (
          <ForgotPasswordPage onSwitchToLogin={() => setAuthScreen('login')} />
        ) : (
          <SignupPage 
            onSignup={() => setAuthScreen('login')} 
            onSwitchToLogin={() => setAuthScreen('login')} 
            prefilledEmail={prefilledEmail}
            prefilledCompany={prefilledCompany}
            prefilledCompanyCode={prefilledCompanyCode}
            initialStep={initialSignupStep}
          />
        )}
      </div>
    );
  }

  const sidebarItemProps = { currentPage, userRole, isMobile, sidebarOpen, setCurrentPage, setSidebarOpen };

  return (
    <div className="fixed inset-0 flex h-screen w-screen overflow-hidden font-sans bg-transparent p-3 md:p-4 gap-3 md:gap-4">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isMobile ? (sidebarOpen ? '240px' : '0px') : (sidebarOpen ? 240 : 72),
          x: isMobile && !sidebarOpen ? -240 : 0
        }}
        className={cn(
          "flex h-full min-h-0 flex-col bg-[var(--sidebar-bg)] backdrop-blur-md border border-[var(--sidebar-border)] text-[var(--sidebar-fg)] transition-colors duration-300 z-[150] rounded-3xl shadow-sm",
          isMobile ? "fixed inset-y-3 left-3 h-[calc(100vh-24px)] shadow-2xl overflow-hidden" : "overflow-visible"
        )}
      >
        <div className={cn("p-4 flex items-center shrink-0 relative", sidebarOpen ? "justify-between" : "justify-center")}>
          {sidebarOpen ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              {branding.companyLogo ? (
                <img src={branding.companyLogo} alt="Logo" className="h-7 max-w-[70px] object-contain shrink-0" />
              ) : (
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                  <Target className="w-4.5 h-4.5 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-xs font-black text-[var(--sidebar-fg)] tracking-tight leading-none uppercase truncate max-w-[140px]">
                  {branding.companyShortName || branding.companyName || 'HR Core'}
                </h1>
                <p className="text-[7.5px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1 leading-none">{userRole} PANEL</p>
              </div>
            </motion.div>
          ) : (
            <button 
              onClick={() => setSidebarOpen(true)}
              onMouseEnter={() => setIsMenuHovered(true)}
              onMouseLeave={() => setIsMenuHovered(false)}
              className="w-8.5 h-8.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md shrink-0 border border-slate-700/50 relative"
            >
              <Menu className="w-4.5 h-4.5" />
              <AnimatePresence>
                {!isMobile && isMenuHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: -15, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -15, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="fixed left-[96px] z-[90] px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl text-[8.5px] font-black uppercase tracking-widest text-white whitespace-nowrap pointer-events-none flex items-center gap-1.5"
                  >
                    Expand Menu
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-950" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          )}
          {sidebarOpen && !isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          {isMobile && sidebarOpen && (
             <button 
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className={cn(
          "flex-1 mt-4 px-4 space-y-1 min-h-0 overflow-y-auto no-scrollbar",
          isMobile && !sidebarOpen && "hidden"
        )}>
          {userRole === 'Employee' ? (
            <div className="py-2 border-t border-slate-200 dark:border-slate-800/40 first:border-t-0">
              {sidebarOpen ? (
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 mb-2 mt-1">
                  Employee Menu
                </p>
              ) : (
                <div className="h-px bg-slate-200 dark:bg-slate-800/50 my-2 mx-2" />
              )}
              <SidebarItem icon={Home} label="Overview" page="dashboard" {...sidebarItemProps} />
              <SidebarItem icon={Clock} label="Attendance Hub" page="attendance" {...sidebarItemProps} />
              <SidebarItem icon={FileText} label="Leaves" page="leaves" {...sidebarItemProps} />
              <SidebarItem icon={FileText} label="Daily Status Reports" page="daily-updates" {...sidebarItemProps} />
              <SidebarItem icon={MessageSquare} label="Workplace Chat" page="messages" badge={totalUnreadMessages > 0 ? totalUnreadMessages : undefined} {...sidebarItemProps} />
              <SidebarItem icon={HelpCircle} label="Help Desk" page="helpdesk" {...sidebarItemProps} />
              <SidebarItem icon={Network} label="Org Chart" page="orgchart" {...sidebarItemProps} />
              <SidebarItem icon={DollarSign} label="Payroll & Slips" page="payroll" {...sidebarItemProps} />
              <SidebarItem icon={Briefcase} label="Careers & Referrals" page="recruitment" {...sidebarItemProps} />
              <SidebarItem icon={Target} label="Performance" page="performance" {...sidebarItemProps} />
              <SidebarItem icon={Megaphone} label="Announcements" page="announcements" {...sidebarItemProps} />
              <SidebarItem icon={Share2} label="Company Feed" page="feed" {...sidebarItemProps} />
              <SidebarItem icon={Settings} label="Settings" page="settings" {...sidebarItemProps} />
            </div>
          ) : (
            <>
              <div className="py-2 border-t border-slate-200 dark:border-slate-800/40 first:border-t-0">
                {sidebarOpen ? (
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 mb-2 mt-1">
                    Main Menu
                  </p>
                ) : (
                  <div className="h-px bg-slate-200 dark:bg-slate-800/50 my-2 mx-2" />
                )}
                <SidebarItem icon={Home} label="Dashboard" page="dashboard" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={Users} label="Employees" page="employees" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={Clock} label="Attendance" page="attendance" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={FileText} label="Leaves" page="leaves" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={FileText} label="Daily Status Reports" page="daily-updates" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={MessageSquare} label="Workplace Chat" page="messages" roles={['Admin', 'HR']} badge={totalUnreadMessages > 0 ? totalUnreadMessages : undefined} {...sidebarItemProps} />
                <SidebarItem icon={HelpCircle} label="Help Desk" page="helpdesk" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={Network} label="Org Chart" page="orgchart" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={Share2} label="Company Feed" page="feed" roles={['Admin', 'HR']} {...sidebarItemProps} />
              </div>

              <div className="py-2 border-t border-slate-200 dark:border-slate-800/40">
                {sidebarOpen ? (
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 mb-2 mt-1">
                    Management
                  </p>
                ) : (
                  <div className="h-px bg-slate-200 dark:bg-slate-800/50 my-2 mx-2" />
                )}
                <SidebarItem icon={DollarSign} label="Payroll" page="payroll" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={Briefcase} label="Recruitment" page="recruitment" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={Target} label="Performance" page="performance" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={Laptop} label="Assets" page="assets" roles={['Admin', 'HR']} {...sidebarItemProps} />
              </div>

              <div className="py-2 border-t border-slate-200 dark:border-slate-800/40">
                {sidebarOpen ? (
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 mb-2 mt-1">
                    Insights
                  </p>
                ) : (
                  <div className="h-px bg-slate-200 dark:bg-slate-800/50 my-2 mx-2" />
                )}
                <SidebarItem icon={BarChart3} label="Reports & Insights" page="reports" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={Megaphone} label="Announcements" page="announcements" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={Settings} label="Settings" page="settings" roles={['Admin', 'HR']} {...sidebarItemProps} />
                <SidebarItem icon={ShieldCheck} label="Audit Trail" page="auditlogs" roles={['Admin']} {...sidebarItemProps} />
                <SidebarItem icon={ShieldCheck} label="Permissions" page="permissions" roles={['Admin']} {...sidebarItemProps} />
              </div>
            </>
          )}
        </nav>

        <div className={cn("p-3 border-t border-[var(--sidebar-border)] shrink-0 space-y-2.5", isMobile && !sidebarOpen && "hidden")}>

          {/* User Profile Card */}
          <div 
            className={cn(
              "flex items-center rounded-2xl transition-all duration-300 border backdrop-blur-md relative group/profile shadow-sm cursor-pointer",
              sidebarOpen 
                ? "px-2.5 py-1.5 gap-2.5 bg-gradient-to-r from-slate-50/50 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-950/40 border-slate-200/40 dark:border-slate-800/60 hover:border-blue-500/30 dark:hover:border-blue-500/25 hover:shadow-md hover:-translate-y-0.5 hover:bg-slate-100/80 dark:hover:bg-slate-900/80" 
                : "p-1.5 justify-center bg-slate-50/30 dark:bg-slate-900/20 border-slate-105/40 dark:border-slate-805/40 hover:border-blue-500/30 dark:hover:border-blue-500/25 hover:-translate-y-0.5 hover:bg-slate-100/80 dark:hover:bg-slate-900/80"
            )}
          >
             <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-850 flex items-center justify-center overflow-hidden shrink-0 relative shadow-inner border border-slate-200/10 dark:border-slate-800/40">
               <img 
                 src={profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || 'Admin'}`} 
                 alt="User" 
                 className="w-full h-full object-cover transition-transform duration-300 group-hover/profile:scale-110" 
               />
               <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900 animate-pulse" />
             </div>
             {sidebarOpen && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-[10px] font-black text-slate-800 dark:text-slate-100 truncate leading-none mb-1">{profile.name || "Administrator"}</p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400 text-[7px] font-black uppercase tracking-wider leading-none border border-blue-500/15">
                    {userRole}
                  </span>
                </div>
             )}
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            onMouseEnter={() => setIsLogoutHovered(true)}
            onMouseLeave={() => setIsLogoutHovered(false)}
            className={cn(
              "w-full flex items-center text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl transition-all duration-200 relative border-none cursor-pointer active:scale-[0.98] group/logout",
              sidebarOpen ? "px-2.5 py-2 gap-3" : "p-2 justify-center"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover/logout:translate-x-1" />
            {sidebarOpen && <span className="font-black text-[8.5px] uppercase tracking-widest">Logout</span>}
            <AnimatePresence>
              {!isMobile && !sidebarOpen && isLogoutHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -15, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -15, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="fixed left-[96px] z-[90] px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl text-[8.5px] font-black uppercase tracking-widest text-white whitespace-nowrap pointer-events-none flex items-center gap-1.5"
                >
                  Logout
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-950" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Toast Notification — rendered via portal to escape overflow-hidden */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showToast && (() => {
            const toastMessage = typeof showToast === 'string' ? showToast : showToast.message;
            const toastType = typeof showToast === 'string' ? 'info' : (showToast.type || 'info');
            
            const toastConfig = {
              success: {
                bg: 'bg-emerald-950/95 border-emerald-500/30 text-emerald-100',
                icon: CheckCircle,
                iconColor: 'text-emerald-400'
              },
              error: {
                bg: 'bg-rose-950/95 border-rose-500/30 text-rose-100',
                icon: AlertCircle,
                iconColor: 'text-rose-400'
              },
              warning: {
                bg: 'bg-amber-950/95 border-amber-500/30 text-amber-100',
                icon: AlertCircle,
                iconColor: 'text-amber-400'
              },
              info: {
                bg: 'bg-slate-900/95 border-slate-800/80 text-slate-100',
                icon: Sparkles,
                iconColor: 'text-blue-400'
              }
            }[toastType] || {
              bg: 'bg-slate-900/95 border-slate-800/80 text-slate-100',
              icon: Sparkles,
              iconColor: 'text-blue-400'
            };

            const IconComp = toastConfig.icon;

            return (
              <motion.div 
                initial={{ opacity: 0, y: -40, scale: 0.9, x: '-50%' }}
                animate={{ opacity: 1, y: 20, scale: 1, x: '-50%' }}
                exit={{ opacity: 0, y: -40, scale: 0.9, x: '-50%' }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className={cn(
                  "fixed top-0 left-1/2 z-[9999] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md max-w-[90vw] transition-all",
                  toastConfig.bg
                )}
              >
                <IconComp className={cn("w-4.5 h-4.5 shrink-0", toastConfig.iconColor, toastType === 'info' && "animate-pulse")} />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{toastMessage}</span>
              </motion.div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}

      <main className={cn(
        "flex-1 min-w-0 flex h-full min-h-0 flex-col justify-start bg-transparent dark:bg-transparent relative transition-colors duration-300",
        ['messages', 'helpdesk', 'orgchart'].includes(currentPage) ? "overflow-hidden" : "overflow-auto",
        "rounded-3xl border border-[var(--sidebar-border)] shadow-sm"
      )}>
        {/* Subtle top-edge highlight — light: none, dark: blue tint */}
        <div className="absolute top-0 left-0 right-0 h-px bg-[var(--border)] pointer-events-none" />
        
        {/* Mobile Header */}
        <div className={cn(
          "lg:hidden flex items-center justify-between p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 relative z-20"
        )}>
          <div className="flex items-center gap-3">
            {branding.companyLogo ? (
              <img src={branding.companyLogo} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
            )}
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
              {branding.companyShortName || branding.companyName || 'HR Core'}
            </h1>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className={cn("relative z-10 min-h-0 w-full", currentPage === 'messages' ? "flex-1 flex flex-col h-full" : "")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn("w-full", currentPage === 'messages' ? "flex-1 flex flex-col min-h-0" : "")}
            >
              {userRole === 'Employee' && [
                'dashboard', 'attendance', 'leaves', 'payroll', 'recruitment',
                'performance', 'profile', 'announcements', 'daily-updates'
              ].includes(currentPage) ? (
                <EmployeeDashboard 
                  activeTab={currentPage === 'dashboard' ? 'overview' : currentPage}
                  setActiveTab={(tab: string) => {
                    setCurrentPage(tab === 'overview' ? 'dashboard' : tab);
                  }}
                  leaves={leaves} 
                  setLeaves={setLeaves} 
                  addNotification={addNotification}
                  profile={profile}
                  jobs={jobs}
                  setJobs={setJobs}
                />
              ) : (
                <>
                   {currentPage === 'dashboard' && (userRole === 'Admin' || userRole === 'HR') && <DashboardPage role={userRole} setCurrentPage={setCurrentPage} />}
                   {currentPage === 'employees' && (userRole === 'Admin' || userRole === 'HR') && <EmployeeManagementPage />}
                   {currentPage === 'attendance' && <AttendancePage userRole={userRole} profile={profile} />}
                   {currentPage === 'leaves' && <LeaveManagementPage leaves={leaves} setLeaves={setLeaves} userRole={userRole} addNotification={addNotification} profile={profile} />}
                   {currentPage === 'payroll' && <PayrollPage userRole={userRole} profile={profile} />}
                   {currentPage === 'recruitment' && <RecruitmentPage jobs={jobs} setJobs={setJobs} />}
                   {currentPage === 'performance' && <PerformancePage />}
                   {currentPage === 'assets' && (userRole === 'Admin' || userRole === 'HR') && <AssetsPage />}
                   {currentPage === 'announcements' && <AnnouncementsPage userRole={userRole} />}
                   {currentPage === 'auditlogs' && userRole === 'Admin' && <AuditLogsPage />}
                   {currentPage === 'permissions' && userRole === 'Admin' && <RolesPermissionsPage />}
                   {currentPage === 'daily-updates' && (userRole === 'Admin' || userRole === 'HR') && (
                      userRole === 'HR' 
                        ? <DailyUpdatesManagement addNotification={addNotification} />
                        : <DailyUpdatesAnalytics addNotification={addNotification} />
                    )}
                   {currentPage === 'feed' && <CommunityFeed profile={profile} addNotification={addNotification} />}
                   {currentPage === 'messages' && <WorkplaceChat profile={profile} addNotification={addNotification} />}
                   {currentPage === 'helpdesk' && <HelpDeskPage userRole={userRole} profile={profile} addNotification={addNotification} />}
                   {currentPage === 'orgchart' && <OrgChartPage userRole={userRole} profile={profile} addNotification={addNotification} />}
                   {currentPage === 'reports' && (userRole === 'Admin' || userRole === 'HR') && <ReportsPage />}

                  {currentPage === 'settings' && (
                    <SettingsPage 
                      userRole={userRole as any} 
                      setUserRole={setUserRole as any} 
                      addNotification={addNotification} 
                      profile={profile}
                      setProfile={setProfile}
                      notifications={notifSettings}
                      setNotifications={setNotifSettings}
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Premium Welcome Overlay */}
      <AnimatePresence>
        {welcomeInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xl"
          >
            {/* Ambient glowing background circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
              <motion.div 
                animate={{
                  scale: [1, 1.1, 0.95, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[100px]" 
              />
              <motion.div 
                animate={{
                  scale: [1, 0.9, 1.05, 1],
                  opacity: [0.3, 0.4, 0.3],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/20 rounded-full blur-[120px]" 
              />
            </div>

            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="relative w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] p-8 md:p-10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] text-center overflow-hidden"
            >
              {/* Top accent line */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ 
                  background: `linear-gradient(90deg, transparent, ${branding.primaryColor || '#2563eb'}, ${branding.secondaryColor || '#4f46e5'}, transparent)`,
                  boxShadow: `0 2px 20px ${(branding.primaryColor || '#2563eb')}80`
                }}
              />

              {/* Grid backdrop overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-40" />

              <div className="relative z-10 flex flex-col items-center">
                
                {/* Secure Badge */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full mb-6"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-450 rounded-full animate-pulse" />
                  <span className="text-[8.5px] font-black uppercase tracking-[0.15em] text-emerald-400">Secure Session Authorized</span>
                </motion.div>

                {/* Company Logo or Monogram Icon */}
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.2, damping: 20 }}
                  className="mb-6 relative"
                >
                  {/* Glowing logo ring */}
                  <div 
                    className="absolute -inset-3 rounded-3xl opacity-20 blur-md animate-pulse"
                    style={{ 
                      background: `linear-gradient(135deg, ${branding.primaryColor || '#2563eb'}, ${branding.secondaryColor || '#4f46e5'})`,
                      animationDuration: '3s'
                    }}
                  />
                  {branding.companyLogo ? (
                    <div className="p-4 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 shadow-xl flex items-center justify-center min-w-[80px] min-h-[80px] max-w-[140px] relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      <img src={branding.companyLogo} alt="Logo" className="max-h-12 w-auto object-contain relative z-10 filter drop-shadow-md" />
                    </div>
                  ) : (
                    <div 
                      className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--primary,#2563eb)] to-[var(--secondary-accent,#4f46e5)] flex items-center justify-center text-3xl font-black text-white shadow-2xl border border-white/15 relative"
                      style={{ 
                        boxShadow: `0 10px 30px -5px ${(branding.primaryColor || '#2563eb')}50`
                      }}
                    >
                      <div className="absolute inset-0 bg-white/10 rounded-2xl" />
                      <span className="relative z-10 font-sans tracking-wide">
                        {(welcomeInfo.companyName || 'C').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Greeting Message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-1"
                >
                  <span className="text-[9px] font-black text-slate-500 tracking-[0.25em] block uppercase">
                    ENVIRONMENT ACTIVE // HELLO
                  </span>
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    {welcomeInfo.userName}
                  </h3>
                </motion.div>

                {/* Welcome To [Company Name] Header */}
                <motion.h1 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-300 leading-tight mt-4 mb-6 max-w-[320px] mx-auto"
                >
                  Welcome to <br />
                  <span 
                    className="bg-gradient-to-r bg-clip-text text-transparent font-extrabold text-2xl sm:text-3xl tracking-wide drop-shadow-sm"
                    style={{
                      backgroundImage: `linear-gradient(90deg, #60a5fa, ${branding.primaryColor || '#2563eb'}, ${branding.secondaryColor || '#4f46e5'})`
                    }}
                  >
                    {welcomeInfo.companyName}
                  </span>
                </motion.h1>

                {/* Simple loading bar status */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="w-full bg-slate-950/40 px-4 py-3 rounded-2xl border border-white/[0.04] mb-6 flex items-center justify-center gap-2.5 text-center"
                >
                  <RefreshCcw className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
                  <span className="text-[10px] font-bold text-slate-400">{loadingStatus}</span>
                </motion.div>

                {/* Enter Dashboard Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  type="button"
                  onClick={() => setWelcomeInfo(null)}
                  className="w-full py-3.5 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer shadow-lg active:scale-[0.99] border-none transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                  style={{
                    background: `linear-gradient(95deg, ${branding.primaryColor || '#2563eb'}, ${branding.secondaryColor || '#4f46e5'})`,
                    boxShadow: `0 8px 24px -6px ${(branding.primaryColor || '#2563eb')}60`
                  }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              {/* Progress timer bar at the bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-950">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 3.0, ease: "linear" }}
                  onAnimationComplete={() => setWelcomeInfo(null)}
                  className="h-full"
                  style={{
                    background: `linear-gradient(90deg, ${branding.primaryColor || '#2563eb'}, ${branding.secondaryColor || '#4f46e5'})`
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ChatbotWidget />
    </div>
  );
}
