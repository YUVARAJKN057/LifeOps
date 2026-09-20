import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  Target,
  Flame,
  IndianRupee,
  Sparkles,
  ArrowRight,
  Clock,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Zap,
  Plus,
  Play,
  Info,
  Shield,
  Activity,
  Layers,
  Camera,
} from 'lucide-react';
import { ProductivityOrb } from '../common/ProductivityOrb';
import { GoalProgress3D } from '../common/GoalProgress3D';
import { Card3D } from '../common/Card3D';

export const DashboardView: React.FC = () => {
  const {
    user,
    tasks,
    goals,
    habits,
    expenses,
    productivityScore,
    setActiveTab,
    openQuickAdd,
    openExerciseCoach,
    toggleTaskStatus,
    toggleHabitToday,
  } = useApp();

  const [showScoreExplainer, setShowScoreExplainer] = useState(false);

  // Dynamic greeting based on current hour
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Morning Briefing' : currentHour < 18 ? 'Afternoon Review' : 'Evening Dispatch';
  const userName = user?.name || 'Aarav Sharma';

  const todayStr = new Date().toISOString().split('T')[0];

  // Derived task slices
  const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived');
  const completedToday = tasks.filter((t) => t.status === 'completed' && t.completedAt?.startsWith(todayStr));
  const overdueTasks = activeTasks.filter((t) => t.dueDate && t.dueDate < todayStr);
  const dueTodayTasks = activeTasks.filter((t) => t.dueDate === todayStr);
  const highPriorityTasks = activeTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');

  // Goals slice
  const activeGoals = goals.filter((g) => g.status === 'in_progress');

  // Habits slice
  const completedHabitsToday = habits.filter((h) => h.completions.includes(todayStr));
  const bestStreakHabit = habits.reduce(
    (max, h) => (h.currentStreak > (max?.currentStreak || 0) ? h : max),
    habits[0]
  );

  // Expense slice
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const monthlyBudget = user?.monthlyBudget || 75000;
  const budgetUtilization = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));

  return (
    <div id="lifeops-dashboard-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header — Sophisticated Dark Hero */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-[#1a1a1a] pb-8">
        <div className="space-y-2">
          <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.4em] font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shadow-[0_0_8px_rgba(197,160,89,0.6)]"></span>
            <span>{greeting} &bull; India (₹)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
            Dashboard & Daily Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#7a7a7a] max-w-2xl font-light">
            {activeTasks.length} active tasks, {activeGoals.length} goals, and finance tracking in Indian Rupees (₹).
          </p>
        </div>

        <div className="flex items-center gap-6 self-end lg:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-white text-sm font-medium tracking-tight">{userName}</div>
            <div className="text-[#c5a059] text-[9px] uppercase tracking-[0.25em] mt-0.5 font-mono">
              LIFEOPS &bull; ₹ INR
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border border-[#c5a059]/40 p-1 flex items-center justify-center bg-gradient-to-tr from-[#111] to-[#222] shadow-[0_0_15px_rgba(197,160,89,0.2)]">
            <div className="w-9 h-9 rounded-full bg-[#0a0a0a] flex items-center justify-center text-[#c5a059] font-serif text-lg font-bold">
              {userName[0]}
            </div>
          </div>
        </div>
      </header>

      {/* Main Stats / Metrics Bar with 3D Card Tilt Effects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Capital / Treasury */}
        <Card3D depth={14} id="metric-card-expenses" onClick={() => setActiveTab('expenses')}>
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-sm p-6 cursor-pointer group h-full">
            <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.3em] font-medium mb-3 flex items-center justify-between">
              <span>Treasury Outflow (₹)</span>
              <IndianRupee className="w-3.5 h-3.5 text-[#c5a059] opacity-70 group-hover:opacity-100" />
            </div>
            <div className="text-3xl font-serif text-white tracking-tight">
              ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="h-px w-full bg-gradient-to-r from-[#1a1a1a] via-[#333] to-[#1a1a1a] my-3"></div>
            <div className="flex items-center justify-between text-[10px] text-[#7a7a7a] font-mono">
              <span>Budget: ₹{monthlyBudget.toLocaleString('en-IN')}</span>
              <span className={totalSpent > monthlyBudget ? 'text-rose-400' : 'text-[#c5a059]'}>
                {budgetUtilization}% utilized
              </span>
            </div>
          </div>
        </Card3D>

        {/* Metric 2: Directives / Tasks */}
        <Card3D depth={14} id="metric-card-tasks" onClick={() => setActiveTab('tasks')}>
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-sm p-6 cursor-pointer group h-full">
            <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.3em] font-medium mb-3 flex items-center justify-between">
              <span>Active Directives</span>
              <CheckSquare className="w-3.5 h-3.5 text-[#c5a059] opacity-70 group-hover:opacity-100" />
            </div>
            <div className="text-3xl font-serif text-white tracking-tight">
              {dueTodayTasks.length}{' '}
              <span className="text-sm font-sans text-[#7a7a7a] font-normal">due today</span>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-[#1a1a1a] via-[#333] to-[#1a1a1a] my-3"></div>
            <div className="flex items-center justify-between text-[10px] text-[#7a7a7a] font-mono">
              <span>{completedToday.length} fulfilled today</span>
              {overdueTasks.length > 0 ? (
                <span className="text-rose-400 font-semibold">{overdueTasks.length} overdue</span>
              ) : (
                <span className="text-[#c5a059]">On Schedule</span>
              )}
            </div>
          </div>
        </Card3D>

        {/* Metric 3: Strategic Goals */}
        <Card3D depth={14} id="metric-card-goals" onClick={() => setActiveTab('goals')}>
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-sm p-6 cursor-pointer group h-full">
            <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.3em] font-medium mb-3 flex items-center justify-between">
              <span>Strategic Portfolios</span>
              <Target className="w-3.5 h-3.5 text-[#c5a059] opacity-70 group-hover:opacity-100" />
            </div>
            <div className="text-3xl font-serif text-white tracking-tight">
              {activeGoals.length}{' '}
              <span className="text-sm font-sans text-[#7a7a7a] font-normal">in progress</span>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-[#1a1a1a] via-[#333] to-[#1a1a1a] my-3"></div>
            <div className="flex items-center justify-between text-[10px] text-[#7a7a7a] font-mono">
              <span>Milestone Average</span>
              <span className="text-[#c5a059]">
                {activeGoals.length
                  ? Math.round(activeGoals.reduce((a, b) => a + b.progress, 0) / activeGoals.length)
                  : 0}
                % Yield
              </span>
            </div>
          </div>
        </Card3D>

        {/* Metric 4: Daily Rituals */}
        <Card3D depth={14} id="metric-card-habits" onClick={() => setActiveTab('habits')}>
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-sm p-6 cursor-pointer group h-full">
            <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.3em] font-medium mb-3 flex items-center justify-between">
              <span>Ritual Discipline</span>
              <Flame className="w-3.5 h-3.5 text-[#c5a059] opacity-70 group-hover:opacity-100" />
            </div>
            <div className="text-3xl font-serif text-white tracking-tight">
              {bestStreakHabit ? `${bestStreakHabit.currentStreak}d` : '0d'}{' '}
              <span className="text-sm font-sans text-[#7a7a7a] font-normal">streak</span>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-[#1a1a1a] via-[#333] to-[#1a1a1a] my-3"></div>
            <div className="flex items-center justify-between text-[10px] text-[#7a7a7a] font-mono">
              <span>Cadence Check</span>
              <span className="text-[#c5a059]">
                {completedHabitsToday.length}/{habits.length} Checked
              </span>
            </div>
          </div>
        </Card3D>
      </div>

      {/* Main Grid: 8-col Performance & Directives, 4-col Liaison & Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols */}
        <div className="lg:col-span-8 space-y-8">
          {/* Executive Directives / Priority Tasks */}
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-sm p-8 flex flex-col shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-serif italic text-2xl sm:text-3xl text-white">Today's Tasks & Priority Directives</h2>
                <p className="text-xs text-[#555] mt-1 tracking-wide">
                  High-leverage operations scheduled for immediate execution
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  id="dash-add-task-btn"
                  onClick={() => openQuickAdd('task')}
                  className="text-[10px] uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-sm border border-[#1a1a1a] hover:border-[#c5a059]/60 text-[#c5a059] bg-[#0a0a0a] hover:bg-[#141414] transition-all font-medium flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(197,160,89,0.1)] hover:scale-105"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
                <button
                  id="dash-view-all-tasks-btn"
                  onClick={() => setActiveTab('tasks')}
                  className="text-[10px] uppercase tracking-[0.2em] text-[#7a7a7a] hover:text-white transition-colors"
                >
                  View All
                </button>
              </div>
            </div>

            {/* Overdue alert banner if present */}
            {overdueTasks.length > 0 && (
              <div className="mb-6 p-4 rounded-sm bg-[#120808] border border-rose-900/40 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="text-xs text-rose-300 font-light">
                    <strong className="font-semibold">{overdueTasks.length} directive(s) overdue.</strong> Priority attention required to restore optimal yield trajectory.
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="px-3 py-1 rounded-sm bg-rose-950/60 text-rose-300 text-[10px] uppercase tracking-wider font-semibold border border-rose-800/40 hover:bg-rose-900/40"
                >
                  Resolve
                </button>
              </div>
            )}

            {/* Task list items */}
            <div className="space-y-4">
              {activeTasks.length === 0 ? (
                <div className="py-12 text-center rounded-sm bg-[#050505] border border-[#141414]">
                  <CheckSquare className="w-8 h-8 text-[#444] mx-auto mb-2" />
                  <p className="text-xs text-[#7a7a7a]">No active tasks remaining for today.</p>
                  <button
                    onClick={() => openQuickAdd('task')}
                    className="mt-3 px-4 py-1.5 rounded-sm bg-[#c5a059] text-black text-[10px] uppercase tracking-widest font-semibold hover:bg-[#d8b56f] transition-all inline-flex items-center gap-1 shadow-[0_0_10px_rgba(197,160,89,0.2)]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Task</span>
                  </button>
                </div>
              ) : (
                activeTasks.slice(0, 6).map((task) => {
                  const isOverdue = task.dueDate && task.dueDate < todayStr;
                  return (
                    <div
                      key={task.id}
                      id={`priority-task-${task.id}`}
                      className={`group p-4 rounded-sm border transition-all ${
                        isOverdue
                          ? 'bg-[#0f0707] border-rose-900/30 hover:border-rose-800/50'
                          : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#c5a059]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <button
                            id={`check-task-${task.id}`}
                            onClick={() => toggleTaskStatus(task.id)}
                            className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors flex-shrink-0 ${
                              task.status === 'completed'
                                ? 'bg-[#c5a059] border-[#c5a059] text-black shadow-[0_0_8px_rgba(197,160,89,0.4)]'
                                : 'border-[#333] hover:border-[#c5a059] bg-[#050505]'
                            }`}
                          >
                            {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          <div
                            className="truncate flex-1 cursor-pointer"
                            onClick={() => setActiveTab('tasks')}
                            title="Click to view directive details"
                          >
                            <div className="text-sm font-medium text-[#eee] group-hover:text-white transition-colors truncate flex items-center gap-2">
                              <span>{task.title}</span>
                              {isOverdue && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-rose-950 text-rose-400 font-mono uppercase tracking-wider border border-rose-800/40">
                                  Overdue
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-[#7a7a7a]">
                              <span className="uppercase tracking-wider font-mono text-[#999]">
                                {task.category}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-[#555]" />
                                {task.dueTime || task.dueDate || 'Today'}
                              </span>
                              {task.estimatedDurationMinutes && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono">{task.estimatedDurationMinutes} min</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider border flex-shrink-0 ${
                            task.priority === 'urgent'
                              ? 'bg-rose-950/40 text-rose-400 border-rose-800/30'
                              : task.priority === 'high'
                              ? 'bg-[#221808] text-[#c5a059] border-[#c5a059]/30'
                              : 'bg-[#111] text-[#7a7a7a] border-[#222]'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Performance Overview Chart & Efficiency Index */}
          <div className="bg-[#080808] border border-[#1a1a1a] rounded-sm p-8 relative overflow-hidden shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-serif italic text-2xl text-white">System Velocity & Efficiency</h2>
                <p className="text-xs text-[#555] mt-1">Algorithmic score tracking across directives and consistency</p>
              </div>

              <button
                onClick={() => setShowScoreExplainer((prev) => !prev)}
                className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059] border-b border-[#c5a059]/40 pb-0.5 hover:border-[#c5a059]"
              >
                {showScoreExplainer ? 'Hide Formula' : 'Formula Breakdown'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card3D depth={8}>
                <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm h-full">
                  <div className="text-[9px] text-[#555] uppercase tracking-widest mb-1">Directives Velocity</div>
                  <div className="text-xl font-serif text-white">
                    +{productivityScore.taskCompletionPoints}{' '}
                    <span className="text-xs font-sans text-[#7a7a7a]">/ 40 pts</span>
                  </div>
                </div>
              </Card3D>

              <Card3D depth={8}>
                <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm h-full">
                  <div className="text-[9px] text-[#555] uppercase tracking-widest mb-1">Portfolio Milestones</div>
                  <div className="text-xl font-serif text-white">
                    +{productivityScore.goalProgressPoints}{' '}
                    <span className="text-xs font-sans text-[#7a7a7a]">/ 30 pts</span>
                  </div>
                </div>
              </Card3D>

              <Card3D depth={8}>
                <div className="p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm h-full">
                  <div className="text-[9px] text-[#555] uppercase tracking-widest mb-1">Ritual Consistency</div>
                  <div className="text-xl font-serif text-white">
                    +{productivityScore.habitConsistencyPoints}{' '}
                    <span className="text-xs font-sans text-[#7a7a7a]">/ 30 pts</span>
                  </div>
                </div>
              </Card3D>
            </div>

            {showScoreExplainer && (
              <div className="p-4 rounded-sm bg-[#0a0a0a] border border-[#c5a059]/30 text-xs text-[#999] space-y-2 mb-6">
                <div className="text-[#c5a059] font-serif italic text-sm">Deterministic Efficiency Formula:</div>
                <p>
                  Composite index = (Directive Velocity [40%]) + (Strategic Goal Milestones [30%]) + (Habit Adherence [30%]) - (Overdue Penalties [-6 pts each]).
                </p>
              </div>
            )}

            {/* Strategic Holdings Quick List */}
            <div className="pt-2">
              <h3 className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.3em] mb-4 font-medium">
                Active Strategic Holdings & Goals
              </h3>
              <ul className="space-y-4">
                {activeGoals.slice(0, 3).map((goal) => (
                  <li
                    key={goal.id}
                    onClick={() => setActiveTab('goals')}
                    className="group cursor-pointer"
                  >
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-sm text-[#eee] group-hover:text-white transition-colors">
                        {goal.title}
                      </span>
                      <span className="text-[10px] text-[#c5a059] font-serif italic">
                        {goal.progress}% Completed
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#141414] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#c5a059] via-[#e5c178] to-[#997736] transition-all duration-700 shadow-[0_0_8px_rgba(197,160,89,0.5)]"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Autonomous Advisory & 3D Orb */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          {/* Autonomous Advisory / Liaison Card with 3D tilt */}
          <Card3D depth={12}>
            <div className="bg-[#080808] p-8 border border-[#c5a059]/30 rounded-sm flex flex-col justify-between relative overflow-hidden shadow-2xl h-full">
              <div className="absolute top-0 right-0 w-36 h-36 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="text-[#c5a059] text-[9px] uppercase tracking-[0.4em] mb-4 font-medium flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Autonomous Neural Advisory</span>
                </div>
                <p className="text-[#eee] text-xl font-serif italic leading-[1.6] mb-6">
                  &ldquo;High-cognitive energy block detected. Recommend executing strategic capital allocation and core directives.&rdquo;
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#1a1a1a]">
                <button
                  id="dash-open-ai-chat-btn"
                  onClick={() => setActiveTab('ai')}
                  className="w-full py-2.5 px-4 rounded-sm bg-[#c5a059] text-black text-xs uppercase tracking-widest font-semibold hover:bg-[#d8b56f] transition-all shadow-[0_0_15px_rgba(197,160,89,0.3)] hover:scale-[1.02]"
                >
                  Consult Advisory Brain
                </button>
                <div className="flex items-center justify-between text-[9px] text-[#555] uppercase tracking-widest pt-1 font-mono">
                  <span>Direct Protocol Active</span>
                  <span className="italic text-[#7a7a7a]">Updated 5m ago</span>
                </div>
              </div>
            </div>
          </Card3D>

          {/* Productivity Orb Metric Widget with 3D Gyro Orb */}
          <Card3D depth={10}>
            <div className="bg-[#080808] p-8 border border-[#1a1a1a] rounded-sm flex flex-col items-center justify-center text-center shadow-xl h-full">
              <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.3em] mb-4 font-medium">
                Consolidated 3D Efficiency
              </div>
              <ProductivityOrb
                score={productivityScore.total}
                grade={productivityScore.grade}
                size="md"
                onClick={() => setShowScoreExplainer(true)}
              />
              <div className="mt-4 text-xs text-[#999] font-serif italic">
                Status: <span className="text-[#c5a059]">{productivityScore.grade} Tier Rating</span>
              </div>
            </div>
          </Card3D>

          {/* Habit Cadence Box */}
          <Card3D depth={8}>
            <div className="bg-[#080808] p-6 border border-[#1a1a1a] rounded-sm shadow-xl h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.3em] font-medium">
                  Ritual Cadence
                </div>
                <button
                  onClick={() => setActiveTab('habits')}
                  className="text-[9px] uppercase tracking-[0.2em] text-[#c5a059] hover:underline"
                >
                  All Rituals
                </button>
              </div>

              <div className="space-y-3">
                {habits.slice(0, 3).map((habit) => {
                  const isCheckedToday = habit.completions.includes(todayStr);
                  return (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 rounded-sm bg-[#0a0a0a] border border-[#1a1a1a]"
                    >
                      <div className="truncate mr-2">
                        <div className="text-xs text-[#eee] truncate font-medium">{habit.name}</div>
                        <div className="text-[9px] text-[#c5a059] font-mono mt-0.5">
                          {habit.currentStreak}d Streak
                        </div>
                      </div>
                      <button
                        onClick={() => toggleHabitToday(habit.id)}
                        className={`px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-wider font-semibold transition-all ${
                          isCheckedToday
                            ? 'bg-[#c5a059] text-black shadow-[0_0_8px_rgba(197,160,89,0.3)]'
                            : 'bg-[#141414] text-[#7a7a7a] hover:text-white border border-[#222]'
                        }`}
                      >
                        {isCheckedToday ? 'Done' : 'Check'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card3D>

          {/* Kinetic Exercise AI & Camera Verification Card */}
          <Card3D depth={8}>
            <div className="bg-gradient-to-b from-[#0a120e] to-[#080808] p-5 border border-emerald-500/30 rounded-sm shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-sm bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-serif text-white">Kinetic Exercise AI</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-xs border border-emerald-500/30">
                  Vision HUD
                </span>
              </div>
              <p className="text-[11px] text-[#888] font-light leading-relaxed">
                Verify workouts with real-time computer vision camera tracking and step-by-step exercise tutorial animations.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => openExerciseCoach('squat')}
                  className="py-1.5 px-2 rounded-sm bg-[#111] hover:bg-[#181818] border border-emerald-500/30 hover:border-emerald-500 text-[10px] font-mono text-emerald-300 transition-all text-left truncate"
                >
                  &bull; Squat Form (10)
                </button>
                <button
                  onClick={() => openExerciseCoach('pushup')}
                  className="py-1.5 px-2 rounded-sm bg-[#111] hover:bg-[#181818] border border-emerald-500/30 hover:border-emerald-500 text-[10px] font-mono text-emerald-300 transition-all text-left truncate"
                >
                  &bull; Push-Ups (8)
                </button>
              </div>
              <button
                onClick={() => openExerciseCoach('squat')}
                className="w-full py-2 rounded-sm bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Launch Exercise Coach</span>
              </button>
            </div>
          </Card3D>
        </div>
      </div>
    </div>
  );
};
