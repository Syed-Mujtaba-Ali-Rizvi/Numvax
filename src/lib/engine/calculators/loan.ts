import { roundHalfUp, safeDiv, toCents, fromCents } from '../math';
import { AmortizationRow, CalculationResult, LoanResult, PaymentFrequency } from '../types';

export interface LoanInput {
  loanAmount: number;
  annualInterestRate: number; // e.g. 5.5 for 5.5%
  termYears: number;
  termMonths?: number;
  paymentFrequency?: PaymentFrequency; // monthly, quarterly, yearly
}

/**
 * Loan Calculator engine with complete amortization schedule generation.
 */
export function calculateLoan(input: LoanInput): CalculationResult<LoanResult> {
  const {
    loanAmount,
    annualInterestRate,
    termYears,
    termMonths = 0,
    paymentFrequency = 'monthly',
  } = input;

  if (isNaN(loanAmount) || loanAmount <= 0) {
    return { success: false, error: 'Please enter a valid loan amount greater than zero.' };
  }

  if (isNaN(annualInterestRate) || annualInterestRate < 0) {
    return { success: false, error: 'Please enter a valid interest rate.' };
  }

  const totalMonths = termYears * 12 + termMonths;
  if (totalMonths <= 0) {
    return { success: false, error: 'Loan term must be at least 1 month.' };
  }

  let periodsPerYear = 12;
  if (paymentFrequency === 'quarterly') periodsPerYear = 4;
  if (paymentFrequency === 'yearly') periodsPerYear = 1;

  const totalPeriods = Math.ceil((totalMonths / 12) * periodsPerYear);
  const periodicRate = annualInterestRate / 100 / periodsPerYear;

  let paymentAmount = 0;
  if (periodicRate === 0) {
    paymentAmount = loanAmount / totalPeriods;
  } else {
    // PMT formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const factor = Math.pow(1 + periodicRate, totalPeriods);
    paymentAmount = (loanAmount * (periodicRate * factor)) / (factor - 1);
  }

  paymentAmount = roundHalfUp(paymentAmount, 2);

  // Build full amortization schedule
  let remainingBalanceCents = toCents(loanAmount);
  const schedule: AmortizationRow[] = [];
  let totalInterestCents = 0;
  let totalPaymentsCents = 0;

  for (let period = 1; period <= totalPeriods; period++) {
    const interestCents = Math.round((fromCents(remainingBalanceCents) * periodicRate) * 100);
    let paymentCents = toCents(paymentAmount);

    if (period === totalPeriods || paymentCents > remainingBalanceCents + interestCents) {
      // Final adjustment to ensure clean 0 balance at end
      paymentCents = remainingBalanceCents + interestCents;
    }

    const principalCents = paymentCents - interestCents;
    remainingBalanceCents = Math.max(0, remainingBalanceCents - principalCents);

    totalInterestCents += interestCents;
    totalPaymentsCents += paymentCents;

    schedule.push({
      period,
      payment: fromCents(paymentCents),
      principal: fromCents(principalCents),
      interest: fromCents(interestCents),
      remainingBalance: fromCents(remainingBalanceCents),
    });
  }

  const totalPaymentsAmount = fromCents(totalPaymentsCents);
  const totalInterest = fromCents(totalInterestCents);

  return {
    success: true,
    data: {
      paymentAmount,
      totalPaymentsCount: totalPeriods,
      totalPaymentsAmount,
      totalInterest,
      totalCost: totalPaymentsAmount,
      paymentFrequency,
      schedule,
    },
    summary: `$${paymentAmount.toFixed(2)} / ${paymentFrequency.slice(0, -2)}ly payment`,
  };
}
