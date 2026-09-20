import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority, TaskCategory, TaskStatus } from '../../types';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Tag,
  Target,
  X,
  Sparkles,
} from 'lucide-react';
import { SpatialFloatingPrism3D } from '../common/SpatialFloatingPrism3D';
import { Card3D } from '../common/Card3D';

export const TasksView: React.FC = () => {
  const {
    tasks,
    goals,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    openQuickAdd,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'title' | 'createdAt'>('dueDate');

  // Edit / Details modal state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Status filter
        if (statusFilter === 'today') {
          if (t.status === 'completed' || t.status === 'archived' || t.dueDate !== todayStr) return false;
        } else if (statusFilter === 'overdue') {
          if (t.status === 'completed' || t.status === 'archived' || !t.dueDate || t.dueDate >= todayStr) return false;
        } else if (statusFilter === 'upcoming') {
          if (t.status === 'completed' || t.status === 'archived' || !t.dueDate || t.dueDate <= todayStr) return false;
        } else if (statusFilter === 'completed') {
          if (t.status !== 'completed') return false;
        } else if (statusFilter === 'archived') {
          if (t.status !== 'archived') return false;
        } else if (statusFilter === 'all') {
          if (t.status === 'archived') return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        // Priority filter
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description && t.description.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dueDate') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'priority') {
          const weights: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [tasks, statusFilter, categoryFilter, priorityFilter, searchQuery, sortBy, todayStr]);

  const priorityBadge = (priority: Priority) => {
    const styles: Record<Priority, string> = {
      urgent: 'bg-rose-950/40 text-rose-400 border-rose-800/40',
      high: 'bg-[#221808] text-[#c5a059] border-[#c5a059]/40',
      medium: 'bg-[#141414] text-[#d1d1d1] border-[#333]',
      low: 'bg-[#0e0e0e] text-[#7a7a7a] border-[#222]',
    };
    return (
      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider border ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    await updateTask(editingTask.id, editingTask);
    setEditingTask(null);
  };

  const handleDeleteConfirm = async () => {
    if (deletingTaskId) {
      await deleteTask(deletingTaskId);
      setDeletingTaskId(null);
    }
  };

  return (
    <div id="lifeops-tasks-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.35em] font-medium mb-1">
            Operational Directives
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Directives & Execution
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1 font-light">
            Capture, sequence, and execute high-leverage deliverables across portfolios.
          </p>
        </div>

        <button
          id="tasks-create-btn"
          onClick={() => openQuickAdd('task')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest shadow-[0_0_12px_rgba(197,160,89,0.25)] hover:bg-[#d8b56f] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Directive</span>
        </button>
      </div>

      {/* 3D Directive Horizon Focus Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-[#080808] border border-[#c5a059]/25 p-5 rounded-sm relative overflow-hidden">
        <div className="md:col-span-2 space-y-1.5 z-10">
          <div className="flex items-center gap-2 text-[9px] font-mono text-[#c5a059] uppercase tracking-[0.25em]">
            <Sparkles className="w-3 h-3 text-[#c5a059]" />
            <span>3D Directive Resonance Matrix</span>
          </div>
          <h3 className="text-base font-serif text-white tracking-wide">
            Dynamic Prism Focus Engine
          </h3>
          <p className="text-xs text-[#7a7a7a] font-light max-w-xl">
            Real-time visual refraction reflecting priority density across {filteredTasks.length} active directives. Hover and interact with the crystal core.
          </p>
        </div>
        <div className="md:col-span-1 flex items-center justify-center h-28">
          <SpatialFloatingPrism3D size={110} speed={1.2} />
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-4">
        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#1a1a1a] pb-4">
          {[
            { id: 'all', label: 'All Active', count: tasks.filter((t) => t.status !== 'archived').length },
            { id: 'today', label: 'Due Today', count: tasks.filter((t) => t.dueDate === todayStr && t.status !== 'completed').length },
            { id: 'upcoming', label: 'Upcoming', count: tasks.filter((t) => t.dueDate && t.dueDate > todayStr && t.status !== 'completed').length },
            { id: 'overdue', label: 'Overdue', count: tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== 'completed').length },
            { id: 'completed', label: 'Completed', count: tasks.filter((t) => t.status === 'completed').length },
            { id: 'archived', label: 'Archived', count: tasks.filter((t) => t.status === 'archived').length },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tasks-tab-${tab.id}`}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-sm text-[10px] uppercase tracking-widest font-medium transition-colors flex items-center gap-2 ${
                statusFilter === tab.id
                  ? 'bg-[#0e0e0e] text-[#c5a059] border border-[#c5a059]/40'
                  : 'text-[#7a7a7a] hover:text-white hover:bg-[#0a0a0a] border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-[#141414] text-[#c5a059]">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Select dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
            <input
              id="tasks-search-input"
              type="text"
              placeholder="Search by directive title, keyword, or dossier note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              id="tasks-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-[#d1d1d1] text-xs focus:outline-none focus:border-[#c5a059]"
            >
              <option value="all">All Domains</option>
              <option value="work">Work & Strategy</option>
              <option value="learning">Knowledge & R&D</option>
              <option value="health">Vitality & Health</option>
              <option value="finance">Capital & Treasury</option>
              <option value="personal">Private Matters</option>
              <option value="creative">Creative & Culture</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              id="tasks-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-[#d1d1d1] text-xs focus:outline-none focus:border-[#c5a059]"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="title">Sort by Title</option>
              <option value="createdAt">Sort by Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-16 text-center rounded-sm bg-[#080808] border border-[#1a1a1a]">
            <CheckSquare className="w-8 h-8 text-[#555] mx-auto mb-3" />
            <h4 className="text-lg font-serif italic text-white">No Directives Found</h4>
            <p className="text-xs text-[#7a7a7a] mt-1 mb-6">
              Adjust your search query or dispatch a new directive to proceed.
            </p>
            <button
              onClick={() => openQuickAdd('task')}
              className="px-5 py-2 rounded-sm bg-[#c5a059] text-black text-xs uppercase tracking-widest font-semibold hover:bg-[#d8b56f]"
            >
              Dispatch Directive
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = task.status !== 'completed' && task.dueDate && task.dueDate < todayStr;
            const linkedGoal = goals.find((g) => g.id === task.goalId);

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-sm border transition-all ${
                  task.status === 'completed'
                    ? 'bg-[#080808]/60 border-[#141414] opacity-60'
                    : isOverdue
                    ? 'bg-[#0f0707] border-rose-900/30 hover:border-rose-800/50'
                    : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#c5a059]/30'
                }`}
              >
                {/* Left side: checkbox + info */}
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <button
                    id={`task-toggle-${task.id}`}
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-sm border flex items-center justify-center transition-colors flex-shrink-0 ${
                      task.status === 'completed'
                        ? 'bg-[#c5a059] border-[#c5a059] text-black'
                        : 'border-[#333] hover:border-[#c5a059] bg-[#050505]'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`text-sm font-medium transition-colors ${
                          task.status === 'completed'
                            ? 'line-through text-[#555]'
                            : 'text-[#eee] group-hover:text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      {priorityBadge(task.priority)}
                      {isOverdue && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-rose-950 text-rose-400 font-mono uppercase tracking-wider border border-rose-800/40">
                          Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#7a7a7a] mt-1.5 line-clamp-2 font-light">{task.description}</p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[10px] text-[#7a7a7a]">
                      <span className="px-2 py-0.5 rounded-sm bg-[#111] text-[#999] border border-[#1a1a1a] uppercase font-mono tracking-wider">
                        {task.category}
                      </span>

                      {task.dueDate && (
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-[#555]" />
                          {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
                        </span>
                      )}

                      {task.estimatedDurationMinutes && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-[#555]" />
                          {task.estimatedDurationMinutes} mins
                        </span>
                      )}

                      {linkedGoal && (
                        <span className="flex items-center gap-1 text-[#c5a059] font-medium font-serif italic">
                          <Target className="w-3 h-3 text-[#c5a059]" />
                          <span>{linkedGoal.title}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex items-center gap-2 mt-3 sm:mt-0 justify-end flex-shrink-0">
                  <button
                    id={`task-edit-${task.id}`}
                    onClick={() => setEditingTask(task)}
                    className="p-2 text-[#555] hover:text-[#c5a059] rounded-sm hover:bg-[#111] transition-colors"
                    title="Edit Directive"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`task-delete-${task.id}`}
                    onClick={() => setDeletingTaskId(task.id)}
                    className="p-2 text-[#555] hover:text-rose-400 rounded-sm hover:bg-[#111] transition-colors"
                    title="Delete Directive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div
          id="task-edit-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setEditingTask(null)}
        >
          <div
            id="task-edit-modal"
            className="w-full max-w-lg bg-[#080808] border border-[#c5a059]/30 rounded-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
              <h3 className="text-lg font-serif italic text-white">Edit Directive Dossier</h3>
              <button onClick={() => setEditingTask(null)} className="text-[#7a7a7a] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Priority</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Domain</label>
                  <select
                    value={editingTask.category}
                    onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="work">Work</option>
                    <option value="learning">Learning</option>
                    <option value="health">Health</option>
                    <option value="finance">Finance</option>
                    <option value="personal">Personal</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editingTask.dueDate || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Est. Duration (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={editingTask.estimatedDurationMinutes || 30}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, estimatedDurationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1a1a1a]">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 rounded-sm text-xs font-medium text-[#7a7a7a] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm bg-[#c5a059] text-black text-xs uppercase tracking-widest font-semibold hover:bg-[#d8b56f]"
                >
                  Save Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTaskId && (
        <div
          id="task-delete-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setDeletingTaskId(null)}
        >
          <div
            id="task-delete-modal"
            className="w-full max-w-sm bg-[#080808] border border-rose-900/40 rounded-sm p-6 text-center space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-serif italic text-white">Retire Directive?</h4>
            <p className="text-xs text-[#7a7a7a]">
              This directive will be removed from your executive queue. This action cannot be reversed.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingTaskId(null)}
                className="px-4 py-2 rounded-sm text-xs font-medium text-[#7a7a7a] hover:text-white bg-[#111]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
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
