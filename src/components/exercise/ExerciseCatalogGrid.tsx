import React, { useState } from 'react';
import {
  Flame,
  Search,
  Filter,
  Dumbbell,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Clock,
  Zap,
  Layers,
  ChevronRight,
  Eye,
  Award,
  Smile,
  HeartHandshake,
  Shield,
  Bot,
  Box,
} from 'lucide-react';
import { ExerciseGuide, CATEGORY_DEFINITIONS, DemographicCategory } from '../../data/exerciseCatalogData';
import { NavbarTab } from './ExerciseNavbar';

interface ExerciseCatalogGridProps {
  exercises: ExerciseGuide[];
  activeCategoryTab: NavbarTab;
  onSelectExercise: (exercise: ExerciseGuide) => void;
  selectedExerciseId: string;
  onQuickComplete: (exercise: ExerciseGuide) => void;
  completedExerciseIds: string[];
}

export const ExerciseCatalogGrid: React.FC<ExerciseCatalogGridProps> = ({
  exercises,
  activeCategoryTab,
  onSelectExercise,
  selectedExerciseId,
  onQuickComplete,
  completedExerciseIds,
}) => {
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Beginner' | 'Intermediate' | 'All Levels'>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<'all' | 'bodyweight' | 'equipment'>('all');

  // Filter exercises
  const filteredList = exercises.filter((ex) => {
    // Category check
    const matchesCategory =
      activeCategoryTab === 'all' ||
      activeCategoryTab === 'circuits' ||
      activeCategoryTab === 'stats' ||
      ex.category === activeCategoryTab;

    // Difficulty check
    const matchesDifficulty = difficultyFilter === 'all' || ex.difficulty === difficultyFilter;

    // Equipment check
    const isNoEquip =
      ex.equipment.toLowerCase().includes('bodyweight') ||
      ex.equipment.toLowerCase().includes('mat') ||
      ex.equipment.toLowerCase().includes('floor') ||
      ex.equipment.toLowerCase().includes('open');
    const matchesEquip =
      equipmentFilter === 'all' ||
      (equipmentFilter === 'bodyweight' && isNoEquip) ||
      (equipmentFilter === 'equipment' && !isNoEquip);

    return matchesCategory && matchesDifficulty && matchesEquip;
  });

  const getCategoryHeader = () => {
    if (activeCategoryTab !== 'all' && activeCategoryTab !== 'circuits' && activeCategoryTab !== 'stats') {
      const def = CATEGORY_DEFINITIONS[activeCategoryTab as DemographicCategory];
      if (def) {
        return {
          title: `${def.label}`,
          badge: def.badge,
          desc: def.description,
          tagline: def.tagline,
          color: def.color,
        };
      }
    }

    return {
      title: 'Complete 3D Kinetic Movement Catalog',
      badge: 'All Demographics',
      desc: 'Doctor-informed, age-appropriate, and athletic exercises with interactive 3D simulations and AI voice guidance.',
      tagline: 'Select any category above to filter specialized workouts for Kids, Expecting Mothers, Seniors, and Athletes.',
      color: '#c5a059',
    };
  };

  const catHeader = getCategoryHeader();

  return (
    <div className="space-y-6">
      {/* Category Banner & Filter Bar */}
      <div className="bg-[#101015] border border-[#20202a] p-4 sm:p-5 rounded-md shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-tight">
                {catHeader.title}
              </h2>
              <span
                className="px-2 py-0.5 rounded-xs text-[11px] font-mono font-bold uppercase tracking-wider"
                style={{ backgroundColor: `${catHeader.color}25`, color: catHeader.color }}
              >
                {catHeader.badge}
              </span>
            </div>
            <p className="text-xs text-[#a1a1aa] font-sans leading-relaxed max-w-2xl">
              {catHeader.desc}
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1 bg-[#161620] p-1 rounded-sm border border-[#282834]">
              <span className="text-[#666] px-1 text-[11px]">Level:</span>
              {(['all', 'Beginner', 'Intermediate'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficultyFilter(lvl)}
                  className={`px-2 py-0.5 rounded-xs transition-all ${
                    difficultyFilter === lvl
                      ? 'bg-[#c5a059] text-black font-bold'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  {lvl === 'all' ? 'All' : lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-[#161620] p-1 rounded-sm border border-[#282834]">
              <span className="text-[#666] px-1 text-[11px]">Equip:</span>
              {(['all', 'bodyweight'] as const).map((eq) => (
                <button
                  key={eq}
                  onClick={() => setEquipmentFilter(eq)}
                  className={`px-2 py-0.5 rounded-xs transition-all ${
                    equipmentFilter === eq
                      ? 'bg-[#c5a059] text-black font-bold'
                      : 'text-[#888] hover:text-white'
                  }`}
                >
                  {eq === 'all' ? 'All' : 'No-Equipment'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exercises Grid */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-[#111116] border border-[#22222a] rounded-md space-y-2">
          <p className="text-white font-mono text-sm">No exercises found matching your filter criteria.</p>
          <button
            onClick={() => {
              setDifficultyFilter('all');
              setEquipmentFilter('all');
            }}
            className="text-xs font-mono text-[#c5a059] underline hover:text-[#e0c07d]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((exercise) => {
            const isSelected = selectedExerciseId === exercise.id;
            const isDone = completedExerciseIds.includes(exercise.id);
            const def = CATEGORY_DEFINITIONS[exercise.category] || CATEGORY_DEFINITIONS.general_health;

            return (
              <div
                key={exercise.id}
                onClick={() => onSelectExercise(exercise)}
                className={`cursor-pointer group relative bg-[#121217] border rounded-md p-4 sm:p-5 transition-all flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 ${
                  isSelected
                    ? 'border-[#c5a059] bg-[#161620] ring-1 ring-[#c5a059]/40'
                    : 'border-[#22222a] hover:border-[#3d3d4d]'
                }`}
              >
                {/* Card Header & Demographics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs flex items-center gap-1"
                      style={{ backgroundColor: `${def.color}15`, color: def.color, border: `1px solid ${def.color}40` }}
                    >
                      {exercise.category === 'kids' && <Smile className="w-3 h-3" />}
                      {exercise.category === 'seniors' && <Shield className="w-3 h-3" />}
                      {exercise.category === 'general_health' && <Sparkles className="w-3 h-3" />}
                      {def.shortLabel}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#777] bg-[#181822] px-1.5 py-0.5 rounded-xs border border-[#282834]">
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

                  {/* Title & Summary */}
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-[#c5a059] transition-colors leading-snug">
                      {exercise.name}
                    </h3>
                    <p className="text-xs text-[#9ca3af] font-sans line-clamp-2 mt-1 leading-relaxed">
                      {exercise.whatItIsDoing || exercise.summary}
                    </p>
                  </div>
                </div>

                {/* Card Footer: 3D Simulator Badge, AI Voice, Muscles */}
                <div className="pt-4 mt-4 border-t border-[#1c1c24] space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#777]">
                    <div className="flex items-center gap-1 text-[#38bdf8]">
                      <Box className="w-3 h-3" />
                      <span>3D Simulation</span>
                    </div>

                    <div className="flex items-center gap-1 text-[#c5a059]">
                      <Bot className="w-3 h-3" />
                      <span>AI Voice Coach</span>
                    </div>

                    <div className="flex items-center gap-1 text-[#fbbf24]">
                      <Flame className="w-3 h-3" />
                      <span>{exercise.energyBurn}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#888] truncate max-w-[70%]">
                      <span className="text-[#555]">Target:</span>
                      <span className="truncate text-[#aaa]">{exercise.primaryMuscles.slice(0, 2).join(', ')}</span>
                    </div>

                    <span className="text-xs font-mono text-[#c5a059] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      <span>Practice</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
