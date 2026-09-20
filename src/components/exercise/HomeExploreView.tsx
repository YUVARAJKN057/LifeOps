import React, { useState } from 'react';
import {
  Flame,
  ArrowRight,
  Sparkles,
  Smile,
  HeartHandshake,
  Shield,
  Zap,
  Dumbbell,
  Timer,
  Play,
  Pause,
  CheckCircle2,
  Box,
  Bot,
  Compass,
  Shuffle,
  ChevronRight,
  TrendingUp,
  Heart,
  Award,
  Video,
  Layers,
  Activity,
  Tv,
  Eye,
  Maximize2,
} from 'lucide-react';
import {
  DemographicCategory,
  ExerciseGuide,
  WorkoutCircuit,
  CATEGORY_DEFINITIONS,
  EXERCISE_CATALOG,
  WORKOUT_CIRCUITS,
} from '../../data/exerciseCatalogData';
import { ReadinessAICoach } from './ReadinessAICoach';
import { CategoryQuickNav } from './CategoryQuickNav';
import { ExerciseMotionVideoCanvas } from './ExerciseMotionVideoCanvas';
import { Exercise3DCanvas } from './Exercise3DCanvas';

interface HomeExploreViewProps {
  onSelectCategory: (category: DemographicCategory) => void;
  onSelectExercise: (exercise: ExerciseGuide) => void;
  onNavigateCircuits: () => void;
  onRandomExercise: () => void;
  completedExerciseIds: string[];
}

export const HomeExploreView: React.FC<HomeExploreViewProps> = ({
  onSelectCategory,
  onSelectExercise,
  onNavigateCircuits,
  onRandomExercise,
  completedExerciseIds,
}) => {
  // Active showcase exercise for the home page live simulation player (Strict Push-Up by default)
  const [showcaseExerciseId, setShowcaseExerciseId] = useState<string>('pushup');
  const [showcaseSimulationMode, setShowcaseSimulationMode] = useState<'2d-video' | '3d-mannequin'>('2d-video');
  const [isShowcasePlaying, setIsShowcasePlaying] = useState<boolean>(true);

  // Selected exercise guide for the active showcase
  const activeShowcaseExercise =
    EXERCISE_CATALOG.find((e) => e.id === showcaseExerciseId) ||
    EXERCISE_CATALOG.find((e) => e.id === 'pushup') ||
    EXERCISE_CATALOG[0];

  // Curated showcase exercises list across all demographics
  const showcaseCuratedList = [
    { id: 'pushup', label: 'Strict Push-Up', icon: '💪', badge: 'Strength & Core' },
    { id: 'kids_crab_kicks', label: 'Ninja Crab Kicks', icon: '🦀', badge: 'Kids Agility' },
    { id: 'skipping', label: 'Speed Skipping', icon: '⚡', badge: 'Cardio' },
    { id: 'senior_chair_stand', label: 'Sit-to-Stand', icon: '👵', badge: 'Seniors' },
    { id: 'bird_dog', label: 'Bird-Dog Shield', icon: '🛡️', badge: 'Core' },
    { id: 'glute_bridge', label: 'Glute Bridge', icon: '🍑', badge: 'Posterior Chain' },
    { id: 'worlds_greatest_stretch', label: "World's Greatest", icon: '🧘', badge: 'Mobility' },
    { id: 'health_desk_chest_opener', label: 'Desk Chest Opener', icon: '✨', badge: 'Desk Care' },
  ];
  // The curated demographic category cards
  const categoryCards: Array<{
    id: DemographicCategory;
    title: string;
    tagline: string;
    icon: string;
    badge: string;
    description: string;
    sampleMovements: string[];
    gradient: string;
    accentColor: string;
  }> = [
    {
      id: 'kids',
      title: 'Kids & Youth Fitness',
      tagline: 'Playful Coordination & Agility',
      icon: '🧒',
      badge: 'Age 5-14',
      description: 'Engaging, fun animal movements, ninja crab agility games, and jumping patterns that develop spatial awareness and boundless energy.',
      sampleMovements: ['Star Jumps', 'Ninja Crab Kicks', 'Kangaroo Hops', 'Frog Leaps'],
      gradient: 'from-amber-500/15 via-orange-500/5 to-transparent',
      accentColor: '#f59e0b',
    },
    {
      id: 'seniors',
      title: 'Aged & Senior Vitality',
      tagline: 'Balance & Fall Prevention',
      icon: '👵',
      badge: 'Gentle & Safe',
      description: 'Low-impact, joint-sparing seated and supported exercises for maintaining independence, bone density, ankle stability, and functional mobility.',
      sampleMovements: ['Chair Sit-to-Stand', 'Ankle Pumps', 'Wall Pushes', 'Seated Leg Extensions'],
      gradient: 'from-emerald-500/15 via-teal-500/5 to-transparent',
      accentColor: '#10b981',
    },
    {
      id: 'general_health',
      title: 'General Health & Desk Care',
      tagline: 'Posture & Daily Movement',
      icon: '✨',
      badge: 'Daily Wellness',
      description: 'Quick ergonomic posture resets, neck releases, and full-body vitality drills designed for sedentary office workers and daily wellness.',
      sampleMovements: ['Desk Chest Opener', 'Seated Spinal Twist', 'Standing Calf Raises'],
      gradient: 'from-sky-500/15 via-blue-500/5 to-transparent',
      accentColor: '#0ea5e9',
    },
    {
      id: 'cardio',
      title: 'Cardio & Speed Skipping',
      tagline: 'High Burn & Jump Rope Rhythms',
      icon: '⚡',
      badge: 'Calorie Torch',
      description: 'High-energy cardiovascular conditioning, jump rope variations, and athletic footwork drills that ignite aerobic capacity and quickness.',
      sampleMovements: ['Rhythmic Skipping', 'Boxer Skip', 'High Knees', 'Mountain Climbers'],
      gradient: 'from-yellow-500/15 via-amber-500/5 to-transparent',
      accentColor: '#eab308',
    },
    {
      id: 'strength',
      title: 'Strength & Bodyweight',
      tagline: 'Compound Muscle & Power',
      icon: '💪',
      badge: 'Hypertrophy',
      description: 'Progressive calisthenics and bodyweight resistance movements to sculpt functional strength, upper-body push/pull, and leg power.',
      sampleMovements: ['Strict Push-Up', 'Air Squat', 'Reverse Lunge', 'Planche Lean'],
      gradient: 'from-purple-500/15 via-indigo-500/5 to-transparent',
      accentColor: '#8b5cf6',
    },
    {
      id: 'core',
      title: 'Core & Spine Stability',
      tagline: 'Lumbar Protection & Anti-Rotation',
      icon: '🛡️',
      badge: 'Spine Shield',
      description: 'Evidence-based core endurance drills that stabilize the spine, protect against disc herniation, and sculpt 360-degree abdominal endurance.',
      sampleMovements: ['Bird-Dog', 'Deadbug', 'Hollow Body Hold', 'Forearm Plank'],
      gradient: 'from-blue-500/15 via-cyan-500/5 to-transparent',
      accentColor: '#3b82f6',
    },
    {
      id: 'mobility',
      title: 'Mobility & Joint Recovery',
      tagline: 'Full Range of Motion & Flexibility',
      icon: '🧘',
      badge: 'Joint Longevity',
      description: 'Dynamic joint rotations, active stretching, and myofascial openers to restore stiffness, loosen hips, and promote muscular longevity.',
      sampleMovements: ['World’s Greatest Stretch', 'Deep 90/90 Hip Flow', 'Thoracic Windmill'],
      gradient: 'from-teal-500/15 via-emerald-500/5 to-transparent',
      accentColor: '#14b8a6',
    },
  ];

  // Pick top featured movements
  const featuredExercises = [
    EXERCISE_CATALOG.find((e) => e.id === 'pushup') || EXERCISE_CATALOG[0],
    EXERCISE_CATALOG.find((e) => e.id === 'skipping') || EXERCISE_CATALOG[1],
    EXERCISE_CATALOG.find((e) => e.id === 'kids_star_jumps') || EXERCISE_CATALOG[2],
    EXERCISE_CATALOG.find((e) => e.id === 'bird_dog') || EXERCISE_CATALOG[3],
    EXERCISE_CATALOG.find((e) => e.id === 'senior_chair_stand') || EXERCISE_CATALOG[4],
    EXERCISE_CATALOG.find((e) => e.id === 'health_desk_chest_opener') || EXERCISE_CATALOG[5],
  ];

  // Spotlight Circuit
  const spotlightCircuit = WORKOUT_CIRCUITS[0];

  return (
    <div className="space-y-8">
      {/* 0. Dynamic Readiness AI Coach (Personalized Daily Prescription & Wearable Sync) */}
      <ReadinessAICoach
        onSelectExercise={onSelectExercise}
        onSelectCategory={onSelectCategory}
        onNavigateCircuits={onNavigateCircuits}
      />

      {/* 0.5 Category Quick Navigator Strip */}
      <CategoryQuickNav
        title="Direct Category Portals"
        onSelectCategory={onSelectCategory}
      />

      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-b from-[#14141d] to-[#0c0c12] border border-[#262638] p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#c5a059] text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive 3D Biomechanical Simulator & AI Voice Coaching</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Scientific Movement & Fitness for <span className="text-[#c5a059]">Every Stage of Life</span>.
          </h1>

          <p className="text-sm sm:text-base text-[#a1a1aa] font-sans leading-relaxed">
            Select a specialized category below to explore doctor-informed exercises with interactive 3D mannequins, real-time cadence timers, and voice-guided form cues.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2 font-mono text-xs">
            <button
              onClick={() => onSelectCategory('kids')}
              className="px-5 py-2.5 rounded-md bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              <span>Explore Categories</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onNavigateCircuits}
              className="px-4 py-2.5 rounded-md bg-[#181824] hover:bg-[#222234] border border-[#333346] text-white font-medium flex items-center gap-2 transition-all cursor-pointer"
            >
              <Timer className="w-4 h-4 text-[#c5a059]" />
              <span>Start Timed Circuit</span>
            </button>

            <button
              onClick={onRandomExercise}
              className="px-4 py-2.5 rounded-md bg-[#12121a] hover:bg-[#1c1c28] border border-[#282838] text-[#aaa] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Surprise Me</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 1.5 LIVE VIDEO & 3D SIMULATION SHOWCASE (DIRECT INTERACTIVE HOME STUDIO) */}
      <section className="bg-[#0e0e15] border border-[#262638] rounded-xl p-4 sm:p-6 shadow-2xl space-y-4">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1c1c28] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-xs bg-[#c5a059]/20 text-[#c5a059] text-xs font-mono font-bold uppercase flex items-center gap-1 border border-[#c5a059]/30">
                <Tv className="w-3.5 h-3.5" />
                Live Video Simulation
              </span>
              <span className="text-[10px] font-mono text-[#777] hidden sm:inline">
                Real-Time Biomechanical Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2">
              <span>Interactive Movement Simulation Player</span>
            </h2>
            <p className="text-xs text-[#999] font-mono">
              Watch vector video motions with live skeletal angle tracking or switch to 360° 3D mannequins.
            </p>
          </div>

          {/* 2D Video vs 3D Mannequin Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#14141e] border border-[#2a2a3e] p-1 rounded-md self-start md:self-auto font-mono text-xs">
            <button
              onClick={() => setShowcaseSimulationMode('2d-video')}
              className={`px-3 py-1.5 rounded-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                showcaseSimulationMode === '2d-video'
                  ? 'bg-[#c5a059] text-black font-bold shadow-sm'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>2D Video Engine</span>
            </button>

            <button
              onClick={() => setShowcaseSimulationMode('3d-mannequin')}
              className={`px-3 py-1.5 rounded-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                showcaseSimulationMode === '3d-mannequin'
                  ? 'bg-[#c5a059] text-black font-bold shadow-sm'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D 360° Mannequin</span>
            </button>
          </div>
        </div>

        {/* Quick Movement Switcher Selector Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {showcaseCuratedList.map((item) => {
            const isSelected = showcaseExerciseId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setShowcaseExerciseId(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059] font-bold shadow-md'
                    : 'bg-[#12121a] border-[#222230] text-[#999] hover:text-white hover:border-[#383850]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span className="text-[9px] px-1 py-0.2 rounded-xs bg-[#1a1a26] text-[#777] border border-[#2a2a3e]">
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Simulation Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Visualizer Window (2D Motion Video or 3D Three.js Mannequin) */}
          <div className="lg:col-span-8 bg-[#09090d] border border-[#242436] rounded-lg overflow-hidden shadow-inner flex flex-col">
            <div className="h-[380px] sm:h-[420px] w-full relative">
              {showcaseSimulationMode === '2d-video' ? (
                <ExerciseMotionVideoCanvas
                  exercise={activeShowcaseExercise}
                  isPlaying={isShowcasePlaying}
                  onTogglePlay={() => setIsShowcasePlaying(!isShowcasePlaying)}
                />
              ) : (
                <Exercise3DCanvas
                  exercise={activeShowcaseExercise}
                  isPlaying={isShowcasePlaying}
                  onTogglePlay={() => setIsShowcasePlaying(!isShowcasePlaying)}
                />
              )}
            </div>
          </div>

          {/* Alongside Real-time Biomechanics Telemetry & Quick Studio Action */}
          <div className="lg:col-span-4 bg-[#12121c] border border-[#222234] rounded-lg p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              {/* Header Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded-xs bg-[#1a1a28] text-[#c5a059] border border-[#2b2b40] font-bold uppercase">
                    {activeShowcaseExercise.category.replace('_', ' ')}
                  </span>
                  <span className="text-[#888] font-bold">{activeShowcaseExercise.difficulty}</span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white">
                  {activeShowcaseExercise.name}
                </h3>
                <p className="text-xs text-[#999] font-sans leading-relaxed line-clamp-2">
                  {activeShowcaseExercise.summary}
                </p>
              </div>

              {/* Biomechanical Telemetry */}
              <div className="space-y-2 pt-2 border-t border-[#1c1c28]">
                <div className="bg-[#0d0d14] p-2.5 rounded-md border border-[#1f1f2e] space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#888]">Target Joint Vector:</span>
                    <span className="text-[#38bdf8] font-bold">
                      {activeShowcaseExercise.biomechanicsAngle}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888]">Cadence Tempo:</span>
                    <span className="text-[#f59e0b] font-bold">
                      {activeShowcaseExercise.cadence
                        ? `${activeShowcaseExercise.cadence.down + activeShowcaseExercise.cadence.hold + activeShowcaseExercise.cadence.up}s (${activeShowcaseExercise.cadence.down}-${activeShowcaseExercise.cadence.hold}-${activeShowcaseExercise.cadence.up})`
                        : 'Continuous Flow'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#888]">Equipment:</span>
                    <span className="text-[#aaa]">
                      {activeShowcaseExercise.equipment}
                    </span>
                  </div>
                </div>

                {/* Primary Muscle Groups */}
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-mono text-[#777] uppercase tracking-wider">
                    Primary Target Muscle Focus
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {activeShowcaseExercise.primaryMuscles.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 text-[10px] font-mono rounded-xs bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30"
                      >
                        {m}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded-xs bg-[#161622] text-[#888] border border-[#242434]">
                      {activeShowcaseExercise.energyBurn || 'Full Body'}
                    </span>
                  </div>
                </div>

                {/* Clinical Form Cue */}
                <div className="bg-[#141420] p-2.5 rounded-md border border-[#222234] space-y-1">
                  <span className="text-[10px] font-mono text-[#c5a059] font-bold uppercase flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Clinical Form Key
                  </span>
                  <p className="text-[11px] text-[#ccc] font-sans leading-snug">
                    {activeShowcaseExercise.steps[0]?.tips[0] ||
                      activeShowcaseExercise.steps[0]?.instruction ||
                      activeShowcaseExercise.whatItIsDoing}
                  </p>
                </div>
              </div>
            </div>

            {/* Launch Full Studio CTA */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => onSelectExercise(activeShowcaseExercise)}
                className="w-full py-2.5 px-4 rounded-md bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer"
              >
                <span>Launch Full Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#666] px-1">
                <span>AI Voice Form Coach Ready</span>
                <span>•</span>
                <span>Live Audio Cadence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Demographic Categories Grid (The Core Navigation Hub) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Select Your Movement Category
            </h2>
            <p className="text-xs text-[#888] font-mono mt-0.5">
              Click any demographic card to open its dedicated workout catalog and safety guidelines.
            </p>
          </div>
          <span className="text-xs font-mono text-[#c5a059] hidden sm:block">
            {categoryCards.length} Specialized Hubs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryCards.map((card) => {
            const count = EXERCISE_CATALOG.filter((e) => e.category === card.id).length;
            return (
              <div
                key={card.id}
                onClick={() => onSelectCategory(card.id)}
                className={`cursor-pointer group relative bg-gradient-to-b ${card.gradient} bg-[#111118] border border-[#222230] hover:border-[#444458] rounded-lg p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  {/* Top Icon & Demographic Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl p-2 rounded-md bg-[#181824] border border-[#2a2a3c] shadow-inner">
                      {card.icon}
                    </span>
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs"
                      style={{ backgroundColor: `${card.accentColor}20`, color: card.accentColor }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-[#c5a059] transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-[11px] font-mono text-[#888] mt-0.5">
                      {card.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#9ca3af] font-sans line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>

                  {/* Sample Movements Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {card.sampleMovements.slice(0, 3).map((move) => (
                      <span
                        key={move}
                        className="text-[10px] font-mono text-[#777] bg-[#161622] px-1.5 py-0.5 rounded-xs border border-[#242434]"
                      >
                        {move}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Movement Count & Jump CTA */}
                <div className="mt-5 pt-3 border-t border-[#1c1c28] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#888]">{count} Exercises</span>
                  <span className="text-[#c5a059] group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-semibold">
                    <span>Open Hub</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured 3D Exercise Spotlight */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Featured 3D Practice Movements
            </h2>
            <p className="text-xs text-[#888] font-mono mt-0.5">
              Launch interactive 3D simulations with AI cadence timers and form guides.
            </p>
          </div>
          <button
            onClick={() => onSelectCategory('cardio')}
            className="text-xs font-mono text-[#c5a059] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredExercises.map((exercise) => {
            const isDone = completedExerciseIds.includes(exercise.id);
            const def = CATEGORY_DEFINITIONS[exercise.category] || CATEGORY_DEFINITIONS.general_health;

            return (
              <div
                key={exercise.id}
                onClick={() => onSelectExercise(exercise)}
                className="cursor-pointer group bg-[#111118] border border-[#242434] hover:border-[#c5a059]/80 rounded-lg p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs"
                      style={{ backgroundColor: `${def.color}20`, color: def.color }}
                    >
                      {def.shortLabel}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#777] bg-[#181824] px-1.5 py-0.5 rounded-xs border border-[#282836]">
                        {exercise.difficulty}
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-serif font-bold text-white group-hover:text-[#c5a059] transition-colors leading-snug">
                      {exercise.name}
                    </h3>
                    <p className="text-xs text-[#9ca3af] font-sans line-clamp-2 mt-1 leading-relaxed">
                      {exercise.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1c1c28] flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowcaseExerciseId(exercise.id);
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 text-[#38bdf8] hover:text-[#7dd3fc] transition-colors cursor-pointer"
                    title="Load simulation in home player"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Quick Preview</span>
                  </button>

                  <span className="text-[#c5a059] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-semibold">
                    <span>Practice in 3D</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Guided Workout Circuit Spotlight Banner */}
      <section className="bg-gradient-to-r from-[#181826] to-[#101016] border border-[#2c2c40] rounded-lg p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏱️</span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
              Ready for a Follow-Along Workout Circuit?
            </h3>
          </div>
          <p className="text-xs text-[#a1a1aa] font-sans leading-relaxed">
            Follow multi-exercise routines with automated work and rest interval timers, countdown audio beeps, and synchronized 3D form previews.
          </p>
        </div>

        <button
          onClick={onNavigateCircuits}
          className="px-6 py-3 rounded-md bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg flex-shrink-0 active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Workout Circuits</span>
        </button>
      </section>
    </div>
  );
};
