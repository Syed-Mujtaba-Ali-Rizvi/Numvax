import { roundHalfUp } from '../math';
import { CalculationResult, DateMode, DateResult } from '../types';

export interface DateInput {
  mode: DateMode;
  startDateStr?: string;
  endDateStr?: string;
  daysAmount?: number;
  monthsAmount?: number;
  yearsAmount?: number;
  operation?: 'add' | 'subtract';
}

/**
 * Multi-mode Date Calculator supporting add/subtract, exact difference, and business days count.
 */
export function calculateDate(input: DateInput): CalculationResult<DateResult> {
  const {
    mode,
    startDateStr,
    endDateStr,
    daysAmount = 0,
    monthsAmount = 0,
    yearsAmount = 0,
    operation = 'add',
  } = input;

  if (!startDateStr) {
    return { success: false, error: 'Please enter a valid start date.' };
  }

  const startDate = new Date(startDateStr);
  if (isNaN(startDate.getTime())) {
    return { success: false, error: 'Please enter a valid start date.' };
  }

  if (mode === 'add_subtract') {
    const resultDate = new Date(startDate);
    const sign = operation === 'add' ? 1 : -1;

    resultDate.setFullYear(resultDate.getFullYear() + sign * yearsAmount);
    resultDate.setMonth(resultDate.getMonth() + sign * monthsAmount);
    resultDate.setDate(resultDate.getDate() + sign * daysAmount);

    const dateStr = resultDate.toISOString().split('T')[0];
    const opText = operation === 'add' ? 'Added' : 'Subtracted';

    return {
      success: true,
      data: {
        mode,
        resultDateStr: dateStr,
        breakdownStr: `${opText} ${yearsAmount} years, ${monthsAmount} months, ${daysAmount} days: ${dateStr}`,
      },
      summary: `Result Date: ${dateStr}`,
    };
  }

  if (mode === 'difference' || mode === 'business_days') {
    if (!endDateStr) {
      return { success: false, error: 'Please enter a valid end date.' };
    }

    const endDate = new Date(endDateStr);
    if (isNaN(endDate.getTime())) {
      return { success: false, error: 'Please enter a valid end date.' };
    }

    const startMs = startDate.getTime();
    const endMs = endDate.getTime();
    const diffMs = Math.abs(endMs - startMs);

    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = roundHalfUp(totalDays / 7, 1);

    if (mode === 'difference') {
      let d1 = startDate < endDate ? new Date(startDate) : new Date(endDate);
      const d2 = startDate < endDate ? new Date(endDate) : new Date(startDate);

      let years = d2.getFullYear() - d1.getFullYear();
      let months = d2.getMonth() - d1.getMonth();
      let days = d2.getDate() - d1.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
        days += prevMonth.getDate();
      }

      if (months < 0) {
        years -= 1;
        months += 12;
      }

      return {
        success: true,
        data: {
          mode,
          daysDifference: totalDays,
          weeksDifference: totalWeeks,
          monthsDifference: years * 12 + months,
          yearsDifference: years,
          breakdownStr: `${years} years, ${months} months, ${days} days (${totalDays} total days)`,
        },
        summary: `Difference: ${totalDays} days (${years}y ${months}m ${days}d)`,
      };
    }

    if (mode === 'business_days') {
      // Mon-Fri count
      let current = new Date(startDate < endDate ? startDate : endDate);
      const target = new Date(startDate < endDate ? endDate : startDate);
      let count = 0;

      while (current <= target) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }

      return {
        success: true,
        data: {
          mode,
          businessDaysCount: count,
          daysDifference: totalDays,
          breakdownStr: `${count} business days (Mon-Fri) between dates`,
        },
        summary: `Business Days: ${count} days`,
      };
    }
  }

  return { success: false, error: 'Invalid date calculation mode.' };
}
