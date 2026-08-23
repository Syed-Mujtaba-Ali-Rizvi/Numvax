'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { SliderStepperInput } from '../ui/SliderStepperInput';
import { BmiGauge } from '../visualization/BmiGauge';
import { CalculatorHistory, saveCalculationHistory } from '../calculator/CalculatorHistory';
import { calculateBmi } from '../../lib/engine/calculators/bmi';
import { BmiResult } from '../../lib/engine/types';
import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const BmiCalculator: React.FC = () => {
  const t = useTranslations('bmiTool');
  const [isMetric, setIsMetric] = useState(true);

  // Metric State
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);

  // Imperial State
  const [weightLbs, setWeightLbs] = useState<number>(154);
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(9);

  const [result, setResult] = useState<BmiResult | null>(null);

  // Live Auto-Calculation on slider/stepper change
  useEffect(() => {
    const res = calculateBmi({
      isMetric,
      weightKg,
      heightCm,
      weightLbs,
      heightFeet,
      heightInches,
    });

    if (res.success && res.data) {
      setResult(res.data);
      saveCalculationHistory('bmi-calculator', 'BMI Calculator', res.summary || `BMI: ${res.data.bmi}`);
    }
  }, [isMetric, weightKg, heightCm, weightLbs, heightFeet, heightInches]);

  const handleReset = () => {
    setWeightKg(70);
    setHeightCm(175);
    setWeightLbs(154);
    setHeightFeet(5);
    setHeightInches(9);
  };

  return (
    <Card className="calculator-card flex flex-col gap-6">
      {/* Unit Selector Segmented Control */}
      <div className="flex items-center justify-center p-1 bg-[#F5F2EB] border border-neutral-200/80 rounded-full max-w-xs mx-auto w-full">
        <button
          type="button"
          onClick={() => setIsMetric(true)}
          className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
            isMetric ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          {t('metric')}
        </button>
        <button
          type="button"
          onClick={() => setIsMetric(false)}
          className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
            !isMetric ? 'bg-neutral-900 text-white shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          {t('imperial')}
        </button>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Input Controls */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {t('measurements')}
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {t('liveFormula') === 'Reset' ? 'Reset' : 'Reset'}
            </button>
          </div>

          {isMetric ? (
            <>
              <SliderStepperInput
                label={t('weight')}
                value={weightKg}
                min={30}
                max={200}
                step={0.5}
                unit="kg"
                onChange={(v) => setWeightKg(v)}
                description={t('weightDescMetric')}
              />
              <SliderStepperInput
                label={t('height')}
                value={heightCm}
                min={100}
                max={230}
                step={1}
                unit="cm"
                onChange={(v) => setHeightCm(v)}
                description={t('heightDescMetric')}
              />
            </>
          ) : (
            <>
              <SliderStepperInput
                label={t('weight')}
                value={weightLbs}
                min={66}
                max={440}
                step={1}
                unit="lbs"
                onChange={(v) => setWeightLbs(v)}
                description={t('weightDescImperial')}
              />
              <div className="grid grid-cols-2 gap-3">
                <SliderStepperInput
                  label={t('heightFeet')}
                  value={heightFeet}
                  min={3}
                  max={7}
                  step={1}
                  unit="ft"
                  onChange={(v) => setHeightFeet(v)}
                />
                <SliderStepperInput
                  label={t('heightInches')}
                  value={heightInches}
                  min={0}
                  max={11}
                  step={1}
                  unit="in"
                  onChange={(v) => setHeightInches(v)}
                />
              </div>
            </>
          )}

          <div className="p-4 bg-[#FBF9F5] border border-neutral-200/80 rounded-2xl text-xs text-neutral-600 leading-relaxed">
            <span className="font-bold text-neutral-900 block mb-0.5">{t('liveFormula')}</span>
            {result?.formulaDescription || 'Adjust values above to see live BMI calculation details.'}
          </div>
        </div>

        {/* Right Column: Visual Gauge Result */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {t('gaugeTitle')}
          </span>

          {result ? (
            <BmiGauge
              bmi={result.bmi}
              category={result.category}
              healthyWeightRangeStr={result.healthyWeightRangeStr}
              interpretation={result.interpretation}
            />
          ) : (
            <div className="p-8 text-center bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl text-neutral-500 text-xs font-medium">
              Enter your weight and height parameters to view your BMI result.
            </div>
          )}
        </div>
      </div>

      <CalculatorHistory slug="bmi-calculator" />
    </Card>
  );
};
