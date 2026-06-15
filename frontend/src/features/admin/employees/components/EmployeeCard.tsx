"use client";

import React from 'react';
import { 
  Eye, Edit2, Trash2, Briefcase, Mail, Fingerprint, Calendar, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  emp: any;
  openModal: (type: 'add' | 'edit' | 'details' | 'delete', employee?: any) => void;
  viewType?: 'grid' | 'list';
}

const getDeptBadgeStyles = (dept: string) => {
  const d = (dept || '').toLowerCase();
  if (d.includes('engineering') || d.includes('tech')) {
    return "bg-violet-50 text-violet-700 dark:bg-violet-950/20 dark:text-violet-400 border-violet-100 dark:border-violet-900/40";
  }
  if (d.includes('design') || d.includes('product')) {
    return "bg-pink-50 text-pink-700 dark:bg-pink-950/20 dark:text-pink-400 border-pink-100 dark:border-pink-900/40";
  }
  if (d.includes('sales') || d.includes('marketing')) {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/40";
  }
  if (d.includes('hr') || d.includes('talent')) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40";
  }
  if (d.includes('management') || d.includes('admin')) {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/40";
  }
  return "bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-100 dark:border-slate-800";
};

const getRoleBadgeStyles = (role: string) => {
  const r = (role || '').toLowerCase();
  if (r.includes('admin')) {
    return "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/40";
  }
  if (r.includes('hr')) {
    return "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/20 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/40";
  }
  return "bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-100 dark:border-slate-800";
};

export default function EmployeeCard({ emp, openModal, viewType = 'grid' }: EmployeeCardProps) {
  // Render List/Row-wise layout
  if (viewType === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
        className="saas-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-[18px] relative group border border-slate-150/60 dark:border-slate-800/80 hover:border-blue-500/30 dark:hover:border-blue-500/30 shadow-sm hover:shadow-md hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full"
      >
        {/* Left Section: Avatar & Info */}
        <div className="flex gap-4 items-center min-w-0 sm:w-[200px] md:w-[220px] shrink-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            {emp.profilePicture ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 ring-2 ring-blue-500/10 dark:ring-blue-400/10">
                <img src={emp.profilePicture} alt={emp.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-xs font-black text-white shadow-sm border-2 border-white dark:border-slate-800 ring-2 ring-blue-500/15 dark:ring-blue-400/15">
                {emp.avatar}
              </div>
            )}
            <span className={cn(
              "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm",
              emp.status === 'Active' ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
            )} />
          </div>

          {/* Name and Designation */}
          <div className="space-y-0.5 min-w-0 flex-1">
            <h3 className="text-sm font-black text-slate-855 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {emp.name}
            </h3>
            <p className="text-[9.5px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider truncate">
              {emp.designation}
            </p>
            <div className="flex items-center gap-1 flex-wrap mt-0.5">
              <span className={cn(
                "inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider border scale-90 origin-left",
                getDeptBadgeStyles(emp.dept)
              )}>
                {emp.dept}
              </span>
              <span className={cn(
                "inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider border scale-90 origin-left",
                getRoleBadgeStyles(emp.role)
              )}>
                {emp.role || 'Employee'}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Meta Info Columns */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[10px] text-slate-500 dark:text-slate-400 font-semibold flex-1 min-w-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/45 pt-3 sm:pt-0">
          {/* Email */}
          <div className="flex items-center gap-1.5 min-w-0 max-w-[170px] lg:max-w-none flex-1 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate font-mono text-slate-600 dark:text-slate-300">{emp.email}</span>
          </div>

          {/* Employee ID */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Fingerprint className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <div>
              <p className="text-[7px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest leading-none mb-0.5">EMP ID</p>
              <p className="font-bold text-slate-700 dark:text-slate-300 leading-none">#EMP-{emp.empId || (emp.id ? String(emp.id).slice(-3) : '')}</p>
            </div>
          </div>

          {/* Joined Date */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <div>
              <p className="text-[7px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest leading-none mb-0.5">
                {emp.isDeletedRecord ? "DELETED" : "JOINED"}
              </p>
              <p className="font-bold text-slate-700 dark:text-slate-300 leading-none">{emp.joining}</p>
            </div>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex gap-1.5 items-center justify-end border-t sm:border-t-0 border-slate-100 dark:border-slate-800/45 pt-3 sm:pt-0 shrink-0 w-full sm:w-auto">
          {emp.isDeletedRecord ? (
            <button 
              onClick={() => openModal('details', emp)}
              className="px-3 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:shadow-md hover:shadow-rose-500/10 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shrink-0"
            >
              <Eye className="w-3 h-3" />
              Details (Deleted)
            </button>
          ) : (
            <>
              <button 
                onClick={() => openModal('details', emp)}
                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-650 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:shadow-md hover:shadow-blue-500/10 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95 shrink-0"
              >
                <Eye className="w-3 h-3" />
                Details
              </button>
              <button 
                onClick={() => openModal('edit', emp)}
                className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 text-slate-505 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all cursor-pointer border border-slate-150/10 hover:border-blue-200/50 dark:border-slate-800 dark:hover:border-slate-700 shrink-0"
                title="Edit Employee"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button 
                onClick={() => openModal('delete', emp)}
                className="p-2 bg-slate-50 hover:bg-rose-50/50 dark:bg-slate-800/50 dark:hover:bg-rose-950/20 text-slate-555 hover:text-rose-600 rounded-lg transition-all cursor-pointer border border-slate-150/10 hover:border-rose-200/50 dark:border-slate-800 dark:hover:border-rose-950/30 shrink-0"
                title="Delete Employee"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  // Render standard Box/Grid layout
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      className="saas-card bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-4 rounded-2xl relative group border border-slate-150/60 dark:border-slate-800/80 hover:border-blue-500/30 dark:hover:border-blue-500/30 shadow-sm hover:shadow-md hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[215px]"
    >
      {/* Top Section: Avatar & Info */}
      <div className="flex flex-col items-center text-center gap-2">
        {/* Avatar */}
        <div className="relative shrink-0">
          {emp.profilePicture ? (
            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 ring-2 ring-blue-500/10 dark:ring-blue-400/10">
              <img src={emp.profilePicture} alt={emp.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-xs font-black text-white shadow-sm border-2 border-white dark:border-slate-800 ring-2 ring-blue-500/15 dark:ring-blue-400/15">
              {emp.avatar}
            </div>
          )}
          <span className={cn(
            "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm",
            emp.status === 'Active' ? "bg-emerald-500 animate-pulse" : emp.status === 'Deleted' ? "bg-rose-500" : "bg-slate-300"
          )} />
        </div>

        {/* Name and Designation */}
        <div className="space-y-0.5 min-w-0 w-full">
          <h3 className="text-[13px] font-black text-slate-850 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {emp.name}
          </h3>
          <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider truncate">
            {emp.designation}
          </p>
          <div className="flex flex-col items-center gap-1 mt-1">
            <span className={cn(
              "inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider border scale-90",
              getDeptBadgeStyles(emp.dept)
            )}>
              <Briefcase className="w-2.5 h-2.5 opacity-80" />
              {emp.dept}
            </span>
            <span className={cn(
              "inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider border scale-90",
              getRoleBadgeStyles(emp.role)
            )}>
              <Shield className="w-2.5 h-2.5 opacity-80" />
              {emp.role || 'Employee'}
            </span>
          </div>
        </div>
      </div>

      {/* Info Row: Email */}
      <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate w-full">
        <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
        <span className="truncate font-mono">{emp.email}</span>
      </div>

      {/* Stats Divider Grid */}
      <div className="grid grid-cols-2 gap-2 py-2 border-t border-slate-100 dark:border-slate-800/60 mt-3 text-[9px]">
        <div className="flex items-center gap-1.5 justify-start pl-1">
          <Fingerprint className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <div className="text-left">
            <p className="text-[7.5px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest leading-none mb-0.5">EMP ID</p>
            <p className="font-bold text-slate-700 dark:text-slate-300 leading-none">#EMP-{emp.empId || (emp.id ? String(emp.id).slice(-3) : '')}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 justify-end text-right pr-1">
          <div className="text-right">
            <p className="text-[7.5px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest leading-none mb-0.5">
              {emp.isDeletedRecord ? "DELETED" : "JOINED"}
            </p>
            <p className="font-bold text-slate-700 dark:text-slate-300 leading-none">{emp.joining}</p>
          </div>
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
        {emp.isDeletedRecord ? (
          <button 
            onClick={() => openModal('details', emp)}
            className="flex-1 py-1.5 bg-gradient-to-r from-rose-500 to-rose-650 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg text-[8.5px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-rose-500/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Eye className="w-3 h-3" />
            Details (Deleted)
          </button>
        ) : (
          <>
            <button 
              onClick={() => openModal('details', emp)}
              className="flex-1 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-650 text-white rounded-lg text-[8.5px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-500/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              Details
            </button>
            <button 
              onClick={() => openModal('edit', emp)}
              className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700 text-slate-555 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-all cursor-pointer border border-slate-150/10 hover:border-blue-200/50 dark:border-slate-800 dark:hover:border-slate-700"
              title="Edit Employee"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button 
              onClick={() => openModal('delete', emp)}
              className="p-1.5 bg-slate-50 hover:bg-rose-50/50 dark:bg-slate-800/50 dark:hover:bg-rose-950/20 text-slate-555 hover:text-rose-600 rounded-lg transition-all cursor-pointer border border-slate-150/10 hover:border-rose-200/50 dark:border-slate-800 dark:hover:border-rose-950/30"
              title="Delete Employee"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
