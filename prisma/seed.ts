import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Calcora production database...');

  // Seed Categories
  const categories = [
    { slug: 'financial', name: 'Financial', description: 'Loan, discount, mortgage, and investment tools.', order: 1 },
    { slug: 'health', name: 'Health', description: 'BMI, body metrics, and fitness tools.', order: 2 },
    { slug: 'math', name: 'Math', description: 'Percentage, algebra, and numeric tools.', order: 3 },
    { slug: 'date-time', name: 'Date & Time', description: 'Age, date duration, and business day counters.', order: 4 },
    { slug: 'education', name: 'Education', description: 'GPA and academic grade tools.', order: 5 },
    { slug: 'converters', name: 'Converters', description: 'Unit conversion tools.', order: 6 },
  ];

  for (const cat of categories) {
    await prisma.calculatorCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, order: cat.order },
      create: cat,
    });
  }

  // Fetch created category IDs
  const financialCat = await prisma.calculatorCategory.findUnique({ where: { slug: 'financial' } });
  const healthCat = await prisma.calculatorCategory.findUnique({ where: { slug: 'health' } });
  const mathCat = await prisma.calculatorCategory.findUnique({ where: { slug: 'math' } });
  const dateTimeCat = await prisma.calculatorCategory.findUnique({ where: { slug: 'date-time' } });
  const educationCat = await prisma.calculatorCategory.findUnique({ where: { slug: 'education' } });

  // Seed 7 Launch Calculators
  const calculators = [
    { slug: 'age-calculator', name: 'Age Calculator', categoryId: dateTimeCat!.id, description: 'Calculate exact age in years, months, days.', shortDescription: 'Calculate exact age and birthday countdown.', isPopular: true, order: 1 },
    { slug: 'bmi-calculator', name: 'BMI Calculator', categoryId: healthCat!.id, description: 'Calculate Body Mass Index and healthy weight range.', shortDescription: 'Calculate BMI, weight category, and healthy range.', isPopular: true, order: 2 },
    { slug: 'percentage-calculator', name: 'Percentage Calculator', categoryId: mathCat!.id, description: 'Multi-mode percentage tool with worked examples.', shortDescription: 'Calculate percentage increase, decrease, and difference.', isPopular: true, order: 3 },
    { slug: 'gpa-calculator', name: 'GPA Calculator', categoryId: educationCat!.id, description: 'Calculate GPA for 4.0 or custom scales.', shortDescription: 'Calculate cumulative college and high school GPA.', isPopular: true, order: 4 },
    { slug: 'discount-calculator', name: 'Discount Calculator', categoryId: financialCat!.id, description: 'Calculate sale prices, stacked discounts, tax, tip.', shortDescription: 'Calculate sale price, savings, and tax.', isPopular: true, order: 5 },
    { slug: 'loan-calculator', name: 'Loan Calculator', categoryId: financialCat!.id, description: 'Calculate loan payments and amortization schedule.', shortDescription: 'Calculate monthly payments and amortization.', isPopular: true, order: 6 },
    { slug: 'date-calculator', name: 'Date Calculator', categoryId: dateTimeCat!.id, description: 'Add/subtract days and count business days.', shortDescription: 'Add days and count Monday-Friday business days.', isPopular: true, order: 7 },
  ];

  for (const calc of calculators) {
    await prisma.calculator.upsert({
      where: { slug: calc.slug },
      update: { name: calc.name, description: calc.description, shortDescription: calc.shortDescription },
      create: calc,
    });
  }

  // Seed Initial Admin Account
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@calcora.com';
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'System Admin',
      passwordHash: '$2b$12$eImiTXuWVxfM37uY4JANjO5E/w929./Y/w73y792.Y2.Y', // Placeholder hash, to be rotated after initial deployment
      twoFactorEnabled: true,
    },
  });

  // Seed Default Site Settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      siteName: 'Calcora',
      tagline: 'Fast, accurate and easy-to-use calculators for everyday life, work and study.',
      contactEmail: 'contact@calcora.com',
      adsEnabled: true,
      headerAdActive: true,
      sidebarAdActive: true,
      inContentAdActive: true,
      belowResultsAdActive: true,
      footerAdActive: true,
    },
  });

  console.log('Production database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
