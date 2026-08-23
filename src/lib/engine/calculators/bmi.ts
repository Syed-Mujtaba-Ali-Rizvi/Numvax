import { roundHalfUp, safeDiv } from '../math';
import { BmiResult, CalculationResult } from '../types';

export interface BmiInput {
  isMetric: boolean;
  weightKg?: number;
  heightCm?: number;
  weightLbs?: number;
  heightFeet?: number;
  heightInches?: number;
}

/**
 * Calculates BMI, healthy weight range, category, and plain language interpretation.
 */
export function calculateBmi(input: BmiInput): CalculationResult<BmiResult> {
  const { isMetric, weightKg, heightCm, weightLbs, heightFeet = 0, heightInches = 0 } = input;

  let weightInKg = 0;
  let heightInMeters = 0;

  if (isMetric) {
    if (!weightKg || weightKg <= 0) {
      return { success: false, error: 'Please enter a valid weight in kilograms.' };
    }
    if (!heightCm || heightCm <= 0) {
      return { success: false, error: 'Please enter a valid height in centimeters.' };
    }
    weightInKg = weightKg;
    heightInMeters = heightCm / 100;
  } else {
    if (!weightLbs || weightLbs <= 0) {
      return { success: false, error: 'Please enter a valid weight in pounds.' };
    }
    const totalInches = heightFeet * 12 + heightInches;
    if (totalInches <= 0) {
      return { success: false, error: 'Please enter a valid height in feet and inches.' };
    }
    // imperial to metric conversion
    weightInKg = weightLbs * 0.45359237;
    heightInMeters = totalInches * 0.0254;
  }

  const rawBmi = safeDiv(weightInKg, heightInMeters * heightInMeters, 0);
  if (rawBmi <= 0) {
    return { success: false, error: 'Calculated BMI is out of realistic bounds.' };
  }

  const bmi = roundHalfUp(rawBmi, 1);

  let category: BmiResult['category'] = 'Normal weight';
  let interpretation = '';

  if (bmi < 18.5) {
    category = 'Underweight';
    interpretation =
      'Your BMI falls in the underweight range. Consider consulting a healthcare professional regarding balanced nutrition.';
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    category = 'Normal weight';
    interpretation =
      'Your BMI falls within the healthy weight range for adults. Maintain a balanced lifestyle and active routine.';
  } else if (bmi >= 25 && bmi <= 29.9) {
    category = 'Overweight';
    interpretation =
      'Your BMI falls in the overweight range. Adopting regular physical activity and healthy eating can support wellness.';
  } else {
    category = 'Obesity';
    interpretation =
      'Your BMI falls in the obesity category. A healthcare provider can provide guidance tailored to your health goals.';
  }

  // Healthy weight range (BMI 18.5 - 24.9)
  const minHealthyKg = roundHalfUp(18.5 * heightInMeters * heightInMeters, 1);
  const maxHealthyKg = roundHalfUp(24.9 * heightInMeters * heightInMeters, 1);

  let healthyWeightRangeStr = '';
  let healthyWeightMin = minHealthyKg;
  let healthyWeightMax = maxHealthyKg;

  if (isMetric) {
    healthyWeightRangeStr = `${minHealthyKg} kg - ${maxHealthyKg} kg`;
  } else {
    const minHealthyLbs = roundHalfUp(minHealthyKg / 0.45359237, 1);
    const maxHealthyLbs = roundHalfUp(maxHealthyKg / 0.45359237, 1);
    healthyWeightMin = minHealthyLbs;
    healthyWeightMax = maxHealthyLbs;
    healthyWeightRangeStr = `${minHealthyLbs} lbs - ${maxHealthyLbs} lbs`;
  }

  const formulaDescription = isMetric
    ? `BMI = weight (kg) / [height (m)]² = ${weightInKg} / (${heightInMeters.toFixed(2)})² = ${bmi}`
    : `BMI = 703 × weight (lbs) / [height (in)]² = 703 × ${weightLbs} / (${(heightFeet * 12 + heightInches)})² = ${bmi}`;

  return {
    success: true,
    data: {
      bmi,
      category,
      healthyWeightMin,
      healthyWeightMax,
      healthyWeightRangeStr,
      formulaDescription,
      interpretation,
      isMetric,
    },
    summary: `BMI: ${bmi} (${category})`,
  };
}
