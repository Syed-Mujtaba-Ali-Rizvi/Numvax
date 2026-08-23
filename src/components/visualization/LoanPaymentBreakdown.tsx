'use client';

import React from 'react';

export interface LoanPaymentBreakdownProps {
  paymentAmount: number;
  totalInterest: number;
  totalCost: number;
  loanAmount: number;
  currencySymbol: string;
  currencyCode: string;
  frequency: string;
  totalPaymentsCount: number;
}

export const LoanPaymentBreakdown: React.FC<LoanPaymentBreakdownProps> = ({
  paymentAmount,
  totalInterest,
  totalCost,
  loanAmount,
  currencySymbol: sym,
  currencyCode,
  frequency,
  totalPaymentsCount,
}) => {
  const principalPct = totalCost > 0 ? Math.round((loanAmount / totalCost) * 100) : 50;
  const interestPct = 100 - principalPct;

  return (
    <div className="flex flex-col p-6 bg-[#FAF8F5] border border-neutral-200/80 rounded-3xl gap-6 shadow-2xs">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          ESTIMATED PERIODIC PAYMENT ({frequency.toUpperCase()})
        </span>
        <div className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight font-mono">
          {sym}{paymentAmount.toFixed(2)}
        </div>
        <span className="text-xs text-neutral-500 font-medium">
          {totalPaymentsCount} total payments in {currencyCode}
        </span>
      </div>

      {/* Principal vs Interest Split Progress Bar */}
      <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200/80">
        <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" /> Principal ({principalPct}%)
          </span>
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Interest ({interestPct}%)
          </span>
        </div>

        <div className="w-full h-4 rounded-full bg-neutral-200 overflow-hidden flex shadow-2xs">
          <div className="bg-neutral-900 h-full transition-all duration-500" style={{ width: `${principalPct}%` }} title="Principal Amount" />
          <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${interestPct}%` }} title="Interest Paid" />
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white border border-neutral-200 rounded-2xl flex flex-col">
          <span className="text-[11px] font-semibold text-neutral-500">Total Principal</span>
          <span className="text-base font-bold text-neutral-900 font-mono mt-0.5">
            {sym}{loanAmount.toFixed(2)}
          </span>
        </div>
        <div className="p-3.5 bg-white border border-amber-200 rounded-2xl flex flex-col bg-amber-50/30">
          <span className="text-[11px] font-semibold text-amber-800">Total Interest Paid</span>
          <span className="text-base font-bold text-amber-900 font-mono mt-0.5">
            {sym}{totalInterest.toFixed(2)}
          </span>
        </div>
        <div className="p-3.5 bg-white border border-neutral-200 rounded-2xl flex flex-col">
          <span className="text-[11px] font-semibold text-neutral-500">Total Cost of Loan</span>
          <span className="text-base font-bold text-neutral-900 font-mono mt-0.5">
            {sym}{totalCost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
