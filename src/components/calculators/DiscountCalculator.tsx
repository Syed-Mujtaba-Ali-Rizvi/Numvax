'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { SliderStepperInput } from '../ui/SliderStepperInput';
import { CalculatorHistory, saveCalculationHistory } from '../calculator/CalculatorHistory';
import { calculateDiscount } from '../../lib/engine/calculators/discount';
import { DiscountResult } from '../../lib/engine/types';
import { Tag, Plus, Trash2, RotateCcw, Globe, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'USD ($) - United States' },
  { code: 'EUR', symbol: '€', name: 'EUR (€) - Eurozone' },
  { code: 'GBP', symbol: '£', name: 'GBP (£) - United Kingdom' },
  { code: 'CAD', symbol: 'CA$', name: 'CAD (CA$) - Canada' },
  { code: 'AUD', symbol: 'A$', name: 'AUD (A$) - Australia' },
  { code: 'INR', symbol: '₹', name: 'INR (₹) - India' },
  { code: 'PKR', symbol: 'Rs ', name: 'PKR (Rs) - Pakistan' },
  { code: 'AED', symbol: 'AED ', name: 'AED - United Arab Emirates' },
  { code: 'SAR', symbol: 'SAR ', name: 'SAR - Saudi Arabia' },
  { code: 'JPY', symbol: '¥', name: 'JPY (¥) - Japan' },
];

export const DiscountCalculator: React.FC = () => {
  const t = useTranslations('discountTool');
  const tCommon = useTranslations('common');

  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [originalPrice, setOriginalPrice] = useState<number>(100);
  const [discountPercentage, setDiscountPercentage] = useState<number>(20);
  const [stackedDiscounts, setStackedDiscounts] = useState<string[]>([]);
  const [isSequential, setIsSequential] = useState(true);
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [tipPercentage, setTipPercentage] = useState<number>(0);

  const [result, setResult] = useState<DiscountResult | null>(null);

  const sym = selectedCurrency.symbol;

  useEffect(() => {
    const stackedNums = stackedDiscounts.map((d) => Number(d)).filter((n) => !isNaN(n));

    const res = calculateDiscount({
      originalPrice,
      discountPercentage,
      stackedDiscounts: stackedNums,
      isSequential,
      taxPercentage,
      tipPercentage,
    });

    if (res.success && res.data) {
      setResult(res.data);
      saveCalculationHistory(
        'discount-calculator',
        'Discount Calculator',
        `Final: ${sym}${res.data.finalPrice.toFixed(2)} (${selectedCurrency.code})`
      );
    }
  }, [originalPrice, discountPercentage, stackedDiscounts, isSequential, taxPercentage, tipPercentage, selectedCurrency]);

  const addStackedDiscount = () => {
    setStackedDiscounts([...stackedDiscounts, '10']);
  };

  const removeStackedDiscount = (index: number) => {
    setStackedDiscounts(stackedDiscounts.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setOriginalPrice(100);
    setDiscountPercentage(20);
    setStackedDiscounts([]);
    setIsSequential(true);
    setTaxPercentage(0);
    setTipPercentage(0);
  };

  const savedPercent = originalPrice > 0 && result ? Math.round((result.totalSaved / originalPrice) * 100) : 0;

  return (
    <Card className="calculator-card flex flex-col gap-6">
      {/* Currency Selector Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#F5F2EB] border border-neutral-200/80 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
          <Globe className="w-4 h-4 text-neutral-600 shrink-0" />
          <span>Currency:</span>
        </div>
        <select
          value={selectedCurrency.code}
          onChange={(e) => {
            const found = CURRENCIES.find((c) => c.code === e.target.value);
            if (found) setSelectedCurrency(found);
          }}
          className="px-3.5 py-1.5 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 cursor-pointer shadow-2xs"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Input Controls */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {t('originalPrice')}
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
            label={`${t('originalPrice')} (${selectedCurrency.code})`}
            value={originalPrice}
            min={1}
            max={2000}
            step={5}
            prefix={sym}
            onChange={(v) => setOriginalPrice(v)}
            description="Drag slider or use - / + steppers to adjust sticker price."
          />

          <SliderStepperInput
            label={t('discountPercent')}
            value={discountPercentage}
            min={0}
            max={90}
            step={5}
            unit="%"
            onChange={(v) => setDiscountPercentage(v)}
            description="Drag slider or use - / + steppers to adjust discount rate."
          />

          {/* Stacked Discounts Section */}
          <div className="flex flex-col gap-3 p-4 bg-[#FBF9F5] border border-neutral-200/80 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-800">
                Stacked / Coupon Discounts ({stackedDiscounts.length})
              </span>
              <button
                type="button"
                onClick={addStackedDiscount}
                className="px-2.5 py-1 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-900 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add Coupon
              </button>
            </div>

            {stackedDiscounts.map((disc, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Extra %"
                  value={disc}
                  onChange={(e) => {
                    const copy = [...stackedDiscounts];
                    copy[idx] = e.target.value;
                    setStackedDiscounts(copy);
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl font-bold font-mono text-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => removeStackedDiscount(idx)}
                  className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SliderStepperInput
              label="Post-Discount Tax (%)"
              value={taxPercentage}
              min={0}
              max={30}
              step={1}
              unit="%"
              onChange={(v) => setTaxPercentage(v)}
            />
            <SliderStepperInput
              label="Optional Tip (%)"
              value={tipPercentage}
              min={0}
              max={30}
              step={1}
              unit="%"
              onChange={(v) => setTipPercentage(v)}
            />
          </div>
        </div>

        {/* Right Column: Visual Result Card & Price Comparison */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {t('discountBreakdown')}
          </span>

          {result ? (
            <div className="flex flex-col p-6 bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl gap-6 shadow-2xs">
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {t('finalPrice')}
                </span>
                <div className="text-5xl font-black text-neutral-900 tracking-tight font-mono">
                  {sym}{result.finalPrice.toFixed(2)}
                </div>
                <div className="mt-1 px-4 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> {t('youSave')}: {sym}{result.totalSaved.toFixed(2)} ({savedPercent}% OFF)
                </div>
              </div>

              {/* Price Comparison Bar */}
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/80">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                  <span className="text-neutral-500">Original: {sym}{originalPrice.toFixed(2)}</span>
                  <span className="text-emerald-700">You Pay: {sym}{result.finalPrice.toFixed(2)}</span>
                </div>

                <div className="w-full h-4 rounded-full bg-neutral-200 overflow-hidden flex shadow-2xs">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-500"
                    style={{ width: `${Math.max(100 - savedPercent, 5)}%` }}
                    title="Payable Price"
                  />
                  <div
                    className="bg-amber-400 h-full transition-all duration-500"
                    style={{ width: `${savedPercent}%` }}
                    title="Savings"
                  />
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-neutral-200 rounded-2xl flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">Discount Saved</span>
                  <span className="text-base font-bold text-emerald-800 font-mono mt-0.5">
                    {sym}{result.discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-white border border-neutral-200 rounded-2xl flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase">Tax + Tip</span>
                  <span className="text-base font-bold text-neutral-900 font-mono mt-0.5">
                    {sym}{(result.taxAmount + result.tipAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl text-neutral-500 text-xs font-medium">
              Enter price details to calculate final discount savings.
            </div>
          )}
        </div>
      </div>

      <CalculatorHistory slug="discount-calculator" />
    </Card>
  );
};
