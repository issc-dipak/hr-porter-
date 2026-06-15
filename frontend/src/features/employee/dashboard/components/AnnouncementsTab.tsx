"use client";

import React from 'react';

interface AnnouncementsTabProps {
  announcements: any[];
}

export function AnnouncementsTab({
  announcements
}: AnnouncementsTabProps) {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Corporate Broadcasts</h2>
        <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 mt-1 uppercase tracking-wider leading-none">Official bulletins, announcements and notifications released by Admin or HR.</p>
      </div>

      <div className="space-y-6">
        {announcements.length === 0 ? (
          <div className="saas-card bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/90 dark:to-slate-950/70 border border-slate-205/30 dark:border-slate-800/80 rounded-[28px] py-20 text-center text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
            No corporate bulletins issued yet.
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann._id || ann.id} className="saas-card bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900/90 dark:to-slate-950/70 border border-slate-205/30 dark:border-slate-800/80 rounded-[28px] p-6 relative overflow-hidden shadow-md transition-all duration-300 hover:scale-[1.005]">
              {ann.category === 'Urgent' && (
                <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-rose-500 to-pink-600" />
              )}
              
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase border tracking-widest ${
                  ann.category === 'Urgent' 
                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]' 
                    : 'bg-slate-500/10 text-slate-550 dark:text-slate-400 border-slate-500/25'
                }`}>
                  {ann.category}
                </span>
                <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
              </div>

              <h4 className="text-sm font-black text-slate-900 dark:text-white mt-4 uppercase tracking-tight leading-tight">{ann.title}</h4>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-2.5 whitespace-pre-line leading-relaxed">{ann.content}</p>
              
              <div className="border-t border-slate-150/40 dark:border-slate-800/60 pt-4 mt-6 flex justify-between items-center text-[8.5px] font-black text-slate-400 uppercase tracking-widest">
                <span>By: {ann.postedBy}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
