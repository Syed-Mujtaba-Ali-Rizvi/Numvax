'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { SliderStepperInput } from '../ui/SliderStepperInput';
import { PercentageProgressRing } from '../visualization/PercentageProgressRing';
import { CalculatorHistory, saveCalculationHistory } from '../calculator/CalculatorHistory';
import { calculatePercentage } from '../../lib/engine/calculators/percentage';
import { PercentageMode, PercentageResult } from '../../lib/engine/types';
import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const PercentageCalculator: React.FC = () => {
  const t = useTranslations('percentageTool');
  const tCommon = useTranslations('common');

  const MODES: Array<{
    mode: PercentageMode;
    labelKey: 'xPctOfY' | 'xIsWhatPctOfY' | 'pctIncrease' | 'pctDecrease' | 'pctDifference' | 'reversePct';
  }> = [
    { mode: 'x_pct_of_y', labelKey: 'xPctOfY' },
    { mode: 'x_is_what_pct_of_y', labelKey: 'xIsWhatPctOfY' },
    { mode: 'pct_increase', labelKey: 'pctIncrease' },
    { mode: 'pct_decrease', labelKey: 'pctDecrease' },
    { mode: 'pct_difference', labelKey: 'pctDifference' },
    { mode: 'reverse_pct', labelKey: 'reversePct' },
  ];

  const [mode, setMode] = useState<PercentageMode>('x_pct_of_y');
  const [valX, setValX] = useState<number>(20);
  const [valY, setValY] = useState<number>(150);

  const [result, setResult] = useState<PercentageResult | null>(null);

  useEffect(() => {
    const res = calculatePercentage({ mode, valX, valY });
    if (res.success && res.data) {
      setResult(res.data);
      saveCalculationHistory('percentage-calculator', 'Percentage Calculator', `${t(MODES.find((m) => m.mode === mode)?.labelKey as any)}: ${res.data.formattedValue}`);
    }
  }, [mode, valX, valY]);

  const handleReset = () => {
    setValX(20);
    setValY(150);
  };

  const currentModeObj = MODES.find((m) => m.mode === mode);
  const currentModeLabel = currentModeObj ? t(currentModeObj.labelKey as any) : '';

  return (
    <Card className="calculator-card flex flex-col gap-6">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#F5F2EB] border border-neutral-200/80 rounded-2xl">
        {MODES.map((m) => (
          <button
            key={m.mode}
            type="button"
            onClick={() => setMode(m.mode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === m.mode
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            {t(m.labelKey as any)}
          </button>
        ))}
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Input Controls */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {currentModeLabel}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {tCommon('reset')}
            </button>
          </div>

          <SliderStepperInput
            label="X (First Value / Percentage)"
            value={valX}
            min={0}
            max={mode === 'x_pct_of_y' || mode === 'reverse_pct' ? 100 : 1000}
            step={mode === 'x_pct_of_y' || mode === 'reverse_pct' ? 1 : 5}
            unit={mode === 'x_pct_of_y' || mode === 'reverse_pct' ? '%' : undefined}
            onChange={(v) => setValX(v)}
            description="Drag slider or use - / + steppers to adjust value X."
          />

          <SliderStepperInput
            label="Y (Second Value / Total)"
            value={valY}
            min={0}
            max={2000}
            step={10}
            onChange={(v) => setValY(v)}
            description="Drag slider or use - / + steppers to adjust value Y."
          />

          <div className="p-4 bg-[#FBF9F5] border border-neutral-200/80 rounded-2xl text-xs text-neutral-600 leading-relaxed">
            <span className="font-bold text-neutral-900 block mb-0.5">{t('liveFormula')}</span>
            {result?.formulaStr || 'Adjust values above to see live step-by-step mathematical breakdown.'}
          </div>
        </div>

        {/* Right Column: Visual Donut Ring Result */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {t('progressRing')}
          </span>

          {result ? (
            <PercentageProgressRing
              percentage={result.value}
              label={t('calculatedResult')}
              formattedValue={result.formattedValue}
              workedExample={result.workedExample}
              valX={valX}
              valY={valY}
              modeLabel={currentModeLabel}
            />
          ) : (
            <div className="p-8 text-center bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl text-neutral-500 text-xs font-medium">
              Enter percentage parameters to render the visual progress ring.
            </div>
          )}
        </div>
      </div>

      <CalculatorHistory slug="percentage-calculator" />
    </Card>
  );
};
