/**
 * Types for Numvax Engine and Calculators
 */

export interface CalculationResult<T = Record<string, any>> {
  success: boolean;
  error?: string;
  data?: T;
  summary?: string;
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  dayOfWeekBorn: string;
  nextBirthdayDate: string;
  daysUntilNextBirthday: number;
  zodiacSign?: string;
}

export interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity';
  healthyWeightMin: number;
  healthyWeightMax: number;
  healthyWeightRangeStr: string;
  formulaDescription: string;
  interpretation: string;
  isMetric: boolean;
}

export type PercentageMode =
  | 'x_pct_of_y'
  | 'x_is_what_pct_of_y'
  | 'pct_increase'
  | 'pct_decrease'
  | 'pct_difference'
  | 'reverse_pct';

export interface PercentageResult {
  mode: PercentageMode;
  value: number;
  formattedValue: string;
  workedExample: string;
  formulaStr: string;
}

export interface GpaCourse {
  id: string;
  name: string;
  creditHours: number;
  grade: string;
}

export interface CustomGpaScaleItem {
  letter: string;
  points: number;
}

export interface GpaResult {
  totalCreditHours: number;
  totalGradePoints: number;
  gpa: number;
  maxScale: number;
  courseBreakdown: Array<{
    name: string;
    credits: number;
    grade: string;
    pointsPerCredit: number;
    totalPoints: number;
  }>;
}

export interface DiscountResult {
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  stackedDiscounts?: number[];
  isSequential: boolean;
  taxPercentage?: number;
  taxAmount: number;
  tipPercentage?: number;
  tipAmount: number;
  finalPrice: number;
  totalSaved: number;
}

export interface AmortizationRow {
  period: number;
  dateStr?: string;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export type PaymentFrequency = 'monthly' | 'quarterly' | 'yearly';

export interface LoanResult {
  paymentAmount: number;
  totalPaymentsCount: number;
  totalPaymentsAmount: number;
  totalInterest: number;
  totalCost: number;
  paymentFrequency: PaymentFrequency;
  schedule: AmortizationRow[];
}

export type DateMode = 'add_subtract' | 'difference' | 'business_days';

export interface DateResult {
  mode: DateMode;
  resultDateStr?: string;
  daysDifference?: number;
  weeksDifference?: number;
  monthsDifference?: number;
  yearsDifference?: number;
  businessDaysCount?: number;
  breakdownStr: string;
}
