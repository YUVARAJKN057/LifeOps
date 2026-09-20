import React, { useState } from 'react';
import {
  CheckSquare,
  IndianRupee,
  Mic,
  Clock,
  Flame,
  Sparkles,
  Zap,
  TrendingUp,
  Plus,
  Play,
  Volume2,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { FocusAudioEngine } from './FocusAudioEngine';

export const InteractiveDemoPlayground: React.FC<{ onLaunchFullApp: () => void }> = ({ onLaunchFullApp }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'wealth' | 'circadian' | 'voice' | 'habits'>('tasks');

  // ==========================================
  // 1. INTERACTIVE TASK SIMULATOR STATE
  // ==========================================
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Complete system architecture & API design', done: true, priority: 'Urgent', quadrant: 'Q1', time: '10:00 AM' },
    { id: '2', title: 'Review Q3 financial budget in ₹ INR', done: false, priority: 'High', quadrant: 'Q2', time: '02:30 PM' },
    { id: '3', title: '45-minute strength & endurance session', done: true, priority: 'Medium', quadrant: 'Q2', time: '05:00 PM' },
    { id: '4', title: 'Deploy AI autonomous coordinator to edge', done: false, priority: 'High', quadrant: 'Q1', time: '07:00 PM' },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  const completedCount = tasks.filter((t) => t.done).length;
  const taskEfficiencyScore = Math.round((completedCount / (tasks.length || 1)) * 100);

  const handleToggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newTaskInput.trim(),
        done: false,
        priority: 'High',
        quadrant: 'Q2',
        time: '04:00 PM',
      },
    ]);
    setNewTaskInput('');
  };

  // ==========================================
  // 2. RUPEE WEALTH & SIP CALCULATOR STATE
  // ==========================================
  const [monthlyIncome, setMonthlyIncome] = useState(150000); // ₹1.5 Lakh
  const [savingsRate, setSavingsRate] = useState(40); // 40%
  const [expectedReturn, setExpectedReturn] = useState(14); // 14% CAGR
  const [timeHorizonYears, setTimeHorizonYears] = useState(10); // 10 years

  const monthlySavings = (monthlyIncome * savingsRate) / 100;
  const needsBudget = (monthlyIncome * 50) / 100;
  const wantsBudget = (monthlyIncome * (100 - savingsRate - 50)) > 0 ? (monthlyIncome * (100 - savingsRate - 50)) / 100 : 0;

  // Future value of SIP formula: P * [((1+r)^n - 1) / r] * (1+r)
  const monthlyRate = expectedReturn / 12 / 100;
  const totalMonths = timeHorizonYears * 12;
  const futureWealth = Math.round(
    monthlySavings * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
  );

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // ==========================================
  // 3. CIRCADIAN ENERGY STATE
  // ==========================================
  const [wakeHour, setWakeHour] = useState(6); // 6 AM
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const circadianSlots = [
    { start: wakeHour, end: wakeHour + 2, label: 'Morning Activation', type: 'Wake & Hydrate', color: 'text-amber-300', bg: 'bg-amber-500/10' },
    { start: wakeHour + 2, end: wakeHour + 6, label: 'Deep Focus Peak (Cortisol High)', type: 'Deep Work & Architecture', color: 'text-[#c5a059]', bg: 'bg-[#c5a059]/15' },
    { start: wakeHour + 6, end: wakeHour + 8, label: 'Midday Dip & Lunch', type: 'Recharge & Light Sync', color: 'text-sky-300', bg: 'bg-sky-500/10' },
    { start: wakeHour + 8, end: wakeHour + 12, label: 'Secondary Flow State', type: 'Execution & Collaboration', color: 'text-emerald-300', bg: 'bg-emerald-500/10' },
    { start: wakeHour + 12, end: wakeHour + 14, label: 'Physical Endurance & Workout', type: 'Strength / Cardio', color: 'text-rose-300', bg: 'bg-rose-500/10' },
    { start: wakeHour + 14, end: wakeHour + 17, label: 'Melatonin Surge & Wind Down', type: 'Sleep Preparation', color: 'text-purple-300', bg: 'bg-purple-500/10' },
  ];

  // ==========================================
  // 4. VOICE AI SOUNDBOARD SIMULATOR
  // ==========================================
  const [activeVoicePrompt, setActiveVoicePrompt] = useState<string | null>(null);
  const [voiceResult, setVoiceResult] = useState<any | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const voiceSampleDirectives = [
    {
      id: 'v1',
      prompt: 'Log expense of ₹3,450 for Client Strategy Dinner at Taj Bengaluru',
      extracted: {
        action: 'FINANCIAL_TRANSACTION_LOGGED',
        amount: '₹3,450',
        category: 'Food & Dining',
        merchant: 'Taj Bengaluru',
        status: 'Debited from HDFC Prime',
      },
      speechResponse: 'Direct financial dispatch confirmed. Recorded ₹3,450 under Dining.',
    },
    {
      id: 'v2',
      prompt: 'Schedule Deep Work for Q3 Architecture tomorrow at 10:00 AM',
      extracted: {
        action: 'CALENDAR_EVENT_SCHEDULED',
        title: 'Q3 Architecture Deep Work',
        time: 'Tomorrow, 10:00 AM - 12:30 PM',
        energyRating: 'Peak Ultradian 95%',
      },
      speechResponse: 'Scheduled deep work block for tomorrow 10 AM during your peak focus window.',
    },
    {
      id: 'v3',
      prompt: 'What is my current productivity score and task completion yield?',
      extracted: {
        action: 'ANALYTICS_YIELD_ANALYZED',
        score: '92 / 100 (Tier I Prime)',
        completedTasks: '14 of 16 targets executed',
        burnRate: 'Well within ₹1.5L monthly budget',
      },
      speechResponse: 'Your system yield is currently 92 out of 100 with 14 of 16 target directives achieved.',
    },
  ];

  const handleRunVoiceSimulation = (sample: typeof voiceSampleDirectives[0]) => {
    setActiveVoicePrompt(sample.prompt);
    setVoiceResult(sample.extracted);
    setIsSynthesizing(true);

    // Speak using Web Speech API if supported
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(sample.speechResponse);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsSynthesizing(false);
        utterance.onerror = () => setIsSynthesizing(false);
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        setTimeout(() => setIsSynthesizing(false), 2000);
      }
    } else {
      setTimeout(() => setIsSynthesizing(false), 2000);
    }
  };

  // ==========================================
  // 5. HABIT STREAK SIMULATOR
  // ==========================================
  const [habitDays, setHabitDays] = useState([
    { day: 'Mon', completed: true },
    { day: 'Tue', completed: true },
    { day: 'Wed', completed: true },
    { day: 'Thu', completed: true },
    { day: 'Fri', completed: true },
    { day: 'Sat', completed: false },
    { day: 'Sun', completed: false },
  ]);

  const habitStreak = habitDays.filter((d) => d.completed).length;

  return (
    <div
      id="interactive-demo-playground"
      className="w-full bg-[#080808] border border-[#c5a059]/40 rounded-sm shadow-2xl overflow-hidden backdrop-blur-2xl transition-all"
    >
      {/* Playground Header & Tab Switcher */}
      <div className="p-4 sm:p-6 border-b border-[#1a1a1a] bg-gradient-to-r from-[#111] via-[#0d0d0d] to-[#080808]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-ping" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#c5a059] font-bold">
                Live Interactive Sandbox
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-serif text-white font-medium">
              Experience the LifeOps Core Engine Right Now
            </h3>
            <p className="text-xs text-[#888]">
              No registration required. Test priority matrices, ₹ INR compounding, voice commands & circadian rhythms live.
            </p>
          </div>

          <button
            onClick={onLaunchFullApp}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-sm bg-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest hover:bg-[#e0bb72] transition-all shadow-[0_0_15px_rgba(197,160,89,0.25)] flex-shrink-0"
          >
            <span>Launch Full Demo App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 pb-1 custom-scrollbar">
          {[
            { id: 'tasks', label: '1. Task Matrix', icon: <CheckSquare className="w-3.5 h-3.5" /> },
            { id: 'wealth', label: '2. ₹ Wealth & SIP', icon: <IndianRupee className="w-3.5 h-3.5" /> },
            { id: 'circadian', label: '3. Circadian Dial', icon: <Clock className="w-3.5 h-3.5" /> },
            { id: 'voice', label: '4. Voice AI (⌘J)', icon: <Mic className="w-3.5 h-3.5" /> },
            { id: 'habits', label: '5. Habit Streak', icon: <Flame className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#141414] border border-[#c5a059] text-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.15)] font-semibold'
                  : 'text-[#777] hover:text-[#ccc] hover:bg-[#111] border border-transparent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Playground Active View Body */}
      <div className="p-4 sm:p-6 bg-[#050505] min-h-[380px]">
        {/* ========================================== */}
        {/* 1. TASKS MATRIX SIMULATOR */}
        {/* ========================================== */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#141414]">
              <div>
                <h4 className="text-sm font-serif text-white">Eisenhower Directives Sandbox</h4>
                <p className="text-[11px] text-[#777]">Click to mark tasks done and watch real-time efficiency metrics recalibrate.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-sm bg-[#111] border border-[#222] text-xs font-mono">
                  Score: <span className="text-[#c5a059] font-bold">{taskEfficiencyScore}%</span>
                </div>
                <div className="px-2.5 py-1 rounded-sm bg-[#111] border border-[#222] text-xs font-mono text-[#aaa]">
                  {completedCount}/{tasks.length} Done
                </div>
              </div>
            </div>

            {/* Tasks List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3 rounded-sm border cursor-pointer transition-all flex items-center justify-between ${
                    task.done
                      ? 'bg-[#0a0a0a] border-emerald-900/40 opacity-70'
                      : 'bg-[#0d0d0d] border-[#1a1a1a] hover:border-[#c5a059]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-sm flex items-center justify-center transition-all ${
                        task.done
                          ? 'bg-emerald-500 text-black'
                          : 'border border-[#444] hover:border-[#c5a059]'
                      }`}
                    >
                      {task.done && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span
                      className={`text-xs truncate ${
                        task.done ? 'line-through text-[#666]' : 'text-[#ddd]'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm ml-2 flex-shrink-0 ${
                      task.priority === 'Urgent'
                        ? 'bg-rose-950/40 text-rose-300 border border-rose-900/40'
                        : 'bg-[#1a1a1a] text-[#c5a059] border border-[#262626]'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Type a new high-priority objective..."
                className="flex-1 px-3.5 py-2 rounded-sm bg-[#0a0a0a] border border-[#1a1a1a] text-white text-xs placeholder-[#555] focus:outline-none focus:border-[#c5a059]"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#161616] hover:bg-[#222] border border-[#c5a059]/40 text-[#c5a059] text-xs font-mono uppercase tracking-wider"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================== */}
        {/* 2. RUPEE WEALTH & SIP CALCULATOR */}
        {/* ========================================== */}
        {activeTab === 'wealth' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#141414]">
              <div>
                <h4 className="text-sm font-serif text-white">Indian Rupee (₹) Wealth & SIP Compounding Forecaster</h4>
                <p className="text-[11px] text-[#777]">Simulate 50/30/20 budget allocations and 10-year wealth acceleration in ₹ INR.</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#777] font-mono uppercase">10-Yr Projected Corpus</div>
                <div className="text-base sm:text-lg font-mono font-bold text-[#c5a059]">
                  {formatINR(futureWealth)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#888]">Monthly Income (₹)</span>
                    <span className="text-white font-bold">{formatINR(monthlyIncome)}</span>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="1000000"
                    step="10000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#1a1a1a] accent-[#c5a059] rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-[#888]">Monthly Savings / SIP Rate (%)</span>
                    <span className="text-[#c5a059] font-bold">{savingsRate}% ({formatINR(monthlySavings)}/mo)</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    step="5"
                    value={savingsRate}
                    onChange={(e) => setSavingsRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#1a1a1a] accent-[#c5a059] rounded-lg cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-[#888]">CAGR Return</span>
                      <span className="text-emerald-400 font-bold">{expectedReturn}%</span>
                    </div>
                    <input
                      type="range"
                      min="8"
                      max="20"
                      step="1"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#1a1a1a] accent-emerald-400 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1">
                      <span className="text-[#888]">Horizon</span>
                      <span className="text-sky-400 font-bold">{timeHorizonYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="25"
                      step="1"
                      value={timeHorizonYears}
                      onChange={(e) => setTimeHorizonYears(parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#1a1a1a] accent-sky-400 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Allocation Breakdown Cards */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-sm bg-[#0a0a0a] border border-[#1a1a1a] text-center">
                  <div className="text-[10px] text-[#777] font-mono uppercase">Needs (50%)</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-white mt-1">{formatINR(needsBudget)}</div>
                  <div className="text-[9px] text-[#555] mt-0.5">Rent, EMI, Food</div>
                </div>

                <div className="p-3 rounded-sm bg-[#0a0a0a] border border-[#1a1a1a] text-center">
                  <div className="text-[10px] text-[#777] font-mono uppercase">Wants ({Math.max(0, 100 - savingsRate - 50)}%)</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-amber-300 mt-1">{formatINR(wantsBudget)}</div>
                  <div className="text-[9px] text-[#555] mt-0.5">Travel, Dining</div>
                </div>

                <div className="p-3 rounded-sm bg-[#0e0e0e] border border-[#c5a059]/40 text-center">
                  <div className="text-[10px] text-[#c5a059] font-mono uppercase">SIP Invest ({savingsRate}%)</div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-[#c5a059] mt-1">{formatINR(monthlySavings)}</div>
                  <div className="text-[9px] text-[#c5a059]/70 mt-0.5">Mutual Funds & Gold</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 3. CIRCADIAN FOCUS DIAL */}
        {/* ========================================== */}
        {activeTab === 'circadian' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#141414]">
              <div>
                <h4 className="text-sm font-serif text-white">Circadian Chronotype Flow Engine</h4>
                <p className="text-[11px] text-[#777]">Align deep architecture sprints with natural hormonal energy peaks.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#888] font-mono">Wake Time:</span>
                <select
                  value={wakeHour}
                  onChange={(e) => setWakeHour(parseInt(e.target.value))}
                  className="px-2 py-1 rounded-sm bg-[#111] border border-[#222] text-xs font-mono text-[#c5a059]"
                >
                  <option value={5}>05:00 AM (Early Riser)</option>
                  <option value={6}>06:00 AM (Standard)</option>
                  <option value={7}>07:00 AM (Moderate)</option>
                  <option value={8}>08:00 AM (Night Owl)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {circadianSlots.map((slot, idx) => {
                const formatTime = (h: number) => {
                  const hr = h % 24;
                  const ampm = hr >= 12 ? 'PM' : 'AM';
                  const displayHr = hr % 12 === 0 ? 12 : hr % 12;
                  return `${displayHr}:00 ${ampm}`;
                };

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-sm border transition-all ${
                      slot.bg
                    } border-[#1a1a1a] hover:border-[#c5a059]/40`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-[#777]">
                        {formatTime(slot.start)} - {formatTime(slot.end)}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${slot.color}`}>
                        Slot {idx + 1}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-white mb-0.5">{slot.label}</div>
                    <div className="text-[10px] text-[#aaa] font-mono">{slot.type}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* 4. VOICE AI SOUNDBOARD */}
        {/* ========================================== */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#141414]">
              <div>
                <h4 className="text-sm font-serif text-white">Live Voice AI Command Tester</h4>
                <p className="text-[11px] text-[#777]">Click any voice directive below to test natural language parsing and voice playback.</p>
              </div>
              {isSynthesizing && (
                <div className="flex items-center gap-1.5 text-xs text-[#c5a059] font-mono animate-pulse">
                  <Volume2 className="w-4 h-4" />
                  <span>Synthesizing Voice Audio...</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {voiceSampleDirectives.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleRunVoiceSimulation(sample)}
                  className={`p-3.5 rounded-sm text-left border transition-all flex flex-col justify-between ${
                    activeVoicePrompt === sample.prompt
                      ? 'bg-[#111] border-[#c5a059] shadow-[0_0_15px_rgba(197,160,89,0.2)]'
                      : 'bg-[#0a0a0a] border-[#1a1a1a] hover:border-[#333]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 text-[#c5a059] text-[10px] font-mono uppercase mb-2">
                      <Mic className="w-3 h-3 animate-pulse" />
                      <span>Simulate Voice Prompt</span>
                    </div>
                    <p className="text-xs text-white leading-snug font-medium">"{sample.prompt}"</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#1a1a1a] flex items-center justify-between text-[10px] text-[#777]">
                    <span>Listen Voice Audio</span>
                    <Play className="w-3 h-3 text-[#c5a059] fill-current" />
                  </div>
                </button>
              ))}
            </div>

            {/* Extracted Structured Result */}
            {voiceResult && (
              <div className="p-4 rounded-sm bg-[#0e0e0e] border border-[#c5a059]/40 space-y-2 animate-in fade-in">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Structured Directive Generated</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {Object.entries(voiceResult).map(([key, val]) => (
                    <div key={key} className="p-2 rounded bg-[#080808] border border-[#1a1a1a]">
                      <div className="text-[9px] text-[#666] uppercase">{key}</div>
                      <div className="text-white truncate font-medium mt-0.5">{String(val)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* 5. HABIT STREAK SIMULATOR */}
        {/* ========================================== */}
        {activeTab === 'habits' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#141414]">
              <div>
                <h4 className="text-sm font-serif text-white">Atomic Habit Heatmap & Leveling</h4>
                <p className="text-[11px] text-[#777]">Toggle days of the week to calculate current streak score and level.</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-sm bg-[#111] border border-[#222] text-xs font-mono text-[#c5a059]">
                  Streak: {habitStreak} Days 🔥
                </div>
                <div className="px-2.5 py-1 rounded-sm bg-[#c5a059]/15 border border-[#c5a059]/40 text-xs font-mono text-[#c5a059]">
                  {habitStreak >= 5 ? 'Sovereign Operator 👑' : 'Apprentice ⚡'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {habitDays.map((d, i) => (
                <button
                  key={d.day}
                  onClick={() =>
                    setHabitDays((prev) =>
                      prev.map((item, idx) => (idx === i ? { ...item, completed: !item.completed } : item))
                    )
                  }
                  className={`p-3 rounded-sm text-center border transition-all ${
                    d.completed
                      ? 'bg-[#c5a059]/20 border-[#c5a059] text-[#c5a059] shadow-[0_0_10px_rgba(197,160,89,0.2)]'
                      : 'bg-[#0a0a0a] border-[#1a1a1a] text-[#555] hover:border-[#333]'
                  }`}
                >
                  <div className="text-[10px] font-mono uppercase mb-1">{d.day}</div>
                  <div className="text-base font-bold">{d.completed ? '✓' : '—'}</div>
                </button>
              ))}
            </div>

            {/* Ambient Soundscape Integrated Component */}
            <div className="pt-2">
              <FocusAudioEngine />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
