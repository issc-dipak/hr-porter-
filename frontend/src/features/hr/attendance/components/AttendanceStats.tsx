"use client";

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface AttendanceStatsProps {
  stats: any[];
}

export default function AttendanceStats({ stats }: AttendanceStatsProps) {
  // Premium gradient themes matching the dashboard styling
  const themeMap: Record<string, {
    cardBg: string;
    cardBorder: string;
    iconText: string;
    iconBg: string;
    iconBorder: string;
    iconGlow: string;
    labelColor: string;
    valueColor: string;
  }> = {
    'Present': {
      cardBg: 'bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white',
      cardBorder: 'border-transparent',
      iconText: 'text-white',
      iconBg: 'bg-neutral-100/15 dark:bg-slate-950/40',
      iconBorder: 'border-neutral-100/20 dark:border-slate-950/20',
      iconGlow: 'shadow-sm',
      labelColor: 'text-white/85',
      valueColor: 'text-white'
    },
    'Late': {
      cardBg: 'bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-650 text-white',
      cardBorder: 'border-transparent',
      iconText: 'text-white',
      iconBg: 'bg-neutral-100/15 dark:bg-slate-950/40',
      iconBorder: 'border-neutral-100/20 dark:border-slate-950/20',
      iconGlow: 'shadow-sm',
      labelColor: 'text-white/85',
      valueColor: 'text-white'
    },
    'On Leave': {
      cardBg: 'bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-blue-700 dark:to-indigo-600 text-white',
      cardBorder: 'border-transparent',
      iconText: 'text-white',
      iconBg: 'bg-neutral-100/15 dark:bg-slate-950/40',
      iconBorder: 'border-neutral-100/20 dark:border-slate-950/20',
      iconGlow: 'shadow-sm',
      labelColor: 'text-white/85',
      valueColor: 'text-white'
    },
    'Absent': {
      cardBg: 'bg-gradient-to-br from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 text-white',
      cardBorder: 'border-transparent',
      iconText: 'text-white',
      iconBg: 'bg-neutral-100/15 dark:bg-slate-950/40',
      iconBorder: 'border-neutral-100/20 dark:border-slate-950/20',
      iconGlow: 'shadow-sm',
      labelColor: 'text-white/85',
      valueColor: 'text-white'
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left">
      {stats.map((stat, idx) => {
        const currentTheme = themeMap[stat.label] || {
          cardBg: 'bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/90 dark:to-slate-950/70',
          cardBorder: 'border-slate-200/30 dark:border-slate-800/80 text-slate-900 dark:text-white',
          iconText: stat.color,
          iconBg: stat.bg,
          iconBorder: 'border-slate-200/50 dark:border-slate-800',
          iconGlow: '',
          labelColor: 'text-slate-400 dark:text-slate-500',
          valueColor: 'text-slate-900 dark:text-white'
        };

        return (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "p-4.5 flex flex-col sm:flex-row items-center gap-3.5 group text-center sm:text-left border rounded-[18px] relative overflow-hidden shadow-sm transition-all duration-305 hover:scale-[1.02]",
              currentTheme.cardBg,
              currentTheme.cardBorder
            )}
          >
            {/* Ambient Glassmorphic Bubbles */}
            <div 
              className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-[0.08] group-hover:opacity-[0.15] transition-all duration-500 blur-xl pointer-events-none"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
            />
            <div 
              className="absolute -left-6 -bottom-6 w-16 h-16 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 blur-lg pointer-events-none"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
            />

            <div className={cn("p-2.5 rounded-xl border flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0 shadow-sm", currentTheme.iconBg, currentTheme.iconBorder, currentTheme.iconGlow)}>
              <stat.icon className={cn("w-5 h-5", currentTheme.iconText)} />
            </div>
            <div className="relative z-10 min-w-0 flex-1">
              <p className={cn("text-[9px] font-black uppercase tracking-[0.15em] mb-1", currentTheme.labelColor)}>{stat.label}</p>
              <h3 className={cn("text-lg sm:text-2xl font-black tracking-tight leading-none", currentTheme.valueColor)}>{stat.value}</h3>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
