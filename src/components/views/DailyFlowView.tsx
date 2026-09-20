import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { ScheduleBlock, EnergyLevel } from '../../types';

export const DailyFlowView: React.FC = () => {
  const { dailyFlowPlan, isGeneratingAI, refreshDailyFlow, addToast } = useApp();

  const [localBlocks, setLocalBlocks] = useState<ScheduleBlock[]>(dailyFlowPlan?.blocks || []);

  // Update local blocks whenever context changes
  React.useEffect(() => {
    if (dailyFlowPlan?.blocks) {
      setLocalBlocks(dailyFlowPlan.blocks);
    }
  }, [dailyFlowPlan]);

  const energyBadge = (level: EnergyLevel) => {
    const styles: Record<EnergyLevel, string> = {
      high: 'bg-[#1a1505] text-[#e5c178] border-[#c5a059]/40',
      medium: 'bg-[#141414] text-[#d1d1d1] border-[#333]',
      low: 'bg-[#0a0a0a] text-[#7a7a7a] border-[#222]',
    };
    return (
      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-sm uppercase border ${styles[level]}`}>
        {level} Energy
      </span>
    );
  };

  const handleAcceptPlan = () => {
    addToast({
      title: 'Operational Schedule Confirmed',
      message: 'Time-blocks have been synchronized with your master chronological matrix.',
      type: 'success',
    });
  };

  return (
    <div id="lifeops-daily-flow-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.35em] font-medium mb-1">
            Chronotype Optimization
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Daily Flow Architecture
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1 font-light">
            Bioclock-aligned temporal structuring calibrated to your circadian peak states.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            id="daily-flow-regen-btn"
            onClick={refreshDailyFlow}
            disabled={isGeneratingAI}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-sm bg-[#0e0e0e] hover:bg-[#141414] text-[#d1d1d1] border border-[#1a1a1a] text-[10px] uppercase tracking-widest font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin text-[#c5a059]' : ''}`} />
            <span>Re-synthesize</span>
          </button>

          <button
            id="daily-flow-accept-btn"
            onClick={handleAcceptPlan}
            className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#c5a059] text-black text-xs uppercase tracking-widest font-semibold hover:bg-[#d8b56f] transition-all"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Accept Schedule</span>
          </button>
        </div>
      </div>

      {/* Energy & Summary Banner */}
      <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <span className="text-[10px] font-mono text-[#c5a059] uppercase tracking-widest block font-medium">
            Algorithmic Synthesis Summary
          </span>
          <p className="text-sm font-serif text-white leading-relaxed">
            {dailyFlowPlan?.summary ||
              'Time blocks prioritized for maximum deep work during morning cognitive surges, with administrative wrap-ups in the afternoon.'}
          </p>
        </div>

        {/* Energy distribution stats */}
        <div className="flex items-center gap-3 font-mono text-xs text-[#d1d1d1]">
          <div className="p-3.5 rounded-sm bg-[#050505] border border-[#141414] text-center min-w-[90px]">
            <span className="text-[9px] text-[#555] block uppercase tracking-wider">Deep Work</span>
            <span className="text-[#c5a059] font-serif font-bold text-sm">3.5 hrs</span>
          </div>
          <div className="p-3.5 rounded-sm bg-[#050505] border border-[#141414] text-center min-w-[90px]">
            <span className="text-[9px] text-[#555] block uppercase tracking-wider">Routines</span>
            <span className="text-white font-serif font-bold text-sm">1.5 hrs</span>
          </div>
          <div className="p-3.5 rounded-sm bg-[#050505] border border-[#141414] text-center min-w-[90px]">
            <span className="text-[9px] text-[#555] block uppercase tracking-wider">Rest</span>
            <span className="text-[#7a7a7a] font-serif font-bold text-sm">1.0 hrs</span>
          </div>
        </div>
      </div>

      {/* Time-Blocked Schedule Timeline */}
      <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#1a1a1a]">
          <h3 className="text-xs uppercase tracking-widest text-[#7a7a7a] font-medium flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Time-Blocked Schedule ({dailyFlowPlan?.date || 'Today'})</span>
          </h3>
          <span className="text-[10px] text-[#555] font-mono">{localBlocks.length} Blocks Scheduled</span>
        </div>

        {/* Timeline block items */}
        <div className="space-y-3 relative before:absolute before:left-24 before:top-2 before:bottom-2 before:w-px before:bg-[#1a1a1a]">
          {localBlocks.map((block) => (
            <div
              key={block.id}
              id={`timeblock-${block.id}`}
              className="flex items-start gap-6 p-4 rounded-sm bg-[#050505] border border-[#141414] hover:border-[#c5a059]/30 transition-all group"
            >
              {/* Time Column */}
              <div className="w-20 flex-shrink-0 text-right font-mono">
                <span className="text-xs font-serif text-[#c5a059] block">{block.startTime}</span>
                <span className="text-[9px] text-[#555]">{block.endTime}</span>
              </div>

              {/* Dot indicator */}
              <div className="w-2.5 h-2.5 rounded-full bg-[#c5a059] ring-4 ring-[#050505] flex-shrink-0 mt-1 relative z-10" />

              {/* Block Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-white truncate">{block.title}</h4>
                  <div className="flex items-center gap-2">
                    {energyBadge(block.energyLevel)}
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm bg-[#111] border border-[#222] text-[#7a7a7a]">
                      {block.category}
                    </span>
                  </div>
                </div>
                {block.description && (
                  <p className="text-xs text-[#7a7a7a] mt-1 font-light">{block.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
