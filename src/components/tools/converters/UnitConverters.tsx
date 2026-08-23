'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { ArrowLeftRight, Copy, Check, Minus, Plus } from 'lucide-react';

interface UnitConvertersProps {
  toolSlug: string;
}

const CONVERSION_RATES: Record<string, Record<string, number>> = {
  // Base: Meters
  length: {
    meter: 1,
    kilometer: 0.001,
    centimeter: 100,
    millimeter: 1000,
    mile: 0.000621371,
    yard: 1.09361,
    foot: 3.28084,
    inch: 39.3701,
  },
  // Base: Kilograms
  weight: {
    kilogram: 1,
    gram: 1000,
    milligram: 1000000,
    pound: 2.20462,
    ounce: 35.274,
    ton: 0.001,
  },
  // Base: Km/h
  speed: {
    'km/h': 1,
    mph: 0.621371,
    'm/s': 0.277778,
    knot: 0.539957,
  },
  // Base: Liters
  volume: {
    liter: 1,
    milliliter: 1000,
    gallon: 0.264172,
    quart: 1.05669,
    pint: 2.11338,
    cup: 4.16667,
    fluid_ounce: 33.814,
  },
  // Base: Sq Meters
  area: {
    sq_meter: 1,
    sq_km: 0.000001,
    sq_foot: 10.7639,
    sq_mile: 3.861e-7,
    acre: 0.000247105,
    hectare: 0.0001,
  },
  // Base: Bytes
  'data-unit': {
    byte: 1,
    kilobyte: 1 / 1024,
    megabyte: 1 / (1024 * 1024),
    gigabyte: 1 / (1024 * 1024 * 1024),
    terabyte: 1 / (1024 * 1024 * 1024 * 1024),
  },
};

export const UnitConverters: React.FC<UnitConvertersProps> = ({ toolSlug }) => {
  const categoryKey = toolSlug.replace('-converter', '');
  const unitsMap = CONVERSION_RATES[categoryKey] || CONVERSION_RATES.length;
  const unitKeys = Object.keys(unitsMap);

  const [fromValue, setFromValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>(unitKeys[0] || 'meter');
  const [toUnit, setToUnit] = useState<string>(unitKeys[1] || 'kilometer');
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const convertUnits = React.useCallback(() => {
    const num = Number(fromValue);
    if (isNaN(num)) {
      setResult('Invalid Input');
      return;
    }

    if (categoryKey === 'temperature') {
      let celsius = num;
      if (fromUnit === 'fahrenheit') celsius = (num - 32) * (5 / 9);
      if (fromUnit === 'kelvin') celsius = num - 273.15;

      let out = celsius;
      if (toUnit === 'fahrenheit') out = celsius * (9 / 5) + 32;
      if (toUnit === 'kelvin') out = celsius + 273.15;
      setResult(out.toFixed(4).replace(/\.?0+$/, ''));
      return;
    }

    const fromRate = unitsMap[fromUnit] || 1;
    const toRate = unitsMap[toUnit] || 1;
    const baseValue = num / fromRate;
    const converted = baseValue * toRate;
    setResult(converted.toFixed(6).replace(/\.?0+$/, ''));
  }, [fromValue, fromUnit, toUnit, categoryKey, unitsMap]);

  useEffect(() => {
    convertUnits();
  }, [convertUnits]);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(`${fromValue} ${fromUnit} = ${result} ${toUnit}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="calculator-card flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-neutral-900 capitalize">{categoryKey.replace('-', ' ')} Converter</h2>
        <span className="text-xs font-semibold text-neutral-500">Live Instant Conversion</span>
      </div>

      {/* Dual Connected Conversion Panels */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Source Panel */}
        <div className="md:col-span-5 flex flex-col gap-3 p-5 bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">From Source Unit</span>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={fromValue}
              onChange={(e) => setFromValue(Number(e.target.value))}
              className="flex-1 px-4 py-3 bg-white border border-neutral-300 rounded-2xl text-xl font-bold font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setFromValue(fromValue + 1)}
                className="p-1.5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setFromValue(Math.max(0, fromValue - 1))}
                className="p-1.5 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 capitalize cursor-pointer"
          >
            {categoryKey === 'temperature' ? (
              <>
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
                <option value="kelvin">Kelvin (K)</option>
              </>
            ) : (
              unitKeys.map((u) => (
                <option key={u} value={u} className="capitalize">
                  {u.replace('_', ' ')}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-2 flex justify-center">
          <button
            type="button"
            onClick={swapUnits}
            className="p-3 bg-white border border-neutral-300 hover:bg-neutral-900 hover:text-white text-neutral-900 rounded-full shadow-2xs transition-all duration-300 hover:rotate-180 cursor-pointer"
            title="Swap Conversion Units"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        </div>

        {/* Target Panel */}
        <div className="md:col-span-5 flex flex-col gap-3 p-5 bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl shadow-2xs">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">To Converted Unit</span>

          <div className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-2xl text-xl font-bold font-mono text-neutral-900">
            {result || '0'}
          </div>

          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 capitalize cursor-pointer"
          >
            {categoryKey === 'temperature' ? (
              <>
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
                <option value="kelvin">Kelvin (K)</option>
              </>
            ) : (
              unitKeys.map((u) => (
                <option key={u} value={u} className="capitalize">
                  {u.replace('_', ' ')}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Result Formula & Quick Copy Card */}
      <div className="flex items-center justify-between p-4 bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl">
        <span className="text-xs font-semibold text-neutral-700">
          {fromValue} {fromUnit.replace('_', ' ')} = <strong className="text-neutral-900 font-mono text-sm">{result}</strong> {toUnit.replace('_', ' ')}
        </span>
        <button
          type="button"
          onClick={copyResult}
          className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy Result'}
        </button>
      </div>
    </Card>
  );
};
