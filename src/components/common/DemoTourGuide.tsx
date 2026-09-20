import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  Zap,
  X,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  CheckSquare,
  Target,
  Flame,
  IndianRupee,
  Calendar,
  Mic,
  RotateCcw,
  Headphones,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface DemoTourGuideProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const DemoTourGuide: React.FC<DemoTourGuideProps> = ({ isOpen: controlledIsOpen, onClose: controlledOnClose }) => {
  const {
    activeTab,
    setActiveTab,
    openLiveVoice,
    openQuickAdd,
    setIsCommandPaletteOpen,
    resetDataToDefaults,
  } = useApp();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showBanner, setShowBanner] = useState(true);

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const tourSteps = [
    {
      id: 'welcome',
      title: 'Welcome to LifeOps Interactive Demo',
      subtitle: 'Personal Sovereign Operating System',
      description:
        'LifeOps brings all your life verticals—Daily Tasks, Quarterly Goals, Habit Streaks, Rupee (₹) Finances, Calendar Schedule, and Conversational Voice AI—into a unified command center.',
      icon: <Compass className="w-6 h-6 text-[#c5a059]" />,
      actionText: 'Explore Dashboard',
      onAction: () => setActiveTab('dashboard'),
      tips: [
        'Press ⌘K anywhere to open the Global Command Center',
        'Press ⌘J to speak with the Live Voice AI Assistant',
        'Use the top right Dispatch button to quickly log items',
      ],
    },
    {
      id: 'tasks',
      title: 'Priority Directives & Eisenhower Matrix',
      subtitle: 'Execution Engine',
      description:
        'Manage urgent and important tasks across Work, Personal, Health, and Finance. Drag between quadrants, track time estimates, and calculate real-time productivity scores.',
      icon: <CheckSquare className="w-6 h-6 text-[#c5a059]" />,
      actionText: 'Open Tasks Matrix',
      onAction: () => {
        setActiveTab('tasks');
        handleClose();
      },
      tips: [
        'Click any task to toggle completion and boost your yield score',
        'Filter by category or quadrant',
        'Use AI to auto-breakdown complex tasks into actionable subtasks',
      ],
    },
    {
      id: 'finances',
      title: 'Rupee (₹) Capital Wealth Vault',
      subtitle: 'Net Worth & Cashflow Mastery',
      description:
        'Track cashflow, monthly budgets, SIP investments, emergency funds, and recurring expenses natively calibrated for India with ₹ INR formatting and 50/30/20 budget ratio.',
      icon: <IndianRupee className="w-6 h-6 text-[#c5a059]" />,
      actionText: 'View Finances (₹)',
      onAction: () => {
        setActiveTab('expenses');
        handleClose();
      },
      tips: [
        'See your monthly burn rate and runway calculation',
        'Categorize expenses across Housing, Investments, Food, and Travel',
        'Interactive 3D Wealth Vault shows asset allocation in real time',
      ],
    },
    {
      id: 'voice_ai',
      title: 'Live Conversational Voice AI (⌘J)',
      subtitle: 'Zero-Latency Voice Command Core',
      description:
        'Speak naturally to log expenses ("Spent ₹850 at Blue Tokai"), schedule meetings ("Deep work tomorrow at 10 AM"), or ask strategic questions about your weekly yield.',
      icon: <Mic className="w-6 h-6 text-[#c5a059]" />,
      actionText: 'Launch Voice AI (⌘J)',
      onAction: () => {
        handleClose();
        openLiveVoice();
      },
      tips: [
        'Instant voice transcription with Web Speech API',
        'Audio wave synthesizer visualizer',
        'Auto-extracts dates, amounts in ₹ INR, and task priorities',
      ],
    },
    {
      id: 'habits_goals',
      title: 'Atomic Habits & Long-Term Goals',
      subtitle: 'Compounding Personal Trajectory',
      description:
        'Build unbreakable streaks with the Github-style habit heatmap. Link daily habits directly to your annual north-star milestones to ensure alignment.',
      icon: <Target className="w-6 h-6 text-[#c5a059]" />,
      actionText: 'View Goals & Habits',
      onAction: () => {
        setActiveTab('habits');
        handleClose();
      },
      tips: [
        'Interactive streak counter with XP leveling system',
        'Visual milestone progress bars with target dates',
        'Morning & Evening routine daily flow check-ins',
      ],
    },
  ];

  const currentStep = tourSteps[currentStepIndex];

  return (
    <>
      {/* Demo Floating Quick Bar at Top when active */}
      {showBanner && (
        <div
          id="demo-mode-top-banner"
          className="bg-gradient-to-r from-[#12100a] via-[#1a160d] to-[#0e0c08] border-b border-[#c5a059]/30 px-4 py-2 flex items-center justify-between text-xs transition-all z-30"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#c5a059] font-mono text-[10px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 animate-pulse" />
              <span>Interactive Demo Mode</span>
            </div>
            <span className="text-[#d1d1d1] hidden sm:inline text-xs">
              Explore pre-loaded Indian Rupee (₹) portfolios, tasks, goals & live voice core.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="demo-open-walkthrough-btn"
              onClick={() => setInternalIsOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-[#c5a059] text-black font-semibold text-[11px] uppercase tracking-wider hover:bg-[#e0bb72] transition-colors"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Tour</span>
            </button>

            <button
              id="demo-reset-data-btn"
              onClick={() => {
                if (window.confirm('Reset all demo data back to default state?')) {
                  resetDataToDefaults();
                }
              }}
              className="hidden md:flex items-center gap-1 px-2 py-1 rounded-sm bg-[#111] text-[#999] hover:text-white border border-[#222] text-[10px] uppercase font-mono tracking-wider transition-colors"
              title="Reset to initial demo data"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>

            <button
              onClick={() => setShowBanner(false)}
              className="p-1 text-[#666] hover:text-white rounded-sm hover:bg-[#222] transition-colors"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Full Tour Modal */}
      {isModalOpen && (
        <div
          id="demo-tour-modal-overlay"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            id="demo-tour-modal-box"
            className="w-full max-w-xl bg-[#0a0a0a] border border-[#c5a059]/40 rounded-sm shadow-2xl overflow-hidden backdrop-blur-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#1a1a1a] flex items-center justify-between bg-gradient-to-r from-[#111] to-[#0a0a0a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#1a1a1a] border border-[#c5a059]/40 flex items-center justify-center">
                  {currentStep.icon}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#c5a059] block">
                    Step {currentStepIndex + 1} of {tourSteps.length} &bull; {currentStep.subtitle}
                  </span>
                  <h3 className="text-base font-serif text-white">{currentStep.title}</h3>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1 text-[#777] hover:text-white rounded-sm hover:bg-[#1a1a1a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <p className="text-sm text-[#ccc] leading-relaxed">
                {currentStep.description}
              </p>

              {/* Pro Tips Box */}
              <div className="p-4 rounded-sm bg-[#0e0e0e] border border-[#1a1a1a] space-y-2">
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#c5a059] flex items-center gap-1.5 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Key Features & Controls</span>
                </div>
                <ul className="space-y-1.5">
                  {currentStep.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#aaa]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059] flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct Action Shortcut Button */}
              <button
                id="tour-step-direct-action"
                onClick={currentStep.onAction}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#e0bb72] transition-colors shadow-[0_0_15px_rgba(197,160,89,0.25)]"
              >
                <span>{currentStep.actionText}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-[#080808] border-t border-[#1a1a1a] flex items-center justify-between">
              {/* Stepper Dots */}
              <div className="flex items-center gap-1.5">
                {tourSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'w-6 bg-[#c5a059]'
                        : 'w-2 bg-[#222] hover:bg-[#444]'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 rounded-sm border border-[#222] text-xs text-[#888] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                {currentStepIndex < tourSteps.length - 1 ? (
                  <button
                    onClick={() => setCurrentStepIndex((prev) => Math.min(tourSteps.length - 1, prev + 1))}
                    className="px-4 py-1.5 rounded-sm bg-[#161616] hover:bg-[#222] text-white text-xs border border-[#333] flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="px-4 py-1.5 rounded-sm bg-[#c5a059] text-black font-semibold text-xs"
                  >
                    Start Using LifeOps
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
