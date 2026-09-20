import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckSquare,
  Target,
  Flame,
  IndianRupee,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Priority, TaskCategory, ExpenseCategory, HabitFrequency } from '../../types';

export const QuickAddModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    quickAddInitialType,
    createTask,
    createGoal,
    createHabit,
    createExpense,
    goals,
  } = useApp();

  const [activeType, setActiveType] = useState<'task' | 'goal' | 'habit' | 'expense'>(quickAddInitialType);

  useEffect(() => {
    if (isQuickAddOpen) {
      setActiveType(quickAddInitialType);
    }
  }, [isQuickAddOpen, quickAddInitialType]);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('work');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskDueTime, setTaskDueTime] = useState('14:00');
  const [taskDuration, setTaskDuration] = useState(45);
  const [taskGoalId, setTaskGoalId] = useState('');

  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalCategory, setGoalCategory] = useState<TaskCategory>('work');
  const [goalPriority, setGoalPriority] = useState<Priority>('high');
  const [goalTargetDate, setGoalTargetDate] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  );
  const [goalMilestonesInput, setGoalMilestonesInput] = useState('');

  // Habit form state
  const [habitName, setHabitName] = useState('');
  const [habitDesc, setHabitDesc] = useState('');
  const [habitCategory, setHabitCategory] = useState<TaskCategory>('health');
  const [habitFrequency, setHabitFrequency] = useState<HabitFrequency>('daily');
  const [habitTargetDays, setHabitTargetDays] = useState(7);
  const [habitReminder, setHabitReminder] = useState('09:00');

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Food');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseMethod, setExpenseMethod] = useState<'credit_card' | 'debit_card' | 'cash' | 'transfer'>('credit_card');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isQuickAddOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (activeType === 'task') {
        if (!taskTitle.trim()) {
          setError('Task title is required');
          setIsSubmitting(false);
          return;
        }
        await createTask({
          title: taskTitle.trim(),
          description: taskDesc.trim(),
          priority: taskPriority,
          category: taskCategory,
          dueDate: taskDueDate,
          dueTime: taskDueTime || undefined,
          estimatedDurationMinutes: Number(taskDuration) || 30,
          goalId: taskGoalId || undefined,
        });
        setTaskTitle('');
        setTaskDesc('');
      } else if (activeType === 'goal') {
        if (!goalTitle.trim()) {
          setError('Goal title is required');
          setIsSubmitting(false);
          return;
        }
        const parsedMilestones = goalMilestonesInput
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .map((line, idx) => ({
            id: `m-quick-${Date.now()}-${idx}`,
            title: line.replace(/^[-*•\d.]+\s*/, '').trim(),
            completed: false,
          }));

        await createGoal({
          title: goalTitle.trim(),
          description: goalDesc.trim(),
          category: goalCategory,
          priority: goalPriority,
          targetDate: goalTargetDate,
          milestones: parsedMilestones,
        });
        setGoalTitle('');
        setGoalDesc('');
        setGoalMilestonesInput('');
      } else if (activeType === 'habit') {
        if (!habitName.trim()) {
          setError('Habit name is required');
          setIsSubmitting(false);
          return;
        }
        await createHabit({
          name: habitName.trim(),
          description: habitDesc.trim(),
          category: habitCategory,
          frequency: habitFrequency,
          targetDaysPerWeek: Number(habitTargetDays) || 7,
          reminderTime: habitReminder,
        });
        setHabitName('');
        setHabitDesc('');
      } else if (activeType === 'expense') {
        if (!expenseAmount || isNaN(Number(expenseAmount)) || Number(expenseAmount) <= 0) {
          setError('Please enter a valid expense amount');
          setIsSubmitting(false);
          return;
        }
        if (!expenseDesc.trim()) {
          setError('Expense description is required');
          setIsSubmitting(false);
          return;
        }
        await createExpense({
          amount: Number(expenseAmount),
          description: expenseDesc.trim(),
          category: expenseCategory,
          date: expenseDate,
          paymentMethod: expenseMethod,
        });
        setExpenseAmount('');
        setExpenseDesc('');
      }

      setIsQuickAddOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="lifeops-quick-add-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={() => setIsQuickAddOpen(false)}
    >
      <div
        id="lifeops-quick-add-modal"
        className="w-full max-w-xl bg-[#080808] border border-[#c5a059]/40 rounded-sm shadow-2xl overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Type Selector */}
        <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a] bg-[#050505]">
          <div className="flex items-center gap-1 p-0.5 bg-[#0a0a0a] rounded-sm border border-[#1a1a1a]">
            <button
              type="button"
              id="quick-add-tab-task"
              onClick={() => {
                setActiveType('task');
                setError('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif uppercase tracking-widest transition-colors ${
                activeType === 'task'
                  ? 'bg-[#c5a059] text-black font-semibold'
                  : 'text-[#7a7a7a] hover:text-white'
              }`}
            >
              <CheckSquare className="w-3 h-3" />
              Task
            </button>
            <button
              type="button"
              id="quick-add-tab-goal"
              onClick={() => {
                setActiveType('goal');
                setError('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif uppercase tracking-widest transition-colors ${
                activeType === 'goal'
                  ? 'bg-[#c5a059] text-black font-semibold'
                  : 'text-[#7a7a7a] hover:text-white'
              }`}
            >
              <Target className="w-3 h-3" />
              Objective
            </button>
            <button
              type="button"
              id="quick-add-tab-habit"
              onClick={() => {
                setActiveType('habit');
                setError('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif uppercase tracking-widest transition-colors ${
                activeType === 'habit'
                  ? 'bg-[#c5a059] text-black font-semibold'
                  : 'text-[#7a7a7a] hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3" />
              Ritual
            </button>
            <button
              type="button"
              id="quick-add-tab-expense"
              onClick={() => {
                setActiveType('expense');
                setError('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-serif uppercase tracking-widest transition-colors ${
                activeType === 'expense'
                  ? 'bg-[#c5a059] text-black font-semibold'
                  : 'text-[#7a7a7a] hover:text-white'
              }`}
            >
              <IndianRupee className="w-3 h-3" />
              Outflow (₹)
            </button>
          </div>

          <button
            id="quick-add-close-btn"
            type="button"
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1.5 text-[#7a7a7a] hover:text-white rounded-sm hover:bg-[#111]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-sm bg-rose-950/30 border border-rose-900/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* TASK FORM */}
          {activeType === 'task' && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Task Title *</label>
                <input
                  id="task-title-input"
                  type="text"
                  required
                  placeholder="e.g. Implement Distributed Lock with Redis TTL"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Description / Deliverable</label>
                <textarea
                  id="task-desc-input"
                  rows={2}
                  placeholder="Detailed notes or acceptance criteria..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Priority</label>
                  <select
                    id="task-priority-select"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Category</label>
                  <select
                    id="task-category-select"
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
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
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Due Date</label>
                  <input
                    id="task-duedate-input"
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Est. Minutes</label>
                  <input
                    id="task-duration-input"
                    type="number"
                    min={5}
                    step={5}
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                </div>
              </div>

              {goals.length > 0 && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Link to Strategic Objective</label>
                  <select
                    id="task-goal-select"
                    value={taskGoalId}
                    onChange={(e) => setTaskGoalId(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="">-- No Direct Goal Link --</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title} ({g.progress}%)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {/* GOAL FORM */}
          {activeType === 'goal' && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Strategic Objective *</label>
                <input
                  id="goal-title-input"
                  type="text"
                  required
                  placeholder="e.g. Master Kafka & Publish Architecture RFC"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Category</label>
                  <select
                    id="goal-category-select"
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="work">Work / Career</option>
                    <option value="learning">Learning</option>
                    <option value="health">Health & Fitness</option>
                    <option value="finance">Financial</option>
                    <option value="personal">Personal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Priority</label>
                  <select
                    id="goal-priority-select"
                    value={goalPriority}
                    onChange={(e) => setGoalPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Target Date</label>
                  <input
                    id="goal-targetdate-input"
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">
                  Initial Milestones (One per line)
                </label>
                <textarea
                  id="goal-milestones-input"
                  rows={3}
                  placeholder="Complete course modules&#10;Build prototype repository&#10;Submit pull request & benchmark"
                  value={goalMilestonesInput}
                  onChange={(e) => setGoalMilestonesInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                />
              </div>
            </>
          )}

          {/* HABIT FORM */}
          {activeType === 'habit' && (
            <>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Ritual Name *</label>
                <input
                  id="habit-name-input"
                  type="text"
                  required
                  placeholder="e.g. 20-minute Daily Algorithmic Problem Solving"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Category</label>
                  <select
                    id="habit-category-select"
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="health">Health & Body</option>
                    <option value="learning">Mind & Skills</option>
                    <option value="work">Work & Focus</option>
                    <option value="personal">Life & Routines</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Frequency</label>
                  <select
                    id="habit-frequency-select"
                    value={habitFrequency}
                    onChange={(e) => setHabitFrequency(e.target.value as HabitFrequency)}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="daily">Every Day (7x)</option>
                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                    <option value="weekends">Weekends Only</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Target Days/Wk</label>
                  <input
                    id="habit-targetdays-input"
                    type="number"
                    min={1}
                    max={7}
                    value={habitTargetDays}
                    onChange={(e) => setHabitTargetDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {/* EXPENSE FORM */}
          {activeType === 'expense' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Amount (₹ INR) *</label>
                  <input
                    id="expense-amount-input"
                    type="number"
                    step="1"
                    min="1"
                    required
                    placeholder="750"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Category</label>
                  <select
                    id="expense-category-select"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="Food">Food & Dining</option>
                    <option value="Transport">Transport & Transit</option>
                    <option value="Education">Education & Tools</option>
                    <option value="Shopping">Shopping & Gear</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Bills">Bills & Utilities</option>
                    <option value="Health">Health & Fitness</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Description *</label>
                <input
                  id="expense-desc-input"
                  type="text"
                  required
                  placeholder="e.g. AWS & Database Hosting, Organic Groceries"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Date</label>
                  <input
                    id="expense-date-input"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1.5">Payment Method</label>
                  <select
                    id="expense-method-select"
                    value={expenseMethod}
                    onChange={(e) => setExpenseMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="cash">Cash</option>
                    <option value="transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1a1a1a]">
            <button
              id="quick-add-cancel-btn"
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-4 py-2 rounded-sm text-xs font-serif uppercase tracking-widest text-[#7a7a7a] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              id="quick-add-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-sm bg-[#c5a059] text-black text-xs uppercase tracking-widest font-semibold hover:bg-[#d8b56f] transition-all cursor-pointer shadow-[0_0_12px_rgba(197,160,89,0.2)]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving...' : activeType === 'task' ? 'Save Task' : activeType === 'goal' ? 'Save Objective' : activeType === 'habit' ? 'Save Ritual' : 'Save Outflow'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
