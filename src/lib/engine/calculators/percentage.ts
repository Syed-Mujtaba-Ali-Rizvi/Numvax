import { roundHalfUp, safeDiv, formatPercent, formatNumber } from '../math';
import { CalculationResult, PercentageMode, PercentageResult } from '../types';

export interface PercentageInput {
  mode: PercentageMode;
  valX?: number;
  valY?: number;
}

/**
 * Multi-mode Percentage Calculator engine with live worked examples.
 */
export function calculatePercentage(input: PercentageInput): CalculationResult<PercentageResult> {
  const { mode, valX, valY } = input;

  if (valX === undefined || valY === undefined || isNaN(valX) || isNaN(valY)) {
    return { success: false, error: 'Please enter valid numerical inputs.' };
  }

  let resultValue = 0;
  let formattedValue = '';
  let workedExample = '';
  let formulaStr = '';

  switch (mode) {
    case 'x_pct_of_y': {
      // What is X% of Y?
      resultValue = roundHalfUp((valX / 100) * valY, 2);
      formattedValue = formatNumber(resultValue, 0, 2);
      formulaStr = `Result = (${valX} / 100) × ${valY}`;
      workedExample = `To find ${valX}% of ${valY}:\n1. Convert percentage to decimal: ${valX} ÷ 100 = ${valX / 100}\n2. Multiply by ${valY}: ${(valX / 100)} × ${valY} = ${resultValue}`;
      break;
    }

    case 'x_is_what_pct_of_y': {
      // X is what % of Y?
      if (valY === 0) {
        return { success: false, error: 'Target value (Y) cannot be zero.' };
      }
      resultValue = roundHalfUp(safeDiv(valX, valY) * 100, 2);
      formattedValue = formatPercent(resultValue, 2);
      formulaStr = `Result = (${valX} / ${valY}) × 100%`;
      workedExample = `${valX} as a percentage of ${valY}:\n1. Divide ${valX} by ${valY}: ${safeDiv(valX, valY).toFixed(4)}\n2. Multiply by 100 to get percentage: ${resultValue}%`;
      break;
    }

    case 'pct_increase': {
      // Percentage increase from X to Y
      if (valX === 0) {
        return { success: false, error: 'Original value (X) cannot be zero.' };
      }
      const diff = valY - valX;
      resultValue = roundHalfUp(safeDiv(diff, valX) * 100, 2);
      formattedValue = formatPercent(resultValue, 2);
      formulaStr = `Increase % = ((${valY} - ${valX}) / ${valX}) × 100%`;
      workedExample = `Percentage increase from ${valX} to ${valY}:\n1. Find difference: ${valY} - ${valX} = ${diff}\n2. Divide by original (${valX}): ${safeDiv(diff, valX).toFixed(4)}\n3. Convert to %: ${resultValue}%`;
      break;
    }

    case 'pct_decrease': {
      // Percentage decrease from X to Y
      if (valX === 0) {
        return { success: false, error: 'Original value (X) cannot be zero.' };
      }
      const diff = valX - valY;
      resultValue = roundHalfUp(safeDiv(diff, valX) * 100, 2);
      formattedValue = formatPercent(resultValue, 2);
      formulaStr = `Decrease % = ((${valX} - ${valY}) / ${valX}) × 100%`;
      workedExample = `Percentage decrease from ${valX} to ${valY}:\n1. Find reduction: ${valX} - ${valY} = ${diff}\n2. Divide by original (${valX}): ${safeDiv(diff, valX).toFixed(4)}\n3. Convert to %: ${resultValue}%`;
      break;
    }

    case 'pct_difference': {
      // Percentage difference between X and Y
      const absDiff = Math.abs(valX - valY);
      const avg = (valX + valY) / 2;
      if (avg === 0) {
        return { success: false, error: 'Average of inputs cannot be zero.' };
      }
      resultValue = roundHalfUp(safeDiv(absDiff, avg) * 100, 2);
      formattedValue = formatPercent(resultValue, 2);
      formulaStr = `Difference % = (|${valX} - ${valY}| / ((${valX} + ${valY}) / 2)) × 100%`;
      workedExample = `Percentage difference between ${valX} and ${valY}:\n1. Absolute difference: |${valX} - ${valY}| = ${absDiff}\n2. Average of numbers: (${valX} + ${valY}) / 2 = ${avg}\n3. Divide & multiply by 100: ${resultValue}%`;
      break;
    }

    case 'reverse_pct': {
      // X is Y% of what number? (Reverse percentage)
      if (valY === 0) {
        return { success: false, error: 'Percentage (Y) cannot be zero.' };
      }
      resultValue = roundHalfUp(safeDiv(valX, valY / 100), 2);
      formattedValue = formatNumber(resultValue, 0, 2);
      formulaStr = `Original Value = ${valX} / (${valY} / 100)`;
      workedExample = `If ${valX} is ${valY}% of a number:\n1. Convert percentage to decimal: ${valY} / 100 = ${valY / 100}\n2. Divide ${valX} by decimal: ${valX} ÷ ${valY / 100} = ${resultValue}`;
      break;
    }

    default:
      return { success: false, error: 'Invalid calculation mode specified.' };
  }

  return {
    success: true,
    data: {
      mode,
      value: resultValue,
      formattedValue,
      workedExample,
      formulaStr,
    },
    summary: `Result: ${formattedValue}`,
  };
}
