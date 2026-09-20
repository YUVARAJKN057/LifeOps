import React, { useState } from 'react';
import {
  Flame,
  Search,
  Dumbbell,
  Timer,
  Volume2,
  VolumeX,
  Shuffle,
  Trophy,
  X,
  Zap,
  Shield,
  Heart,
  Compass,
  Sparkles,
  Smile,
  HeartHandshake,
  Bot,
  Layers,
  Menu,
  ChevronDown,
  Home,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { DemographicCategory } from '../../types';
import { CATEGORY_DEFINITIONS } from '../../data/exerciseCatalogData';

export type MainNavView = 'home' | 'category' | 'exercise-studio' | 'circuits' | 'activity-tracker' | 'stats';
export type NavbarTab = 'all' | DemographicCategory | 'circuits' | 'activity-tracker' | 'stats';

interface ExerciseNavbarProps {
  currentView: MainNavView;
  activeCategory: DemographicCategory | 'all';
  onNavigateHome: () => void;
  onSelectCategory: (category: DemographicCategory) => void;
  onNavigateCircuits: () => void;
  onNavigateActivityTracker: () => void;
  onOpenStats: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onRandomExercise: () => void;
  completedCount: number;
  categoryCounts: Record<string, number>;
}

export const ExerciseNavbar: React.FC<ExerciseNavbarProps> = ({
  currentView,
  activeCategory,
  onNavigateHome,
  onSelectCategory,
  onNavigateCircuits,
  onNavigateActivityTracker,
  onOpenStats,
  searchQuery,
  onSearchChange,
  isAudioEnabled,
  onToggleAudio,
  onRandomExercise,
  completedCount,
  categoryCounts,
}) => {
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // All comprehensive movement categories for the menu dropdown
  const allCategories: Array<{
    id: DemographicCategory;
    label: string;
    icon: string;
    badge?: string;
    desc: string;
    accentColor: string;
  }> = [
    {
      id: 'kids',
      label: 'Kids & Youth',
      icon: '🧒',
      badge: 'Age 5-14',
      desc: 'Ninja crab kicks, star jumps, agility',
      accentColor: '#f59e0b',
    },
    {
      id: 'seniors',
      label: 'Aged & Senior Vitality',
      icon: '👵',
      badge: 'Gentle & Safe',
      desc: 'Sit-to-stand, fall prevention, ankle mobility',
      accentColor: '#10b981',
    },
    {
      id: 'general_health',
      label: 'General Health & Desk',
      icon: '✨',
      badge: 'Daily Wellness',
      desc: 'Ergonomic posture resets, desk chest opener',
      accentColor: '#0ea5e9',
    },
    {
      id: 'cardio',
      label: 'Cardio & Skipping',
      icon: '⚡',
      badge: 'Calorie Torch',
      desc: 'Speed jump rope, boxer skip, high knees',
      accentColor: '#eab308',
    },
    {
      id: 'strength',
      label: 'Strength & Bodyweight',
      icon: '💪',
      badge: 'Hypertrophy',
      desc: 'Push-ups, squats, calisthenics, power',
      accentColor: '#8b5cf6',
    },
    {
      id: 'core',
      label: 'Core & Spine Shield',
      icon: '🛡️',
      badge: 'Spine Health',
      desc: 'Bird-dogs, deadbugs, hollow body holds',
      accentColor: '#3b82f6',
    },
    {
      id: 'mobility',
      label: 'Mobility & Recovery',
      icon: '🧘',
      badge: 'Longevity',
      desc: 'Joint mobility, hip openers, active stretching',
      accentColor: '#14b8a6',
    },
  ];

  const handleCategoryClick = (catId: DemographicCategory) => {
    onSelectCategory(catId);
    setIsMobileMenuOpen(false);
    setIsCategoriesMenuOpen(false);
  };

  const isCategoryActive = (catId: DemographicCategory) => {
    return (currentView === 'category' || currentView === 'exercise-studio') && activeCategory === catId;
  };

  const currentActiveCategoryObj = allCategories.find((c) => c.id === activeCategory);

  return (
    <header className="sticky top-0 z-40 bg-[#09090e]/95 backdrop-blur-md border-b border-[#1f1f2a] shadow-lg">
      {/* Top Navbar Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
          title="Go to Kinetic Academy Home"
        >
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#c5a059]/30 to-[#c5a059]/10 border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059] group-hover:scale-105 transition-transform shadow-sm">
            <Flame className="w-5 h-5 text-[#c5a059]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base sm:text-lg text-white tracking-tight group-hover:text-[#c5a059] transition-colors">
                KINETIC ACADEMY
              </span>
              <span className="hidden sm:inline-block text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-[#161622] text-[#c5a059] border border-[#2b2b3c] font-semibold">
                3D Fitness
              </span>
            </div>
            <p className="text-[10px] text-[#888] font-mono hidden md:block leading-none mt-0.5">
              Demographic Workouts • 3D Simulator • AI Coach
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2 font-mono text-xs">
          {/* Home / Explore */}
          <button
            onClick={onNavigateHome}
            className={`px-3 py-2 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'home'
                ? 'bg-[#c5a059] text-black font-bold shadow-md'
                : 'text-[#aaa] hover:text-white hover:bg-[#161620]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Categories Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsCategoriesMenuOpen(!isCategoriesMenuOpen)}
              className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 cursor-pointer border ${
                currentView === 'category' || isCategoriesMenuOpen
                  ? 'bg-[#181826] border-[#c5a059]/60 text-[#c5a059] font-bold shadow-sm'
                  : 'bg-[#111118] border-[#252536] text-[#ccc] hover:text-white hover:border-[#383850]'
              }`}
              title="Browse Exercise Categories"
            >
              <Layers className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>
                {currentView === 'category' && currentActiveCategoryObj
                  ? `Category: ${currentActiveCategoryObj.label}`
                  : 'Categories'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#888] transition-transform duration-200 ${
                  isCategoriesMenuOpen ? 'rotate-180 text-[#c5a059]' : ''
                }`}
              />
            </button>

            {/* Rich 2-Column Categories Dropdown Menu */}
            {isCategoriesMenuOpen && (
              <div
                className="absolute left-0 mt-2 w-[540px] bg-[#0e0e15] border border-[#2a2a3e] rounded-lg shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl"
                onMouseLeave={() => setIsCategoriesMenuOpen(false)}
              >
                <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-[#1c1c28]">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#c5a059] font-semibold uppercase tracking-wider">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Demographic Movement Hubs</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#777]">
                    8 Specialized Categories
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {allCategories.map((cat) => {
                    const active = isCategoryActive(cat.id);
                    const count = categoryCounts[cat.id] || 0;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`w-full p-2.5 rounded-md text-left flex items-start gap-2.5 transition-all cursor-pointer border ${
                          active
                            ? 'bg-[#1e1b14] border-[#c5a059] text-white'
                            : 'bg-[#13131c] border-[#1f1f2e] hover:bg-[#1a1a28] hover:border-[#383850] text-[#ccc] hover:text-white'
                        }`}
                      >
                        <span className="text-xl p-1.5 rounded-md bg-[#181824] border border-[#252538] flex-shrink-0">
                          {cat.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-semibold truncate font-serif">
                              {cat.label}
                            </span>
                            {cat.badge && (
                              <span
                                className="text-[9px] font-mono uppercase px-1 py-0.2 rounded-xs font-bold flex-shrink-0"
                                style={{
                                  backgroundColor: `${cat.accentColor}20`,
                                  color: cat.accentColor,
                                }}
                              >
                                {cat.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#888] line-clamp-1 font-sans mt-0.5">
                            {cat.desc}
                          </p>
                          <div className="text-[9px] font-mono text-[#666] mt-1 flex items-center gap-1">
                            <span>{count} movements</span>
                            <span>•</span>
                            <span className="text-[#38bdf8]">3D Ready</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1c1c28] flex items-center justify-between px-2 text-[10px] font-mono text-[#888]">
                  <span>Evidence-informed biomechanics & form cues</span>
                  <button
                    onClick={() => {
                      onNavigateHome();
                      setIsCategoriesMenuOpen(false);
                    }}
                    className="text-[#c5a059] hover:underline cursor-pointer"
                  >
                    View Hub Summary →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Workout Circuits Link */}
          <button
            onClick={onNavigateCircuits}
            className={`px-3 py-2 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'circuits'
                ? 'bg-[#c5a059] text-black font-bold shadow-md'
                : 'text-[#aaa] hover:text-white hover:bg-[#161620]'
            }`}
          >
            <span>⏱️</span>
            <span>Circuits</span>
          </button>

          {/* Activity Tracker View Link */}
          <button
            onClick={onNavigateActivityTracker}
            className={`px-3 py-2 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'activity-tracker'
                ? 'bg-[#c5a059] text-black font-bold shadow-md'
                : 'text-[#aaa] hover:text-white hover:bg-[#161620]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#34d399]" />
            <span>Activity Tracker</span>
          </button>
        </nav>

        {/* Right Tools & Search */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative hidden sm:block w-48 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#777]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search movement..."
              className="w-full bg-[#12121a] border border-[#242432] hover:border-[#383848] focus:border-[#c5a059] rounded-md pl-8 pr-7 py-1.5 text-xs text-white placeholder-[#666] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#777] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Audio toggle */}
          <button
            onClick={onToggleAudio}
            className={`p-2 rounded-md border transition-all ${
              isAudioEnabled
                ? 'bg-[#181824] border-[#38384e] text-[#c5a059] hover:bg-[#202030]'
                : 'bg-[#121218] border-[#22222c] text-[#555] hover:text-[#888]'
            }`}
            title={isAudioEnabled ? 'AI Voice Narration: Enabled (Click to Mute)' : 'AI Voice Narration: Muted (Click to Enable)'}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Random Exercise Button */}
          <button
            onClick={onRandomExercise}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#14141e] border border-[#262636] hover:border-[#c5a059] text-xs font-mono text-[#aaa] hover:text-white transition-all shadow-sm"
            title="Practice a random movement"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="hidden lg:inline">Random</span>
          </button>

          {/* Stats & History Log Button */}
          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-[#c5a059]/20 to-[#c5a059]/10 hover:from-[#c5a059]/30 hover:to-[#c5a059]/20 border border-[#c5a059]/50 text-[#c5a059] text-xs font-mono font-semibold transition-all shadow-sm"
            title="View Exercise Database & Completed Activity"
          >
            <Trophy className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>{completedCount}</span>
            <span className="hidden sm:inline text-[10px] text-[#aaa]">logged</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md border border-[#282838] bg-[#14141e] text-[#ccc] hover:text-white lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1c1c28] bg-[#0c0c14] px-4 py-3 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-2xl">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search exercise for kids, seniors, mobility..."
              className="w-full bg-[#14141e] border border-[#2a2a3c] rounded-md pl-9 pr-3 py-2 text-xs text-white placeholder-[#666] focus:outline-none"
            />
          </div>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
            <button
              onClick={() => {
                onNavigateHome();
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-md text-left flex items-center gap-2 ${
                currentView === 'home' ? 'bg-[#c5a059] text-black font-bold' : 'bg-[#14141e] text-[#ccc]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Explore Home</span>
            </button>

            <button
              onClick={() => {
                onNavigateCircuits();
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-md text-left flex items-center gap-2 ${
                currentView === 'circuits' ? 'bg-[#c5a059] text-black font-bold' : 'bg-[#14141e] text-[#ccc]'
              }`}
            >
              <span>⏱️</span>
              <span>Circuits</span>
            </button>

            <button
              onClick={() => {
                onNavigateActivityTracker();
                setIsMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-md text-left flex items-center gap-2 ${
                currentView === 'activity-tracker' ? 'bg-[#c5a059] text-black font-bold' : 'bg-[#14141e] text-[#ccc]'
              }`}
            >
              <Activity className="w-4 h-4 text-[#34d399]" />
              <span>Activity Tracker</span>
            </button>

            {allCategories.map((cat) => {
              const active = isCategoryActive(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`p-2.5 rounded-md text-left flex items-center gap-2 cursor-pointer ${
                    active ? 'bg-[#c5a059] text-black font-bold' : 'bg-[#14141e] text-[#ccc] hover:bg-[#1c1c28]'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#1c1c28] flex items-center justify-between text-xs font-mono text-[#888]">
            <button
              onClick={() => {
                onRandomExercise();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 text-[#c5a059]"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random Exercise</span>
            </button>

            <button
              onClick={() => {
                onOpenStats();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 text-emerald-400"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>View Logs ({completedCount})</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
