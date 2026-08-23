'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { SliderStepperInput } from '../ui/SliderStepperInput';
import { LoanPaymentBreakdown } from '../visualization/LoanPaymentBreakdown';
import { CalculatorHistory, saveCalculationHistory } from '../calculator/CalculatorHistory';
import { calculateLoan } from '../../lib/engine/calculators/loan';
import { PaymentFrequency, LoanResult, AmortizationRow } from '../../lib/engine/types';
import { FileSpreadsheet, Printer, RotateCcw, Globe } from 'lucide-react';
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

export const LoanCalculator: React.FC = () => {
  const t = useTranslations('loanTool');
  const tCommon = useTranslations('common');

  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [loanAmount, setLoanAmount] = useState<number>(250000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');

  const [result, setResult] = useState<LoanResult | null>(null);

  const sym = selectedCurrency.symbol;

  useEffect(() => {
    const res = calculateLoan({
      loanAmount,
      annualInterestRate: interestRate,
      termYears: loanTermYears,
      paymentFrequency: frequency,
    });

    if (res.success && res.data) {
      setResult(res.data);
      saveCalculationHistory(
        'loan-calculator',
        'Loan Calculator',
        `PMT: ${sym}${res.data.paymentAmount.toFixed(2)} (${selectedCurrency.code})`
      );
    }
  }, [loanAmount, interestRate, loanTermYears, frequency, selectedCurrency]);

  const handleReset = () => {
    setLoanAmount(250000);
    setInterestRate(6.5);
    setLoanTermYears(30);
    setFrequency('monthly');
  };

  const exportAmortizationCsv = () => {
    if (!result) return;
    const headers = `Period,Payment (${selectedCurrency.code}),Principal,Interest,Remaining Balance\n`;
    const rows = result.schedule
      .map(
        (row: AmortizationRow) =>
          `${row.period},"${sym}${row.payment.toFixed(2)}","${sym}${row.principal.toFixed(
            2
          )}","${sym}${row.interest.toFixed(2)}","${sym}${row.remainingBalance.toFixed(2)}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Loan_Amortization_${selectedCurrency.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

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
        {/* Left Column: Interactive Inputs */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              {t('loanAmount')}
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
            label={`${t('loanAmount')} (${selectedCurrency.code})`}
            value={loanAmount}
            min={1000}
            max={1500000}
            step={5000}
            prefix={sym}
            onChange={(v) => setLoanAmount(v)}
            description="Drag slider or use - / + steppers to adjust principal."
          />

          <SliderStepperInput
            label={t('interestRate')}
            value={interestRate}
            min={0.1}
            max={25.0}
            step={0.1}
            unit="%"
            onChange={(v) => setInterestRate(v)}
            description="Adjust annual percentage interest rate."
          />

          <SliderStepperInput
            label={t('loanTermYears')}
            value={loanTermYears}
            min={1}
            max={40}
            step={1}
            unit="yrs"
            onChange={(v) => setLoanTermYears(v)}
            description="Set repayment term in full years."
          />

          {/* Payment Frequency Switcher */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-700">Payment Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {(['monthly', 'biweekly', 'weekly'] as PaymentFrequency[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer capitalize ${
                    frequency === f
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Breakdown & Payment Card */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {t('loanBreakdown')}
          </span>

          {result ? (
            <LoanPaymentBreakdown
              paymentAmount={result.paymentAmount}
              totalInterest={result.totalInterest}
              totalCost={result.totalCost}
              loanAmount={loanAmount}
              currencySymbol={sym}
              currencyCode={selectedCurrency.code}
              frequency={frequency}
              totalPaymentsCount={result.schedule.length}
            />
          ) : (
            <div className="p-8 text-center bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl text-neutral-500 text-xs font-medium">
              Adjust parameters to calculate your payment breakdown.
            </div>
          )}

          {/* Export & Print Toolbar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={exportAmortizationCsv}
              disabled={!result}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-xl text-xs font-bold text-neutral-800 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-xl text-xs font-bold text-neutral-800 transition-all cursor-pointer shadow-2xs"
            >
              <Printer className="w-4 h-4 text-neutral-600" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      <CalculatorHistory slug="loan-calculator" />
    </Card>
  );
};
