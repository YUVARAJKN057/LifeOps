import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  CheckSquare,
  Target,
  Flame,
  IndianRupee,
  Sparkles,
  Plus,
  BarChart3,
  Camera,
  Activity,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tasks,
    goals,
    habits,
    expenses,
    setActiveTab,
    openQuickAdd,
    openExerciseCoach,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  // Compute search results across all modules
  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();

    // Default quick action list when query is empty
    if (!q) {
      return [
        {
          id: 'action-quick-exercise',
          type: 'Action',
          title: 'Exercise Coach & Camera Verification',
          subtitle: 'Step-by-step kinetic tutorial with real-time camera rep verification',
          icon: <Camera className="w-3.5 h-3.5 text-emerald-400" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            openExerciseCoach('squat');
          },
        },
        {
          id: 'action-quick-task',
          type: 'Action',
          title: 'Draft Directive',
          subtitle: 'Create a new task in your LifeOps ledger',
          icon: <Plus className="w-3.5 h-3.5 text-[#c5a059]" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            openQuickAdd('task');
          },
        },
        {
          id: 'action-quick-goal',
          type: 'Action',
          title: 'Establish Objective',
          subtitle: 'Define a high-conviction strategic goal',
          icon: <Target className="w-3.5 h-3.5 text-[#c5a059]" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            openQuickAdd('goal');
          },
        },
        {
          id: 'action-quick-habit',
          type: 'Action',
          title: 'Initiate Ritual',
          subtitle: 'Track a new daily discipline routine',
          icon: <Flame className="w-3.5 h-3.5 text-[#c5a059]" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            openQuickAdd('habit');
          },
        },
        {
          id: 'action-quick-expense',
          type: 'Action',
          title: 'Log Capital Outflow (₹)',
          subtitle: 'Record personal treasury expenditure in INR',
          icon: <IndianRupee className="w-3.5 h-3.5 text-[#c5a059]" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            openQuickAdd('expense');
          },
        },
        {
          id: 'nav-ai',
          type: 'Navigation',
          title: 'Consult Neural Oracle',
          subtitle: 'Synthesize optimal daily plan and schedule',
          icon: <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            setActiveTab('ai');
          },
        },
        {
          id: 'nav-analytics',
          type: 'Navigation',
          title: 'Yield Index Analytics',
          subtitle: 'Inspect velocity, consistency & outflow charts',
          icon: <BarChart3 className="w-3.5 h-3.5 text-[#c5a059]" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            setActiveTab('analytics');
          },
        },
      ];
    }

    const results: Array<{
      id: string;
      type: string;
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      action: () => void;
    }> = [];

    // Filter Tasks
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))) {
        results.push({
          id: `task-${t.id}`,
          type: 'Directive',
          title: t.title,
          subtitle: `Priority: ${t.priority.toUpperCase()} | Status: ${t.status}`,
          icon: <CheckSquare className="w-3.5 h-3.5 text-[#c5a059]" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            setActiveTab('tasks');
          },
        });
      }
    });

    // Filter Goals
    goals.forEach((g) => {
      if (g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q))) {
        results.push({
          id: `goal-${g.id}`,
          type: 'Objective',
          title: g.title,
          subtitle: `Progress: ${g.progress}% | Category: ${g.category}`,
          icon: <Target className="w-3.5 h-3.5 text-[#c5a059]" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            setActiveTab('goals');
          },
        });
      }
    });

    // Filter Habits
    habits.forEach((h) => {
      if (h.name.toLowerCase().includes(q) || (h.description && h.description.toLowerCase().includes(q))) {
        results.push({
          id: `habit-${h.id}`,
          type: 'Ritual',
          title: h.name,
          subtitle: `Streak: ${h.streak}d | Target: ${h.targetDaysPerWeek}x/wk`,
          icon: <Flame className="w-3.5 h-3.5 text-[#c5a059]" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            setActiveTab('habits');
          },
        });
      }
    });

    // Filter Expenses
    expenses.forEach((e) => {
      if (e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) {
        results.push({
          id: `expense-${e.id}`,
          type: 'Outflow',
          title: `${e.description} (₹${e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`,
          subtitle: `Category: ${e.category} | Date: ${e.date}`,
          icon: <IndianRupee className="w-3.5 h-3.5 text-[#c5a059]" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            setActiveTab('expenses');
          },
        });
      }
    });

    // Match Exercises
    const exerciseCatalog = [
      { id: 'squat', title: 'Bodyweight Squats Tutorial & Verification', subtitle: 'Target: 10 reps | Kinetic form check with real-time camera tracking' },
      { id: 'pushup', title: 'Standard Push-Ups Form Check', subtitle: 'Target: 8 reps | Chest & triceps optical verification' },
      { id: 'plank', title: 'Core Isometric Plank', subtitle: 'Target: 45s | Static posture stability timer & verification' },
      { id: 'desk_stretch', title: 'Ergonomic Desk & Neck Stretch', subtitle: 'Target: 6 reps | Cervical & thoracic decompression sequence' },
    ];

    exerciseCatalog.forEach((ex) => {
      if (
        ex.title.toLowerCase().includes(q) ||
        ex.subtitle.toLowerCase().includes(q) ||
        'exercise workout fitness camera video tutorial coach'.includes(q)
      ) {
        results.push({
          id: `exercise-${ex.id}`,
          type: 'Exercise AI',
          title: ex.title,
          subtitle: ex.subtitle,
          icon: <Camera className="w-3.5 h-3.5 text-emerald-400" />,
          action: () => {
            setIsCommandPaletteOpen(false);
            openExerciseCoach(ex.id);
          },
        });
      }
    });

    return results;
  }, [query, tasks, goals, habits, expenses, setActiveTab, openQuickAdd, openExerciseCoach, setIsCommandPaletteOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        filteredResults[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setIsCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      id="lifeops-command-palette-overlay"
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/85 backdrop-blur-md"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        id="lifeops-command-palette"
        className="w-full max-w-xl bg-[#080808] border border-[#c5a059]/40 rounded-sm shadow-2xl overflow-hidden backdrop-blur-2xl animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#1a1a1a] bg-[#050505]">
          <Search className="w-4 h-4 text-[#7a7a7a] mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-search-input"
            type="text"
            placeholder="Type a command, query directives, objectives, rituals..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-white placeholder-[#555] text-xs focus:outline-none"
          />
          <div className="flex items-center gap-1 text-[9px] font-mono text-[#555] border border-[#1a1a1a] px-1.5 py-0.5 rounded-sm">
            ESC
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#141414]/50">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-[#555]">
              <p className="text-xs font-serif italic text-white">No matches identified</p>
              <p className="text-[10px] text-[#7a7a7a] mt-1 font-light">Try searching for tasks, goals, habits, or expenses</p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  id={`command-item-${idx}`}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-sm cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#111] text-white border-l-2 border-[#c5a059]' : 'text-[#999] hover:bg-[#0c0c0c]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-sm border ${isSelected ? 'bg-[#181818] border-[#c5a059]/40' : 'bg-[#0a0a0a] border-[#1a1a1a]'}`}>
                      {item.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-medium text-white truncate">{item.title}</div>
                      <div className="text-[10px] text-[#7a7a7a] truncate font-light">{item.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest font-mono text-[#555] ml-2 flex-shrink-0">
                    {item.type}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#1a1a1a] bg-[#050505] flex items-center justify-between text-[9px] text-[#555] font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>AURELIAN COMMAND MESH</span>
        </div>
      </div>
    </div>
  );
};
