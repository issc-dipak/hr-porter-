"use client";

import React, { useState, useEffect } from 'react';
import { 
  Mail, Lock, ArrowRight, User, Users,
  Target, ShieldCheck, CheckCircle2, 
  Building2, ArrowLeft, RefreshCcw,
  Phone, Briefcase, Eye, EyeOff, Globe, Clock, Shield, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface SignupPageProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
  prefilledEmail?: string;
  prefilledCompany?: string;
  prefilledCompanyCode?: string;
  initialStep?: 1 | 2 | 3;
}

export default function SignupPage({ 
  onSignup, 
  onSwitchToLogin, 
  prefilledEmail = '', 
  prefilledCompany = '', 
  prefilledCompanyCode = '',
  initialStep = 1
}: SignupPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(initialStep); // 1: Company Profile, 2: Admin Account, 3: OTP Verification
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Company Profile States
  const [companyName, setCompanyName] = useState(prefilledCompany);
  const [slug, setSlug] = useState(prefilledCompanyCode);
  const [companySize, setCompanySize] = useState('11-50');
  const [industry, setIndustry] = useState('Technology');
  const [country, setCountry] = useState('India');
  const [timezone, setTimezone] = useState('IST (UTC+05:30)');
  const [workEmail, setWorkEmail] = useState(prefilledEmail);
  const [phoneNumber, setPhoneNumber] = useState('');

  // Step 2: Admin Account States
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('Administrator');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Step 3: Verification OTP State
  const [otp, setOtp] = useState('');

  // Security Verification CAPTCHA States
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, ans: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ num1, num2, ans: num1 + num2 });
    setCaptchaInput('');
  };

  // Password Complexity Evaluator
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: 'Unentered', color: 'bg-slate-800', width: 'w-0' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/\W/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        return { score, label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
      case 2:
      case 3:
        return { score, label: 'Medium', color: 'bg-amber-500', width: 'w-2/4' };
      case 4:
        return { score, label: 'Strong', color: 'bg-indigo-500', width: 'w-3/4' };
      case 5:
      default:
        return { score, label: 'Excellent', color: 'bg-emerald-500', width: 'w-full' };
    }
  };

  const passwordStrength = getPasswordStrength();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (step === 1) {
      if (!companyName.trim() || !slug.trim() || !workEmail.trim()) {
        setErrorMsg('Please fill out all required company fields.');
        return;
      }
      // Simple subdomain format validation
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug.toLowerCase().trim())) {
        setErrorMsg('Slug must only contain lowercase letters, numbers, and dashes.');
        return;
      }
      setStep(2);
    }
  };

  const handleCompanyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (passwordStrength.score < 4) {
      setErrorMsg('Password strength is too weak. Ensure it includes uppercase, lowercase, numbers, and symbols.');
      return;
    }

    if (parseInt(captchaInput, 10) !== captcha.ans) {
      setErrorMsg('CAPTCHA verification failed. Please try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/company-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          slug,
          companySize,
          industry,
          country,
          timezone,
          workEmail,
          phoneNumber,
          fullName,
          designation,
          password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: workEmail,
          otp
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Save token to localStorage to log in
      if (data.token) {
        localStorage.setItem('hr_system_token', data.token);
        localStorage.setItem('hr_system_auth', 'true');
        localStorage.setItem('hr_system_role', data.user.role);
        localStorage.setItem('hr_system_page', 'dashboard');
      }

      alert('Verification successful! Welcome to HRMS.');
      onSignup(); // triggers redirection to authenticated dashboard
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: workEmail })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }
      alert('Verification OTP resent successfully to ' + workEmail);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-6 relative overflow-y-auto auth-page">
      {/* Moving Aura Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] blur-[150px] rounded-full bg-cyan-500/10 opacity-30" />
        <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[50%] blur-[150px] rounded-full bg-blue-600/10 opacity-30" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-[850px] bg-slate-900/90 backdrop-blur-3xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden"
      >
        {/* Left Info Banner */}
        <div className="hidden lg:flex flex-1 p-6 lg:p-8 bg-slate-950/80 relative overflow-hidden flex-col justify-between border-r border-slate-800/80">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center border border-blue-500/20">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-sm font-black text-white tracking-widest uppercase">HR CORE</h1>
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20 inline-block">
                SaaS Enterprise Multi-Tenant
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                Connect your workspace. <br />
                <span className="text-blue-400">Scale talent operations.</span>
              </h2>
              <p className="text-slate-400 text-[10px] leading-relaxed max-w-xs">
                Configure your workspace subdomain and activate your administrative console with security safeguards.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 pt-2">
              {[
                { title: 'Isolated Workspace Slugs', desc: 'Secure subdomain routing isolation' },
                { title: 'OTP Email Validations', desc: 'Verify ownership before platform access' },
                { title: 'Audited Administrator Controls', desc: 'Signup, updates, and accesses are logged' },
                { title: 'Granular Role Separation', desc: 'Strict access bounds for Admins, HR & staff' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 text-left">
                  <div className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-200 uppercase leading-none mt-0.5">{item.title}</h4>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-1 leading-none">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-slate-500">
            <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-500" /> Secure SSL Connection
            </span>
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">HR Core v2026</span>
          </div>
        </div>

        {/* Right Form Console */}
        <div className="flex-[1.4] p-4 sm:p-6 lg:p-8 flex flex-col justify-center relative">
          
          {/* Header & Switching */}
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={onSwitchToLogin} 
              className="flex items-center gap-1.5 text-slate-400 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-widest">Back to Secure Login</span>
            </button>
            <div className="flex gap-1.5">
              {[1, 2, 3].map((num) => (
                <div 
                  key={num} 
                  className={cn(
                    "w-5 h-1.5 rounded-full transition-all duration-300",
                    step === num ? "bg-blue-500 w-8" : "bg-slate-800"
                  )} 
                />
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold flex items-center gap-2 mb-4 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Company Profile */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-3 md:space-y-4 text-left">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight leading-none">Register Company Profile</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Configure company metadata and subdomain mapping</p>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 md:gap-4">
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Acme Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Subdomain Slug</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. acme"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full pl-3 pr-16 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-500 uppercase">.hrcore.com</span>
                  </div>
                </div>

                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Work Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email" 
                      required
                      placeholder="e.g. admin@acme.com"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Company Size</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <select 
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none cursor-pointer appearance-none focus:border-blue-500/50"
                    >
                      <option value="1-10">1-10 Employees</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees</option>
                      <option value="201-500">201-500 Employees</option>
                      <option value="500+">500+ Employees</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Industry</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <select 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none cursor-pointer appearance-none focus:border-blue-500/50"
                    >
                      <option value="Technology">Tech / IT</option>
                      <option value="Finance">Finance</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Retail">Retail</option>
                      <option value="Education">Education</option>
                      <option value="Professional Services">Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <select 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none cursor-pointer appearance-none focus:border-blue-500/50"
                    >
                      <option value="India">India</option>
                      <option value="United States">USA</option>
                      <option value="United Kingdom">UK</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Aus</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Timezone</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <select 
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none cursor-pointer appearance-none focus:border-blue-500/50"
                    >
                      <option value="IST (UTC+05:30)">IST (+5:30)</option>
                      <option value="EST (UTC-05:00)">EST (-5:00)</option>
                      <option value="GMT (UTC+00:00)">GMT (+0:00)</option>
                      <option value="PST (UTC-08:00)">PST (-8:00)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Contact Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="tel" 
                      placeholder="+91 99999 99999"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.99] mt-4"
              >
                Proceed to Admin Account <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* STEP 2: Admin Account Credentials */}
          {step === 2 && (
            <form onSubmit={handleCompanyRegister} className="space-y-3 md:space-y-4 text-left">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight leading-none">Configure Admin Profile</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Set up primary credentials for the Company Admin</p>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 md:gap-4">
                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Admin Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Admin Designation</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. CEO / Director"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Set Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="Enter strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500/50"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {/* Strength Meter */}
                  <div className="pt-1 space-y-1">
                    <div className="flex justify-between text-[7px] font-black uppercase text-slate-500">
                      <span>Password Strength</span>
                      <span className={cn(
                        passwordStrength.score >= 4 ? 'text-emerald-500' : passwordStrength.score >= 2 ? 'text-amber-500' : 'text-rose-500'
                      )}>{passwordStrength.label}</span>
                    </div>
                    <div className="h-1 bg-slate-950 rounded-full overflow-hidden w-full border border-slate-850">
                      <div className={cn("h-full rounded-full transition-all duration-300", passwordStrength.color, passwordStrength.width)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 col-span-2 md:col-span-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password" 
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>

                {/* Math CAPTCHA */}
                <div className="space-y-1 col-span-2 bg-slate-950/40 border border-slate-800/60 p-2.5 rounded-2xl">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Anti-Bot Security Challenge</label>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs rounded-xl font-black select-none tracking-wider shrink-0">
                      {captcha.num1} + {captcha.num2} = ?
                    </div>
                    <input 
                      type="number"
                      required
                      placeholder="Answer"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      className="w-full px-3 py-1.5 md:py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold outline-none focus:border-blue-500/50"
                    />
                    <button 
                      type="button" 
                      onClick={generateCaptcha}
                      className="p-2 hover:bg-slate-850 rounded-xl text-slate-400 hover:text-white shrink-0"
                    >
                      <RefreshCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
                >
                  {loading ? (
                    <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>Create secure profile <ArrowRight className="w-3.5 h-3.5" /></>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: OTP Verification */}
          {step === 3 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 text-left">
              <div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[8px] font-black uppercase tracking-widest inline-block mb-2">
                  Email OTP Sent
                </span>
                <h3 className="text-base font-bold text-white tracking-tight leading-none">Verify Your Email Address</h3>
                <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed mt-1">
                  We have dispatched a 6-digit security code to <strong className="text-white">{workEmail}</strong>. Please enter the OTP below to complete the activation process.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 block ml-0.5">Verification Code (OTP)</label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full tracking-[8px] text-center py-3 bg-slate-950 border border-slate-808 rounded-xl text-lg font-black text-white outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
              >
                {loading ? (
                  <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>Verify & Activate Account <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </button>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[9px] font-bold uppercase">
                <span className="text-slate-500">Didn't receive the email?</span>
                <button 
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-blue-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* Footer Account switcher */}
          {step !== 3 && (
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-slate-450 text-[9px] font-bold uppercase tracking-wider">
                Already have an account? 
                <button 
                  onClick={onSwitchToLogin} 
                  className="ml-1.5 text-blue-400 hover:underline font-black"
                >
                  Log In
                </button>
              </p>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
