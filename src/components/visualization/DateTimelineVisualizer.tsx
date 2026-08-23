'use client';

import React from 'react';

export interface DateTimelineVisualizerProps {
  primaryTitle: string;
  primaryValue: string;
  summaryText?: string;
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  businessDays?: number;
}

export const DateTimelineVisualizer: React.FC<DateTimelineVisualizerProps> = ({
  primaryTitle,
  primaryValue,
  summaryText,
  years,
  months,
  weeks,
  days,
  businessDays,
}) => {
  return (
    <div className="flex flex-col p-6 bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl gap-6 shadow-2xs">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{primaryTitle}</span>
        <div className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight font-mono">
          {primaryValue}
        </div>
        {summaryText && <p className="text-xs text-neutral-600 font-medium mt-1">{summaryText}</p>}
      </div>

      {/* Date Breakdown Grid */}
      {(years !== undefined || months !== undefined || days !== undefined || businessDays !== undefined) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-neutral-200/80">
          {years !== undefined && (
            <div className="p-3.5 bg-white border border-neutral-200 rounded-2xl flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase text-neutral-500">Years</span>
              <span className="text-xl font-black text-neutral-900 font-mono mt-0.5">{years}</span>
            </div>
          )}
          {months !== undefined && (
            <div className="p-3.5 bg-white border border-neutral-200 rounded-2xl flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase text-neutral-500">Months</span>
              <span className="text-xl font-black text-neutral-900 font-mono mt-0.5">{months}</span>
            </div>
          )}
          {weeks !== undefined && (
            <div className="p-3.5 bg-white border border-neutral-200 rounded-2xl flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase text-neutral-500">Weeks</span>
              <span className="text-xl font-black text-neutral-900 font-mono mt-0.5">{weeks}</span>
            </div>
          )}
          {days !== undefined && (
            <div className="p-3.5 bg-white border border-neutral-200 rounded-2xl flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase text-neutral-500">Total Days</span>
              <span className="text-xl font-black text-neutral-900 font-mono mt-0.5">{days}</span>
            </div>
          )}
          {businessDays !== undefined && (
            <div className="p-3.5 bg-white border border-neutral-200 rounded-2xl flex flex-col items-center text-center col-span-2">
              <span className="text-[10px] font-bold uppercase text-neutral-500">Business Days (Mon-Fri)</span>
              <span className="text-xl font-black text-emerald-800 font-mono mt-0.5">{businessDays}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
