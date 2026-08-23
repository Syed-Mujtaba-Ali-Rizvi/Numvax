'use client';

import React from 'react';

export interface PercentageProgressRingProps {
  percentage: number;
  label?: string;
  formattedValue: string;
  workedExample?: string;
  valX: number;
  valY: number;
  modeLabel?: string;
}

export const PercentageProgressRing: React.FC<PercentageProgressRingProps> = ({
  percentage,
  label = 'Calculated Result',
  formattedValue,
  workedExample,
  valX,
  valY,
  modeLabel,
}) => {
  const normalizedPct = Math.min(Math.max(percentage, 0), 100);
  const radius = 65;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl gap-6 shadow-2xs">
      {modeLabel && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 text-center">
          {modeLabel}
        </span>
      )}

      {/* SVG Donut Progress Ring */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#E5E5E5"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#171717"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-xs text-neutral-500 font-medium">{label}</span>
          <span className="text-3xl font-black text-neutral-900 font-mono tracking-tight mt-0.5">
            {formattedValue}
          </span>
        </div>
      </div>

      {/* Numerical Breakdown Visual Bar */}
      <div className="w-full max-w-xs flex flex-col gap-2 pt-2 border-t border-neutral-200/80">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 bg-white border border-neutral-200 rounded-2xl">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Input Value (X)</span>
            <div className="text-base font-bold text-neutral-900 font-mono mt-0.5">{valX}</div>
          </div>
          <div className="p-3 bg-white border border-neutral-200 rounded-2xl">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Base Value (Y)</span>
            <div className="text-base font-bold text-neutral-900 font-mono mt-0.5">{valY}</div>
          </div>
        </div>
      </div>

      {workedExample && (
        <div className="w-full max-w-xs p-3 bg-white border border-neutral-200 rounded-2xl text-xs text-neutral-700 font-mono leading-relaxed whitespace-pre-line">
          {workedExample}
        </div>
      )}
    </div>
  );
};
