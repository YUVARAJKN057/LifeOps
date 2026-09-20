import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  Dumbbell,
  CheckCircle2,
  Sparkles,
  Flame,
  Clock,
  Zap,
  Box,
  Bot,
  ChevronRight,
  ShieldCheck,
  Smile,
  HeartHandshake,
  Shield,
  Layers,
  Info,
} from 'lucide-react';
import {
  DemographicCategory,
  ExerciseGuide,
  CATEGORY_DEFINITIONS,
} from '../../data/exerciseCatalogData';
import { CategoryQuickNav } from './CategoryQuickNav';

interface CategoryPageViewProps {
  category: DemographicCategory;
  exercises: ExerciseGuide[];
  onBackToHome: () => void;
  onSelectExercise: (exercise: ExerciseGuide) => void;
  onQuickComplete: (exercise: ExerciseGuide) => void;
  completedExerciseIds: string[];
  onSelectOtherCategory: (category: DemographicCategory) => void;
}

export const CategoryPageView: React.FC<CategoryPageViewProps> = ({
  category,
  exercises,
  onBackToHome,
  onSelectExercise,
  onQuickComplete,
  completedExerciseIds,
  onSelectOtherCategory,
}) => {
  const [levelFilter, setLevelFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'All Levels'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<'all' | 'bodyweight' | 'equipment'>('all');
  const [categorySearch, setCategorySearch] = useState<string>('');

  const catDef = CATEGORY_DEFINITIONS[category] || CATEGORY_DEFINITIONS.general_health;

  // Filter exercises within this category
  const filteredList = exercises.filter((ex) => {
    const matchesLevel = levelFilter === 'all' || ex.difficulty === levelFilter;
    const isNoEquip =
      ex.equipment.toLowerCase().includes('bodyweight') ||
      ex.equipment.toLowerCase().includes('mat') ||
      ex.equipment.toLowerCase().includes('floor') ||
      ex.equipment.toLowerCase().includes('chair') ||
      ex.equipment.toLowerCase().includes('open');
    const matchesEquip =
      equipmentFilter === 'all' ||
      (equipmentFilter === 'bodyweight' && isNoEquip) ||
      (equipmentFilter === 'equipment' && !isNoEquip);

    const matchesSearch =
      !categorySearch.trim() ||
      ex.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      ex.summary.toLowerCase().includes(categorySearch.toLowerCase()) ||
      ex.whatItIsDoing.toLowerCase().includes(categorySearch.toLowerCase()) ||
      ex.primaryMuscles.some((m) => m.toLowerCase().includes(categorySearch.toLowerCase()));

    return matchesLevel && matchesEquip && matchesSearch;
  });

  const otherCategories: DemographicCategory[] = (
    ['kids', 'seniors', 'general_health', 'cardio', 'strength', 'core', 'mobility'] as DemographicCategory[]
  ).filter((c) => c !== category);

  return (
    <div className="space-y-8">
      {/* 1. Breadcrumb & Navigation Back Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-[#13131c] hover:bg-[#1c1c28] border border-[#262638] text-xs font-mono text-[#ccc] hover:text-white transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-[#c5a059] group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Previous Page</span>
        </button>

        <div className="text-xs font-mono text-[#777] hidden sm:block">
          <span>Home</span> &gt; <span className="text-white font-semibold">{catDef.label}</span>
        </div>
      </div>

      {/* 1.5 Direct Category Quick Access Strip */}
      <CategoryQuickNav
        activeCategory={category}
        onSelectCategory={onSelectOtherCategory}
        variant="compact"
      />

      {/* 2. Category Header Hero Banner */}
      <div className="bg-gradient-to-b from-[#161622] to-[#0e0e16] border border-[#28283c] p-6 sm:p-8 rounded-lg shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5"
                style={{ backgroundColor: `${catDef.color}25`, color: catDef.color, border: `1px solid ${catDef.color}50` }}
              >
                {category === 'kids' && <Smile className="w-4 h-4" />}
                {category === 'seniors' && <Shield className="w-4 h-4" />}
                {category === 'general_health' && <Sparkles className="w-4 h-4" />}
                {catDef.badge}
              </span>

              <span className="text-xs font-mono text-[#888] bg-[#1a1a28] px-2.5 py-1 rounded-md border border-[#2e2e42]">
                {exercises.length} Specialized Movements
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#888]">
              <span className="text-[#38bdf8] flex items-center gap-1">
                <Box className="w-3.5 h-3.5" />
                3D Interactive Mode
              </span>
              <span>•</span>
              <span className="text-[#c5a059] flex items-center gap-1">
                <Bot className="w-3.5 h-3.5" />
                AI Voice Narration
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
              {catDef.label}
            </h1>
            <p className="text-xs sm:text-sm font-mono text-[#c5a059] mt-1 font-medium">
              {catDef.tagline}
            </p>
          </div>

          <p className="text-sm text-[#a1a1aa] font-sans leading-relaxed max-w-3xl">
            {catDef.description}
          </p>

          {/* Demographic Safety Highlights */}
          <div className="p-3.5 bg-[#101018] border border-[#242436] rounded-md flex items-start gap-3 text-xs font-mono text-[#aaa]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-white font-semibold">Safety & Doctor Guidance: </span>
              <span>
                {category === 'kids' && 'Prioritize playful motor exploration and spatial coordination over heavy loads or rigid repetition.'}
                {category === 'seniors' && 'Focus on joint longevity, gentle chair stability, slow controlled tempos, and fall prevention.'}
                {category === 'general_health' && 'Designed for office workers and daily wellness to relieve thoracic stiffness and maintain spinal health.'}
                {category === 'cardio' && 'Land softly on the balls of your feet, maintain an upright spine, and breathe rhythmically.'}
                {category === 'strength' && 'Focus on deep range of motion, eccentric control, and core bracing.'}
                {category === 'core' && 'Maintain neutral lumbar curvature, brace the abdominal wall, and avoid neck pulling.'}
                {category === 'mobility' && 'Sink into deep stretches on exhalation without bouncing or forcing end-ranges.'}
                {category === 'creative' && 'Coordinate kinetic chain rotation from the ground up through the hips and shoulders.'}
              </span>
            </div>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ backgroundColor: catDef.color }}
        />
      </div>

      {/* 3. Filter & Search Controls Bar */}
      <div className="bg-[#111118] border border-[#222230] p-4 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#777]" />
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder={`Search within ${catDef.shortLabel}...`}
            className="w-full bg-[#161622] border border-[#2a2a3c] rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#c5a059] transition-colors"
          />
        </div>

        {/* Right: Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 bg-[#161622] p-1 rounded-md border border-[#2a2a3c]">
            <span className="text-[#777] px-1 text-[11px]">Level:</span>
            {(['all', 'Beginner', 'Intermediate'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-xs transition-all ${
                  levelFilter === lvl ? 'bg-[#c5a059] text-black font-bold' : 'text-[#888] hover:text-white'
                }`}
              >
                {lvl === 'all' ? 'All' : lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#161622] p-1 rounded-md border border-[#2a2a3c]">
            <span className="text-[#777] px-1 text-[11px]">Equip:</span>
            {(['all', 'bodyweight'] as const).map((eq) => (
              <button
                key={eq}
                onClick={() => setEquipmentFilter(eq)}
                className={`px-2.5 py-1 rounded-xs transition-all ${
                  equipmentFilter === eq ? 'bg-[#c5a059] text-black font-bold' : 'text-[#888] hover:text-white'
                }`}
              >
                {eq === 'all' ? 'All' : 'No-Equipment'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3.5 Recommended Flow for this Category */}
      {!categorySearch.trim() && exercises.length >= 2 && (
        <div className="bg-[#12121a] border border-[#262638] rounded-lg p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a059]" />
              <span className="text-xs sm:text-sm font-serif font-bold text-white">
                Recommended Routine Flow for {catDef.shortLabel}
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#888]">
              Step 1 → Step 2 → Step 3
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {exercises.slice(0, 3).map((recEx, idx) => (
              <div
                key={recEx.id}
                onClick={() => onSelectExercise(recEx)}
                className="group/rec bg-[#171724] border border-[#2b2b3e] hover:border-[#c5a059] p-3 rounded-md cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#c5a059] font-bold">
                      Sequence #{idx + 1}
                    </span>
                    <span className="text-[#777]">{recEx.difficulty}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-serif font-bold text-white group-hover/rec:text-[#c5a059] transition-colors line-clamp-1">
                    {recEx.name}
                  </h4>
                  <p className="text-[11px] text-[#888] font-sans line-clamp-2">
                    {recEx.whatItIsDoing || recEx.summary}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#222234] flex items-center justify-between text-[10px] font-mono text-[#38bdf8]">
                  <span className="flex items-center gap-1">
                    <Box className="w-3 h-3" />
                    3D Simulation
                  </span>
                  <ChevronRight className="w-3 h-3 text-[#c5a059] group-hover/rec:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Exercises Grid */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-[#111118] border border-[#222230] rounded-md space-y-2">
          <p className="text-white font-mono text-sm">No exercises found matching your filter criteria.</p>
          <button
            onClick={() => {
              setLevelFilter('all');
              setEquipmentFilter('all');
              setCategorySearch('');
            }}
            className="text-xs font-mono text-[#c5a059] underline hover:text-[#e0c07d]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((exercise) => {
            const isDone = completedExerciseIds.includes(exercise.id);

            return (
              <div
                key={exercise.id}
                className="group bg-[#111118] border border-[#242436] hover:border-[#c5a059]/70 rounded-lg p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
              >
                {/* Header & Badges */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-[#888] bg-[#181826] px-2 py-0.5 rounded-xs border border-[#2a2a3e]">
                      {exercise.difficulty}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#fbbf24] bg-amber-950/30 border border-amber-800/40 px-2 py-0.5 rounded-xs flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {exercise.energyBurn}
                      </span>
                      {isDone && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Done
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & What it is doing */}
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-[#c5a059] transition-colors leading-snug">
                      {exercise.name}
                    </h3>
                    <p className="text-xs text-[#9ca3af] font-sans line-clamp-2 mt-1 leading-relaxed">
                      {exercise.whatItIsDoing || exercise.summary}
                    </p>
                  </div>

                  {/* Target muscles */}
                  <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono text-[#888] pt-1">
                    <span className="text-[#555]">Target:</span>
                    {exercise.primaryMuscles.slice(0, 3).map((m) => (
                      <span key={m} className="px-1.5 py-0.5 bg-[#181826] text-[#c5a059] rounded-xs border border-[#2a2a3e]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions: Launch 3D Practice Studio */}
                <div className="mt-5 pt-3 border-t border-[#1c1c28] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectExercise(exercise)}
                    className="w-full py-2.5 rounded-md bg-[#c5a059] hover:bg-[#d8b56f] text-black font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Practice in 3D</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Jump to Other Categories Ribbon */}
      <div className="pt-6 border-t border-[#1f1f2e]">
        <CategoryQuickNav
          activeCategory={category}
          onSelectCategory={onSelectOtherCategory}
          title="Direct Portals to Other Categories"
        />
      </div>
    </div>
  );
};
