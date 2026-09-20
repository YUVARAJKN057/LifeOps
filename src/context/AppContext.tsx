import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Task,
  Goal,
  Habit,
  Expense,
  NotificationItem,
  UserProfile,
  ProductivityScore,
  DailyFlowPlan,
  AIProposedAction,
  AIMessage,
} from '../types';
import { api, getAuthToken, clearAuthToken, RegisterPayload, GoogleAuthPayload, SendOtpPayload, SendOtpResponse, VerifyOtpPayload } from '../lib/api';

export type ActiveTab =
  | 'dashboard'
  | 'tasks'
  | 'goals'
  | 'habits'
  | 'calendar'
  | 'expenses'
  | 'analytics'
  | 'ai'
  | 'daily_flow'
  | 'notifications'
  | 'settings'
  | 'profile';

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  proposedActions?: AIProposedAction[];
}

interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  expenses: Expense[];
  notifications: NotificationItem[];
  dailyFlow: DailyFlowPlan | null;
  dailyFlowPlan: DailyFlowPlan | null;
  productivityScore: ProductivityScore;
  unreadNotificationCount: number;

  // AI Chat & Execution
  chatMessages: ChatMessageItem[];
  isGeneratingAI: boolean;
  sendChatMessage: (message: string) => Promise<void>;
  executeAIAction: (action: AIProposedAction) => Promise<void>;

  // UI controls
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  quickAddInitialType: 'task' | 'goal' | 'habit' | 'expense';
  setQuickAddInitialType: (type: 'task' | 'goal' | 'habit' | 'expense') => void;
  openQuickAdd: (type?: 'task' | 'goal' | 'habit' | 'expense') => void;
  isLiveVoiceOpen: boolean;
  setIsLiveVoiceOpen: (open: boolean) => void;
  openLiveVoice: () => void;
  isExerciseCoachOpen: boolean;
  setIsExerciseCoachOpen: (open: boolean) => void;
  exerciseCoachInitialId: string;
  openExerciseCoach: (exerciseId?: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Toasts
  toasts: Toast[];
  addToast: (
    typeOrOptions: 'success' | 'info' | 'warning' | 'error' | { title: string; message?: string; type?: 'success' | 'info' | 'warning' | 'error' },
    title?: string,
    message?: string
  ) => void;
  removeToast: (id: string) => void;

  // Auth operations
  loginAsDemo: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<void>;
  register: (payload: RegisterPayload | string, email?: string, pass?: string) => Promise<void>;
  sendOtp: (payload: SendOtpPayload) => Promise<SendOtpResponse>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<{ token: string; user: UserProfile }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;

  // CRUD
  fetchData: () => Promise<void>;
  refreshData: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
  createGoal: (goal: Partial<Goal>) => Promise<Goal>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  toggleMilestone: (goalId: string, milestoneId: string) => Promise<void>;
  createHabit: (habit: Partial<Habit>) => Promise<Habit>;
  toggleHabitToday: (id: string, customDate?: string) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<Habit>;
  deleteHabit: (id: string) => Promise<void>;
  createExpense: (expense: Partial<Expense>) => Promise<Expense>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;

  // Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  executeApprovedActions: (actions: AIProposedAction[]) => Promise<number>;
  refreshDailyFlow: () => Promise<void>;
  resetDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dailyFlow, setDailyFlow] = useState<DailyFlowPlan | null>(null);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isExerciseCoachOpen, setIsExerciseCoachOpen] = useState(false);
  const [exerciseCoachInitialId, setExerciseCoachInitialId] = useState('squat');
  const [quickAddInitialType, setQuickAddInitialType] = useState<'task' | 'goal' | 'habit' | 'expense'>('task');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (
      typeOrOptions:
        | 'success'
        | 'info'
        | 'warning'
        | 'error'
        | { title: string; message?: string; type?: 'success' | 'info' | 'warning' | 'error' },
      title?: string,
      message?: string
    ) => {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      let toastItem: Toast;

      if (typeof typeOrOptions === 'object') {
        toastItem = {
          id,
          type: typeOrOptions.type || 'info',
          title: typeOrOptions.title,
          message: typeOrOptions.message,
        };
      } else {
        toastItem = {
          id,
          type: typeOrOptions,
          title: title || 'Notification',
          message,
        };
      }

      setToasts((prev) => [...prev, toastItem]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openQuickAdd = useCallback((type: 'task' | 'goal' | 'habit' | 'expense' = 'task') => {
    setQuickAddInitialType(type);
    setIsQuickAddOpen(true);
  }, []);

  const openLiveVoice = useCallback(() => {
    setIsLiveVoiceOpen(true);
  }, []);

  const openExerciseCoach = useCallback((exerciseId: string = 'squat') => {
    setExerciseCoachInitialId(exerciseId);
    setIsExerciseCoachOpen(true);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setTasks([]);
        setGoals([]);
        setHabits([]);
        setExpenses([]);
        setNotifications([]);
        setIsLoading(false);
        return;
      }

      const [uRes, tRes, gRes, hRes, eRes, nRes] = await Promise.all([
        api.getMe().catch(() => ({ user: null })),
        api.getTasks().catch(() => ({ tasks: [] })),
        api.getGoals().catch(() => ({ goals: [] })),
        api.getHabits().catch(() => ({ habits: [] })),
        api.getExpenses().catch(() => ({ expenses: [] })),
        api.getNotifications().catch(() => ({ notifications: [] })),
      ]);

      if (uRes.user) {
        setUser(uRes.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setTasks(tRes.tasks || []);
      setGoals(gRes.goals || []);
      setHabits(hRes.habits || []);
      setExpenses(eRes.expenses || []);
      setNotifications(nRes.notifications || []);
    } catch (err) {
      console.error('Failed to load application state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') || (e.altKey && e.key.toLowerCase() === 'v')) {
        e.preventDefault();
        setIsLiveVoiceOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Productivity Score calculation
  const productivityScore = useMemo<ProductivityScore>(() => {
    const today = new Date().toISOString().split('T')[0];
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const totalActiveTasks = tasks.filter((t) => t.status !== 'archived');
    const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate && t.dueDate < today);

    const taskRate = totalActiveTasks.length > 0 ? completedTasks.length / totalActiveTasks.length : 0.8;
    const taskPoints = Math.round(taskRate * 40);

    let avgGoalProgress = 0;
    if (goals.length > 0) {
      const sum = goals.reduce((acc, g) => acc + g.progress, 0);
      avgGoalProgress = sum / goals.length;
    } else {
      avgGoalProgress = 70;
    }
    const goalPoints = Math.round((avgGoalProgress / 100) * 30);

    let habitConsistencyAvg = 0;
    if (habits.length > 0) {
      const sum = habits.reduce((acc, h) => {
        const rate = Math.min(1, h.currentStreak / Math.max(1, h.targetDaysPerWeek));
        return acc + rate;
      }, 0);
      habitConsistencyAvg = sum / habits.length;
    } else {
      habitConsistencyAvg = 0.8;
    }
    const habitPoints = Math.round(habitConsistencyAvg * 30);
    const overduePenalty = Math.min(25, overdueTasks.length * 6);
    const total = Math.max(10, Math.min(100, taskPoints + goalPoints + habitPoints - overduePenalty));

    let grade: 'Elite' | 'Optimal' | 'Balanced' | 'Needs Focus' = 'Balanced';
    if (total >= 90) grade = 'Elite';
    else if (total >= 75) grade = 'Optimal';
    else if (total >= 50) grade = 'Balanced';
    else grade = 'Needs Focus';

    return {
      total,
      taskCompletionPoints: taskPoints,
      goalProgressPoints: goalPoints,
      habitConsistencyPoints: habitPoints,
      overduePenalty,
      grade,
      trend: total >= 75 ? 'up' : 'stable',
    };
  }, [tasks, goals, habits]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Auth methods
  const loginAsDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.loginDemo();
      setUser(res.user);
      setIsAuthenticated(true);
      await fetchData();
      addToast('success', 'Welcome to LifeOps Demo', 'Exploring with sample productivity data.');
    } catch (err: any) {
      addToast('error', 'Login Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setIsAuthenticated(true);
      await fetchData();
      addToast('success', 'Logged in', `Welcome back, ${res.user.name}`);
    } catch (err: any) {
      addToast('error', 'Authentication Error', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (payload: GoogleAuthPayload) => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle(payload);
      setUser(res.user);
      setIsAuthenticated(true);
      await fetchData();
      addToast('success', 'Google Sign-In Successful', `Welcome, ${res.user.name}`);
    } catch (err: any) {
      addToast('error', 'Google Sign-In Error', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload | string, email?: string, pass?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(payload, email, pass);
      setUser(res.user);
      setIsAuthenticated(true);
      await fetchData();
      const displayName = typeof payload === 'string' ? payload : payload.name;
      addToast('success', 'Account Created', `Welcome to LifeOps, ${displayName}`);
    } catch (err: any) {
      addToast('error', 'Registration Error', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (payload: SendOtpPayload) => {
    setIsLoading(true);
    try {
      const res = await api.sendOtp(payload);
      addToast('info', 'Verification OTP Dispatched', `Code sent to ${payload.phone}`);
      return res;
    } catch (err: any) {
      addToast('error', 'OTP Dispatch Failed', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (payload: VerifyOtpPayload) => {
    setIsLoading(true);
    try {
      const res = await api.verifyOtp(payload);
      setUser(res.user);
      setIsAuthenticated(true);
      await fetchData();
      addToast('success', 'Mobile & Email Verified ✨', `Welcome to LifeOps, ${res.user.name}`);
      return res;
    } catch (err: any) {
      addToast('error', 'Verification Failed', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    setTasks([]);
    setGoals([]);
    setHabits([]);
    setExpenses([]);
    setNotifications([]);
    setActiveTab('dashboard');
    addToast('info', 'Signed Out', 'You have been safely logged out.');
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await api.updateProfile(updates);
      setUser(res.user);
      addToast('success', 'Profile Updated', 'Your settings have been saved.');
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
    }
  };

  // Task CRUD
  const createTask = async (taskData: Partial<Task>): Promise<Task> => {
    const res = await api.createTask(taskData);
    setTasks((prev) => [res.task, ...prev]);
    addToast('success', 'Task Created', res.task.title);
    return res.task;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    const res = await api.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.task : t)));
    addToast('info', 'Task Updated', res.task.title);
    return res.task;
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addToast('info', 'Task Deleted');
  };

  const toggleTaskStatus = async (id: string) => {
    const current = tasks.find((t) => t.id === id);
    if (!current) return;
    const newStatus = current.status === 'completed' ? 'todo' : 'completed';
    const updated = await updateTask(id, { status: newStatus });
    if (newStatus === 'completed') {
      addToast('success', 'Task Completed! ✨', updated.title);
    }
  };

  // Goal CRUD
  const createGoal = async (goalData: Partial<Goal>): Promise<Goal> => {
    const res = await api.createGoal(goalData);
    setGoals((prev) => [res.goal, ...prev]);
    addToast('success', 'Goal Created', res.goal.title);
    return res.goal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>): Promise<Goal> => {
    const res = await api.updateGoal(id, updates);
    setGoals((prev) => prev.map((g) => (g.id === id ? res.goal : g)));
    addToast('info', 'Goal Updated', res.goal.title);
    return res.goal;
  };

  const deleteGoal = async (id: string) => {
    await api.deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    addToast('info', 'Goal Deleted');
  };

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId
        ? {
            ...m,
            completed: !m.completed,
            completedAt: !m.completed ? new Date().toISOString() : undefined,
          }
        : m
    );

    await updateGoal(goalId, { milestones: updatedMilestones });
  };

  // Habit CRUD
  const createHabit = async (habitData: Partial<Habit>): Promise<Habit> => {
    const res = await api.createHabit(habitData);
    setHabits((prev) => [res.habit, ...prev]);
    addToast('success', 'Habit Created', res.habit.name);
    return res.habit;
  };

  const toggleHabitToday = async (id: string, customDate?: string) => {
    const res = await api.toggleHabitDate(id, customDate);
    setHabits((prev) => prev.map((h) => (h.id === id ? res.habit : h)));
    const isCompleted = res.habit.completions.includes(
      customDate || new Date().toISOString().split('T')[0]
    );
    if (isCompleted) {
      addToast(
        'success',
        'Habit Checked In! 🔥',
        `${res.habit.name} (${res.habit.currentStreak} day streak)`
      );
    }
  };

  const updateHabit = async (id: string, updates: Partial<Habit>): Promise<Habit> => {
    const res = await api.updateHabit(id, updates);
    setHabits((prev) => prev.map((h) => (h.id === id ? res.habit : h)));
    addToast('info', 'Habit Updated', res.habit.name);
    return res.habit;
  };

  const deleteHabit = async (id: string) => {
    await api.deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    addToast('info', 'Habit Removed');
  };

  // Expense CRUD
  const createExpense = async (expData: Partial<Expense>): Promise<Expense> => {
    const res = await api.createExpense(expData);
    setExpenses((prev) => [res.expense, ...prev]);
    addToast('success', 'Expense Logged', `$${res.expense.amount} - ${res.expense.description}`);
    return res.expense;
  };

  const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
    const res = await api.updateExpense(id, updates);
    setExpenses((prev) => prev.map((e) => (e.id === id ? res.expense : e)));
    addToast('info', 'Expense Updated');
    return res.expense;
  };

  const deleteExpense = async (id: string) => {
    await api.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addToast('info', 'Expense Deleted');
  };

  // Notifications
  const markNotificationRead = async (id: string) => {
    await api.markNotificationRead(id);
    if (id === 'all') {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } else {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const deleteNotification = async (id: string) => {
    await api.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    addToast('info', 'Notification Removed');
  };

  // AI Chat & Action Handling
  const sendChatMessage = async (promptText: string) => {
    const userMsg: ChatMessageItem = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsGeneratingAI(true);

    try {
      const history = chatMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : ('assistant' as const),
        content: m.text,
      }));

      const res = await api.chatWithAI(promptText, history);
      const textContent =
        res?.message?.content ||
        (res as any)?.explanation ||
        (res as any)?.summary ||
        'Here is the analysis based on your current workload.';

      const actions =
        res?.message?.proposedActions ||
        (res as any)?.proposedActions ||
        [];

      const assistantMsg: ChatMessageItem = {
        id: 'msg-resp-' + Date.now(),
        sender: 'assistant',
        text: textContent,
        timestamp: new Date().toISOString(),
        proposedActions: actions,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('AI Assistant error caught in client:', err);
      addToast('error', 'AI Assistant Notice', err.message || 'Connecting to LifeOps Intelligence...');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const executeAIAction = async (action: AIProposedAction) => {
    try {
      const res = await api.executeAIActions([action]);
      if (res.success) {
        addToast({
          title: 'Action Executed',
          message: `Applied "${action.title}" directly to your LifeOps database.`,
          type: 'success',
        });
        action.status = 'executed';
        setChatMessages((prev) =>
          prev.map((msg) => {
            if (!msg.proposedActions) return msg;
            return {
              ...msg,
              proposedActions: msg.proposedActions.map((a) =>
                a.id === action.id ? { ...a, status: 'executed' } : a
              ),
            };
          })
        );
        await fetchData();
      }
    } catch (err: any) {
      addToast({
        title: 'Execution Failed',
        message: err.message,
        type: 'error',
      });
    }
  };

  const executeApprovedActions = async (actions: AIProposedAction[]): Promise<number> => {
    const res = await api.executeAIActions(actions);
    if (res.success) {
      addToast(
        'success',
        'AI Actions Executed',
        `Applied ${res.executedCount} change(s) across your LifeOps.`
      );
      await fetchData();
      return res.executedCount;
    }
    return 0;
  };

  const refreshDailyFlow = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await api.generateDailyFlow();
      setDailyFlow(res.plan);
      addToast('success', 'Daily Flow Refreshed', res.plan.focusTheme);
    } catch (err: any) {
      addToast('error', 'Daily Flow Error', err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const resetDemoData = async () => {
    setIsLoading(true);
    try {
      await api.resetDemoData();
      await fetchData();
      addToast('success', 'Demo Reset', 'Restored sample tasks, goals, habits, and expenses.');
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        activeTab,
        setActiveTab,
        tasks,
        goals,
        habits,
        expenses,
        notifications,
        dailyFlow,
        dailyFlowPlan: dailyFlow,
        productivityScore,
        unreadNotificationCount,
        chatMessages,
        isGeneratingAI,
        sendChatMessage,
        executeAIAction,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isQuickAddOpen,
        setIsQuickAddOpen,
        quickAddInitialType,
        setQuickAddInitialType,
        openQuickAdd,
        isLiveVoiceOpen,
        setIsLiveVoiceOpen,
        openLiveVoice,
        isExerciseCoachOpen,
        setIsExerciseCoachOpen,
        exerciseCoachInitialId,
        openExerciseCoach,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
        loginAsDemo,
        login,
        loginWithGoogle,
        register,
        sendOtp,
        verifyOtp,
        logout,
        updateUserProfile,
        fetchData,
        refreshData: fetchData,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        createGoal,
        updateGoal,
        deleteGoal,
        toggleMilestone,
        createHabit,
        toggleHabitToday,
        updateHabit,
        deleteHabit,
        createExpense,
        updateExpense,
        deleteExpense,
        markNotificationRead,
        markNotificationAsRead: markNotificationRead,
        markAllNotificationsAsRead: () => markNotificationRead('all'),
        deleteNotification,
        executeApprovedActions,
        refreshDailyFlow,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
