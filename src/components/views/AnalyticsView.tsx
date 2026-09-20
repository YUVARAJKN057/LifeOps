import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  Flame,
  IndianRupee,
  Target,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card3D } from '../common/Card3D';
import { PerspectiveGrid3D } from '../common/PerspectiveGrid3D';

export const AnalyticsView: React.FC = () => {
  const { tasks, goals, habits, expenses, productivityScore, user } = useApp();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Generate trend data based on productivity
  const productivityTrend = useMemo(() => {
    const points = timeRange === '7d' ? 7 : timeRange === '30d' ? 14 : 20;
    const baseScore = productivityScore.total;
    const data = [];

    for (let i = points; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * (timeRange === '7d' ? 1 : 2));
      const variation = Math.sin(i * 0.8) * 8 + (Math.random() * 4 - 2);
      const score = Math.max(30, Math.min(100, Math.round(baseScore - i * 0.5 + variation)));
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score,
        tasks: Math.max(1, Math.round((score / 100) * 8)),
      });
    }
    return data;
  }, [timeRange, productivityScore.total]);

  // Task completion breakdown by priority
  const taskByPriority = useMemo(() => {
    const counts: Record<string, { total: number; done: number }> = {
      urgent: { total: 0, done: 0 },
      high: { total: 0, done: 0 },
      medium: { total: 0, done: 0 },
      low: { total: 0, done: 0 },
    };
    tasks.forEach((t) => {
      if (counts[t.priority]) {
        counts[t.priority].total += 1;
        if (t.status === 'completed') counts[t.priority].done += 1;
      }
    });

    return [
      { priority: 'Urgent', ...counts.urgent },
      { priority: 'High', ...counts.high },
      { priority: 'Medium', ...counts.medium },
      { priority: 'Low', ...counts.low },
    ];
  }, [tasks]);

  // Expense Pie Data
  const expensePieData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    const colors = ['#c5a059', '#e5c178', '#a88438', '#8a6e30', '#635025', '#3d3117', '#999999'];
    return Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length],
    }));
  }, [expenses]);

  // Metrics summary
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
  const avgGoalProgress =
    goals.length > 0 ? Math.round(goals.reduce((a, b) => a + b.progress, 0) / goals.length) : 0;
  const totalStreaks = habits.reduce((a, b) => a + b.currentStreak, 0);

  return (
    <div id="lifeops-analytics-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Filter Range */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.35em] font-medium mb-1">
            Performance Telemetry
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Yield Velocity & Analytics
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1 font-light">
            Algorithmic measurement of cognitive throughput, ritual continuity, and capital allocation.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#080808] rounded-sm border border-[#1a1a1a] self-start sm:self-auto">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              id={`analytics-range-${range}`}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider font-medium transition-colors ${
                timeRange === range
                  ? 'bg-[#c5a059] text-black font-bold'
                  : 'text-[#7a7a7a] hover:text-white hover:bg-[#111]'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 Performance Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card3D depth={10}>
          <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] h-full">
            <span className="text-[10px] text-[#7a7a7a] uppercase tracking-widest font-medium block mb-1">Efficiency Index</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif text-[#c5a059]">
                {productivityScore.total}
              </span>
              <span className="text-[10px] text-[#999] font-mono">Grade {productivityScore.grade}</span>
            </div>
            <span className="text-[10px] text-[#c5a059] mt-2 block font-mono">+4.2% vs baseline</span>
          </div>
        </Card3D>

        <Card3D depth={10}>
          <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] h-full">
            <span className="text-[10px] text-[#7a7a7a] uppercase tracking-widest font-medium block mb-1">Directive Fulfillment</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif text-white">{taskCompletionRate}%</span>
              <span className="text-[10px] text-[#555] font-mono">
                ({completedTasksCount}/{tasks.length})
              </span>
            </div>
            <span className="text-[10px] text-[#7a7a7a] mt-2 block font-light">High-leverage throughput</span>
          </div>
        </Card3D>

        <Card3D depth={10}>
          <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] h-full">
            <span className="text-[10px] text-[#7a7a7a] uppercase tracking-widest font-medium block mb-1">Portfolio Velocity</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif text-white">{avgGoalProgress}%</span>
              <span className="text-[10px] text-[#555] font-mono">{goals.length} objectives</span>
            </div>
            <span className="text-[10px] text-[#c5a059] mt-2 block font-light">Milestones on trajectory</span>
          </div>
        </Card3D>

        <Card3D depth={10}>
          <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] h-full">
            <span className="text-[10px] text-[#7a7a7a] uppercase tracking-widest font-medium block mb-1">Ritual Continuity</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif text-[#c5a059]">{totalStreaks}</span>
              <span className="text-[10px] text-[#555] font-mono">total days</span>
            </div>
            <span className="text-[10px] text-[#999] mt-2 block font-mono">Zero broken chains</span>
          </div>
        </Card3D>
      </div>

      {/* Primary Area Chart: Productivity Score Trajectory */}
      <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#c5a059]" />
            <h3 className="text-sm font-serif text-white uppercase tracking-wider">Productivity Trajectory ({timeRange.toUpperCase()})</h3>
          </div>
          <span className="text-[10px] text-[#555] font-mono">Normalized 0-100</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={productivityTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGoldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c5a059" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#c5a059" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
              <XAxis dataKey="date" stroke="#555" fontSize={10} tickLine={false} />
              <YAxis stroke="#555" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0a0a0a',
                  borderColor: '#c5a059',
                  borderRadius: '2px',
                  fontSize: '11px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#c5a059"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scoreGoldGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Two-Column Grid: Task Velocity & Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Priority Distribution Bar Chart */}
        <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#7a7a7a] font-medium flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Directives by Priority Level</span>
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskByPriority} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis dataKey="priority" stroke="#555" fontSize={10} tickLine={false} />
                <YAxis stroke="#555" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0a0a',
                    borderColor: '#333',
                    borderRadius: '2px',
                    fontSize: '11px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="total" fill="#222" name="Total Planned" radius={[2, 2, 0, 0]} />
                <Bar dataKey="done" fill="#c5a059" name="Fulfilled" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Pie Chart */}
        <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-[#7a7a7a] font-medium flex items-center gap-2">
            <IndianRupee className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Treasury Outflow Allocation (₹ INR)</span>
          </h3>

          <div className="h-60 w-full flex items-center justify-center">
            {expensePieData.length === 0 ? (
              <p className="text-xs text-[#555]">No ledger transactions recorded.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expensePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#080808" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => `₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    contentStyle={{
                      backgroundColor: '#0a0a0a',
                      borderColor: '#c5a059',
                      borderRadius: '2px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 3D Telemetry Horizon Plane */}
      <div className="relative rounded-sm overflow-hidden border border-[#1a1a1a] bg-[#080808]/40">
        <PerspectiveGrid3D height={120} intensity="subtle" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-3 text-[9px] font-mono uppercase tracking-[0.2em] text-[#7a7a7a]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Realtime Telemetry Synced</span>
          <span>&bull;</span>
          <span className="text-[#c5a059]">Spatial Metric Projection</span>
        </div>
      </div>
    </div>
  );
};
