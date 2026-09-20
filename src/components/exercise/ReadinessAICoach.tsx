import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  Activity,
  Heart,
  Moon,
  Zap,
  Sliders,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Volume2,
  VolumeX,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Watch,
  X,
  Bot,
  Layers,
  Scale,
  Brain,
  Info,
  Dumbbell,
} from 'lucide-react';
import {
  ReadinessAssessment,
  DEFAULT_READINESS,
  WEARABLE_PRESETS,
  WearablePreset,
  generateReadinessAssessment,
  calculateReadinessScore,
} from '../../data/readinessData';
import { ExerciseGuide, EXERCISE_CATALOG, DemographicCategory } from '../../data/exerciseCatalogData';

interface ReadinessAICoachProps {
  onSelectExercise: (exercise: ExerciseGuide) => void;
  onSelectCategory: (category: DemographicCategory) => void;
  onNavigateCircuits: () => void;
  isAudioEnabled?: boolean;
}

export const ReadinessAICoach: React.FC<ReadinessAICoachProps> = ({
  onSelectExercise,
  onSelectCategory,
  onNavigateCircuits,
  isAudioEnabled = true,
}) => {
  const [assessment, setAssessment] = useState<ReadinessAssessment>(() => {
    try {
      const saved = localStorage.getItem('kinetic_readiness_assessment');
      return saved ? JSON.parse(saved) : DEFAULT_READINESS;
    } catch {
      return DEFAULT_READINESS;
    }
  });

  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Check-In Form State
  const [formSleep, setFormSleep] = useState<number>(assessment.sleepHours);
  const [formSleepQuality, setFormSleepQuality] = useState<'deep' | 'restful' | 'fair' | 'poor'>(assessment.sleepQuality);
  const [formSoreness, setFormSoreness] = useState<number>(assessment.sorenessLevel);
  const [formSorenessArea, setFormSorenessArea] = useState<string>(assessment.sorenessArea);
  const [formStress, setFormStress] = useState<number>(assessment.stressLevel);
  const [formEnergy, setFormEnergy] = useState<number>(assessment.energyLevel);
  const [formHrv, setFormHrv] = useState<number>(assessment.hrvMs);
  const [formRestingHr, setFormRestingHr] = useState<number>(assessment.restingHr);
  const [activeWearable, setActiveWearable] = useState<string>(assessment.source);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kinetic_readiness_assessment', JSON.stringify(assessment));
    } catch {}
  }, [assessment]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Prescribed exercises objects
  const prescribedExercises: ExerciseGuide[] = assessment.prescribedExerciseIds
    .map((id) => EXERCISE_CATALOG.find((e) => e.id === id))
    .filter(Boolean) as ExerciseGuide[];

  // Speak AI Coach rationale
  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(assessment.aiCoachRationale);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick warm natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Apply a Wearable Preset
  const handleApplyPreset = (preset: WearablePreset) => {
    setFormSleep(preset.data.sleepHours);
    setFormSleepQuality(preset.data.sleepQuality);
    setFormSoreness(preset.data.sorenessLevel);
    setFormSorenessArea(preset.data.sorenessArea);
    setFormStress(preset.data.stressLevel);
    setFormEnergy(preset.data.energyLevel);
    setFormHrv(preset.data.hrvMs);
    setFormRestingHr(preset.data.restingHr);
    setActiveWearable(preset.data.source);
  };

  // Submit and Calculate Assessment
  const handleSaveCheckIn = async () => {
    setIsAiLoading(true);

    const newAssessment = generateReadinessAssessment({
      sleepHours: Number(formSleep),
      sleepQuality: formSleepQuality,
      sorenessLevel: Number(formSoreness),
      sorenessArea: formSorenessArea,
      stressLevel: Number(formStress),
      energyLevel: Number(formEnergy),
      hrvMs: Number(formHrv),
      restingHr: Number(formRestingHr),
      source: activeWearable as any,
    });

    setAssessment(newAssessment);
    setIsAiLoading(false);
    setIsCheckInOpen(false);

    // Cancel existing voice
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Score Gauge Math
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (assessment.score / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* 1. MAIN HERO READINESS COACH CARD */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-b from-[#151522] via-[#101018] to-[#0c0c12] border border-[#28283e] shadow-2xl p-5 sm:p-6 lg:p-7">
        {/* Top Header Tag */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <Brain className="w-4 h-4 text-[#c5a059]" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#c5a059] font-bold flex items-center gap-1.5">
                <span>The "Readiness" AI Coach</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <p className="text-[11px] font-mono text-[#888]">
                Hyper-Personalized Dynamic Daily Prescription
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCheckInOpen(true)}
              className="px-3 py-1.5 rounded-md bg-[#1c1c2b] hover:bg-[#252538] border border-[#33334a] text-xs font-mono text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Watch className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>2-Min Check-In / Sync Wearables</span>
            </button>
          </div>
        </div>

        {/* Core Readiness Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Dynamic 0-100 Score Gauge */}
          <div className="lg:col-span-4 flex flex-col items-center sm:flex-row lg:flex-col justify-center gap-5 p-4 rounded-lg bg-[#0e0e16] border border-[#222232] shadow-inner">
            <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#1f1f2e]"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Dynamic Score Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke={assessment.stateColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inside Score Value */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-serif font-bold text-white tracking-tight leading-none">
                  {assessment.score}
                </span>
                <span className="text-[10px] font-mono uppercase text-[#888] mt-0.5">
                  / 100 Score
                </span>
              </div>
            </div>

            {/* Score State & Telemetry Cues */}
            <div className="text-center sm:text-left lg:text-center space-y-1.5">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: `${assessment.stateColor}20`,
                  color: assessment.stateColor,
                  border: `1px solid ${assessment.stateColor}50`,
                }}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{assessment.stateLabel}</span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start lg:justify-center gap-2 text-[10px] font-mono text-[#aaa] pt-1">
                <span className="flex items-center gap-1 bg-[#141420] px-2 py-0.5 rounded-xs border border-[#242436]">
                  <Moon className="w-3 h-3 text-[#38bdf8]" />
                  <span>{assessment.sleepHours}h Sleep ({assessment.sleepQuality})</span>
                </span>
                <span className="flex items-center gap-1 bg-[#141420] px-2 py-0.5 rounded-xs border border-[#242436]">
                  <Heart className="w-3 h-3 text-rose-400" />
                  <span>HRV: {assessment.hrvMs}ms</span>
                </span>
              </div>

              <p className="text-[10px] font-mono text-[#666]">
                Source: {assessment.sourceLabel}
              </p>
            </div>
          </div>

          {/* Right: The Standout Factor - Automated Workout Adaptation Card */}
          <div className="lg:col-span-8 space-y-4">
            {/* The AI Adaptive Workout Adjustment Banner */}
            <div
              className={`p-4 rounded-lg border transition-all ${
                assessment.adaptationActive
                  ? 'bg-[#1b1510] border-amber-500/40'
                  : 'bg-[#0f191b] border-emerald-500/40'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-xs flex items-center gap-1 ${
                      assessment.adaptationActive
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    {assessment.adaptationActive
                      ? '⚡ AI Automatic Workout Adaptation Active'
                      : '⚡ Peak High-Power Prescription'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-[#888]">
                  <span>Intensity: </span>
                  <strong className="text-white">{assessment.volumeScaling.intensityPercent}%</strong>
                  <span>•</span>
                  <span>{assessment.volumeScaling.setsAdjustment}</span>
                </div>
              </div>

              {/* Workout Auto-Substitution comparison */}
              <div className="space-y-1.5">
                {assessment.adaptationActive && (
                  <div className="text-xs font-mono text-[#777] line-through flex items-center gap-1.5">
                    <span>Original Heavy Routine:</span>
                    <span>{assessment.originalPlannedWorkout}</span>
                  </div>
                )}

                <h3 className="text-lg sm:text-xl font-serif font-bold text-white flex items-center gap-2">
                  <span>{assessment.adaptedWorkoutTitle}</span>
                  {assessment.adaptationActive && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded-xs bg-amber-950 text-amber-300 border border-amber-800">
                      Auto-Swapped
                    </span>
                  )}
                </h3>

                <p className="text-xs text-[#a1a1aa] font-sans">
                  {assessment.adaptedWorkoutSubtitle}
                </p>
              </div>

              {/* AI Coach Spoken Rationale */}
              <div className="mt-3.5 pt-3 border-t border-[#262638] bg-[#0c0c14]/70 p-3 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Bot className="w-4 h-4 text-[#c5a059] flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-mono text-[#d1d5db] italic leading-relaxed">
                    "{assessment.aiCoachRationale}"
                  </p>
                </div>

                <button
                  onClick={handleToggleVoice}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 flex-shrink-0 transition-all ${
                    isSpeaking
                      ? 'bg-rose-900/60 text-rose-300 border border-rose-700 animate-pulse'
                      : 'bg-[#181826] hover:bg-[#232336] text-[#ccc] hover:text-white border border-[#2e2e42]'
                  }`}
                  title="Listen to AI Coach voice explanation"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#c5a059]" />}
                  <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
                </button>
              </div>
            </div>

            {/* Prescribed Movements Strip & Quick 1-Click Launch */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[11px] font-mono text-[#888] whitespace-nowrap">
                  Today's Moves:
                </span>
                {prescribedExercises.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => onSelectExercise(ex)}
                    className="px-2.5 py-1.5 rounded-md bg-[#13131c] hover:bg-[#1f1f2e] border border-[#252536] hover:border-[#c5a059] text-xs font-mono text-white flex items-center gap-1.5 whitespace-nowrap transition-all group"
                  >
                    <span>{ex.name}</span>
                    <ChevronRight className="w-3 h-3 text-[#c5a059] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>

              {/* 1-Click Launch Button */}
              <button
                onClick={() => {
                  if (prescribedExercises.length > 0) {
                    onSelectExercise(prescribedExercises[0]);
                  } else {
                    onNavigateCircuits();
                  }
                }}
                className="px-5 py-2.5 rounded-md bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg flex-shrink-0 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Launch Today's AI Session</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE 2-MINUTE DAILY CHECK-IN & WEARABLES MODAL */}
      {isCheckInOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0f0f17] border border-[#28283c] rounded-xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#20202e] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
                  <Watch className="w-4 h-4 text-[#c5a059]" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-white">
                    Daily Biometric Readiness Check-In
                  </h3>
                  <p className="text-xs font-mono text-[#888]">
                    Sync your wearable or answer 4 quick questions to auto-scale today's workout.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCheckInOpen(false)}
                className="w-8 h-8 rounded-md bg-[#161622] hover:bg-[#202030] text-[#888] hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* One-Click Wearable & Simulator Presets */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#aaa] font-bold flex items-center gap-1">
                <span>1-Click Wearable Sync & Simulator Presets:</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {WEARABLE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 rounded-md bg-[#141420] hover:bg-[#1e1e30] border border-[#242436] hover:border-[#c5a059] text-left transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-base mb-1">
                        <span>{preset.icon}</span>
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-xs bg-[#1f1f2e] text-[#c5a059] group-hover:bg-[#c5a059] group-hover:text-black transition-colors">
                          {preset.badge}
                        </span>
                      </div>
                      <h4 className="text-xs font-serif font-bold text-white group-hover:text-[#c5a059] transition-colors">
                        {preset.name}
                      </h4>
                      <p className="text-[10px] text-[#777] font-sans line-clamp-2 mt-0.5">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders & Check-In Inputs */}
            <div className="space-y-4 pt-2 border-t border-[#1c1c28]">
              {/* Sleep Hours & Quality */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#ccc] flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-[#38bdf8]" />
                    Sleep Duration: <strong className="text-white">{formSleep} Hours</strong>
                  </span>
                  <div className="flex items-center gap-1">
                    {(['deep', 'restful', 'fair', 'poor'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setFormSleepQuality(q)}
                        className={`px-2 py-0.5 rounded-xs text-[10px] uppercase font-mono transition-all ${
                          formSleepQuality === q
                            ? 'bg-[#38bdf8] text-black font-bold'
                            : 'bg-[#181824] text-[#888] hover:text-white'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="10.0"
                  step="0.2"
                  value={formSleep}
                  onChange={(e) => setFormSleep(parseFloat(e.target.value))}
                  className="w-full accent-[#38bdf8] bg-[#1a1a28] h-1.5 rounded-lg cursor-pointer"
                />
              </div>

              {/* Muscle Soreness & Location */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#ccc] flex items-center gap-1.5">
                    <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                    Muscle Soreness (DOMS): <strong className="text-white">{formSoreness}/10</strong>
                  </span>
                  <span className="text-[11px] text-[#888]">
                    {formSoreness <= 2 ? 'Fresh' : formSoreness <= 5 ? 'Moderate' : 'Heavy Tightness'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={formSoreness}
                  onChange={(e) => setFormSoreness(parseInt(e.target.value))}
                  className="w-full accent-amber-400 bg-[#1a1a28] h-1.5 rounded-lg cursor-pointer"
                />
                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono">
                  <span className="text-[#777] whitespace-nowrap">Tight Area:</span>
                  <select
                    value={formSorenessArea}
                    onChange={(e) => setFormSorenessArea(e.target.value)}
                    className="flex-1 bg-[#141420] border border-[#28283c] rounded-md px-2.5 py-1 text-xs text-white"
                  >
                    <option value="None (Fully fresh)">None (Fully fresh)</option>
                    <option value="Lower back & tight neck">Lower back & tight neck (Auto-Swaps to Pelvic/Spine Flow)</option>
                    <option value="Tight Hamstrings & Glutes">Tight Hamstrings & Glutes</option>
                    <option value="Shoulders & Upper Chest">Shoulders & Upper Chest</option>
                    <option value="Calves & Ankles">Calves & Ankles</option>
                  </select>
                </div>
              </div>

              {/* Mental Stress & Physical Energy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#ccc]">Stress Level:</span>
                    <strong className="text-white">{formStress}/10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={formStress}
                    onChange={(e) => setFormStress(parseInt(e.target.value))}
                    className="w-full accent-rose-400 bg-[#1a1a28] h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#ccc]">Energy / Vitality:</span>
                    <strong className="text-white">{formEnergy}/10</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={formEnergy}
                    onChange={(e) => setFormEnergy(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 bg-[#1a1a28] h-1.5 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#20202e] font-mono text-xs">
              <button
                onClick={() => setIsCheckInOpen(false)}
                className="px-4 py-2 rounded-md bg-[#161622] hover:bg-[#202030] text-[#888] hover:text-white transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveCheckIn}
                disabled={isAiLoading}
                className="px-6 py-2 rounded-md bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95"
              >
                {isAiLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Recalculate & Adapt Workout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
