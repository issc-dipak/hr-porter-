import React, { useState } from 'react';
import { 
  Upload, Palette, Layout, Mail, Building, 
  Image, Sparkles, RefreshCw, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useBrandingStore, BrandingData } from '@/store/useBrandingStore';

interface BrandingTabProps {
  activeCategory: string;
  triggerToast: (msg: string) => void;
}

export function BrandingTab({ activeCategory, triggerToast }: BrandingTabProps) {
  const { branding, updateBrandingState, saveBranding, fetchBranding } = useBrandingStore();
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'login' | 'dashboard' | 'components'>('dashboard');

  if (activeCategory !== 'branding') return null;

  const presets = [
    { name: 'Blue Theme (Default)', primary: '#2563eb', secondary: '#4f46e5', accent: '#06b6d4' },
    { name: 'Green Theme', primary: '#16a34a', secondary: '#0d9488', accent: '#10b981' },
    { name: 'Purple Theme', primary: '#7c3aed', secondary: '#db2777', accent: '#8b5cf6' },
    { name: 'Sunset Theme', primary: '#ea580c', secondary: '#db2777', accent: '#e11d48' },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    updateBrandingState({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    });
    triggerToast(`Applied preset: ${preset.name}`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon' | 'login-banner' | 'login-background' | 'watermark') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(type);
    try {
      const token = localStorage.getItem('hr_system_token');
      // For logo, favicon, and login-banner use the specified API routes.
      // For background and watermark, use the generic /api/upload route.
      const endpoint = ['logo', 'favicon', 'login-banner'].includes(type) 
        ? `/api/company/${type}` 
        : '/api/upload';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.url) {
        if (type === 'logo') updateBrandingState({ companyLogo: data.url });
        if (type === 'favicon') updateBrandingState({ favicon: data.url });
        if (type === 'login-banner') updateBrandingState({ loginBanner: data.url });
        if (type === 'login-background') updateBrandingState({ loginBackground: data.url });
        if (type === 'watermark') updateBrandingState({ companyWatermark: data.url });

        triggerToast(`${type.replace('-', ' ')} uploaded successfully!`);
      } else {
        triggerToast(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Server error during upload');
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      <div>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
          Company Branding Settings
          <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
        </h3>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Configure white-label identities, dynamic styling theme tokens, and custom login experiences</p>
      </div>

      {/* General Information Section */}
      <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <span className="font-black uppercase text-[10px] tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="w-3.5 h-3.5 text-blue-500" />
          General Information
        </span>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
            <input 
              type="text" 
              value={branding.companyName || ''}
              onChange={e => updateBrandingState({ companyName: e.target.value })}
              className="saas-input w-full px-3 py-2"
              placeholder="e.g. Acme Technologies"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company Short Name</label>
            <input 
              type="text" 
              value={branding.companyShortName || ''}
              onChange={e => updateBrandingState({ companyShortName: e.target.value })}
              className="saas-input w-full px-3 py-2"
              placeholder="e.g. Acme"
            />
          </div>
          <div className="space-y-1 col-span-1 lg:col-span-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Company Tagline</label>
            <input 
              type="text" 
              value={branding.companyTagline || ''}
              onChange={e => updateBrandingState({ companyTagline: e.target.value })}
              className="saas-input w-full px-3 py-2"
              placeholder="e.g. Building the Future of SaaS"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Website URL</label>
            <input 
              type="text" 
              value={branding.companyWebsite || ''}
              onChange={e => updateBrandingState({ companyWebsite: e.target.value })}
              className="saas-input w-full px-3 py-2"
              placeholder="e.g. https://acme.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Support Email</label>
            <input 
              type="email" 
              value={branding.companyEmail || ''}
              onChange={e => updateBrandingState({ companyEmail: e.target.value })}
              className="saas-input w-full px-3 py-2"
              placeholder="e.g. hr@acme.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact Phone</label>
            <input 
              type="text" 
              value={branding.companyPhone || ''}
              onChange={e => updateBrandingState({ companyPhone: e.target.value })}
              className="saas-input w-full px-3 py-2"
              placeholder="e.g. +1 234 567 890"
            />
          </div>
          <div className="space-y-1 col-span-1 lg:col-span-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Corporate Address</label>
            <textarea 
              rows={2}
              value={branding.companyAddress || ''}
              onChange={e => updateBrandingState({ companyAddress: e.target.value })}
              className="saas-textarea w-full p-3"
              placeholder="Enter complete office address..."
            />
          </div>
        </div>
      </div>

      {/* Logo & Assets Upload Section */}
      <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <span className="font-black uppercase text-[10px] tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Image className="w-3.5 h-3.5 text-blue-500" />
          Logo & Visual Assets
        </span>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { id: 'logo', label: 'Company Logo', value: branding.companyLogo },
            { id: 'favicon', label: 'Favicon Symbol', value: branding.favicon },
            { id: 'login-banner', label: 'Login Screen Banner', value: branding.loginBanner },
            { id: 'login-background', label: 'Login Background Image', value: branding.loginBackground },
            { id: 'watermark', label: 'Company Watermark', value: branding.companyWatermark },
          ].map(asset => (
            <div key={asset.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto truncate text-left">
                {asset.value ? (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={asset.value} alt={asset.label} className="max-w-full max-h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-850 border border-dashed border-slate-350 dark:border-slate-750 flex items-center justify-center shrink-0">
                    <Image className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="space-y-0.5 truncate flex-1 min-w-0">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{asset.label}</span>
                  <span className="text-[8px] font-mono text-slate-500 truncate block max-w-full sm:max-w-[130px]">
                    {asset.value ? asset.value.split('/').pop() : 'No file uploaded'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-none pt-2 sm:pt-0">
                {uploading === asset.id && <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />}
                {asset.value && (
                  <button
                    type="button"
                    onClick={() => {
                      const updates: Partial<BrandingData> = {};
                      if (asset.id === 'logo') updates.companyLogo = '';
                      if (asset.id === 'favicon') updates.favicon = '';
                      if (asset.id === 'login-banner') updates.loginBanner = '';
                      if (asset.id === 'login-background') updates.loginBackground = '';
                      if (asset.id === 'watermark') updates.companyWatermark = '';
                      updateBrandingState(updates);
                      triggerToast(`Removed custom ${asset.label.toLowerCase()}`);
                    }}
                    className="p-2 bg-rose-50 dark:bg-rose-950/35 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 text-rose-500 dark:text-rose-400 rounded-lg cursor-pointer transition-all shrink-0 border-none active:scale-95"
                    title={`Remove ${asset.label}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <label className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white text-slate-500 dark:text-slate-300 rounded-lg cursor-pointer transition-all shrink-0 active:scale-95">
                  <Upload className="w-3.5 h-3.5" />
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => handleFileUpload(e, asset.id as any)}
                    className="hidden" 
                    disabled={uploading !== null}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Colors Section */}
      <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <span className="font-black uppercase text-[10px] tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-blue-500" />
          Theme Customization Colors
        </span>

        {/* Color Presets */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Color Presets</label>
            <button
              type="button"
              onClick={async () => {
                try {
                  await fetchBranding();
                  triggerToast('Theme colors reset to saved configuration');
                } catch (err) {
                  triggerToast('Failed to reset theme');
                }
              }}
              className="text-[8.5px] font-black text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 uppercase tracking-widest flex items-center gap-1 bg-transparent border-none cursor-pointer transition-colors active:scale-95"
            >
              <RefreshCw className="w-3 h-3 animate-spin-hover" />
              Reset Theme
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map(p => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="flex gap-0.5 shrink-0">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.primary }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.secondary }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.accent }} />
                </div>
                <span className="truncate">{p.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {[
            { id: 'primaryColor', label: 'Primary Color', val: branding.primaryColor },
            { id: 'secondaryColor', label: 'Secondary Color', val: branding.secondaryColor },
            { id: 'accentColor', label: 'Accent Color', val: branding.accentColor },
          ].map(col => (
            <div key={col.id} className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">{col.label}</label>
              <div className="flex items-center gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl justify-between">
                <input 
                  type="color" 
                  value={col.val || '#2563eb'}
                  onChange={e => updateBrandingState({ [col.id]: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent shrink-0"
                />
                <input
                  type="text"
                  value={col.val || ''}
                  onChange={e => {
                    const val = e.target.value;
                    const formattedVal = val.startsWith('#') ? val : `#${val}`;
                    updateBrandingState({ [col.id]: formattedVal });
                  }}
                  className="w-20 px-1 py-0.5 text-[10px] font-mono font-bold uppercase bg-transparent border-none focus:outline-none focus:ring-0 text-right text-slate-900 dark:text-white"
                  placeholder="#2563EB"
                  maxLength={7}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Page Customizer Section */}
      <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <span className="font-black uppercase text-[10px] tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Layout className="w-3.5 h-3.5 text-blue-500" />
          Login Welcome customizer
        </span>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Welcome Portal Message</label>
          <input 
            type="text" 
            value={branding.welcomeMessage || ''}
            onChange={e => updateBrandingState({ welcomeMessage: e.target.value })}
            className="saas-input w-full px-3 py-2"
            placeholder="Welcome to Acme Technologies HR Portal"
          />
        </div>
      </div>

      {/* Email & PDF Customizer Section */}
      <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
        <span className="font-black uppercase text-[10px] tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-blue-500" />
          Email Header Configuration
        </span>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl">
          <div className="text-left">
            <span className="font-black uppercase text-[9px] text-slate-900 dark:text-white block">Email Header Branding Logo</span>
            <p className="text-[7.5px] text-slate-400 font-bold uppercase mt-0.5">Embed custom branding header inside transactional notification templates</p>
          </div>
          <button
            type="button"
            onClick={() => updateBrandingState({ emailHeaderLogoVisible: !branding.emailHeaderLogoVisible })}
            className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer flex shrink-0 ${branding.emailHeaderLogoVisible ? 'bg-blue-600 justify-end' : 'bg-slate-200 dark:bg-slate-850 justify-start'}`}
          >
            <span className="w-4 h-4 bg-white rounded-full shadow-sm" />
          </button>
        </div>
      </div>

      {/* Save Changes Button */}
      <button
        type="button"
        onClick={async () => {
          try {
            await saveBranding();
            triggerToast('Company branding configuration updated successfully.');
          } catch (err: any) {
            triggerToast(err.message || 'Failed to update branding settings.');
          }
        }}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        Save Branding Configuration
      </button>
    </div>
  );
}
