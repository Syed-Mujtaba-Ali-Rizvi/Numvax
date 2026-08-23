import { roundHalfUp, toCents, fromCents } from '../math';
import { CalculationResult, DiscountResult } from '../types';

export interface DiscountInput {
  originalPrice: number;
  discountPercentage: number;
  stackedDiscounts?: number[]; // Additional discounts e.g. [10, 5]
  isSequential?: boolean;     // true = sequential, false = combined
  taxPercentage?: number;
  tipPercentage?: number;
}

/**
 * Discount Calculator engine supporting stacked/sequential discounts, post-discount tax, and tip.
 */
export function calculateDiscount(input: DiscountInput): CalculationResult<DiscountResult> {
  const {
    originalPrice,
    discountPercentage,
    stackedDiscounts = [],
    isSequential = true,
    taxPercentage = 0,
    tipPercentage = 0,
  } = input;

  if (isNaN(originalPrice) || originalPrice <= 0) {
    return { success: false, error: 'Please enter a valid original price greater than zero.' };
  }

  if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
    return { success: false, error: 'Discount percentage must be between 0% and 100%.' };
  }

  const allDiscounts = [discountPercentage, ...stackedDiscounts.filter((d) => !isNaN(d) && d > 0)];

  let currentPriceCents = toCents(originalPrice);
  const initialCents = currentPriceCents;

  if (isSequential) {
    // Sequential discounts (each discount applied to remaining balance)
    for (const dPct of allDiscounts) {
      const discFactor = (100 - dPct) / 100;
      currentPriceCents = Math.round(currentPriceCents * discFactor);
    }
  } else {
    // Combined discount (percentages added together up to 100%)
    const sumPct = Math.min(100, allDiscounts.reduce((acc, v) => acc + v, 0));
    const discFactor = (100 - sumPct) / 100;
    currentPriceCents = Math.round(initialCents * discFactor);
  }

  const discountedPriceCents = currentPriceCents;
  const totalSavedCents = Math.max(0, initialCents - discountedPriceCents);
  const discountAmount = fromCents(totalSavedCents);

  // Post-discount tax
  let taxCents = 0;
  if (taxPercentage > 0) {
    taxCents = Math.round(discountedPriceCents * (taxPercentage / 100));
  }

  // Tip (calculated on discounted price before tax)
  let tipCents = 0;
  if (tipPercentage > 0) {
    tipCents = Math.round(discountedPriceCents * (tipPercentage / 100));
  }

  const finalPriceCents = discountedPriceCents + taxCents + tipCents;
  const finalPrice = fromCents(finalPriceCents);

  return {
    success: true,
    data: {
      originalPrice,
      discountPercentage,
      stackedDiscounts: allDiscounts,
      isSequential,
      taxPercentage,
      taxAmount: fromCents(taxCents),
      tipPercentage,
      tipAmount: fromCents(tipCents),
      discountAmount,
      finalPrice,
      totalSaved: discountAmount,
    },
    summary: `Final Price: $${finalPrice.toFixed(2)} (Saved $${discountAmount.toFixed(2)})`,
  };
}
