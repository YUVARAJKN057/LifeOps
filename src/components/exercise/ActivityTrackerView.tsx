import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Flame,
  Clock,
  Dumbbell,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Target,
  Award,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Heart,
  Smile,
  HeartHandshake,
  Shield,
  Bot,
  Layers,
  Database,
  BarChart2,
  Check,
  X,
  Play,
} from 'lucide-react';
import { EXERCISE_CATALOG, ExerciseGuide, CATEGORY_DEFINITIONS, DemographicCategory } from '../../data/exerciseCatalogData';
import { ExerciseLog } from '../../types';

interface ActivityTrackerViewProps {
  completedHistory: Array<{ exerciseId: string; timestamp: number; logId?: string }>;
  onSelectExercise: (exercise: ExerciseGuide) => void;
  onClearHistory: () => void;
  onManualLogAdded?: () => void;
}

export const ActivityTrackerView: React.FC<ActivityTrackerViewProps> = ({
  completedHistory,
  onSelectExercise,
  onClearHistory,
  onManualLogAdded,
}) => {
  const [dbLogs, setDbLogs] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'weekly' | 'history' | 'insights' | 'categories'>('weekly');
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Manual log form state
  const [manualExerciseId, setManualExerciseId] = useState<string>(EXERCISE_CATALOG[0].id);
  const [manualReps, setManualReps] = useState<number>(15);
  const [manualMinutes, setManualMinutes] = useState<number>(3);
  const [manualNotes, setManualNotes] = useState<string>('');

  // Daily target goals (customizable)
  const [dailyGoalTarget, setDailyGoalTarget] = useState({
    sessions: 3,
    minutes: 20,
    calories: 150,
  });

  // Fetch from server database
  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/exercise/logs');
      const data = await res.json();
      if (data && data.logs) {
        setDbLogs(data.logs);
      }
    } catch (err) {
      console.warn('Could not load exercise logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [completedHistory.length]);

  // Combine DB logs with localStorage logs as fallback
  const combinedLogs = useMemo(() => {
    if (dbLogs.length > 0) return dbLogs;
    return completedHistory.map((c, i) => {
      const ex = EXERCISE_CATALOG.find((e) => e.id === c.exerciseId) || EXERCISE_CATALOG[0];
      return {
        id: c.logId || `local-${i}`,
        userId: 'demo_user_1',
        exerciseId: c.exerciseId,
        exerciseName: ex.name,
        category: ex.category,
        repsCompleted: ex.targetReps || 12,
        durationSeconds: ex.targetSeconds || 45,
        caloriesBurned: Math.max(5, Math.round(((parseInt(ex.energyBurn?.replace(/[^0-9]/g, '') || '8', 10) || 8) * (ex.targetSeconds || 45)) / 60)) || 15,
        difficultyRating: 'perfect',
        notes: '',
        timestamp: new Date(c.timestamp).toISOString(),
      } as ExerciseLog;
    });
  }, [dbLogs, completedHistory]);

  // Daily Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = useMemo(() => {
    return combinedLogs.filter((log) => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      return logDate === todayStr;
    });
  }, [combinedLogs, todayStr]);

  const todaySessions = todayLogs.length;
  const todaySeconds = todayLogs.reduce((acc, l) => acc + (l.durationSeconds || 45), 0);
  const todayMinutes = Math.round(todaySeconds / 60);
  const todayCalories = todayLogs.reduce((acc, l) => acc + (l.caloriesBurned || 15), 0);

  // Weekly 7-Day Matrix Calculations
  const weeklyStats = useMemo(() => {
    const days: Array<{
      dayName: string;
      shortDay: string;
      dateStr: string;
      isToday: boolean;
      sessions: number;
      minutes: number;
      calories: number;
      isCompleted: boolean;
    }> = [];

    const now = new Date();
    // Start from Monday of this week
    const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday);

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().split('T')[0];

      const dayLogs = combinedLogs.filter((l) => {
        return new Date(l.timestamp).toISOString().split('T')[0] === dStr;
      });

      const dayMinutes = Math.round(dayLogs.reduce((acc, l) => acc + (l.durationSeconds || 45), 0) / 60);
      const dayCalories = dayLogs.reduce((acc, l) => acc + (l.caloriesBurned || 15), 0);

      days.push({
        dayName: dayNames[i],
        shortDay: dayNames[i][0],
        dateStr: dStr,
        isToday: dStr === todayStr,
        sessions: dayLogs.length,
        minutes: dayMinutes,
        calories: dayCalories,
        isCompleted: dayLogs.length >= 1,
      });
    }

    const totalWeeklyMinutes = days.reduce((acc, d) => acc + d.minutes, 0);
    const totalWeeklyCalories = days.reduce((acc, d) => acc + d.calories, 0);
    const activeDaysCount = days.filter((d) => d.sessions > 0).length;

    return { days, totalWeeklyMinutes, totalWeeklyCalories, activeDaysCount };
  }, [combinedLogs, todayStr]);

  // Streak Calculation
  const currentStreak = useMemo(() => {
    if (combinedLogs.length === 0) return 0;
    const uniqueDates = Array.from(
      new Set(combinedLogs.map((l) => new Date(l.timestamp).toISOString().split('T')[0]))
    ).sort().reverse();

    let streak = 0;
    const checkDate = new Date();

    // Check if today or yesterday was active
    const todayFormatted = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayFormatted = checkDate.toISOString().split('T')[0];

    if (!uniqueDates.includes(todayFormatted) && !uniqueDates.includes(yesterdayFormatted)) {
      return 0;
    }

    let curr = new Date();
    if (!uniqueDates.includes(todayFormatted)) {
      curr.setDate(curr.getDate() - 1);
    }

    while (true) {
      const dateKey = curr.toISOString().split('T')[0];
      if (uniqueDates.includes(dateKey)) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [combinedLogs]);

  // Category Distribution breakdown
  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    combinedLogs.forEach((l) => {
      const cat = l.category || 'general_health';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const total = combinedLogs.length || 1;
    return Object.entries(counts).map(([catKey, count]) => {
      const def = CATEGORY_DEFINITIONS[catKey as DemographicCategory] || CATEGORY_DEFINITIONS.general_health;
      return {
        key: catKey,
        label: def.label,
        color: def.color,
        count,
        percent: Math.round((count / total) * 100),
      };
    });
  }, [combinedLogs]);

  // Handle Manual Log Submission
  const handleSaveManualLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const ex = EXERCISE_CATALOG.find((e) => e.id === manualExerciseId) || EXERCISE_CATALOG[0];
    const durationSeconds = manualMinutes * 60;
    const caloriesBurned = Math.round(manualMinutes * 6.5);

    try {
      const res = await fetch('/api/exercise/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseId: ex.id,
          exerciseName: ex.name,
          category: ex.category,
          repsCompleted: manualReps,
          durationSeconds,
          caloriesBurned,
          difficultyRating: 'perfect',
          notes: manualNotes,
        }),
      });
      if (res.ok) {
        setIsManualModalOpen(false);
        setManualNotes('');
        loadLogs();
        if (onManualLogAdded) onManualLogAdded();
      }
    } catch (err) {
      console.warn('Failed to add manual log:', err);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    try {
      await fetch(`/api/exercise/log/${logId}`, { method: 'DELETE' });
      setDbLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (err) {
      console.warn('Error deleting log:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Streak & Action Button */}
      <div className="bg-[#121218] border border-[#222230] p-4 sm:p-6 rounded-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-xs bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3 h-3" />
              Biometric Telemetry & Activity Engine
            </span>
            <span className="px-2 py-0.5 rounded-xs bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Synced
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Daily & Weekly Activity Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#888] font-mono mt-1">
            Monitor real-time workout consistency, daily practice targets, weekly caloric burn, and demographic distribution.
          </p>
        </div>

        {/* Top Streak Pill + Manual Log Button */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="px-3.5 py-2 rounded-md bg-[#181824] border border-[#2e2e42] flex items-center gap-2 shadow-inner">
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-black font-bold shadow-md animate-bounce duration-1000">
              <Flame className="w-4 h-4 text-black fill-black" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white">
                {currentStreak} DAY{currentStreak === 1 ? '' : 'S'}
              </div>
              <div className="text-[9px] font-mono text-[#c5a059]">Active Streak</div>
            </div>
          </div>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-3.5 py-2.5 rounded-md bg-[#c5a059] hover:bg-[#d4b069] text-black font-mono text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Workout</span>
          </button>
        </div>
      </div>

      {/* 2. Today's Daily Target Progress Rings / Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Today's Sessions */}
        <div className="bg-[#121218] border border-[#222230] p-4 rounded-md shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider">
              Today's Sessions
            </span>
            <div className="p-1.5 rounded-xs bg-emerald-950/60 border border-emerald-800 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-white">{todaySessions}</span>
            <span className="text-xs font-mono text-[#777]">/ {dailyGoalTarget.sessions} goal</span>
          </div>

          <div className="w-full bg-[#1c1c28] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (todaySessions / dailyGoalTarget.sessions) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#666] mt-1.5">
            <span>Progress: {Math.round((todaySessions / dailyGoalTarget.sessions) * 100)}%</span>
            <span>{todaySessions >= dailyGoalTarget.sessions ? '🎯 Target Met!' : 'Keep Going'}</span>
          </div>
        </div>

        {/* Card 2: Today's Practice Time */}
        <div className="bg-[#121218] border border-[#222230] p-4 rounded-md shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider">
              Active Time Today
            </span>
            <div className="p-1.5 rounded-xs bg-sky-950/60 border border-sky-800 text-sky-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-white">{todayMinutes}m</span>
            <span className="text-xs font-mono text-[#777]">/ {dailyGoalTarget.minutes}m goal</span>
          </div>

          <div className="w-full bg-[#1c1c28] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-sky-400 transition-all duration-500"
              style={{ width: `${Math.min(100, (todayMinutes / dailyGoalTarget.minutes) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#666] mt-1.5">
            <span>{todaySeconds} total seconds</span>
            <span>{Math.round((todayMinutes / dailyGoalTarget.minutes) * 100)}% of goal</span>
          </div>
        </div>

        {/* Card 3: Today's Caloric Burn */}
        <div className="bg-[#121218] border border-[#222230] p-4 rounded-md shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#888] uppercase tracking-wider">
              Energy Burned
            </span>
            <div className="p-1.5 rounded-xs bg-amber-950/60 border border-amber-800 text-[#c5a059]">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-white">~{todayCalories}</span>
            <span className="text-xs font-mono text-[#777]">kcal / {dailyGoalTarget.calories}</span>
          </div>

          <div className="w-full bg-[#1c1c28] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-[#c5a059] transition-all duration-500"
              style={{ width: `${Math.min(100, (todayCalories / dailyGoalTarget.calories) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-[#666] mt-1.5">
            <span>Est. Metabolic Expenditure</span>
            <span>{Math.round((todayCalories / dailyGoalTarget.calories) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* 3. Weekly 7-Day Consistency Matrix (Mon - Sun) */}
      <div className="bg-[#121218] border border-[#222230] p-4 sm:p-6 rounded-md shadow-xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#c5a059]" />
              Weekly 7-Day Consistency Matrix
            </h3>
            <p className="text-xs text-[#888] font-mono">
              {weeklyStats.activeDaysCount} of 7 active days this week • {weeklyStats.totalWeeklyMinutes}m total active practice
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded-xs bg-[#181824] border border-[#2e2e40] text-[#aaa]">
              Weekly Total: <strong className="text-[#c5a059]">~{weeklyStats.totalWeeklyCalories} kcal</strong>
            </span>
          </div>
        </div>

        {/* 7-Day Grid Matrix */}
        <div className="grid grid-cols-7 gap-2">
          {weeklyStats.days.map((day) => (
            <div
              key={day.dayName}
              className={`p-3 rounded-md border text-center transition-all ${
                day.isToday
                  ? 'bg-[#181828] border-[#c5a059] shadow-md ring-1 ring-[#c5a059]/40'
                  : day.isCompleted
                  ? 'bg-[#14141e] border-[#2e2e42]'
                  : 'bg-[#0f0f15] border-[#1e1e28] opacity-70'
              }`}
            >
              <div className="text-[10px] font-mono text-[#777] uppercase font-semibold">
                {day.dayName}
              </div>

              <div className="my-2 flex items-center justify-center">
                {day.isCompleted ? (
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#161622] border border-[#262634] flex items-center justify-center text-[#555] text-xs font-mono">
                    0
                  </div>
                )}
              </div>

              <div className="text-xs font-mono font-bold text-white">
                {day.sessions > 0 ? `${day.sessions} done` : 'Rest'}
              </div>

              <div className="text-[10px] font-mono text-[#888] mt-0.5">
                {day.minutes > 0 ? `${day.minutes} min` : '-'}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Progress Bar Visualizer */}
        <div className="bg-[#0b0b10] border border-[#1e1e2a] p-4 rounded-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#aaa] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#34d399]" />
              Weekly Target Completion ({weeklyStats.activeDaysCount}/5 days recommended)
            </span>
            <span className="text-[#c5a059] font-bold">
              {Math.round((weeklyStats.activeDaysCount / 5) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#181824] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#c5a059] transition-all duration-500"
              style={{ width: `${Math.min(100, (weeklyStats.activeDaysCount / 5) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Tab Navigation: Workout History vs Category Breakdown vs Milestones */}
      <div className="border-b border-[#22222e] flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveTab('weekly')}
          className={`px-3.5 py-2 rounded-t-sm border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'weekly'
              ? 'border-[#c5a059] text-white bg-[#1a1a22]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>Weekly Distribution & Charts</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3.5 py-2 rounded-t-sm border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-[#c5a059] text-white bg-[#1a1a22]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Exercise History Logbook ({combinedLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-2 rounded-t-sm border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-[#c5a059] text-white bg-[#1a1a22]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#34d399]" />
          <span>Category Balance</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`px-3.5 py-2 rounded-t-sm border-b-2 font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'insights'
              ? 'border-[#c5a059] text-white bg-[#1a1a22]'
              : 'border-transparent text-[#888] hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#fbbf24]" />
          <span>Milestone Badges</span>
        </button>
      </div>

      {/* 5. Tab Content Views */}
      <div className="bg-[#121218] border border-[#222230] p-4 sm:p-6 rounded-md shadow-md">
        {/* TAB 1: WEEKLY CHARTS */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-serif font-bold text-white mb-1">
                Day-by-Day Workout Volume (Active Minutes)
              </h3>
              <p className="text-xs text-[#888] font-mono">
                Visualizing daily time investment across current training week.
              </p>
            </div>

            {/* Visual Custom Bar Chart */}
            <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-4 bg-[#0c0c14] border border-[#20202c] rounded-sm">
              {weeklyStats.days.map((d) => {
                const maxVal = Math.max(25, ...weeklyStats.days.map((x) => x.minutes));
                const heightPercent = d.minutes > 0 ? (d.minutes / maxVal) * 100 : 8;

                return (
                  <div key={d.dayName} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono text-[#c5a059] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.minutes}m
                    </span>
                    <div
                      className={`w-full max-w-[36px] rounded-t-sm transition-all duration-300 ${
                        d.isToday
                          ? 'bg-gradient-to-t from-[#c5a059] to-[#fbbf24]'
                          : d.minutes > 0
                          ? 'bg-gradient-to-t from-sky-600 to-sky-400'
                          : 'bg-[#181824]'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-mono text-[#888]">{d.dayName}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#151520] border border-[#252534] rounded-sm">
                <div className="text-[#888] text-[10px]">ALL-TIME SESSIONS</div>
                <div className="text-lg font-bold text-white mt-0.5">{combinedLogs.length}</div>
              </div>
              <div className="p-3 bg-[#151520] border border-[#252534] rounded-sm">
                <div className="text-[#888] text-[10px]">ALL-TIME TIME</div>
                <div className="text-lg font-bold text-sky-400 mt-0.5">
                  {Math.round(combinedLogs.reduce((acc, l) => acc + (l.durationSeconds || 45), 0) / 60)} mins
                </div>
              </div>
              <div className="p-3 bg-[#151520] border border-[#252534] rounded-sm">
                <div className="text-[#888] text-[10px]">ALL-TIME CALORIES</div>
                <div className="text-lg font-bold text-[#c5a059] mt-0.5">
                  ~{combinedLogs.reduce((acc, l) => acc + (l.caloriesBurned || 15), 0)} kcal
                </div>
              </div>
              <div className="p-3 bg-[#151520] border border-[#252534] rounded-sm">
                <div className="text-[#888] text-[10px]">DAILY COMPLETION</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">
                  {todaySessions >= dailyGoalTarget.sessions ? '100%' : `${Math.round((todaySessions / dailyGoalTarget.sessions) * 100)}%`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY LOGBOOK */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-white">
                  Chronological Practice Logs
                </h3>
                <p className="text-xs text-[#888] font-mono">
                  Recorded movement telemetry, repetitions, duration, and energy expenditure.
                </p>
              </div>

              {combinedLogs.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="px-2.5 py-1 rounded-xs bg-[#181824] hover:bg-red-950/50 border border-[#2e2e40] hover:border-red-800 text-[10px] font-mono text-[#888] hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Logs</span>
                </button>
              )}
            </div>

            {combinedLogs.length === 0 ? (
              <div className="py-12 text-center space-y-2 border border-dashed border-[#242434] rounded-sm bg-[#0e0e14]">
                <Dumbbell className="w-8 h-8 text-[#555] mx-auto" />
                <p className="text-xs text-[#888] font-mono">No workout sessions recorded yet.</p>
                <p className="text-[11px] text-[#666] font-mono">
                  Complete any exercise in the 3D Studio or click "Log Workout" above.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {combinedLogs.map((log) => {
                  const ex = EXERCISE_CATALOG.find((e) => e.id === log.exerciseId);
                  const catDef = CATEGORY_DEFINITIONS[log.category as DemographicCategory] || CATEGORY_DEFINITIONS.general_health;

                  return (
                    <div
                      key={log.id}
                      className="p-3 bg-[#151520] border border-[#262638] rounded-sm flex items-center justify-between gap-3 hover:border-[#383850] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xs flex items-center justify-center text-sm flex-shrink-0"
                          style={{ backgroundColor: `${catDef.color}20`, color: catDef.color }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-white">
                              {log.exerciseName}
                            </span>
                            <span
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs border"
                              style={{
                                backgroundColor: `${catDef.color}15`,
                                color: catDef.color,
                                borderColor: `${catDef.color}40`,
                              }}
                            >
                              {catDef.shortLabel}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] font-mono text-[#888] mt-0.5">
                            <span>{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span>{log.repsCompleted ? `${log.repsCompleted} reps` : `${log.durationSeconds}s`}</span>
                            <span>•</span>
                            <span className="text-[#c5a059]">~{log.caloriesBurned} kcal</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {ex && (
                          <button
                            onClick={() => onSelectExercise(ex)}
                            className="px-2.5 py-1 rounded-xs bg-[#1e1e2c] hover:bg-[#28283c] border border-[#333348] text-[10px] font-mono text-white flex items-center gap-1 transition-colors"
                          >
                            <Play className="w-2.5 h-2.5 text-[#c5a059]" />
                            <span>Practice</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-1 rounded-xs text-[#666] hover:text-red-400 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CATEGORY BALANCE */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-white">
                Demographic & Movement Category Distribution
              </h3>
              <p className="text-xs text-[#888] font-mono">
                Ensuring well-rounded training balance across kids, seniors, everyday health, cardio, strength, core, and mobility.
              </p>
            </div>

            <div className="space-y-3">
              {categoryDistribution.map((cat) => (
                <div key={cat.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.label}
                    </span>
                    <span className="text-[#888]">
                      {cat.count} sessions ({cat.percent}%)
                    </span>
                  </div>

                  <div className="w-full bg-[#181824] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MILESTONE BADGES */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-white">
                Achievements & Kinetic Badges
              </h3>
              <p className="text-xs text-[#888] font-mono">
                Milestones unlocked based on practice streak, repetition volume, and consistency.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Badge 1: Starter */}
              <div className={`p-3 rounded-md border flex items-center gap-3 ${combinedLogs.length >= 1 ? 'bg-[#161622] border-[#c5a059]/40' : 'bg-[#0f0f15] border-[#1e1e28] opacity-50'}`}>
                <div className="w-10 h-10 rounded-md bg-[#c5a059]/20 border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059]">
                  <Trophy className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white">First Step</div>
                  <div className="text-[10px] text-[#888]">Logged 1st movement session</div>
                  <div className="text-[9px] font-mono text-emerald-400 mt-0.5">
                    {combinedLogs.length >= 1 ? '✓ Unlocked' : 'In Progress'}
                  </div>
                </div>
              </div>

              {/* Badge 2: Consistency Champion */}
              <div className={`p-3 rounded-md border flex items-center gap-3 ${weeklyStats.activeDaysCount >= 3 ? 'bg-[#161622] border-[#38bdf8]/40' : 'bg-[#0f0f15] border-[#1e1e28] opacity-50'}`}>
                <div className="w-10 h-10 rounded-md bg-sky-950 border border-sky-700 flex items-center justify-center text-sky-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white">Consistency Hero</div>
                  <div className="text-[10px] text-[#888]">3+ Active days this week</div>
                  <div className="text-[9px] font-mono text-emerald-400 mt-0.5">
                    {weeklyStats.activeDaysCount >= 3 ? '✓ Unlocked' : `${weeklyStats.activeDaysCount}/3 days`}
                  </div>
                </div>
              </div>

              {/* Badge 3: Century Club */}
              <div className={`p-3 rounded-md border flex items-center gap-3 ${combinedLogs.length >= 10 ? 'bg-[#161622] border-[#34d399]/40' : 'bg-[#0f0f15] border-[#1e1e28] opacity-50'}`}>
                <div className="w-10 h-10 rounded-md bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-white">Kinetic Master</div>
                  <div className="text-[10px] text-[#888]">10+ completed workouts</div>
                  <div className="text-[9px] font-mono text-emerald-400 mt-0.5">
                    {combinedLogs.length >= 10 ? '✓ Unlocked' : `${combinedLogs.length}/10 sessions`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Manual Workout Logging Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#0e0e14] border border-[#262636] rounded-md shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#14141c] border-b border-[#22222e] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
                  <Plus className="w-4 h-4 text-[#c5a059]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Manual Workout Entry</h3>
                  <p className="text-[10px] font-mono text-[#888]">Log an offline or customized training session.</p>
                </div>
              </div>

              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1.5 text-[#777] hover:text-white rounded-xs hover:bg-[#20202c]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveManualLog} className="p-4 sm:p-6 space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#aaa] mb-1">Select Exercise:</label>
                <select
                  value={manualExerciseId}
                  onChange={(e) => setManualExerciseId(e.target.value)}
                  className="w-full bg-[#161622] border border-[#2c2c3e] rounded-xs px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
                >
                  {EXERCISE_CATALOG.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#aaa] mb-1">Reps / Rounds:</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={manualReps}
                    onChange={(e) => setManualReps(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#161622] border border-[#2c2c3e] rounded-xs px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div>
                  <label className="block text-[#aaa] mb-1">Minutes Active:</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={manualMinutes}
                    onChange={(e) => setManualMinutes(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#161622] border border-[#2c2c3e] rounded-xs px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#aaa] mb-1">Personal Notes (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Great form, felt energized"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full bg-[#161622] border border-[#2c2c3e] rounded-xs px-3 py-2 text-white focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="pt-3 border-t border-[#22222e] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xs bg-[#1a1a24] hover:bg-[#222230] text-[#aaa] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xs bg-[#c5a059] hover:bg-[#d4b069] text-black font-bold"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
