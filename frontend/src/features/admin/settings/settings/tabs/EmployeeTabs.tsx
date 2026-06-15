"use client";

import React, { useRef, useState } from 'react';
import { X, Key, Upload, Trash2, ExternalLink, FileText, CheckCircle, AlertCircle, FileCheck, HelpCircle, Laptop, Sun, Moon, Type, Layout } from 'lucide-react';
import { cn } from "@/lib/utils";

interface EmployeeTabsProps {
  activeCategory: string;
  profileDetails: {
    fullName: string;
    email: string;
    phone: string;
    department: string;
    designation: string;
    location: string;
    profilePicture: string;
    emergencyContact: string;
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    address?: string;
    panNumber?: string;
    uanNumber?: string;
    joinedDate?: string | null;
    documents?: Array<{
      name: string;
      fileUrl: string;
      status: string;
      uploadedAt: any;
    }>;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      ifscCode: string;
      accountHolderName?: string;
    };
  };
  setProfileDetails: React.Dispatch<React.SetStateAction<any>>;
  employeeBio: string;
  setEmployeeBio: (val: string) => void;
  skillsList: string[];
  setSkillsList: React.Dispatch<React.SetStateAction<string[]>>;
  newSkillInput: string;
  setNewSkillInput: (val: string) => void;
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  changingPassword: boolean;
  handleChangePassword: (e: React.FormEvent) => void;
  employeePrivacy: {
    showProfilePhoto: boolean;
    showContactNumber: boolean;
    showOnlineIndicator: boolean;
    shareSprintActivity?: boolean;
  };
  setEmployeePrivacy: React.Dispatch<React.SetStateAction<any>>;
  employeeNotifs: {
    taskReminders: boolean;
    payrollAlerts: boolean;
    attendanceAlerts: boolean;
  };
  setEmployeeNotifs: React.Dispatch<React.SetStateAction<any>>;
  themeMode: string;
  setThemeMode: (val: string) => void;
  fontSize: string;
  setFontSize: (val: string) => void;
  compactLayout: boolean;
  setCompactLayout: (val: boolean) => void;
  triggerToast: (msg: string) => void;
  onPhotoUploaded?: (url: string) => void;
  chatDisplayName: string;
  setChatDisplayName: (val: string) => void;
  chatStatusText: string;
  setChatStatusText: (val: string) => void;
  chatStatusEmoji: string;
  setChatStatusEmoji: (val: string) => void;
  chatPresence: string;
  setChatPresence: (val: string) => void;
  chatMuteSound: boolean;
  setChatMuteSound: (val: boolean) => void;
  chatNotifLevel: string;
  setChatNotifLevel: (val: string) => void;
  chatDndActive: boolean;
  setChatDndActive: (val: boolean) => void;
}

export function EmployeeTabs({
  activeCategory,
  profileDetails,
  setProfileDetails,
  employeeBio,
  setEmployeeBio,
  skillsList,
  setSkillsList,
  newSkillInput,
  setNewSkillInput,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  changingPassword,
  handleChangePassword,
  employeePrivacy,
  setEmployeePrivacy,
  employeeNotifs,
  setEmployeeNotifs,
  themeMode,
  setThemeMode,
  fontSize,
  setFontSize,
  compactLayout,
  setCompactLayout,
  triggerToast,
  onPhotoUploaded,
  chatDisplayName,
  setChatDisplayName,
  chatStatusText,
  setChatStatusText,
  chatStatusEmoji,
  setChatStatusEmoji,
  chatPresence,
  setChatPresence,
  chatMuteSound,
  setChatMuteSound,
  chatNotifLevel,
  setChatNotifLevel,
  chatDndActive,
  setChatDndActive
}: EmployeeTabsProps) {
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [customDocName, setCustomDocName] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append('file', file);

      const token = localStorage.getItem('hr_system_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: data
      });

      if (res.ok) {
        const json = await res.json();
        setProfileDetails((prev: any) => {
          const updatedProfile = {
            ...prev,
            profilePicture: json.url
          };

          // Auto-save profile photo to DB instantly
          const token = localStorage.getItem('hr_system_token');
          if (token) {
            fetch('/api/settings/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ profile: updatedProfile })
            }).catch(err => console.error("Auto-save profile photo failed:", err));
          }

          return updatedProfile;
        });

        // Immediately sync to global profile state (navbar avatar)
        if (onPhotoUploaded) onPhotoUploaded(json.url);
        triggerToast("Profile photo uploaded successfully!");
      } else {
        triggerToast("Failed to upload profile photo.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error uploading profile photo.");
    } finally {
      setUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleDeleteProfilePhoto = async () => {
    try {
      setProfileDetails((prev: any) => {
        const updatedProfile = {
          ...prev,
          profilePicture: ''
        };

        // Auto-save cleared profile photo to DB instantly
        const token = localStorage.getItem('hr_system_token');
        if (token) {
          fetch('/api/settings/user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ profile: updatedProfile })
          }).catch(err => console.error("Auto-delete profile photo failed:", err));
        }

        return updatedProfile;
      });

      // Sync global profile state (navbar avatar)
      if (onPhotoUploaded) onPhotoUploaded('');
      triggerToast("Profile photo removed successfully!");
    } catch (err) {
      console.error(err);
      triggerToast("Error removing profile photo.");
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(docName);
    try {
      const data = new FormData();
      data.append('file', file);

      const token = localStorage.getItem('hr_system_token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: data
      });

      if (res.ok) {
        const json = await res.json();
        const fileUrl = json.url;
        
        const currentDocs = profileDetails.documents || [];
        const existingIdx = currentDocs.findIndex(d => d.name === docName);
        const newDoc = {
          name: docName,
          fileUrl,
          status: 'Pending Verification',
          uploadedAt: new Date().toISOString()
        };

        let updatedDocs;
        if (existingIdx > -1) {
          updatedDocs = [...currentDocs];
          updatedDocs[existingIdx] = newDoc;
        } else {
          updatedDocs = [...currentDocs, newDoc];
        }

        setProfileDetails((prev: any) => {
          const updatedProfile = {
            ...prev,
            documents: updatedDocs
          };

          // Auto-save documents to DB instantly
          const token = localStorage.getItem('hr_system_token');
          if (token) {
            fetch('/api/settings/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ profile: updatedProfile })
            }).catch(err => console.error("Auto-save documents failed:", err));
          }

          return updatedProfile;
        });

        triggerToast(`Document "${docName}" uploaded successfully!`);
      } else {
        triggerToast("Failed to upload document.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error uploading document.");
    } finally {
      setUploadingDoc(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleDocDelete = (docName: string) => {
    const currentDocs = profileDetails.documents || [];
    const updatedDocs = currentDocs.filter(d => d.name !== docName);
    
    setProfileDetails((prev: any) => {
      const updatedProfile = {
        ...prev,
        documents: updatedDocs
      };

      // Auto-save documents to DB instantly
      const token = localStorage.getItem('hr_system_token');
      if (token) {
        fetch('/api/settings/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profile: updatedProfile })
        }).catch(err => console.error("Auto-save documents failed:", err));
      }

      return updatedProfile;
    });

    triggerToast(`Document "${docName}" removed.`);
  };

  const requiredDocs = [
    "Resume / CV",
    "Aadhaar Card / Gov ID",
    "Degree Certificate",
    "Previous Experience Letter",
    "Signed Offer Letter"
  ];

  return (
    <>
      {/* Profile Settings */}
      {activeCategory === 'employee-profile' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Profile Details</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Modify profile photo URL, professional skills tags and secure banking details</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── READ-ONLY: Work Information (from HR creation) ─────── */}
            <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Work Information</span>
                <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wide">Read Only · Managed by HR</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Email Address</label>
                  <input
                    type="text"
                    value={profileDetails.email || ''}
                    disabled
                    className="saas-input w-full px-3 py-2 opacity-60 bg-slate-100 dark:bg-slate-900 text-xs cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Department</label>
                  <input
                    type="text"
                    value={profileDetails.department || ''}
                    disabled
                    className="saas-input w-full px-3 py-2 opacity-60 bg-slate-100 dark:bg-slate-900 text-xs cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Designation</label>
                  <input
                    type="text"
                    value={profileDetails.designation || ''}
                    disabled
                    className="saas-input w-full px-3 py-2 opacity-60 bg-slate-100 dark:bg-slate-900 text-xs cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Location / Office</label>
                  <input
                    type="text"
                    value={profileDetails.location || ''}
                    disabled
                    className="saas-input w-full px-3 py-2 opacity-60 bg-slate-100 dark:bg-slate-900 text-xs cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Joining Date</label>
                  <input
                    type="text"
                    value={
                      profileDetails.joinedDate
                        ? new Date(profileDetails.joinedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                        : ''
                    }
                    disabled
                    className="saas-input w-full px-3 py-2 opacity-60 bg-slate-100 dark:bg-slate-900 text-xs cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            {/* ──────────────────────────────────────────────────────── */}

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                value={profileDetails.fullName}
                onChange={e => setProfileDetails({ ...profileDetails, fullName: e.target.value })}
                className="saas-input w-full px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Profile Photo</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter image URL..."
                  value={profileDetails.profilePicture}
                  onChange={e => setProfileDetails({ ...profileDetails, profilePicture: e.target.value })}
                  className="saas-input flex-1 px-3 py-2"
                />
                <input 
                  type="file"
                  id="profile-photo-upload"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="profile-photo-upload"
                  className="px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shrink-0"
                >
                  {uploadingPhoto ? (
                    <span className="w-3.5 h-3.5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {uploadingPhoto ? 'Uploading...' : 'Upload'}
                </label>
                {profileDetails.profilePicture && (
                  <button
                    type="button"
                    onClick={handleDeleteProfilePhoto}
                    className="px-3.5 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
              <input 
                type="text" 
                value={profileDetails.phone}
                onChange={e => setProfileDetails({ ...profileDetails, phone: e.target.value })}
                className="saas-input w-full px-3 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Emergency Contact Number</label>
              <input 
                type="text" 
                value={profileDetails.emergencyContact}
                onChange={e => setProfileDetails({ ...profileDetails, emergencyContact: e.target.value })}
                className="saas-input w-full px-3 py-2"
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Professional Bio Summary</label>
              <textarea 
                value={employeeBio}
                onChange={e => setEmployeeBio(e.target.value)}
                rows={3}
                className="saas-input w-full p-3 text-xs"
              />
            </div>

            <div className="space-y-3 col-span-1 md:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Skills & Framework Matrix</label>
              <div className="flex flex-wrap gap-2">
                {skillsList.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold flex items-center gap-1.5">
                    {skill}
                    <button 
                      type="button"
                      onClick={() => setSkillsList(skillsList.filter(s => s !== skill))}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2 max-w-sm pt-1">
                <input 
                  type="text" 
                  placeholder="E.g. Next.js, Docker..."
                  value={newSkillInput}
                  onChange={e => setNewSkillInput(e.target.value)}
                  className="saas-input w-full px-3 py-1.5 text-xs"
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (!newSkillInput.trim()) return;
                    setSkillsList([...skillsList, newSkillInput.trim()]);
                    setNewSkillInput('');
                    triggerToast("Skills badge updated.");
                  }}
                  className="px-4 py-1.5 bg-slate-850 hover:bg-slate-700 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4 col-span-1 md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Bank Accounts Details (for Payouts)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bank Name</label>
                  <input 
                    type="text" 
                    value={profileDetails.bankDetails?.bankName}
                    onChange={e => setProfileDetails({
                      ...profileDetails,
                      bankDetails: { ...profileDetails.bankDetails, bankName: e.target.value }
                    })}
                    className="saas-input w-full px-3 py-1.5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Account Number</label>
                  <input 
                    type="text" 
                    value={profileDetails.bankDetails?.accountNumber}
                    onChange={e => setProfileDetails({
                      ...profileDetails,
                      bankDetails: { ...profileDetails.bankDetails, accountNumber: e.target.value }
                    })}
                    className="saas-input w-full px-3 py-1.5 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IFSC / Routing Code</label>
                  <input 
                    type="text" 
                    value={profileDetails.bankDetails?.ifscCode}
                    onChange={e => setProfileDetails({
                      ...profileDetails,
                      bankDetails: { ...profileDetails.bankDetails, ifscCode: e.target.value }
                    })}
                    className="saas-input w-full px-3 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Personal Custom Details */}
            <div className="space-y-4 col-span-1 md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Additional Personal Information</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</label>
                  <input 
                    type="date" 
                    value={profileDetails.dateOfBirth}
                    onChange={e => setProfileDetails({ ...profileDetails, dateOfBirth: e.target.value })}
                    className="saas-input w-full px-3 py-1.5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Gender</label>
                  <select 
                    value={profileDetails.gender}
                    onChange={e => setProfileDetails({ ...profileDetails, gender: e.target.value })}
                    className="saas-input w-full px-3 py-1.5 cursor-pointer font-bold"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Blood Group</label>
                  <input 
                    type="text" 
                    placeholder="e.g. O+, B-"
                    value={profileDetails.bloodGroup}
                    onChange={e => setProfileDetails({ ...profileDetails, bloodGroup: e.target.value })}
                    className="saas-input w-full px-3 py-1.5"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Residence Address</label>
                <textarea 
                  value={profileDetails.address}
                  onChange={e => setProfileDetails({ ...profileDetails, address: e.target.value })}
                  rows={2}
                  className="saas-input w-full p-3 text-xs"
                  placeholder="Your complete residential address..."
                />
              </div>
            </div>

            {/* Government IDs */}
            <div className="space-y-4 col-span-1 md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Government Identifiers & IDs</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PAN Card Number</label>
                  <input 
                    type="text" 
                    placeholder="ABCDE1234F"
                    value={profileDetails.panNumber}
                    onChange={e => setProfileDetails({ ...profileDetails, panNumber: e.target.value.toUpperCase() })}
                    className="saas-input w-full px-3 py-1.5 font-mono uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">UAN (Provident Fund Number)</label>
                  <input 
                    type="text" 
                    placeholder="12 digit UAN number"
                    value={profileDetails.uanNumber}
                    onChange={e => setProfileDetails({ ...profileDetails, uanNumber: e.target.value })}
                    className="saas-input w-full px-3 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings */}
      {activeCategory === 'employee-account' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-909 dark:text-white">Account settings</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Modify password credentials and customize profile directory visibility levels</p>
          </div>

          {/* Password Change Form */}
          <form onSubmit={handleChangePassword} className="p-5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4 max-w-md">
            <span className="font-black uppercase text-slate-900 dark:text-white block">Change Password Credentials</span>
            
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Current Password</label>
              <input 
                type="password" 
                required
                placeholder="Enter current password..."
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="saas-input w-full px-3 py-1.5"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">New Password</label>
              <input 
                type="password" 
                required
                placeholder="Min 8 characters..."
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="saas-input w-full px-3 py-1.5"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confirm New Password</label>
              <input 
                type="password" 
                required
                placeholder="Repeat new password..."
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="saas-input w-full px-3 py-1.5"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-[9px] font-black uppercase cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              Change Password
            </button>
          </form>

          {/* Privacy toggles */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="font-black uppercase text-slate-900 dark:text-white block">Profile Directory Privacy settings</span>
            {[
              { id: 'showProfilePhoto', title: 'Display avatar photo to all system members', desc: 'Allows members outside your department to view avatar details' },
              { id: 'showContactNumber', title: 'Show contact numbers in company directory list', desc: 'Expose phone details inside directories search list' },
              { id: 'showOnlineIndicator', title: 'Display green online indicator dot', desc: 'Show active status dot inside team boards' }
            ].map(toggle => (
              <div key={toggle.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl">
                <div>
                  <span className="font-black uppercase text-slate-900 dark:text-white">{toggle.title}</span>
                  <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">{toggle.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmployeePrivacy((prev: any) => ({ ...prev, [toggle.id]: !prev[toggle.id as keyof typeof prev] }))}
                  className={cn(
                    "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                    employeePrivacy[toggle.id as keyof typeof employeePrivacy] ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
                  )}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification settings */}
      {activeCategory === 'employee-notifications' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-909 dark:text-white">Notification settings</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Set preference triggers for task timelines alerts and payslips updates notifications</p>
          </div>

          <div className="space-y-4">
            {[
              { id: 'taskReminders', title: 'Task Deadline reminders alerts', desc: 'Send notification details when a project deadline approaches' },
              { id: 'payrollAlerts', title: 'Payslip generation notifications', desc: 'Notify immediately when monthly payslips are compiled and active' },
              { id: 'attendanceAlerts', title: 'Attendance missing alerts warnings', desc: 'Remind me if I forget to log check-outs stamps' }
            ].map(alert => (
              <div key={alert.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl">
                <div>
                  <span className="font-black uppercase text-slate-900 dark:text-white">{alert.title}</span>
                  <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">{alert.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEmployeeNotifs((prev: any) => ({ ...prev, [alert.id]: !prev[alert.id as keyof typeof prev] }))}
                  className={cn(
                    "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                    employeeNotifs[alert.id as keyof typeof employeeNotifs] ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
                  )}
                >
                  <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Uploaded Documents */}
      {activeCategory === 'employee-documents' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Uploaded Documents</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Upload and manage verification credentials required for a Software Engineer</p>
          </div>

          {/* Documents Grid / Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredDocs.map(docName => {
              const doc = profileDetails.documents?.find(d => d.name === docName);
              const fileInputId = `file-input-${docName.replace(/\s+/g, '-').toLowerCase()}`;
              return (
                <div key={docName} className="p-4 bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black uppercase text-slate-900 dark:text-white block">{docName}</span>
                      {doc ? (
                        <span className={cn(
                          "inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider",
                          doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                        )}>
                          {doc.status === 'Approved' ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5 animate-pulse" />}
                          {doc.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Not Uploaded
                        </span>
                      )}
                    </div>
                    {doc && (
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100/60 dark:border-slate-800/40 justify-end">
                    {doc ? (
                      <>
                        <a 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDocDelete(docName)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <input 
                          type="file"
                          id={fileInputId}
                          onChange={(e) => handleDocUpload(e, docName)}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          className="hidden"
                        />
                        <label
                          htmlFor={fileInputId}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/10"
                        >
                          {uploadingDoc === docName ? (
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3" />
                          )}
                          {uploadingDoc === docName ? 'Uploading...' : 'Upload Document'}
                        </label>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Document Upload Option */}
          <div className="p-5 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
            <div>
              <span className="font-black uppercase text-slate-900 dark:text-white block text-[10px] tracking-wider">Upload Additional / Custom Document</span>
              <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">Need to upload something else? Type in the title and select your file.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-end max-w-xl">
              <div className="w-full sm:flex-1 space-y-2">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Document Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Relieving Letter, Certification..."
                  value={customDocName}
                  onChange={e => setCustomDocName(e.target.value)}
                  className="saas-input w-full px-3 py-2 text-xs"
                />
              </div>
              <div className="w-full sm:w-auto">
                <input 
                  type="file"
                  id="custom-doc-input"
                  onChange={async (e) => {
                    if (!customDocName.trim()) {
                      triggerToast("Please enter a document name first.");
                      return;
                    }
                    await handleDocUpload(e, customDocName.trim());
                    setCustomDocName("");
                  }}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label
                  htmlFor="custom-doc-input"
                  className={cn(
                    "w-full sm:w-auto px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md",
                    customDocName.trim() 
                      ? "bg-slate-900 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-slate-500/10" 
                      : "bg-slate-200 dark:bg-slate-800 text-slate-450 dark:text-slate-500 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Custom
                </label>
              </div>
            </div>
          </div>

          {/* List of Custom Uploaded Documents */}
          {profileDetails.documents && profileDetails.documents.filter(d => !requiredDocs.includes(d.name)).length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="font-black uppercase text-slate-900 dark:text-white block text-[10px] tracking-wider">Other Uploaded Documents</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profileDetails.documents?.filter(d => !requiredDocs.includes(d.name)).map(doc => (
                  <div key={doc.name} className="p-4 bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-black uppercase text-slate-900 dark:text-white block">{doc.name}</span>
                        <span className={cn(
                          "inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider",
                          doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                        )}>
                          {doc.status === 'Approved' ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5 animate-pulse" />}
                          {doc.status}
                        </span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100/60 dark:border-slate-800/40 justify-end">
                      <a 
                        href={doc.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDocDelete(doc.name)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workplace Chat Settings */}
      {activeCategory === 'employee-chat' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              Workplace Chat Settings
            </h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Configure Slack-style display name, custom status, presence status, and snoozes triggers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Custom display name */}
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Chat Display Name</label>
              <input 
                type="text" 
                placeholder="e.g. raj.patil"
                value={chatDisplayName}
                onChange={e => setChatDisplayName(e.target.value)}
                className="saas-input w-full px-3 py-2 text-xs"
              />
              <p className="text-[8px] text-slate-400 uppercase font-medium">This will be shown instead of your full name inside channels and direct messages.</p>
            </div>

            {/* Availability presence */}
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Availability Presence Status</label>
              <select
                value={chatPresence}
                onChange={e => setChatPresence(e.target.value)}
                className="saas-input w-full px-3 py-2 text-xs cursor-pointer font-bold"
              >
                <option value="online">🟢 Active / Online</option>
                <option value="away">⚪ Away / Offline</option>
              </select>
              <p className="text-[8px] text-slate-400 uppercase font-medium">Configure whether you are shown as active to colleagues.</p>
            </div>

            {/* Status emoji & text */}
            <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-3 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Slack-Style Current Status Message</label>
              <div className="flex gap-3">
                <select
                  value={chatStatusEmoji}
                  onChange={e => setChatStatusEmoji(e.target.value)}
                  className="w-16 h-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-center text-lg outline-none cursor-pointer"
                >
                  <option value="">💬</option>
                  <option value="💻">💻</option>
                  <option value="🗓️">🗓️</option>
                  <option value="🚗">🚗</option>
                  <option value="🤒">🤒</option>
                  <option value="🏠">🏠</option>
                  <option value="🌴">🌴</option>
                </select>
                <input 
                  type="text"
                  placeholder="What is your current status? (e.g. In a meeting, out sick, remote)"
                  value={chatStatusText}
                  onChange={e => setChatStatusText(e.target.value)}
                  className="saas-input flex-1 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { emoji: '💻', text: 'Focusing / Working' },
                  { emoji: '🗓️', text: 'In a meeting' },
                  { emoji: '🚗', text: 'Commuting' },
                  { emoji: '🤒', text: 'Out sick' },
                  { emoji: '🏠', text: 'Working remotely' }
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.text}
                    onClick={() => { setChatStatusEmoji(opt.emoji); setChatStatusText(opt.text); }}
                    className="px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-bold text-slate-500 cursor-pointer"
                  >
                    {opt.emoji} {opt.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Mute alerts toggle */}
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl col-span-1 md:col-span-2 text-left">
              <div>
                <span className="font-black uppercase text-slate-900 dark:text-white text-[10px] tracking-wider block">Mute Chat Sound Alerts</span>
                <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">Disable notification chime sound for new message arrivals</p>
              </div>
              <button
                type="button"
                onClick={() => setChatMuteSound(!chatMuteSound)}
                className={cn(
                  "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                  chatMuteSound ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
                )}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* DND Toggle */}
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-850/50 rounded-2xl col-span-1 md:col-span-2 text-left">
              <div>
                <span className="font-black uppercase text-slate-900 dark:text-white text-[10px] tracking-wider block">Do Not Disturb (DND) / Snooze</span>
                <p className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">Snooze all incoming push alerts and messages indicators</p>
              </div>
              <button
                type="button"
                onClick={() => setChatDndActive(!chatDndActive)}
                className={cn(
                  "w-10 h-6 rounded-full p-1 transition-all cursor-pointer",
                  chatDndActive ? "bg-blue-600 flex justify-end" : "bg-slate-200 dark:bg-slate-850 flex justify-start"
                )}
              >
                <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {/* Notification level */}
            <div className="space-y-2 col-span-1 md:col-span-2 text-left">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">New Message Alerts Settings</label>
              <select
                value={chatNotifLevel}
                onChange={e => setChatNotifLevel(e.target.value)}
                className="saas-input w-full px-3 py-2.5 cursor-pointer font-bold text-xs"
              >
                <option value="all">🔔 All new messages and announcements</option>
                <option value="dm_mentions">💬 Direct messages and @mentions only</option>
                <option value="nothing">🔕 Nothing (Mute everything)</option>
              </select>
              <p className="text-[8px] text-slate-400 uppercase font-medium">Select when Workplace Chat sends you notification updates.</p>
            </div>

          </div>
        </div>
      )}

      {/* Appearance & Theme Settings */}
      {activeCategory === 'employee-appearance' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Appearance & Theme</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">Customize the layout density, typography scale, and dark/light color scheme of your workspace</p>
          </div>

          <div className="space-y-6 max-w-2xl text-left">
            {/* 1. Interface Theme Selector */}
            <div className="space-y-3">
              <label className="text-[9px] font-black text-slate-450 dark:text-slate-400 uppercase tracking-widest block">Color Scheme Preference</label>
              <div className="grid grid-cols-2 gap-4">
                {/* Light Mode Option */}
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('Light');
                    if (typeof window !== 'undefined') {
                      document.documentElement.classList.remove('dark');
                      localStorage.setItem('hr_system_dark_mode', 'false');
                    }
                  }}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group",
                    themeMode === 'Light'
                      ? "bg-blue-600/5 dark:bg-blue-900/10 border-blue-600 dark:border-blue-500 shadow-sm shadow-blue-500/5"
                      : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                    themeMode === 'Light'
                      ? "bg-blue-600 text-white border-blue-650"
                      : "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800"
                  )}>
                    <Sun className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-black uppercase tracking-wide text-slate-900 dark:text-white block text-[10px]">Pristine Light</span>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Clean off-whites and soft light gray surfaces</p>
                  </div>
                  {themeMode === 'Light' && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full" />
                  )}
                </button>

                {/* Dark Mode Option */}
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('Dark');
                    if (typeof window !== 'undefined') {
                      document.documentElement.classList.add('dark');
                      localStorage.setItem('hr_system_dark_mode', 'true');
                    }
                  }}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group",
                    themeMode === 'Dark'
                      ? "bg-blue-600/5 dark:bg-blue-900/10 border-blue-600 dark:border-blue-500 shadow-sm shadow-blue-500/5"
                      : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300",
                    themeMode === 'Dark'
                      ? "bg-blue-600 text-white border-blue-650"
                      : "bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800"
                  )}>
                    <Moon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-black uppercase tracking-wide text-slate-900 dark:text-white block text-[10px]">Premium Dark</span>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Deep slate hues and high contrast text</p>
                  </div>
                  {themeMode === 'Dark' && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 dark:bg-blue-500 rounded-full" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
