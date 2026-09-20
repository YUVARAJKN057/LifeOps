import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Flame,
  Dumbbell,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  Smile,
  HeartHandshake,
  Shield,
  Bot,
} from 'lucide-react';
import {
  WorkoutCircuit,
  WORKOUT_CIRCUITS,
  EXERCISE_CATALOG,
  ExerciseGuide,
  CATEGORY_DEFINITIONS,
} from '../../data/exerciseCatalogData';
import { Exercise3DCanvas } from './Exercise3DCanvas';
import { AIVoiceCoachBar } from './AIVoiceCoachBar';

interface WorkoutCircuitsViewProps {
  isAudioEnabled: boolean;
  onCircuitFinished: (circuit: WorkoutCircuit) => void;
  onSelectSingleExercise: (exercise: ExerciseGuide) => void;
}

export const WorkoutCircuitsView: React.FC<WorkoutCircuitsViewProps> = ({
  isAudioEnabled,
  onCircuitFinished,
  onSelectSingleExercise,
}) => {
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>(WORKOUT_CIRCUITS[0].id);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentExIndex, setCurrentExIndex] = useState<number>(0);
  const [intervalState, setIntervalState] = useState<'work' | 'rest' | 'finished'>('work');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState<number>(0);

  const timerRef = useRef<any>(null);

  // Active Circuit
  const activeCircuit = useMemo(() => {
    return WORKOUT_CIRCUITS.find((c) => c.id === selectedCircuitId) || WORKOUT_CIRCUITS[0];
  }, [selectedCircuitId]);

  // Current Exercise in circuit
  const currentExercise = useMemo(() => {
    const exId = activeCircuit.exerciseIds[currentExIndex] || activeCircuit.exerciseIds[0];
    return EXERCISE_CATALOG.find((e) => e.id === exId) || EXERCISE_CATALOG[0];
  }, [activeCircuit, currentExIndex]);

  // Next Exercise in circuit
  const nextExercise = useMemo(() => {
    if (currentExIndex < activeCircuit.exerciseIds.length - 1) {
      const nextId = activeCircuit.exerciseIds[currentExIndex + 1];
      return EXERCISE_CATALOG.find((e) => e.id === nextId);
    }
    return null;
  }, [activeCircuit, currentExIndex]);

  // Audio Beep
  const playBeep = useCallback(
    (freq = 600, duration = 0.15) => {
      if (!isAudioEnabled) return;
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch {}
    },
    [isAudioEnabled]
  );

  // Switch Circuit
  const handleSelectCircuit = (circuit: WorkoutCircuit) => {
    setSelectedCircuitId(circuit.id);
    setIsRunning(false);
    setCurrentExIndex(0);
    setIntervalState('work');
    const firstEx = EXERCISE_CATALOG.find((e) => e.id === circuit.exerciseIds[0]);
    setSecondsRemaining(firstEx?.targetSeconds || 45);
    setTotalSecondsElapsed(0);
  };

  // Start Routine
  const startWorkout = () => {
    setIsRunning(true);
    setIntervalState('work');
    playBeep(750, 0.2);
  };

  // Skip Exercise
  const skipExercise = () => {
    if (currentExIndex < activeCircuit.exerciseIds.length - 1) {
      setCurrentExIndex((idx) => idx + 1);
      setIntervalState('work');
      const nextEx = EXERCISE_CATALOG.find((e) => e.id === activeCircuit.exerciseIds[currentExIndex + 1]);
      setSecondsRemaining(nextEx?.targetSeconds || 45);
      playBeep(650, 0.15);
    } else {
      setIntervalState('finished');
      setIsRunning(false);
      onCircuitFinished(activeCircuit);
    }
  };

  // Reset Routine
  const resetRoutine = () => {
    setIsRunning(false);
    setCurrentExIndex(0);
    setIntervalState('work');
    const firstEx = EXERCISE_CATALOG.find((e) => e.id === activeCircuit.exerciseIds[0]);
    setSecondsRemaining(firstEx?.targetSeconds || 45);
    setTotalSecondsElapsed(0);
  };

  // Main Circuit Interval Loop
  useEffect(() => {
    if (!isRunning || intervalState === 'finished') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTotalSecondsElapsed((t) => t + 1);

      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Transition
          if (intervalState === 'work') {
            playBeep(880, 0.25);
            if (currentExIndex < activeCircuit.exerciseIds.length - 1) {
              setIntervalState('rest');
              return activeCircuit.restSeconds;
            } else {
              setIntervalState('finished');
              setIsRunning(false);
              onCircuitFinished(activeCircuit);
              return 0;
            }
          } else if (intervalState === 'rest') {
            playBeep(700, 0.2);
            setCurrentExIndex((idx) => idx + 1);
            setIntervalState('work');
            const nextExId = activeCircuit.exerciseIds[currentExIndex + 1];
            const nextExObj = EXERCISE_CATALOG.find((e) => e.id === nextExId);
            return nextExObj?.targetSeconds || 45;
          }
        }

        if (prev <= 4 && prev > 1) {
          playBeep(440, 0.08);
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, intervalState, currentExIndex, activeCircuit, playBeep, onCircuitFinished]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121217] border border-[#22222a] p-4 sm:p-5 rounded-md shadow-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-serif font-bold text-white tracking-tight">
            ⏱️ Guided Multi-Exercise Workout Circuits
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-xs bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40">
            Automated Timer
          </span>
        </div>
        <p className="text-xs text-[#a1a1aa] font-sans leading-relaxed">
          Follow-along guided circuits for all demographics — kids, expectant mothers, seniors, and daily vitality.
        </p>
      </div>

      {/* Circuit Selector Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {WORKOUT_CIRCUITS.map((circuit) => {
          const isSelected = circuit.id === activeCircuit.id;
          return (
            <button
              key={circuit.id}
              onClick={() => handleSelectCircuit(circuit)}
              className={`p-3.5 rounded-md text-left transition-all border flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#181824] border-[#c5a059] ring-1 ring-[#c5a059]/40 shadow-lg'
                  : 'bg-[#101015] border-[#22222a] hover:border-[#383848]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded-xs bg-[#22222e] text-[#c5a059] font-bold">
                    {circuit.audienceTag || circuit.category}
                  </span>
                  <span className="text-[#888]">{circuit.durationMinutes} Min</span>
                </div>
                <h4 className="font-serif font-bold text-sm text-white leading-tight">
                  {circuit.name}
                </h4>
                <p className="text-xs text-[#888] font-sans line-clamp-2">
                  {circuit.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1e1e28] flex items-center justify-between text-[10px] font-mono text-[#666]">
                <span>{circuit.exerciseIds.length} Exercises</span>
                <span className="text-[#fbbf24]">{circuit.estimatedCalories}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Active Circuit Console */}
      <div className="bg-[#101015] border border-[#242432] rounded-md p-4 sm:p-6 shadow-xl space-y-6">
        {/* Progress Bar & Sequence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#888]">
            <span className="text-white font-semibold">
              Exercise {currentExIndex + 1} of {activeCircuit.exerciseIds.length}: {currentExercise.name}
            </span>
            <span className="text-[#c5a059] font-bold">
              Total Elapsed: {Math.floor(totalSecondsElapsed / 60)}m {totalSecondsElapsed % 60}s
            </span>
          </div>

          <div className="w-full bg-[#181822] h-2 rounded-full overflow-hidden flex">
            {activeCircuit.exerciseIds.map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 transition-all border-r border-[#101015] ${
                  i < currentExIndex
                    ? 'bg-emerald-500'
                    : i === currentExIndex
                    ? 'bg-[#c5a059] animate-pulse'
                    : 'bg-[#252532]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 3D Visualizer & AI Coach for Current Exercise */}
        <div className="space-y-3">
          <Exercise3DCanvas exercise={currentExercise} isPlaying={isRunning} />
          <AIVoiceCoachBar exercise={currentExercise} isAudioEnabled={isAudioEnabled} />
        </div>

        {/* Interval Timer Big Display & Controls */}
        <div className="bg-[#15151e] border border-[#2a2a38] p-4 sm:p-6 rounded-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-20 h-20 rounded-md flex flex-col items-center justify-center border font-mono ${
                intervalState === 'work'
                  ? 'bg-amber-950/30 border-[#c5a059] text-[#c5a059]'
                  : intervalState === 'rest'
                  ? 'bg-blue-950/30 border-blue-500 text-blue-300'
                  : 'bg-emerald-950/30 border-emerald-500 text-emerald-300'
              }`}
            >
              <span className="text-3xl font-bold">{secondsRemaining}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {intervalState === 'work' ? 'WORK' : intervalState === 'rest' ? 'REST' : 'DONE'}
              </span>
            </div>

            <div>
              <div className="text-xs font-mono text-[#888] uppercase tracking-wider">
                {intervalState === 'work' ? 'Current Movement' : 'Prepare for next'}
              </div>
              <h3 className="text-lg font-serif font-bold text-white">
                {intervalState === 'work' ? currentExercise.name : `Next: ${nextExercise?.name || 'Complete'}`}
              </h3>
              <p className="text-xs text-[#a1a1aa] font-sans mt-0.5 max-w-md">
                {currentExercise.whatItIsDoing}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2.5">
            {!isRunning ? (
              <button
                onClick={startWorkout}
                className="px-6 py-3 rounded-sm bg-[#c5a059] text-black font-bold font-mono text-xs uppercase tracking-wider hover:bg-[#d8b56f] transition-all flex items-center gap-2 shadow-lg active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Circuit</span>
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(false)}
                className="px-5 py-3 rounded-sm bg-[#242430] border border-[#444] text-white font-mono text-xs font-semibold hover:bg-[#333] transition-all flex items-center gap-2"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            )}

            <button
              onClick={skipExercise}
              className="p-3 rounded-sm bg-[#1c1c28] border border-[#333] text-[#aaa] hover:text-white transition-all"
              title="Skip to next exercise"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={resetRoutine}
              className="p-3 rounded-sm bg-[#1c1c28] border border-[#333] text-[#aaa] hover:text-white transition-all"
              title="Reset circuit timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
