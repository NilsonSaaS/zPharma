"use client";

interface Props {
  score: number;
  label: string;
  color: string;
}

const COLOR_MAP: Record<string, string> = {
  green: "#22c55e",
  blue: "#3b82f6",
  orange: "#f97316",
  red: "#ef4444",
};

export default function HealthScoreGauge({ score, label, color }: Props) {
  const hex = COLOR_MAP[color] ?? "#22c55e";
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg
          className="rotate-[-90deg]"
          width="144"
          height="144"
          viewBox="0 0 144 144"
        >
          {/* Track */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Progress */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke={hex}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: hex }}>
            {score}
          </span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      <span
        className="mt-2 text-sm font-semibold px-3 py-1 rounded-full"
        style={{ backgroundColor: `${hex}20`, color: hex }}
      >
        {label}
      </span>
    </div>
  );
}
