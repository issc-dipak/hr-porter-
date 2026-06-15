"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Building, Users, User, CreditCard, Clock, Calendar, Briefcase, Target, Shield, 
  Bell, Key, ArrowRight, CheckCircle, Database, Layout, Sparkles, Plus, 
  Trash2, Globe, ShieldAlert, FileText, Smartphone, Languages, RefreshCcw, 
  Power, Code, Info, Check, Eye, Save, X, Settings, Activity, KeyRound, 
  Workflow, Server, HelpCircle, Download, ShieldCheck, Heart, Moon, Sun, Lock,
  MessageSquare, Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { AdminTabs } from './settings/tabs/AdminTabs';
import { HRTabs } from './settings/tabs/HRTabs';
import { EmployeeTabs } from './settings/tabs/EmployeeTabs';
import { BrandingTab } from './settings/tabs/BrandingTab';

type Role = 'Admin' | 'HR' | 'Employee';

interface SettingsPageProps {
  userRole: Role;
  setUserRole: (role: Role) => void;
  addNotification?: (msg: string) => void;
  profile: any;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
  notifications: any;
  setNotifications: React.Dispatch<React.SetStateAction<any>>;
}

export default function SettingsPage({ 
  userRole, 
  setUserRole, 
  addNotification,
  profile,
  setProfile,
  notifications: propNotifs,
  setNotifications: setPropNotifs
}: SettingsPageProps) {
  
  const [activeSettingsView, setActiveSettingsView] = useState<Role>(userRole);
  const [activeCategory, setActiveCategory] = useState<string>('company');
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // -------------------------------------------------------------
  // STATE DEFINITIONS
  // -------------------------------------------------------------

  // Admin -> Company settings
  const [companyBranding, setCompanyBranding] = useState({
    name: 'Acme Global Technologies Ltd',
    logo: '',
    timezone: 'UTC+05:30 (Kolkata)',
    currency: 'INR (₹)',
    departments: ['Engineering', 'Design', 'HR', 'Marketing', 'Sales', 'Finance']
  });

  // Admin -> Users & Roles
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('Employee');
  const [newUserDepartment, setNewUserDepartment] = useState('Engineering');
  const [creatingUser, setCreatingUser] = useState(false);

  // Admin -> Permissions Matrix
  const [permissionsMatrix, setPermissionsMatrix] = useState<Record<string, Record<string, boolean>>>({
    'Admin': { 'Access System Logs': true, 'Run Payroll': true, 'Manage Roles': true, 'Configure Integrations': true },
    'HR': { 'Access System Logs': false, 'Run Payroll': true, 'Manage Roles': true, 'Configure Integrations': false },
    'Employee': { 'Access System Logs': false, 'Run Payroll': false, 'Manage Roles': false, 'Configure Integrations': false }
  });

  // Admin -> Payroll settings
  const [payrollConfig, setPayrollConfig] = useState({
    salaryCycle: 'Monthly (1st)',
    overtimeRate: '1.5x',
    taxRegime: 'Standard 2026',
    bonusRules: '15%',
    autoRelease: true
  });

  // Admin -> Attendance shift timings
  const [attendanceConfig, setAttendanceConfig] = useState({
    shiftStart: '09:00 AM',
    shiftEnd: '06:00 PM',
    graceBuffer: '15 Mins',
    lateDeductionActive: false,
    biometricSync: true
  });

  const [leaveConfig, setLeaveConfig] = useState({
    leaveTypes: [
      { name: 'Sick Leave', days: 12 },
      { name: 'Casual Leave', days: 15 },
      { name: 'Paid Leave', days: 20 },
    ],
    holidayCalendar: [
      { title: 'New Year', date: '2026-01-01' },
      { title: 'Independence Day', date: '2026-08-15' },
      { title: 'Diwali', date: '2026-11-08' },
    ],
    approvalFlow: 'Manager -> HR -> Approved',
    hrMaxLeaves: 24,
    employeeMaxLeaves: 24
  });

  // Admin -> Recruitment Settings
  const [recruitmentConfig, setRecruitmentConfig] = useState({
    interviewStages: ['CV Screening', 'First Technical', 'System Design', 'Managerial Round', 'Offer Letter'],
    jobTemplates: [
      { title: 'Software Engineer', description: 'Fullstack Next.js developer with TypeScript experience.' },
      { title: 'Product Designer', description: 'UX designer to build enterprise dashboards using Figma.' }
    ]
  });

  // Admin -> Security rules
  const [securityConfig, setSecurityConfig] = useState({
    minPasswordLength: 8,
    twoFactorAuthActive: true,
    sessionExpiryMinutes: 60,
    ipRestrictions: '192.168.1.0/24'
  });

  // Admin -> Notification configurations
  const [notificationConfig, setNotificationConfig] = useState({
    emailNotifications: true,
    pushNotifications: true,
    hrAlerts: true,
    employeeReminders: true
  });

  // Admin -> Theme configurations
  const [themeSettings, setThemeSettings] = useState({
    defaultThemeMode: 'Dark',
    defaultLanguage: 'English (US)'
  });

  // Admin/HR Workplace Chat settings
  const [chatConfig, setChatConfig] = useState({
    workspaceName: 'Acme Workspace',
    workspaceLogo: '',
    allowEmployeeChannelCreate: true,
    allowEmployeeChannelPrivateCreate: true,
    allowAnnouncementsPostAll: false,
    allowEmployeeEditDelete: true,
    restrictedKeywords: 'spam, offensive_word, leak'
  });

  // Employee specific chat settings
  const [chatDisplayName, setChatDisplayName] = useState('');
  const [chatStatusText, setChatStatusText] = useState('');
  const [chatStatusEmoji, setChatStatusEmoji] = useState('');
  const [chatPresence, setChatPresence] = useState('online');
  const [chatMuteSound, setChatMuteSound] = useState(false);
  const [chatNotifLevel, setChatNotifLevel] = useState('all');
  const [chatDndActive, setChatDndActive] = useState(false);

  // HR Specific -> Hiring workflow setup
  const [hiringWorkflow, setHiringWorkflow] = useState('Standard stages + System Design Check');
  const [interviewSetup, setInterviewSetup] = useState('Automated calendar invites on panel confirmation');

  // HR Specific -> Onboarding & Employee
  const [onboardingDocs, setOnboardingDocs] = useState([
    { id: 1, docName: 'Aadhar Card / Gov ID', mandatory: true },
    { id: 2, docName: 'Previous Employer Experience Letter', mandatory: true },
    { id: 3, docName: 'Signed Offer Acceptance Copy', mandatory: true }
  ]);
  const [newOnboardingDoc, setNewOnboardingDoc] = useState('');
  const [employeeCategories, setEmployeeCategories] = useState(['Full-time', 'Part-time', 'Contract', 'Intern']);
  const [newCategory, setNewCategory] = useState('');

  // HR Specific -> Attendance
  const [attendanceMonitoringActive, setAttendanceMonitoringActive] = useState(true);
  const [shiftRosterRule, setShiftRosterRule] = useState('Auto roll shifts monthly');

  // HR Specific -> Performance cycles
  const [kpiWeightage, setKpiWeightage] = useState({
    kpiScore: 40,
    peerScore: 30,
    managerScore: 30,
    cycleType: 'Quarterly'
  });

  // Employee specific settings & states
  const [employeeBio, setEmployeeBio] = useState('Senior Specialist');
  const [skillsList, setSkillsList] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [employeePrivacy, setEmployeePrivacy] = useState({
    showProfilePhoto: true,
    showContactNumber: false,
    showOnlineIndicator: true,
    shareSprintActivity: true
  });
  const [employeeNotifs, setEmployeeNotifs] = useState({
    taskReminders: true,
    payrollAlerts: true,
    attendanceAlerts: true
  });
  const [themeMode, setThemeMode] = useState<string>('Dark');
  const [fontSize, setFontSize] = useState<string>('Medium');
  const [compactLayout, setCompactLayout] = useState(false);
  const [focusModeTime, setFocusModeTime] = useState(25);
  const [dailyTaskGoal, setDailyTaskGoal] = useState(5);
  const [availability, setAvailability] = useState({
    startHour: '09:00 AM',
    endHour: '06:00 PM',
    timezone: 'GMT+05:30 (IST)',
    googleCalendarSynced: true
  });

  const [profileDetails, setProfileDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    designation: '',
    location: '',
    profilePicture: '',
    emergencyContact: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    address: '',
    panNumber: '',
    uanNumber: '',
    joinedDate: '' as string | null,
    documents: [] as any[],
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: ''
    }
  });


  // Change Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Dynamic additions state
  const [newDeptName, setNewDeptName] = useState('');
  const [newLeaveName, setNewLeaveName] = useState('');
  const [newLeaveDays, setNewLeaveDays] = useState(10);
  const [newHolidayTitle, setNewHolidayTitle] = useState('');
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newStageName, setNewStageName] = useState('');
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');

  // -------------------------------------------------------------
  // DATA SYNC LOGIC (FETCH & SAVE TO DATABASE)
  // -------------------------------------------------------------

  useEffect(() => {
    fetchSettings();
  }, [userRole]);

  // Sync activeSettingsView and default categories when role changes
  useEffect(() => {
    setActiveSettingsView(userRole);
    if (userRole === 'Admin') {
      setActiveCategory('company');
    } else if (userRole === 'HR') {
      setActiveCategory('employee-profile');
    } else {
      setActiveCategory('employee-profile');
    }
  }, [userRole]);

  // Auto-save user settings reactively when changed
  useEffect(() => {
    if (!hasLoaded || loading) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        const token = localStorage.getItem('hr_system_token');
        if (!token) return;
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const userPayload = {
          bio: employeeBio,
          skills: skillsList,
          privacy: employeePrivacy,
          notifications: employeeNotifs,
          appearance: {
            themeMode,
            fontSize,
            compactLayout
          },
          productivity: {
            focusModeTime,
            dailyTaskGoal,
            productivityReminders: true
          },
          availability,
          profile: profileDetails,
          chatSettings: {
            chatDisplayName,
            chatStatusText,
            chatStatusEmoji,
            chatPresence,
            chatMuteSound,
            chatNotifLevel,
            chatDndActive
          }
        };

        const res = await fetch('/api/settings/user', {
          method: 'POST',
          headers,
          body: JSON.stringify(userPayload)
        });

        if (res.ok) {
          if (setProfile) {
            setProfile((prev: any) => ({
              ...prev,
              name: profileDetails.fullName,
              phone: profileDetails.phone,
              profilePicture: profileDetails.profilePicture,
              emergencyContact: profileDetails.emergencyContact,
              bankName: profileDetails.bankDetails?.bankName,
              accountNumber: profileDetails.bankDetails?.accountNumber,
              ifscCode: profileDetails.bankDetails?.ifscCode,
            }));
          }
        }
      } catch (err) {
        console.error("Auto-save user settings failed:", err);
      }
    }, 1000); // 1-second debounce

    return () => clearTimeout(delayDebounceFn);
  }, [
    hasLoaded,
    loading,
    employeeBio,
    skillsList,
    employeePrivacy,
    employeeNotifs,
    themeMode,
    fontSize,
    compactLayout,
    chatDisplayName,
    chatStatusText,
    chatStatusEmoji,
    chatPresence,
    chatMuteSound,
    chatNotifLevel,
    chatDndActive,
    profileDetails,
    focusModeTime,
    dailyTaskGoal,
    availability,
    setProfile
  ]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setHasLoaded(false);
      const token = localStorage.getItem('hr_system_token');
      if (!token) return;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // 1. Fetch system-wide settings
      const systemRes = await fetch('/api/settings/system', { headers });
      if (systemRes.ok) {
        const data = await systemRes.json();
        if (data) {
          if (data.company) setCompanyBranding(data.company);
          if (data.payroll) setPayrollConfig(data.payroll);
          if (data.attendance) setAttendanceConfig(data.attendance);
          if (data.leave) setLeaveConfig(data.leave);
          if (data.recruitment) setRecruitmentConfig(data.recruitment);
          if (data.security) setSecurityConfig(data.security);
          if (data.notifications) setNotificationConfig(data.notifications);
          if (data.theme) setThemeSettings(data.theme);
          if (data.chat) setChatConfig(data.chat);
        }
      }

      // 2. Fetch user-specific preferences and profile
      const userRes = await fetch('/api/settings/user', { headers });
      if (userRes.ok) {
        const data = await userRes.json();
        if (data) {
          const s = data.settings;
          if (s) {
            setEmployeeBio(s.bio || '');
            setSkillsList(s.skills || []);
            if (s.privacy) setEmployeePrivacy(s.privacy);
            if (s.notifications) setEmployeeNotifs(s.notifications);
             if (s.appearance) {
              const userTheme = s.appearance.themeMode || 'Dark';
              setThemeMode(userTheme);
              setFontSize(s.appearance.fontSize || 'Medium');
              setCompactLayout(s.appearance.compactLayout || false);
              
              // Apply theme instantly on load
              const isDark = userTheme !== 'Light';
              if (typeof window !== 'undefined') {
                document.documentElement.classList.toggle('dark', isDark);
                localStorage.setItem('hr_system_dark_mode', String(isDark));
              }
            } else {
              setThemeMode('Dark');
              if (typeof window !== 'undefined') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('hr_system_dark_mode', 'true');
              }
            }
            if (s.productivity) {
              setFocusModeTime(s.productivity.focusModeTime || 25);
              setDailyTaskGoal(s.productivity.dailyTaskGoal || 5);
            }
            if (s.availability) setAvailability(s.availability);
            if (s.chatSettings) {
              setChatDisplayName(s.chatSettings.chatDisplayName || '');
              setChatStatusText(s.chatSettings.chatStatusText || '');
              setChatStatusEmoji(s.chatSettings.chatStatusEmoji || '');
              setChatPresence(s.chatSettings.chatPresence || 'online');
              setChatMuteSound(s.chatSettings.chatMuteSound || false);
              setChatNotifLevel(s.chatSettings.chatNotifLevel || 'all');
              setChatDndActive(s.chatSettings.chatDndActive || false);
            }
          }
          if (data.profile) {
            setProfileDetails(data.profile);
          }
        }
      }

      // 3. Fetch Admin Users List (Admin Only)
      if (userRole === 'Admin') {
        const usersRes = await fetch('/api/settings/users', { headers });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsersList(usersData);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('hr_system_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // 1. If active workspace is Admin/HR, update System settings
      if (activeSettingsView === 'Admin' || activeSettingsView === 'HR') {
        const systemPayload = {
          company: companyBranding,
          payroll: payrollConfig,
          attendance: attendanceConfig,
          leave: leaveConfig,
          recruitment: recruitmentConfig,
          security: securityConfig,
          notifications: notificationConfig,
          theme: themeSettings,
          chat: chatConfig
        };
        const systemRes = await fetch('/api/settings/system', {
          method: 'POST',
          headers,
          body: JSON.stringify(systemPayload)
        });
        if (!systemRes.ok) {
          const err = await systemRes.json();
          throw new Error(err.error || 'Failed to save system settings');
        }
      }

      // 2. Update Employee settings
      const userPayload = {
        bio: employeeBio,
        skills: skillsList,
        privacy: employeePrivacy,
        notifications: employeeNotifs,
        appearance: {
          themeMode,
          fontSize,
          compactLayout
        },
        productivity: {
          focusModeTime,
          dailyTaskGoal,
          productivityReminders: true
        },
        availability,
        profile: profileDetails,
        chatSettings: {
          chatDisplayName,
          chatStatusText,
          chatStatusEmoji,
          chatPresence,
          chatMuteSound,
          chatNotifLevel,
          chatDndActive
        }
      };

      const userRes = await fetch('/api/settings/user', {
        method: 'POST',
        headers,
        body: JSON.stringify(userPayload)
      });
      
      if (!userRes.ok) {
        const err = await userRes.json();
        throw new Error(err.error || 'Failed to save user settings');
      }

      // Update parent profile state
      if (setProfile) {
        setProfile((prev: any) => ({
          ...prev,
          name: profileDetails.fullName,
          phone: profileDetails.phone,
          profilePicture: profileDetails.profilePicture,
          emergencyContact: profileDetails.emergencyContact,
          bankName: profileDetails.bankDetails?.bankName,
          accountNumber: profileDetails.bankDetails?.accountNumber,
          ifscCode: profileDetails.bankDetails?.ifscCode,
        }));
      }

      triggerToast("Configurations stored to server database successfully.");
      if (addNotification) addNotification("Updated system settings configuration.");
    } catch (error: any) {
      console.error('Error saving settings:', error);
      triggerToast(error.message || "Failed to save settings.");
    } finally {
      setSaving(false);
      fetchSettings();
    }
  };

  // Create user (Admin Only)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserFullName || !newUserEmail || !newUserPassword) {
      triggerToast('Please fill all user details.');
      return;
    }
    try {
      setCreatingUser(true);
      const token = localStorage.getItem('hr_system_token');
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: newUserFullName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
          companyName: companyBranding.name,
          department: newUserDepartment
        })
      });

      const data = await res.json();
      if (res.ok) {
        triggerToast('User created successfully');
        setNewUserFullName('');
        setNewUserEmail('');
        setNewUserPassword('');
        fetchSettings(); // Refresh list
      } else {
        triggerToast(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error(error);
      triggerToast('Server error while creating user');
    } finally {
      setCreatingUser(false);
    }
  };

  // Edit user role (Admin Only)
  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      const token = localStorage.getItem('hr_system_token');
      const res = await fetch('/api/settings/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, role })
      });
      if (res.ok) {
        triggerToast('User role updated successfully');
        fetchSettings();
      } else {
        const err = await res.json();
        triggerToast(err.error || 'Failed to update role');
      }
    } catch (error) {
      console.error(error);
      triggerToast('Server error updating role');
    }
  };

  // Delete user (Admin Only)
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also remove their employee profile.')) return;
    try {
      const token = localStorage.getItem('hr_system_token');
      const res = await fetch(`/api/settings/users?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        triggerToast('User deleted successfully');
        fetchSettings();
      } else {
        const err = await res.json();
        triggerToast(err.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error(error);
      triggerToast('Server error deleting user');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      triggerToast('Please fill all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast('New passwords do not match.');
      return;
    }
    try {
      setChangingPassword(true);
      const token = localStorage.getItem('hr_system_token');
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        triggerToast(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error(error);
      triggerToast('Server error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  // -------------------------------------------------------------
  // SIDEBAR SECTIONS DEFINITIONS
  // -------------------------------------------------------------

  const adminSidebarCategories = [
    { id: 'company', label: 'Company Settings', icon: Building },
    { id: 'branding', label: 'Company Branding', icon: Sparkles },
    { id: 'roles', label: 'Users & Roles', icon: Users },
    { id: 'payroll', label: 'Payroll Settings', icon: CreditCard },
    { id: 'attendance', label: 'Attendance Settings', icon: Clock },
    { id: 'leaves', label: 'Leave Settings', icon: Calendar },
    { id: 'recruitment', label: 'Recruitment Settings', icon: Briefcase },
    { id: 'security', label: 'Security Settings', icon: Shield },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'chat-admin', label: 'Workplace Chat Setup', icon: MessageSquare },
    { id: 'employee-appearance', label: 'Appearance & Theme', icon: Laptop }
  ];

  const hrSidebarCategories = [
    { id: 'employee-profile', label: 'Profile Details', icon: User },
    { id: 'employee-appearance', label: 'Appearance & Theme', icon: Laptop },
    { id: 'hr-recruitment', label: 'Recruitment Setup', icon: Briefcase },
    { id: 'hr-onboarding', label: 'Onboarding & Lifecycle', icon: Users },
    { id: 'hr-attendance', label: 'Attendance Rules', icon: Clock },
    { id: 'hr-leaves', label: 'Leave Rules', icon: Calendar },
    { id: 'hr-performance', label: 'Performance Cycles', icon: Target },
    { id: 'hr-notifications', label: 'HR Notification Alerts', icon: Bell },
    { id: 'hr-chat', label: 'Workplace Chat Setup', icon: MessageSquare }
  ];

  const employeeSidebarCategories = [
    { id: 'employee-profile', label: 'Profile Details', icon: User },
    { id: 'employee-account', label: 'Account Security', icon: ShieldCheck },
    { id: 'employee-appearance', label: 'Appearance & Theme', icon: Laptop },
    { id: 'employee-notifications', label: 'Notification Settings', icon: Bell },
    { id: 'employee-documents', label: 'Uploaded Documents', icon: FileText },
    { id: 'employee-chat', label: 'Workplace Chat Settings', icon: MessageSquare }
  ];

  const getSidebarCategories = () => {
    if (activeSettingsView === 'Admin') return adminSidebarCategories;
    if (activeSettingsView === 'HR') return hrSidebarCategories;
    return employeeSidebarCategories;
  };


  return (
    <div className="p-5 lg:p-6 max-w-7xl mx-auto space-y-6 min-h-screen text-left relative font-sans text-slate-800 dark:text-slate-200">
      
      {/* Toast Alert Banner — rendered via portal */}
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
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Header and top bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            Settings Hub
            {loading && <RefreshCcw className="w-4 h-4 text-blue-500 animate-spin" />}
          </h1>
          <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Super admin system parameters control hub
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 transition-all"
          >
            {saving ? <RefreshCcw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Category Sidebar */}
        <div className="lg:w-60 shrink-0 bg-slate-50/50 dark:bg-slate-900/60 p-2 rounded-2xl border border-slate-100 dark:border-slate-850 overflow-x-auto lg:overflow-y-auto no-scrollbar">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block px-3 py-1.5 lg:mb-1 whitespace-nowrap">
            {activeSettingsView} Sections
          </span>
          
          <div className="flex lg:flex-col gap-1 lg:gap-0.5 min-w-max lg:min-w-0">
            {getSidebarCategories().map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all duration-300 ease-out text-[10.5px] font-bold uppercase tracking-wider text-left cursor-pointer border-none whitespace-nowrap lg:w-full group hover:translate-x-1 active:scale-[0.98] shadow-sm hover:shadow-md",
                  activeCategory === cat.id 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-500/15" 
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-205 bg-transparent"
                )}
              >
                <cat.icon className="w-3.5 h-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Viewports */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-[2rem] p-6 lg:p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeSettingsView}-${activeCategory}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6 text-xs text-left"
            >
                           {/* ========================================================= */}
              {/* ADMIN SETTINGS MODULE RENDERS                            */}
              {/* ========================================================= */}
              {activeSettingsView === 'Admin' && activeCategory === 'branding' && (
                <BrandingTab
                  activeCategory={activeCategory}
                  triggerToast={triggerToast}
                />
              )}
              {activeSettingsView === 'Admin' && activeCategory === 'employee-appearance' && (
                <EmployeeTabs
                  activeCategory={activeCategory}
                  profileDetails={profileDetails}
                  setProfileDetails={setProfileDetails}
                  employeeBio={employeeBio}
                  setEmployeeBio={setEmployeeBio}
                  skillsList={skillsList}
                  setSkillsList={setSkillsList}
                  newSkillInput={newSkillInput}
                  setNewSkillInput={setNewSkillInput}
                  currentPassword={currentPassword}
                  setCurrentPassword={setCurrentPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  changingPassword={changingPassword}
                  handleChangePassword={handleChangePassword}
                  employeePrivacy={employeePrivacy}
                  setEmployeePrivacy={setEmployeePrivacy}
                  employeeNotifs={employeeNotifs}
                  setEmployeeNotifs={setEmployeeNotifs}
                  themeMode={themeMode}
                  setThemeMode={setThemeMode}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  compactLayout={compactLayout}
                  setCompactLayout={setCompactLayout}
                  triggerToast={triggerToast}
                  chatDisplayName={chatDisplayName}
                  setChatDisplayName={setChatDisplayName}
                  chatStatusText={chatStatusText}
                  setChatStatusText={setChatStatusText}
                  chatStatusEmoji={chatStatusEmoji}
                  setChatStatusEmoji={setChatStatusEmoji}
                  chatPresence={chatPresence}
                  setChatPresence={setChatPresence}
                  chatMuteSound={chatMuteSound}
                  setChatMuteSound={setChatMuteSound}
                  chatNotifLevel={chatNotifLevel}
                  setChatNotifLevel={setChatNotifLevel}
                  chatDndActive={chatDndActive}
                  setChatDndActive={setChatDndActive}
                  onPhotoUploaded={(url) => {
                    if (setProfile) {
                      setProfile((prev: any) => ({ ...prev, profilePicture: url }));
                    }
                  }}
                />
              )}
              {activeSettingsView === 'Admin' && activeCategory !== 'branding' && activeCategory !== 'employee-appearance' && (
                <AdminTabs
                  activeCategory={activeCategory}
                  companyBranding={companyBranding}
                  setCompanyBranding={setCompanyBranding}
                  newDeptName={newDeptName}
                  setNewDeptName={setNewDeptName}
                  usersList={usersList}
                  newUserFullName={newUserFullName}
                  setNewUserFullName={setNewUserFullName}
                  newUserEmail={newUserEmail}
                  setNewUserEmail={setNewUserEmail}
                  newUserPassword={newUserPassword}
                  setNewUserPassword={setNewUserPassword}
                  newUserRole={newUserRole}
                  setNewUserRole={setNewUserRole}
                  newUserDepartment={newUserDepartment}
                  setNewUserDepartment={setNewUserDepartment}
                  creatingUser={creatingUser}
                  handleCreateUser={handleCreateUser}
                  handleUpdateUserRole={handleUpdateUserRole}
                  handleDeleteUser={handleDeleteUser}
                  permissionsMatrix={permissionsMatrix}
                  setPermissionsMatrix={setPermissionsMatrix}
                  payrollConfig={payrollConfig}
                  setPayrollConfig={setPayrollConfig}
                  attendanceConfig={attendanceConfig}
                  setAttendanceConfig={setAttendanceConfig}
                  leaveConfig={leaveConfig}
                  setLeaveConfig={setLeaveConfig}
                  newLeaveName={newLeaveName}
                  setNewLeaveName={setNewLeaveName}
                  newLeaveDays={newLeaveDays}
                  setNewLeaveDays={setNewLeaveDays}
                  newHolidayTitle={newHolidayTitle}
                  setNewHolidayTitle={setNewHolidayTitle}
                  newHolidayDate={newHolidayDate}
                  setNewHolidayDate={setNewHolidayDate}
                  recruitmentConfig={recruitmentConfig}
                  setRecruitmentConfig={setRecruitmentConfig}
                  newStageName={newStageName}
                  setNewStageName={setNewStageName}
                  newTemplateTitle={newTemplateTitle}
                  setNewTemplateTitle={setNewTemplateTitle}
                  newTemplateDesc={newTemplateDesc}
                  setNewTemplateDesc={setNewTemplateDesc}
                  securityConfig={securityConfig}
                  setSecurityConfig={setSecurityConfig}
                  notificationConfig={notificationConfig}
                  setNotificationConfig={setNotificationConfig}
                  themeSettings={themeSettings}
                  setThemeSettings={setThemeSettings}
                  triggerToast={triggerToast}
                  chatConfig={chatConfig}
                  setChatConfig={setChatConfig}
                  onSaveSystemSettings={async (updatedLeave) => {
                    try {
                      const token = localStorage.getItem('hr_system_token');
                      const headers = {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      };
                      const systemPayload = {
                        company: companyBranding,
                        payroll: payrollConfig,
                        attendance: attendanceConfig,
                        leave: updatedLeave,
                        recruitment: recruitmentConfig,
                        security: securityConfig,
                        notifications: notificationConfig,
                        theme: themeSettings,
                        chat: chatConfig
                      };
                      await fetch('/api/settings/system', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(systemPayload)
                      });
                      if (addNotification) addNotification("Updated system settings configuration.");
                    } catch (e) {
                      console.error("Failed to auto-save system settings:", e);
                    }
                  }}
                />
              )}

              {activeSettingsView === 'HR' && (
                ['employee-profile', 'employee-appearance'].includes(activeCategory) ? (
                  <EmployeeTabs
                    activeCategory={activeCategory}
                    profileDetails={profileDetails}
                    setProfileDetails={setProfileDetails}
                    employeeBio={employeeBio}
                    setEmployeeBio={setEmployeeBio}
                    skillsList={skillsList}
                    setSkillsList={setSkillsList}
                    newSkillInput={newSkillInput}
                    setNewSkillInput={setNewSkillInput}
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    changingPassword={changingPassword}
                    handleChangePassword={handleChangePassword}
                    employeePrivacy={employeePrivacy}
                    setEmployeePrivacy={setEmployeePrivacy}
                    employeeNotifs={employeeNotifs}
                    setEmployeeNotifs={setEmployeeNotifs}
                    themeMode={themeMode}
                    setThemeMode={setThemeMode}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    compactLayout={compactLayout}
                    setCompactLayout={setCompactLayout}
                    triggerToast={triggerToast}
                    chatDisplayName={chatDisplayName}
                    setChatDisplayName={setChatDisplayName}
                    chatStatusText={chatStatusText}
                    setChatStatusText={setChatStatusText}
                    chatStatusEmoji={chatStatusEmoji}
                    setChatStatusEmoji={setChatStatusEmoji}
                    chatPresence={chatPresence}
                    setChatPresence={setChatPresence}
                    chatMuteSound={chatMuteSound}
                    setChatMuteSound={setChatMuteSound}
                    chatNotifLevel={chatNotifLevel}
                    setChatNotifLevel={setChatNotifLevel}
                    chatDndActive={chatDndActive}
                    setChatDndActive={setChatDndActive}
                    onPhotoUploaded={(url) => {
                      if (setProfile) {
                        setProfile((prev: any) => ({ ...prev, profilePicture: url }));
                      }
                    }}
                  />
                ) : (
                  <HRTabs
                    activeCategory={activeCategory}
                    hiringWorkflow={hiringWorkflow}
                    setHiringWorkflow={setHiringWorkflow}
                    interviewSetup={interviewSetup}
                    setInterviewSetup={setInterviewSetup}
                    onboardingDocs={onboardingDocs}
                    setOnboardingDocs={setOnboardingDocs}
                    newOnboardingDoc={newOnboardingDoc}
                    setNewOnboardingDoc={setNewOnboardingDoc}
                    employeeCategories={employeeCategories}
                    setEmployeeCategories={setEmployeeCategories}
                    newCategory={newCategory}
                    setNewCategory={setNewCategory}
                    attendanceMonitoringActive={attendanceMonitoringActive}
                    setAttendanceMonitoringActive={setAttendanceMonitoringActive}
                    shiftRosterRule={shiftRosterRule}
                    setShiftRosterRule={setShiftRosterRule}
                    leaveConfig={leaveConfig}
                    kpiWeightage={kpiWeightage}
                    setKpiWeightage={setKpiWeightage}
                    notificationConfig={notificationConfig}
                    setNotificationConfig={setNotificationConfig}
                    triggerToast={triggerToast}
                    chatConfig={chatConfig}
                    setChatConfig={setChatConfig}
                  />
                )
              )}

              {activeSettingsView === 'Employee' && (
              <EmployeeTabs
                  activeCategory={activeCategory}
                  profileDetails={profileDetails}
                  setProfileDetails={setProfileDetails}
                  employeeBio={employeeBio}
                  setEmployeeBio={setEmployeeBio}
                  skillsList={skillsList}
                  setSkillsList={setSkillsList}
                  newSkillInput={newSkillInput}
                  setNewSkillInput={setNewSkillInput}
                  currentPassword={currentPassword}
                  setCurrentPassword={setCurrentPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  changingPassword={changingPassword}
                  handleChangePassword={handleChangePassword}
                  employeePrivacy={employeePrivacy}
                  setEmployeePrivacy={setEmployeePrivacy}
                  employeeNotifs={employeeNotifs}
                  setEmployeeNotifs={setEmployeeNotifs}
                  themeMode={themeMode}
                  setThemeMode={setThemeMode}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  compactLayout={compactLayout}
                  setCompactLayout={setCompactLayout}
                  triggerToast={triggerToast}
                  chatDisplayName={chatDisplayName}
                  setChatDisplayName={setChatDisplayName}
                  chatStatusText={chatStatusText}
                  setChatStatusText={setChatStatusText}
                  chatStatusEmoji={chatStatusEmoji}
                  setChatStatusEmoji={setChatStatusEmoji}
                  chatPresence={chatPresence}
                  setChatPresence={setChatPresence}
                  chatMuteSound={chatMuteSound}
                  setChatMuteSound={setChatMuteSound}
                  chatNotifLevel={chatNotifLevel}
                  setChatNotifLevel={setChatNotifLevel}
                  chatDndActive={chatDndActive}
                  setChatDndActive={setChatDndActive}
                  onPhotoUploaded={(url) => {
                    // Immediately update global profile so navbar avatar refreshes
                    if (setProfile) {
                      setProfile((prev: any) => ({ ...prev, profilePicture: url }));
                    }
                  }}
                />
              )}


            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
