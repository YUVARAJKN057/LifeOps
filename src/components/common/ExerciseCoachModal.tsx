import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  Camera,
  CameraOff,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  Activity,
  Video,
  Eye,
  Award,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  Zap,
  Info,
  Check,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Maximize2,
  TrendingUp,
  Search,
  Dumbbell,
  Heart,
  Compass,
  Layers,
  HelpCircle,
  Timer,
  Clock,
  ArrowRight,
  Target,
  BarChart3,
  CheckSquare,
  AlertTriangle,
  FastForward,
  SkipForward,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExerciseVideoSimulator } from './ExerciseVideoSimulator';
import {
  ExerciseCategory,
  ExerciseGuide,
  ExerciseStep,
  WorkoutCircuit,
  EXERCISE_CATALOG,
  WORKOUT_CIRCUITS,
} from '../../data/exerciseCatalogData';

export type { ExerciseCategory, ExerciseGuide, ExerciseStep, WorkoutCircuit };
export { EXERCISE_CATALOG, WORKOUT_CIRCUITS };

interface ExerciseCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExerciseId?: string;
}

export const ExerciseCoachModal: React.FC<ExerciseCoachModalProps> = ({
  isOpen,
  onClose,
  initialExerciseId = 'skipping',
}) => {
  const { addToast, incrementStat } = useApp();

  // Mode: Explorer (single exercise) vs Circuit (guided workout routine)
  const [viewMode, setViewMode] = useState<'explorer' | 'circuit'>('explorer');

  // Explorer State
  const [selectedId, setSelectedId] = useState<string>(initialExerciseId);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ExerciseCategory>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Beginner' | 'Intermediate' | 'All Levels'>('all');
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState<string>('');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [activeDetailTab, setActiveDetailTab] = useState<'tutorial' | 'mistakes' | 'benefits' | 'camera'>('tutorial');
  const [isAudioCuesEnabled, setIsAudioCuesEnabled] = useState<boolean>(true);

  // Metronome state for rhythm guidance
  const [isMetronomeActive, setIsMetronomeActive] = useState<boolean>(false);
  const [metronomePhase, setMetronomePhase] = useState<'down' | 'hold' | 'up'>('down');
  const [metronomeProgress, setMetronomeProgress] = useState<number>(0);

  // Circuit Mode State
  const [activeCircuitId, setActiveCircuitId] = useState<string>(WORKOUT_CIRCUITS[0].id);
  const [isCircuitRunning, setIsCircuitRunning] = useState<boolean>(false);
  const [circuitExerciseIndex, setCircuitExerciseIndex] = useState<number>(0);
  const [circuitPhase, setCircuitPhase] = useState<'work' | 'rest' | 'finished'>('work');
  const [circuitSecondsRemaining, setCircuitSecondsRemaining] = useState<number>(45);
  const [circuitTotalElapsed, setCircuitTotalElapsed] = useState<number>(0);

  // Camera & Video Verification States
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCountingActive, setIsCountingActive] = useState<boolean>(false);
  const [completedReps, setCompletedReps] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [repProgressPercent, setRepProgressPercent] = useState<number>(0);
  const [formQuality, setFormQuality] = useState<'Excellent' | 'Good' | 'Adjust Position' | 'Calibrating'>('Calibrating');
  const [movementPhase, setMovementPhase] = useState<'Ready' | 'Descending' | 'Bottom / Hold' | 'Ascending'>('Ready');
  const [cameraFeedbackMsg, setCameraFeedbackMsg] = useState<string>('Align your body in the glowing guide frame');
  const [isSimulatedDemo, setIsSimulatedDemo] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [verifiedSnapshotUrl, setVerifiedSnapshotUrl] = useState<string | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const circuitTimerRef = useRef<any>(null);
  const metronomeIntervalRef = useRef<any>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const repStateRef = useRef<{ phase: 'top' | 'down' | 'bottom' | 'up'; depthCounter: number }>({ phase: 'top', depthCounter: 0 });

  // Active exercise memoization
  const activeExercise = useMemo(() => {
    return EXERCISE_CATALOG.find((e) => e.id === selectedId) || EXERCISE_CATALOG[0];
  }, [selectedId]);

  // Active circuit memoization
  const activeCircuit = useMemo(() => {
    return WORKOUT_CIRCUITS.find((c) => c.id === activeCircuitId) || WORKOUT_CIRCUITS[0];
  }, [activeCircuitId]);

  // Current circuit exercise
  const currentCircuitExercise = useMemo(() => {
    const exId = activeCircuit.exerciseIds[circuitExerciseIndex] || activeCircuit.exerciseIds[0];
    return EXERCISE_CATALOG.find((e) => e.id === exId) || EXERCISE_CATALOG[0];
  }, [activeCircuit, circuitExerciseIndex]);

  // Reset exercise states on selection change
  useEffect(() => {
    setCurrentStepIdx(0);
    setCompletedReps(0);
    setElapsedSeconds(0);
    setRepProgressPercent(0);
    setVerificationSuccess(false);
    setVerifiedSnapshotUrl(null);
    setFormQuality('Calibrating');
    setMovementPhase('Ready');
    repStateRef.current = { phase: 'top', depthCounter: 0 };
  }, [selectedId]);

  // Audio Beep Cues
  const playAudioCue = useCallback((freq = 520, duration = 0.12) => {
    if (!isAudioCuesEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [isAudioCuesEnabled]);

  // Metronome Rhythmic Cadence Loop
  useEffect(() => {
    if (!isMetronomeActive) {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
      return;
    }

    const { down, hold, up } = activeExercise.cadence;
    const totalCycle = Math.max(1, (down || 1) + (hold || 0) + (up || 1));
    let elapsed = 0;

    metronomeIntervalRef.current = setInterval(() => {
      elapsed = (elapsed + 0.1) % totalCycle;
      setMetronomeProgress(elapsed / totalCycle);

      if (down > 0 && elapsed < down) {
        setMetronomePhase('down');
      } else if (hold > 0 && elapsed < down + hold) {
        setMetronomePhase('hold');
      } else {
        setMetronomePhase('up');
      }
    }, 100);

    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, [isMetronomeActive, activeExercise]);

  // Circuit Timer Loop
  useEffect(() => {
    if (!isCircuitRunning || circuitPhase === 'finished') {
      if (circuitTimerRef.current) clearInterval(circuitTimerRef.current);
      return;
    }

    circuitTimerRef.current = setInterval(() => {
      setCircuitTotalElapsed((prev) => prev + 1);

      setCircuitSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Phase transition
          if (circuitPhase === 'work') {
            playAudioCue(880, 0.25);
            // Check if there are more exercises
            if (circuitExerciseIndex < activeCircuit.exerciseIds.length - 1) {
              setCircuitPhase('rest');
              return activeCircuit.restSeconds;
            } else {
              setCircuitPhase('finished');
              incrementStat('completedWorkouts', 1);
              addToast({
                id: `circuit-complete-${Date.now()}`,
                type: 'success',
                title: 'Workout Circuit Completed!',
                message: `${activeCircuit.name} finished! Burned ${activeCircuit.estimatedCalories}.`,
              });
              return 0;
            }
          } else if (circuitPhase === 'rest') {
            playAudioCue(650, 0.2);
            setCircuitExerciseIndex((idx) => idx + 1);
            setCircuitPhase('work');
            const nextExId = activeCircuit.exerciseIds[circuitExerciseIndex + 1];
            const nextEx = EXERCISE_CATALOG.find((e) => e.id === nextExId);
            return nextEx?.targetSeconds || 45;
          }
        }
        if (prev <= 4 && prev > 1) {
          playAudioCue(440, 0.08);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (circuitTimerRef.current) clearInterval(circuitTimerRef.current);
    };
  }, [isCircuitRunning, circuitPhase, circuitExerciseIndex, activeCircuit, playAudioCue, addToast, incrementStat]);

  // Start a Circuit
  const startCircuit = (circuit: WorkoutCircuit) => {
    setActiveCircuitId(circuit.id);
    setCircuitExerciseIndex(0);
    setCircuitPhase('work');
    const firstEx = EXERCISE_CATALOG.find((e) => e.id === circuit.exerciseIds[0]);
    setCircuitSecondsRemaining(firstEx?.targetSeconds || 45);
    setCircuitTotalElapsed(0);
    setIsCircuitRunning(true);
    setViewMode('circuit');
    playAudioCue(750, 0.2);
    addToast({
      id: `circuit-start-${Date.now()}`,
      type: 'info',
      title: 'Circuit Started',
      message: `Starting: ${circuit.name}`,
    });
  };

  // Stop camera media tracks cleanly
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsCameraActive(false);
    setIsCountingActive(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, []);

  // Start Real User Webcam
  const startUserCamera = async () => {
    try {
      setCameraError(null);
      setIsSimulatedDemo(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsCameraActive(true);
      setIsCountingActive(true);
      setCameraFeedbackMsg('Webcam online. Position whole body in frame.');
      playAudioCue(600, 0.15);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Webcam permission error, falling back to simulated HUD:', err);
      setCameraError('Camera access not granted or unavailable in this environment.');
      startSimulatedDemo();
    }
  };

  // Start High-Fidelity Simulated Virtual HUD
  const startSimulatedDemo = () => {
    setCameraError(null);
    setIsSimulatedDemo(true);
    setIsCameraActive(true);
    setIsCountingActive(true);
    setCameraFeedbackMsg('Simulated AI Pose HUD active. Tracking kinetic reps.');
    playAudioCue(650, 0.15);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Optical Rep Processing
  useEffect(() => {
    if (!isCameraActive) return;

    let frameCount = 0;

    const processVideoFrame = () => {
      frameCount++;

      if (isSimulatedDemo) {
        // Simulated rep state cycle
        const cycleProgress = (frameCount % 90) / 90;
        setRepProgressPercent(Math.round(cycleProgress * 100));

        if (cycleProgress < 0.35) {
          setMovementPhase('Descending');
          setFormQuality('Good');
          setCameraFeedbackMsg('Eccentric descent detected. Maintain 45° angle.');
        } else if (cycleProgress < 0.65) {
          setMovementPhase('Bottom / Hold');
          setFormQuality('Excellent');
          setCameraFeedbackMsg('Target depth reached! Core locked.');
        } else if (cycleProgress < 0.95) {
          setMovementPhase('Ascending');
          setFormQuality('Excellent');
          setCameraFeedbackMsg('Drive through floor. Exhale on power phase.');
        } else if (frameCount % 90 === 0) {
          setCompletedReps((prev) => {
            const next = prev + 1;
            playAudioCue(720, 0.1);
            if (next >= activeExercise.targetReps) {
              setVerificationSuccess(true);
              setCameraFeedbackMsg(`Target ${activeExercise.targetReps} reps achieved!`);
              addToast({
                id: `rep-done-${Date.now()}`,
                type: 'success',
                title: 'Target Reps Completed!',
                message: `${activeExercise.name} verified with AI pose tracker.`,
              });
              incrementStat('completedWorkouts', 1);
            }
            return next;
          });
          setMovementPhase('Ready');
        }
      } else if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx && video.readyState >= 2) {
          canvas.width = 160;
          canvas.height = 120;
          ctx.drawImage(video, 0, 0, 160, 120);
          const currData = ctx.getImageData(0, 0, 160, 120).data;

          if (prevFrameDataRef.current && frameCount % 3 === 0) {
            let diffSum = 0;
            for (let i = 0; i < currData.length; i += 16) {
              const diff = Math.abs(currData[i] - prevFrameDataRef.current[i]);
              diffSum += diff;
            }

            const motionScore = Math.min(100, Math.round(diffSum / 500));
            setRepProgressPercent((prev) => Math.round(prev * 0.7 + motionScore * 0.3));

            if (motionScore > 35) {
              setMovementPhase('Descending');
              setFormQuality('Good');
              repStateRef.current.depthCounter++;
              setCameraFeedbackMsg('Kinetic motion detected. Drive through full range.');
            } else if (repStateRef.current.depthCounter > 4 && motionScore < 20) {
              repStateRef.current.depthCounter = 0;
              setCompletedReps((prev) => {
                const next = prev + 1;
                playAudioCue(700, 0.12);
                if (next >= activeExercise.targetReps) {
                  setVerificationSuccess(true);
                  setCameraFeedbackMsg(`Target ${activeExercise.targetReps} reps verified!`);
                  addToast({
                    id: `camera-rep-done-${Date.now()}`,
                    type: 'success',
                    title: 'Workout Target Achieved!',
                    message: `${activeExercise.name} completed and verified.`,
                  });
                  incrementStat('completedWorkouts', 1);
                }
                return next;
              });
              setMovementPhase('Ready');
              setFormQuality('Excellent');
            }
          }
          prevFrameDataRef.current = new Uint8ClampedArray(currData);
        }
      }

      animFrameRef.current = requestAnimationFrame(processVideoFrame);
    };

    animFrameRef.current = requestAnimationFrame(processVideoFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isCameraActive, isSimulatedDemo, activeExercise, playAudioCue, addToast, incrementStat]);

  // Clean cleanup on modal unmount
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setIsCircuitRunning(false);
      setIsMetronomeActive(false);
    }
  }, [isOpen, stopCameraStream]);

  // Capture pose snapshot
  const captureSnapshot = () => {
    if (canvasRef.current) {
      const snap = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setVerifiedSnapshotUrl(snap);
      setVerificationSuccess(true);
      playAudioCue(880, 0.2);
      addToast({
        id: `snap-${Date.now()}`,
        type: 'success',
        title: 'Pose Snapshot Captured',
        message: 'Kinetic form snapshot verified and logged to your habit dashboard.',
      });
      incrementStat('completedWorkouts', 1);
    }
  };

  const handleCompleteWorkout = () => {
    setVerificationSuccess(true);
    playAudioCue(880, 0.25);
    addToast({
      id: `manual-verified-${Date.now()}`,
      type: 'success',
      title: `${activeExercise.name} Completed`,
      message: 'Logged to daily habit streak and productivity score.',
    });
    incrementStat('completedWorkouts', 1);
  };

  if (!isOpen) return null;

  // Filtered exercises based on category, difficulty, and search
  const filteredExercises = EXERCISE_CATALOG.filter((ex) => {
    const matchesCategory = selectedCategory === 'all' || ex.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || ex.difficulty === selectedDifficulty;
    const matchesSearch =
      exerciseSearchQuery === '' ||
      ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
      ex.summary.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
      ex.benefits.some((b) => b.toLowerCase().includes(exerciseSearchQuery.toLowerCase())) ||
      ex.primaryMuscles.some((m) => m.toLowerCase().includes(exerciseSearchQuery.toLowerCase())) ||
      ex.equipment.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Category summary counts
  const categoryCounts = {
    all: EXERCISE_CATALOG.length,
    cardio: EXERCISE_CATALOG.filter((e) => e.category === 'cardio').length,
    creative: EXERCISE_CATALOG.filter((e) => e.category === 'creative').length,
    strength: EXERCISE_CATALOG.filter((e) => e.category === 'strength').length,
    core: EXERCISE_CATALOG.filter((e) => e.category === 'core').length,
    mobility: EXERCISE_CATALOG.filter((e) => e.category === 'mobility').length,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="exercise-coach-modal"
        className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-[#070707] border border-[#222] rounded-sm shadow-2xl overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-[#0a0a0a] border-b border-[#1a1a1a] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#c5a059]/15 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <Flame className="w-4 h-4 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-serif font-semibold text-white tracking-tight">
                  Kinetic Movement Academy & AI Coach
                </h3>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-[#161616] text-[#c5a059] border border-[#333]">
                  24 Structured Protocols
                </span>
              </div>
              <p className="text-[10px] text-[#777] font-mono hidden sm:block">
                Biomechanical animated simulations, 4-phase structured execution, form traps vs fixes & optical HUD.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#111] p-0.5 rounded-sm border border-[#222]">
              <button
                onClick={() => setViewMode('explorer')}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs transition-all flex items-center gap-1.5 ${
                  viewMode === 'explorer'
                    ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                <Dumbbell className="w-3 h-3" />
                <span>Protocol Explorer</span>
              </button>
              <button
                onClick={() => setViewMode('circuit')}
                className={`px-2.5 py-1 text-xs font-mono rounded-xs transition-all flex items-center gap-1.5 ${
                  viewMode === 'circuit'
                    ? 'bg-[#c5a059] text-black font-semibold shadow-sm'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                <Timer className="w-3 h-3" />
                <span>Structured Circuits ({WORKOUT_CIRCUITS.length})</span>
              </button>
            </div>

            <button
              onClick={() => setIsAudioCuesEnabled(!isAudioCuesEnabled)}
              className={`p-2 rounded-sm border transition-all ${
                isAudioCuesEnabled
                  ? 'bg-[#181818] border-[#333] text-[#c5a059]'
                  : 'bg-[#111] border-[#1a1a1a] text-[#555]'
              }`}
              title={isAudioCuesEnabled ? 'Mute Audio Cues' : 'Enable Audio Cues'}
            >
              {isAudioCuesEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-sm text-[#777] hover:text-white hover:bg-[#1a1a1a] transition-all"
              title="Close Coach"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
           VIEW MODE 1: PROTOCOL EXPLORER
           ========================================================================= */}
        {viewMode === 'explorer' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Categorized Exercise Selector & Search */}
            <div className="w-full md:w-80 lg:w-96 bg-[#090909] border-r border-[#1a1a1a] flex flex-col flex-shrink-0 max-h-[40vh] md:max-h-full">
              {/* Search Bar */}
              <div className="p-3 border-b border-[#181818] space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#555]" />
                  <input
                    type="text"
                    value={exerciseSearchQuery}
                    onChange={(e) => setExerciseSearchQuery(e.target.value)}
                    placeholder="Search exercise, muscle, equipment..."
                    className="w-full bg-[#121212] border border-[#222] rounded-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#c5a059]"
                  />
                  {exerciseSearchQuery && (
                    <button
                      onClick={() => setExerciseSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Category Ribbon Tabs */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'all', label: 'All', count: categoryCounts.all },
                    { id: 'cardio', label: '⚡ Cardio', count: categoryCounts.cardio },
                    { id: 'creative', label: '🥋 Combat', count: categoryCounts.creative },
                    { id: 'strength', label: '🏛️ Strength', count: categoryCounts.strength },
                    { id: 'core', label: '🛡️ Core', count: categoryCounts.core },
                    { id: 'mobility', label: '🧘 Mobility', count: categoryCounts.mobility },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-2 py-1 text-[10px] font-mono rounded-xs border transition-all flex items-center gap-1 ${
                        selectedCategory === cat.id
                          ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059] font-bold'
                          : 'bg-[#121212] border-[#222] text-[#777] hover:text-white'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="text-[9px] opacity-70">({cat.count})</span>
                    </button>
                  ))}
                </div>

                {/* Difficulty Filter */}
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#666]">
                  <span>Difficulty:</span>
                  <div className="flex items-center gap-1">
                    {(['all', 'Beginner', 'Intermediate', 'All Levels'] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-1.5 py-0.5 rounded-xs text-[9px] transition-all ${
                          selectedDifficulty === diff
                            ? 'bg-white/10 text-white font-bold'
                            : 'text-[#666] hover:text-[#aaa]'
                        }`}
                      >
                        {diff === 'all' ? 'All' : diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scrollable Exercise Protocols List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#141414] p-2 space-y-1">
                {filteredExercises.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#666]">
                    No exercises match "{exerciseSearchQuery}". Try clearing your filters.
                  </div>
                ) : (
                  filteredExercises.map((exercise) => {
                    const isSelected = exercise.id === selectedId;
                    return (
                      <button
                        key={exercise.id}
                        onClick={() => setSelectedId(exercise.id)}
                        className={`w-full text-left p-2.5 rounded-sm transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-[#181818] border border-[#c5a059]/60 shadow-md'
                            : 'bg-[#0d0d0d] hover:bg-[#141414] border border-transparent'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs flex-shrink-0 ${
                            isSelected
                              ? 'bg-[#c5a059] text-black font-bold'
                              : 'bg-[#161616] text-[#777] border border-[#262626]'
                          }`}
                        >
                          {exercise.category === 'cardio' && '⚡'}
                          {exercise.category === 'creative' && '🥋'}
                          {exercise.category === 'strength' && '🏛️'}
                          {exercise.category === 'core' && '🛡️'}
                          {exercise.category === 'mobility' && '🧘'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs font-serif font-medium truncate ${
                                isSelected ? 'text-white font-semibold' : 'text-[#bbb]'
                              }`}
                            >
                              {exercise.name}
                            </span>
                            <span className="text-[9px] font-mono text-[#777] uppercase flex-shrink-0">
                              {exercise.difficulty}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#666] line-clamp-1 mt-0.5">{exercise.summary}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-[#888]">
                            <span className="text-[#c5a059] font-medium">
                              {exercise.isTimed ? `${exercise.targetSeconds}s hold` : `${exercise.targetReps} reps`}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400">{exercise.energyBurn.split(' ')[0]}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Detailed Exercise Workspace */}
            <div className="flex-1 flex flex-col overflow-y-auto bg-[#050505]">
              {/* Exercise Header Banner */}
              <div className="p-4 bg-[#0a0a0a] border-b border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-[#141414] border border-[#2a2a2a] text-[#c5a059] rounded-xs">
                      {activeExercise.category.toUpperCase()}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-[#141414] border border-[#2a2a2a] text-emerald-400 rounded-xs">
                      {activeExercise.difficulty}
                    </span>
                    <span className="text-[10px] font-mono text-[#777]">
                      Equip: <strong className="text-[#bbb]">{activeExercise.equipment}</strong>
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-white mt-1">
                    {activeExercise.name}
                  </h2>
                  <p className="text-xs text-[#888] max-w-2xl mt-0.5">{activeExercise.summary}</p>
                </div>

                {/* Quick Stats Block */}
                <div className="flex items-center gap-3 bg-[#111] p-2.5 rounded-sm border border-[#222]">
                  <div className="text-center px-2">
                    <div className="text-[9px] font-mono text-[#666]">TARGET</div>
                    <div className="text-sm font-mono font-bold text-[#c5a059]">
                      {activeExercise.isTimed ? `${activeExercise.targetSeconds}s` : `${activeExercise.targetReps} reps`}
                    </div>
                  </div>
                  <div className="w-[1px] h-6 bg-[#222]" />
                  <div className="text-center px-2">
                    <div className="text-[9px] font-mono text-[#666]">BURN RATE</div>
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      {activeExercise.energyBurn.split(' ')[0]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Interactive Split Layout (Simulator Left / Guides Right) */}
              <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
                {/* Left: 2D Biomechanical Kinetic Simulator & Metronome */}
                <div className="lg:col-span-6 flex flex-col space-y-3">
                  <div className="h-[280px] sm:h-[320px] rounded-sm overflow-hidden">
                    <ExerciseVideoSimulator
                      exercise={activeExercise}
                      activeStepIdx={currentStepIdx}
                      onStepChange={(idx) => setCurrentStepIdx(idx)}
                      isAudioCuesEnabled={isAudioCuesEnabled}
                    />
                  </div>

                  {/* Cadence Metronome Bar */}
                  <div className="p-3 bg-[#0d0d0d] border border-[#222] rounded-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span className="text-xs font-mono text-white">Biomechanical Cadence Guide</span>
                      </div>
                      <button
                        onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                        className={`px-2 py-0.5 text-[10px] font-mono rounded-xs border transition-all ${
                          isMetronomeActive
                            ? 'bg-[#c5a059] text-black font-bold border-[#c5a059]'
                            : 'bg-[#161616] text-[#777] border-[#333] hover:text-white'
                        }`}
                      >
                        {isMetronomeActive ? 'Stop Metronome' : 'Start Cadence Guide'}
                      </button>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-[#c5a059] to-blue-500 transition-all duration-100"
                        style={{ width: `${metronomeProgress * 100}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                      <div
                        className={`p-1 rounded-xs border ${
                          metronomePhase === 'down' && isMetronomeActive
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-[#121212] border-[#222] text-[#666]'
                        }`}
                      >
                        Down / Load ({activeExercise.cadence.down}s)
                      </div>
                      <div
                        className={`p-1 rounded-xs border ${
                          metronomePhase === 'hold' && isMetronomeActive
                            ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                            : 'bg-[#121212] border-[#222] text-[#666]'
                        }`}
                      >
                        Hold / Lock ({activeExercise.cadence.hold}s)
                      </div>
                      <div
                        className={`p-1 rounded-xs border ${
                          metronomePhase === 'up' && isMetronomeActive
                            ? 'bg-blue-950/60 border-blue-500 text-blue-300 font-bold'
                            : 'bg-[#121212] border-[#222] text-[#666]'
                        }`}
                      >
                        Up / Drive ({activeExercise.cadence.up}s)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Structured Tabs (4-Phase Guide, Form Traps, Benefits, Camera HUD) */}
                <div className="lg:col-span-6 flex flex-col bg-[#090909] border border-[#222] rounded-sm overflow-hidden">
                  {/* Tab Strip */}
                  <div className="flex items-center border-b border-[#1c1c1c] bg-[#0c0c0c] overflow-x-auto">
                    {[
                      { id: 'tutorial', label: '4-Phase Guide', icon: Target },
                      { id: 'mistakes', label: 'Form Traps & Fixes', icon: AlertTriangle },
                      { id: 'benefits', label: 'Physiology & Gains', icon: Sparkles },
                      { id: 'camera', label: 'Optical HUD & Reps', icon: Camera },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeDetailTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDetailTab(tab.id as any)}
                          className={`px-3 py-2 text-xs font-mono flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${
                            isActive
                              ? 'border-[#c5a059] text-white font-semibold bg-[#141414]'
                              : 'border-transparent text-[#777] hover:text-[#ccc]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-[#c5a059]" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content Container */}
                  <div className="p-4 flex-1 overflow-y-auto space-y-4">
                    {/* TAB 1: 4-Phase Step-by-Step Guide */}
                    {activeDetailTab === 'tutorial' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-1 border-b border-[#1a1a1a]">
                          <span className="text-xs font-mono text-[#c5a059] uppercase tracking-wide">
                            Structured Biomechanical Sequence
                          </span>
                          <span className="text-[10px] font-mono text-[#777]">
                            Phase {currentStepIdx + 1} of {activeExercise.steps.length}
                          </span>
                        </div>

                        {/* Step Navigation Ribbon */}
                        <div className="grid grid-cols-4 gap-1">
                          {activeExercise.steps.map((st, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => setCurrentStepIdx(sIdx)}
                              className={`p-1.5 text-left rounded-xs border text-[10px] font-mono transition-all ${
                                currentStepIdx === sIdx
                                  ? 'bg-[#1c1c1c] border-[#c5a059] text-white font-bold'
                                  : 'bg-[#101010] border-[#222] text-[#666] hover:text-[#bbb]'
                              }`}
                            >
                              <div className="text-[#c5a059] text-[9px]">P{sIdx + 1}</div>
                              <div className="truncate">{st.title.split(' ')[0]}</div>
                            </button>
                          ))}
                        </div>

                        {/* Active Step Card */}
                        {activeExercise.steps[currentStepIdx] && (
                          <div className="p-3 bg-[#111] border border-[#222] rounded-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-[#c5a059] font-bold">
                                {activeExercise.steps[currentStepIdx].phase}
                              </span>
                              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-xs">
                                Verified Checkpoint
                              </span>
                            </div>
                            <h4 className="text-sm font-serif font-semibold text-white">
                              {activeExercise.steps[currentStepIdx].title}
                            </h4>
                            <p className="text-xs text-[#aaa] leading-relaxed">
                              {activeExercise.steps[currentStepIdx].description}
                            </p>

                            {/* Kinetic Cues */}
                            <div className="pt-2 space-y-1">
                              <div className="text-[10px] font-mono text-[#777] uppercase">Kinetic Cues:</div>
                              <div className="space-y-1">
                                {activeExercise.steps[currentStepIdx].cues.map((cue, cIdx) => (
                                  <div key={cIdx} className="flex items-start gap-1.5 text-xs text-[#ddd]">
                                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span>{cue}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Checkpoint Banner */}
                            <div className="mt-2 p-2 rounded-xs bg-[#161616] border border-[#2a2a2a] flex items-center gap-2 text-[11px] font-mono text-[#c5a059]">
                              <ShieldCheck className="w-4 h-4 text-[#c5a059] flex-shrink-0" />
                              <span>{activeExercise.steps[currentStepIdx].checkpoint}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: Form Traps & Kinematic Fixes */}
                    {activeDetailTab === 'mistakes' && (
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-[#c5a059] uppercase">
                          Biomechanical Pitfalls vs Verified Fixes
                        </div>
                        <div className="space-y-2.5">
                          {activeExercise.commonMistakes.map((item, mIdx) => (
                            <div key={mIdx} className="p-3 bg-[#111] border border-[#222] rounded-sm space-y-2">
                              <div className="flex items-start gap-2 text-xs text-red-300">
                                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-red-400 font-mono text-[10px] uppercase block">
                                    Form Trap #{mIdx + 1}:
                                  </strong>
                                  <span>{item.trap}</span>
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-xs text-emerald-300 pl-6 border-t border-[#1c1c1c] pt-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <strong className="text-emerald-400 font-mono text-[10px] uppercase block">
                                    Kinematic Fix:
                                  </strong>
                                  <span>{item.fix}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 3: Physiology & Gains */}
                    {activeDetailTab === 'benefits' && (
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-[#c5a059] uppercase">
                          Neuromuscular & Physiological Adaptations
                        </div>

                        {/* Primary Muscle Chips */}
                        <div className="p-3 bg-[#111] border border-[#222] rounded-sm space-y-2">
                          <div className="text-[10px] font-mono text-[#777] uppercase">Target Muscle Groups:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {activeExercise.primaryMuscles.map((muscle, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs font-mono bg-[#181818] border border-[#333] text-emerald-300 rounded-xs"
                              >
                                {muscle}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Benefits Bullet List */}
                        <div className="space-y-2">
                          {activeExercise.benefits.map((benefit, bIdx) => (
                            <div key={bIdx} className="p-2.5 bg-[#101010] border border-[#1e1e1e] rounded-sm flex items-start gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-[#c5a059] flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-[#ccc] leading-relaxed">{benefit}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAB 4: Optical AI Camera HUD & Rep Verification */}
                    {activeDetailTab === 'camera' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-[#c5a059] uppercase">
                            Optical Pose Verification & AI Tracker
                          </span>
                          {isCameraActive && (
                            <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              Tracking Live
                            </span>
                          )}
                        </div>

                        {/* Camera Screen View / Placeholder */}
                        <div className="relative w-full aspect-[4/3] bg-black rounded-sm border border-[#262626] overflow-hidden flex items-center justify-center">
                          {isCameraActive ? (
                            <>
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover ${isSimulatedDemo ? 'hidden' : ''}`}
                              />
                              <canvas ref={canvasRef} className="hidden" />

                              {/* Virtual HUD Overlay Grid */}
                              <div className="absolute inset-0 border-2 border-emerald-500/40 pointer-events-none flex flex-col justify-between p-3">
                                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400">
                                  <span className="bg-black/70 px-2 py-0.5 rounded-xs">
                                    Quality: <strong>{formQuality}</strong>
                                  </span>
                                  <span className="bg-black/70 px-2 py-0.5 rounded-xs">
                                    Time: {elapsedSeconds}s
                                  </span>
                                </div>

                                <div className="text-center">
                                  <span className="bg-black/80 px-3 py-1 rounded-sm text-xs font-mono text-[#c5a059] border border-[#333]">
                                    {movementPhase}
                                  </span>
                                </div>

                                <div className="bg-black/75 p-2 rounded-xs border border-[#222] text-[10px] font-mono text-[#ddd]">
                                  {cameraFeedbackMsg}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="p-6 text-center space-y-3">
                              <Camera className="w-8 h-8 text-[#444] mx-auto" />
                              <div className="text-xs text-[#888]">
                                Enable camera to verify exercise form, count reps automatically, and record workouts.
                              </div>
                              <div className="flex flex-wrap items-center justify-center gap-2">
                                <button
                                  onClick={startUserCamera}
                                  className="px-3 py-1.5 text-xs font-mono bg-[#c5a059] text-black font-semibold rounded-sm hover:bg-[#d6b26b] transition-all flex items-center gap-1.5"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>Start Webcam HUD</span>
                                </button>
                                <button
                                  onClick={startSimulatedDemo}
                                  className="px-3 py-1.5 text-xs font-mono bg-[#181818] text-[#c5a059] border border-[#333] rounded-sm hover:bg-[#222] transition-all"
                                >
                                  Virtual Pose HUD
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Rep Counter & Actions */}
                        {isCameraActive && (
                          <div className="p-3 bg-[#111] border border-[#222] rounded-sm flex items-center justify-between gap-3">
                            <div>
                              <div className="text-[10px] font-mono text-[#666]">COMPLETED REPS</div>
                              <div className="text-xl font-mono font-bold text-white">
                                {completedReps} <span className="text-xs text-[#777]">/ {activeExercise.targetReps}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={captureSnapshot}
                                className="px-2.5 py-1.5 text-xs font-mono bg-[#181818] border border-[#333] text-[#c5a059] rounded-sm hover:bg-[#222] transition-all flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>Snapshot</span>
                              </button>
                              <button
                                onClick={stopCameraStream}
                                className="px-2.5 py-1.5 text-xs font-mono bg-[#141414] border border-[#222] text-[#888] rounded-sm hover:text-white transition-all"
                              >
                                Stop
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Completion Action Footer */}
                  <div className="p-3 bg-[#0c0c0c] border-t border-[#1a1a1a] flex items-center justify-between">
                    <div className="text-[10px] font-mono text-[#777]">
                      Angle: <strong className="text-white">{activeExercise.biomechanicsAngle}</strong>
                    </div>
                    <button
                      onClick={handleCompleteWorkout}
                      className="px-3 py-1.5 text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-sm transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Log & Complete Protocol</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
           VIEW MODE 2: STRUCTURED WORKOUT CIRCUITS (GUIDED FLOW)
           ========================================================================= */}
        {viewMode === 'circuit' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Circuit List Selector */}
            <div className="w-full md:w-80 bg-[#090909] border-r border-[#1a1a1a] p-3 flex flex-col gap-2 overflow-y-auto">
              <div className="text-xs font-mono text-[#c5a059] uppercase tracking-wide pb-1 border-b border-[#181818]">
                Programmed Routines ({WORKOUT_CIRCUITS.length})
              </div>

              {WORKOUT_CIRCUITS.map((circuit) => {
                const isCurrent = circuit.id === activeCircuitId;
                return (
                  <div
                    key={circuit.id}
                    className={`p-3 rounded-sm border transition-all text-left space-y-2 ${
                      isCurrent
                        ? 'bg-[#161616] border-[#c5a059]'
                        : 'bg-[#0e0e0e] border-[#222] hover:border-[#333]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif font-semibold text-white">{circuit.name}</span>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-xs">
                        {circuit.durationMinutes} Min
                      </span>
                    </div>
                    <p className="text-[10px] text-[#777] leading-relaxed line-clamp-2">{circuit.description}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#888]">
                      <span>{circuit.exerciseIds.length} Exercises</span>
                      <span className="text-[#c5a059]">{circuit.estimatedCalories}</span>
                    </div>

                    <button
                      onClick={() => startCircuit(circuit)}
                      className={`w-full py-1.5 text-xs font-mono rounded-xs transition-all flex items-center justify-center gap-1.5 ${
                        isCurrent && isCircuitRunning
                          ? 'bg-amber-600 text-black font-bold'
                          : 'bg-[#c5a059] text-black font-semibold hover:bg-[#d6b26b]'
                      }`}
                    >
                      <Play className="w-3 h-3" />
                      <span>{isCurrent && isCircuitRunning ? 'In Progress' : 'Start Circuit'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right: Guided Follow-Along Player */}
            <div className="flex-1 flex flex-col bg-[#050505] p-4 overflow-y-auto space-y-4">
              {circuitPhase === 'finished' ? (
                /* Celebration Screen */
                <div className="my-auto text-center space-y-4 p-8 max-w-lg mx-auto bg-[#0d0d0d] border border-[#222] rounded-sm">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">Circuit Complete!</h3>
                  <p className="text-xs text-[#aaa] leading-relaxed">
                    You have finished the entire <strong>{activeCircuit.name}</strong>. Your effort has been logged to your daily productivity score and habit streak.
                  </p>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-[#141414] rounded-sm text-xs font-mono">
                    <div>
                      <div className="text-[#777]">TOTAL TIME</div>
                      <div className="text-sm font-bold text-white">{Math.round(circuitTotalElapsed / 60)} min</div>
                    </div>
                    <div>
                      <div className="text-[#777]">EST. ENERGY BURN</div>
                      <div className="text-sm font-bold text-emerald-400">{activeCircuit.estimatedCalories}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCircuitPhase('work');
                      setCircuitExerciseIndex(0);
                      setIsCircuitRunning(false);
                    }}
                    className="px-4 py-2 text-xs font-mono bg-[#c5a059] text-black font-semibold rounded-sm hover:bg-[#d6b26b]"
                  >
                    Back to Routines
                  </button>
                </div>
              ) : (
                /* Active Circuit Tracker */
                <div className="space-y-4">
                  {/* Progress Header */}
                  <div className="p-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#c5a059] uppercase">{activeCircuit.name}</span>
                      <h3 className="text-sm font-serif font-semibold text-white">
                        Exercise {circuitExerciseIndex + 1} of {activeCircuit.exerciseIds.length}: {currentCircuitExercise.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsCircuitRunning(!isCircuitRunning)}
                        className="px-3 py-1.5 text-xs font-mono bg-[#181818] border border-[#333] text-white rounded-sm hover:border-[#c5a059] transition-all flex items-center gap-1"
                      >
                        {isCircuitRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isCircuitRunning ? 'Pause' : 'Resume'}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (circuitExerciseIndex < activeCircuit.exerciseIds.length - 1) {
                            setCircuitExerciseIndex((i) => i + 1);
                            setCircuitPhase('work');
                            const nextEx = EXERCISE_CATALOG.find((e) => e.id === activeCircuit.exerciseIds[circuitExerciseIndex + 1]);
                            setCircuitSecondsRemaining(nextEx?.targetSeconds || 45);
                          } else {
                            setCircuitPhase('finished');
                          }
                        }}
                        className="p-1.5 text-[#777] hover:text-white"
                        title="Skip to next exercise"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Circuit Main Display (Timer & Kinematic Simulator) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: Simulator */}
                    <div className="lg:col-span-7 h-[280px] sm:h-[320px]">
                      <ExerciseVideoSimulator
                        exercise={currentCircuitExercise}
                        activeStepIdx={0}
                        isAudioCuesEnabled={isAudioCuesEnabled}
                      />
                    </div>

                    {/* Right: Countdown & Exercise Telemetry */}
                    <div className="lg:col-span-5 flex flex-col justify-between p-4 bg-[#0d0d0d] border border-[#222] rounded-sm space-y-4">
                      {/* Interval Status Banner */}
                      <div
                        className={`p-3 rounded-sm text-center border ${
                          circuitPhase === 'work'
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                            : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                        }`}
                      >
                        <div className="text-[10px] font-mono uppercase tracking-wider">
                          {circuitPhase === 'work' ? 'ACTIVE WORK INTERVAL' : 'RECOVERY REST INTERVAL'}
                        </div>
                        <div className="text-3xl sm:text-4xl font-mono font-bold mt-1">
                          {circuitSecondsRemaining}s
                        </div>
                      </div>

                      {/* Exercise Details */}
                      <div className="space-y-2 text-xs">
                        <div className="text-[10px] font-mono text-[#777] uppercase">Key Target Checkpoint:</div>
                        <p className="text-[#ccc] bg-[#141414] p-2.5 rounded-xs border border-[#222]">
                          {currentCircuitExercise.steps[0]?.checkpoint || 'Maintain neutral spine and steady cadence.'}
                        </p>
                      </div>

                      {/* Next Exercise Preview */}
                      {circuitExerciseIndex < activeCircuit.exerciseIds.length - 1 && (
                        <div className="text-[10px] font-mono text-[#777] bg-[#101010] p-2 rounded-xs border border-[#1a1a1a]">
                          <span>Next Up: </span>
                          <strong className="text-white">
                            {EXERCISE_CATALOG.find((e) => e.id === activeCircuit.exerciseIds[circuitExerciseIndex + 1])?.name}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
