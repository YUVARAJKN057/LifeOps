import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Flame,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Target,
  ShieldCheck,
  Clock,
  Dumbbell,
  Heart,
  Zap,
  Activity,
  Check,
  ChevronRight,
  ChevronLeft,
  Camera,
  Layers,
  Award,
  TrendingUp,
  Info,
  Sliders,
  Volume2,
  VolumeX,
  Smile,
  HeartHandshake,
  Shield,
  Bot,
  Compass,
  ArrowLeft,
  Box,
} from 'lucide-react';
import { ExerciseGuide, CATEGORY_DEFINITIONS, DemographicCategory, EXERCISE_CATALOG } from '../../data/exerciseCatalogData';
import { Exercise3DCanvas } from './Exercise3DCanvas';
import { ExerciseMotionVideoCanvas } from './ExerciseMotionVideoCanvas';
import { AIVoiceCoachBar } from './AIVoiceCoachBar';
import { CategoryQuickNav } from './CategoryQuickNav';

interface ExerciseDetailStudioProps {
  exercise: ExerciseGuide;
  isAudioEnabled: boolean;
  onCompleteExercise: (exercise: ExerciseGuide, reps?: number, duration?: number) => void;
  isCompletedToday?: boolean;
  onBack?: () => void;
  onSelectCategory?: (category: DemographicCategory) => void;
  onSelectExercise?: (exercise: ExerciseGuide) => void;
}

export const ExerciseDetailStudio: React.FC<ExerciseDetailStudioProps> = ({
  exercise,
  isAudioEnabled,
  onCompleteExercise,
  isCompletedToday = false,
  onBack,
  onSelectCategory,
  onSelectExercise,
}) => {
  // Active viewing tab & simulation mode
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'benefits' | 'mistakes' | 'biomechanics'>('overview');
  const [simulationMode, setSimulationMode] = useState<'3d' | 'video' | 'split'>('video');
  const [view3DPlaying, setView3DPlaying] = useState<boolean>(true);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);

  // Cadence / Rep counter / Timer
  const [repsDone, setRepsDone] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(exercise.targetSeconds || 30);
  const [isMetronomeActive, setIsMetronomeActive] = useState<boolean>(false);
  const [cadenceBeat, setCadenceBeat] = useState<'Down / Inhale' | 'Hold / Pause' | 'Up / Exhale'>('Down / Inhale');

  const categoryDef = CATEGORY_DEFINITIONS[exercise.category] || CATEGORY_DEFINITIONS.general_health;

  // Reset counters on exercise change
  useEffect(() => {
    setActiveStepIdx(0);
    setRepsDone(0);
    setIsTimerRunning(false);
    setSecondsRemaining(exercise.targetSeconds || 30);
    setIsMetronomeActive(false);
  }, [exercise.id]);

  // Audio Beep Cue
  const playBeep = useCallback(
    (freq = 550, duration = 0.12) => {
      if (!isAudioEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {}
    },
    [isAudioEnabled]
  );

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            playBeep(880, 0.4);
            setIsTimerRunning(false);
            return 0;
          }
          if (prev <= 4) {
            playBeep(600, 0.1);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining, playBeep]);

  // Cadence pacer loop
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    let isActive = isMetronomeActive;

    if (isMetronomeActive && exercise.cadence) {
      const downMs = Math.max(400, (exercise.cadence.down || 1) * 1000);
      const holdMs = (exercise.cadence.hold || 0) * 1000;
      const upMs = Math.max(400, (exercise.cadence.up || 1) * 1000);

      const runCadence = () => {
        if (!isActive) return;
        setCadenceBeat('Down / Inhale');
        playBeep(440, 0.08);

        timeout = setTimeout(() => {
          if (!isActive) return;
          if (holdMs > 0) {
            setCadenceBeat('Hold / Pause');
            playBeep(520, 0.08);

            timeout = setTimeout(() => {
              if (!isActive) return;
              setCadenceBeat('Up / Exhale');
              playBeep(660, 0.12);

              timeout = setTimeout(() => {
                if (isActive) runCadence();
              }, upMs);
            }, holdMs);
          } else {
            setCadenceBeat('Up / Exhale');
            playBeep(660, 0.12);

            timeout = setTimeout(() => {
              if (isActive) runCadence();
            }, upMs);
          }
        }, downMs);
      };

      runCadence();
    }
    return () => {
      isActive = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [isMetronomeActive, exercise.cadence, playBeep]);

  const handleLogExercise = () => {
    playBeep(880, 0.3);
    onCompleteExercise(exercise, repsDone || exercise.targetReps, exercise.isTimed ? (exercise.targetSeconds || 30) - secondsRemaining : undefined);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb / Back Button */}
      {onBack && (
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#13131c] hover:bg-[#1c1c28] border border-[#262638] text-xs font-mono text-[#ccc] hover:text-white transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#c5a059] group-hover:-translate-x-1 transition-transform" />
            <span>← Back to {categoryDef.shortLabel}</span>
          </button>

          <div className="text-xs font-mono text-[#777] hidden sm:block">
            <span>Categories</span> &gt; <span className="text-[#aaa]">{categoryDef.shortLabel}</span> &gt;{' '}
            <span className="text-white font-semibold">{exercise.name}</span>
          </div>
        </div>
      )}

      {/* Direct Category Switcher */}
      {onSelectCategory && (
        <CategoryQuickNav
          activeCategory={exercise.category}
          onSelectCategory={onSelectCategory}
          variant="compact"
        />
      )}

      {/* 1. Header with Demographics, Title & Meta Badges */}
      <div className="bg-[#121216] border border-[#22222a] p-4 sm:p-6 rounded-md shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-xs text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ backgroundColor: `${categoryDef.color}20`, color: categoryDef.color, borderColor: `${categoryDef.color}60` }}
            >
              {exercise.category === 'kids' && <Smile className="w-3.5 h-3.5" />}
              {exercise.category === 'seniors' && <Shield className="w-3.5 h-3.5" />}
              {exercise.category === 'general_health' && <Sparkles className="w-3.5 h-3.5" />}
              {categoryDef.label}
            </span>

            <span className="px-2.5 py-1 rounded-xs bg-[#1a1a22] border border-[#333] text-xs font-mono text-[#aaa]">
              {exercise.difficulty}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#888]">
            <div className="flex items-center gap-1 text-[#fbbf24]">
              <Flame className="w-3.5 h-3.5" />
              <span>{exercise.energyBurn}</span>
            </div>
            <div className="flex items-center gap-1 text-[#38bdf8]">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>{exercise.equipment}</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight mb-2">
          {exercise.name}
        </h1>

        <p className="text-sm sm:text-base text-[#a1a1aa] font-sans leading-relaxed max-w-3xl">
          {exercise.summary}
        </p>

        {/* Muscle pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[#1e1e24] text-xs font-mono">
          <span className="text-[#666]">Primary Muscles:</span>
          {exercise.primaryMuscles.map((muscle) => (
            <span
              key={muscle}
              className="px-2 py-0.5 rounded-xs bg-[#1a1a24] border border-[#2e2e38] text-[#c5a059]"
            >
              {muscle}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Simulation Visualizer (3D WebGL / 2D Motion Video / Split View) */}
      <div className="space-y-2">
        {/* Simulation Selector Bar */}
        <div className="bg-[#12121a] border border-[#222230] p-2 rounded-sm flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[#888] hidden sm:inline">Simulation Engine:</span>
            <div className="flex items-center gap-1 bg-[#0a0a10] border border-[#242436] rounded-xs p-0.5">
              <button
                onClick={() => setSimulationMode('video')}
                className={`px-3 py-1 rounded-xs transition-all flex items-center gap-1.5 ${
                  simulationMode === 'video'
                    ? 'bg-[#c5a059] text-black font-bold shadow-sm'
                    : 'text-[#aaa] hover:text-white'
                }`}
                title="2D Dynamic Vector Biomechanical Video Simulation"
              >
                <span>🎬</span>
                <span>2D Motion Video</span>
              </button>

              <button
                onClick={() => setSimulationMode('3d')}
                className={`px-3 py-1 rounded-xs transition-all flex items-center gap-1.5 ${
                  simulationMode === '3d'
                    ? 'bg-[#c5a059] text-black font-bold shadow-sm'
                    : 'text-[#aaa] hover:text-white'
                }`}
                title="3D WebGL 360° Orbit Simulation"
              >
                <span>🧊</span>
                <span>3D Mannequin</span>
              </button>

              <button
                onClick={() => setSimulationMode('split')}
                className={`px-3 py-1 rounded-xs transition-all hidden md:flex items-center gap-1.5 ${
                  simulationMode === 'split'
                    ? 'bg-[#c5a059] text-black font-bold shadow-sm'
                    : 'text-[#aaa] hover:text-white'
                }`}
                title="Synchronized Side-by-Side View"
              >
                <span>⚡</span>
                <span>Dual Split</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#888]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Biomechanical Kinematics Active</span>
          </div>
        </div>

        {/* Dynamic Render based on selection */}
        {simulationMode === 'video' && (
          <ExerciseMotionVideoCanvas
            exercise={exercise}
            isPlaying={view3DPlaying}
            onTogglePlay={() => setView3DPlaying(!view3DPlaying)}
          />
        )}

        {simulationMode === '3d' && (
          <Exercise3DCanvas
            exercise={exercise}
            isPlaying={view3DPlaying}
            onTogglePlay={() => setView3DPlaying(!view3DPlaying)}
            highlightMuscles={true}
          />
        )}

        {simulationMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ExerciseMotionVideoCanvas
              exercise={exercise}
              isPlaying={view3DPlaying}
              onTogglePlay={() => setView3DPlaying(!view3DPlaying)}
            />
            <Exercise3DCanvas
              exercise={exercise}
              isPlaying={view3DPlaying}
              onTogglePlay={() => setView3DPlaying(!view3DPlaying)}
              highlightMuscles={true}
            />
          </div>
        )}
      </div>

      {/* 3. AI Voice Coach Narration Bar */}
      <AIVoiceCoachBar exercise={exercise} isAudioEnabled={isAudioEnabled} />

      {/* 4. Tab Navigation: Overview, Steps, Benefits, Form Traps, Biomechanics */}
      <div className="border-b border-[#22222a] flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-t-sm border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#c5a059] text-white bg-[#1a1a22]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          <Info className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>What It Is Doing</span>
        </button>

        <button
          onClick={() => setActiveTab('steps')}
          className={`px-3.5 py-2 rounded-t-sm border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'steps'
              ? 'border-[#c5a059] text-white bg-[#1a1a22]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Step-by-Step Instructions ({exercise.steps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('benefits')}
          className={`px-3.5 py-2 rounded-t-sm border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'benefits'
              ? 'border-[#c5a059] text-white bg-[#1a1a22]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#34d399]" />
          <span>Health Benefits & Who It's For</span>
        </button>

        <button
          onClick={() => setActiveTab('mistakes')}
          className={`px-3.5 py-2 rounded-t-sm border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'mistakes'
              ? 'border-[#c5a059] text-white bg-[#1a1a22]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-[#f87171]" />
          <span>Common Mistakes & Fixes</span>
        </button>

        <button
          onClick={() => setActiveTab('biomechanics')}
          className={`px-3.5 py-2 rounded-t-sm border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'biomechanics'
              ? 'border-[#c5a059] text-white bg-[#1a1a22]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-[#fbbf24]" />
          <span>Cadence & Angles</span>
        </button>
      </div>

      {/* 5. Tab Content Views */}
      <div className="bg-[#121216] border border-[#22222a] p-4 sm:p-6 rounded-md shadow-md">
        {/* TAB A: OVERVIEW & PURPOSE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#c5a059]" />
                What This Exercise Is Doing In Your Body
              </h3>
              <p className="text-sm text-[#d1d5db] font-sans leading-relaxed bg-[#181820] p-4 rounded-sm border border-[#272730]">
                {exercise.whatItIsDoing}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 bg-[#16161c] p-4 rounded-sm border border-[#24242e]">
                <h4 className="text-xs font-mono font-bold uppercase text-[#38bdf8] flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5" />
                  Who It Is Designed For
                </h4>
                <p className="text-xs text-[#a1a1aa] font-sans leading-relaxed">
                  {exercise.whoItsFor}
                </p>
              </div>

              <div className="space-y-2 bg-[#16161c] p-4 rounded-sm border border-[#24242e]">
                <h4 className="text-xs font-mono font-bold uppercase text-[#34d399] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Safety & Comfort Standard
                </h4>
                <p className="text-xs text-[#a1a1aa] font-sans leading-relaxed">
                  Move strictly inside a smooth, pain-free range. Never push through sharp joint pinches.
                </p>
              </div>
            </div>

            {/* Quick overview of all steps */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-mono font-bold uppercase text-[#888]">
                Instruction Sequence Preview
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {exercise.steps.map((step, idx) => (
                  <div
                    key={step.stepNumber}
                    onClick={() => {
                      setActiveTab('steps');
                      setActiveStepIdx(idx);
                    }}
                    className="cursor-pointer p-3 bg-[#181820] border border-[#282832] hover:border-[#c5a059] rounded-sm transition-all text-xs font-mono flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#c5a059]/20 text-[#c5a059] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                      {step.stepNumber}
                    </span>
                    <div>
                      <span className="font-semibold text-white block mb-0.5">{step.title}</span>
                      <span className="text-[#888] line-clamp-1">{step.instruction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB B: STEP-BY-STEP INSTRUCTIONS */}
        {activeTab === 'steps' && (
          <div className="space-y-6">
            {/* Step navigation pills */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#222]">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {exercise.steps.map((s, idx) => (
                  <button
                    key={s.stepNumber}
                    onClick={() => setActiveStepIdx(idx)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                      activeStepIdx === idx
                        ? 'bg-[#c5a059] text-black shadow-md'
                        : 'bg-[#181820] text-[#888] hover:text-white border border-[#2a2a34]'
                    }`}
                  >
                    <span>Step {s.stepNumber}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 text-xs font-mono">
                <button
                  onClick={() => setActiveStepIdx(Math.max(0, activeStepIdx - 1))}
                  disabled={activeStepIdx === 0}
                  className="p-1.5 rounded-sm bg-[#181820] border border-[#333] disabled:opacity-30 hover:bg-[#252530] text-[#ccc]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveStepIdx(Math.min(exercise.steps.length - 1, activeStepIdx + 1))}
                  disabled={activeStepIdx === exercise.steps.length - 1}
                  className="p-1.5 rounded-sm bg-[#181820] border border-[#333] disabled:opacity-30 hover:bg-[#252530] text-[#ccc]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active Step Card */}
            {exercise.steps[activeStepIdx] && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#c5a059] text-black font-mono font-bold flex items-center justify-center text-sm shadow-md">
                    {exercise.steps[activeStepIdx].stepNumber}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white">
                    {exercise.steps[activeStepIdx].title}
                  </h3>
                </div>

                <div className="p-4 bg-[#181822] rounded-sm border border-[#2e2e3a] text-sm text-[#e5e7eb] font-sans leading-relaxed">
                  {exercise.steps[activeStepIdx].instruction}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {/* Coaching Tips */}
                  <div className="p-3.5 bg-[#141820] rounded-sm border border-[#38bdf8]/30 space-y-2">
                    <div className="text-xs font-mono font-bold text-[#38bdf8] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Pro Coaching Tips
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#bae6fd] font-mono">
                      {exercise.steps[activeStepIdx].tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#38bdf8]">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Safety Check */}
                  <div className="p-3.5 bg-[#1f1618] rounded-sm border border-red-500/30 space-y-2">
                    <div className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Safety Checkpoint
                    </div>
                    <p className="text-xs text-red-200 font-mono leading-relaxed">
                      {exercise.steps[activeStepIdx].safetyCheck}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB C: BENEFITS & VALUE */}
        {activeTab === 'benefits' && (
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#34d399]" />
              Proven Health & Fitness Benefits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {exercise.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#161b18] border border-[#34d399]/30 rounded-sm text-xs font-mono space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-[#34d399] font-bold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Benefit {idx + 1}</span>
                  </div>
                  <p className="text-[#d1fae5] leading-relaxed font-sans">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB D: COMMON MISTAKES & TRAPS */}
        {activeTab === 'mistakes' && (
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#f87171]" />
              Common Form Mistakes & Quick Corrections
            </h3>

            <div className="space-y-3 pt-2">
              {exercise.commonMistakes.map((mistake, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#181416] border border-[#4a2428] rounded-sm space-y-2 text-xs font-mono"
                >
                  <div className="flex items-start gap-2 text-red-400">
                    <span className="font-bold uppercase px-1.5 py-0.5 rounded-xs bg-red-950/60 border border-red-800">
                      Trap
                    </span>
                    <span className="font-semibold text-white">{mistake.trap}</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#34d399] pl-2 border-l-2 border-[#34d399]/40 mt-1">
                    <span className="font-bold uppercase px-1.5 py-0.5 rounded-xs bg-emerald-950/60 border border-emerald-800">
                      Fix
                    </span>
                    <span className="text-[#a7f3d0] font-sans">{mistake.fix}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB E: BIOMECHANICS & CADENCE */}
        {activeTab === 'biomechanics' && (
          <div className="space-y-4">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#fbbf24]" />
              Biomechanical Vector & Tempo Protocol
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs font-mono">
              <div className="p-4 bg-[#181820] border border-[#2a2a36] rounded-sm space-y-2">
                <span className="text-[#888]">Calculated Joint Angle Vector:</span>
                <div className="text-base font-bold text-[#c5a059]">{exercise.biomechanicsAngle}</div>
                <p className="text-[#aaa] text-[11px] leading-relaxed">
                  Engineered to maximize torque along target muscular fibers while preserving joint cartilage.
                </p>
              </div>

              <div className="p-4 bg-[#181820] border border-[#2a2a36] rounded-sm space-y-2">
                <span className="text-[#888]">Cadence Tempo Timing:</span>
                <div className="flex items-center gap-3 text-white font-bold">
                  <span>Down: {exercise.cadence.down}s</span>
                  <span>Hold: {exercise.cadence.hold}s</span>
                  <span>Up: {exercise.cadence.up}s</span>
                </div>
                <p className="text-[#aaa] text-[11px] leading-relaxed">
                  Controls time-under-tension for optimal neuromuscular firing.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Active Interactive Practice & Logging Console */}
      <div className="bg-[#111116] border border-[#22222a] p-4 sm:p-5 rounded-md shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Reps / Timer Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {exercise.isTimed ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-sm bg-[#1a1a24] border border-[#333] flex flex-col items-center justify-center text-center">
                <span className="text-lg font-mono font-bold text-white">{secondsRemaining}</span>
                <span className="text-[9px] font-mono text-[#888]">SEC</span>
              </div>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-3.5 py-2 rounded-sm font-mono font-semibold text-xs transition-all flex items-center gap-1.5 ${
                  isTimerRunning
                    ? 'bg-red-500/20 border border-red-500 text-red-300'
                    : 'bg-[#c5a059] text-black hover:bg-[#d8b56f]'
                }`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTimerRunning ? 'Pause Timer' : 'Start Timer'}</span>
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setSecondsRemaining(exercise.targetSeconds || 30);
                }}
                className="p-2 rounded-sm bg-[#181820] border border-[#333] text-[#aaa] hover:text-white"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#181820] border border-[#333] px-3 py-1.5 rounded-sm font-mono text-xs">
                <span className="text-[#888]">Reps Completed:</span>
                <span className="text-white font-bold text-sm">{repsDone}</span>
                <span className="text-[#666]">/ {exercise.targetReps}</span>
              </div>
              <button
                onClick={() => {
                  setRepsDone((prev) => prev + 1);
                  playBeep(660, 0.08);
                }}
                className="px-3 py-1.5 bg-[#1c1c28] border border-[#3a3a48] text-white hover:bg-[#282838] rounded-sm text-xs font-mono font-semibold transition-all"
              >
                +1 Rep
              </button>
              <button
                onClick={() => setRepsDone(0)}
                className="p-1.5 rounded-sm bg-[#181820] border border-[#333] text-[#888] hover:text-white"
                title="Reset reps"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Cadence Metronome Switch */}
          <button
            onClick={() => setIsMetronomeActive(!isMetronomeActive)}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5 transition-all ${
              isMetronomeActive
                ? 'bg-[#c5a059]/20 border border-[#c5a059] text-[#c5a059] font-bold'
                : 'bg-[#181820] border border-[#2e2e38] text-[#888] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Cadence Pacer: {isMetronomeActive ? cadenceBeat : 'Off'}</span>
          </button>
        </div>

        {/* Right: Log & Complete Button */}
        <button
          onClick={handleLogExercise}
          className={`px-5 py-2.5 rounded-sm font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer ${
            isCompletedToday
              ? 'bg-emerald-900/60 border border-emerald-500/80 text-emerald-200'
              : 'bg-[#c5a059] hover:bg-[#d8b56f] text-black'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isCompletedToday ? 'Completed Today (Log Again)' : 'Log Exercise Done'}</span>
        </button>
      </div>

      {/* 8. RECOMMENDED RELATED EXERCISES MODULE */}
      <div className="space-y-6 pt-6 border-t border-[#222232]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <h2 className="text-lg font-serif font-bold text-white">
                Recommended Related Exercises
              </h2>
            </div>
            <p className="text-xs text-[#888] font-mono mt-0.5">
              Personalized next movements curated for <span className="text-[#c5a059]">{categoryDef.label}</span> & muscle synergies
            </p>
          </div>

          {onSelectCategory && (
            <button
              onClick={() => onSelectCategory(exercise.category)}
              className="text-xs font-mono text-[#c5a059] hover:text-[#e0c07d] flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View all {categoryDef.shortLabel} movements</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Section A: More in this Category */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#aaa]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryDef.color }} />
              <span>More in {categoryDef.label}</span>
            </span>
            <span className="text-[11px] text-[#666]">Instant 3D & 2D switch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {EXERCISE_CATALOG.filter(
              (ex) => ex.category === exercise.category && ex.id !== exercise.id
            )
              .slice(0, 4)
              .map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => {
                    if (onSelectExercise) {
                      onSelectExercise(rec);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="group bg-[#111118] border border-[#242436] hover:border-[#c5a059] rounded-lg p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded-xs bg-[#1a1a28] text-[#888] border border-[#2a2a3e]">
                        {rec.difficulty}
                      </span>
                      <span className="text-[#fbbf24] flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        {rec.energyBurn}
                      </span>
                    </div>

                    <h3 className="text-sm font-serif font-bold text-white group-hover:text-[#c5a059] transition-colors line-clamp-1">
                      {rec.name}
                    </h3>

                    <p className="text-xs text-[#888] font-sans line-clamp-2 leading-relaxed">
                      {rec.whatItIsDoing || rec.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-1 text-[9px] font-mono text-[#777] pt-1">
                      {rec.primaryMuscles.slice(0, 2).map((m) => (
                        <span key={m} className="px-1 py-0.5 bg-[#161622] rounded-xs text-[#aaa]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1c1c28] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#38bdf8] flex items-center gap-1 text-[10px]">
                      <Box className="w-3 h-3" />
                      3D & 2D
                    </span>
                    <span className="text-[#c5a059] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
                      <span>Practice</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section B: Synergistic Cross-Category Recommendations */}
        {(() => {
          const crossRecs = EXERCISE_CATALOG.filter(
            (ex) =>
              ex.category !== exercise.category &&
              ex.id !== exercise.id &&
              ex.primaryMuscles.some((m) => exercise.primaryMuscles.includes(m))
          ).slice(0, 3);

          if (crossRecs.length === 0) return null;

          return (
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#aaa]">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Cross-Training Synergies (Targeting Similar Muscles)</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {crossRecs.map((rec) => {
                  const recCatDef = CATEGORY_DEFINITIONS[rec.category] || CATEGORY_DEFINITIONS.general_health;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => {
                        if (onSelectExercise) {
                          onSelectExercise(rec);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="group bg-[#111118] border border-[#242436] hover:border-[#38bdf8] rounded-lg p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span
                            className="px-1.5 py-0.5 rounded-xs font-semibold uppercase"
                            style={{
                              backgroundColor: `${recCatDef.color}20`,
                              color: recCatDef.color,
                              border: `1px solid ${recCatDef.color}40`,
                            }}
                          >
                            {recCatDef.shortLabel}
                          </span>
                          <span className="text-[#888]">{rec.difficulty}</span>
                        </div>

                        <h3 className="text-sm font-serif font-bold text-white group-hover:text-[#38bdf8] transition-colors line-clamp-1">
                          {rec.name}
                        </h3>

                        <p className="text-xs text-[#888] font-sans line-clamp-2 leading-relaxed">
                          {rec.summary}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#1c1c28] flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#888] text-[10px]">
                          Target: {rec.primaryMuscles[0]}
                        </span>
                        <span className="text-[#38bdf8] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
                          <span>Switch</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Direct category nav strip */}
        {onSelectCategory && (
          <div className="pt-4">
            <CategoryQuickNav
              activeCategory={exercise.category}
              onSelectCategory={onSelectCategory}
              title="Explore Other Categories"
              variant="compact"
            />
          </div>
        )}
      </div>
    </div>
  );
};
