import React from 'react';
import { UserCheck, Clock, Activity, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface HrSLATabProps {
  filteredAppraisals: any[];
  handleDeleteReview: (id: string) => void;
  setIsReviewModalOpen: (val: boolean) => void;
  isClient: boolean;
  slaMetrics: {
    hiringSuccess: string;
    payrollSpeed: string;
    leaveApproval: string;
    conversionRate: string;
  };
  recruitmentFunnelData: any[];
}

export const HrSLATab: React.FC<HrSLATabProps> = ({
  filteredAppraisals,
  handleDeleteReview,
  setIsReviewModalOpen,
  isClient,
  slaMetrics,
  recruitmentFunnelData
}) => {
  return (
    <div className="space-y-6">
      {/* HR SLA Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Hiring SLA Met', value: slaMetrics.hiringSuccess, desc: 'Conversion rate from applied to hired', icon: UserCheck, color: 'text-emerald-500' },
          { label: 'Payroll Processing Delay', value: slaMetrics.payrollSpeed, desc: 'SLA metric standard deviation', icon: Clock, color: 'text-blue-500' },
          { label: 'Leave Approval Latency', value: slaMetrics.leaveApproval, desc: 'Median approval latency duration', icon: Activity, color: 'text-indigo-500' },
          { label: 'Recruitment Conversion Rate', value: slaMetrics.conversionRate, desc: 'Overall funnel conversion performance', icon: TrendingUp, color: 'text-purple-500' }
        ].map((sla, idx) => (
          <div key={idx} className="p-4.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider">{sla.label}</span>
              <sla.icon className={cn("w-4 h-4", sla.color)} />
            </div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">{sla.value}</h4>
            <p className="text-[9px] text-slate-400 mt-1">{sla.desc}</p>
          </div>
        ))}
      </div>

      {/* Funnel Graph & HR Team Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Funnel Chart */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Recruitment Conversion Funnel</h3>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Sourcing efficiency analysis across applied, screened, and onboarded candidates.</p>
          </div>

          <div className="h-64">
            {isClient ? (
              recruitmentFunnelData.length > 0 && recruitmentFunnelData.some(d => d.candidates > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recruitmentFunnelData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="candidates" barSize={25} radius={[0, 8, 8, 0]}>
                      {recruitmentFunnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[11px] font-bold text-slate-400 uppercase">No recruitment data yet — post jobs and add applicants</div>
              )
            ) : <div className="h-full bg-slate-100 rounded-xl animate-pulse" />}
          </div>
        </div>

        {/* Formal Appraisal Submissions list */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Formal Reviews Logged</h3>
            <button onClick={() => setIsReviewModalOpen(true)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-850 rounded cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
            {filteredAppraisals.length > 0 ? filteredAppraisals.map(r => (
              <div key={r._id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{r.name}</p>
                  <span className="text-[8px] text-slate-400 font-bold block mt-1 uppercase">{r.dept} • Rating: {r.rating}</span>
                </div>
                <button 
                  onClick={() => handleDeleteReview(r._id)}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )) : (
              <p className="text-[10px] text-slate-400 font-bold uppercase text-center py-4">No appraisals logged yet</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
