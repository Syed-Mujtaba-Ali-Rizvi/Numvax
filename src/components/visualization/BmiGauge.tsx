'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export interface BmiGaugeProps {
  bmi: number;
  category: string;
  healthyWeightRangeStr?: string;
  interpretation?: string;
}

export const BmiGauge: React.FC<BmiGaugeProps> = ({
  bmi,
  category,
  healthyWeightRangeStr,
  interpretation,
}) => {
  const t = useTranslations('bmiTool');

  // Map BMI value (14 to 40) to gauge arc needle angle (-80 deg to +80 deg)
  const clampedBmi = Math.min(Math.max(bmi, 14), 40);
  const angleDeg = -80 + ((clampedBmi - 14) / (40 - 14)) * 160;

  // Map BMI value (14 to 40) to linear range bar percentage (0% to 100%)
  const linearPercent = Math.min(Math.max(((clampedBmi - 14) / (40 - 14)) * 100, 2), 98);

  const getTranslatedCategory = (cat: string) => {
    const catLower = (cat || '').toLowerCase();
    if (catLower.includes('under')) return t('underweight');
    if (catLower.includes('normal') || catLower.includes('healthy')) return t('normalWeight');
    if (catLower.includes('over')) return t('overweight');
    return t('obese');
  };

  const getCategoryTheme = () => {
    const catLower = (category || '').toLowerCase();
    if (catLower.includes('under')) {
      return {
        badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
        color: '#0284C7',
      };
    }
    if (catLower.includes('normal') || catLower.includes('healthy')) {
      return {
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        color: '#16A34A',
      };
    }
    if (catLower.includes('over')) {
      return {
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
        color: '#D97706',
      };
    }
    return {
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      color: '#DC2626',
    };
  };

  const theme = getCategoryTheme();
  const displayCategory = getTranslatedCategory(category);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl gap-6 shadow-2xs">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{t('yourBmi')}</span>
        <div className="text-5xl font-black text-neutral-900 tracking-tight font-serif">
          {bmi.toFixed(1)}
        </div>
        <div className={`mt-1 px-4 py-1 rounded-full text-xs font-bold border shadow-2xs ${theme.badgeBg}`}>
          {displayCategory}
        </div>
      </div>

      {/* SVG Arc Gauge */}
      <div className="relative w-64 h-36 flex items-end justify-center">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {/* Arc Background Track - 4 Health Zones */}
          {/* Underweight Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 65 35"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Normal Arc */}
          <path
            d="M 67 33 A 80 80 0 0 1 133 33"
            fill="none"
            stroke="#22C55E"
            strokeWidth="14"
          />
          {/* Overweight Arc */}
          <path
            d="M 135 35 A 80 80 0 0 1 165 65"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="14"
          />
          {/* Obese Arc */}
          <path
            d="M 165 65 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#EF4444"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Needle Center Pivot & Indicator Arm */}
          <g transform={`rotate(${angleDeg}, 100, 100)`} className="transition-transform duration-500 ease-out">
            <line x1="100" y1="100" x2="100" y2="32" stroke="#171717" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="100" cy="100" r="7" fill="#171717" />
            <circle cx="100" cy="100" r="3" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* Arc Zone Labels */}
      <div className="flex items-center justify-between w-full max-w-xs text-[10px] font-bold text-neutral-600 uppercase tracking-wider px-2">
        <span className="text-sky-700">{t('underweight')}</span>
        <span className="text-emerald-700">{t('normalWeight')}</span>
        <span className="text-amber-700">{t('overweight')}</span>
        <span className="text-rose-700">{t('obese')}</span>
      </div>

      {/* Linear Range Bar */}
      <div className="w-full max-w-xs flex flex-col gap-2 pt-3 border-t border-neutral-200/80">
        <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
          <span>{t('gaugeTitle')}</span>
          <span className="font-mono text-neutral-900">{bmi.toFixed(1)}</span>
        </div>

        <div className="relative w-full h-3 rounded-full overflow-hidden flex bg-neutral-200">
          <div className="h-full bg-sky-400 w-[20%]" title="Underweight (<18.5)" />
          <div className="h-full bg-emerald-500 w-[30%]" title="Normal (18.5 - 24.9)" />
          <div className="h-full bg-amber-400 w-[20%]" title="Overweight (25 - 29.9)" />
          <div className="h-full bg-rose-500 w-[30%]" title="Obese (≥30)" />

          {/* Active Marker Dot */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-900 border-2 border-white shadow-sm transition-all duration-300"
            style={{ left: `calc(${linearPercent}% - 8px)` }}
          />
        </div>

        {/* Linear Range Tick Mark Labels */}
        <div className="flex justify-between text-[10px] font-mono text-neutral-500 px-1 font-semibold">
          <span>15</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40</span>
        </div>
      </div>

      {/* Healthy Weight Range Metric */}
      {healthyWeightRangeStr && (
        <div className="w-full max-w-xs p-3 bg-white border border-neutral-200 rounded-2xl flex flex-col items-center gap-1 text-center shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500">{t('healthyRange')}</span>
          <span className="text-sm font-bold text-neutral-900 font-mono">18.5 – 24.9</span>
          <span className="text-[11px] font-medium text-emerald-800">
            {healthyWeightRangeStr}
          </span>
        </div>
      )}

      {interpretation && (
        <p className="text-xs text-neutral-600 text-center max-w-xs leading-relaxed">
          {interpretation}
        </p>
      )}
    </div>
  );
};
