import { FAQItem } from '../components/calculator/CalculatorFAQ';
import { RelatedTool } from '../components/calculator/CalculatorRelatedTools';

export interface CalculatorPageData {
  slug: string;
  name: string;
  h1Title: string;
  metaTitle: string;
  metaDescription: string;
  categoryName: string;
  categorySlug: string;
  shortDescription: string;
  explanation: string;
  directAnswer?: string;
  formulaTitle: string;
  formulaDescription: string;
  workedExamples: Array<{ title: string; example: string }>;
  useCases?: string;
  faqs: FAQItem[];
  relatedTools: RelatedTool[];
  keywords?: string[];
}

export type CalculatorItem = CalculatorPageData;

export const CALCULATOR_CATALOG: Record<string, CalculatorPageData> = {
  'bmi-calculator': {
    slug: 'bmi-calculator',
    name: 'BMI Calculator',
    h1Title: 'BMI Calculator - Body Mass Index & Healthy Weight Range',
    metaTitle: 'BMI Calculator - Calculate Body Mass Index Online | Numvax',
    metaDescription: 'Free online BMI calculator. Calculate your Body Mass Index (BMI), weight category, and healthy weight range for adults in metric or imperial units.',
    categoryName: 'Health',
    categorySlug: 'health',
    shortDescription: 'Calculate Body Mass Index (BMI), category, and healthy weight range for metric and imperial units.',
    directAnswer: 'Numvax BMI Calculator calculates Body Mass Index (BMI) in both Metric (kg, cm) and Imperial (lbs, feet-inches) units. It displays an interactive multi-zone gauge, health category classification (Underweight, Normal, Overweight, Obese), range indicators, and target healthy weight ranges.',
    explanation: 'Body Mass Index (BMI) is a standardized statistical measure comparing an individual weight to height to categorize body composition into Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), and Obese (≥30).',
    useCases: 'This BMI calculator can be used by fitness enthusiasts, healthcare advisors, athletes, and individuals to evaluate whether their weight falls within the medically recognized healthy range for their height, estimate target goal weights, and track long-term wellness progress.',
    formulaTitle: 'Standard World Health Organization (WHO) BMI Formulas',
    formulaDescription: 'Metric Formula:\nBMI = weight (kg) / [height (m)]²\n\nImperial Formula:\nBMI = [weight (lbs) / [height (in)]²] × 703',
    workedExamples: [
      {
        title: 'Metric Calculation (70 kg, 1.75 m)',
        example: 'Height in meters squared = 1.75 × 1.75 = 3.0625 m²\nBMI = 70 / 3.0625 = 22.86 (Normal weight)',
      },
      {
        title: 'Imperial Calculation (154 lbs, 5 ft 9 in = 69 in)',
        example: 'Height in inches squared = 69 × 69 = 4,761 in²\nBMI = (154 / 4,761) × 703 = 0.032346 × 703 = 22.74 (Normal weight)',
      },
    ],
    faqs: [
      {
        question: 'What is considered a healthy BMI for adults?',
        answer: 'According to the World Health Organization (WHO), a healthy adult BMI falls between 18.5 and 24.9. A score below 18.5 is categorized as underweight, 25.0 to 29.9 as overweight, and 30.0 or higher as obese.',
      },
      {
        question: 'Does BMI apply accurately to athletes and bodybuilders?',
        answer: 'BMI measures total body mass relative to height without distinguishing between lean muscle and fat tissue. High-performance athletes and weightlifters often score in the "overweight" or "obese" categories due to dense muscle mass despite having very low body fat percentages.',
      },
      {
        question: 'How do I convert my height in feet and inches into total inches for BMI?',
        answer: 'Multiply the number of feet by 12 and add the remaining inches. For example, 5 feet 9 inches equals (5 × 12) + 9 = 69 total inches.',
      },
      {
        question: 'What is the healthy weight range for my height?',
        answer: 'A healthy weight range corresponds to a BMI between 18.5 and 24.9. You can calculate your minimum healthy weight with: 18.5 × (height in meters)² and maximum healthy weight with: 24.9 × (height in meters)²',
      },
      {
        question: 'Is BMI calculated differently for men and women?',
        answer: 'The standard adult BMI formula is identical for men and women. However, women typically have higher body fat percentages than men at the same BMI score.',
      },
    ],
    relatedTools: [
      { slug: 'percentage-calculator', name: 'Percentage Calculator', categorySlug: 'math', description: 'Calculate percentage changes and ratios' },
      { slug: 'date-calculator', name: 'Date Calculator', categorySlug: 'math', description: 'Calculate days between dates and age milestones' },
      { slug: 'discount-calculator', name: 'Discount Calculator', categorySlug: 'financial', description: 'Calculate purchase discounts & savings' },
    ],
  },

  'percentage-calculator': {
    slug: 'percentage-calculator',
    name: 'Percentage Calculator',
    h1Title: 'Percentage Calculator - Calculate Percentages & Proportions',
    metaTitle: 'Free Percentage Calculator Online | Numvax',
    metaDescription: 'Calculate percentages, percentage increases, percentage decreases, and reverse percentage calculations instantly.',
    categoryName: 'Math',
    categorySlug: 'math',
    shortDescription: 'Calculate percentages, percentage increase/decrease, percentage difference, and reverse percentages.',
    directAnswer: 'Numvax Percentage Calculator solves 6 percentage modes live: what is X% of Y, X is what % of Y, percentage increase/decrease, percentage difference, and reverse percentage calculations with interactive visual progress rings.',
    explanation: 'A percentage represents a fraction or proportion out of 100. Percentage calculations allow easy comparison of financial growth, price discounts, tax rates, and statistical proportions.',
    useCases: 'This percentage calculator is widely used for business financial modeling, calculating sales tax and restaurant tips, measuring revenue growth, determining academic test score percentages, and calculating retail markdowns.',
    formulaTitle: 'Standard Percentage Formulas',
    formulaDescription: 'What is X% of Y?\nResult = (X / 100) × Y\n\nX is what % of Y?\nPercentage = (X / Y) × 100\n\nPercentage Change (from X to Y):\n% Change = [(Y - X) / X] × 100',
    workedExamples: [
      {
        title: 'Calculate 20% of $150',
        example: 'Step 1: Divide percentage by 100 → 20 / 100 = 0.20\nStep 2: Multiply by base value → 0.20 × 150 = $30.00',
      },
      {
        title: 'Calculate Percentage Increase ($50 to $65)',
        example: 'Step 1: Find difference → 65 - 50 = 15\nStep 2: Divide by original value → 15 / 50 = 0.30\nStep 3: Multiply by 100 → 0.30 × 100 = +30% increase',
      },
    ],
    faqs: [
      {
        question: 'How do I calculate a percentage increase between two numbers?',
        answer: 'Subtract the original value from the new value, divide that difference by the original value, and multiply the result by 100: [(New - Old) / Old] × 100.',
      },
      {
        question: 'How do I find what percentage one number is of another?',
        answer: 'Divide the part by the total whole and multiply by 100. For example, to find what percent 45 is of 180: (45 / 180) × 100 = 25%.',
      },
      {
        question: 'What is the formula to calculate a discount percentage on a purchase?',
        answer: 'Discount Amount = Original Price × (Discount % / 100). Subtract the discount amount from the original price to get the final sale price.',
      },
      {
        question: 'What is the difference between percentage change and percentage difference?',
        answer: 'Percentage change has a chronological direction (old value to new value). Percentage difference compares two independent numbers by dividing their absolute difference by their average.',
      },
      {
        question: 'How do I calculate reverse percentage (original price before tax)?',
        answer: 'To find the original price before a tax or markup rate was added, divide the total final price by (1 + Tax Rate / 100). For example, $108 with 8% tax: $108 / 1.08 = $100.',
      },
    ],
    relatedTools: [
      { slug: 'discount-calculator', name: 'Discount Calculator', categorySlug: 'financial', description: 'Calculate sale discounts & tax' },
      { slug: 'gpa-calculator', name: 'GPA Calculator', categorySlug: 'math', description: 'Calculate GPA and grade percentages' },
      { slug: 'loan-calculator', name: 'Loan Calculator', categorySlug: 'financial', description: 'Calculate mortgage & interest rates' },
    ],
  },

  'gpa-calculator': {
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    h1Title: 'GPA Calculator - High School & College Cumulative GPA',
    metaTitle: 'Free GPA Calculator Online - College & High School | Numvax',
    metaDescription: 'Calculate semester and cumulative Grade Point Average (GPA) on standard 4.0 or custom weighted scales.',
    categoryName: 'Math',
    categorySlug: 'math',
    shortDescription: 'Calculate semester and cumulative GPA with standard 4.0 or custom grading scales.',
    directAnswer: 'Numvax GPA Calculator calculates cumulative Grade Point Average on a 4.0 scale or custom user-defined scale. It features interactive course credit matrices and displays academic honors classifications (Summa Cum Laude, Magna Cum Laude, Cum Laude).',
    explanation: 'Grade Point Average (GPA) is a standardized numeric representation of academic achievement, calculated by dividing total grade points earned by total credit hours completed.',
    useCases: 'Use this GPA calculator to determine semester GPA, predict cumulative academic standing, check honors thresholds (Cum Laude, Magna Cum Laude), evaluate university admission eligibility, and track scholarship qualification requirements.',
    formulaTitle: 'Standard GPA Calculation Formula',
    formulaDescription: 'Grade Points per Course = Course Credit Hours × Letter Grade Point Value\n\nCumulative GPA = Total Grade Points Earned / Total Credit Hours Attempted',
    workedExamples: [
      {
        title: 'Sample 3-Course College Semester',
        example: 'Math 101 (3 Credits, Grade A = 4.0): 3 × 4.0 = 12.0 Points\nEnglish 201 (4 Credits, Grade B = 3.0): 4 × 3.0 = 12.0 Points\nPhysics (3 Credits, Grade A- = 3.7): 3 × 3.7 = 11.1 Points\n\nTotal Grade Points: 35.1 | Total Credits: 10\nGPA = 35.1 / 10 = 3.51 GPA',
      },
    ],
    faqs: [
      {
        question: 'What numeric points are assigned to letter grades on a 4.0 scale?',
        answer: 'Standard 4.0 Scale: A = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, F = 0.0.',
      },
      {
        question: 'What is the difference between weighted and unweighted GPA?',
        answer: 'Unweighted GPA treats all courses equally on a 4.0 scale regardless of rigor. Weighted GPA awards extra points (typically up to 5.0) for Advanced Placement (AP), International Baccalaureate (IB), or Honors courses.',
      },
      {
        question: 'How do course credit hours affect GPA calculations?',
        answer: 'Credit hours act as mathematical multipliers. A 4-credit course has twice the impact on your final GPA compared to a 2-credit course because it accounts for more total grade points.',
      },
      {
        question: 'How do I raise my cumulative GPA in future semesters?',
        answer: 'To raise your cumulative GPA, aim for grades significantly higher than your current average in high-credit courses. You can calculate required target grades by projecting: (Current Points + Future Points) / (Current Credits + Future Credits).',
      },
      {
        question: 'Do Pass/Fail courses count towards GPA?',
        answer: 'At most universities, Pass/Fail or credit/no-credit courses do not contribute numeric grade points and are excluded from the GPA divisor, meaning they do not raise or lower your GPA.',
      },
    ],
    relatedTools: [
      { slug: 'percentage-calculator', name: 'Percentage Calculator', categorySlug: 'math', description: 'Calculate course test percentages' },
      { slug: 'date-calculator', name: 'Date Calculator', categorySlug: 'math', description: 'Calculate semester duration and deadlines' },
    ],
  },

  'discount-calculator': {
    slug: 'discount-calculator',
    name: 'Discount Calculator',
    h1Title: 'Discount Calculator - Calculate Sale Price, Savings & Tax',
    metaTitle: 'Free Discount Calculator - Sale Price & Tax | Numvax',
    metaDescription: 'Calculate final price, total savings, stacked discounts, sales tax, and optional tips.',
    categoryName: 'Financial',
    categorySlug: 'financial',
    shortDescription: 'Calculate final prices after single or stacked percentage discounts, sales tax, and tips.',
    directAnswer: 'Numvax Discount Calculator calculates final sale prices after single or stacked percentage discounts, stacked coupons, sales tax, and optional tips with visual savings progress bars.',
    explanation: 'Calculates the net payable amount after deducting primary percentage discounts and promotional coupon stackings, while factoring in local sales tax and optional tips.',
    useCases: 'Ideal for shopping during Black Friday and holiday sales, verifying promotional coupon discounts at checkout, calculating wholesale volume markdowns, and factoring in sales tax and tips on retail purchases.',
    formulaTitle: 'Discount & Final Price Calculation Formulas',
    formulaDescription: 'Discount Amount = Original Price × (Discount Percentage / 100)\nDiscounted Price = Original Price - Discount Amount\nTax Amount = Discounted Price × (Tax Rate / 100)\nFinal Price = Discounted Price + Tax Amount',
    workedExamples: [
      {
        title: '$100 Jacket with 20% Discount and 8% Sales Tax',
        example: 'Step 1 (Discount): $100 × 0.20 = $20.00 Savings\nStep 2 (Subtotal): $100 - $20 = $80.00\nStep 3 (Sales Tax): $80 × 0.08 = $6.40 Tax\nStep 4 (Final Total): $80 + $6.40 = $86.40 (Total Savings: $20.00)',
      },
    ],
    faqs: [
      {
        question: 'How do stacked discounts (e.g. 20% off plus extra 10% coupon) work?',
        answer: 'Stacked discounts apply sequentially rather than additively. A 20% discount on $100 brings the price to $80, and the extra 10% coupon is then applied to $80 ($8 discount), making the final price $72 (a total 28% discount, not 30%).',
      },
      {
        question: 'How do I calculate what percentage discount was applied to an item?',
        answer: 'Divide the dollar amount saved by the original pre-discount price and multiply by 100: (Savings / Original Price) × 100.',
      },
      {
        question: 'Is sales tax applied before or after a store discount?',
        answer: 'In almost all jurisdictions, sales tax is calculated on the discounted subtotal after store markdowns and manufacturer discounts have been deducted.',
      },
      {
        question: 'How do I calculate a "Buy One, Get One 50% Off" (BOGO) discount?',
        answer: 'Add the price of both items and subtract half the price of the cheaper item. If both items cost $40, you pay $40 + $20 = $60, which equals an overall 25% discount across both items.',
      },
      {
        question: 'What is the formula to find the original price before a discount was applied?',
        answer: 'Divide the sale price by (1 - Discount Percentage / 100). For example, if a discounted item costs $60 after a 25% discount: $60 / 0.75 = $80 original price.',
      },
    ],
    relatedTools: [
      { slug: 'percentage-calculator', name: 'Percentage Calculator', categorySlug: 'math', description: 'Calculate percentage proportions' },
      { slug: 'loan-calculator', name: 'Loan Calculator', categorySlug: 'financial', description: 'Calculate monthly loan installments' },
    ],
  },

  'loan-calculator': {
    slug: 'loan-calculator',
    name: 'Loan & Payment Calculator',
    h1Title: 'Loan Calculator - Monthly Payment & Amortization Schedule',
    metaTitle: 'Free Loan Calculator - Amortization & Interest | Numvax',
    metaDescription: 'Calculate monthly loan payments, total interest paid, total loan cost, and full amortization schedule.',
    categoryName: 'Financial',
    categorySlug: 'financial',
    shortDescription: 'Calculate periodic loan payments, interest costs, and export full amortization schedules.',
    directAnswer: 'Numvax Loan Calculator calculates periodic mortgage and loan payments across USD, EUR, GBP, CAD, AUD, and other currencies. It visualizes principal vs interest split ratios and exports full payment amortization schedules as CSV.',
    explanation: 'Calculates periodic principal and interest repayments for fixed-rate personal loans, auto loans, and mortgages using standard financial amortization math.',
    useCases: 'Use this financial calculator to estimate monthly mortgage payments, compare auto loan financing offers, analyze total interest cost between 15-year vs 30-year terms, and export detailed payment schedules.',
    formulaTitle: 'Standard Fixed-Rate Amortization Formula',
    formulaDescription: 'Monthly Payment (PMT) = P × [r(1 + r)ⁿ] / [(1 + r)ⁿ - 1]\n\nWhere:\nP = Principal Loan Amount\nr = Periodic Monthly Interest Rate (Annual Rate / 12)\nn = Total Number of Monthly Payment Periods (Years × 12)',
    workedExamples: [
      {
        title: '$250,000 Mortgage at 6.5% Annual Interest for 30 Years (360 Months)',
        example: 'Principal (P) = $250,000\nMonthly Rate (r) = 0.065 / 12 = 0.0054167\nTotal Months (n) = 360\nPMT = 250,000 × [0.0054167(1.0054167)³⁶⁰] / [(1.0054167)³⁶⁰ - 1] = $1,580.17 / month\nTotal Interest Paid over 30 Years: $318,861.20',
      },
    ],
    faqs: [
      {
        question: 'How does loan amortization work?',
        answer: 'Amortization is the process of spreading loan payments over time. In early loan months, the majority of your payment goes towards interest. Over time, an increasing percentage pays down the principal balance.',
      },
      {
        question: 'How do extra monthly payments affect my total loan cost?',
        answer: 'Making extra principal payments directly reduces the remaining loan balance, cutting total interest expenses and shortening the total repayment term significantly.',
      },
      {
        question: 'What is the difference between APR and interest rate?',
        answer: 'The interest rate is the base cost of borrowing the principal balance. APR (Annual Percentage Rate) includes the interest rate plus additional lender fees, origination charges, and closing costs.',
      },
      {
        question: 'Can I export the loan amortization schedule to Excel or CSV?',
        answer: 'Yes! Click the "Export CSV" button in the results panel to download the full monthly breakdown including beginning balance, principal paid, interest paid, and remaining balance.',
      },
      {
        question: 'How do I calculate total interest paid over the life of a loan?',
        answer: 'Multiply your monthly payment amount by the total number of payments, then subtract the original principal amount: Total Interest = (Monthly Payment × Total Months) - Principal.',
      },
    ],
    relatedTools: [
      { slug: 'discount-calculator', name: 'Discount Calculator', categorySlug: 'financial', description: 'Calculate sale savings & tax' },
      { slug: 'percentage-calculator', name: 'Percentage Calculator', categorySlug: 'math', description: 'Calculate percentage rates & growth' },
    ],
  },

  'date-calculator': {
    slug: 'date-calculator',
    name: 'Date Calculator',
    h1Title: 'Date Calculator - Days Between Dates & Business Day Counter',
    metaTitle: 'Free Date Calculator - Days Between Dates | Numvax',
    metaDescription: 'Calculate exact time duration between two dates, add or subtract days, and calculate business days.',
    categoryName: 'Math',
    categorySlug: 'math',
    shortDescription: 'Calculate exact days between dates, add/subtract days, and calculate business days (Mon-Fri).',
    directAnswer: 'Numvax Date Calculator calculates exact day differences between two dates, adds/subtracts days/months/years, and calculates Business Days (Mon-Fri) with detailed timeline breakdowns.',
    explanation: 'Computes exact calendar durations between dates accounting for leap years, month lengths, timezones, and weekday/weekend boundaries.',
    useCases: 'Useful for calculating project timelines and deadlines, measuring exact age or milestone durations, tracking contractual business day intervals (excluding weekends), and planning event countdowns.',
    formulaTitle: 'Date Duration & Difference Formulas',
    formulaDescription: 'Total Days Difference = (End Timestamp - Start Timestamp) / (1000 ms × 60 s × 60 min × 24 hrs)\n\nBusiness Days = Total Days - Weekend Days (Saturdays & Sundays)',
    workedExamples: [
      {
        title: 'Duration Between January 1 and March 15 (Non-leap year)',
        example: 'January: 30 remaining days + February: 28 days + March: 15 days\nTotal Duration: 73 Calendar Days (10 Weeks, 3 Days)\nBusiness Working Days (Mon-Fri): 52 Working Days',
      },
    ],
    faqs: [
      {
        question: 'How does the business day calculator count days?',
        answer: 'Business day mode counts only weekdays (Monday through Friday) and automatically skips Saturdays and Sundays.',
      },
      {
        question: 'How do leap years affect date difference calculations?',
        answer: 'Leap years add February 29th (366 days total). The calculator automatically detects whether the date range spans a leap year to ensure exact day precision.',
      },
      {
        question: 'Can I add or subtract specific weeks or months from a date?',
        answer: 'Yes! Switch to "Add / Subtract Days" mode to enter any number of years, months, weeks, or days to calculate the exact future or past calendar date.',
      },
      {
        question: 'How do I calculate someone exact age in years, months, and days?',
        answer: 'Select the birthdate as the start date and today as the end date. The calculator outputs the precise duration broken down into years, months, weeks, and total days.',
      },
      {
        question: 'How many weeks are in a given number of days?',
        answer: 'Divide the total number of days by 7. For example, 73 days equals 10 full weeks and 3 remaining days.',
      },
    ],
    relatedTools: [
      { slug: 'percentage-calculator', name: 'Percentage Calculator', categorySlug: 'math', description: 'Calculate percentage elapsed' },
      { slug: 'gpa-calculator', name: 'GPA Calculator', categorySlug: 'math', description: 'Calculate semester grades' },
    ],
  },
};
