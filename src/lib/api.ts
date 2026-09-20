import {
  Task,
  Goal,
  Habit,
  Expense,
  NotificationItem,
  UserProfile,
  AIMessage,
  DailyFlowPlan,
  WeeklyReportData,
  AIProposedAction,
} from '../types';

const TOKEN_KEY = 'lifeops_auth_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  occupation?: string;
  monthlyBudget?: number;
}

export interface GoogleAuthPayload {
  credential?: string;
  email?: string;
  name?: string;
  picture?: string;
  sub?: string;
  googleId?: string;
}

export interface SendOtpPayload {
  email: string;
  phone: string;
  name?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  phone: string;
  email: string;
  otpPreview?: string;
  expiresInSeconds?: number;
}

export interface VerifyOtpPayload {
  email: string;
  phone?: string;
  otp: string;
  name?: string;
  password?: string;
  city?: string;
  occupation?: string;
  monthlyBudget?: number;
}

export const api = {
  // Auth & OTP
  sendOtp: async (payload: SendOtpPayload): Promise<SendOtpResponse> => {
    return apiRequest<SendOtpResponse>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  verifyOtp: async (payload: VerifyOtpPayload): Promise<{ token: string; user: UserProfile; message?: string }> => {
    const res = await apiRequest<{ token: string; user: UserProfile; message?: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.token);
    return res;
  },
  loginDemo: async (): Promise<{ token: string; user: UserProfile }> => {
    const res = await apiRequest<{ token: string; user: UserProfile }>('/api/auth/demo', {
      method: 'POST',
    });
    setAuthToken(res.token);
    return res;
  },
  login: async (email: string, password: string): Promise<{ token: string; user: UserProfile }> => {
    const res = await apiRequest<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },
  loginWithGoogle: async (payload: GoogleAuthPayload): Promise<{ token: string; user: UserProfile }> => {
    const res = await apiRequest<{ token: string; user: UserProfile }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAuthToken(res.token);
    return res;
  },
  register: async (payload: RegisterPayload | string, email?: string, password?: string): Promise<{ token: string; user: UserProfile }> => {
    const body = typeof payload === 'string'
      ? { name: payload, email, password }
      : payload;
    const res = await apiRequest<{ token: string; user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    setAuthToken(res.token);
    return res;
  },
  getMe: async (): Promise<{ user: UserProfile }> => {
    return apiRequest<{ user: UserProfile }>('/api/auth/me');
  },
  updateProfile: async (updates: Partial<UserProfile>): Promise<{ user: UserProfile }> => {
    return apiRequest<{ user: UserProfile }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Tasks
  getTasks: async (): Promise<{ tasks: Task[] }> => {
    return apiRequest<{ tasks: Task[] }>('/api/tasks');
  },
  createTask: async (task: Partial<Task>): Promise<{ task: Task }> => {
    return apiRequest<{ task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },
  updateTask: async (id: string, updates: Partial<Task>): Promise<{ task: Task }> => {
    return apiRequest<{ task: Task }>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteTask: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiRequest<{ success: boolean; id: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Goals
  getGoals: async (): Promise<{ goals: Goal[] }> => {
    return apiRequest<{ goals: Goal[] }>('/api/goals');
  },
  createGoal: async (goal: Partial<Goal>): Promise<{ goal: Goal }> => {
    return apiRequest<{ goal: Goal }>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },
  updateGoal: async (id: string, updates: Partial<Goal>): Promise<{ goal: Goal }> => {
    return apiRequest<{ goal: Goal }>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteGoal: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiRequest<{ success: boolean; id: string }>(`/api/goals/${id}`, {
      method: 'DELETE',
    });
  },

  // Habits
  getHabits: async (): Promise<{ habits: Habit[] }> => {
    return apiRequest<{ habits: Habit[] }>('/api/habits');
  },
  createHabit: async (habit: Partial<Habit>): Promise<{ habit: Habit }> => {
    return apiRequest<{ habit: Habit }>('/api/habits', {
      method: 'POST',
      body: JSON.stringify(habit),
    });
  },
  toggleHabitDate: async (id: string, date?: string): Promise<{ habit: Habit }> => {
    return apiRequest<{ habit: Habit }>(`/api/habits/${id}/toggle-date`, {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },
  updateHabit: async (id: string, updates: Partial<Habit>): Promise<{ habit: Habit }> => {
    return apiRequest<{ habit: Habit }>(`/api/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteHabit: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiRequest<{ success: boolean; id: string }>(`/api/habits/${id}`, {
      method: 'DELETE',
    });
  },

  // Expenses
  getExpenses: async (): Promise<{ expenses: Expense[] }> => {
    return apiRequest<{ expenses: Expense[] }>('/api/expenses');
  },
  createExpense: async (expense: Partial<Expense>): Promise<{ expense: Expense }> => {
    return apiRequest<{ expense: Expense }>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  },
  updateExpense: async (id: string, updates: Partial<Expense>): Promise<{ expense: Expense }> => {
    return apiRequest<{ expense: Expense }>(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  deleteExpense: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiRequest<{ success: boolean; id: string }>(`/api/expenses/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  getNotifications: async (): Promise<{ notifications: NotificationItem[] }> => {
    return apiRequest<{ notifications: NotificationItem[] }>('/api/notifications');
  },
  markNotificationRead: async (id: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  },
  deleteNotification: async (id: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  // AI Assistant & Daily Flow
  chatWithAI: async (
    message: string,
    history?: { role: 'user' | 'assistant'; content: string }[]
  ): Promise<{ message: AIMessage }> => {
    return apiRequest<{ message: AIMessage }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },
  askAI: async (message: string): Promise<{
    explanation: string;
    recommendations: string[];
    proposedActions: AIProposedAction[];
  }> => {
    return apiRequest<{
      explanation: string;
      recommendations: string[];
      proposedActions: AIProposedAction[];
    }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
  generateDailyFlow: async (): Promise<{ plan: DailyFlowPlan }> => {
    return apiRequest<{ plan: DailyFlowPlan }>('/api/ai/daily-flow', {
      method: 'POST',
    });
  },
  executeAIActions: async (actions: AIProposedAction[]): Promise<{ success: boolean; executedCount: number }> => {
    return apiRequest<{ success: boolean; executedCount: number }>('/api/ai/execute-actions', {
      method: 'POST',
      body: JSON.stringify({ actions }),
    });
  },
  getWeeklyReview: async (): Promise<{ report: WeeklyReportData }> => {
    return apiRequest<{ report: WeeklyReportData }>('/api/ai/weekly-review');
  },

  // Reset demo data
  resetDemoData: async (): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>('/api/data/reset-demo', {
      method: 'POST',
    });
  },
  exportData: async (): Promise<any> => {
    return apiRequest<any>('/api/data/export');
  },
};
