import { describe, it, expect } from 'vitest';
import { calculateAge, getZodiacSign } from '../lib/engine/calculators/age';
import { calculateBmi } from '../lib/engine/calculators/bmi';
import { calculatePercentage } from '../lib/engine/calculators/percentage';
import { calculateGpa } from '../lib/engine/calculators/gpa';
import { calculateDiscount } from '../lib/engine/calculators/discount';
import { calculateLoan } from '../lib/engine/calculators/loan';
import { calculateDate } from '../lib/engine/calculators/date';
import { roundHalfUp, safeDiv, formatCurrency, parseInputNumber } from '../lib/engine/math';

describe('Math Engine Accuracy & Decimal Rounding Standard (Section 14)', () => {
  it('performs standard round-half-up rounding without floating point artifacts', () => {
    expect(roundHalfUp(2.345, 2)).toBe(2.35);
    expect(roundHalfUp(2.344, 2)).toBe(2.34);
    expect(roundHalfUp(1.005, 2)).toBe(1.01);
    expect(roundHalfUp(-2.345, 2)).toBe(-2.35);
  });

  it('safely formats currency without floating point flaws', () => {
    expect(formatCurrency(19.999)).toBe('$20.00');
    expect(formatCurrency(0.1 + 0.2)).toBe('$0.30');
    expect(formatCurrency(1000000.5)).toBe('$1,000,000.50');
  });

  it('handles division by zero safely without throwing NaN/Infinity', () => {
    expect(safeDiv(10, 0, 0)).toBe(0);
    expect(safeDiv(0, 0, 99)).toBe(99);
  });

  it('parses input strings, empty fields, and numbers cleanly', () => {
    expect(parseInputNumber('1,250.50')).toBe(1250.5);
    expect(parseInputNumber('')).toBe(null);
    expect(parseInputNumber(null)).toBe(null);
    expect(parseInputNumber('invalid')).toBe(null);
  });
});

describe('Zodiac Sign Accuracy Verification (12-Sign Matrix)', () => {
  it('verifies all 12 Zodiac sign boundary dates accurately', () => {
    expect(getZodiacSign(3, 21)).toBe('Aries ♈');
    expect(getZodiacSign(4, 20)).toBe('Taurus ♉');
    expect(getZodiacSign(5, 21)).toBe('Gemini ♊');
    expect(getZodiacSign(6, 21)).toBe('Cancer ♋');
    expect(getZodiacSign(7, 23)).toBe('Leo ♌');
    expect(getZodiacSign(8, 23)).toBe('Virgo ♍');
    expect(getZodiacSign(9, 23)).toBe('Libra ♎');
    expect(getZodiacSign(10, 23)).toBe('Scorpio ♏');
    expect(getZodiacSign(11, 22)).toBe('Sagittarius ♐');
    expect(getZodiacSign(12, 22)).toBe('Capricorn ♑');
    expect(getZodiacSign(1, 20)).toBe('Aquarius ♒');
    expect(getZodiacSign(2, 19)).toBe('Pisces ♓');
  });
});

describe('1. Age Calculator Test Matrix (Boundary & Edge Cases)', () => {
  it('normal case: exact age calculation', () => {
    const res = calculateAge('1995-05-15', '2025-05-15');
    expect(res.success).toBe(true);
    expect(res.data?.years).toBe(30);
    expect(res.data?.months).toBe(0);
    expect(res.data?.days).toBe(0);
  });

  it('leap year case: February 29 birthdate in leap and non-leap years', () => {
    const leapRes = calculateAge('2000-02-29', '2024-02-29');
    expect(leapRes.success).toBe(true);
    expect(leapRes.data?.years).toBe(24);
    expect(leapRes.data?.daysUntilNextBirthday).toBe(0);
  });

  it('empty / missing field case: missing date of birth', () => {
    const res = calculateAge('');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Please enter a valid date of birth.');
  });

  it('invalid date case: non-existent date string', () => {
    const res = calculateAge('invalid-date-string');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Please enter a valid date of birth.');
  });

  it('future date boundary: birthdate after target date', () => {
    const res = calculateAge('2030-01-01', '2025-01-01');
    expect(res.success).toBe(false);
    expect(res.error).toBe('Date of birth cannot be in the future relative to target date.');
  });
});

describe('2. BMI Calculator Test Matrix (Metric, Imperial & Bounds)', () => {
  it('normal metric case: 70kg, 175cm', () => {
    const res = calculateBmi({ isMetric: true, weightKg: 70, heightCm: 175 });
    expect(res.success).toBe(true);
    expect(res.data?.bmi).toBe(22.9);
    expect(res.data?.category).toBe('Normal weight');
  });

  it('normal imperial case: 160lbs, 5ft 10in', () => {
    const res = calculateBmi({ isMetric: false, weightLbs: 160, heightFeet: 5, heightInches: 10 });
    expect(res.success).toBe(true);
    expect(res.data?.bmi).toBe(23.0);
  });

  it('zero weight boundary case', () => {
    const res = calculateBmi({ isMetric: true, weightKg: 0, heightCm: 175 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Please enter a valid weight');
  });

  it('negative height boundary case', () => {
    const res = calculateBmi({ isMetric: true, weightKg: 70, heightCm: -175 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Please enter a valid height');
  });

  it('very large number boundary case: 500kg weight', () => {
    const res = calculateBmi({ isMetric: true, weightKg: 500, heightCm: 180 });
    expect(res.success).toBe(true);
    expect(res.data?.bmi).toBe(154.3);
    expect(res.data?.category).toBe('Obesity');
  });
});

describe('3. Percentage Calculator Test Matrix (6 Modes & Division Safeguards)', () => {
  it('mode 1: X% of Y with decimals', () => {
    const res = calculatePercentage({ mode: 'x_pct_of_y', valX: 12.5, valY: 250.75 });
    expect(res.success).toBe(true);
    expect(res.data?.value).toBe(31.34);
  });

  it('mode 2: X as % of Y division by zero check', () => {
    const res = calculatePercentage({ mode: 'x_is_what_pct_of_y', valX: 50, valY: 0 });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Target value (Y) cannot be zero.');
  });

  it('mode 3: percentage increase from 100 to 150', () => {
    const res = calculatePercentage({ mode: 'pct_increase', valX: 100, valY: 150 });
    expect(res.success).toBe(true);
    expect(res.data?.value).toBe(50);
  });

  it('mode 4: percentage decrease from 200 to 150', () => {
    const res = calculatePercentage({ mode: 'pct_decrease', valX: 200, valY: 150 });
    expect(res.success).toBe(true);
    expect(res.data?.value).toBe(25);
  });

  it('mode 5: percentage difference', () => {
    const res = calculatePercentage({ mode: 'pct_difference', valX: 100, valY: 150 });
    expect(res.success).toBe(true);
    expect(res.data?.value).toBe(40);
  });

  it('mode 6: reverse percentage (X is Y% of what?)', () => {
    const res = calculatePercentage({ mode: 'reverse_pct', valX: 30, valY: 20 });
    expect(res.success).toBe(true);
    expect(res.data?.value).toBe(150);
  });
});

describe('4. GPA Calculator Test Matrix (Standard 4.0 & Custom Scale)', () => {
  it('standard 4.0 scale calculation', () => {
    const courses = [
      { id: '1', name: 'Math', creditHours: 3, grade: 'A' },
      { id: '2', name: 'English', creditHours: 4, grade: 'B' },
    ];
    const res = calculateGpa({ courses });
    expect(res.success).toBe(true);
    expect(res.data?.gpa).toBe(3.43);
  });

  it('custom scale calculation (5.0 max scale)', () => {
    const courses = [
      { id: '1', name: 'Art', creditHours: 3, grade: 'Distinction' },
    ];
    const customScaleItems = [{ letter: 'Distinction', points: 5.0 }];
    const res = calculateGpa({ courses, useCustomScale: true, maxScale: 5.0, customScaleItems });
    expect(res.success).toBe(true);
    expect(res.data?.gpa).toBe(5.0);
  });

  it('zero credit hours boundary error', () => {
    const courses = [{ id: '1', name: 'Test', creditHours: 0, grade: 'A' }];
    const res = calculateGpa({ courses });
    expect(res.success).toBe(false);
    expect(res.error).toContain('Must be > 0');
  });

  it('empty courses array missing field case', () => {
    const res = calculateGpa({ courses: [] });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Please add at least one course to calculate GPA.');
  });
});

describe('5. Discount Calculator Test Matrix (Stacked, Tax, Tip & Invalid Negative Bounds)', () => {
  it('stacked sequential discounts vs combined discounts', () => {
    const seq = calculateDiscount({ originalPrice: 100, discountPercentage: 20, stackedDiscounts: [10], isSequential: true });
    expect(seq.data?.finalPrice).toBe(72);

    const comb = calculateDiscount({ originalPrice: 100, discountPercentage: 20, stackedDiscounts: [10], isSequential: false });
    expect(comb.data?.finalPrice).toBe(70);
  });

  it('zero price boundary case', () => {
    const res = calculateDiscount({ originalPrice: 0, discountPercentage: 20 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('greater than zero');
  });

  it('negative original price boundary case', () => {
    const res = calculateDiscount({ originalPrice: -50, discountPercentage: 20 });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Please enter a valid original price greater than zero.');
  });

  it('negative discount percentage boundary case', () => {
    const res = calculateDiscount({ originalPrice: 100, discountPercentage: -15 });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Discount percentage must be between 0% and 100%.');
  });

  it('discount percentage > 100 boundary case', () => {
    const res = calculateDiscount({ originalPrice: 100, discountPercentage: 150 });
    expect(res.success).toBe(false);
    expect(res.error).toContain('between 0% and 100%');
  });
});

describe('6. Loan Calculator Test Matrix (Amortization & Frequencies)', () => {
  it('normal monthly payment calculation', () => {
    const res = calculateLoan({ loanAmount: 250000, annualInterestRate: 6.5, termYears: 30, paymentFrequency: 'monthly' });
    expect(res.success).toBe(true);
    expect(res.data?.paymentAmount).toBe(1580.17);
    expect(res.data?.schedule.length).toBe(360);
    expect(res.data?.schedule[359].remainingBalance).toBe(0);
  });

  it('zero interest rate loan boundary case', () => {
    const res = calculateLoan({ loanAmount: 12000, annualInterestRate: 0, termYears: 1, paymentFrequency: 'monthly' });
    expect(res.success).toBe(true);
    expect(res.data?.paymentAmount).toBe(1000);
    expect(res.data?.totalInterest).toBe(0);
  });

  it('quarterly payment frequency', () => {
    const res = calculateLoan({ loanAmount: 10000, annualInterestRate: 5, termYears: 2, paymentFrequency: 'quarterly' });
    expect(res.success).toBe(true);
    expect(res.data?.totalPaymentsCount).toBe(8);
  });

  it('very large loan amount ($100,000,000 boundary case)', () => {
    const res = calculateLoan({ loanAmount: 100000000, annualInterestRate: 5, termYears: 30, paymentFrequency: 'monthly' });
    expect(res.success).toBe(true);
    expect(res.data?.paymentAmount).toBe(536821.62);
  });
});

describe('7. Date Calculator Test Matrix (Add/Subtract, Difference, Business Days & Leap Years)', () => {
  it('add days normal case', () => {
    const res = calculateDate({ mode: 'add_subtract', startDateStr: '2026-01-15', daysAmount: 45, operation: 'add' });
    expect(res.success).toBe(true);
    expect(res.data?.resultDateStr).toBe('2026-03-01');
  });

  it('handles leap year Feb 29 transition correctly (Section 3.7 requirement)', () => {
    // 2024 is a leap year: 2024-02-28 + 1 day = 2024-02-29
    const leapRes = calculateDate({ mode: 'add_subtract', startDateStr: '2024-02-28', daysAmount: 1, operation: 'add' });
    expect(leapRes.success).toBe(true);
    expect(leapRes.data?.resultDateStr).toBe('2024-02-29');

    // 2023 is non-leap: 2023-02-28 + 1 day = 2023-03-01
    const nonLeapRes = calculateDate({ mode: 'add_subtract', startDateStr: '2023-02-28', daysAmount: 1, operation: 'add' });
    expect(nonLeapRes.success).toBe(true);
    expect(nonLeapRes.data?.resultDateStr).toBe('2023-03-01');
  });

  it('business days count (Mon-Fri)', () => {
    const res = calculateDate({ mode: 'business_days', startDateStr: '2026-01-05', endDateStr: '2026-01-09' });
    expect(res.success).toBe(true);
    expect(res.data?.businessDaysCount).toBe(5);
  });

  it('invalid date input case', () => {
    const res = calculateDate({ mode: 'add_subtract', startDateStr: 'not-a-date' });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Please enter a valid start date.');
  });
});
