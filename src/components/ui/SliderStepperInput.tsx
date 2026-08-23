'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface SliderStepperInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  prefix?: string;
  onChange: (val: number) => void;
  description?: string;
  className?: string;
}

export const SliderStepperInput: React.FC<SliderStepperInputProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  prefix = '',
  onChange,
  description,
  className = '',
}) => {
  const handleDecrement = () => {
    const newVal = Math.max(min, Math.round((value - step) * 100) / 100);
    onChange(newVal);
  };

  const handleIncrement = () => {
    const newVal = Math.min(max, Math.round((value + step) * 100) / 100);
    onChange(newVal);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseFloat(e.target.value);
    if (!isNaN(num)) {
      onChange(num);
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  return (
    <div className={`flex flex-col gap-2.5 p-4 bg-[#FBF9F5] border border-neutral-200/80 rounded-2xl transition-all ${className}`}>
      {/* Header Label & Big Current Value */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-neutral-900 tracking-tight">{label}</label>
        <span className="text-sm font-bold text-neutral-900 font-mono">
          {prefix}{value} {unit}
        </span>
      </div>

      <span className="text-[11px] text-neutral-500 leading-none">
        {description || 'Drag slider or type exact number in the input box below:'}
      </span>

      {/* Range Slider Track */}
      <div className="relative flex items-center w-full my-1">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={isNaN(value) ? min : value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900 focus:outline-none"
        />
      </div>

      {/* Steppers & Prominent Typeable Input Box */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {/* Minus Stepper */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 disabled:opacity-30 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs shrink-0"
            aria-label="Decrease value"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Prominent Typeable Manual Input Field */}
          <div className="flex items-center bg-white px-3 py-1.5 rounded-xl border-2 border-neutral-300 focus-within:border-neutral-900 focus-within:ring-2 focus-within:ring-neutral-400/20 shadow-2xs transition-all">
            {prefix && <span className="text-xs font-bold text-neutral-700 mr-1">{prefix}</span>}
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={isNaN(value) ? '' : value}
              onChange={handleManualInputChange}
              className="w-16 sm:w-20 text-center bg-transparent border-none outline-none font-bold text-neutral-900 font-mono text-sm p-0 focus:ring-0"
              placeholder="0"
              aria-label={`Type value manually for ${label}`}
            />
            {unit && <span className="text-xs font-bold text-neutral-500 ml-1">{unit}</span>}
          </div>

          {/* Plus Stepper */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            className="w-9 h-9 rounded-xl bg-white border border-neutral-300 hover:bg-neutral-100 disabled:opacity-30 text-neutral-800 font-bold flex items-center justify-center transition-colors cursor-pointer active:scale-95 shadow-2xs shrink-0"
            aria-label="Increase value"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <span className="text-[10px] font-semibold text-neutral-500">
          Type or slide ({min}–{max})
        </span>
      </div>
    </div>
  );
};
