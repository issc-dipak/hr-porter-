"use client";

import React from 'react';
import { RefreshCcw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  trend: string;
  trendType: 'up' | 'down';
  color: string;
  onRefresh: () => void;
}

export const StatCard = ({ icon: Icon, label, value, trend, trendType, color, onRefresh }: StatCardProps) => {
  const isUp = trendType === 'up';
  const [isBtnHovered, setIsBtnHovered] = React.useState(false);
  
  // Premium gradient themes based on color prop
  const themeMap: Record<string, {
    cardBg: string;
    cardBorder: string;
    iconText: string;
    iconBg: string;
    iconBorder: string;
    iconGlow: string;
    bubbleBg: string;
    labelColor: string;
    valueColor: string;
    trendBg: string;
    trendText: string;
    trendBorder: string;
    refreshClass: string;
  }> = {
    'bg-blue-500': {
      cardBg: 'bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-blue-700 dark:to-indigo-600 text-white',
      cardBorder: 'border-transparent',
      iconText: 'text-white',
      iconBg: 'bg-neutral-100/15 dark:bg-slate-950/40',
      iconBorder: 'border-neutral-100/20 dark:border-slate-950/20',
      iconGlow: 'shadow-sm',
      bubbleBg: 'bg-neutral-100/40',
      labelColor: 'text-white/85',
      valueColor: 'text-white',
      trendBg: 'bg-neutral-100/15',
      trendText: 'text-white',
      trendBorder: 'border-neutral-100/20',
      refreshClass: 'text-white/60 hover:text-white'
    },
    'bg-emerald-500': {
      cardBg: 'bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white',
      cardBorder: 'border-transparent',
      iconText: 'text-white',
      iconBg: 'bg-neutral-100/15 dark:bg-slate-950/40',
      iconBorder: 'border-neutral-100/20 dark:border-slate-950/20',
      iconGlow: 'shadow-sm',
      bubbleBg: 'bg-neutral-100/40',
      labelColor: 'text-white/85',
      valueColor: 'text-white',
      trendBg: 'bg-neutral-100/15',
      trendText: 'text-white',
      trendBorder: 'border-neutral-100/20',
      refreshClass: 'text-white/60 hover:text-white'
    },
    'bg-orange-500': {
      cardBg: 'bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-650 text-white',
      cardBorder: 'border-transparent',
      iconText: 'text-white',
      iconBg: 'bg-neutral-100/15 dark:bg-slate-950/40',
      iconBorder: 'border-neutral-100/20 dark:border-slate-950/20',
      iconGlow: 'shadow-sm',
      bubbleBg: 'bg-neutral-100/40',
      labelColor: 'text-white/85',
      valueColor: 'text-white',
      trendBg: 'bg-neutral-100/15',
      trendText: 'text-white',
      trendBorder: 'border-neutral-100/20',
      refreshClass: 'text-white/60 hover:text-white'
    },
    'bg-purple-500': {
      cardBg: 'bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 text-white',
      cardBorder: 'border-transparent',
      iconText: 'text-white',
      iconBg: 'bg-neutral-100/15 dark:bg-slate-950/40',
      iconBorder: 'border-neutral-100/20 dark:border-slate-950/20',
      iconGlow: 'shadow-sm',
      bubbleBg: 'bg-neutral-100/40',
      labelColor: 'text-white/85',
      valueColor: 'text-white',
      trendBg: 'bg-neutral-100/15',
      trendText: 'text-white',
      trendBorder: 'border-neutral-100/20',
      refreshClass: 'text-white/60 hover:text-white'
    },
    'bg-rose-500': {
      cardBg: 'bg-gradient-to-br from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700 text-white',
      cardBorder: 'border-transparent',
      iconText: 'text-white',
      iconBg: 'bg-neutral-100/15 dark:bg-slate-950/40',
      iconBorder: 'border-neutral-100/20 dark:border-slate-950/20',
      iconGlow: 'shadow-sm',
      bubbleBg: 'bg-neutral-100/40',
      labelColor: 'text-white/85',
      valueColor: 'text-white',
      trendBg: 'bg-neutral-100/15',
      trendText: 'text-white',
      trendBorder: 'border-neutral-100/20',
      refreshClass: 'text-white/60 hover:text-white'
    },
    'bg-indigo-500': {
      cardBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-650 dark:to-indigo-750 text-white',
      cardBorder: 'border-transparent',
      iconText: 'text-white',
      iconBg: 'bg-neutral-100/15 dark:bg-slate-950/40',
      iconBorder: 'border-neutral-100/20 dark:border-slate-950/20',
      iconGlow: 'shadow-sm',
      bubbleBg: 'bg-neutral-100/40',
      labelColor: 'text-white/85',
      valueColor: 'text-white',
      trendBg: 'bg-neutral-100/15',
      trendText: 'text-white',
      trendBorder: 'border-neutral-100/20',
      refreshClass: 'text-white/60 hover:text-white'
    }
  };

  const currentTheme = themeMap[color] || {
    cardBg: 'bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/90 dark:to-slate-950/70',
    cardBorder: 'border-slate-200/30 dark:border-slate-800/80 text-slate-900 dark:text-white',
    iconText: 'text-slate-650 dark:text-slate-350',
    iconBg: 'bg-slate-500/10',
    iconBorder: 'border-slate-500/20',
    iconGlow: '',
    bubbleBg: 'bg-slate-500/5',
    labelColor: 'text-slate-400 dark:text-slate-500',
    valueColor: 'text-slate-900 dark:text-white',
    trendBg: isUp ? 'bg-emerald-500/10' : 'bg-rose-500/10',
    trendText: isUp ? 'text-emerald-600 dark:text-emerald-450' : 'text-rose-600 dark:text-rose-450',
    trendBorder: isUp ? 'border-emerald-500/20' : 'border-rose-500/20',
    refreshClass: 'text-slate-400 hover:text-blue-500'
  };

  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.01 }}
      className={cn(
        "p-3 relative overflow-hidden group rounded-[14px] transition-all duration-300 text-left border shadow-sm h-full",
        currentTheme.cardBg,
        currentTheme.cardBorder
      )}
    >
      {/* Premium Glassmorphic Bubbles */}
      <div 
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-[0.08] group-hover:opacity-[0.15] transition-all duration-500 blur-xl pointer-events-none"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
      />
      <div 
        className="absolute -left-6 -bottom-6 w-16 h-16 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 blur-lg pointer-events-none"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }}
      />
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex items-start mb-2.5 min-h-[2.85rem] gap-2 w-full">
          <div className={cn("p-1.5 rounded-lg border flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300", currentTheme.iconBg, currentTheme.iconBorder, currentTheme.iconGlow)}>
            <Icon className={cn("w-3.5 h-3.5", currentTheme.iconText)} />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
             <div className={cn(
               "flex items-start gap-1 text-[7px] sm:text-[7.5px] leading-tight font-semibold tracking-wide text-left break-words w-full",
               currentTheme.trendText
             )}>
               {(trend.includes('%') || trend.startsWith('+') || trend.startsWith('-')) ? (
                 <ArrowUpRight className="w-1.5 h-1.5 shrink-0 mt-[2.5px]" />
               ) : (
                 <span className="w-1.5 h-1.5 bg-current rounded-full shrink-0 mt-[3.5px]" />
               )}
               <span className="break-words flex-1">{trend}</span>
             </div>
          </div>
        </div>
        <button 
          onClick={onRefresh}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
          style={{ backgroundColor: isBtnHovered ? (color.startsWith('bg-') && color !== 'bg-white' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(128, 128, 128, 0.15)') : 'transparent' }}
          className={cn("absolute top-2 right-2 bg-transparent border-none p-1 transition-all opacity-0 group-hover:opacity-100 rounded-md cursor-pointer z-20", currentTheme.refreshClass)}
        >
          <RefreshCcw className="w-2.5 h-2.5" />
        </button>
        <div>
          <p className={cn("text-[8.5px] font-black uppercase tracking-[0.12em] mb-0.5 h-6 flex items-end", currentTheme.labelColor)}>{label}</p>
          <h3 className={cn("text-lg font-black tracking-tight leading-none", currentTheme.valueColor)}>{value}</h3>
        </div>
      </div>
    </motion.div>
  );
};
