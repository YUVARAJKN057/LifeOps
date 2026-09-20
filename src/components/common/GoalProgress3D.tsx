import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface GoalProgress3DProps {
  progress: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  showPercent?: boolean;
}

export const GoalProgress3D: React.FC<GoalProgress3DProps> = ({
  progress,
  color = '#c5a059',
  size = 54,
  strokeWidth = 4,
  showPercent = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  useEffect(() => {
    if (clampedProgress === 100) {
      // Trigger a light, celebratory burst
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#c5a059', '#e5c178', '#d1d1d1', '#ffffff'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [clampedProgress]);

  return (
    <div
      id="lifeops-goal-progress-3d"
      className="relative flex items-center justify-center inline-flex select-none"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-[#1a1a1a]"
          fill="transparent"
        />
        {/* Animated Progress Bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      {showPercent && (
        <span className="absolute text-[11px] font-mono font-semibold text-[#c5a059]">
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
};
