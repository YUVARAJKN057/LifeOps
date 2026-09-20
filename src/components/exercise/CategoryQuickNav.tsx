import React from 'react';
import { DemographicCategory, CATEGORY_DEFINITIONS } from '../../data/exerciseCatalogData';
import { ChevronRight, Sparkles, HeartHandshake, Smile, Shield, Flame, Dumbbell, Zap, Layers } from 'lucide-react';

interface CategoryQuickNavProps {
  activeCategory?: DemographicCategory;
  onSelectCategory: (category: DemographicCategory) => void;
  title?: string;
  variant?: 'pills' | 'compact' | 'bar' | 'grid';
  showCount?: boolean;
  className?: string;
}

export const CategoryQuickNav: React.FC<CategoryQuickNavProps> = ({
  activeCategory,
  onSelectCategory,
  title = 'Direct Category Access',
  variant = 'bar',
  showCount = true,
  className = '',
}) => {
  const categories: Array<{
    id: DemographicCategory;
    name: string;
    shortLabel: string;
    icon: string;
    badge: string;
    color: string;
  }> = [
    { id: 'kids', name: 'Kids & Youth', shortLabel: 'Kids', icon: '🧒', badge: 'Fun & Play', color: '#f59e0b' },
    { id: 'seniors', name: 'Aged & Senior Vitality', shortLabel: 'Seniors', icon: '👵', badge: 'Gentle & Joint', color: '#10b981' },
    { id: 'general_health', name: 'General Health & Desk', shortLabel: 'Desk Reset', icon: '✨', badge: 'Ergonomic', color: '#0ea5e9' },
    { id: 'cardio', name: 'Cardio & Speed Skipping', shortLabel: 'Cardio', icon: '⚡', badge: 'High Burn', color: '#eab308' },
    { id: 'strength', name: 'Strength & Bodyweight', shortLabel: 'Strength', icon: '💪', badge: 'Hypertrophy', color: '#8b5cf6' },
    { id: 'core', name: 'Core & Spine Shield', shortLabel: 'Core Shield', icon: '🛡️', badge: 'Lumbar Safe', color: '#3b82f6' },
    { id: 'mobility', name: 'Mobility & Joint Longevity', shortLabel: 'Mobility', icon: '🧘', badge: 'Decompress', color: '#14b8a6' },
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono ${className}`}>
        <span className="text-[#777] text-[11px] whitespace-nowrap pl-1 flex items-center gap-1">
          <span>Jump to:</span>
        </span>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-[#c5a059] text-black font-bold shadow-md ring-1 ring-[#c5a059]'
                  : 'bg-[#14141e] hover:bg-[#1f1f2e] text-[#ccc] hover:text-white border border-[#242436]'
              }`}
              title={`Open ${cat.name} Page`}
            >
              <span>{cat.icon}</span>
              <span>{cat.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`bg-[#0d0d14] border border-[#20202e] rounded-lg p-3.5 sm:p-4 shadow-md ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">🧭</span>
          <span className="text-xs font-mono uppercase tracking-wider text-[#bbb] font-bold">
            {title}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#777] hidden sm:inline">
          Switch to any specialized demographic page instantly
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group flex flex-col items-center justify-center p-2.5 rounded-md text-center transition-all cursor-pointer select-none relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-b from-[#2a2418] to-[#1a1710] border border-[#c5a059] shadow-md ring-1 ring-[#c5a059]/50'
                  : 'bg-[#12121b] hover:bg-[#1a1a26] border border-[#222232] hover:border-[#38384e]'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 left-0 h-0.5 bg-[#c5a059]" />
              )}
              <span className="text-xl mb-1 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className={`text-xs font-serif font-bold truncate max-w-full ${isActive ? 'text-[#c5a059]' : 'text-white group-hover:text-[#c5a059]'}`}>
                {cat.shortLabel}
              </span>
              <span className="text-[9px] font-mono text-[#777] mt-0.5 truncate max-w-full">
                {cat.badge}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
