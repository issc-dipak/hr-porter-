"use client";

import React from 'react';
import { X, Trash2, Plus, Edit2, Check, MessageSquare } from 'lucide-react';
import { cn } from "@/lib/utils";

type Role = 'Admin' | 'HR' | 'Employee';

interface AdminTabsProps {
  activeCategory: string;
  companyBranding: {
    name: string;
    logo: string;
    timezone: string;
    currency: string;
    departments: string[];
  };
  setCompanyBranding: React.Dispatch<React.SetStateAction<any>>;
  newDeptName: string;
  setNewDeptName: (val: string) => void;
  usersList: any[];
  newUserFullName: string;
  setNewUserFullName: (val: string) => void;
  newUserEmail: string;
  setNewUserEmail: (val: string) => void;
  newUserPassword: string;
  setNewUserPassword: (val: string) => void;
  newUserRole: Role;
  setNewUserRole: (val: Role) => void;
  newUserDepartment: string;
  setNewUserDepartment: (val: string) => void;
  creatingUser: boolean;
  handleCreateUser: (e: React.FormEvent) => void;
  handleUpdateUserRole: (userId: string, role: string) => void;
  handleDeleteUser: (userId: string) => void;
  permissionsMatrix: Record<string, Record<string, boolean>>;
  setPermissionsMatrix: React.Dispatch<React.SetStateAction<any>>;
  payrollConfig: {
    salaryCycle: string;
    overtimeRate: string;
    taxRegime: string;
    bonusRules: string;
    autoRelease: boolean;
  };
  setPayrollConfig: React.Dispatch<React.SetStateAction<any>>;
  attendanceConfig: {
    shiftStart: string;
    shiftEnd: string;
    graceBuffer: string;
    lateDeductionActive: boolean;
    biometricSync: boolean;
  };
  setAttendanceConfig: React.Dispatch<React.SetStateAction<any>>;
  leaveConfig: {
    leaveTypes: Array<{ name: string; days: number }>;
    holidayCalendar: Array<{ title: string; date: string }>;
    approvalFlow: string;
    hrMaxLeaves?: number;
    employeeMaxLeaves?: number;
  };
  setLeaveConfig: React.Dispatch<React.SetStateAction<any>>;
  newLeaveName: string;
  setNewLeaveName: (val: string) => void;
  newLeaveDays: number;
  setNewLeaveDays: (val: number) => void;
  newHolidayTitle: string;
  setNewHolidayTitle: (val: string) => void;
  newHolidayDate: string;
  setNewHolidayDate: (val: string) => void;
  recruitmentConfig: {
    interviewStages: string[];
    jobTemplates: Array<{ title: string; description: string }>;
  };
  setRecruitmentConfig: React.Dispatch<React.SetStateAction<any>>;
  newStageName: string;
  setNewStageName: (val: string) => void;
  newTemplateTitle: string;
  setNewTemplateTitle: (val: string) => void;
  newTemplateDesc: string;
  setNewTemplateDesc: (val: string) => void;
  securityConfig: {
    minPasswordLength: number;
    twoFactorAuthActive: boolean;
    sessionExpiryMinutes: number;
    ipRestrictions: string;
  };
  setSecurityConfig: React.Dispatch<React.SetStateAction<any>>;
  notificationConfig: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    hrAlerts: boolean;
    employeeReminders: boolean;
  };
  setNotificationConfig: React.Dispatch<React.SetStateAction<any>>;
  themeSettings: {
    defaultThemeMode: string;
    defaultLanguage: string;
  };
  setThemeSettings: React.Dispatch<React.SetStateAction<any>>;
  triggerToast: (msg: string) => void;
  onSaveSystemSettings?: (updatedLeaveConfig: any) => Promise<void>;
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

export function AdminTabs({
  activeCategory,
  companyBranding,
  setCompanyBranding,
  newDeptName,
  setNewDeptName,
  usersList,
  newUserFullName,
  setNewUserFullName,
  newUserEmail,
  setNewUserEmail,
  newUserPassword,
  setNewUserPassword,
  newUserRole,
  setNewUserRole,
  newUserDepartment,
  setNewUserDepartment,
  creatingUser,
  handleCreateUser,
  handleUpdateUserRole,
  handleDeleteUser,
  permissionsMatrix,
  setPermissionsMatrix,
  payrollConfig,
  setPayrollConfig,
  attendanceConfig,
  setAttendanceConfig,
  leaveConfig,
  setLeaveConfig,
  newLeaveName,
  setNewLeaveName,
  newLeaveDays,
  setNewLeaveDays,
  newHolidayTitle,
  setNewHolidayTitle,
  newHolidayDate,
  setNewHolidayDate,
  recruitmentConfig,
  setRecruitmentConfig,
  newStageName,
  setNewStageName,
  newTemplateTitle,
  setNewTemplateTitle,
  newTemplateDesc,
  setNewTemplateDesc,
  securityConfig,
  setSecurityConfig,
  notificationConfig,
  setNotificationConfig,
  themeSettings,
  setThemeSettings,
  triggerToast,
  onSaveSystemSettings,
  chatConfig,
  setChatConfig
}: AdminTabsProps) {
  const [editingHolIdx, setEditingHolIdx] = React.useState<number | null>(null);
  const [editHolTitle, setEditHolTitle] = React.useState('');
  const [editHolDate, setEditHolDate] = React.useState('');

  const [employees, setEmployees] = React.useState<any[]>([]);
  const [employeesSearch, setEmployeesSearch] = React.useState('');

  const fetchEmployeesList = async () => {
    try {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/employees', { headers });
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (e) {
      console.error("Failed to fetch employees in settings:", e);
    }
  };

  React.useEffect(() => {
    if (activeCategory === 'leaves') {
      fetchEmployeesList();
    }
  }, [activeCategory]);

  const handleUpdateEmployeeLeaveLimit = async (employeeId: string, newLimit: number) => {
    try {
      const token = localStorage.getItem('hr_system_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ maxLeaves: newLimit })
      });
      if (res.ok) {
        // Update local list
        setEmployees(prev => prev.map(emp => emp._id === employeeId ? { ...emp, maxLeaves: newLimit } : emp));
        triggerToast('Employee leave limit updated.');
      } else {
        triggerToast('Failed to update employee limit.');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Error saving employee limit.');
    }
  };

  const handleSaveInlineHoliday = (idx: number) => {
    if (!editHolTitle.trim() || !editHolDate) {
      triggerToast('Please provide a title and date.');
      return;
    }
    const updated = leaveConfig.holidayCalendar.map((h, i) => {
      if (i === idx) {
        return { title: editHolTitle.trim(), date: editHolDate };
      }
      return h;
    });
    const newLeave = {
      ...leaveConfig,
      holidayCalendar: updated
    };
    setLeaveConfig(newLeave);
    if (onSaveSystemSettings) {
      onSaveSystemSettings(newLeave);
    }
    setEditingHolIdx(null);
    triggerToast('Holiday updated and saved to database.');
  };

  return (
    <>
      {/* Company Settings */}
      {activeCategory === 'company' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Company settings</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Establish organizational credentials, default branding and timezone settings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
              <input 
                type="text" 
                value={companyBranding.name}
                onChange={e => setCompanyBranding({ ...companyBranding, name: e.target.value })}
                className="saas-input w-full px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company Logo URL</label>
              <input 
                type="text" 
                placeholder="Enter image URL..."
                value={companyBranding.logo}
                onChange={e => setCompanyBranding({ ...companyBranding, logo: e.target.value })}
                className="saas-input w-full px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Timezone</label>
              <select
                value={companyBranding.timezone}
                onChange={e => setCompanyBranding({ ...companyBranding, timezone: e.target.value })}
                className="saas-input w-full px-3 py-2 cursor-pointer font-bold"
              >
                <option>UTC+05:30 (Kolkata)</option>
                <option>UTC+00:00 (London)</option>
                <option>UTC-08:00 (PST)</option>
                <option>UTC+08:00 (Singapore)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System Currency</label>
              <select
                value={companyBranding.currency}
                onChange={e => setCompanyBranding({ ...companyBranding, currency: e.target.value })}
                className="saas-input w-full px-3 py-2 cursor-pointer font-bold"
              >
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Manage Company Departments</label>
            <div className="flex flex-wrap gap-2">
              {companyBranding.departments.map(dept => (
                <span key={dept} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold flex items-center gap-1.5">
                  {dept}
                  <button 
                    type="button"
                    onClick={() => setCompanyBranding({
                      ...companyBranding,
                      departments: companyBranding.departments.filter(d => d !== dept)
                    })}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input 
                type="text" 
                placeholder="Add department name..."
                value={newDeptName}
                onChange={e => setNewDeptName(e.target.value)}
                className="saas-input w-full px-3 py-1.5"
              />
              <button 
                type="button"
                onClick={() => {
                  if (!newDeptName.trim()) return;
                  if (companyBranding.departments.includes(newDeptName.trim())) return;
                  setCompanyBranding({
                    ...companyBranding,
                    departments: [...companyBranding.departments, newDeptName.trim()]
                  });
                  setNewDeptName('');
                  triggerToast('Department added to configuration');
                }}
                className="px-4 py-1.5 bg-slate-850 hover:bg-slate-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users & Roles settings */}
      {activeCategory === 'roles' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Users & Roles</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Create corporate accounts, assign access configurations and edit permission credentials</p>
          </div>

          {/* Create User Form */}
          <form onSubmit={handleCreateUser} className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <span className="font-black uppercase text-slate-900 dark:text-white block">Create New User Profile</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  value={newUserFullName}
                  onChange={e => setNewUserFullName(e.target.value)}
                  className="saas-input w-full px-3 py-1.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="john@company.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="saas-input w-full px-3 py-1.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  className="saas-input w-full px-3 py-1.5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">System Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as Role)}
                  className="saas-input w-full px-3 py-1.5 font-bold cursor-pointer"
                >
                  <option>Employee</option>
                  <option>HR</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                <select
                  value={newUserDepartment}
                  onChange={e => setNewUserDepartment(e.target.value)}
                  className="saas-input w-full px-3 py-1.5 font-bold cursor-pointer"
                >
                  {companyBranding.departments.map(dept => (
                    <option key={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  Create Account
                </button>
              </div>
            </div>
          </form>

          {/* Users Management Table */}
          <div className="space-y-3">
            <span className="font-black uppercase text-slate-900 dark:text-white block">Active Users Directory</span>
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-150 dark:border-slate-800">
                    <th className="p-3.5 font-black uppercase text-slate-400">User Name</th>
                    <th className="p-3.5 font-black uppercase text-slate-400">Email</th>
                    <th className="p-3.5 font-black uppercase text-slate-400">Department</th>
                    <th className="p-3.5 font-black uppercase text-slate-400">Assigned Role</th>
                    <th className="p-3.5 font-black uppercase text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map(user => (
                    <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <td className="p-3.5 text-slate-900 dark:text-white uppercase font-black">{user.fullName}</td>
                      <td className="p-3.5 font-mono">{user.email}</td>
                      <td className="p-3.5">{user.department || 'Engineering'}</td>
                      <td className="p-3.5">
                        <select
                          value={user.role}
                          onChange={e => handleUpdateUserRole(user._id, e.target.value)}
                          className="bg-transparent border border-slate-200 dark:border-slate-800 rounded px-2 py-0.5 font-black text-[9px] uppercase cursor-pointer"
                        >
                          <option>Employee</option>
                          <option>HR</option>
                          <option>Admin</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="font-black uppercase text-slate-900 dark:text-white block">Manage Roles & Permissions Matrix</span>
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-150 dark:border-slate-800">
                    <th className="p-3.5 font-black uppercase text-slate-400">Permission Module</th>
                    <th className="p-3.5 font-black uppercase text-slate-400 text-center">Admin</th>
                    <th className="p-3.5 font-black uppercase text-slate-400 text-center">HR</th>
                    <th className="p-3.5 font-black uppercase text-slate-400 text-center">Employee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {permissionsMatrix['Admin'] && Object.keys(permissionsMatrix['Admin']).map(perm => (
                    <tr key={perm} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <td className="p-3.5 uppercase font-black">{perm}</td>
                      {['Admin', 'HR', 'Employee'].map(role => (
                        <td key={role} className="p-3.5 text-center">
                          <input 
                            type="checkbox"
                            checked={permissionsMatrix[role]?.[perm] || false}
                            onChange={() => {
                              setPermissionsMatrix({
                                ...permissionsMatrix,
                                [role]: {
                                  ...permissionsMatrix[role],
                                  [perm]: !permissionsMatrix[role][perm]
                                }
                              });
                            }}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Settings */}
      {activeCategory === 'payroll' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Payroll Settings</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Manage salary payout frequencies, tax regime rules and overtime allowances</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Salary Release Cycle</label>
              <select
                value={payrollConfig.salaryCycle}
                onChange={e => setPayrollConfig({ ...payrollConfig, salaryCycle: e.target.value })}
                className="saas-input w-full px-3 py-2 cursor-pointer font-bold"
              >
                <option>Monthly (1st)</option>
                <option>Monthly (Last Working Day)</option>
                <option>Bi-Weekly (Alternate Fridays)</option>
                <option>Weekly (Saturdays)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tax Bracket Structure</label>
              <select
                value={payrollConfig.taxRegime}
                onChange={e => setPayrollConfig({ ...payrollConfig, taxRegime: e.target.value })}
                className="saas-input w-full px-3 py-2 cursor-pointer font-bold"
              >
                <option>Standard 2026</option>
                <option>FY 2026-27 New Tax Regime</option>
                <option>FY 2026-27 Old Tax Regime</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Overtime Hourly Rate multiplier</label>
              <input 
                type="text" 
                value={payrollConfig.overtimeRate}
                onChange={e => setPayrollConfig({ ...payrollConfig, overtimeRate: e.target.value })}
                className="saas-input w-full px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bonus Pool Cap rules</label>
              <input 
                type="text" 
                value={payrollConfig.bonusRules}
                onChange={e => setPayrollConfig({ ...payrollConfig, bonusRules: e.target.value })}
                className="saas-input w-full px-3 py-2"
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl col-span-1 md:col-span-2">
              <div>
                <span className="font-black uppercase text-slate-900 dark:text-white">Auto release payroll approvals</span>
                <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">Release net payslips at end of month cycle without manual trigger check</p>
              </div>
              <button
                type="button"
                onClick={() => setPayrollConfig({ ...payrollConfig, autoRelease: !payrollConfig.autoRelease })}
                className={cn(
                  "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                  payrollConfig.autoRelease ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
                )}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Settings */}
      {activeCategory === 'attendance' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Attendance Settings</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Set corporate login timers, grace check-in ranges and biometric sync toggles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shift Hours (Start)</label>
              <input 
                type="text" 
                value={attendanceConfig.shiftStart}
                onChange={e => setAttendanceConfig({ ...attendanceConfig, shiftStart: e.target.value })}
                className="saas-input w-full px-3 py-2 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Shift Hours (End)</label>
              <input 
                type="text" 
                value={attendanceConfig.shiftEnd}
                onChange={e => setAttendanceConfig({ ...attendanceConfig, shiftEnd: e.target.value })}
                className="saas-input w-full px-3 py-2 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Late Arrival Grace Buffer</label>
              <input 
                type="text" 
                value={attendanceConfig.graceBuffer}
                onChange={e => setAttendanceConfig({ ...attendanceConfig, graceBuffer: e.target.value })}
                className="saas-input w-full px-3 py-2"
              />
            </div>

            <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              {[
                { id: 'lateDeductionActive', title: 'Activate salary deduction for late arrivals', desc: 'Auto calculate pay cuts after exceeding monthly late threshold limits' },
                { id: 'biometricSync', title: 'Automated biometric card sync', desc: 'Sync swipe card machines in real time to calculate check-in/out stamps' }
              ].map(opt => (
                <div key={opt.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl">
                  <div>
                    <span className="font-black uppercase text-slate-900 dark:text-white">{opt.title}</span>
                    <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">{opt.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttendanceConfig({ ...attendanceConfig, [opt.id]: !attendanceConfig[opt.id as keyof typeof attendanceConfig] })}
                    className={cn(
                      "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                      attendanceConfig[opt.id as keyof typeof attendanceConfig] ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
                    )}
                  >
                    <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leave Settings */}
      {activeCategory === 'leaves' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Leave & Holiday configs</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Edit annual leave allowances types and manage corporate holidays calendar</p>
          </div>

          {/* Leave Allowance Configuration */}
          <div className="p-5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4">
            <span className="font-black uppercase text-slate-900 dark:text-white block">Role-Based Annual Leave Allowance</span>
            <p className="text-[8.5px] font-bold text-slate-400 uppercase mt-0.5">Define maximum yearly leave count for HR and Employee roles</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">HR Leave Allowance</label>
                  <span className="text-xs font-black text-blue-500 dark:text-blue-400">{leaveConfig.hrMaxLeaves || 24} Days</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newMax = Math.max(1, (leaveConfig.hrMaxLeaves || 24) - 1);
                      const newLeave = { ...leaveConfig, hrMaxLeaves: newMax };
                      setLeaveConfig(newLeave);
                      if (onSaveSystemSettings) onSaveSystemSettings(newLeave);
                    }}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={leaveConfig.hrMaxLeaves || 24}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      const newLeave = { ...leaveConfig, hrMaxLeaves: newMax };
                      setLeaveConfig(newLeave);
                      if (onSaveSystemSettings) onSaveSystemSettings(newLeave);
                    }}
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newMax = Math.min(50, (leaveConfig.hrMaxLeaves || 24) + 1);
                      const newLeave = { ...leaveConfig, hrMaxLeaves: newMax };
                      setLeaveConfig(newLeave);
                      if (onSaveSystemSettings) onSaveSystemSettings(newLeave);
                    }}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Employee Leave Allowance</label>
                  <span className="text-xs font-black text-blue-500 dark:text-blue-400">{leaveConfig.employeeMaxLeaves || 24} Days</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newMax = Math.max(1, (leaveConfig.employeeMaxLeaves || 24) - 1);
                      const newLeave = { ...leaveConfig, employeeMaxLeaves: newMax };
                      setLeaveConfig(newLeave);
                      if (onSaveSystemSettings) onSaveSystemSettings(newLeave);
                    }}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={leaveConfig.employeeMaxLeaves || 24}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value);
                      const newLeave = { ...leaveConfig, employeeMaxLeaves: newMax };
                      setLeaveConfig(newLeave);
                      if (onSaveSystemSettings) onSaveSystemSettings(newLeave);
                    }}
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newMax = Math.min(50, (leaveConfig.employeeMaxLeaves || 24) + 1);
                      const newLeave = { ...leaveConfig, employeeMaxLeaves: newMax };
                      setLeaveConfig(newLeave);
                      if (onSaveSystemSettings) onSaveSystemSettings(newLeave);
                    }}
                    className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center cursor-pointer transition-all active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Employee Leave Allowance */}
          <div className="p-5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="font-black uppercase text-slate-900 dark:text-white block">Individual Staff Leave Allowances</span>
                <p className="text-[8.5px] font-bold text-slate-400 uppercase mt-0.5">Customize yearly leave count for specific employees</p>
              </div>
              <input 
                type="text" 
                placeholder="Search staff member..." 
                className="saas-input py-1.5 px-3 text-xs w-full sm:w-48 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50"
                value={employeesSearch}
                onChange={e => setEmployeesSearch(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 max-h-60 no-scrollbar">
              <table className="w-full text-left border-collapse text-[10.5px] font-bold text-slate-700 dark:text-slate-300">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-150 dark:border-slate-800">
                    <th className="p-3 font-black uppercase text-slate-400">Staff Member</th>
                    <th className="p-3 font-black uppercase text-slate-400">Dept / Role</th>
                    <th className="p-3 font-black uppercase text-slate-400 text-center">Leave Allowance</th>
                    <th className="p-3 font-black uppercase text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employees
                    .filter(emp => {
                      const name = emp.fullName || emp.name || '';
                      const dept = emp.department || emp.dept || '';
                      const design = emp.designation || '';
                      const search = employeesSearch.toLowerCase();
                      return name.toLowerCase().includes(search) || 
                             dept.toLowerCase().includes(search) || 
                             design.toLowerCase().includes(search);
                    })
                    .map((emp) => {
                      const isHr = emp.department === 'HR' || emp.fullName === 'Priya Patel' || emp.fullName === 'Dipak Patil';
                      const defaultLimit = isHr ? (leaveConfig.hrMaxLeaves || 24) : (leaveConfig.employeeMaxLeaves || 24);
                      const currentLimit = emp.maxLeaves !== undefined ? emp.maxLeaves : defaultLimit;
                      const hasCustomLimit = emp.maxLeaves !== undefined && emp.maxLeaves !== defaultLimit;

                      return (
                        <tr key={emp._id} className="hover:bg-slate-55/50 dark:hover:bg-slate-850/20">
                          <td className="p-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black flex items-center justify-center">
                              {((emp.fullName || emp.name || 'E').split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2))}
                            </div>
                            <div>
                              <span className="text-slate-900 dark:text-white uppercase font-black block">{emp.fullName || emp.name}</span>
                              <span className="text-[8px] font-bold text-slate-400 block">{emp.email}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-slate-900 dark:text-white block">{emp.department || emp.dept}</span>
                            <span className="text-[8px] font-bold text-slate-400 block uppercase">{emp.designation}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateEmployeeLeaveLimit(emp._id, Math.max(1, currentLimit - 1))}
                                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center cursor-pointer transition-all active:scale-95"
                              >
                                -
                              </button>
                              <input 
                                type="number"
                                value={currentLimit}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val) && val >= 1 && val <= 100) {
                                    handleUpdateEmployeeLeaveLimit(emp._id, val);
                                  }
                                }}
                                className="w-12 py-0.5 text-center bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-750 rounded-lg font-mono text-xs text-slate-800 dark:text-slate-200 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateEmployeeLeaveLimit(emp._id, Math.min(100, currentLimit + 1))}
                                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-black flex items-center justify-center cursor-pointer transition-all active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            {hasCustomLimit ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateEmployeeLeaveLimit(emp._id, defaultLimit)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-250 text-slate-650 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-[8px] font-black uppercase rounded-lg cursor-pointer"
                              >
                                Reset
                              </button>
                            ) : (
                              <span className="text-[8px] font-bold text-slate-400 uppercase">Default</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-xs text-slate-400 font-medium uppercase">
                        Loading employee database...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Types Management */}
          <div className="space-y-4">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Configured Leave Types Allowance</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {leaveConfig.leaveTypes.map((leave, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="font-black uppercase text-slate-950 dark:text-white block">{leave.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{leave.days} Days / Year</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setLeaveConfig({
                      ...leaveConfig,
                      leaveTypes: leaveConfig.leaveTypes.filter((_, i) => i !== idx)
                    })}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 max-w-md pt-2">
              <input 
                type="text" 
                placeholder="Leave type..."
                value={newLeaveName}
                onChange={e => setNewLeaveName(e.target.value)}
                className="saas-input w-full px-3 py-1.5"
              />
              <input 
                type="number" 
                placeholder="Days"
                value={newLeaveDays}
                onChange={e => setNewLeaveDays(parseInt(e.target.value) || 0)}
                className="saas-input w-24 px-3 py-1.5"
              />
              <button 
                type="button"
                onClick={() => {
                  if (!newLeaveName.trim()) return;
                  setLeaveConfig({
                    ...leaveConfig,
                    leaveTypes: [...leaveConfig.leaveTypes, { name: newLeaveName.trim(), days: newLeaveDays }]
                  });
                  setNewLeaveName('');
                  setNewLeaveDays(10);
                  triggerToast('Leave category added');
                }}
                className="px-4 py-1.5 bg-slate-850 hover:bg-slate-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Holiday Calendar */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Corporate Holiday Calendar (2026)</label>
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-[10px] font-bold text-slate-700 dark:text-slate-300">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850/60 border-b border-slate-150 dark:border-slate-800">
                    <th className="p-3.5 font-black uppercase text-slate-400">Holiday Event</th>
                    <th className="p-3.5 font-black uppercase text-slate-400">Calendar Date</th>
                    <th className="p-3.5 font-black uppercase text-slate-400 text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leaveConfig.holidayCalendar.map((hol, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                      <td className="p-3.5 text-slate-900 dark:text-white uppercase font-black">{hol.title}</td>
                      <td className="p-3.5 font-mono">{new Date(hol.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const newLeave = {
                              ...leaveConfig,
                              holidayCalendar: leaveConfig.holidayCalendar.filter((_, i) => i !== idx)
                            };
                            setLeaveConfig(newLeave);
                            if (onSaveSystemSettings) {
                              onSaveSystemSettings(newLeave);
                            }
                            triggerToast('Holiday deleted and saved to database.');
                          }}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 max-w-md pt-2">
              <input 
                type="text" 
                placeholder="Holiday Event Name..."
                value={newHolidayTitle}
                onChange={e => setNewHolidayTitle(e.target.value)}
                className="saas-input w-full px-3 py-1.5"
              />
              <input 
                type="date" 
                value={newHolidayDate}
                onChange={e => setNewHolidayDate(e.target.value)}
                className="saas-input w-48 px-3 py-1.5"
              />
              <button 
                type="button"
                onClick={() => {
                  if (!newHolidayTitle.trim() || !newHolidayDate) return;
                  const newLeave = {
                    ...leaveConfig,
                    holidayCalendar: [...leaveConfig.holidayCalendar, { title: newHolidayTitle.trim(), date: newHolidayDate }]
                  };
                  setLeaveConfig(newLeave);
                  if (onSaveSystemSettings) {
                    onSaveSystemSettings(newLeave);
                  }
                  setNewHolidayTitle('');
                  setNewHolidayDate('');
                  triggerToast('Holiday added and saved to database.');
                }}
                className="px-4 py-1.5 bg-slate-850 hover:bg-slate-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer shadow-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Approval Flow */}
          <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Leave Approval Workflow Flow</label>
            <input 
              type="text" 
              value={leaveConfig.approvalFlow}
              onChange={e => setLeaveConfig({ ...leaveConfig, approvalFlow: e.target.value })}
              className="saas-input w-full px-3 py-2"
            />
          </div>
        </div>
      )}

      {/* Recruitment Settings */}
      {activeCategory === 'recruitment' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Recruitment Settings</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase font-sans">Setup candidate pipeline stages levels and edit default job posting templates</p>
          </div>

          {/* Interview Stages */}
          <div className="space-y-4">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Active Interview Stages</label>
            <div className="flex flex-wrap gap-2">
              {recruitmentConfig.interviewStages.map((stage, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white rounded-xl font-bold flex items-center gap-1.5">
                  {idx + 1}. {stage}
                  <button 
                    type="button"
                    onClick={() => setRecruitmentConfig({
                      ...recruitmentConfig,
                      interviewStages: recruitmentConfig.interviewStages.filter((_, i) => i !== idx)
                    })}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm pt-1">
              <input 
                type="text" 
                placeholder="Add stage name..."
                value={newStageName}
                onChange={e => setNewStageName(e.target.value)}
                className="saas-input w-full px-3 py-1.5"
              />
              <button 
                type="button"
                onClick={() => {
                  if (!newStageName.trim()) return;
                  setRecruitmentConfig({
                    ...recruitmentConfig,
                    interviewStages: [...recruitmentConfig.interviewStages, newStageName.trim()]
                  });
                  setNewStageName('');
                  triggerToast('Interview pipeline stage added');
                }}
                className="px-4 py-1.5 bg-slate-850 hover:bg-slate-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Job templates */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Standard Job Posting Templates</label>
            <div className="space-y-3">
              {recruitmentConfig.jobTemplates.map((tpl, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-start">
                  <div>
                    <span className="font-black uppercase text-slate-900 dark:text-white block">{tpl.title}</span>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 leading-normal uppercase">{tpl.description}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setRecruitmentConfig({
                      ...recruitmentConfig,
                      jobTemplates: recruitmentConfig.jobTemplates.filter((_, i) => i !== idx)
                    })}
                    className="text-slate-400 hover:text-rose-500 cursor-pointer shrink-0 ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
              <span className="font-black uppercase block">Add Job Template</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Job Title..."
                  value={newTemplateTitle}
                  onChange={e => setNewTemplateTitle(e.target.value)}
                  className="saas-input w-full px-3 py-1.5"
                />
                <input 
                  type="text" 
                  placeholder="Brief Description..."
                  value={newTemplateDesc}
                  onChange={e => setNewTemplateDesc(e.target.value)}
                  className="saas-input w-full px-3 py-1.5"
                />
              </div>
              <button 
                type="button"
                onClick={() => {
                  if (!newTemplateTitle.trim() || !newTemplateDesc.trim()) return;
                  setRecruitmentConfig({
                    ...recruitmentConfig,
                    jobTemplates: [...recruitmentConfig.jobTemplates, { title: newTemplateTitle.trim(), description: newTemplateDesc.trim() }]
                  });
                  setNewTemplateTitle('');
                  setNewTemplateDesc('');
                  triggerToast('Job template added to database');
                }}
                className="px-4 py-1.5 bg-slate-850 hover:bg-slate-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer"
              >
                Add Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeCategory === 'security' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Security Settings</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Set password policy, configure Two-Factor authentication and manage user session timeouts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Minimum Password Length requirement</label>
              <input 
                type="number" 
                value={securityConfig.minPasswordLength}
                onChange={e => setSecurityConfig({ ...securityConfig, minPasswordLength: parseInt(e.target.value) || 8 })}
                className="saas-input w-full px-3 py-2 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inactive Session Timeout (Minutes)</label>
              <input 
                type="number" 
                value={securityConfig.sessionExpiryMinutes}
                onChange={e => setSecurityConfig({ ...securityConfig, sessionExpiryMinutes: parseInt(e.target.value) || 60 })}
                className="saas-input w-full px-3 py-2 font-mono"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Allowed IP Ranges (Restrictions)</label>
              <input 
                type="text" 
                value={securityConfig.ipRestrictions}
                onChange={e => setSecurityConfig({ ...securityConfig, ipRestrictions: e.target.value })}
                className="saas-input w-full px-3 py-2 font-mono"
              />
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl col-span-1 md:col-span-2">
              <div>
                <span className="font-black uppercase text-slate-900 dark:text-white">Enforce 2-Factor Authentication (2FA)</span>
                <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">Force all system users to configure secondary verification checks during login</p>
              </div>
              <button
                type="button"
                onClick={() => setSecurityConfig({ ...securityConfig, twoFactorAuthActive: !securityConfig.twoFactorAuthActive })}
                className={cn(
                  "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                  securityConfig.twoFactorAuthActive ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
                )}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification settings */}
      {activeCategory === 'notifications' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">System Notification configs</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Set default global parameters triggers for push and email alerts</p>
          </div>

          <div className="space-y-4">
            {[
              { id: 'emailNotifications', title: 'Global Email Notifications system', desc: 'Allows system to dispatch notifications email alerts' },
              { id: 'pushNotifications', title: 'Desktop Push Notifications triggers', desc: 'Transmit browser system tray notifications logs' },
              { id: 'hrAlerts', title: 'HR Reminders & Alerts system', desc: 'Enable notification alerts for onboarding and documents' },
              { id: 'employeeReminders', title: 'Task Deadline reminders', desc: 'Auto remind employees about active project targets' }
            ].map(notif => (
              <div key={notif.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl">
                <div>
                  <span className="font-black uppercase text-slate-900 dark:text-white">{notif.title}</span>
                  <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">{notif.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationConfig({ ...notificationConfig, [notif.id]: !notificationConfig[notif.id as keyof typeof notificationConfig] })}
                  className={cn(
                    "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                    notificationConfig[notif.id as keyof typeof notificationConfig] ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
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
      {activeCategory === 'chat-admin' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
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
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Workspace Chat Logo URL</label>
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
    </>
  );
}
