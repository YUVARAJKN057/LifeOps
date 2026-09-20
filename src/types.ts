export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';

export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'finance' | 'creative' | 'other';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  category: TaskCategory;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  estimatedDurationMinutes?: number;
  goalId?: string;
  reminder?: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'archived';

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  targetDate?: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  targetDate?: string;
  status: GoalStatus;
  progress: number; // 0 to 100
  milestones: Milestone[];
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: TaskCategory;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  reminderTime?: string;
  startDate: string;
  archived?: boolean;
  color?: string;
  icon?: string;
  completions: string[]; // array of ISO date strings YYYY-MM-DD
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Education'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills'
  | 'Health'
  | 'Other';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod: 'credit_card' | 'debit_card' | 'cash' | 'transfer' | 'other';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'task_reminder' | 'goal_milestone' | 'habit_reminder' | 'deadline_warning' | 'ai_recommendation' | 'weekly_summary';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  city?: string;
  occupation?: string;
  currency?: string;
  timezone: string;
  monthlyBudget: number;
  preferences: {
    theme: 'dark' | 'light' | 'system';
    reducedMotion: boolean;
    soundEnabled: boolean;
    emailNotifications: boolean;
    dailyFlowAutoSuggest: boolean;
  };
}

export type AIActionType =
  | 'CREATE_TASK'
  | 'COMPLETE_TASK'
  | 'CREATE_GOAL'
  | 'LOG_HABIT'
  | 'LOG_EXPENSE'
  | 'SCHEDULE_EVENT';

export interface AIActionPayload {
  type: AIActionType;
  title?: string;
  description?: string;
  priority?: Priority;
  category?: TaskCategory | ExpenseCategory;
  dueDate?: string;
  dueTime?: string;
  estimatedDurationMinutes?: number;
  goalTitle?: string;
  targetDate?: string;
  amount?: number;
  habitName?: string;
}

export interface AIProposedAction {
  id: string;
  type: AIActionType;
  title: string;
  summary: string;
  payload: AIActionPayload;
  status: 'pending' | 'proposed' | 'approved' | 'rejected' | 'executed' | 'dismissed';
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  explanation?: string;
  recommendations?: string[];
  proposedActions?: AIProposedAction[];
  timestamp: string;
}

export interface DailyFlowBlock {
  id: string;
  startTime: string; // e.g. "08:30"
  endTime: string;   // e.g. "09:30"
  title: string;
  type: 'deep_work' | 'task' | 'habit' | 'break' | 'review' | 'meeting';
  category?: TaskCategory;
  relatedTaskId?: string;
  completed?: boolean;
  notes?: string;
}

export interface DailyFlowPlan {
  id: string;
  date: string;
  summary: string;
  focusTheme: string;
  blocks: DailyFlowBlock[];
  createdAt: string;
}

export interface WeeklyReportData {
  weekLabel: string;
  tasksCompleted: number;
  tasksOverdue: number;
  totalTaskHours: number;
  goalMilestonesHit: number;
  habitAverageConsistency: number; // percentage
  totalSpent: number;
  budgetStatus: 'under' | 'near' | 'over';
  productivityScore: number;
  highlights: string[];
  growthAreas: string[];
  recommendedFocus: string[];
  aiSynthesis: string;
}

export interface ProductivityScore {
  total: number; // 0 - 100
  taskCompletionPoints: number;
  goalProgressPoints: number;
  habitConsistencyPoints: number;
  overduePenalty: number;
  grade: 'Elite' | 'Optimal' | 'Balanced' | 'Needs Focus';
  trend: 'up' | 'down' | 'stable';
}

export type GoalMilestone = Milestone;
export type AIAction = AIProposedAction;
export type ScheduleBlock = DailyFlowBlock;
export type EnergyLevel = 'high' | 'medium' | 'low';

// ==========================================
// EXERCISE & KINETIC ACADEMY DATA MODELS
// ==========================================

export type DemographicCategory = 'kids' | 'seniors' | 'general_health' | 'cardio' | 'strength' | 'core' | 'mobility' | 'creative';

export interface FriendlyExerciseStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tips: string[];
  safetyCheck: string;
}

export interface ExerciseGuide {
  id: string;
  name: string;
  category: DemographicCategory;
  difficulty: 'Beginner' | 'Intermediate' | 'All Levels';
  targetReps: number;
  isTimed?: boolean;
  targetSeconds?: number;
  energyBurn?: string;
  primaryMuscles: string[];
  equipment: string;
  summary: string;
  whatItIsDoing: string;
  whoItsFor: string;
  benefits: string[];
  steps: FriendlyExerciseStep[];
  commonMistakes: Array<{
    trap: string;
    fix: string;
  }>;
  biomechanicsAngle: string;
  cadence: { down: number; hold: number; up: number };
  aiVoiceScript: string;
  threeDModelType?: 'biped' | 'quadruped' | 'seated' | 'supine' | 'plank' | 'stretch' | 'floor';
  recommendedVoiceTone?: 'energetic' | 'gentle' | 'warm_encouraging' | 'calm_mindful' | 'calm' | 'encouraging';
}

export interface WorkoutCircuit {
  id: string;
  name: string;
  category: DemographicCategory | 'all';
  durationMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  description: string;
  estimatedCalories: string;
  exerciseIds: string[];
  restSeconds: number;
  audienceTag?: string;
}

export interface ExerciseLog {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  category: DemographicCategory;
  repsCompleted?: number;
  durationSeconds?: number;
  caloriesBurned: number;
  difficultyRating?: 'easy' | 'perfect' | 'challenging';
  notes?: string;
  timestamp: string; // ISO
}

export interface UserExerciseProfile {
  id: string;
  selectedDemographic: DemographicCategory;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Active Senior' | 'Youth Active';
  dailyTargetMinutes: number;
  voiceCoachSpeed: number; // 0.8 - 1.3
  preferredVoiceGender: 'female' | 'male' | 'coach';
  autoVoiceNarration: boolean;
  soundEffectsEnabled: boolean;
  viewMode3DDefault: boolean;
  favorites: string[]; // exercise ids
  customRoutines: WorkoutCircuit[];
}

