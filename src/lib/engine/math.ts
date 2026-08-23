/**
 * Numvax Core Math Engine & Accuracy Layer
 * Standardizes decimal-safe operations, round-half-up rounding,
 * currency math, percentage operations, and error-safe parsing.
 */

/**
 * Standard round-half-up implementation.
 * Rounds to specified decimal places without JS float precision artifacts.
 */
export function roundHalfUp(num: number, decimals: number = 2): number {
  if (!isFinite(num) || isNaN(num)) return 0;
  const factor = Math.pow(10, decimals);
  const sign = num < 0 ? -1 : 1;
  const absNum = Math.abs(num);
  return (sign * Math.round(absNum * factor + Number.EPSILON * factor)) / factor;
}

/**
 * Decimal-safe currency calculation in integer cents.
 */
export function toCents(amount: number): number {
  if (!isFinite(amount) || isNaN(amount)) return 0;
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return roundHalfUp(cents / 100, 2);
}

/**
 * Safely format money amounts as localized string.
 */
export function formatCurrency(amount: number, symbol: string = '$'): string {
  const rounded = roundHalfUp(amount, 2);
  const formatted = rounded.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

/**
 * Safely format numbers with configurable decimal bounds.
 */
export function formatNumber(
  val: number,
  minDecimals: number = 0,
  maxDecimals: number = 2
): string {
  if (!isFinite(val) || isNaN(val)) return '0';
  const rounded = roundHalfUp(val, maxDecimals);
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * Safely format percentages.
 */
export function formatPercent(val: number, decimals: number = 2): string {
  const rounded = roundHalfUp(val, decimals);
  return `${rounded}%`;
}

/**
 * Division with zero check and safe fallback.
 */
export function safeDiv(numerator: number, denominator: number, fallback: number = 0): number {
  if (denominator === 0 || !isFinite(denominator) || isNaN(denominator)) {
    return fallback;
  }
  const res = numerator / denominator;
  return isFinite(res) && !isNaN(res) ? res : fallback;
}

/**
 * Robust string/numeric input parser.
 */
export function parseInputNumber(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined || input === '') return null;
  if (typeof input === 'number') {
    return isFinite(input) && !isNaN(input) ? input : null;
  }
  const cleaned = input.toString().replace(/,/g, '').trim();
  if (cleaned === '') return null;
  const parsed = Number(cleaned);
  return isFinite(parsed) && !isNaN(parsed) ? parsed : null;
}
