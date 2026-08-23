import { roundHalfUp, safeDiv } from '../math';
import { CalculationResult, CustomGpaScaleItem, GpaCourse, GpaResult } from '../types';

export const STANDARD_4_0_SCALE: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'D-': 0.7,
  'F': 0.0,
};

export interface GpaInput {
  courses: GpaCourse[];
  useCustomScale?: boolean;
  maxScale?: number;
  customScaleItems?: CustomGpaScaleItem[];
}

/**
 * GPA Calculator engine supporting standard 4.0 scale and fully customizable grading scales.
 */
export function calculateGpa(input: GpaInput): CalculationResult<GpaResult> {
  const { courses, useCustomScale = false, maxScale = 4.0, customScaleItems = [] } = input;

  if (!courses || courses.length === 0) {
    return { success: false, error: 'Please add at least one course to calculate GPA.' };
  }

  // Build point lookup table
  const pointLookup: Record<string, number> = {};
  if (useCustomScale && customScaleItems.length > 0) {
    customScaleItems.forEach((item) => {
      pointLookup[item.letter.toUpperCase().trim()] = item.points;
    });
  } else {
    Object.entries(STANDARD_4_0_SCALE).forEach(([k, v]) => {
      pointLookup[k] = v;
    });
  }

  let totalCreditHours = 0;
  let totalGradePoints = 0;
  const courseBreakdown: GpaResult['courseBreakdown'] = [];

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    const credits = Number(c.creditHours);
    if (isNaN(credits) || credits <= 0) {
      return {
        success: false,
        error: `Invalid credit hours for course "${c.name || 'Course ' + (i + 1)}". Must be > 0.`,
      };
    }

    const gradeKey = c.grade.toUpperCase().trim();
    let pointsPerCredit = pointLookup[gradeKey];

    // Fallback: If numerical grade entered directly
    if (pointsPerCredit === undefined) {
      const numGrade = Number(gradeKey);
      if (!isNaN(numGrade) && numGrade >= 0) {
        pointsPerCredit = numGrade;
      } else {
        return {
          success: false,
          error: `Unrecognized grade "${c.grade}" for course "${c.name || 'Course ' + (i + 1)}".`,
        };
      }
    }

    const coursePoints = credits * pointsPerCredit;
    totalCreditHours += credits;
    totalGradePoints += coursePoints;

    courseBreakdown.push({
      name: c.name || `Course ${i + 1}`,
      credits,
      grade: c.grade,
      pointsPerCredit,
      totalPoints: roundHalfUp(coursePoints, 2),
    });
  }

  if (totalCreditHours <= 0) {
    return { success: false, error: 'Total credit hours must be greater than zero.' };
  }

  const rawGpa = safeDiv(totalGradePoints, totalCreditHours, 0);
  const finalGpa = roundHalfUp(rawGpa, 2);
  const scaleLimit = useCustomScale ? maxScale : 4.0;

  return {
    success: true,
    data: {
      totalCreditHours: roundHalfUp(totalCreditHours, 1),
      totalGradePoints: roundHalfUp(totalGradePoints, 2),
      gpa: finalGpa,
      maxScale: scaleLimit,
      courseBreakdown,
    },
    summary: `GPA: ${finalGpa.toFixed(2)} / ${scaleLimit.toFixed(1)} (${totalCreditHours} Total Credits)`,
  };
}
