"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, Users, UserCheck, Briefcase, Calendar, FileText, BarChart3, 
  CheckSquare, RefreshCw, Globe, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

// Subcomponents
import HiringInsights from './recruitment/HiringInsights';
import PositionsPortal from './recruitment/PositionsPortal';
import TalentPool from './recruitment/TalentPool';
import StagePipeline from './recruitment/StagePipeline';
import InterviewsScheduler from './recruitment/InterviewsScheduler';
import ReferralsTracker from './recruitment/ReferralsTracker';
import JobModal from './recruitment/JobModal';
import CandidateModal from './recruitment/CandidateModal';
import CareerPortal from './recruitment/CareerPortal';
import ConfirmModal from '@/app/components/ConfirmModal';

// Types
import { IJob, IApplicant, IReferral } from './recruitment/types';

export default function RecruitmentPage({ 
  jobs: parentJobs = [], 
  setJobs: setParentJobs 
}: { 
  jobs?: any[], 
  setJobs?: React.Dispatch<React.SetStateAction<any[]>> 
}) {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'jobs' | 'candidates' | 'pipeline' | 'interviews' | 'referrals' | 'career-portal'>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  
  // Job Modals / Form State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobModalType, setJobModalType] = useState<'create' | 'edit'>('create');
  const [selectedJob, setSelectedJob] = useState<IJob | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Candidate Details Modal / Pipeline state
  const [selectedApplicant, setSelectedApplicant] = useState<IApplicant | null>(null);
  const [selectedApplicantJob, setSelectedApplicantJob] = useState<IJob | null>(null);
  const [isApplicantModalOpen, setIsApplicantModalOpen] = useState(false);

  // Employee Referrals Database
  const [referrals, setReferrals] = useState<IReferral[]>([]);

  const fetchReferrals = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null;
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/referrals', { headers });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((ref: any) => ({
          id: ref._id || ref.id,
          referrerName: ref.referrerName,
          referrerEmail: ref.referrerEmail,
          candidateName: ref.candidateName,
          jobTitle: ref.role || ref.jobTitle,
          status: ref.status,
          bonus: ref.bonus,
          date: ref.date
        }));
        setReferrals(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch referrals:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchReferrals();
  }, []);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null;
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/jobs', { headers });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        if (setParentJobs) setParentJobs(data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Seed Demo Data Helper
  const handleSeedDemoData = async () => {
    setIsLoading(true);
    const demoJobs = [
      {
        title: 'Senior Frontend Developer',
        dept: 'Engineering',
        location: 'Bangalore, India (Remote)',
        salary: '₹25L - ₹35L',
        type: 'Full-time',
        experienceLevel: 'Senior',
        description: 'We are looking for a Senior Frontend Engineer to design and build our HR core components, charts, and portals.',
        requirements: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
        status: 'Active',
        postedDate: 'May 10, 2026',
        applicants: [
          {
            name: 'Karan Sharma',
            email: 'karan@sharmatech.in',
            phone: '+91 98888 77777',
            status: 'Shortlisted',
            date: 'May 12, 2026',
            skills: ['React', 'TypeScript', 'Jest', 'Redux'],
            experience: '4.8 years',
            rating: 88,
            scorecard: { interviewerRating: 4.2, feedbackComments: 'Very strong React architecture knowledge.', recommendation: 'Select' },
            interviews: []
          },
          {
            name: 'Priya Iyer',
            email: 'priya.iyer@engmail.net',
            phone: '+91 91234 56789',
            status: 'Technical Round',
            date: 'May 14, 2026',
            skills: ['React', 'Next.js', 'Tailwind', 'Webpack'],
            experience: '6.2 years',
            rating: 92,
            scorecard: {},
            interviews: [{ round: 'Technical Round', date: '2026-05-22', time: '11:00 AM', interviewer: 'Siddharth Roy', meetingLink: 'https://meet.google.com/abc-defg-hij', completed: false }]
          }
        ]
      },
      {
        title: 'Product Designer',
        dept: 'Design',
        location: 'Mumbai, India',
        salary: '₹18L - ₹28L',
        type: 'Full-time',
        experienceLevel: 'Mid',
        description: 'Craft beautiful enterprise SaaS experiences. Work directly with product owners to convert mockups to high-fidelity specs.',
        requirements: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
        status: 'Active',
        postedDate: 'May 12, 2026',
        applicants: [
          {
            name: 'Devika Bose',
            email: 'devika.design@uxstudio.com',
            phone: '+91 97777 66666',
            status: 'Applied',
            date: 'May 18, 2026',
            skills: ['Figma', 'Prototyping', 'Typography'],
            experience: '2.5 years',
            rating: 79,
            scorecard: {},
            interviews: []
          }
        ]
      },
      {
        title: 'HR Manager',
        dept: 'Human Resources',
        location: 'Delhi NCR',
        salary: '₹12L - ₹18L',
        type: 'Full-time',
        experienceLevel: 'Senior',
        description: 'Lead employee onboarding, culture, compliance, and recruitment pipeline coordination.',
        requirements: ['Onboarding', 'Payroll coordination', 'Conflict Resolution', 'ATS Tools'],
        status: 'Active',
        postedDate: 'May 15, 2026',
        applicants: []
      }
    ];

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null;
      // Clear existing first
      for (const j of jobs) {
        const deleteHeaders: HeadersInit = {};
        if (token) {
          deleteHeaders['Authorization'] = `Bearer ${token}`;
        }
        await fetch(`/api/jobs/${j._id}`, { method: 'DELETE', headers: deleteHeaders });
      }
      // Add new demo jobs
      for (const dj of demoJobs) {
        const postHeaders: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          postHeaders['Authorization'] = `Bearer ${token}`;
        }
        await fetch('/api/jobs', {
          method: 'POST',
          headers: postHeaders,
          body: JSON.stringify(dj)
        });
      }
      await fetchJobs();
      triggerToast('Demo recruitment database successfully seeded!');
    } catch (err) {
      console.error(err);
    }
  };

  // Job Submission handlers
  const handleOpenJobModal = (type: 'create' | 'edit', job?: IJob) => {
    setJobModalType(type);
    setSelectedJob(job || null);
    setIsJobModalOpen(true);
  };

  const handleJobSubmit = async (jobForm: any) => {
    const requirements = jobForm.requirementsString
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const payload = {
      title: jobForm.title,
      dept: jobForm.dept,
      location: jobForm.location,
      salary: jobForm.salary,
      type: jobForm.type,
      experienceLevel: jobForm.experienceLevel,
      description: jobForm.description,
      requirements,
      status: selectedJob ? selectedJob.status : 'Active'
    };

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      let res;
      if (jobModalType === 'create') {
        res = await fetch('/api/jobs', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`/api/jobs/${selectedJob?._id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        fetchJobs();
        setIsJobModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateJobStatus = async (job: IJob, newStatus: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...job, status: newStatus })
      });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteJob = (id: string) => {
    setJobToDelete(id);
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    const id = jobToDelete;
    setJobToDelete(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null;
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE', headers });
      if (res.ok) fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  // Pipeline transitions & applicant updates
  const handleUpdateApplicantStage = async (jobId: string, applicantName: string, newStage: string) => {
    const job = jobs.find(j => j._id === jobId);
    if (!job) return;

    const updatedApplicants = job.applicants.map((app: IApplicant) => {
      if (app.name === applicantName) {
        return { ...app, status: newStage };
      }
      return app;
    });

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ ...job, applicants: updatedApplicants })
      });
      if (res.ok) {
        const updated = await res.json();
        if (selectedApplicant && selectedApplicant.name === applicantName) {
          const app = updated.job.applicants.find((a: any) => a.name === applicantName);
          setSelectedApplicant(app);
        }
        fetchJobs();
        fetchReferrals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open applicant modal
  const handleOpenApplicantModal = (app: IApplicant, job: IJob) => {
    setSelectedApplicant(app);
    setSelectedApplicantJob(job);
    setIsApplicantModalOpen(true);
  };

  // After updating applicant scorecard or interviews inside the modal
  const handleUpdateApplicant = (updatedJob: IJob) => {
    // Update local jobs array
    setJobs(prevJobs => prevJobs.map(j => j._id === updatedJob._id ? updatedJob : j));
    
    // Update the selected candidate modal state
    if (selectedApplicant) {
      const freshApplicant = updatedJob.applicants.find(a => a.name === selectedApplicant.name);
      if (freshApplicant) {
        setSelectedApplicant(freshApplicant);
      }
    }
    fetchJobs();
    fetchReferrals();
  };

  // Global filters & counts calculation
  const allApplicantsList = useMemo(() => {
    let list: IApplicant[] = [];
    jobs.forEach((j) => {
      if (j.applicants && Array.isArray(j.applicants)) {
        j.applicants.forEach((a) => {
          list.push({ ...a, jobId: j._id, jobTitle: j.title, jobDept: j.dept });
        });
      }
    });
    return list;
  }, [jobs]);

  const filteredApplicantsList = useMemo(() => {
    return allApplicantsList.filter((app) => {
      const matchDept = selectedDeptFilter === 'All' || app.jobDept === selectedDeptFilter;
      return matchDept;
    });
  }, [allApplicantsList, selectedDeptFilter]);

  const stats = useMemo(() => {
    const totalOpenings = jobs.filter((j) => j.status === 'Active').length;
    const totalApplicants = allApplicantsList.length;
    const scheduledInterviews = allApplicantsList.reduce((acc: number, app: any) => 
      acc + (app.interviews?.filter((i: any) => !i.completed).length || 0), 0
    );
    const hiredCount = allApplicantsList.filter((app) => app.status === 'Hired').length;
    const rejectedCount = allApplicantsList.filter((app) => app.status === 'Rejected').length;
    const offerSentCount = allApplicantsList.filter((app) => app.status === 'Offer Sent').length;

    return {
      totalOpenings,
      totalApplicants,
      scheduledInterviews,
      hiredCount,
      rejectedCount,
      offerSentCount
    };
  }, [jobs, allApplicantsList]);

  return (
    <div className="p-5 lg:p-6 max-w-7xl mx-auto space-y-6 min-h-screen text-left">
      <div className="flex flex-col gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 text-left w-full print:hidden">
        {/* Row 1: Title and Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-500/10">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                Hiring & Talent Acquisition
              </h1>
              <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1.5 leading-none">
                Recruitment & Careers Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={handleSeedDemoData}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border border-transparent dark:border-slate-700/50"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Seed Demo
            </button>

            <button 
              onClick={() => handleOpenJobModal('create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Opening
            </button>
          </div>
        </div>

        {/* Row 2: Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl break-words whitespace-normal leading-relaxed">
          Enterprise dashboard to coordinate open positions, track applicants throughout the hiring funnel, build an employee referral network, and manage pipeline scheduler evaluations.
        </p>

        {/* Row 3: Navigation Tabs */}
        <div className="flex bg-slate-150/70 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 w-fit max-w-full overflow-x-auto scrollbar-none shadow-inner print:hidden mt-2">
          {[
            { id: 'dashboard', label: 'Hiring Analytics', icon: BarChart3 },
            { id: 'jobs', label: 'Job Openings', icon: Briefcase },
            { id: 'candidates', label: 'Applicants Hub', icon: Users },
            { id: 'pipeline', label: 'Hiring Pipeline', icon: CheckSquare },
            { id: 'interviews', label: 'Interviews', icon: Calendar },
            { id: 'career-portal', label: 'Career Portal Setup', icon: Globe },
            { id: 'referrals', label: 'Employee Referrals', icon: UserCheck }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex items-center gap-1.2 px-3 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-widest transition-all duration-350 cursor-pointer border-none whitespace-nowrap shrink-0",
                activeSubTab === tab.id 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-500/15" 
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              <tab.icon className="w-3 h-3 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>
        {/* TOP STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-left">
        {[
          { 
            label: 'Active Openings', 
            value: stats.totalOpenings, 
            cardBg: 'bg-gradient-to-br from-blue-600 to-indigo-500 dark:from-blue-700 dark:to-indigo-600 text-white' 
          },
          { 
            label: 'Total Applicants', 
            value: stats.totalApplicants, 
            cardBg: 'bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white' 
          },
          { 
            label: 'Interviews Scheduled', 
            value: stats.scheduledInterviews, 
            cardBg: 'bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-650 text-white' 
          },
          { 
            label: 'Offers Disbursed', 
            value: stats.offerSentCount, 
            cardBg: 'bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 text-white' 
          },
          { 
            label: 'Onboarded Staff', 
            value: stats.hiredCount, 
            cardBg: 'bg-gradient-to-br from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600 text-white' 
          },
          { 
            label: 'Archived/Rejected', 
            value: stats.rejectedCount, 
            cardBg: 'bg-gradient-to-br from-rose-500 to-pink-500 dark:from-rose-600 dark:to-pink-600 text-white' 
          }
        ].map((s, idx) => (
          <motion.div 
            key={idx} 
            whileHover={{ y: -2, scale: 1.01 }}
            className={cn(
              "p-4 rounded-2xl shadow-sm relative overflow-hidden group transition-all duration-300 border border-transparent",
              s.cardBg
            )}
          >
            {/* Ambient Glassmorphic Bubbles */}
            <div className="absolute -right-8 -top-8 w-20 h-20 rounded-full opacity-[0.08] group-hover:opacity-[0.15] transition-all duration-500 blur-xl pointer-events-none" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />
            <div className="absolute -left-6 -bottom-6 w-14 h-14 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-all duration-500 blur-lg pointer-events-none" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)' }} />

            <div className="relative z-10">
              <p className="text-[8px] text-white/85 font-black uppercase tracking-wider">{s.label}</p>
              <h3 className="text-xl font-black mt-1.5 leading-none text-white">{s.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>      </div>

      {/* Content Rendering Tab Area */}
      <div>
        {activeSubTab === 'dashboard' && (
          <HiringInsights 
            jobs={jobs} 
            allApplicantsList={allApplicantsList} 
            stats={stats} 
          />
        )}

        {activeSubTab === 'jobs' && (
          <PositionsPortal 
            jobs={jobs} 
            handleOpenJobModal={handleOpenJobModal} 
            handleUpdateJobStatus={handleUpdateJobStatus} 
            handleDeleteJob={handleDeleteJob} 
          />
        )}

        {activeSubTab === 'candidates' && (
          <TalentPool 
            jobs={jobs} 
            filteredApplicantsList={filteredApplicantsList} 
            selectedDeptFilter={selectedDeptFilter} 
            setSelectedDeptFilter={setSelectedDeptFilter} 
            handleUpdateApplicantStage={handleUpdateApplicantStage} 
            handleOpenApplicantModal={handleOpenApplicantModal} 
            fetchJobs={fetchJobs} 
            triggerToast={triggerToast}
          />
        )}

        {activeSubTab === 'pipeline' && (
          <StagePipeline 
            jobs={jobs} 
            allApplicantsList={allApplicantsList} 
            handleUpdateApplicantStage={handleUpdateApplicantStage} 
            handleOpenApplicantModal={handleOpenApplicantModal} 
          />
        )}

        {activeSubTab === 'interviews' && (
          <InterviewsScheduler 
            allApplicantsList={allApplicantsList} 
          />
        )}

        {activeSubTab === 'referrals' && (
          <ReferralsTracker 
            jobs={jobs} 
            referrals={referrals} 
            setReferrals={setReferrals} 
            triggerToast={triggerToast}
          />
        )}

        {activeSubTab === 'career-portal' && (
          <CareerPortal 
            jobs={jobs} 
            fetchJobs={fetchJobs} 
            triggerToast={triggerToast}
          />
        )}
      </div>

      {/* Shared Modals */}
      <AnimatePresence>
        {isJobModalOpen && (
          <JobModal 
            isOpen={isJobModalOpen} 
            type={jobModalType} 
            job={selectedJob} 
            onClose={() => setIsJobModalOpen(false)} 
            onSubmit={handleJobSubmit} 
          />
        )}

        {isApplicantModalOpen && (
          <CandidateModal 
            isOpen={isApplicantModalOpen} 
            applicant={selectedApplicant} 
            job={selectedApplicantJob} 
            onClose={() => setIsApplicantModalOpen(false)} 
            onUpdateApplicant={handleUpdateApplicant} 
            jobs={jobs} 
            triggerToast={triggerToast}
          />
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={!!jobToDelete}
        title="Archive Job Opening"
        message="Are you sure you want to archive this job opening? This will remove it from the public careers page and move it to archived/draft state."
        confirmText="Archive Job"
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteJob}
        onCancel={() => setJobToDelete(null)}
        type="danger"
      />

      {/* Custom Toast Notification portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {toastMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -30, x: '-50%' }}
              animate={{ opacity: 1, y: 20, x: '-50%' }}
              exit={{ opacity: 0, y: -30, x: '-50%' }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="fixed top-0 left-1/2 z-[9999] px-6 py-3 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl flex items-center gap-2.5 border border-white/10 dark:border-slate-800/80 max-w-[90vw]"
            >
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
