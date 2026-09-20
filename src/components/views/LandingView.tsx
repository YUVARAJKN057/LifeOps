import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  Target,
  Flame,
  IndianRupee,
  BarChart3,
  Bot,
  UserPlus,
  LogIn,
  Layers,
  ShieldCheck,
  Calendar,
  Mic,
  Clock,
  ChevronRight,
  TrendingUp,
  Star,
  Activity,
  Check,
  Award,
  Wallet,
  Compass,
  Menu,
  X,
  Play,
  Volume2,
  Headphones,
  CheckCheck,
} from 'lucide-react';
import { ParticleUniverse } from '../common/ParticleUniverse';
import { AurelianCore3D } from '../common/AurelianCore3D';
import { Card3D } from '../common/Card3D';
import { GoogleSignInButton } from '../common/GoogleSignInButton';
import { PerspectiveGrid3D } from '../common/PerspectiveGrid3D';
import { InteractiveDemoPlayground } from '../common/InteractiveDemoPlayground';
import { FocusAudioEngine } from '../common/FocusAudioEngine';

interface LandingViewProps {
  onStart: (mode?: 'login' | 'signup') => void;
  onExploreDemo: () => void;
  onOpenVoice?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStart,
  onExploreDemo,
  onOpenVoice,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [istTime, setIstTime] = useState('');

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now);
      setIstTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="lifeops-home-page"
      className="relative min-h-screen bg-[#050505] text-[#d1d1d1] overflow-x-hidden selection:bg-[#c5a059] selection:text-black font-sans"
    >
      {/* 3D Ambient Particle Universe Background */}
      <ParticleUniverse interactive intensity="subtle" showHubs className="opacity-30 pointer-events-none" />

      {/* Top Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-[#141414] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-sm bg-[#0e0e0e] border border-[#c5a059]/50 flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.2)]">
              <span className="font-serif font-bold text-xl text-[#c5a059] italic">L</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif tracking-widest text-lg text-white font-medium">
                  LIFEOPS
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#111] text-[#c5a059] border border-[#c5a059]/30 uppercase">
                  v4.2 &bull; ₹
                </span>
              </div>
              <span className="block text-[9px] text-[#7a7a7a] font-mono tracking-[0.25em] uppercase">
                Personal Operating System
              </span>
            </div>
          </div>

          {/* Center Navigation Anchors */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-mono tracking-wider uppercase text-[#888]">
            <a href="#interactive-sandbox" className="hover:text-[#c5a059] transition-colors flex items-center gap-1 text-[#c5a059]">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>Interactive Sandbox</span>
            </a>
            <a href="#capabilities" className="hover:text-[#c5a059] transition-colors">
              Capabilities
            </a>
            <a href="#voice-ai" className="hover:text-[#c5a059] transition-colors flex items-center gap-1">
              <Mic className="w-3 h-3" />
              <span>Voice AI (⌘J)</span>
            </a>
            <a href="#comparison" className="hover:text-[#c5a059] transition-colors">
              Comparison
            </a>
            <a href="#reviews" className="hover:text-[#c5a059] transition-colors">
              Operators
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live IST clock badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#0a0a0a] border border-[#1a1a1a] text-[10px] font-mono text-[#888]">
              <Clock className="w-3 h-3 text-[#c5a059]" />
              <span>{istTime || '05:30 PM'} IST</span>
            </div>

            {/* Ambient Focus Audio Engine */}
            <div className="hidden sm:block">
              <FocusAudioEngine compact={true} />
            </div>

            <button
              id="nav-demo-btn"
              onClick={onExploreDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-[#0e0e0e] hover:bg-[#161616] text-[11px] uppercase tracking-widest font-semibold text-[#c5a059] border border-[#c5a059]/40 hover:border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.15)] transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Try Demo</span>
            </button>

            <button
              id="nav-signin-btn"
              onClick={() => onStart('login')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-[#080808] hover:bg-[#111] text-[11px] uppercase tracking-widest font-semibold text-white border border-[#222] hover:border-[#444] transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-[#888]" />
              <span>Sign In</span>
            </button>

            <button
              id="nav-get-started-btn"
              onClick={() => onStart('signup')}
              className="px-4 py-2 rounded-sm bg-[#c5a059] hover:bg-[#d8b56f] text-[11px] uppercase tracking-widest font-semibold text-black transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(197,160,89,0.3)] hover:scale-[1.02]"
            >
              <UserPlus className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span className="hidden xs:inline">Sign Up</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-2 lg:hidden text-[#888] hover:text-white rounded-sm hover:bg-[#111]"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="lg:hidden border-t border-[#141414] bg-[#080808] p-4 space-y-2">
            <a
              href="#interactive-sandbox"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center justify-between p-3 rounded-sm text-xs font-mono uppercase text-[#c5a059] bg-[#111]"
            >
              <span>Interactive Sandbox</span>
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#capabilities"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center justify-between p-3 rounded-sm text-xs font-mono uppercase text-[#ccc] hover:bg-[#111]"
            >
              <span>Capabilities</span>
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#voice-ai"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center justify-between p-3 rounded-sm text-xs font-mono uppercase text-[#ccc] hover:bg-[#111]"
            >
              <span>Live Voice AI</span>
              <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#comparison"
              onClick={() => setIsMobileNavOpen(false)}
              className="flex items-center justify-between p-3 rounded-sm text-xs font-mono uppercase text-[#ccc] hover:bg-[#111]"
            >
              <span>Comparison Matrix</span>
              <ChevronRight className="w-4 h-4" />
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onExploreDemo();
                }}
                className="w-full py-2.5 rounded-sm bg-[#111] text-[#c5a059] border border-[#c5a059]/40 text-xs font-mono uppercase font-semibold"
              >
                ⚡ Explore Full Demo
              </button>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  onStart('signup');
                }}
                className="w-full py-2.5 rounded-sm bg-[#c5a059] text-black text-xs font-mono uppercase font-semibold"
              >
                Create Account (Sign Up)
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-20 text-center">
        {/* Glow Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#080808]/90 border border-[#c5a059]/40 text-[#c5a059] text-[10px] sm:text-xs uppercase tracking-[0.25em] font-mono mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(197,160,89,0.15)]"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Intelligent Sovereign Operating System &bull; ₹ INR Ready</span>
        </motion.div>

        {/* 3D Interactive Three.js Monolith Core */}
        <div className="relative w-full max-w-lg mx-auto h-60 sm:h-72 -mb-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <AurelianCore3D size={300} intensity="hero" interactive={true} />
          </div>
          <div className="absolute bottom-2 px-3 py-1 rounded-full bg-[#080808]/85 border border-[#1f1f1f] text-[9px] font-mono uppercase tracking-widest text-[#888] backdrop-blur-sm pointer-events-none flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-[#c5a059]" />
            <span>Interactive 3D Engine &bull; Drag to Rotate</span>
          </div>
        </div>

        {/* Main Display Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-tight text-white mb-4 max-w-5xl mx-auto leading-[1.1]"
        >
          Master Your Time, <br className="hidden sm:inline" />
          <span className="text-[#c5a059] italic font-serif">Goals & Capital.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl font-light text-[#a3a3a3] max-w-3xl mx-auto mb-8 leading-relaxed"
        >
          One unified operating environment for high-agency operators. Structure your daily tasks, 
          strategic milestones, habit streaks, circadian schedule, and Indian Rupee (₹) finances 
          with real-time Gemini AI and hands-free voice assistance.
        </motion.p>

        {/* Dual Primary Call-To-Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto mb-6"
        >
          <button
            id="hero-demo-sandbox-btn"
            onClick={onExploreDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-sm bg-[#c5a059] text-black font-bold text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(197,160,89,0.35)] hover:bg-[#d8b56f] transition-all hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4 text-black fill-current stroke-[2.5]" />
            <span>Launch Live Interactive Demo</span>
            <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
          </button>

          <button
            id="hero-create-account-btn"
            onClick={() => onStart('signup')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-sm bg-[#0c0c0c] hover:bg-[#141414] text-white font-semibold text-xs sm:text-sm uppercase tracking-widest border border-[#262626] hover:border-[#c5a059]/50 transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4 text-[#c5a059]" />
            <span>Create Free Account</span>
          </button>
        </motion.div>

        {/* 1-Click Instant Google Setup */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="max-w-sm mx-auto mb-8"
        >
          <GoogleSignInButton
            variant="primary"
            className="py-2.5 shadow-[0_0_20px_rgba(197,160,89,0.15)]"
            label="Continue with Google (Instant Access)"
            onSuccess={onExploreDemo}
          />
        </motion.div>

        {/* Key Operational Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] sm:text-xs font-mono text-[#777]"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>End-to-End Encrypted</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>100% ₹ INR Native</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Live Voice AI (⌘J)</span>
          </div>
          <span>&bull;</span>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Sub-50ms Reactive UI</span>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* SECTION: LIVE INTERACTIVE DEMO PLAYGROUND (Direct on Landing Page) */}
        {/* ========================================================================= */}
        <section id="interactive-sandbox" className="mt-20 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.3em] mb-2 font-semibold flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-[#c5a059]" />
              <span>Interactive Live Sandbox</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight">
              Test How LifeOps Works Right Now
            </h2>
            <p className="text-sm text-[#888] mt-2 font-light">
              Try adding directives, calculating ₹ SIP growth, adjusting circadian rhythms, or testing voice synthesis below.
            </p>
          </div>

          <InteractiveDemoPlayground onLaunchFullApp={onExploreDemo} />
        </section>

        {/* Section: 3D Horizon Grid Visual */}
        <div className="relative mt-20 w-full max-w-5xl mx-auto rounded-sm overflow-hidden border border-[#1a1a1a] bg-[#080808]/50">
          <PerspectiveGrid3D height={120} intensity="subtle" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-[#7a7a7a]">
            <span>LifeOps Telemetry Horizon</span>
            <span>&bull;</span>
            <span className="text-[#c5a059]">60 FPS Spatial Engine</span>
          </div>
        </div>

        {/* Section: Core Capabilities Bento Grid */}
        <section id="capabilities" className="mt-28 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.3em] mb-2 font-semibold flex items-center justify-center gap-2">
              <Compass className="w-3 h-3 text-[#c5a059]" />
              <span>Full-Spectrum LifeOps Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight">
              Designed for Ruthless Execution
            </h2>
            <p className="text-sm text-[#888] mt-2 font-light">
              Every tool and module is integrated into a unified data model, eliminating app fragmentation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <Card3D depth={14}>
              <div className="p-7 rounded-sm bg-[#080808] border border-[#1a1a1a] hover:border-[#c5a059]/40 transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-sm bg-[#121212] border border-[#222] flex items-center justify-center text-[#c5a059] mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-serif text-white mb-2 tracking-wide">Eisenhower Directive Engine</h4>
                  <p className="text-xs text-[#7a7a7a] leading-relaxed font-light">
                    Stratify tasks by urgency and importance with time estimates, subtask hierarchies, and goal-linked execution.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#141414] text-[10px] font-mono text-[#c5a059]">
                  01 &bull; EXECUTION DISCIPLINE
                </div>
              </div>
            </Card3D>

            <Card3D depth={14}>
              <div className="p-7 rounded-sm bg-[#080808] border border-[#1a1a1a] hover:border-[#c5a059]/40 transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-sm bg-[#121212] border border-[#222] flex items-center justify-center text-[#c5a059] mb-4">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-serif text-white mb-2 tracking-wide">Quarterly Milestone Tracking</h4>
                  <p className="text-xs text-[#7a7a7a] leading-relaxed font-light">
                    Deconstruct annual visions into measurable milestone steps with verified mathematical progress bars.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#141414] text-[10px] font-mono text-[#c5a059]">
                  02 &bull; STRATEGIC TRAJECTORY
                </div>
              </div>
            </Card3D>

            <Card3D depth={14}>
              <div className="p-7 rounded-sm bg-[#080808] border border-[#1a1a1a] hover:border-[#c5a059]/40 transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-sm bg-[#121212] border border-[#222] flex items-center justify-center text-[#c5a059] mb-4">
                    <Flame className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-serif text-white mb-2 tracking-wide">Ritual Consistency Heatmaps</h4>
                  <p className="text-xs text-[#7a7a7a] leading-relaxed font-light">
                    Build compounding daily habits with single-click logging, streak counters, and chronological visual matrices.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#141414] text-[10px] font-mono text-[#c5a059]">
                  03 &bull; COMPOUNDING HABITS
                </div>
              </div>
            </Card3D>

            <Card3D depth={14}>
              <div className="p-7 rounded-sm bg-[#080808] border border-[#1a1a1a] hover:border-[#c5a059]/40 transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-sm bg-[#121212] border border-[#222] flex items-center justify-center text-[#c5a059] mb-4">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-serif text-white mb-2 tracking-wide">Capital & Treasury (₹ INR)</h4>
                  <p className="text-xs text-[#7a7a7a] leading-relaxed font-light">
                    Native Indian Rupee budget gauges, expense categorization, burn rate tracking, and capital reserve limits.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#141414] text-[10px] font-mono text-[#c5a059]">
                  04 &bull; FINANCIAL VELOCITY
                </div>
              </div>
            </Card3D>

            <Card3D depth={14}>
              <div className="p-7 rounded-sm bg-[#080808] border border-[#c5a059]/50 hover:border-[#c5a059] transition-all h-full flex flex-col justify-between relative overflow-hidden group shadow-[0_0_20px_rgba(197,160,89,0.1)]">
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-sm bg-[#c5a059]/20 text-[#c5a059] text-[8px] font-mono uppercase tracking-widest border border-[#c5a059]/30">
                  Live Voice
                </div>
                <div>
                  <div className="w-10 h-10 rounded-sm bg-[#121212] border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059] mb-4 group-hover:scale-110 transition-transform">
                    <Mic className="w-5 h-5 animate-pulse" />
                  </div>
                  <h4 className="text-base font-serif text-white mb-2 tracking-wide">Hands-Free Live Voice AI</h4>
                  <p className="text-xs text-[#7a7a7a] leading-relaxed font-light">
                    Real-time speech recognition (STT) and natural voice response (TTS). Speak commands to schedule time or log expenses.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#141414] text-[10px] font-mono text-[#c5a059]">
                  05 &bull; SPEECH SYNTHESIS (⌘J)
                </div>
              </div>
            </Card3D>

            <Card3D depth={14}>
              <div className="p-7 rounded-sm bg-[#080808] border border-[#1a1a1a] hover:border-[#c5a059]/40 transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-sm bg-[#121212] border border-[#222] flex items-center justify-center text-[#c5a059] mb-4">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-serif text-white mb-2 tracking-wide">Yield Index Scoring (0–100)</h4>
                  <p className="text-xs text-[#7a7a7a] leading-relaxed font-light">
                    Transparent productivity telemetry algorithm weighting task volume, goal milestones, and habit consistency.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#141414] text-[10px] font-mono text-[#c5a059]">
                  06 &bull; PERFORMANCE METRICS
                </div>
              </div>
            </Card3D>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION: LIFEOPS VS TRADITIONAL TOOLS COMPARISON */}
        {/* ========================================================================= */}
        <section id="comparison" className="mt-28 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.3em] mb-2 font-semibold">
              The Sovereign Advantage
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight">
              LifeOps vs Traditional Tools
            </h2>
            <p className="text-sm text-[#888] mt-2 font-light">
              Stop juggling 5 disconnected apps. Consolidate your daily execution into a single operating plane.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto rounded-sm border border-[#1a1a1a] bg-[#080808] shadow-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111] border-b border-[#222] text-[#888] font-mono uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Operational Dimension</th>
                  <th className="p-4 text-[#c5a059] font-bold bg-[#c5a059]/10 border-x border-[#c5a059]/30">LifeOps OS</th>
                  <th className="p-4">Notion / Obsidian</th>
                  <th className="p-4">Todoist / TickTick</th>
                  <th className="p-4">Spreadsheets (Excel)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414] font-mono">
                <tr>
                  <td className="p-4 text-white font-serif">Eisenhower Priority Matrix</td>
                  <td className="p-4 text-emerald-400 font-bold bg-[#c5a059]/5 border-x border-[#c5a059]/30">✓ Native Automated</td>
                  <td className="p-4 text-[#777]">Manual Setup</td>
                  <td className="p-4 text-[#777]">Partial Flags</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-serif">Indian Rupee (₹) Capital Vault</td>
                  <td className="p-4 text-emerald-400 font-bold bg-[#c5a059]/5 border-x border-[#c5a059]/30">✓ Built-in 50/30/20 & SIP</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                  <td className="p-4 text-[#777]">Manual Formulas</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-serif">Hands-Free Live Voice AI (⌘J)</td>
                  <td className="p-4 text-emerald-400 font-bold bg-[#c5a059]/5 border-x border-[#c5a059]/30">✓ Real-time Speech STT/TTS</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-serif">Circadian Energy Scheduling</td>
                  <td className="p-4 text-emerald-400 font-bold bg-[#c5a059]/5 border-x border-[#c5a059]/30">✓ Biological Flow Alignment</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-serif">Binaural Focus Alpha Audio</td>
                  <td className="p-4 text-emerald-400 font-bold bg-[#c5a059]/5 border-x border-[#c5a059]/30">✓ Built-in Web Audio 432Hz</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                </tr>
                <tr>
                  <td className="p-4 text-white font-serif">Single-Key Command Palette (⌘K)</td>
                  <td className="p-4 text-emerald-400 font-bold bg-[#c5a059]/5 border-x border-[#c5a059]/30">✓ Sub-50ms Universal Dispatch</td>
                  <td className="p-4 text-[#777]">Slow Search</td>
                  <td className="p-4 text-[#777]">Basic Add</td>
                  <td className="p-4 text-rose-400">✗ None</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section: Operator Reviews / Testimonials */}
        <section id="reviews" className="mt-28 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.3em] mb-2 font-semibold">
              Trusted by Ambitious Operators Across India
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight">
              Calibrated for High Agency
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
            <div className="p-6 rounded-sm bg-[#080808] border border-[#1c1c1c] flex flex-col justify-between">
              <p className="text-xs text-[#bbb] italic leading-relaxed mb-4">
                &ldquo;LifeOps replaced 4 different tools for me (Notion, habit tracker, expense spreadsheet, and timer). Having native ₹ INR support is game-changing.&rdquo;
              </p>
              <div>
                <div className="text-sm font-serif text-white">Aditya Sharma</div>
                <div className="text-[10px] font-mono text-[#c5a059]">Founder &bull; Bengaluru</div>
              </div>
            </div>

            <div className="p-6 rounded-sm bg-[#080808] border border-[#1c1c1c] flex flex-col justify-between">
              <p className="text-xs text-[#bbb] italic leading-relaxed mb-4">
                &ldquo;The Live Voice AI (⌘J) lets me dictate tasks and log expenses hands-free while driving or during morning walks. Invaluable clarity.&rdquo;
              </p>
              <div>
                <div className="text-sm font-serif text-white">Priya Nambiar</div>
                <div className="text-[10px] font-mono text-[#c5a059]">Engineering Lead &bull; Hyderabad</div>
              </div>
            </div>

            <div className="p-6 rounded-sm bg-[#080808] border border-[#1c1c1c] flex flex-col justify-between">
              <p className="text-xs text-[#bbb] italic leading-relaxed mb-4">
                &ldquo;The Yield Index score keeps me honest about my daily habit execution and goal milestones. Cleanest UI I have used in years.&rdquo;
              </p>
              <div>
                <div className="text-sm font-serif text-white">Rohit Verma</div>
                <div className="text-[10px] font-mono text-[#c5a059]">Product Architect &bull; Mumbai</div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Bottom Call-To-Action Banner */}
        <section className="mt-32 max-w-4xl mx-auto p-8 sm:p-12 rounded-sm bg-gradient-to-b from-[#111] to-[#080808] border border-[#c5a059]/40 text-center shadow-[0_0_40px_rgba(197,160,89,0.15)] relative overflow-hidden">
          <div className="text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.3em] mb-2 font-semibold">
            Ready for Absolute Clarity?
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-white tracking-tight mb-4">
            Initialize Your LifeOps Workspace Today
          </h2>
          <p className="text-sm text-[#888] max-w-lg mx-auto mb-8 font-light">
            Join thousands of operators mastering their directives, routines, and capital reserves in ₹ INR.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <button
              id="cta-bottom-demo-btn"
              onClick={onExploreDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-sm bg-[#c5a059] text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:bg-[#d8b56f] transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 text-black stroke-[2.5] fill-current" />
              <span>Explore Interactive Demo</span>
              <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
            </button>

            <button
              id="cta-bottom-signup-btn"
              onClick={() => onStart('signup')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-sm bg-[#0a0a0a] hover:bg-[#141414] text-white font-semibold text-xs uppercase tracking-widest border border-[#262626] transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Create Free Account</span>
            </button>
          </div>
        </section>

        {/* Global Footer */}
        <footer className="mt-24 pt-8 border-t border-[#141414] flex flex-col sm:flex-row items-center justify-between text-xs text-[#666] font-mono gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[#c5a059] font-serif font-bold text-sm">L</span>
            <span>&copy; {new Date().getFullYear()} LIFEOPS &bull; Personal Operating System</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span>⌘K Command Palette</span>
            <span>&bull;</span>
            <span>⌘J Live Voice AI</span>
            <span>&bull;</span>
            <span>Currency: ₹ INR</span>
          </div>
        </footer>
      </main>

      {/* Floating Interactive Demo Quick Dock at bottom for instant access */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#0c0c0c]/90 backdrop-blur-lg border border-[#c5a059]/40 px-4 py-2 rounded-full shadow-[0_0_25px_rgba(197,160,89,0.25)] flex items-center gap-3 animate-in slide-in-from-bottom-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-ping" />
          <span className="text-[11px] font-mono text-white hidden sm:inline">Want to see all features in action?</span>
        </div>
        <button
          onClick={onExploreDemo}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c5a059] text-black font-bold text-[10px] uppercase font-mono tracking-wider hover:bg-[#d8b56f] transition-all"
        >
          <Zap className="w-3 h-3 fill-current" />
          <span>Launch Live Demo App</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
