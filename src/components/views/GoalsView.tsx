import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal, GoalMilestone, Priority, TaskCategory } from '../../types';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  Sparkles,
  TrendingUp,
  X,
  PlusCircle,
  Trophy,
  CheckSquare,
  ArrowRight,
} from 'lucide-react';
import { GoalProgress3D } from '../common/GoalProgress3D';
import { Card3D } from '../common/Card3D';
import confetti from 'canvas-confetti';

export const GoalsView: React.FC = () => {
  const {
    goals,
    tasks,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    toggleTaskStatus,
    openQuickAdd,
    createTask,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [newMilestoneText, setNewMilestoneText] = useState<{ [goalId: string]: string }>({});
  const [newDirectTaskText, setNewDirectTaskText] = useState<{ [goalId: string]: string }>({});
  const [showTaskInput, setShowTaskInput] = useState<{ [goalId: string]: boolean }>({});

  const filteredGoals = goals.filter((g) => {
    if (categoryFilter !== 'all' && g.category !== categoryFilter) return false;
    return true;
  });

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#c5a059', '#e5c178', '#ffffff', '#ffd700'],
      });
    } catch {
      // Graceful fallback
    }
  };

  const handleAddMilestone = async (goal: Goal) => {
    const text = newMilestoneText[goal.id]?.trim();
    if (!text) return;

    const newMilestone: GoalMilestone = {
      id: `m-${Date.now()}`,
      title: text,
      completed: false,
    };

    const updatedMilestones = [...goal.milestones, newMilestone];
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    await updateGoal(goal.id, {
      milestones: updatedMilestones,
      progress,
    });

    if (progress === 100) {
      triggerCelebration();
    }

    setNewMilestoneText({ ...newMilestoneText, [goal.id]: '' });
  };

  const handleRemoveMilestone = async (goal: Goal, milestoneId: string) => {
    const updatedMilestones = goal.milestones.filter((m) => m.id !== milestoneId);
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress =
      updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;

    await updateGoal(goal.id, {
      milestones: updatedMilestones,
      progress,
    });
  };

  const handleMilestoneToggle = async (goal: Goal, milestoneId: string) => {
    await toggleMilestone(goal.id, milestoneId);
    const m = goal.milestones.find((x) => x.id === milestoneId);
    const willBeComplete = !m?.completed;
    const completedCount = goal.milestones.filter((x) => x.id === milestoneId ? willBeComplete : x.completed).length;
    if (completedCount === goal.milestones.length && willBeComplete) {
      triggerCelebration();
    }
  };

  const handleAddLinkedTask = async (goal: Goal) => {
    const title = newDirectTaskText[goal.id]?.trim();
    if (!title) return;

    await createTask({
      title,
      goalId: goal.id,
      category: goal.category,
      priority: goal.priority,
      status: 'todo',
    });

    setNewDirectTaskText({ ...newDirectTaskText, [goal.id]: '' });
    setShowTaskInput({ ...showTaskInput, [goal.id]: false });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    await updateGoal(editingGoal.id, editingGoal);
    setEditingGoal(null);
  };

  return (
    <div id="lifeops-goals-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.35em] font-medium mb-1">
            Strategic Architecture
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Strategic Portfolios & Objectives
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1 font-light">
            Long-horizon targets, connected task directives, and 3D yield tracking across life domains.
          </p>
        </div>

        <button
          id="goals-create-btn"
          onClick={() => openQuickAdd('goal')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(197,160,89,0.25)] hover:bg-[#d8b56f] transition-all self-start sm:self-auto hover:scale-105"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Objective</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'work', 'learning', 'health', 'finance', 'personal'].map((cat) => (
          <button
            key={cat}
            id={`goals-cat-${cat}`}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-sm text-[10px] uppercase tracking-widest font-medium transition-colors flex-shrink-0 ${
              categoryFilter === cat
                ? 'bg-[#0e0e0e] text-[#c5a059] border border-[#c5a059]/40 font-semibold shadow-sm'
                : 'text-[#7a7a7a] hover:text-white bg-[#080808] border border-[#1a1a1a]'
            }`}
          >
            {cat === 'all' ? 'All Portfolios' : cat}
          </button>
        ))}
      </div>

      {/* Goals Grid wrapped in 3D Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => {
          const completedMilestones = goal.milestones.filter((m) => m.completed).length;
          const associatedTasks = tasks.filter((t) => t.goalId === goal.id && t.status !== 'archived');
          const completedAssociatedTasks = associatedTasks.filter((t) => t.status === 'completed').length;
          const isFinished = goal.progress === 100;

          return (
            <Card3D key={goal.id} depth={10}>
              <div
                id={`goal-card-${goal.id}`}
                className={`p-7 rounded-sm border transition-all flex flex-col justify-between h-full ${
                  isFinished
                    ? 'bg-[#080808] border-[#c5a059]/40 shadow-[0_0_20px_rgba(197,160,89,0.15)]'
                    : 'bg-[#080808] border-[#1a1a1a] hover:border-[#c5a059]/30'
                }`}
              >
                <div>
                  {/* Top Row: Category tag + 3D Progress ring */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm bg-[#111] border border-[#1a1a1a] text-[#c5a059] tracking-wider">
                          {goal.category}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm border ${
                            goal.priority === 'urgent'
                              ? 'bg-rose-950/40 text-rose-400 border-rose-800/30'
                              : 'bg-[#111] text-[#7a7a7a] border-[#222]'
                          }`}
                        >
                          {goal.priority}
                        </span>
                        {isFinished && (
                          <span className="flex items-center gap-1 text-[9px] font-mono text-[#c5a059] font-bold px-2 py-0.5 rounded-sm bg-[#c5a059]/10 border border-[#c5a059]/30 shadow-sm">
                            <Trophy className="w-3 h-3" />
                            FULFILLED
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-serif text-white tracking-tight">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-xs text-[#7a7a7a] font-light leading-relaxed">{goal.description}</p>
                      )}
                    </div>

                    <GoalProgress3D
                      progress={goal.progress}
                      color={goal.color || '#c5a059'}
                      size={64}
                      strokeWidth={5}
                    />
                  </div>

                  {/* Milestones Checklist Container */}
                  <div className="mt-5 pt-4 border-t border-[#1a1a1a] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#999] mb-2 font-medium">
                      <span className="text-[10px] uppercase tracking-widest text-[#7a7a7a]">
                        Key Milestones ({completedMilestones}/{goal.milestones.length})
                      </span>
                      {goal.targetDate && (
                        <span className="flex items-center gap-1 text-[#c5a059] font-mono text-[10px]">
                          <Calendar className="w-3 h-3 text-[#555]" />
                          Target: {goal.targetDate}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {goal.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          id={`milestone-${milestone.id}`}
                          className={`flex items-center justify-between p-2.5 rounded-sm transition-all group ${
                            milestone.completed
                              ? 'bg-[#050505] text-[#555] line-through border border-transparent'
                              : 'bg-[#0a0a0a] text-[#d1d1d1] hover:text-white border border-[#141414]'
                          }`}
                        >
                          <div
                            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                            onClick={() => handleMilestoneToggle(goal, milestone.id)}
                          >
                            {milestone.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#c5a059] flex-shrink-0 shadow-[0_0_6px_rgba(197,160,89,0.4)]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#444] hover:text-[#c5a059] flex-shrink-0" />
                            )}
                            <span className="text-xs truncate font-light">{milestone.title}</span>
                          </div>

                          <button
                            onClick={() => handleRemoveMilestone(goal, milestone.id)}
                            className="text-[#555] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            title="Remove Milestone"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Milestone Inline */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add milestone step..."
                        value={newMilestoneText[goal.id] || ''}
                        onChange={(e) =>
                          setNewMilestoneText({ ...newMilestoneText, [goal.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMilestone(goal);
                          }
                        }}
                        className="flex-1 px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#c5a059]"
                      />
                      <button
                        id={`add-milestone-btn-${goal.id}`}
                        onClick={() => handleAddMilestone(goal)}
                        className="p-2 rounded-sm bg-[#111] text-[#c5a059] hover:bg-[#1a1a1a] border border-[#222]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Connected Directives / Tasks Section */}
                  <div className="mt-4 pt-4 border-t border-[#1a1a1a] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#999] mb-1">
                      <span className="text-[10px] uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5 font-mono">
                        <CheckSquare className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Connected Directives ({completedAssociatedTasks}/{associatedTasks.length})</span>
                      </span>
                      <button
                        onClick={() => setShowTaskInput({ ...showTaskInput, [goal.id]: !showTaskInput[goal.id] })}
                        className="text-[10px] text-[#c5a059] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Link Directive</span>
                      </button>
                    </div>

                    {showTaskInput[goal.id] && (
                      <div className="flex items-center gap-2 pt-1 pb-2">
                        <input
                          type="text"
                          placeholder="e.g. Learn REST APIs, Build backend project..."
                          value={newDirectTaskText[goal.id] || ''}
                          onChange={(e) => setNewDirectTaskText({ ...newDirectTaskText, [goal.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddLinkedTask(goal);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 rounded-sm bg-[#050505] border border-[#c5a059]/40 text-xs text-white placeholder-[#555] focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddLinkedTask(goal)}
                          className="px-3 py-1.5 rounded-sm bg-[#c5a059] text-black text-[10px] uppercase tracking-wider font-semibold hover:bg-[#d8b56f]"
                        >
                          Add
                        </button>
                      </div>
                    )}

                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {associatedTasks.length === 0 ? (
                        <p className="text-[11px] text-[#555] italic py-1">No tasks currently linked to this goal.</p>
                      ) : (
                        associatedTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-2 rounded-sm bg-[#050505] border border-[#141414] text-xs group"
                          >
                            <div
                              className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                              onClick={() => toggleTaskStatus(t.id)}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                                  t.status === 'completed'
                                    ? 'bg-[#c5a059] border-[#c5a059] text-black'
                                    : 'border-[#333]'
                                }`}
                              >
                                {t.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                              <span
                                className={`truncate font-light text-xs ${
                                  t.status === 'completed' ? 'line-through text-[#555]' : 'text-[#ddd]'
                                }`}
                              >
                                {t.title}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono text-[#555] uppercase">{t.priority}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Controls */}
                <div className="mt-6 pt-4 border-t border-[#1a1a1a] flex items-center justify-between">
                  <span className="text-[10px] text-[#555] font-mono uppercase tracking-wider">
                    Origin: {goal.createdAt ? new Date(goal.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      id={`goal-edit-${goal.id}`}
                      onClick={() => setEditingGoal(goal)}
                      className="p-1.5 text-[#555] hover:text-[#c5a059] rounded-sm hover:bg-[#111]"
                      title="Edit Objective"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`goal-delete-${goal.id}`}
                      onClick={() => setDeletingGoalId(goal.id)}
                      className="p-1.5 text-[#555] hover:text-rose-400 rounded-sm hover:bg-[#111]"
                      title="Retire Objective"
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

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div
          id="goal-edit-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setEditingGoal(null)}
        >
          <div
            id="goal-edit-modal"
            className="w-full max-w-lg bg-[#080808] border border-[#c5a059]/30 rounded-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
              <h3 className="text-lg font-serif italic text-white">Edit Objective Dossier</h3>
              <button onClick={() => setEditingGoal(null)} className="text-[#7a7a7a] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingGoal.description || ''}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Portfolio Domain</label>
                  <select
                    value={editingGoal.category}
                    onChange={(e) => setEditingGoal({ ...editingGoal, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="work">Work</option>
                    <option value="learning">Learning</option>
                    <option value="health">Health</option>
                    <option value="finance">Finance</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Target Horizon</label>
                  <input
                    type="date"
                    value={editingGoal.targetDate || ''}
                    onChange={(e) => setEditingGoal({ ...editingGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1a1a1a]">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-4 py-2 rounded-sm text-xs font-medium text-[#7a7a7a] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm bg-[#c5a059] text-black text-xs uppercase tracking-widest font-semibold hover:bg-[#d8b56f]"
                >
                  Save Objective
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingGoalId && (
        <div
          id="goal-delete-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setDeletingGoalId(null)}
        >
          <div
            id="goal-delete-modal"
            className="w-full max-w-sm bg-[#080808] border border-rose-900/40 rounded-sm p-6 text-center space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-serif italic text-white">Retire Objective?</h4>
            <p className="text-xs text-[#7a7a7a]">
              This will remove the strategic objective and associated milestone tracking history.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingGoalId(null)}
                className="px-4 py-2 rounded-sm text-xs font-medium text-[#7a7a7a] hover:text-white bg-[#111]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteGoal(deletingGoalId);
                  setDeletingGoalId(null);
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
