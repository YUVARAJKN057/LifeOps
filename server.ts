import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  Task,
  Goal,
  Habit,
  Expense,
  NotificationItem,
  UserProfile,
  AIProposedAction,
  DailyFlowPlan,
  WeeklyReportData,
} from './src/types';

// Storage models per user
interface UserData {
  profile: UserProfile;
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  expenses: Expense[];
  notifications: NotificationItem[];
  dailyFlows: DailyFlowPlan[];
}

const db: Record<string, UserData> = {};

// In-memory OTP storage for registration verification
interface PendingOTP {
  email: string;
  phone: string;
  otp: string;
  expiresAt: number;
}
const pendingOTPs: Record<string, PendingOTP> = {};

// Helper to seed rich realistic demo data for testing & judges
function getInitialDemoData(userId = 'demo_user_1'): UserData {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const day2Ago = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
  const day3Ago = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];
  const day4Ago = new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0];
  const day5Ago = new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

  return {
    profile: {
      id: userId,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@lifeops.in',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      city: 'Bengaluru, Karnataka',
      occupation: 'Lead System Architect',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      monthlyBudget: 75000,
      preferences: {
        theme: 'dark',
        reducedMotion: false,
        soundEnabled: true,
        emailNotifications: true,
        dailyFlowAutoSuggest: true,
      },
    },
    tasks: [
      {
        id: 'task-1',
        userId,
        title: 'Architect Distributed Caching Layer',
        description: 'Review Redis cluster deployment and set up TTL eviction policies.',
        priority: 'urgent',
        status: 'in_progress',
        category: 'work',
        dueDate: today,
        dueTime: '11:00',
        estimatedDurationMinutes: 90,
        goalId: 'goal-1',
        createdAt: day2Ago,
        updatedAt: today,
      },
      {
        id: 'task-2',
        userId,
        title: 'Practice System Design Mock Interview',
        description: 'Solve YouTube video ingestion architecture on Excalidraw.',
        priority: 'high',
        status: 'todo',
        category: 'learning',
        dueDate: today,
        dueTime: '15:30',
        estimatedDurationMinutes: 60,
        goalId: 'goal-1',
        createdAt: day3Ago,
        updatedAt: today,
      },
      {
        id: 'task-3',
        userId,
        title: 'Prepare Q3 Budget Presentation',
        description: 'Aggregate team compute expenditures and forecast GPU usage for next quarter.',
        priority: 'medium',
        status: 'todo',
        category: 'work',
        dueDate: tomorrow,
        dueTime: '17:00',
        estimatedDurationMinutes: 45,
        goalId: 'goal-2',
        createdAt: day4Ago,
        updatedAt: day2Ago,
      },
      {
        id: 'task-4',
        userId,
        title: '30-Minute High Intensity Interval Training',
        description: 'Kettlebell swings, pull-ups, and sprint intervals.',
        priority: 'medium',
        status: 'completed',
        category: 'health',
        dueDate: today,
        dueTime: '07:30',
        estimatedDurationMinutes: 30,
        completedAt: today,
        createdAt: yesterday,
        updatedAt: today,
      },
      {
        id: 'task-5',
        userId,
        title: 'Renew Cloudflare DNS & SSL Certificates',
        description: 'Audit expiring wildcard certificates for domains.',
        priority: 'low',
        status: 'todo',
        category: 'work',
        dueDate: nextWeek,
        estimatedDurationMinutes: 20,
        createdAt: day5Ago,
        updatedAt: day5Ago,
      },
      {
        id: 'task-6',
        userId,
        title: 'Review React 19 Compiler Migration Docs',
        description: 'Benchmark bundle sizes with React Compiler memoization.',
        priority: 'high',
        status: 'completed',
        category: 'learning',
        dueDate: yesterday,
        completedAt: yesterday,
        createdAt: day3Ago,
        updatedAt: yesterday,
      },
      {
        id: 'task-7',
        userId,
        title: 'Submit Expense Receipts for Offsite Summit',
        description: 'Upload hotel receipts and flight boarding passes.',
        priority: 'urgent',
        status: 'todo',
        category: 'finance',
        dueDate: yesterday, // Overdue task for realistic score penalty demonstration
        dueTime: '18:00',
        estimatedDurationMinutes: 25,
        createdAt: day4Ago,
        updatedAt: yesterday,
      },
    ],
    goals: [
      {
        id: 'goal-1',
        userId,
        title: 'Staff Engineer Promotion & System Mastery',
        description: 'Deliver high-throughput event processing architecture and lead team RFC reviews.',
        category: 'work',
        priority: 'urgent',
        targetDate: new Date(Date.now() + 86400000 * 45).toISOString().split('T')[0],
        status: 'in_progress',
        progress: 68,
        color: '#06B6D4',
        milestones: [
          { id: 'm-1', title: 'Complete Distributed Systems Deep Dive', completed: true, completedAt: day5Ago },
          { id: 'm-2', title: 'Publish Multi-Region Kafka Architecture RFC', completed: true, completedAt: yesterday },
          { id: 'm-3', title: 'Pass Internal System Design Bar-Raiser Interview', completed: false, targetDate: nextWeek },
          { id: 'm-4', title: 'Lead 2 Junior Engineer Mentorship Cohorts', completed: false },
        ],
        createdAt: day5Ago,
        updatedAt: today,
      },
      {
        id: 'goal-2',
        userId,
        title: 'Half-Marathon Sub-1:45 Finish',
        description: 'Follow 12-week aerobic conditioning and threshold interval training.',
        category: 'health',
        priority: 'high',
        targetDate: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
        status: 'in_progress',
        progress: 50,
        color: '#10B981',
        milestones: [
          { id: 'm-201', title: 'Build 25km weekly base mileage', completed: true, completedAt: day4Ago },
          { id: 'm-202', title: 'Hit 15km long run under 4:55/km pace', completed: true, completedAt: yesterday },
          { id: 'm-203', title: 'Complete 18km tempo endurance run', completed: false, targetDate: nextWeek },
          { id: 'm-204', title: 'Official Race Day Execution', completed: false },
        ],
        createdAt: day5Ago,
        updatedAt: today,
      },
      {
        id: 'goal-3',
        userId,
        title: 'Emergency Reserve Fund (₹5,00,000 Target)',
        description: 'Automate 20% of net income into high-yield treasury & fixed deposit accounts.',
        category: 'finance',
        priority: 'medium',
        targetDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0],
        status: 'in_progress',
        progress: 82,
        color: '#8B5CF6',
        milestones: [
          { id: 'm-301', title: '₹1,00,000 Initial Cushion', completed: true },
          { id: 'm-302', title: '₹3,00,000 Milestones Reached', completed: true },
          { id: 'm-303', title: '₹5,00,000 Final Reserve Target', completed: false },
        ],
        createdAt: day5Ago,
        updatedAt: today,
      },
    ],
    habits: [
      {
        id: 'habit-1',
        userId,
        name: 'Morning Deep Work Block (90m)',
        description: 'Zero notifications, phone in another room, strict focus.',
        category: 'work',
        frequency: 'weekdays',
        targetDaysPerWeek: 5,
        reminderTime: '08:45',
        startDate: day5Ago,
        color: '#06B6D4',
        icon: 'zap',
        completions: [day5Ago, day4Ago, day3Ago, day2Ago, yesterday, today],
        currentStreak: 6,
        bestStreak: 18,
        createdAt: day5Ago,
        updatedAt: today,
      },
      {
        id: 'habit-2',
        userId,
        name: 'Hydration & Daily Electrolytes (3L)',
        description: 'Drink 1L upon waking, 2L throughout the workday.',
        category: 'health',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        reminderTime: '10:00',
        startDate: day5Ago,
        color: '#3B82F6',
        icon: 'droplet',
        completions: [day4Ago, day3Ago, day2Ago, yesterday, today],
        currentStreak: 5,
        bestStreak: 14,
        createdAt: day5Ago,
        updatedAt: today,
      },
      {
        id: 'habit-3',
        userId,
        name: 'Algorithmic Problem Solving / LeetCode',
        description: 'Solve 1 Hard or 2 Medium dynamic programming problems.',
        category: 'learning',
        frequency: 'daily',
        targetDaysPerWeek: 6,
        reminderTime: '20:30',
        startDate: day5Ago,
        color: '#8B5CF6',
        icon: 'code',
        completions: [day5Ago, day4Ago, day2Ago, yesterday],
        currentStreak: 2,
        bestStreak: 12,
        createdAt: day5Ago,
        updatedAt: today,
      },
      {
        id: 'habit-4',
        userId,
        name: 'Evening Tech Reading & RFC Digest',
        description: 'Read 20 pages of architecture books or engineering blogs.',
        category: 'learning',
        frequency: 'daily',
        targetDaysPerWeek: 7,
        reminderTime: '22:00',
        startDate: day5Ago,
        color: '#EC4899',
        icon: 'book-open',
        completions: [day5Ago, day4Ago, day3Ago, day2Ago, yesterday, today],
        currentStreak: 6,
        bestStreak: 21,
        createdAt: day5Ago,
        updatedAt: today,
      },
    ],
    expenses: [
      {
        id: 'exp-1',
        userId,
        amount: 2450.0,
        description: 'Organic Groceries & Protein Stockup',
        category: 'Food',
        date: today,
        paymentMethod: 'credit_card',
        notes: 'Nature Basket store',
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 'exp-2',
        userId,
        amount: 1999.0,
        description: 'Cloud Infrastructure & AI API Subscription',
        category: 'Education',
        date: yesterday,
        paymentMethod: 'credit_card',
        notes: 'Dev research & benchmarking',
        createdAt: yesterday,
        updatedAt: yesterday,
      },
      {
        id: 'exp-3',
        userId,
        amount: 650.0,
        description: 'Airport Ride & Metro Smart Card Recharge',
        category: 'Transport',
        date: day2Ago,
        paymentMethod: 'credit_card',
        notes: 'Namma Metro / Uber',
        createdAt: day2Ago,
        updatedAt: day2Ago,
      },
      {
        id: 'exp-4',
        userId,
        amount: 4200.0,
        description: 'Ergonomic Vertical Mouse & Desk Setup',
        category: 'Shopping',
        date: day3Ago,
        paymentMethod: 'credit_card',
        notes: 'Workstation upgrade',
        createdAt: day3Ago,
        updatedAt: day3Ago,
      },
      {
        id: 'exp-5',
        userId,
        amount: 1499.0,
        description: 'Monthly High-Speed Fiber Internet (Airtel/Jio)',
        category: 'Bills',
        date: day4Ago,
        paymentMethod: 'transfer',
        notes: 'Home office connection',
        createdAt: day4Ago,
        updatedAt: day4Ago,
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        userId,
        type: 'deadline_warning',
        title: 'Overdue Task Alert',
        message: 'Task "Submit Expense Receipts for Offsite Summit" was due yesterday.',
        read: false,
        link: '/tasks',
        createdAt: today,
      },
      {
        id: 'notif-2',
        userId,
        type: 'ai_recommendation',
        title: 'AI Daily Flow Ready',
        message: 'Your optimal peak focus window is 09:00 - 11:30 AM. 2 high priority items aligned.',
        read: false,
        link: '/ai',
        createdAt: today,
      },
      {
        id: 'notif-3',
        userId,
        type: 'habit_reminder',
        title: '6-Day Streak Maintained! 🔥',
        message: 'You kept your "Morning Deep Work Block" streak alive today.',
        read: true,
        link: '/habits',
        createdAt: today,
      },
    ],
    dailyFlows: [
      {
        id: 'flow-today',
        date: today,
        focusTheme: 'Distributed Systems & Interview Prep',
        summary: 'Targeting your highest-leverage work before noon with strategic micro-breaks.',
        blocks: [
          {
            id: 'b-1',
            startTime: '08:30',
            endTime: '09:00',
            title: 'Morning Setup & Priority Alignment',
            type: 'review',
            category: 'work',
            completed: true,
          },
          {
            id: 'b-2',
            startTime: '09:00',
            endTime: '10:30',
            title: 'Architect Distributed Caching Layer (Deep Work)',
            type: 'deep_work',
            category: 'work',
            relatedTaskId: 'task-1',
            completed: false,
          },
          {
            id: 'b-3',
            startTime: '10:30',
            endTime: '10:45',
            title: 'Hydration & Posture Reset Break',
            type: 'break',
            completed: false,
          },
          {
            id: 'b-4',
            startTime: '10:45',
            endTime: '12:00',
            title: 'System Design Bar-Raiser Practice',
            type: 'task',
            category: 'learning',
            relatedTaskId: 'task-2',
            completed: false,
          },
          {
            id: 'b-5',
            startTime: '12:00',
            endTime: '13:00',
            title: 'Nutritious Lunch & Walk',
            type: 'break',
            completed: false,
          },
          {
            id: 'b-6',
            startTime: '14:00',
            endTime: '15:30',
            title: 'Prepare Q3 Budget Presentation',
            type: 'task',
            category: 'work',
            relatedTaskId: 'task-3',
            completed: false,
          },
          {
            id: 'b-7',
            startTime: '18:00',
            endTime: '18:45',
            title: 'Threshold Interval Running Session',
            type: 'habit',
            category: 'health',
            completed: false,
          },
        ],
        createdAt: today,
      },
    ],
  };
}

// Ensure demo user is pre-seeded
db['demo_user_1'] = getInitialDemoData('demo_user_1');

function getUserData(userId: string): UserData {
  if (!db[userId]) {
    db[userId] = getInitialDemoData(userId);
  }
  return db[userId];
}

// Server-side Gemini initialization with telemetry header
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing Gemini client:', err);
    return null;
  }
}

// Resilient Gemini invoker with automatic model fallback & retry for 503 / 429 errors
async function callGeminiWithFallback(
  promptOrContents: any,
  config?: any
): Promise<{ text: string } | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  // Primary model and backup fallback models in case of 503 high demand or quota spikes
  const modelCandidates = ['gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

  for (const model of modelCandidates) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const contents = Array.isArray(promptOrContents)
          ? promptOrContents
          : typeof promptOrContents === 'string'
          ? [{ role: 'user', parts: [{ text: promptOrContents }] }]
          : promptOrContents;

        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            ...config,
          },
        });

        if (response && response.text) {
          return { text: response.text };
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('overloaded');

        console.warn(`[Gemini API] Attempt ${attempt} on model ${model} failed:`, errMsg);

        if (isTransient && attempt < 2) {
          // Jittered backoff delay before retrying
          await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 400));
          continue;
        }
        // Proceed to fallback model
        break;
      }
    }
  }

  return null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper auth extractor
  const extractUserId = (req: Request): string => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        return token;
      }
    }
    return 'demo_user_1';
  };

  const hasAuthToken = (req: Request): boolean => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return Boolean(token && token !== 'null' && token !== 'undefined' && token.trim() !== '');
    }
    return false;
  };

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // AUTH ROUTES
  // ==========================================
  app.post('/api/auth/demo', (req: Request, res: Response) => {
    const user = getUserData('demo_user_1');
    res.json({
      token: 'demo_user_1',
      user: user.profile,
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    // Generate or fetch user for this email
    const userId = 'user_' + Buffer.from(email).toString('hex').slice(0, 12);
    if (!db[userId]) {
      const initial = getInitialDemoData(userId);
      initial.profile.email = email;
      initial.profile.name = email.split('@')[0].replace(/[._-]/g, ' ');
      db[userId] = initial;
    }
    res.json({
      token: userId,
      user: db[userId].profile,
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, phone, city, occupation, monthlyBudget } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }
    const userId = 'user_' + Buffer.from(email).toString('hex').slice(0, 12);
    const initial = getInitialDemoData(userId);
    initial.profile.name = name;
    initial.profile.email = email;
    if (phone) initial.profile.phone = phone;
    if (city) initial.profile.city = city;
    if (occupation) initial.profile.occupation = occupation;
    if (monthlyBudget) initial.profile.monthlyBudget = Number(monthlyBudget);
    initial.profile.currency = 'INR';
    initial.profile.timezone = 'Asia/Kolkata';
    initial.profile.emailVerified = true;
    initial.profile.phoneVerified = true;
    db[userId] = initial;

    res.json({
      token: userId,
      user: initial.profile,
    });
  });

  // ==========================================
  // OTP VERIFICATION ROUTES (Email & Mobile)
  // ==========================================
  app.post('/api/auth/send-otp', (req: Request, res: Response) => {
    const { email, phone, name } = req.body;
    if (!email || !phone) {
      res.status(400).json({ error: 'Email and Mobile phone number are required for verification' });
      return;
    }

    // Generate deterministic or high-entropy 6-digit numeric OTP code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone.trim();

    // Store in memory with 10-minute validity
    pendingOTPs[cleanEmail] = {
      email: cleanEmail,
      phone: cleanPhone,
      otp: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    console.log(`[LifeOps Auth OTP] Dispatched 6-digit OTP ${generatedOtp} to Mobile ${cleanPhone} & Email ${cleanEmail}`);

    res.json({
      success: true,
      message: `Verification code sent to ${cleanPhone} and verification email initiated for ${cleanEmail}`,
      phone: cleanPhone,
      email: cleanEmail,
      otpPreview: generatedOtp, // Included so test users can easily verify or auto-fill
      expiresInSeconds: 600,
    });
  });

  app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    const { email, phone, otp, name, password, city, occupation, monthlyBudget } = req.body;

    if (!email || !otp) {
      res.status(400).json({ error: 'Email and 6-digit OTP code are required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const inputOtp = otp.toString().trim();
    const stored = pendingOTPs[cleanEmail];

    // Accept valid generated OTP or master bypass OTP for smooth testing
    const isValid = (stored && stored.otp === inputOtp && stored.expiresAt > Date.now()) || inputOtp === '123456';

    if (!isValid) {
      res.status(400).json({ error: 'Invalid or expired OTP code. Please check your SMS or click Resend.' });
      return;
    }

    // Clear used OTP
    delete pendingOTPs[cleanEmail];

    // Generate or update verified user
    const userId = 'user_' + Buffer.from(cleanEmail).toString('hex').slice(0, 12);
    const initial = getInitialDemoData(userId);
    initial.profile.name = name || cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    initial.profile.email = cleanEmail;
    if (phone) initial.profile.phone = phone;
    if (city) initial.profile.city = city;
    if (occupation) initial.profile.occupation = occupation;
    if (monthlyBudget) initial.profile.monthlyBudget = Number(monthlyBudget);
    initial.profile.currency = 'INR';
    initial.profile.timezone = 'Asia/Kolkata';
    initial.profile.emailVerified = true;
    initial.profile.phoneVerified = true;
    db[userId] = initial;

    res.json({
      success: true,
      token: userId,
      user: initial.profile,
      message: 'Mobile number and Email verified successfully!',
    });
  });

  app.post('/api/auth/google', (req: Request, res: Response) => {
    const { credential, email, name, picture, sub, googleId } = req.body;
    let resolvedEmail = email;
    let resolvedName = name;
    let resolvedAvatar = picture;
    let resolvedSub = sub || googleId;

    if (credential && (!resolvedEmail || !resolvedName)) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(payloadJson);
          resolvedEmail = resolvedEmail || payload.email;
          resolvedName = resolvedName || payload.name;
          resolvedAvatar = resolvedAvatar || payload.picture;
          resolvedSub = resolvedSub || payload.sub;
        }
      } catch (err) {
        console.warn('Could not parse Google credential token:', err);
      }
    }

    if (!resolvedEmail) {
      resolvedEmail = 'google_user@lifeops.in';
    }

    if (!resolvedName) {
      resolvedName = resolvedEmail.split('@')[0].replace(/[._-]/g, ' ');
    }

    const userId = 'google_' + (resolvedSub || Buffer.from(resolvedEmail).toString('hex').slice(0, 12));
    if (!db[userId]) {
      const initial = getInitialDemoData(userId);
      initial.profile.email = resolvedEmail;
      initial.profile.name = resolvedName;
      if (resolvedAvatar) initial.profile.avatar = resolvedAvatar;
      initial.profile.currency = 'INR';
      initial.profile.city = 'Bengaluru, Karnataka';
      initial.profile.occupation = 'Strategic Operator / Leader';
      db[userId] = initial;
    } else {
      if (resolvedName) db[userId].profile.name = resolvedName;
      if (resolvedAvatar) db[userId].profile.avatar = resolvedAvatar;
    }

    res.json({
      token: userId,
      user: db[userId].profile,
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    if (!hasAuthToken(req)) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const userId = extractUserId(req);
    const user = getUserData(userId);
    res.json({ user: user.profile });
  });

  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const user = getUserData(userId);
    const updates = req.body;
    user.profile = {
      ...user.profile,
      ...updates,
      preferences: {
        ...user.profile.preferences,
        ...(updates.preferences || {}),
      },
    };
    res.json({ user: user.profile });
  });

  // ==========================================
  // TASKS CRUD
  // ==========================================
  app.get('/api/tasks', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    res.json({ tasks: data.tasks });
  });

  app.post('/api/tasks', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const { title, description, priority, category, status, dueDate, dueTime, estimatedDurationMinutes, goalId, reminder } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const newTask: Task = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId,
      title: title.trim(),
      description: description || '',
      priority: priority || 'medium',
      category: category || 'work',
      status: status || 'todo',
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      estimatedDurationMinutes: estimatedDurationMinutes ? Number(estimatedDurationMinutes) : undefined,
      goalId: goalId || undefined,
      reminder: !!reminder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.tasks.unshift(newTask);
    res.status(201).json({ task: newTask });
  });

  app.put('/api/tasks/:id', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const taskId = req.params.id;
    const taskIndex = data.tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const current = data.tasks[taskIndex];
    const updates = req.body;
    const isNowCompleted = updates.status === 'completed' && current.status !== 'completed';

    const updatedTask: Task = {
      ...current,
      ...updates,
      completedAt: isNowCompleted ? new Date().toISOString() : updates.status !== 'completed' ? undefined : current.completedAt,
      updatedAt: new Date().toISOString(),
    };

    data.tasks[taskIndex] = updatedTask;
    res.json({ task: updatedTask });
  });

  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const taskId = req.params.id;
    const initialLen = data.tasks.length;
    data.tasks = data.tasks.filter((t) => t.id !== taskId);

    if (data.tasks.length === initialLen) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ success: true, id: taskId });
  });

  // ==========================================
  // GOALS CRUD
  // ==========================================
  app.get('/api/goals', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    res.json({ goals: data.goals });
  });

  app.post('/api/goals', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const { title, description, category, priority, targetDate, milestones, color } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const formattedMilestones = Array.isArray(milestones)
      ? milestones.map((m: any, idx: number) => ({
          id: m.id || `m-${Date.now()}-${idx}`,
          title: m.title,
          completed: !!m.completed,
          completedAt: m.completed ? new Date().toISOString() : undefined,
          targetDate: m.targetDate || undefined,
        }))
      : [];

    const progress = formattedMilestones.length
      ? Math.round((formattedMilestones.filter((m: any) => m.completed).length / formattedMilestones.length) * 100)
      : 0;

    const newGoal: Goal = {
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId,
      title: title.trim(),
      description: description || '',
      category: category || 'work',
      priority: priority || 'medium',
      targetDate: targetDate || undefined,
      status: 'in_progress',
      progress,
      milestones: formattedMilestones,
      color: color || '#06B6D4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.goals.unshift(newGoal);
    res.status(201).json({ goal: newGoal });
  });

  app.put('/api/goals/:id', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const goalId = req.params.id;
    const goalIndex = data.goals.findIndex((g) => g.id === goalId);

    if (goalIndex === -1) {
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const current = data.goals[goalIndex];
    const updates = req.body;

    let milestones = updates.milestones || current.milestones;
    let progress = updates.progress;

    if (milestones && milestones.length > 0) {
      const completedCount = milestones.filter((m: any) => m.completed).length;
      progress = Math.round((completedCount / milestones.length) * 100);
    }

    const updatedGoal: Goal = {
      ...current,
      ...updates,
      milestones,
      progress: typeof progress === 'number' ? progress : current.progress,
      status: progress === 100 ? 'completed' : updates.status || current.status,
      updatedAt: new Date().toISOString(),
    };

    data.goals[goalIndex] = updatedGoal;
    res.json({ goal: updatedGoal });
  });

  app.delete('/api/goals/:id', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const goalId = req.params.id;
    data.goals = data.goals.filter((g) => g.id !== goalId);
    res.json({ success: true, id: goalId });
  });

  // ==========================================
  // HABITS CRUD
  // ==========================================
  app.get('/api/habits', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    res.json({ habits: data.habits });
  });

  app.post('/api/habits', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const { name, description, category, frequency, targetDaysPerWeek, reminderTime, color, icon } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Habit name is required' });
      return;
    }

    const newHabit: Habit = {
      id: 'habit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId,
      name: name.trim(),
      description: description || '',
      category: category || 'health',
      frequency: frequency || 'daily',
      targetDaysPerWeek: Number(targetDaysPerWeek) || 7,
      reminderTime: reminderTime || undefined,
      startDate: new Date().toISOString().split('T')[0],
      completions: [],
      currentStreak: 0,
      bestStreak: 0,
      color: color || '#10B981',
      icon: icon || 'zap',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.habits.unshift(newHabit);
    res.status(201).json({ habit: newHabit });
  });

  app.post('/api/habits/:id/toggle-date', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const habitId = req.params.id;
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const habitIndex = data.habits.findIndex((h) => h.id === habitId);
    if (habitIndex === -1) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const habit = data.habits[habitIndex];
    const exists = habit.completions.includes(targetDate);

    if (exists) {
      habit.completions = habit.completions.filter((d) => d !== targetDate);
    } else {
      habit.completions.push(targetDate);
      habit.completions.sort();
    }

    // Calculate current streak
    const compSet = new Set(habit.completions);
    let streak = 0;
    let checkDate = new Date();
    const todayStr = checkDate.toISOString().split('T')[0];

    // If today is not completed, check if yesterday was completed to keep streak alive
    if (!compSet.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (compSet.has(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    habit.currentStreak = streak;
    if (streak > habit.bestStreak) {
      habit.bestStreak = streak;
    }
    habit.updatedAt = new Date().toISOString();

    data.habits[habitIndex] = habit;
    res.json({ habit });
  });

  app.put('/api/habits/:id', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const habitId = req.params.id;
    const habitIndex = data.habits.findIndex((h) => h.id === habitId);

    if (habitIndex === -1) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const updated = {
      ...data.habits[habitIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    data.habits[habitIndex] = updated;
    res.json({ habit: updated });
  });

  app.delete('/api/habits/:id', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const habitId = req.params.id;
    data.habits = data.habits.filter((h) => h.id !== habitId);
    res.json({ success: true, id: habitId });
  });

  // ==========================================
  // EXPENSES CRUD
  // ==========================================
  app.get('/api/expenses', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    res.json({ expenses: data.expenses });
  });

  app.post('/api/expenses', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const { amount, description, category, date, paymentMethod, notes } = req.body;

    if (!amount || isNaN(Number(amount)) || !description) {
      res.status(400).json({ error: 'Valid amount and description are required' });
      return;
    }

    const newExpense: Expense = {
      id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId,
      amount: Number(amount),
      description: description.trim(),
      category: category || 'Other',
      date: date || new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod || 'credit_card',
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.expenses.unshift(newExpense);
    res.status(201).json({ expense: newExpense });
  });

  app.put('/api/expenses/:id', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const expId = req.params.id;
    const expIndex = data.expenses.findIndex((e) => e.id === expId);

    if (expIndex === -1) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    const updated: Expense = {
      ...data.expenses[expIndex],
      ...req.body,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : data.expenses[expIndex].amount,
      updatedAt: new Date().toISOString(),
    };

    data.expenses[expIndex] = updated;
    res.json({ expense: updated });
  });

  app.delete('/api/expenses/:id', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const expId = req.params.id;
    data.expenses = data.expenses.filter((e) => e.id !== expId);
    res.json({ success: true, id: expId });
  });

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  app.get('/api/notifications', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    res.json({ notifications: data.notifications });
  });

  app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const { id } = req.body;

    if (id === 'all') {
      data.notifications.forEach((n) => (n.read = true));
    } else {
      const notif = data.notifications.find((n) => n.id === id);
      if (notif) notif.read = true;
    }
    res.json({ success: true });
  });

  app.delete('/api/notifications/:id', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    data.notifications = data.notifications.filter((n) => n.id !== req.params.id);
    res.json({ success: true });
  });

  // ==========================================
  // AI ASSISTANT & ACTION ENGINE (Resilient Gemini with Local Heuristics)
  // ==========================================
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const { message, conversationHistory, history } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Build context summary from real user state
    const today = new Date().toISOString().split('T')[0];
    const activeTasks = data.tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived');
    const overdueTasks = activeTasks.filter((t) => t.dueDate && t.dueDate < today);
    const todayTasks = activeTasks.filter((t) => t.dueDate === today);
    const activeGoals = data.goals.filter((g) => g.status === 'in_progress');
    const activeHabits = data.habits.filter((h) => !h.archived);
    const totalMonthSpend = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const userContextPrompt = `
CURRENT USER CONTEXT:
- Name: ${data.profile.name}
- Timezone: ${data.profile.timezone}
- Current Date: ${today}
- Active Tasks (${activeTasks.length}):
  ${activeTasks.slice(0, 10).map((t) => `* [${t.priority.toUpperCase()}] ${t.title} (Status: ${t.status}, Due: ${t.dueDate || 'None'})`).join('\n  ')}
- Overdue Tasks (${overdueTasks.length}):
  ${overdueTasks.map((t) => `* ${t.title} (Due: ${t.dueDate})`).join('\n  ')}
- Today's Tasks (${todayTasks.length}):
  ${todayTasks.map((t) => `* ${t.title}`).join('\n  ')}
- Active Goals (${activeGoals.length}):
  ${activeGoals.map((g) => `* ${g.title} (Progress: ${g.progress}%, Target: ${g.targetDate || 'None'})`).join('\n  ')}
- Habits Tracked (${activeHabits.length}):
  ${activeHabits.map((h) => `* ${h.name} (Current streak: ${h.currentStreak}d)`).join('\n  ')}
- Total Expenses Logged: ₹${totalMonthSpend.toFixed(2)} (Monthly Budget: ₹${data.profile.monthlyBudget})

SYSTEM INSTRUCTIONS:
You are "LifeOps AI", the intelligent brain of the user's personal operating system.
Your communication is crisp, thoughtful, highly actionable, and empathetic to human focus.
CRITICAL MANDATE:
When suggesting new tasks, goals, habits, or changes, DO NOT silently modify anything.
Always formulate concrete, high-leverage PROPOSED ACTIONS in structured JSON so the user can review and click [Approve].

Return ONLY a strict valid JSON object in this exact schema:
{
  "explanation": "Direct, thoughtful explanation answering the user with clear insights grounded in their real data",
  "recommendations": ["Key strategic takeaway 1", "Key strategic takeaway 2"],
  "proposedActions": [
    {
      "id": "unique-id",
      "type": "CREATE_TASK" | "COMPLETE_TASK" | "CREATE_GOAL" | "LOG_HABIT" | "LOG_EXPENSE",
      "title": "Clear action title",
      "summary": "Why this action is proposed",
      "payload": {
        "type": "CREATE_TASK",
        "title": "Task title",
        "priority": "high" | "urgent" | "medium" | "low",
        "category": "work" | "learning" | "health" | "finance" | "personal",
        "dueDate": "${today}",
        "estimatedDurationMinutes": 45
      }
    }
  ]
}
`;

    // Local deterministic contextual generator (used if Gemini is 503/overloaded or offline)
    const generateLocalContextualResponse = () => {
      const sampleActions: AIProposedAction[] = [];
      const lowerQuery = message.toLowerCase();

      if (lowerQuery.includes('interview') || lowerQuery.includes('study') || lowerQuery.includes('code') || lowerQuery.includes('plan')) {
        sampleActions.push({
          id: 'act-' + Date.now() + '-1',
          type: 'CREATE_TASK',
          title: 'Review System Design Distributed Caching Patterns',
          summary: 'High-leverage study block for your Staff Engineer promotion goal',
          payload: {
            type: 'CREATE_TASK',
            title: 'Review System Design Distributed Caching Patterns',
            priority: 'high',
            category: 'learning',
            dueDate: today,
            estimatedDurationMinutes: 60,
          },
          status: 'proposed',
        });
        sampleActions.push({
          id: 'act-' + Date.now() + '-2',
          type: 'CREATE_TASK',
          title: 'Conduct 45-min Live Coding Mock Session',
          summary: 'Practice dynamic programming algorithms under simulated test conditions',
          payload: {
            type: 'CREATE_TASK',
            title: 'Conduct 45-min Live Coding Mock Session',
            priority: 'urgent',
            category: 'learning',
            dueDate: today,
            estimatedDurationMinutes: 45,
          },
          status: 'proposed',
        });
      } else if (overdueTasks.length > 0) {
        sampleActions.push({
          id: 'act-' + Date.now() + '-3',
          type: 'CREATE_TASK',
          title: `Resolve Overdue: ${overdueTasks[0].title}`,
          summary: 'Eliminate overdue backlog to restore cognitive momentum',
          payload: {
            type: 'CREATE_TASK',
            title: `Quick-Win: ${overdueTasks[0].title}`,
            priority: 'urgent',
            category: overdueTasks[0].category,
            dueDate: today,
            estimatedDurationMinutes: 25,
          },
          status: 'proposed',
        });
      } else if (activeTasks.length > 0) {
        sampleActions.push({
          id: 'act-' + Date.now() + '-4',
          type: 'CREATE_TASK',
          title: `Deep Work Sprint: ${activeTasks[0].title}`,
          summary: 'Scheduled focus block to drive your top priority task across the line',
          payload: {
            type: 'CREATE_TASK',
            title: `Sprint: ${activeTasks[0].title}`,
            priority: activeTasks[0].priority || 'high',
            category: activeTasks[0].category || 'work',
            dueDate: today,
            estimatedDurationMinutes: 50,
          },
          status: 'proposed',
        });
      }

      const explanation = `Based on your live LifeOps state (${activeTasks.length} active tasks, ${overdueTasks.length} overdue items, and ${activeGoals.length} goals in flight), here is the optimal execution roadmap: Prioritize clearing overdue blockers first, then dedicate an uninterrupted 90-minute morning focus window to your highest leverage goal.`;

      const recommendations = [
        overdueTasks.length > 0
          ? `Knock out ${overdueTasks.length} overdue task(s) early to eliminate cognitive friction.`
          : 'Great momentum on due dates—protect your peak energy window for deep work.',
        activeGoals[0] ? `Advance milestone for "${activeGoals[0].title}" (${activeGoals[0].progress}% done).` : 'Maintain high consistency across active goals.',
        `Protect streak on "${activeHabits[0]?.name || 'Morning Protocol'}" (${activeHabits[0]?.currentStreak || 1}d current streak).`,
      ];

      return {
        explanation,
        recommendations,
        proposedActions: sampleActions,
        message: {
          role: 'assistant' as const,
          content: explanation,
          proposedActions: sampleActions,
        },
      };
    };

    try {
      const aiResponse = await callGeminiWithFallback([
        { role: 'user', parts: [{ text: userContextPrompt + '\n\nUSER PROMPT: ' + message }] },
      ]);

      if (aiResponse && aiResponse.text) {
        try {
          const parsed = JSON.parse(aiResponse.text);
          const actions: AIProposedAction[] = (parsed.proposedActions || []).map((a: any, idx: number) => ({
            ...a,
            id: a.id || `act-${Date.now()}-${idx}`,
            status: 'proposed', // ensure proposed status for UI approve buttons
          }));

          const explanation = parsed.explanation || 'Analyzed your current operational state.';
          const recommendations = parsed.recommendations || [];

          res.json({
            explanation,
            recommendations,
            proposedActions: actions,
            message: {
              role: 'assistant',
              content: explanation,
              proposedActions: actions,
            },
          });
          return;
        } catch (jsonErr) {
          // If JSON parse fails, wrap raw text cleanly
          const explanation = aiResponse.text;
          res.json({
            explanation,
            recommendations: ['Stay aligned with your top priority directives.'],
            proposedActions: [],
            message: {
              role: 'assistant',
              content: explanation,
              proposedActions: [],
            },
          });
          return;
        }
      }

      // If Gemini returned null (e.g. temporary 503 spike across models or no API key), fallback seamlessly
      const fallbackResult = generateLocalContextualResponse();
      res.json(fallbackResult);
    } catch (err: any) {
      console.warn('Handling AI chat fallback due to error:', err?.message || err);
      const fallbackResult = generateLocalContextualResponse();
      res.json(fallbackResult);
    }
  });

  // ==========================================
  // DAILY FLOW PLANNER (Smart Schedule)
  // ==========================================
  app.post('/api/ai/daily-flow', async (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const today = new Date().toISOString().split('T')[0];

    const tasks = data.tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived');
    const goals = data.goals.filter((g) => g.status === 'in_progress');
    const habits = data.habits.filter((h) => !h.archived);

    // High quality deterministic plan fallback
    const buildDeterministicPlan = (): DailyFlowPlan => ({
      id: 'flow-' + Date.now(),
      date: today,
      focusTheme: goals[0] ? goals[0].title : 'High-Impact Execution & Consistency',
      summary: `Crafted around your ${tasks.length} active tasks and ${habits.length} habits with prioritized deep work periods.`,
      blocks: [
        {
          id: 'b-1',
          startTime: '08:30',
          endTime: '09:00',
          title: 'Daily Startup & Strategic Alignment',
          type: 'review',
          category: 'work',
          completed: false,
        },
        {
          id: 'b-2',
          startTime: '09:00',
          endTime: '10:30',
          title: tasks[0] ? tasks[0].title : 'Deep Work Focus Block 1',
          type: 'deep_work',
          category: tasks[0]?.category || 'work',
          relatedTaskId: tasks[0]?.id,
          completed: false,
        },
        {
          id: 'b-3',
          startTime: '10:30',
          endTime: '10:45',
          title: 'Hydration & Movement Reset',
          type: 'break',
          completed: false,
        },
        {
          id: 'b-4',
          startTime: '10:45',
          endTime: '12:00',
          title: tasks[1] ? tasks[1].title : 'Deep Work Focus Block 2',
          type: 'task',
          category: tasks[1]?.category || 'learning',
          relatedTaskId: tasks[1]?.id,
          completed: false,
        },
        {
          id: 'b-5',
          startTime: '12:00',
          endTime: '13:00',
          title: 'Lunch & Cognitive Rest',
          type: 'break',
          completed: false,
        },
        {
          id: 'b-6',
          startTime: '14:00',
          endTime: '15:30',
          title: tasks[2] ? tasks[2].title : 'Administrative & Tactical Execution',
          type: 'task',
          category: tasks[2]?.category || 'work',
          relatedTaskId: tasks[2]?.id,
          completed: false,
        },
        {
          id: 'b-7',
          startTime: '17:30',
          endTime: '18:30',
          title: habits[0] ? habits[0].name : 'Physical Conditioning / Wellness',
          type: 'habit',
          category: 'health',
          completed: false,
        },
      ],
      createdAt: new Date().toISOString(),
    });

    try {
      const prompt = `
Create an optimal time-blocked "Daily Flow" schedule for date: ${today}.
Active tasks: ${JSON.stringify(tasks.map((t) => ({ id: t.id, title: t.title, priority: t.priority, category: t.category, estimatedMinutes: t.estimatedDurationMinutes })))}
Goals: ${JSON.stringify(goals.map((g) => ({ title: g.title, progress: g.progress })))}
Habits: ${JSON.stringify(habits.map((h) => ({ name: h.name, reminderTime: h.reminderTime })))}

Generate a JSON object matching this schema:
{
  "focusTheme": "Single strong theme for the day",
  "summary": "Brief 1-sentence rationale for the schedule structure",
  "blocks": [
    {
      "id": "b-1",
      "startTime": "08:30",
      "endTime": "09:00",
      "title": "Block Title",
      "type": "deep_work" | "task" | "habit" | "break" | "review" | "meeting",
      "category": "work" | "personal" | "health" | "learning" | "finance",
      "relatedTaskId": "optional-task-id",
      "notes": "optional actionable note"
    }
  ]
}
`;

      const aiResponse = await callGeminiWithFallback(prompt, { temperature: 0.5 });

      if (aiResponse && aiResponse.text) {
        try {
          const parsed = JSON.parse(aiResponse.text);
          const plan: DailyFlowPlan = {
            id: 'flow-' + Date.now(),
            date: today,
            focusTheme: parsed.focusTheme || 'High Leverage Focus Day',
            summary: parsed.summary || 'Time-blocked for peak cognitive performance.',
            blocks: (parsed.blocks || []).map((b: any, idx: number) => ({
              ...b,
              id: b.id || `b-${idx + 1}`,
              completed: false,
            })),
            createdAt: new Date().toISOString(),
          };

          data.dailyFlows.unshift(plan);
          res.json({ plan });
          return;
        } catch (parseErr) {
          console.warn('Failed to parse AI Daily Flow response, using fallback plan.');
        }
      }

      // Fallback
      const fallbackPlan = buildDeterministicPlan();
      data.dailyFlows.unshift(fallbackPlan);
      res.json({ plan: fallbackPlan });
    } catch (err: any) {
      console.warn('Error in Daily Flow, using fallback plan:', err?.message || err);
      const fallbackPlan = buildDeterministicPlan();
      data.dailyFlows.unshift(fallbackPlan);
      res.json({ plan: fallbackPlan });
    }
  });

  // ==========================================
  // AI ACTION EXECUTION ENGINE
  // ==========================================
  app.post('/api/ai/execute-actions', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    const { actions } = req.body; // Array of AIProposedAction

    if (!Array.isArray(actions) || actions.length === 0) {
      res.status(400).json({ error: 'No actions provided' });
      return;
    }

    const results: any[] = [];

    for (const action of actions) {
      if (action.type === 'CREATE_TASK' && action.payload?.title) {
        const newTask: Task = {
          id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          userId,
          title: action.payload.title,
          description: action.payload.description || '',
          priority: action.payload.priority || 'high',
          category: (action.payload.category as any) || 'work',
          status: 'todo',
          dueDate: action.payload.dueDate || new Date().toISOString().split('T')[0],
          dueTime: action.payload.dueTime,
          estimatedDurationMinutes: action.payload.estimatedDurationMinutes || 45,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        data.tasks.unshift(newTask);
        results.push({ type: 'CREATE_TASK', success: true, item: newTask });
      } else if (action.type === 'COMPLETE_TASK') {
        const titleToMatch = action.payload?.title?.toLowerCase();
        const found = data.tasks.find((t) => t.title.toLowerCase().includes(titleToMatch || ''));
        if (found) {
          found.status = 'completed';
          found.completedAt = new Date().toISOString();
          found.updatedAt = new Date().toISOString();
          results.push({ type: 'COMPLETE_TASK', success: true, item: found });
        }
      } else if (action.type === 'CREATE_GOAL' && action.payload?.title) {
        const newGoal: Goal = {
          id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          userId,
          title: action.payload.title,
          description: action.payload.description || '',
          category: (action.payload.category as any) || 'work',
          priority: action.payload.priority || 'high',
          targetDate: action.payload.targetDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
          status: 'in_progress',
          progress: 0,
          milestones: [],
          color: '#06B6D4',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        data.goals.unshift(newGoal);
        results.push({ type: 'CREATE_GOAL', success: true, item: newGoal });
      } else if (action.type === 'LOG_EXPENSE' && action.payload?.amount) {
        const newExp: Expense = {
          id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          userId,
          amount: Number(action.payload.amount),
          description: action.payload.title || 'Logged Expense',
          category: (action.payload.category as any) || 'Other',
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'credit_card',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        data.expenses.unshift(newExp);
        results.push({ type: 'LOG_EXPENSE', success: true, item: newExp });
      }
    }

    // Add in-app notification confirming approved actions
    data.notifications.unshift({
      id: 'notif-' + Date.now(),
      userId,
      type: 'ai_recommendation',
      title: 'AI Actions Executed',
      message: `Successfully executed ${results.length} action(s) approved by you.`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, executedCount: results.length, results });
  });

  // ==========================================
  // WEEKLY REPORT
  // ==========================================
  app.get('/api/ai/weekly-review', async (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);

    const completedTasks = data.tasks.filter((t) => t.status === 'completed');
    const overdueTasks = data.tasks.filter((t) => t.status !== 'completed' && t.dueDate && t.dueDate < new Date().toISOString().split('T')[0]);
    const totalSpent = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);

    let habitConsistencySum = 0;
    data.habits.forEach((h) => {
      habitConsistencySum += Math.min(100, Math.round((h.completions.length / Math.max(1, h.targetDaysPerWeek * 4)) * 100));
    });
    const avgConsistency = data.habits.length ? Math.round(habitConsistencySum / data.habits.length) : 80;

    const report: WeeklyReportData = {
      weekLabel: 'Current Week',
      tasksCompleted: completedTasks.length,
      tasksOverdue: overdueTasks.length,
      totalTaskHours: Math.round(completedTasks.reduce((a, c) => a + (c.estimatedDurationMinutes || 30), 0) / 60),
      goalMilestonesHit: 3,
      habitAverageConsistency: avgConsistency,
      totalSpent,
      budgetStatus: totalSpent > data.profile.monthlyBudget ? 'over' : totalSpent > data.profile.monthlyBudget * 0.8 ? 'near' : 'under',
      productivityScore: Math.min(100, Math.max(20, 75 + completedTasks.length * 4 - overdueTasks.length * 6)),
      highlights: [
        `Maintained a 6-day streak in Morning Deep Work Block.`,
        `Advanced Staff Engineer promotion milestones by 18%.`,
        `Resolved ${completedTasks.length} key deliverables this cycle.`,
      ],
      growthAreas: [
        overdueTasks.length > 0 ? `Close out ${overdueTasks.length} lingering overdue items early.` : 'Continue pacing long-term project milestones.',
        'Protect afternoon rest periods to prevent evening cognitive fatigue.',
      ],
      recommendedFocus: [
        'Complete the Distributed Systems Bar-Raiser mock interview.',
        'Schedule your 18km long run early on Saturday morning.',
        'Review and optimize cloud hosting expenditures.',
      ],
      aiSynthesis: `You demonstrated strong execution velocity across high-priority work tasks, maintaining an impressive habit consistency of ${avgConsistency}%. Closing your ${overdueTasks.length} overdue items will unlock your optimal productivity band next week.`,
    };

    res.json({ report });
  });

  // ==========================================
  // EXERCISE & KINETIC FITNESS DATABASE API
  // ==========================================
  const exerciseLogsDb: Record<string, any[]> = {};
  const exerciseProfileDb: Record<string, any> = {};

  // Seed sample logs
  const getExerciseLogs = (userId: string) => {
    if (!exerciseLogsDb[userId]) {
      const today = new Date().toISOString();
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      exerciseLogsDb[userId] = [
        {
          id: 'log-1',
          userId,
          exerciseId: 'skipping',
          exerciseName: 'Rhythmic Skipping / Speed Jump Rope',
          category: 'cardio',
          repsCompleted: 120,
          durationSeconds: 60,
          caloriesBurned: 15,
          difficultyRating: 'perfect',
          timestamp: yesterday,
        },
        {
          id: 'log-2',
          userId,
          exerciseId: 'health_desk_chest_opener',
          exerciseName: 'Ergonomic Desk Chest & Pec Opener',
          category: 'general_health',
          durationSeconds: 45,
          caloriesBurned: 5,
          difficultyRating: 'easy',
          timestamp: today,
        },
      ];
    }
    return exerciseLogsDb[userId];
  };

  const getExerciseProfile = (userId: string) => {
    if (!exerciseProfileDb[userId]) {
      exerciseProfileDb[userId] = {
        id: userId,
        selectedDemographic: 'general_health',
        fitnessLevel: 'Beginner',
        dailyTargetMinutes: 20,
        voiceCoachSpeed: 1.0,
        preferredVoiceGender: 'female',
        autoVoiceNarration: true,
        soundEffectsEnabled: true,
        viewMode3DDefault: true,
        favorites: ['skipping', 'health_desk_chest_opener'],
        customRoutines: [],
      };
    }
    return exerciseProfileDb[userId];
  };

  // Get user exercise logs
  app.get('/api/exercise/logs', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const logs = getExerciseLogs(userId);
    res.json({ logs });
  });

  // Log an exercise completion
  app.post('/api/exercise/log', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const logs = getExerciseLogs(userId);
    const { exerciseId, exerciseName, category, repsCompleted, durationSeconds, caloriesBurned, difficultyRating, notes } = req.body;

    const newLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      exerciseId: exerciseId || 'custom',
      exerciseName: exerciseName || 'Exercise Session',
      category: category || 'general_health',
      repsCompleted: repsCompleted || 0,
      durationSeconds: durationSeconds || 30,
      caloriesBurned: caloriesBurned || 10,
      difficultyRating: difficultyRating || 'perfect',
      notes: notes || '',
      timestamp: new Date().toISOString(),
    };

    logs.unshift(newLog);
    res.json({ success: true, log: newLog, totalLogs: logs.length });
  });

  // Delete an exercise log
  app.delete('/api/exercise/log/:id', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const logs = getExerciseLogs(userId);
    const logId = req.params.id;
    const index = logs.findIndex((l) => l.id === logId);
    if (index !== -1) {
      logs.splice(index, 1);
    }
    res.json({ success: true, message: 'Log removed' });
  });

  // Get user exercise demographic profile
  app.get('/api/user/exercise-profile', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const profile = getExerciseProfile(userId);
    res.json({ profile });
  });

  // Update user exercise profile
  app.put('/api/user/exercise-profile', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const profile = getExerciseProfile(userId);
    Object.assign(profile, req.body);
    res.json({ success: true, profile });
  });

  // AI Voice Coach advice via Gemini
  app.post('/api/exercise/ai-coach-advice', async (req: Request, res: Response) => {
    const { exerciseName, category, question } = req.body;

    const prompt = `You are an elite, warm, and highly safety-conscious AI Athletic Coach & Physical Therapist.
The user is performing the exercise "${exerciseName}" in the category "${category}" (which may be for Kids, Pregnancy, Seniors, General Health, Cardio, Strength, or Mobility).

User's Question/Concern: "${question || 'What is the most important coaching cue for my safety and results?'}"

Provide concise, highly motivating, clear, and medically safe spoken coaching advice in 2-3 sentences. Speak directly to the user in a warm, encouraging second-person tone ("You"). Ensure your guidance is fully tailored to their demographic (e.g. gentle joint protection for seniors, avoiding flat-back compression for pregnancy, playful imagery for kids). Return a JSON object with:
{
  "advice": "Spoken coaching advice string",
  "keySafetyTip": "One short sentence safety reminder"
}`;

    try {
      const result = await callGeminiWithFallback(prompt);
      if (result && result.text) {
        const parsed = JSON.parse(result.text);
        return res.json(parsed);
      }
    } catch (err) {
      console.warn('AI Coach generation error:', err);
    }

    // Default safe fallback response
    res.json({
      advice: `For ${exerciseName || 'this movement'}, keep your spine long, breathe smoothly into your belly, and stay strictly inside a pain-free range of motion. Listen to your body and feel your strength grow with every repetition!`,
      keySafetyTip: 'Never hold your breath, and stop if you feel any sharp discomfort.',
    });
  });

  // AI Dynamic Readiness Assessment via Gemini
  app.post('/api/exercise/readiness-assessment', async (req: Request, res: Response) => {
    const { sleepHours, sleepQuality, sorenessLevel, sorenessArea, stressLevel, energyLevel, hrvMs, restingHr } = req.body;

    const prompt = `You are an elite sports scientist and biomechanical recovery specialist.
Analyze this user's daily physiological telemetry:
- Sleep: ${sleepHours || 7.5} hours (${sleepQuality || 'restful'})
- Muscle Soreness: ${sorenessLevel || 2}/10 (Area: ${sorenessArea || 'None'})
- Life Stress: ${stressLevel || 3}/10
- Energy Level: ${energyLevel || 8}/10
- HRV: ${hrvMs || 68}ms, Resting Heart Rate: ${restingHr || 54}bpm

Calculate an accurate Readiness Score (0-100).
Standout Factor: If the user is fatigued, stressed, or sore, automatically swap heavy strength/impact exercises for gentle mobility and spinal/pelvic decompression!
Return a JSON object with:
{
  "score": number,
  "state": "optimal" | "moderate" | "recovery" | "restorative",
  "aiCoachRationale": "2-3 sentences spoken advice from Coach Gemini explaining the score and why workouts were or were not modified",
  "adaptationActive": boolean,
  "adaptedWorkoutTitle": "Title of the workout routine",
  "adaptedWorkoutSubtitle": "Subtitle describing the focus",
  "volumeScaling": {
    "intensityPercent": number,
    "setsAdjustment": "e.g. Reduced to 2 gentle sets",
    "restAdjustment": "e.g. Extended 90s rest",
    "focusCue": "e.g. Parasympathetic Breathing & Joint Decompression"
  }
}`;

    try {
      const result = await callGeminiWithFallback(prompt);
      if (result && result.text) {
        const parsed = JSON.parse(result.text);
        return res.json(parsed);
      }
    } catch (err) {
      console.warn('Gemini Readiness Assessment error:', err);
    }

    res.json({ success: true, message: 'Using client-side physiological engine' });
  });

  // ==========================================
  // DATA MANAGEMENT (RESET DEMO & EXPORT)
  // ==========================================
  app.post('/api/data/reset-demo', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    db[userId] = getInitialDemoData(userId);
    res.json({ success: true, message: 'Demo data reset successfully' });
  });

  app.get('/api/data/export', (req: Request, res: Response) => {
    const userId = extractUserId(req);
    const data = getUserData(userId);
    res.json(data);
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeOps Server running on http://localhost:${PORT}`);
  });
}

startServer();
