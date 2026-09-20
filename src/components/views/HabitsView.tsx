import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Habit, HabitFrequency, TaskCategory } from '../../types';
import {
  Flame,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  TrendingUp,
  Award,
  Sparkles,
  X,
  Camera,
  Activity,
  Video,
} from 'lucide-react';
import { Card3D } from '../common/Card3D';

export const HabitsView: React.FC = () => {
  const {
    habits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitToday,
    openQuickAdd,
    openExerciseCoach,
  } = useApp();

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to generate the last 30 days array
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit) return;
    await updateHabit(editingHabit.id, editingHabit);
    setEditingHabit(null);
  };

  return (
    <div id="lifeops-habits-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.35em] font-medium mb-1">
            Behavioral Disciplines
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Daily Rituals & Consistency Heatmap
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1 font-light">
            Algorithmic cadence monitoring and 30-day streak telemetry with 3D interactive perspectives.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="habits-exercise-coach-btn"
            onClick={() => openExerciseCoach('squat')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-[#0a120e] text-emerald-400 border border-emerald-500/40 font-semibold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(52,211,153,0.15)] hover:bg-[#0f1c16] transition-all hover:scale-105"
          >
            <Camera className="w-4 h-4" />
            <span>Exercise AI Coach</span>
          </button>

          <button
            id="habits-create-btn"
            onClick={() => openQuickAdd('habit')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(197,160,89,0.25)] hover:bg-[#d8b56f] transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Ritual</span>
          </button>
        </div>
      </div>

      {/* Interactive Exercise Tutorials & Optical Verification Hub Banner */}
      <div className="p-4 sm:p-5 rounded-sm bg-gradient-to-r from-[#0a0f0d] via-[#080808] to-[#0d0a06] border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-sm bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-serif text-white tracking-wide">
                  Exercise Tutorials & Optical Camera Verification
                </h3>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Live Vision HUD
                </span>
              </div>
              <p className="text-xs text-[#888] mt-1 font-light max-w-2xl">
                Master perfect form with step-by-step kinetic tutorials, joint angle telemetry, and real-time computer-vision webcam rep verification.
              </p>
            </div>
          </div>

          {/* Quick Exercise Trigger Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => openExerciseCoach('skipping')}
              className="px-3 py-1.5 rounded-sm bg-[#121212] border border-[#262626] hover:border-[#c5a059] text-xs font-mono text-[#ccc] hover:text-[#c5a059] transition-all flex items-center gap-1"
            >
              <span>⚡ Skipping (60s)</span>
            </button>
            <button
              onClick={() => openExerciseCoach('shadow_boxing')}
              className="px-3 py-1.5 rounded-sm bg-[#121212] border border-[#262626] hover:border-amber-400 text-xs font-mono text-[#ccc] hover:text-amber-400 transition-all flex items-center gap-1"
            >
              <span>🥋 Shadow Boxing (45s)</span>
            </button>
            <button
              onClick={() => openExerciseCoach('burpee')}
              className="px-3 py-1.5 rounded-sm bg-[#121212] border border-[#262626] hover:border-red-400 text-xs font-mono text-[#ccc] hover:text-red-400 transition-all flex items-center gap-1"
            >
              <span>🔥 Burpees (15 reps)</span>
            </button>
            <button
              onClick={() => openExerciseCoach('squat')}
              className="px-3 py-1.5 rounded-sm bg-[#121212] border border-[#262626] hover:border-[#c5a059] text-xs font-mono text-[#ccc] hover:text-[#c5a059] transition-all flex items-center gap-1"
            >
              <span>🏛️ Squats (15 reps)</span>
            </button>
            <button
              onClick={() => openExerciseCoach('dead_bug')}
              className="px-3 py-1.5 rounded-sm bg-[#121212] border border-[#262626] hover:border-sky-400 text-xs font-mono text-[#ccc] hover:text-sky-400 transition-all flex items-center gap-1"
            >
              <span>🛡️ Dead Bug (12 reps)</span>
            </button>
            <button
              onClick={() => openExerciseCoach('desk_stretch')}
              className="px-3 py-1.5 rounded-sm bg-[#121212] border border-[#262626] hover:border-purple-400 text-xs font-mono text-[#ccc] hover:text-purple-400 transition-all flex items-center gap-1"
            >
              <span>🧘 Desk Decompress</span>
            </button>
          </div>
        </div>
      </div>

      {/* Habit Cards Grid wrapped in 3D Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {habits.map((habit) => {
          const isCheckedToday = habit.completions.includes(todayStr);

          // Calculate weekly completions (last 7 days)
          const last7Days = last30Days.slice(-7);
          const completedThisWeek = last7Days.filter((d) => habit.completions.includes(d)).length;

          return (
            <Card3D key={habit.id} depth={10}>
              <div
                id={`habit-card-${habit.id}`}
                className="p-7 rounded-sm bg-[#080808] border border-[#1a1a1a] hover:border-[#c5a059]/40 transition-all flex flex-col justify-between h-full shadow-lg"
              >
                <div>
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm bg-[#111] border border-[#1a1a1a] text-[#c5a059] tracking-wider">
                          {habit.category}
                        </span>
                        <span className="text-[9px] font-mono text-[#7a7a7a] uppercase tracking-wider bg-[#0a0a0a] px-2 py-0.5 rounded-sm border border-[#1a1a1a]">
                          {habit.frequency}
                        </span>
                      </div>
                      <h3 className="text-xl font-serif text-white tracking-tight">{habit.name}</h3>
                      {habit.description && (
                        <p className="text-xs text-[#7a7a7a] font-light leading-relaxed">{habit.description}</p>
                      )}
                    </div>

                    {/* Big Check In Button */}
                    <button
                      id={`habit-toggle-check-${habit.id}`}
                      onClick={() => toggleHabitToday(habit.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all flex-shrink-0 ${
                        isCheckedToday
                          ? 'bg-[#c5a059] text-black shadow-[0_0_12px_rgba(197,160,89,0.3)]'
                          : 'bg-[#111] hover:bg-[#1a1a1a] text-[#d1d1d1] border border-[#222]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCheckedToday ? 'Checked' : 'Check In'}</span>
                    </button>
                  </div>

                  {/* Streak Highlights */}
                  <div className="grid grid-cols-3 gap-3 my-5 p-4 rounded-sm bg-[#050505] border border-[#141414] text-center">
                    <div>
                      <span className="text-[9px] text-[#555] block uppercase font-mono tracking-wider">Current Streak</span>
                      <span className="text-xl font-serif text-[#c5a059] font-normal">
                        {habit.currentStreak}d
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#555] block uppercase font-mono tracking-wider">Best Record</span>
                      <span className="text-xl font-serif text-white font-normal">
                        {habit.longestStreak}d
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#555] block uppercase font-mono tracking-wider">Weekly Target</span>
                      <span className="text-xl font-serif text-[#d1d1d1] font-normal">
                        {completedThisWeek}/{habit.targetDaysPerWeek}d
                      </span>
                    </div>
                  </div>

                  {/* 30-Day Heatmap Grid */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-[#7a7a7a] font-mono">
                      <span className="uppercase tracking-wider">30-Day Consistency Heatmap</span>
                      <span>{last30Days[0]} &rarr; Today</span>
                    </div>
                    <div className="grid grid-cols-15 sm:grid-cols-30 gap-1.5 p-2.5 rounded-sm bg-[#050505] border border-[#141414]">
                      {last30Days.map((day) => {
                        const isDone = habit.completions.includes(day);
                        const isToday = day === todayStr;
                        return (
                          <div
                            key={day}
                            title={`${day}: ${isDone ? 'Completed' : 'Missed'}`}
                            className={`h-5 rounded-[1px] transition-all ${
                              isDone
                                ? 'bg-[#c5a059] shadow-[0_0_4px_rgba(197,160,89,0.5)]'
                                : 'bg-[#141414] hover:bg-[#222]'
                            } ${isToday ? 'ring-1 ring-[#c5a059]' : ''}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom controls */}
                <div className="mt-6 pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-[#555] font-mono">
                    {habit.reminderTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#555]" />
                        Scheduled: {habit.reminderTime}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openExerciseCoach('squat')}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase rounded-sm bg-[#111] hover:bg-[#181818] border border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60 transition-all"
                      title="Verify via Camera AI"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Form Check</span>
                    </button>
                    <button
                      id={`habit-edit-${habit.id}`}
                      onClick={() => setEditingHabit(habit)}
                      className="p-1.5 text-[#555] hover:text-[#c5a059] rounded-sm hover:bg-[#111]"
                      title="Edit Ritual"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`habit-delete-${habit.id}`}
                      onClick={() => setDeletingHabitId(habit.id)}
                      className="p-1.5 text-[#555] hover:text-rose-400 rounded-sm hover:bg-[#111]"
                      title="Retire Ritual"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>

      {/* Edit Habit Modal */}
      {editingHabit && (
        <div
          id="habit-edit-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setEditingHabit(null)}
        >
          <div
            id="habit-edit-modal"
            className="w-full max-w-lg bg-[#080808] border border-[#c5a059]/30 rounded-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
              <h3 className="text-lg font-serif italic text-white">Edit Ritual Routine</h3>
              <button onClick={() => setEditingHabit(null)} className="text-[#7a7a7a] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Ritual Name</label>
                <input
                  type="text"
                  required
                  value={editingHabit.name}
                  onChange={(e) => setEditingHabit({ ...editingHabit, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Description / Intent</label>
                <textarea
                  rows={2}
                  value={editingHabit.description || ''}
                  onChange={(e) => setEditingHabit({ ...editingHabit, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Domain</label>
                  <select
                    value={editingHabit.category}
                    onChange={(e) => setEditingHabit({ ...editingHabit, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="health">Health</option>
                    <option value="learning">Learning</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Days / Week</label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={editingHabit.targetDaysPerWeek}
                    onChange={(e) => setEditingHabit({ ...editingHabit, targetDaysPerWeek: parseInt(e.target.value) || 7 })}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1a1a1a]">
                <button
                  type="button"
                  onClick={() => setEditingHabit(null)}
                  className="px-4 py-2 rounded-sm text-xs font-medium text-[#7a7a7a] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm bg-[#c5a059] text-black text-xs uppercase tracking-widest font-semibold hover:bg-[#d8b56f]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingHabitId && (
        <div
          id="habit-delete-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setDeletingHabitId(null)}
        >
          <div
            id="habit-delete-modal"
            className="w-full max-w-sm bg-[#080808] border border-rose-900/40 rounded-sm p-6 text-center space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-serif italic text-white">Retire Ritual?</h4>
            <p className="text-xs text-[#7a7a7a]">
              This will remove the ritual routine and clear historic completion tracking.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingHabitId(null)}
                className="px-4 py-2 rounded-sm text-xs font-medium text-[#7a7a7a] hover:text-white bg-[#111]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteHabit(deletingHabitId);
                  setDeletingHabitId(null);
                }}
                className="px-5 py-2 rounded-sm bg-rose-900 hover:bg-rose-800 text-white text-xs uppercase tracking-wider font-semibold"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
