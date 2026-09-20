import React, { useState } from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  Flame,
  Calendar,
  IndianRupee,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  User,
  Search,
  Plus,
  Zap,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Mic,
  Home,
  Compass,
  Headphones,
  RotateCcw,
  Activity,
  Camera,
} from 'lucide-react';
import { ParticleUniverse } from '../common/ParticleUniverse';
import { DemoTourGuide } from '../common/DemoTourGuide';
import { FocusAudioEngine } from '../common/FocusAudioEngine';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    user,
    activeTab,
    setActiveTab,
    unreadNotificationCount,
    setIsCommandPaletteOpen,
    openQuickAdd,
    openLiveVoice,
    openExerciseCoach,
    logout,
    productivityScore,
    resetDataToDefaults,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isAudioDrawerOpen, setIsAudioDrawerOpen] = useState(false);

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: <Target className="w-4 h-4" />,
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: <Flame className="w-4 h-4" />,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'expenses',
      label: 'Finances (₹)',
      icon: <IndianRupee className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'ai',
      label: 'AI Assistant',
      icon: <Sparkles className="w-4 h-4 text-[#c5a059]" />,
      badge: 'AI Core',
      badgeColor: 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/30',
    },
  ];

  const bottomNavItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
    },
  ];

  const currentDateFormatted = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div
      id="lifeops-app-shell"
      className="relative min-h-screen bg-[#050505] text-[#d1d1d1] flex flex-col antialiased overflow-x-hidden selection:bg-[#c5a059] selection:text-black font-sans"
    >
      {/* Background ambient particle universe in gold tones */}
      <ParticleUniverse intensity="subtle" className="opacity-25 pointer-events-none" />

      {/* Interactive Tour Guide Modal / Banner */}
      <DemoTourGuide
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
      />

      {/* Main Container Layout */}
      <div className="relative z-10 flex flex-1 h-screen overflow-hidden">
        {/* ======================================= */}
        {/* DESKTOP SIDEBAR */}
        {/* ======================================= */}
        <aside
          id="lifeops-desktop-sidebar"
          className="hidden md:flex flex-col w-68 border-r border-[#1a1a1a] bg-[#050505] flex-shrink-0 justify-between"
        >
          <div className="flex flex-col flex-1 min-h-0">
            {/* Logo & Brand Header */}
            <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
              <div
                className="cursor-pointer group select-none"
                onClick={() => setActiveTab('dashboard')}
              >
                <div className="text-[#c5a059] font-serif italic text-2xl tracking-tight leading-none group-hover:text-[#e5c178] transition-colors">
                  LifeOps
                </div>
                <div className="text-[#7a7a7a] text-[9px] uppercase tracking-[0.24em] mt-1 font-medium">
                  Personal Operating System
                </div>
              </div>

              <button
                onClick={() => setIsTourModalOpen(true)}
                title="Launch Interactive Tour Guide"
                className="p-1.5 rounded-sm bg-[#111] hover:bg-[#1a1a1a] text-[#c5a059] border border-[#c5a059]/40 hover:border-[#c5a059] transition-all"
              >
                <Compass className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Primary Navigation Links */}
            <nav className="flex-1 px-4 py-3.5 space-y-1 overflow-y-auto custom-scrollbar">
              {/* Quick Live Voice Launcher & Exercise AI Coach */}
              <div className="mb-2 space-y-1.5">
                <button
                  id="sidebar-live-voice-btn"
                  onClick={openLiveVoice}
                  className="w-full flex items-center justify-between p-2.5 rounded-sm bg-gradient-to-r from-[#111] to-[#0a0a0a] border border-[#c5a059]/40 hover:border-[#c5a059] text-xs tracking-wider uppercase font-medium transition-all group shadow-[0_0_15px_rgba(197,160,89,0.1)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-sm bg-[#c5a059]/15 flex items-center justify-center text-[#c5a059]">
                      <Mic className="w-3.5 h-3.5 group-hover:scale-110 transition-transform animate-pulse" />
                    </div>
                    <span className="text-[#d1d1d1] group-hover:text-white font-serif">Live Voice AI</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#050505] text-[#c5a059] border border-[#222]">
                    ⌘J
                  </span>
                </button>

                <button
                  id="sidebar-exercise-coach-btn"
                  onClick={() => openExerciseCoach('squat')}
                  className="w-full flex items-center justify-between p-2.5 rounded-sm bg-[#0a0f0d] border border-emerald-500/30 hover:border-emerald-500/70 text-xs tracking-wider uppercase font-medium transition-all group shadow-[0_0_12px_rgba(52,211,153,0.08)]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-sm bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                      <Camera className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[#d1d1d1] group-hover:text-white font-serif">Exercise Coach</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#050505] text-emerald-400 border border-[#222]">
                    Vision AI
                  </span>
                </button>
              </div>

              {/* Ambient Focus Soundscape Launcher */}
              <div className="mb-3">
                <button
                  id="sidebar-focus-audio-btn"
                  onClick={() => setIsAudioDrawerOpen(!isAudioDrawerOpen)}
                  className={`w-full flex items-center justify-between p-2 rounded-sm border text-[11px] font-mono uppercase transition-all ${
                    isAudioDrawerOpen
                      ? 'bg-[#141414] border-[#c5a059] text-[#c5a059]'
                      : 'bg-[#080808] border-[#1a1a1a] text-[#888] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Headphones className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Focus Soundscapes</span>
                  </div>
                  <span className="text-[9px] text-[#555]">{isAudioDrawerOpen ? 'Close ▲' : 'Open ▼'}</span>
                </button>

                {isAudioDrawerOpen && (
                  <div className="mt-2 w-full max-w-full overflow-hidden animate-in fade-in">
                    <FocusAudioEngine />
                  </div>
                )}
              </div>

              <div className="text-[#555] text-[9px] uppercase tracking-[0.25em] px-3 mb-1.5 font-semibold">
                Directives & Modules
              </div>
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs tracking-widest uppercase font-medium transition-all ${
                      isActive
                        ? 'bg-[#0a0a0a] text-[#c5a059] border border-[#c5a059]/40 shadow-[0_0_10px_rgba(197,160,89,0.1)]'
                        : 'text-[#7a7a7a] hover:text-white hover:bg-[#0a0a0a] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={isActive ? 'text-[#c5a059]' : 'text-[#7a7a7a]'}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-sm border uppercase tracking-wider font-mono ${
                          item.badgeColor || 'bg-[#1a1a1a] text-[#c5a059] border-[#1a1a1a]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Status & Controls */}
          <div className="p-4 border-t border-[#1a1a1a] space-y-3 bg-[#050505]">
            {/* Market / Execution Status Badge */}
            <div className="p-3 border border-[#1a1a1a] rounded-sm bg-[#080808]">
              <div className="flex items-center justify-between text-[9px] text-[#555] uppercase tracking-widest mb-1.5">
                <span>System Efficiency</span>
                <span className="font-mono text-[#c5a059] font-semibold">{productivityScore.total}/100</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shadow-[0_0_8px_rgba(197,160,89,0.5)]"></div>
                  <span className="text-[11px] text-[#999] tracking-tight">Tier I Prime Active</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#c5a059]/10 text-[#c5a059] font-mono border border-[#c5a059]/30">
                  {productivityScore.grade}
                </span>
              </div>
            </div>

            {/* Bottom Nav Links */}
            <div className="space-y-1">
              {bottomNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`bottom-nav-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-sm text-[11px] uppercase tracking-wider font-medium transition-all ${
                      isActive
                        ? 'bg-[#0a0a0a] text-[#c5a059] border border-[#c5a059]/30'
                        : 'text-[#7a7a7a] hover:text-white hover:bg-[#0a0a0a] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-[#c5a059] text-black font-bold font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* User Mini Profile & Sign Out */}
            <div className="pt-2 border-t border-[#1a1a1a] flex items-center justify-between">
              <div
                className="flex items-center gap-2.5 cursor-pointer min-w-0 group"
                onClick={() => setActiveTab('profile')}
              >
                <div className="w-8 h-8 rounded-full border border-[#c5a059]/40 p-0.5 bg-gradient-to-tr from-[#111] to-[#222]">
                  <div className="w-full h-full rounded-full bg-[#0a0a0a] flex items-center justify-center text-[#c5a059] font-serif text-sm font-bold">
                    {user?.name ? user.name[0].toUpperCase() : 'A'}
                  </div>
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-white group-hover:text-[#c5a059] transition-colors truncate">
                    {user?.name || 'Julian Vane-Standish'}
                  </div>
                  <div className="text-[9px] text-[#c5a059] uppercase tracking-[0.2em] truncate">
                    Private Client &bull; ₹
                  </div>
                </div>
              </div>

              <button
                id="sidebar-logout-btn"
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-[#555] hover:text-[#c5a059] rounded-sm hover:bg-[#0a0a0a] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[#444] text-[9px] tracking-[0.2em] uppercase text-center pt-1">
              Bengaluru / Mumbai / Delhi
            </div>
          </div>
        </aside>

        {/* ======================================= */}
        {/* MAIN CONTENT AREA & TOPBAR */}
        {/* ======================================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#050505]">
          {/* Top Bar Header */}
          <header
            id="lifeops-top-bar"
            className="h-16 px-4 md:px-8 border-b border-[#1a1a1a] bg-[#080808]/90 backdrop-blur-xl flex items-center justify-between flex-shrink-0"
          >
            {/* Left: Mobile menu toggle or date */}
            <div className="flex items-center gap-3">
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="p-2 md:hidden text-[#7a7a7a] hover:text-white rounded-sm hover:bg-[#111]"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="hidden sm:block">
                <span className="text-[11px] text-[#7a7a7a] font-mono tracking-widest uppercase">
                  {currentDateFormatted} &bull; IST
                </span>
              </div>
            </div>

            {/* Center: Global Search Bar */}
            <div className="flex-1 max-w-md mx-4">
              <button
                id="topbar-search-trigger"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="w-full flex items-center justify-between px-4 py-1.5 rounded-sm bg-[#050505] border border-[#1a1a1a] hover:border-[#c5a059]/40 text-[#7a7a7a] hover:text-[#d1d1d1] text-xs transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-[#555] group-hover:text-[#c5a059] transition-colors" />
                  <span className="truncate tracking-wide text-xs">Search or query directives (⌘K)...</span>
                </div>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-sm bg-[#111] text-[9px] font-mono text-[#c5a059] border border-[#1a1a1a]">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Right: Tour Button + Live Voice + Quick Add + Notification Bell + Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsTourModalOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[#111] hover:bg-[#1a1a1a] text-[#c5a059] border border-[#c5a059]/30 text-xs font-mono uppercase tracking-wider transition-all"
                title="Open Interactive Demo Tour"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Tour</span>
              </button>

              {/* Ambient Focus Audio Pill */}
              <FocusAudioEngine compact={true} />

              {/* Exercise Coach & Camera Verification */}
              <button
                id="topbar-exercise-coach-btn"
                onClick={() => openExerciseCoach('squat')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[#111] hover:bg-[#181818] border border-emerald-500/40 text-emerald-400 text-xs uppercase tracking-wider font-semibold transition-all group shadow-[0_0_12px_rgba(52,211,153,0.1)]"
                title="Exercise Tutorial & Optical Camera Verification"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="hidden md:inline">Exercise AI</span>
              </button>

              {/* Live Voice AI Button */}
              <button
                id="topbar-live-voice-btn"
                onClick={openLiveVoice}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#111] hover:bg-[#181818] border border-[#c5a059]/40 text-[#c5a059] text-xs uppercase tracking-wider font-semibold transition-all group shadow-[0_0_12px_rgba(197,160,89,0.1)]"
                title="Open Live Conversational Voice Core (⌘J)"
              >
                <Mic className="w-3.5 h-3.5 text-[#c5a059] group-hover:scale-110 transition-transform animate-pulse" />
                <span className="hidden md:inline">Voice</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>

              <button
                id="topbar-quick-add-btn"
                onClick={() => openQuickAdd('task')}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-sm bg-[#c5a059] text-black text-xs uppercase tracking-widest font-semibold shadow-[0_0_12px_rgba(197,160,89,0.25)] hover:bg-[#d8b56f] transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Dispatch</span>
              </button>

              <button
                id="topbar-notification-btn"
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 text-[#7a7a7a] hover:text-white rounded-sm hover:bg-[#111] transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#c5a059] ring-2 ring-black shadow-[0_0_6px_rgba(197,160,89,0.8)]" />
                )}
              </button>

              <button
                id="topbar-profile-btn"
                onClick={() => setActiveTab('profile')}
                className="p-0.5 rounded-full hover:border-[#c5a059] transition-all ml-1"
              >
                <div className="w-7 h-7 rounded-full border border-[#c5a059]/40 bg-[#0a0a0a] flex items-center justify-center text-[#c5a059] font-serif text-xs font-bold">
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
              </button>
            </div>
          </header>

          {/* Mobile Drawer (When Open) */}
          {isMobileMenuOpen && (
            <div
              id="mobile-drawer-overlay"
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md md:hidden pt-16"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div
                className="p-4 bg-[#080808] border-b border-[#1a1a1a] space-y-1 max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsTourModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-sm text-xs uppercase tracking-widest font-semibold bg-[#111] text-[#c5a059] border border-[#c5a059]/40 mb-2"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4" />
                    <span>Start Interactive Tour</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {navItems.concat(bottomNavItems as any).map((item) => (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-sm text-xs uppercase tracking-widest font-medium ${
                      activeTab === item.id
                        ? 'bg-[#0a0a0a] text-[#c5a059] border border-[#c5a059]/40'
                        : 'text-[#7a7a7a] hover:bg-[#111]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Main Scrollable View Area */}
          <main
            id="lifeops-main-viewport"
            className="flex-1 overflow-y-auto px-4 md:px-10 py-6 pb-24 md:pb-10"
          >
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <div
            id="lifeops-mobile-bottom-bar"
            className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-[#080808]/95 border-t border-[#1a1a1a] backdrop-blur-xl flex items-center justify-around px-2"
          >
            {[
              { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`flex flex-col items-center justify-center flex-1 py-1 ${
                    isActive ? 'text-[#c5a059] font-medium' : 'text-[#555] hover:text-[#999]'
                  }`}
                >
                  {item.icon}
                  <span className="text-[9px] mt-0.5 tracking-wider uppercase">{item.label}</span>
                </button>
              );
            })}

            {/* Central Mobile Live Voice Quick Orb Button */}
            <button
              id="mobile-live-voice-center-btn"
              onClick={openLiveVoice}
              className="flex flex-col items-center justify-center -mt-5 mx-1"
              title="Live Voice AI"
            >
              <div className="w-11 h-11 rounded-full bg-[#c5a059] border-2 border-black flex items-center justify-center text-black shadow-[0_0_15px_rgba(197,160,89,0.5)] active:scale-95 transition-transform">
                <Mic className="w-5 h-5 animate-pulse stroke-[2.5]" />
              </div>
              <span className="text-[8px] font-mono text-[#c5a059] uppercase tracking-wider mt-0.5">Voice</span>
            </button>

            {[
              { id: 'ai', label: 'AI Core', icon: <Sparkles className="w-4 h-4 text-[#c5a059]" /> },
              { id: 'expenses', label: 'Finances', icon: <IndianRupee className="w-4 h-4" /> },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`flex flex-col items-center justify-center flex-1 py-1 ${
                    isActive ? 'text-[#c5a059] font-medium' : 'text-[#555] hover:text-[#999]'
                  }`}
                >
                  {item.icon}
                  <span className="text-[9px] mt-0.5 tracking-wider uppercase">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
