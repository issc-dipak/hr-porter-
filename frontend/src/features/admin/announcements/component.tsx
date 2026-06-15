"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Megaphone, Plus, Search, Filter, Calendar, User, 
  CheckCircle, AlertCircle, Bookmark, Sparkles, Loader2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface IAnnouncement {
  _id?: string;
  title: string;
  content: string;
  category: string; // 'Urgent' | 'General' | 'Event' | 'Policy'
  postedBy: string;
  createdAt: Date | string;
}

export function AnnouncementsPage({ userRole = 'HR' }: { userRole?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnn, setNewAnn] = useState({
    title: '',
    content: '',
    category: 'General',
    postedBy: 'HR Management Team'
  });

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/announcements', { headers });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('hr_system_token');
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers,
        body: JSON.stringify(newAnn)
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewAnn({
          title: '',
          content: '',
          category: 'General',
          postedBy: 'HR Management Team'
        });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Failed to create announcement:', error);
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
                          a.content.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === 'All' || a.category === catFilter;
    return matchesSearch && matchesCat;
  });

  const canPublish = userRole === 'Admin' || userRole === 'HR';

  return (
    <div className="p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse shrink-0" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-outfit">Corporate Announcements</h1>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Publish or check global policy amendments, town halls, and official communications.
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchAnnouncements}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {canPublish && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="saas-btn-primary cursor-pointer flex-1 sm:flex-none justify-center"
            >
              <Plus className="w-4 h-4" /> Publish Broadcast
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex-1 w-full md:max-w-md">
          <input 
            type="text" 
            placeholder="Search announcements, key phrases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="saas-input w-full pr-4 py-2 text-xs"
          />
        </div>

        <div className="flex bg-slate-150/70 dark:bg-slate-955/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800 w-fit max-w-full overflow-x-auto scrollbar-none shadow-inner">
          {['All', 'Urgent', 'General', 'Policy', 'Event'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-widest transition-all duration-350 cursor-pointer border-none whitespace-nowrap shrink-0",
                catFilter === cat 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-650 text-white shadow-md shadow-blue-500/15" 
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Listing */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Bulletins...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="saas-card py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">No Announcements</h3>
          <p className="text-xs text-slate-400 mt-2 px-6">
            There are no registered bulletins to display. Official statements will be pinned here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAnnouncements.map((ann, idx) => (
            <motion.div
              key={ann._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="saas-card p-6 flex flex-col justify-between hover:border-slate-300/40 relative overflow-hidden"
            >
              {ann.category === 'Urgent' && (
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse" />
              )}
              
              <div>
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider ${
                    ann.category === 'Urgent' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' :
                    ann.category === 'Policy' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' :
                    ann.category === 'Event' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}>
                    {ann.category} Broadcast
                  </span>
                  
                  <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>{new Date(ann.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white mt-4 uppercase tracking-tight font-outfit">
                  {ann.title}
                </h3>
                
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 whitespace-pre-line leading-relaxed">
                  {ann.content}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-6 flex justify-between items-center text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>By: <span className="text-slate-700 dark:text-slate-200">{ann.postedBy}</span></span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="announcements-modal bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative border border-slate-100 dark:border-slate-800"
            >
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase font-outfit mb-4">Publish Bulletins</h2>
              
              <form onSubmit={handleAddAnnouncement} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Bulletin Title</label>
                  <input 
                    type="text" 
                    required 
                    value={newAnn.title}
                    onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                    className="saas-input w-full px-3 py-2 text-xs" 
                    placeholder="Townhall Scheduled / Policy Update..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Category</label>
                    <select 
                      value={newAnn.category}
                      onChange={(e) => setNewAnn({ ...newAnn, category: e.target.value })}
                      className="saas-input w-full px-3 py-2 text-xs cursor-pointer"
                    >
                      <option value="General">General Broadcast</option>
                      <option value="Urgent">Urgent (Red-alert)</option>
                      <option value="Policy">Policy Update</option>
                      <option value="Event">Townhall / Event</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Publisher Name</label>
                    <input 
                      type="text" 
                      required 
                      value={newAnn.postedBy}
                      onChange={(e) => setNewAnn({ ...newAnn, postedBy: e.target.value })}
                      className="saas-input w-full px-3 py-2 text-xs" 
                      placeholder="e.g. HR Department"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Bulletin Content</label>
                  <textarea 
                    required 
                    value={newAnn.content}
                    onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                    className="saas-input w-full px-3 py-2 text-xs h-32" 
                    placeholder="Enter details of announcement or instructions for employees..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="saas-btn-primary cursor-pointer"
                  >
                    Publish Broadcast
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
