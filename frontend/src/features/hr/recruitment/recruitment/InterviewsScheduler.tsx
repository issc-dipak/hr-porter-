"use client";

import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { IApplicant } from './types';
import { cn } from "@/lib/utils";

interface InterviewsSchedulerProps {
  allApplicantsList: IApplicant[];
}

export default function InterviewsScheduler({ allApplicantsList }: InterviewsSchedulerProps) {
  // Extract all scheduled interviews from active candidates
  const scheduledList = allApplicantsList.flatMap(app => 
    (app.interviews || []).map((int: any) => ({
      ...int,
      candidateName: app.name,
      jobTitle: app.jobTitle
    }))
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        
        {/* Left side: Calendar Scheduler view */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Interviews compliance grid</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Automated screening slots synchronized with corporate calendar integrations</p>
          </div>

          {/* Monthly grid simulation */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-150/40 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">May 2026</h5>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[9px] font-black uppercase text-slate-400">Google Meet active</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {/* Empty offsets */}
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={`o-${idx}`} className="aspect-square bg-slate-100/50 dark:bg-slate-800/10 rounded-xl" />
              ))}
              {/* Days */}
              {Array.from({ length: 31 }).map((_, idx) => {
                const day = idx + 1;
                const hasInterview = day === 22 || day === 25;
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "aspect-square p-1 border rounded-xl flex flex-col justify-between hover:border-blue-500/30 transition-all cursor-pointer text-left relative group",
                      hasInterview ? "bg-blue-500/10 border-blue-500/20 text-blue-600 font-black" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-850"
                    )}
                  >
                    <span className="text-[9px]">{day}</span>
                    {hasInterview && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 self-end mb-1" />
                    )}
                    {hasInterview && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 text-white rounded-lg p-1.5 text-[8px] border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none" style={{ background: '#0f172a' }}>
                        <strong>Technical Round</strong>
                        <p className="text-[7px] text-slate-400 mt-0.5">Evaluation Round scheduled</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right side: Interviews List */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Upcoming Slots list</h4>
          
          <div className="space-y-3">
            {scheduledList.map((int: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="block text-xs font-black text-slate-900 dark:text-white">{int.candidateName}</strong>
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-wider">{int.jobTitle} • {int.round}</span>
                  </div>
                  <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] font-black rounded-md uppercase">Video Link</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {int.date} at {int.time}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Evaluator: {int.interviewer}
                  </p>
                </div>
                <a 
                  href={int.meetingLink}
                  target="_blank" 
                  rel="noreferrer"
                  className="block text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  Join Video Call
                </a>
              </div>
            ))}

            {scheduledList.length === 0 && (
              <div className="py-12 text-center text-slate-400 font-bold uppercase text-[9px] tracking-wider">No interviews scheduled yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
