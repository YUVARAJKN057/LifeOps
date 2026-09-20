import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Flame,
  Clock,
  Dumbbell,
  CheckCircle2,
  Calendar,
  Sparkles,
  RotateCcw,
  Bot,
  Layers,
  Database,
  Trash2,
} from 'lucide-react';
import { EXERCISE_CATALOG, ExerciseGuide } from '../../data/exerciseCatalogData';
import { ExerciseLog } from '../../types';

interface ExerciseStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedHistory: Array<{ exerciseId: string; timestamp: number; logId?: string }>;
  onClearHistory: () => void;
}

export const ExerciseStatsModal: React.FC<ExerciseStatsModalProps> = ({
  isOpen,
  onClose,
  completedHistory,
  onClearHistory,
}) => {
  const [dbLogs, setDbLogs] = useState<ExerciseLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  // Fetch from server database
  useEffect(() => {
    if (isOpen) {
      setIsLoadingLogs(true);
      fetch('/api/exercise/logs')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.logs) {
            setDbLogs(data.logs);
          }
        })
        .catch((err) => console.warn('Could not fetch server logs:', err))
        .finally(() => setIsLoadingLogs(false));
    }
  }, [isOpen, completedHistory.length]);

  if (!isOpen) return null;

  const totalCompleted = dbLogs.length > 0 ? dbLogs.length : completedHistory.length;
  const totalCalories = dbLogs.reduce((acc, l) => acc + (l.caloriesBurned || 15), 0) || totalCompleted * 25;
  const totalMinutes = Math.round(dbLogs.reduce((acc, l) => acc + (l.durationSeconds || 60), 0) / 60) || totalCompleted * 2;

  const handleDeleteLog = async (logId: string) => {
    try {
      await fetch(`/api/exercise/log/${logId}`, { method: 'DELETE' });
      setDbLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (err) {
      console.warn('Error deleting log:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#0e0e14] border border-[#262634] rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#14141c] border-b border-[#22222e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#c5a059]/15 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <Trophy className="w-4 h-4 text-[#c5a059]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-white">
                  Database & Activity Logs
                </h3>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-xs bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  Synced
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#888]">
                Real-time exercise history & caloric energy tracking.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#777] hover:text-white rounded-xs hover:bg-[#20202c]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Scorecards */}
        <div className="p-4 grid grid-cols-3 gap-2.5 border-b border-[#20202c] bg-[#101017]">
          <div className="p-3 bg-[#151520] border border-[#2a2a38] rounded-sm text-center">
            <div className="text-[10px] font-mono text-[#888]">SESSIONS LOGGED</div>
            <div className="text-lg sm:text-xl font-mono font-bold text-emerald-400 mt-0.5">
              {totalCompleted}
            </div>
            <div className="text-[9px] font-mono text-[#666]">completed</div>
          </div>

          <div className="p-3 bg-[#151520] border border-[#2a2a38] rounded-sm text-center">
            <div className="text-[10px] font-mono text-[#888]">TOTAL ENERGY</div>
            <div className="text-lg sm:text-xl font-mono font-bold text-[#c5a059] mt-0.5">
              ~{totalCalories}
            </div>
            <div className="text-[9px] font-mono text-[#666]">kcal burned</div>
          </div>

          <div className="p-3 bg-[#151520] border border-[#2a2a38] rounded-sm text-center">
            <div className="text-[10px] font-mono text-[#888]">PRACTICE TIME</div>
            <div className="text-lg sm:text-xl font-mono font-bold text-sky-400 mt-0.5">
              {totalMinutes}m
            </div>
            <div className="text-[9px] font-mono text-[#666]">active effort</div>
          </div>
        </div>

        {/* Completed History List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#888] pb-1">
            <span>Database Activity Records:</span>
            {totalCompleted > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[10px] text-red-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Local Cache</span>
              </button>
            )}
          </div>

          {isLoadingLogs ? (
            <div className="py-8 text-center text-xs font-mono text-[#777]">
              Loading database records...
            </div>
          ) : dbLogs.length === 0 && completedHistory.length === 0 ? (
            <div className="py-8 text-center space-y-2 border border-dashed border-[#242434] rounded-sm bg-[#12121a]">
              <Dumbbell className="w-6 h-6 text-[#555] mx-auto" />
              <p className="text-xs text-[#888] font-mono">No exercises logged yet today.</p>
              <p className="text-[10px] text-[#666] font-mono">
                Click "Log Exercise Done" on any movement to record your stats.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {dbLogs.map((log) => {
                const ex = EXERCISE_CATALOG.find((e) => e.id === log.exerciseId);
                return (
                  <div
                    key={log.id}
                    className="p-3 bg-[#151520] border border-[#282836] rounded-sm flex items-center justify-between gap-3 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-white block">
                          {log.exerciseName || ex?.name || log.exerciseId}
                        </span>
                        <span className="text-[10px] text-[#777]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.caloriesBurned || 15} kcal
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1 text-[#666] hover:text-red-400 rounded-xs transition-colors"
                      title="Remove record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#101017] border-t border-[#20202c] text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#20202c] hover:bg-[#282838] text-white font-mono text-xs font-semibold rounded-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
