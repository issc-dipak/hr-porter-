"use client";

import React, { useState } from 'react';
import { 
  ShieldAlert, ShieldCheck, Check, Sparkles, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface IPermission {
  id: string;
  name: string;
  desc: string;
}

const ALL_PERMISSIONS: IPermission[] = [
  { id: 'emp_read', name: 'View Employees', desc: 'Allows viewing employee profile information, designation and structures.' },
  { id: 'emp_write', name: 'Modify Employees', desc: 'Allows adding, editing, and deleting employee profiles.' },
  { id: 'pay_approve', name: 'Approve Payroll', desc: 'Access to process monthly payslips and confirm salary disbursement.' },
  { id: 'leave_approve', name: 'Approve Leave requests', desc: 'Allows accepting/rejecting global team leave applications.' },
  { id: 'jobs_write', name: 'Manage Careers', desc: 'Allows creating job posts, viewing applicants, scheduling interviews.' },
  { id: 'settings_write', name: 'System Settings', desc: 'Grants control to adjust SMTP, Taxes, PF/ESI formulas, and holidays.' },
  { id: 'audit_read', name: 'View System Audit Trail', desc: 'Permits viewing regulatory SOC2 and ISO compliance audit records.' },
];

export function RolesPermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'HR' | 'Employee'>('Admin');
  const [rolePermissions, setRolePermissions] = useState({
    Admin: ['emp_read', 'emp_write', 'pay_approve', 'leave_approve', 'jobs_write', 'settings_write', 'audit_read'],
    HR: ['emp_read', 'emp_write', 'leave_approve', 'jobs_write'],
    Employee: ['emp_read']
  });

  const togglePermission = (permId: string) => {
    // Prevent modifying Admin permissions (Admin must always have full privileges)
    if (selectedRole === 'Admin') return;

    setRolePermissions(prev => {
      const current = prev[selectedRole];
      const next = current.includes(permId)
        ? current.filter(id => id !== permId)
        : [...current, permId];
      return {
        ...prev,
        [selectedRole]: next
      };
    });
  };

  return (
    <div className="p-5 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-outfit">Access Control Governance</h1>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Authorize permission hierarchies for Admin, HR, and Employee roles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Role Selector */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Role</h3>
          
          {(['Admin', 'HR', 'Employee'] as const).map((role) => {
            const isActive = selectedRole === role;
            const permCount = rolePermissions[role].length;
            
            const roleThemes = {
              Admin: {
                gradient: 'from-blue-600 to-indigo-600',
                shadow: 'shadow-blue-500/15'
              },
              HR: {
                gradient: 'from-emerald-500 to-teal-600',
                shadow: 'shadow-emerald-500/15'
              },
              Employee: {
                gradient: 'from-purple-600 to-indigo-650', // Wait, let's use standard 'to-indigo-600'
                shadow: 'shadow-purple-500/15'
              }
            };
            
            const theme = roleThemes[role];
            const activeGradient = role === 'Employee' ? 'from-purple-600 to-indigo-600' : theme.gradient;
            
            return (
              <motion.button
                key={role}
                whileHover={{ y: -1, scale: 1.01 }}
                onClick={() => setSelectedRole(role)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center relative overflow-hidden group ${
                  isActive 
                    ? `bg-gradient-to-br ${activeGradient} border-transparent text-white shadow-lg ${theme.shadow}` 
                    : 'bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/90 dark:to-slate-950/70 border-slate-200/50 dark:border-slate-808 text-slate-700 dark:text-slate-350 hover:border-slate-350 dark:hover:border-slate-750'
                }`}
              >
                {/* Ambient glassmorphic glow bubbles */}
                <div 
                  className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-[0.05] group-hover:opacity-[0.12] transition-all duration-500 blur-xl pointer-events-none"
                  style={{ backgroundColor: isActive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(99, 102, 241, 0.15)' }}
                />
                <div 
                  className="absolute -left-6 -bottom-6 w-16 h-16 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-500 blur-lg pointer-events-none"
                  style={{ backgroundColor: isActive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(99, 102, 241, 0.1)' }}
                />
                
                <div className="relative z-10 min-w-0 pr-2">
                  <h4 className="text-sm font-black uppercase tracking-wider font-outfit">{role} Role</h4>
                  <p className={`text-[10px] mt-1 font-semibold leading-relaxed ${isActive ? 'text-white/85' : 'text-slate-400 dark:text-slate-500'}`}>
                    {role === 'Admin' ? 'Super administrator access.' : 
                     role === 'HR' ? 'Human resources execution privileges.' :
                     'General personnel permissions.'}
                  </p>
                </div>
                <div 
                  className="px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border shrink-0 relative z-10 transition-all duration-300"
                  style={{ 
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.08)',
                    color: isActive ? '#ffffff' : 'inherit'
                  }}
                >
                  {permCount} Privileges
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Right Side: Permissions Checklist */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider font-outfit">{selectedRole} Privileges</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Configure individual application permissions.</p>
            </div>
            {selectedRole === 'Admin' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" /> Immutable Role
              </div>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {ALL_PERMISSIONS.map((perm) => {
              const hasPerm = rolePermissions[selectedRole].includes(perm.id);
              const disabled = selectedRole === 'Admin';
              
              return (
                <div 
                  key={perm.id} 
                  onClick={() => !disabled && togglePermission(perm.id)}
                  className={`py-4 flex items-start gap-4 transition-all ${
                    disabled ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                    hasPerm 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    {hasPerm && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{perm.name}</h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">{perm.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedRole === 'Admin' && (
            <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed">
                The Admin role must possess absolute authority system-wide to guarantee workspace synchronization.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
