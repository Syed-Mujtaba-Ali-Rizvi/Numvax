'use client';

import React from 'react';

export interface GpaScaleMeterProps {
  gpa: number;
  maxScale: number;
  totalCreditHours: number;
  totalGradePoints: number;
}

export const GpaScaleMeter: React.FC<GpaScaleMeterProps> = ({
  gpa,
  maxScale,
  totalCreditHours,
  totalGradePoints,
}) => {
  const percent = Math.min(Math.max((gpa / maxScale) * 100, 0), 100);

  const getHonorsLabel = () => {
    if (gpa >= 3.9) return { label: 'Summa Cum Laude (Highest Honors)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (gpa >= 3.7) return { label: 'Magna Cum Laude (High Honors)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    if (gpa >= 3.5) return { label: 'Cum Laude (Honors)', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    if (gpa >= 3.0) return { label: 'Good Academic Standing (Dean\'s List Range)', color: 'bg-sky-100 text-sky-800 border-sky-300' };
    if (gpa >= 2.0) return { label: 'Satisfactory Academic Standing', color: 'bg-neutral-100 text-neutral-800 border-neutral-300' };
    return { label: 'Academic Caution Warning', color: 'bg-rose-100 text-rose-800 border-rose-300' };
  };

  const honors = getHonorsLabel();

  return (
    <div className="flex flex-col p-6 bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl gap-6 shadow-2xs">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">CUMULATIVE GPA</span>
        <div className="text-5xl font-black text-neutral-900 tracking-tight font-serif">
          {gpa.toFixed(2)}
          <span className="text-xl text-neutral-500 font-mono font-normal"> / {maxScale.toFixed(1)}</span>
        </div>
        <div className={`mt-1 px-4 py-1 rounded-full text-xs font-bold border shadow-2xs ${honors.color}`}>
          {honors.label}
        </div>
      </div>

      {/* Visual GPA Scale Progress Bar */}
      <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/80">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
          <span>GPA Range (0.0 to {maxScale.toFixed(1)})</span>
          <span className="font-mono">{percent.toFixed(1)}% Score</span>
        </div>

        <div className="relative w-full h-3 rounded-full bg-neutral-200 overflow-hidden shadow-2xs">
          <div className="h-full bg-neutral-900 transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-neutral-500 font-semibold px-0.5">
          <span>0.0</span>
          <span>2.0</span>
          <span>3.0</span>
          <span>3.5</span>
          <span>{maxScale.toFixed(1)}</span>
        </div>
      </div>

      {/* Supporting Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white border border-neutral-200 rounded-2xl flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase text-neutral-500">Total Credit Hours</span>
          <span className="text-base font-bold text-neutral-900 font-mono mt-0.5">{totalCreditHours}</span>
        </div>
        <div className="p-3 bg-white border border-neutral-200 rounded-2xl flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase text-neutral-500">Total Grade Points</span>
          <span className="text-base font-bold text-neutral-900 font-mono mt-0.5">{totalGradePoints.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
