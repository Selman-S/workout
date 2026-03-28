"use client";

interface ProgressBarProps {
  progress: number; // 0-100
  color: string;
}

export default function ProgressBar({ progress, color }: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-400 font-medium">İlerleme</span>
        <span className="text-xs font-bold" style={{ color }}>
          %{Math.round(clampedProgress)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${clampedProgress}%`,
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
            boxShadow: clampedProgress > 0 ? `0 0 12px ${color}66` : "none",
          }}
        />
      </div>
    </div>
  );
}
