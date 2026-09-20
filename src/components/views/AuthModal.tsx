import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Zap,
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Phone,
  MapPin,
  Briefcase,
  IndianRupee,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  KeyRound,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import { GoogleSignInButton } from '../common/GoogleSignInButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const INDIAN_CITIES = [
  'Bengaluru, Karnataka',
  'Mumbai, Maharashtra',
  'Delhi NCR, Delhi',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
  'Gurugram, Haryana',
  'Noida, Uttar Pradesh',
  'Jaipur, Rajasthan',
  'Other City',
];

const OCCUPATION_OPTIONS = [
  'Software Engineer / Architect',
  'Founder / Tech Entrepreneur',
  'Product Manager / Designer',
  'Chartered Accountant / Finance',
  'Doctor / Healthcare Professional',
  'Student / Researcher',
  'Creator / Consultant',
  'Executive / Operations Leader',
  'Other Professional',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, loginAsDemo, sendOtp, verifyOtp } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'otp_verify' | 'forgot'>(initialMode);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(INDIAN_CITIES[0]);
  const [occupation, setOccupation] = useState(OCCUPATION_OPTIONS[0]);
  const [monthlyBudget, setMonthlyBudget] = useState('75000');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Verification state
  const [otpCode, setOtpCode] = useState('');
  const [otpSentPhone, setOtpSentPhone] = useState('');
  const [otpSentEmail, setOtpSentEmail] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [previewOtp, setPreviewOtp] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccessMessage('');
      setOtpCode('');
    }
  }, [isOpen, initialMode]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === 'otp_verify' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, otpCountdown]);

  if (!isOpen) return null;

  const handleSendVerificationOTP = async () => {
    const formattedPhone = phone.trim().startsWith('+91')
      ? phone.trim()
      : `+91 ${phone.trim()}`;

    try {
      const response = await sendOtp({
        email: email.trim(),
        phone: formattedPhone,
        name: name.trim(),
      });

      setOtpSentPhone(response.phone);
      setOtpSentEmail(response.email);
      if (response.otpPreview) {
        setPreviewOtp(response.otpPreview);
        // Pre-fill for instantaneous seamless testing
        setOtpCode(response.otpPreview);
      }
      setOtpCountdown(60);
      setMode('otp_verify');
      setSuccessMessage(`6-digit OTP code dispatched to mobile ${response.phone} & email ${response.email}`);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification OTP. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (mode === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setSuccessMessage('Password reset instructions dispatched to ' + email);
      return;
    }

    if (mode === 'login') {
      if (!email.trim() || !password) {
        setError('Please provide your email and password.');
        return;
      }
      setIsLoading(true);
      try {
        await login(email, password);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
        setError('Please enter a valid 10-digit mobile number for OTP verification.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agreeTerms) {
        setError('Please accept terms of service to initialize your workspace.');
        return;
      }

      setIsLoading(true);
      try {
        await handleSendVerificationOTP();
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (mode === 'otp_verify') {
      if (!otpCode || otpCode.trim().length !== 6) {
        setError('Please enter the 6-digit verification code sent to your mobile phone.');
        return;
      }

      setIsLoading(true);
      try {
        await verifyOtp({
          email: email.trim(),
          phone: otpSentPhone || phone.trim(),
          otp: otpCode.trim(),
          name: name.trim(),
          password,
          city,
          occupation,
          monthlyBudget: parseFloat(monthlyBudget) || 75000,
        });
        onClose();
      } catch (err: any) {
        setError(err.message || 'Verification failed. Please check the OTP code.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setError('');
    setIsLoading(true);
    try {
      await handleSendVerificationOTP();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    try {
      await loginAsDemo();
      onClose();
    } catch (err: any) {
      setError('Demo login error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="lifeops-auth-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="lifeops-auth-modal"
        className={`w-full ${mode === 'signup' ? 'max-w-xl' : 'max-w-md'} my-8 bg-[#080808] border border-[#c5a059]/40 rounded-sm shadow-2xl overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-150 transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#111] border border-[#c5a059]/40 flex items-center justify-center">
              <span className="font-serif font-bold text-sm text-[#c5a059] italic">L</span>
            </div>
            <div>
              <span className="font-serif tracking-widest text-white text-base">LIFEOPS</span>
              <span className="block text-[8px] text-[#7a7a7a] font-mono tracking-widest uppercase">
                {mode === 'otp_verify' ? 'Mobile & Email OTP Verification' : 'Personal Operating System • ₹ INR'}
              </span>
            </div>
          </div>

          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="p-1 text-[#7a7a7a] hover:text-white rounded-sm hover:bg-[#111] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        {mode !== 'forgot' && mode !== 'otp_verify' && (
          <div className="flex border-b border-[#1a1a1a] px-6 pt-2">
            <button
              id="auth-tab-login"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMessage('');
              }}
              className={`pb-3 px-4 text-xs font-serif uppercase tracking-widest border-b-2 transition-colors ${
                mode === 'login'
                  ? 'border-[#c5a059] text-[#c5a059] font-bold'
                  : 'border-transparent text-[#7a7a7a] hover:text-[#d1d1d1]'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              onClick={() => {
                setMode('signup');
                setError('');
                setSuccessMessage('');
              }}
              className={`pb-3 px-4 text-xs font-serif uppercase tracking-widest border-b-2 transition-colors ${
                mode === 'signup'
                  ? 'border-[#c5a059] text-[#c5a059] font-bold'
                  : 'border-transparent text-[#7a7a7a] hover:text-[#d1d1d1]'
              }`}
            >
              Create Account (Sign Up)
            </button>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-sm bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-sm bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Quick Google Sign In */}
          {mode === 'login' && (
            <div className="space-y-3 pb-1">
              <GoogleSignInButton
                label="Sign In with Google"
                onSuccess={onClose}
              />
              <div className="relative py-1 flex items-center justify-center">
                <div className="w-full border-t border-[#1a1a1a]" />
                <span className="absolute bg-[#080808] px-3 text-[9px] uppercase tracking-[0.25em] text-[#666] font-mono">
                  Or Email & Password
                </span>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* OTP VERIFICATION VIEW */}
          {/* ========================================== */}
          {mode === 'otp_verify' && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-2 pb-2">
                <div className="w-12 h-12 rounded-full bg-[#111] border border-[#c5a059]/40 flex items-center justify-center mx-auto text-[#c5a059] shadow-[0_0_20px_rgba(197,160,89,0.2)]">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-base font-serif text-white">Enter Verification Code</h3>
                <p className="text-xs text-[#888] max-w-xs mx-auto">
                  We sent a 6-digit OTP to mobile <span className="text-[#c5a059] font-mono">{otpSentPhone || phone}</span> and initiated email verification for <span className="text-white font-mono">{otpSentEmail || email}</span>.
                </p>
              </div>

              {previewOtp && (
                <div className="p-3 rounded-sm bg-[#0e0e0e] border border-[#c5a059]/40 text-center space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#7a7a7a] flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#c5a059]" />
                    <span>SMS / Email OTP Preview</span>
                  </div>
                  <div className="text-2xl font-mono tracking-[0.35em] text-[#c5a059] font-bold">
                    {previewOtp}
                  </div>
                  <div className="text-[9px] text-[#666]">
                    Code auto-filled below for instant verification
                  </div>
                </div>
              )}

              {/* 6-Digit OTP Input */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5 text-center">
                  6-Digit OTP Code <span className="text-[#c5a059]">*</span>
                </label>
                <div className="relative max-w-xs mx-auto">
                  <KeyRound className="w-4 h-4 text-[#555] absolute left-3.5 top-3" />
                  <input
                    id="auth-otp-input"
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-4 py-2.5 rounded-sm bg-[#050505] border border-[#c5a059] text-white text-center text-lg tracking-[0.4em] font-mono placeholder-[#444] focus:outline-none shadow-[0_0_15px_rgba(197,160,89,0.15)]"
                  />
                </div>
              </div>

              {/* Resend OTP & Back */}
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="text-[#888] hover:text-white"
                >
                  &larr; Edit Details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpCountdown > 0 || isLoading}
                  className={`flex items-center gap-1 font-mono text-[11px] ${
                    otpCountdown > 0
                      ? 'text-[#555] cursor-not-allowed'
                      : 'text-[#c5a059] hover:underline'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP Code'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* SIGN UP FORM */}
          {/* ========================================== */}
          {mode === 'signup' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">
                  Full Name <span className="text-[#c5a059]">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
                  <input
                    id="auth-name-input"
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Mobile Phone (+91 India) for OTP */}
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#7a7a7a]">
                    Mobile Number (For SMS OTP Verification) <span className="text-[#c5a059]">*</span>
                  </label>
                  <span className="text-[9px] font-mono text-[#c5a059]">Required for OTP</span>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center gap-1 text-[11px] text-[#c5a059] font-mono select-none">
                    <Phone className="w-3 h-3 text-[#555]" />
                    <span>+91</span>
                  </div>
                  <input
                    id="auth-phone-input"
                    type="tel"
                    required
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-14 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">
                  Email Address (For Account Verification) <span className="text-[#c5a059]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="aarav.sharma@domain.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* City / Location */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">
                  City / Region (India)
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
                  <select
                    id="auth-city-select"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0c0c0c] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Occupation / Role */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">
                  Role / Occupation
                </label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
                  <select
                    id="auth-occupation-select"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    {OCCUPATION_OPTIONS.map((occ) => (
                      <option key={occ} value={occ} className="bg-[#0c0c0c] text-white">
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Monthly Budget in INR */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">
                  Target Monthly Budget (₹ INR)
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-[#c5a059] absolute left-3.5 top-3" />
                  <input
                    id="auth-monthly-budget-input"
                    type="number"
                    min="1000"
                    step="1000"
                    placeholder="75000"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">
                  Password <span className="text-[#c5a059]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#555] hover:text-[#999]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">
                  Confirm Password <span className="text-[#c5a059]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
                  <input
                    id="auth-confirm-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* LOGIN / FORGOT VIEW */}
          {/* ========================================== */}
          {mode === 'login' && (
            <>
              {/* Email Address */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">
                  Email Address <span className="text-[#c5a059]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
                  <input
                    id="auth-login-email-input"
                    type="email"
                    required
                    placeholder="aarav.sharma@lifeops.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#7a7a7a]">
                    Password <span className="text-[#c5a059]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-[10px] text-[#c5a059] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
                  <input
                    id="auth-login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#555] hover:text-[#999]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {mode === 'forgot' && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">
                Registered Email Address <span className="text-[#c5a059]">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
                <input
                  id="auth-forgot-email-input"
                  type="email"
                  required
                  placeholder="your.email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>
          )}

          {/* Remember me / Terms checkboxes */}
          {mode === 'login' && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded-sm bg-[#111] border-[#333] text-[#c5a059] focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[11px] text-[#888]">Keep me logged in</span>
              </label>
              <span className="text-[10px] text-[#555] flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-[#c5a059]" /> 256-bit Encrypted
              </span>
            </div>
          )}

          {mode === 'signup' && (
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded-sm bg-[#111] border-[#333] text-[#c5a059] focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-[11px] text-[#888] leading-tight">
                  I agree to mobile phone verification via SMS OTP and accept the Terms of Service & Privacy Policy.
                </span>
              </label>
            </div>
          )}

          {/* Action Button */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest shadow-[0_0_12px_rgba(197,160,89,0.2)] hover:bg-[#d8b56f] transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : mode === 'login' ? (
              <>
                <span>Enter System</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Send Mobile OTP & Verify Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'otp_verify' ? (
              <>
                <span>Verify OTP & Enter Dashboard</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <span>Send Recovery Email</span>
            )}
          </button>

          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-xs text-[#c5a059] hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Instant Demo Access Button */}
          {mode !== 'otp_verify' && (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1a1a1a]" />
                </div>
                <div className="relative flex justify-center text-[9px] uppercase tracking-widest">
                  <span className="bg-[#080808] px-2 text-[#666] font-mono">Direct Demo Access</span>
                </div>
              </div>

              <button
                id="auth-demo-instant-btn"
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm bg-[#050505] hover:bg-[#111] text-[#c5a059] text-[10px] uppercase tracking-widest font-semibold border border-[#1a1a1a] hover:border-[#c5a059]/40 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Instant Demo Sign-In (Pre-loaded ₹ Workspace)</span>
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
