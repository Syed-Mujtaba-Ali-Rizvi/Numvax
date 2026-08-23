import { roundHalfUp } from '../math';
import { AgeResult, CalculationResult } from '../types';

/**
 * Calculates Zodiac sign based on month and day of birth.
 */
export function getZodiacSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries ♈';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus ♉';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini ♊';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer ♋';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo ♌';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo ♍';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra ♎';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio ♏';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius ♐';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn ♑';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius ♒';
  return 'Pisces ♓';
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Calculates exact age in Years, Months, Days, Total Months, Total Weeks, Total Days, Next Birthday.
 * Accurately handles leap years, Feb 29 birthdays, and variable month lengths.
 */
export function calculateAge(dobStr: string, targetDateStr?: string): CalculationResult<AgeResult> {
  if (!dobStr) {
    return { success: false, error: 'Please enter a valid date of birth.' };
  }

  const birthDate = new Date(dobStr);
  if (isNaN(birthDate.getTime())) {
    return { success: false, error: 'Please enter a valid date of birth.' };
  }

  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
  if (isNaN(targetDate.getTime())) {
    return { success: false, error: 'Please enter a valid target date.' };
  }

  // Clear time component for pure date calculation
  const bYear = birthDate.getFullYear();
  const bMonth = birthDate.getMonth();
  const bDay = birthDate.getDate();

  const tYear = targetDate.getFullYear();
  const tMonth = targetDate.getMonth();
  const tDay = targetDate.getDate();

  if (targetDate < birthDate) {
    return { success: false, error: 'Date of birth cannot be in the future relative to target date.' };
  }

  let years = tYear - bYear;
  let months = tMonth - bMonth;
  let days = tDay - bDay;

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(tYear, tMonth, 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // Total days difference
  const diffTime = targetDate.getTime() - birthDate.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = roundHalfUp(totalDays / 7, 1);
  const totalMonths = years * 12 + months;

  // Day of week born
  const dayOfWeekBorn = DAYS_OF_WEEK[birthDate.getDay()];

  // Next Birthday Calculation
  let daysUntilNextBirthday = 0;
  let nextBdayStr = '';

  const isTodayBirthday = bMonth === tMonth && bDay === tDay;

  if (isTodayBirthday) {
    daysUntilNextBirthday = 0;
    nextBdayStr = targetDate.toISOString().split('T')[0];
  } else {
    let nextBdayYear = tYear;
    let nextBday = new Date(nextBdayYear, bMonth, bDay);

    if (bMonth === 1 && bDay === 29) {
      const isLeapYear = (nextBdayYear % 4 === 0 && nextBdayYear % 100 !== 0) || nextBdayYear % 400 === 0;
      if (!isLeapYear) {
        nextBday = new Date(nextBdayYear, 1, 28);
      }
    }

    if (nextBday < targetDate) {
      nextBdayYear += 1;
      nextBday = new Date(nextBdayYear, bMonth, bDay);
      if (bMonth === 1 && bDay === 29) {
        const isLeapYear = (nextBdayYear % 4 === 0 && nextBdayYear % 100 !== 0) || nextBdayYear % 400 === 0;
        if (!isLeapYear) {
          nextBday = new Date(nextBdayYear, 1, 28);
        }
      }
    }

    const nextBdayTimeDiff = nextBday.getTime() - targetDate.getTime();
    daysUntilNextBirthday = Math.ceil(nextBdayTimeDiff / (1000 * 60 * 60 * 24));
    nextBdayStr = nextBday.toISOString().split('T')[0];
  }

  const zodiacSign = getZodiacSign(bMonth + 1, bDay);

  return {
    success: true,
    data: {
      years,
      months,
      days,
      totalMonths,
      totalWeeks,
      totalDays,
      dayOfWeekBorn,
      nextBirthdayDate: nextBdayStr,
      daysUntilNextBirthday,
      zodiacSign,
    },
    summary: `${years} years, ${months} months, ${days} days old`,
  };
}
