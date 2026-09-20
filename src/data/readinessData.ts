import { DemographicCategory, ExerciseGuide } from './exerciseCatalogData';
import { EXERCISE_CATALOG } from './exerciseCatalogData';

export type ReadinessState = 'optimal' | 'moderate' | 'recovery' | 'restorative';
export type WearableSource = 'apple_watch' | 'oura' | 'garmin' | 'whoop' | 'manual_checkin';

export interface ReadinessAssessment {
  score: number; // 0 - 100
  state: ReadinessState;
  stateLabel: string;
  stateColor: string;
  sleepHours: number;
  sleepQuality: 'deep' | 'restful' | 'fair' | 'poor';
  sorenessLevel: number; // 0 to 10
  sorenessArea: string;
  stressLevel: number; // 0 to 10
  energyLevel: number; // 0 to 10
  hrvMs: number; // Heart Rate Variability in ms
  restingHr: number; // bpm
  source: WearableSource;
  sourceLabel: string;
  lastUpdated: string;
  aiCoachRationale: string;
  adaptationActive: boolean;
  originalPlannedWorkout: string;
  adaptedWorkoutTitle: string;
  adaptedWorkoutSubtitle: string;
  volumeScaling: {
    intensityPercent: number;
    setsAdjustment: string;
    restAdjustment: string;
    focusCue: string;
  };
  prescribedExerciseIds: string[];
  recommendedCategory: DemographicCategory;
}

export interface WearablePreset {
  id: WearableSource | 'simulate_tired' | 'simulate_peak';
  name: string;
  icon: string;
  badge: string;
  description: string;
  data: {
    sleepHours: number;
    sleepQuality: 'deep' | 'restful' | 'fair' | 'poor';
    sorenessLevel: number;
    sorenessArea: string;
    stressLevel: number;
    energyLevel: number;
    hrvMs: number;
    restingHr: number;
    source: WearableSource;
  };
}

export const WEARABLE_PRESETS: WearablePreset[] = [
  {
    id: 'apple_watch',
    name: 'Apple Watch Ultra',
    icon: '⌚',
    badge: 'HealthKit Synced',
    description: 'Synced 7h 50m sleep, HRV 68ms, Resting HR 54 bpm.',
    data: {
      sleepHours: 7.8,
      sleepQuality: 'restful',
      sorenessLevel: 2,
      sorenessArea: 'Mild shoulder tightness',
      stressLevel: 3,
      energyLevel: 8,
      hrvMs: 68,
      restingHr: 54,
      source: 'apple_watch',
    },
  },
  {
    id: 'oura',
    name: 'Oura Ring Gen 3',
    icon: '💍',
    badge: 'Readiness 91',
    description: 'Synced Optimal Sleep Crown (89), low body temp delta, HRV 74ms.',
    data: {
      sleepHours: 8.2,
      sleepQuality: 'deep',
      sorenessLevel: 1,
      sorenessArea: 'None (Fully fresh)',
      stressLevel: 2,
      energyLevel: 9,
      hrvMs: 74,
      restingHr: 51,
      source: 'oura',
    },
  },
  {
    id: 'garmin',
    name: 'Garmin Forerunner',
    icon: '⏱️',
    badge: 'Body Battery 72',
    description: 'Synced moderate training load, HRV balanced at 58ms, Sleep 6.8h.',
    data: {
      sleepHours: 6.8,
      sleepQuality: 'fair',
      sorenessLevel: 4,
      sorenessArea: 'Calves & hamstrings',
      stressLevel: 5,
      energyLevel: 6,
      hrvMs: 58,
      restingHr: 59,
      source: 'garmin',
    },
  },
  {
    id: 'simulate_tired',
    name: 'Tired & Sore (Auto-Swap Demo)',
    icon: '🛌',
    badge: 'Fatigue Detected',
    description: 'Simulates 4.8h fragmented sleep, high back soreness, HRV 38ms. AI automatically swaps heavy lifts for mobility!',
    data: {
      sleepHours: 4.8,
      sleepQuality: 'poor',
      sorenessLevel: 8,
      sorenessArea: 'Lower back & tight neck',
      stressLevel: 8,
      energyLevel: 3,
      hrvMs: 38,
      restingHr: 68,
      source: 'manual_checkin',
    },
  },
  {
    id: 'simulate_peak',
    name: 'Peak Fresh (High-Power Demo)',
    icon: '🚀',
    badge: 'Max Athletic Prime',
    description: 'Simulates 9.0h deep restorative sleep, 0 soreness, surging energy. AI primes high-intensity power output!',
    data: {
      sleepHours: 9.0,
      sleepQuality: 'deep',
      sorenessLevel: 0,
      sorenessArea: 'None (100% Prime)',
      stressLevel: 1,
      energyLevel: 10,
      hrvMs: 88,
      restingHr: 48,
      source: 'apple_watch',
    },
  },
];

/**
 * Biomechanical & physiological algorithm to calculate readiness score (0 - 100)
 */
export function calculateReadinessScore(params: {
  sleepHours: number;
  sleepQuality: 'deep' | 'restful' | 'fair' | 'poor';
  sorenessLevel: number;
  stressLevel: number;
  energyLevel: number;
  hrvMs: number;
  restingHr: number;
}): number {
  // 1. Sleep score (35% weight)
  const sleepHrsTarget = 8.0;
  const sleepHrsRatio = Math.min(1.2, Math.max(0.4, params.sleepHours / sleepHrsTarget));
  const qualityFactor =
    params.sleepQuality === 'deep'
      ? 1.0
      : params.sleepQuality === 'restful'
      ? 0.88
      : params.sleepQuality === 'fair'
      ? 0.7
      : 0.45;
  const sleepScore = Math.min(100, sleepHrsRatio * 100 * qualityFactor);

  // 2. Soreness score (20% weight) - inverse
  const sorenessScore = Math.max(0, 100 - params.sorenessLevel * 10);

  // 3. Stress score (15% weight) - inverse
  const stressScore = Math.max(0, 100 - params.stressLevel * 10);

  // 4. Energy score (15% weight)
  const energyScore = Math.min(100, params.energyLevel * 10);

  // 5. HRV biometric score (15% weight) - baseline normalized
  // HRV < 45 is low, 45-65 is average, 65-90+ is high
  const hrvNormalized = Math.min(100, Math.max(20, (params.hrvMs / 80) * 100));

  // Weighted composite
  const rawScore =
    sleepScore * 0.35 +
    sorenessScore * 0.20 +
    stressScore * 0.15 +
    energyScore * 0.15 +
    hrvNormalized * 0.15;

  return Math.round(Math.min(100, Math.max(15, rawScore)));
}

/**
 * Generate full dynamic readiness assessment and AI workout prescription
 */
export function generateReadinessAssessment(params: {
  sleepHours: number;
  sleepQuality: 'deep' | 'restful' | 'fair' | 'poor';
  sorenessLevel: number;
  sorenessArea: string;
  stressLevel: number;
  energyLevel: number;
  hrvMs: number;
  restingHr: number;
  source: WearableSource;
  preferredCategory?: DemographicCategory;
}): ReadinessAssessment {
  const score = calculateReadinessScore(params);

  let state: ReadinessState = 'optimal';
  let stateLabel = 'Optimal Readiness';
  let stateColor = '#10b981'; // Emerald
  let sourceLabel = 'Manual Daily Check-in';

  if (params.source === 'apple_watch') sourceLabel = 'Apple Watch Ultra HealthKit';
  else if (params.source === 'oura') sourceLabel = 'Oura Ring Gen 3 Sleep Pulse';
  else if (params.source === 'garmin') sourceLabel = 'Garmin Connect Body Battery';
  else if (params.source === 'whoop') sourceLabel = 'Whoop 4.0 Recovery Sensor';

  if (score >= 82) {
    state = 'optimal';
    stateLabel = 'Peak Athletic Prime';
    stateColor = '#10b981';
  } else if (score >= 65) {
    state = 'moderate';
    stateLabel = 'Balanced Capacity';
    stateColor = '#38bdf8';
  } else if (score >= 48) {
    state = 'recovery';
    stateLabel = 'Active Recovery Needed';
    stateColor = '#f59e0b';
  } else {
    state = 'restorative';
    stateLabel = 'Nervous System Fatigue';
    stateColor = '#ef4444';
  }

  // Hyper-Personalized AI Exercise Adaptation Logic
  let adaptationActive = false;
  let originalPlannedWorkout = 'Heavy Strength & Speed Plyometrics (Deadlifts, Push-ups, Skipping)';
  let adaptedWorkoutTitle = '';
  let adaptedWorkoutSubtitle = '';
  let aiCoachRationale = '';
  let prescribedExerciseIds: string[] = [];
  let recommendedCategory: DemographicCategory = params.preferredCategory || 'general_health';

  let volumeScaling = {
    intensityPercent: 100,
    setsAdjustment: 'Standard 4 Sets',
    restAdjustment: 'Standard 45s Rest',
    focusCue: 'Progressive Overload & Explosive Power',
  };

  if (state === 'restorative' || state === 'recovery') {
    adaptationActive = true;
    volumeScaling = {
      intensityPercent: state === 'restorative' ? 40 : 60,
      setsAdjustment: 'Reduced to 2 Gentle Sets (-50% Volume)',
      restAdjustment: 'Extended 90s Rest Intervals',
      focusCue: 'Parasympathetic Breathing & Joint Decompression',
    };

    if (params.sorenessArea.toLowerCase().includes('back') || params.sorenessArea.toLowerCase().includes('spine')) {
      adaptedWorkoutTitle = 'Spine & Lumbar Decompression Flow';
      adaptedWorkoutSubtitle = 'Mobility cat-cow waves, thoracic spinal openings, and gentle desk chest resets.';
      prescribedExerciseIds = ['cat_camel_flow', 'health_desk_chest_opener', 'mobility_scapular_wall_slides', 'mobility_thoracic_open_book'];
      recommendedCategory = 'mobility'; // Gentle spine and mobility safe
      aiCoachRationale = `Coach Gemini: I detected low HRV (${params.hrvMs}ms) and elevated lower back soreness from your ${params.sleepHours}h sleep. Heavy lifting today would create unnecessary spinal compression. I've automatically adapted your session for gentle Cat-Camel Spinal Waves and Scapular Wall Slides to nourish your discs without central nervous system strain.`;
    } else {
      adaptedWorkoutTitle = 'Restorative Joint Longevity & Posture Reset';
      adaptedWorkoutSubtitle = 'Zero-impact active recovery, neck releases, and thoracic mobility.';
      prescribedExerciseIds = ['health_desk_chest_opener', 'health_chin_tuck_cervical', 'mobility_scapular_wall_slides', 'health_standing_calf_raise'];
      recommendedCategory = 'general_health';
      aiCoachRationale = `Coach Gemini: Your readiness is currently at ${score}/100 with elevated physical stress. Pushing high intensity today risks overtraining. I have dialed back volume by 50% and substituted high-impact jumps with Ergonomic Chest Openers, Cervical Chin Tucks, and Light Calf Mobilizations.`;
    }
  } else if (state === 'moderate') {
    adaptationActive = false;
    volumeScaling = {
      intensityPercent: 80,
      setsAdjustment: 'Standard 3 Sets',
      restAdjustment: '60s Rest',
      focusCue: 'Steady-State Hypertrophy & Clean Form Cadence',
    };
    adaptedWorkoutTitle = 'Balanced Functional Conditioning';
    adaptedWorkoutSubtitle = 'Moderate bodyweight calisthenics, core control, and rhythmic movement.';
    prescribedExerciseIds = ['pushup', 'squat', 'dead_bug', 'skipping'];
    recommendedCategory = 'strength';
    aiCoachRationale = `Coach Gemini: Solid recovery baseline (${score}/100, ${params.sleepHours}h sleep). You have good capacity for steady bodyweight mechanics. Focus on strict tempo and deep joint control today.`;
  } else {
    // Optimal / Peak
    adaptationActive = false;
    volumeScaling = {
      intensityPercent: 100,
      setsAdjustment: 'Max Volume: 4-5 Sets (PR Target)',
      restAdjustment: 'Optimal 45s High-Pace Rest',
      focusCue: 'Explosive Power, Max Velocity & Speed Skipping',
    };
    adaptedWorkoutTitle = 'High-Power Athletic Conditioning & Speed PRs';
    adaptedWorkoutSubtitle = 'High-velocity skipping, explosive pushups, and dynamic agility.';
    prescribedExerciseIds = ['skipping', 'pushup', 'cardio_skater_bounds', 'core_hollow_body_hold', 'high_knees'];
    recommendedCategory = 'cardio';
    aiCoachRationale = `Coach Gemini: All green lights! Sleep was restorative (${params.sleepHours}h), HRV is surging (${params.hrvMs}ms), and muscle soreness is zero. Your central nervous system is fully primed for high-output plyometrics, speed jump rope intervals, and setting personal bests. Let's attack today's workout!`;
  }

  return {
    score,
    state,
    stateLabel,
    stateColor,
    sleepHours: params.sleepHours,
    sleepQuality: params.sleepQuality,
    sorenessLevel: params.sorenessLevel,
    sorenessArea: params.sorenessArea,
    stressLevel: params.stressLevel,
    energyLevel: params.energyLevel,
    hrvMs: params.hrvMs,
    restingHr: params.restingHr,
    source: params.source,
    sourceLabel,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    aiCoachRationale,
    adaptationActive,
    originalPlannedWorkout,
    adaptedWorkoutTitle,
    adaptedWorkoutSubtitle,
    volumeScaling,
    prescribedExerciseIds,
    recommendedCategory,
  };
}

// Initial Default Cached Assessment
export const DEFAULT_READINESS: ReadinessAssessment = generateReadinessAssessment({
  sleepHours: 7.6,
  sleepQuality: 'restful',
  sorenessLevel: 2,
  sorenessArea: 'Mild hamstring tightness',
  stressLevel: 3,
  energyLevel: 8,
  hrvMs: 68,
  restingHr: 54,
  source: 'apple_watch',
});
