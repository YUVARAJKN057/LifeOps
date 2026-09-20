import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckSquare,
  Target,
  Flame,
  IndianRupee,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { tasks, goals, habits, expenses, openQuickAdd, toggleTaskStatus } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const jumpToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(now.toISOString().split('T')[0]);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Compute month grid days
  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const days = [];
    const startDay = startOfMonth.getDay(); // 0 is Sunday

    // Padding for previous month days
    const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthEnd - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Days in current month
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Trailing days for grid completion (multiple of 7)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Selected date events
  const selectedDayTasks = tasks.filter((t) => t.dueDate === selectedDateStr);
  const selectedDayGoals = goals.filter((g) => g.targetDate === selectedDateStr);
  const selectedDayExpenses = expenses.filter((e) => e.date === selectedDateStr);
  const selectedDayHabits = habits.filter((h) => h.completions.includes(selectedDateStr));

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div id="lifeops-calendar-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.35em] font-medium mb-1">
            Temporal Chronology
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Master Calendar & Schedule
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1 font-light">
            Synchronized timelines for directives, milestones, habits, and liquidity events.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            id="calendar-today-btn"
            onClick={jumpToday}
            className="px-3.5 py-2 rounded-sm bg-[#0e0e0e] hover:bg-[#141414] text-[10px] uppercase tracking-widest font-semibold text-[#c5a059] border border-[#1a1a1a]"
          >
            Today
          </button>
          <div className="flex items-center bg-[#080808] rounded-sm border border-[#1a1a1a] p-1">
            <button
              id="calendar-prev-btn"
              onClick={prevMonth}
              className="p-1.5 text-[#7a7a7a] hover:text-white rounded-sm hover:bg-[#111]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-serif font-medium text-white min-w-[130px] text-center">
              {monthName} {year}
            </span>
            <button
              id="calendar-next-btn"
              onClick={nextMonth}
              className="p-1.5 text-[#7a7a7a] hover:text-white rounded-sm hover:bg-[#111]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            id="calendar-quick-add-btn"
            onClick={() => openQuickAdd('task')}
            className="p-2 rounded-sm bg-[#c5a059] text-black font-semibold hover:bg-[#d8b56f]"
            title="Add Task to Schedule"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Main Grid & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Calendar Matrix */}
        <div className="lg:col-span-2 p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-4">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-[#7a7a7a] font-medium uppercase pb-3 border-b border-[#1a1a1a]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((dayItem, idx) => {
              const dStr = dayItem.date.toISOString().split('T')[0];
              const isToday = dStr === todayStr;
              const isSelected = dStr === selectedDateStr;

              // Find events on this date
              const dayTasks = tasks.filter((t) => t.dueDate === dStr && t.status !== 'archived');
              const dayGoals = goals.filter((g) => g.targetDate === dStr);
              const dayExpenses = expenses.filter((e) => e.date === dStr);

              return (
                <div
                  key={idx}
                  id={`cal-day-${dStr}`}
                  onClick={() => setSelectedDateStr(dStr)}
                  className={`min-h-[90px] p-2.5 rounded-sm border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0e0e0e] border-[#c5a059] shadow-[0_0_12px_rgba(197,160,89,0.2)]'
                      : isToday
                      ? 'bg-[#0a0a0a] border-[#c5a059]/40 hover:border-[#c5a059]'
                      : dayItem.isCurrentMonth
                      ? 'bg-[#050505] border-[#141414] hover:border-[#222]'
                      : 'bg-[#050505]/40 border-transparent opacity-30 hover:opacity-70'
                  }`}
                >
                  {/* Date Number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-[#c5a059] text-black flex items-center justify-center font-bold'
                          : isSelected
                          ? 'text-[#c5a059] font-bold'
                          : 'text-[#d1d1d1]'
                      }`}
                    >
                      {dayItem.date.getDate()}
                    </span>

                    {/* Quick indicator count if many */}
                    {dayTasks.length > 0 && (
                      <span className="text-[9px] font-mono text-[#555]">
                        {dayTasks.length}d
                      </span>
                    )}
                  </div>

                  {/* Visual Event Pills */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[9px] px-1.5 py-0.5 rounded-[1px] truncate font-mono ${
                          t.status === 'completed'
                            ? 'bg-[#111] text-[#555] line-through'
                            : t.priority === 'urgent'
                            ? 'bg-rose-950/40 text-rose-400 border border-rose-900/40'
                            : 'bg-[#141414] text-[#c5a059] border border-[#222]'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayGoals.slice(0, 1).map((g) => (
                      <div
                        key={g.id}
                        className="text-[9px] px-1.5 py-0.5 rounded-[1px] truncate bg-[#1a1505] text-[#e5c178] border border-[#c5a059]/20 font-serif italic"
                      >
                        Target: {g.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Day Inspector */}
        <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]">
              <div>
                <span className="text-[10px] text-[#7a7a7a] uppercase tracking-widest block font-medium">Selected Date</span>
                <h3 className="text-lg font-serif text-white mt-0.5">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <button
                id="cal-inspector-add-btn"
                onClick={() => openQuickAdd('task')}
                className="p-2 rounded-sm bg-[#0e0e0e] text-[#c5a059] border border-[#1a1a1a] hover:border-[#c5a059]/40"
                title="Add Directive for Selected Day"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Scheduled Tasks */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#999]">
                <span className="flex items-center gap-1.5 uppercase tracking-wider font-mono text-[10px]">
                  <CheckSquare className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Directives ({selectedDayTasks.length})</span>
                </span>
              </div>

              {selectedDayTasks.length === 0 ? (
                <p className="text-xs text-[#555] italic py-2">No directives scheduled for this date.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedDayTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-sm bg-[#050505] border border-[#141414] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => toggleTaskStatus(t.id)}
                          className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                            t.status === 'completed'
                              ? 'bg-[#c5a059] border-[#c5a059] text-black'
                              : 'border-[#333]'
                          }`}
                        >
                          {t.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                        <span
                          className={`truncate font-light ${
                            t.status === 'completed' ? 'line-through text-[#555]' : 'text-white'
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      {t.dueTime && (
                        <span className="text-[10px] text-[#7a7a7a] font-mono flex-shrink-0">
                          {t.dueTime}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Goal Targets */}
              {selectedDayGoals.length > 0 && (
                <div className="pt-3 border-t border-[#1a1a1a]">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-[#c5a059] flex items-center gap-1.5 mb-2">
                    <Target className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Portfolio Targets</span>
                  </span>
                  {selectedDayGoals.map((g) => (
                    <div
                      key={g.id}
                      className="p-3 rounded-sm bg-[#0a0a0a] border border-[#1a1a1a] text-xs text-white"
                    >
                      {g.title} ({g.progress}% Complete)
                    </div>
                  ))}
                </div>
              )}

              {/* Habit Completions */}
              {selectedDayHabits.length > 0 && (
                <div className="pt-3 border-t border-[#1a1a1a]">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-[#c5a059] flex items-center gap-1.5 mb-2">
                    <Flame className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Ritual Check-ins</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDayHabits.map((h) => (
                      <span
                        key={h.id}
                        className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-sm bg-[#111] text-[#c5a059] border border-[#1a1a1a]"
                      >
                        ✓ {h.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Expenses on Day */}
              {selectedDayExpenses.length > 0 && (
                <div className="pt-3 border-t border-[#1a1a1a]">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-[#7a7a7a] flex items-center gap-1.5 mb-2">
                    <IndianRupee className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Outflows (₹{selectedDayExpenses.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </span>
                  {selectedDayExpenses.map((e) => (
                    <div
                      key={e.id}
                      className="p-2 rounded-sm bg-[#050505] border border-[#141414] flex items-center justify-between text-xs text-[#7a7a7a]"
                    >
                      <span className="truncate">{e.description}</span>
                      <span className="font-serif text-[#c5a059] font-bold">₹{e.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            id="cal-add-event-bottom-btn"
            onClick={() => openQuickAdd('task')}
            className="w-full py-2.5 rounded-sm bg-[#0a0a0a] hover:bg-[#111] text-[#c5a059] border border-[#1a1a1a] text-[10px] uppercase tracking-widest font-semibold transition-all"
          >
            + Add Schedule Item
          </button>
        </div>
      </div>
    </div>
  );
};
