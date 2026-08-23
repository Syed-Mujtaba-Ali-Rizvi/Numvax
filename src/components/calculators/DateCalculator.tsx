'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { SliderStepperInput } from '../ui/SliderStepperInput';
import { DateTimelineVisualizer } from '../visualization/DateTimelineVisualizer';
import { CalculatorHistory, saveCalculationHistory } from '../calculator/CalculatorHistory';
import { calculateDate } from '../../lib/engine/calculators/date';
import { DateMode, DateResult } from '../../lib/engine/types';
import { RotateCcw } from 'lucide-react';

const MODES: Array<{ mode: DateMode; label: string }> = [
  { mode: 'add_subtract', label: 'Add or Subtract Days' },
  { mode: 'difference', label: 'Difference Between 2 Dates' },
  { mode: 'business_days', label: 'Business Days (Mon-Fri)' },
];

export const DateCalculator: React.FC = () => {
  const [mode, setMode] = useState<DateMode>('add_subtract');
  const [startDateStr, setStartDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDateStr, setEndDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [yearsAmount, setYearsAmount] = useState<number>(0);
  const [monthsAmount, setMonthsAmount] = useState<number>(0);
  const [daysAmount, setDaysAmount] = useState<number>(30);

  const [result, setResult] = useState<DateResult | null>(null);

  useEffect(() => {
    const res = calculateDate({
      mode,
      startDateStr,
      endDateStr,
      operation,
      yearsAmount,
      monthsAmount,
      daysAmount,
    });

    if (res.success && res.data) {
      setResult(res.data);
      saveCalculationHistory('date-calculator', 'Date Calculator', res.summary || res.data.breakdownStr);
    }
  }, [mode, startDateStr, endDateStr, operation, yearsAmount, monthsAmount, daysAmount]);

  const handleReset = () => {
    setStartDateStr(new Date().toISOString().split('T')[0]);
    setEndDateStr(new Date().toISOString().split('T')[0]);
    setOperation('add');
    setYearsAmount(0);
    setMonthsAmount(0);
    setDaysAmount(30);
  };

  return (
    <Card className="calculator-card flex flex-col gap-6">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-[#F5F2EB] border border-neutral-200/80 rounded-2xl">
        {MODES.map((m) => (
          <button
            key={m.mode}
            type="button"
            onClick={() => setMode(m.mode)}
            className={`p-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
              mode === m.mode
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Controls */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Interactive Date Inputs
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 p-4 bg-[#FBF9F5] border border-neutral-200/80 rounded-2xl">
              <label className="text-xs font-bold text-neutral-800">Start Date</label>
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl font-bold font-mono text-neutral-900 focus:outline-none cursor-pointer"
              />
            </div>

            {mode !== 'add_subtract' && (
              <div className="flex flex-col gap-1.5 p-4 bg-[#FBF9F5] border border-neutral-200/80 rounded-2xl">
                <label className="text-xs font-bold text-neutral-800">End Date</label>
                <input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl font-bold font-mono text-neutral-900 focus:outline-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {mode === 'add_subtract' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-3 bg-[#F5F2EB] border border-neutral-200/80 rounded-2xl">
                <span className="text-xs font-bold text-neutral-800">Operation:</span>
                <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 cursor-pointer">
                  <input
                    type="radio"
                    name="dateOp"
                    checked={operation === 'add'}
                    onChange={() => setOperation('add')}
                    className="accent-neutral-900"
                  />
                  Add (+)
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 cursor-pointer">
                  <input
                    type="radio"
                    name="dateOp"
                    checked={operation === 'subtract'}
                    onChange={() => setOperation('subtract')}
                    className="accent-neutral-900"
                  />
                  Subtract (-)
                </label>
              </div>

              <SliderStepperInput
                label="Days to Add/Subtract"
                value={daysAmount}
                min={0}
                max={365}
                step={1}
                unit="days"
                onChange={(v) => setDaysAmount(v)}
              />
            </div>
          )}
        </div>

        {/* Right Column: Date Timeline Visualization */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Timeline & Duration Breakdown
          </span>

          {result ? (
            <DateTimelineVisualizer
              primaryTitle={
                mode === 'add_subtract'
                  ? 'RESULT TARGET DATE'
                  : mode === 'business_days'
                  ? 'BUSINESS DAYS COUNT'
                  : 'EXACT TIME DIFFERENCE'
              }
              primaryValue={
                mode === 'add_subtract'
                  ? result.resultDateStr || ''
                  : mode === 'business_days'
                  ? `${result.businessDaysCount} Business Days`
                  : `${result.daysDifference} Total Days`
              }
              summaryText={result.breakdownStr}
              years={result.yearsDifference}
              months={result.monthsDifference}
              weeks={result.weeksDifference}
              days={result.daysDifference}
              businessDays={result.businessDaysCount}
            />
          ) : (
            <div className="p-8 text-center bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl text-neutral-500 text-xs font-medium">
              Select dates to calculate timeline breakdown.
            </div>
          )}
        </div>
      </div>

      <CalculatorHistory slug="date-calculator" />
    </Card>
  );
};
