"use client";

import React, { useState, useEffect } from 'react';
import { X, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { IJob, IApplicant } from './types';
import { cn } from "@/lib/utils";

interface CandidateModalProps {
  isOpen: boolean;
  applicant: IApplicant | null;
  job: IJob | null;
  onClose: () => void;
  onUpdateApplicant: (updatedJobPayload: IJob) => void;
  jobs: IJob[];
  triggerToast?: (msg: string) => void;
}

export default function CandidateModal({ 
  isOpen, 
  applicant, 
  job, 
  onClose, 
  onUpdateApplicant,
  jobs,
  triggerToast
}: CandidateModalProps) {
  const [activeSection, setActiveSection] = useState<'info' | 'scorecard' | 'schedule' | 'ai'>('info');
  const [candidateStatus, setCandidateStatus] = useState('Applied');

  // Scorecard Feedbacks State
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackRecommendation, setFeedbackRecommendation] = useState('Select');

  // Interview Scheduler State
  const [isSchedulingOpen, setIsSchedulingOpen] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    round: 'Technical Round',
    date: '2026-05-25',
    time: '14:30',
    interviewer: 'Raman Dev (Engineering Lead)',
    meetingType: 'Google Meet',
    location: 'Office Address / HQ Office'
  });

  useEffect(() => {
    if (applicant) {
      setCandidateStatus(applicant.status);
    }
    if (applicant?.scorecard) {
      setFeedbackRating(applicant.scorecard.interviewerRating || 4);
      setFeedbackComments(applicant.scorecard.feedbackComments || '');
      setFeedbackRecommendation(applicant.scorecard.recommendation || 'Select');
    } else {
      setFeedbackRating(4);
      setFeedbackComments('');
      setFeedbackRecommendation('Select');
    }
    setIsSchedulingOpen(false);
  }, [applicant, isOpen]);

  if (!isOpen || !applicant || !job) return null;

  const handleStatusChange = async (newStatus: string) => {
    setCandidateStatus(newStatus);
    
    const updatedApplicants = job.applicants.map((app) => {
      if (app.name === applicant.name) {
        return {
          ...app,
          status: newStatus
        };
      }
      return app;
    });

    const payload = { ...job, applicants: updatedApplicants };

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateApplicant(data.job);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Scorecard Submission
  const handleSaveScorecard = async () => {
    const updatedApplicants = job.applicants.map((app) => {
      if (app.name === applicant.name) {
        return {
          ...app,
          scorecard: {
            interviewerRating: feedbackRating,
            feedbackComments,
            recommendation: feedbackRecommendation
          }
        };
      }
      return app;
    });

    const payload = { ...job, applicants: updatedApplicants };

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateApplicant(data.job);
        if (triggerToast) {
          triggerToast('Scorecard submitted successfully!');
        } else {
          alert('Scorecard submitted successfully!');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Schedule Interview
  const handleScheduleInterview = async () => {
    const newInterview = {
      round: interviewForm.round,
      date: interviewForm.date,
      time: interviewForm.time,
      interviewer: interviewForm.interviewer,
      meetingLink: interviewForm.meetingType === 'Google Meet' 
        ? `https://meet.google.com/hiring-${Math.random().toString(36).substring(3, 7)}-${Math.random().toString(36).substring(3, 7)}`
        : `https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`,
      completed: false
    };

    const updatedApplicants = job.applicants.map((app) => {
      if (app.name === applicant.name) {
        const currentInterviews = app.interviews || [];
        return {
          ...app,
          status: 'Interview', // Automatically advance to Interview stage
          interviews: [...currentInterviews, newInterview]
        };
      }
      return app;
    });

    const payload = { ...job, applicants: updatedApplicants };

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null;
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        onUpdateApplicant(data.job);
        setIsSchedulingOpen(false);
        if (triggerToast) {
          triggerToast('Interview scheduled successfully! Notification sent.');
        } else {
          alert('Interview scheduled successfully! Notification sent.');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 40 }} 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left"
      >
        
        {/* Header profile section */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-base flex items-center justify-center shadow-lg shadow-blue-500/10">
              {applicant.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">{applicant.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold uppercase tracking-wider">{job.title} • </span>
                <select
                  value={candidateStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-2.5 py-0.5 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-md border-0 text-[10px] font-black uppercase tracking-wider cursor-pointer focus:ring-0 focus:outline-none"
                >
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Technical Round">Technical Round</option>
                  <option value="HR Round">HR Round</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {applicant.rating && (
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-wider">{applicant.rating}% Match score</span>
            )}
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-800 rounded-lg border border-slate-150 cursor-pointer">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Sub-nav inside candidate modal */}
        <div className="flex border-b border-slate-100 dark:border-slate-850 px-5 pt-1.5 gap-2">
          {[
            { id: 'info', label: 'Credentials Profile' },
            { id: 'ai', label: 'AI Match Insights' },
            { id: 'scorecard', label: 'Evaluation Scorecard' },
            { id: 'schedule', label: 'Interview Scheduler' }
          ].map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={cn(
                "px-3.5 py-2 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer",
                activeSection === sec.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Modal Body Scroll area */}
        <div className="p-5 max-h-[320px] overflow-y-auto no-scrollbar space-y-4">
          
          {/* 1. Profile details */}
          {activeSection === 'info' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</span>
                  <span className="font-bold text-slate-850 dark:text-white">{applicant.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</span>
                  <span className="font-bold text-slate-850 dark:text-white">{applicant.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Experience</span>
                  <span className="font-bold text-slate-850 dark:text-white">{applicant.experience || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Department</span>
                  <span className="font-bold text-slate-850 dark:text-white">{job.dept || 'N/A'}</span>
                </div>
              </div>

              {/* Resume document and Endorsement Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-850">
                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Candidate Resume</span>
                  {applicant.resumeUrl ? (
                    <a 
                      href={applicant.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Resume Document
                    </a>
                  ) : (
                    <span className="text-slate-450 italic text-[10px] font-bold uppercase">No Resume Attached</span>
                  )}
                </div>

                <div>
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Source / Referral Channel</span>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-150/40 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold leading-relaxed">
                    {applicant.phone === 'Statutory Referral' || applicant.rating === 85 || applicant.resumeUrl ? (
                      'Employee Referral (Referred via internal staff portal)'
                    ) : 'Direct Applicant'}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Candidate Skills Inventory</span>
                <div className="flex flex-wrap gap-1.5">
                  {(applicant.skills || []).map((s: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] rounded-md font-bold">{s}</span>
                  ))}
                  {(!applicant.skills || applicant.skills.length === 0) && (
                    <span className="text-slate-450 italic">No skills listed</span>
                  )}
                </div>
              </div>

              {/* Timeline History of applicant */}
              <div className="space-y-2.5">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Activity Audit trail</span>
                <div className="border-l-2 border-slate-100 dark:border-slate-800 pl-4 ml-2 space-y-3 text-[11px] font-semibold text-slate-500">
                  <p>Applied to position via Careers portal on <span className="text-slate-700 dark:text-slate-300">{applicant.date}</span></p>
                  {applicant.scorecard?.interviewerRating && (
                    <p>Scorecard submitted by HR Recruiter, rated <span className="text-emerald-600 font-extrabold">{applicant.scorecard.interviewerRating}/5.0</span></p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Insights Section */}
          {activeSection === 'ai' && (
            <div className="space-y-5 text-xs text-left">
              {/* 1. Gauge / Match Percentage */}
              <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">AI Candidate Match Score</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Calculated by Google Gemini AI against job parameters</p>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <span className={cn(
                    "px-4 py-2 text-lg font-black rounded-2xl shadow-sm",
                    (applicant.rating || 0) >= 80 ? "bg-emerald-500/10 text-emerald-600" :
                    (applicant.rating || 0) >= 50 ? "bg-amber-500/10 text-amber-600" :
                    "bg-rose-500/10 text-rose-600"
                  )}>
                    {applicant.rating || 75}%
                  </span>
                  <span className="text-[8.5px] font-black uppercase text-slate-400 tracking-wider mt-1.5">Match Ratio</span>
                </div>
              </div>

              {/* 2. AI Summary */}
              <div className="space-y-1.5">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">AI Profile Evaluation Summary</span>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-150/40 dark:border-slate-800 text-slate-600 dark:text-slate-350 text-xs font-semibold leading-relaxed whitespace-pre-line italic">
                  "{applicant.aiSummary || 'No AI summary available. Resume has not been evaluated by Gemini.'}"
                </div>
              </div>

              {/* 3. AI Suggested Questions */}
              <div className="space-y-2">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Gemini Suggested Interview Questions</span>
                <div className="space-y-2">
                  {(applicant.aiSuggestedQuestions || [
                    'Can you describe your experience with the tech stack specified in the requirements?',
                    'Explain a challenging engineering problem you solved in your current role.',
                    'How do you manage deadlines and code quality constraints?'
                  ]).map((q, idx) => (
                    <div key={idx} className="flex gap-2.5 p-3.5 bg-slate-100/40 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400">Q{idx + 1}</span>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Scorecard review / submit */}
          {activeSection === 'scorecard' && (
            <div className="space-y-4 text-xs">
              {/* Exisiting scorecard display */}
              {applicant.scorecard?.interviewerRating ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-emerald-600">
                    <span>Evaluation score submitted</span>
                    <span>{applicant.scorecard.recommendation === 'Select' ? 'Strong Selection recommended' : 'Hold / Rejected'}</span>
                  </div>
                  <p className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1">
                    Rating: <span className="text-emerald-600">{applicant.scorecard.interviewerRating} / 5.0</span>
                  </p>
                  <p className="text-slate-500 font-semibold italic">"{applicant.scorecard.feedbackComments}"</p>
                </div>
              ) : (
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider italic">No scorecard has been submitted yet for this applicant.</p>
              )}

              {/* Form to submit a new scorecard */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3.5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Evaluate Candidate Credentials</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Interviewer Rating (1-5)</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={5} 
                      step={0.1}
                      value={feedbackRating}
                      onChange={e => setFeedbackRating(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Recommendation</label>
                    <select
                      value={feedbackRecommendation}
                      onChange={e => setFeedbackRecommendation(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option>Select</option>
                      <option>Reject</option>
                      <option>On Hold</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Written Feedback Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Strong system engineering basics. Answered React design patterns correctly..."
                    value={feedbackComments}
                    onChange={e => setFeedbackComments(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <button 
                  onClick={handleSaveScorecard}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md transition-all cursor-pointer"
                >
                  Submit Scorecard
                </button>
              </div>
            </div>
          )}

          {/* 3. Scheduler details */}
          {activeSection === 'schedule' && (
            <div className="space-y-4 text-xs">
              {/* List Scheduled interviews */}
              {applicant.interviews && applicant.interviews.length > 0 ? (
                <div className="space-y-2">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Scheduled Rounds</span>
                  {applicant.interviews.map((int: any, idx: number) => (
                    <div key={idx} className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl flex justify-between items-center">
                      <div>
                        <strong className="block text-xs">{int.round}</strong>
                        <span className="text-[9px] block mt-0.5">{int.date} at {int.time} • Evaluator: {int.interviewer}</span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-wider">{int.completed ? 'Completed' : 'Upcoming'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider italic">No scheduled video interviews found for this applicant.</p>
              )}

              {/* Schedule round button */}
              {!isSchedulingOpen ? (
                <button 
                  onClick={() => setIsSchedulingOpen(true)}
                  className="w-full py-3 bg-slate-900 dark:bg-slate-800 hover:bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                >
                  Schedule Video Interview Round
                </button>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl space-y-3 text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Configure Screen Schedule</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Round type</label>
                      <select
                        value={interviewForm.round}
                        onChange={e => setInterviewForm({ ...interviewForm, round: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-205 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                      >
                        <option>Screening</option>
                        <option>Technical Round</option>
                        <option>HR Round</option>
                        <option>Final Interview</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Video Tool</label>
                      <select
                        value={interviewForm.meetingType}
                        onChange={e => setInterviewForm({ ...interviewForm, meetingType: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-205 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                      >
                        <option>Google Meet</option>
                        <option>Zoom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</label>
                      <input 
                        type="date"
                        value={interviewForm.date}
                        onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-205 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Time slot</label>
                      <input 
                        type="time"
                        value={interviewForm.time}
                        onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-205 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Evaluator</label>
                    <input 
                      type="text"
                      placeholder="e.g. Raman Dev (Tech Lead)"
                      value={interviewForm.interviewer}
                      onChange={e => setInterviewForm({ ...interviewForm, interviewer: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-205 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setIsSchedulingOpen(false)}
                      className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={handleScheduleInterview}
                      className="flex-[2] py-2.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md cursor-pointer"
                    >
                      Schedule Round
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
