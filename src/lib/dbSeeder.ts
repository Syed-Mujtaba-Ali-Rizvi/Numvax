import { prisma } from './prisma';
import { hashPassword } from './adminAuth';
import { CALCULATOR_CATALOG } from './catalog';
import { TOOL_CATALOG } from './toolCatalog';

let isSeeding = false;
let isSeeded = false;

export async function ensureDatabaseSeeded() {
  if (isSeeded) return;
  if (isSeeding) {
    // Wait briefly if already seeding in this process
    await new Promise((resolve) => setTimeout(resolve, 100));
    return;
  }
  isSeeding = true;

  try {
    // 1. Ensure Default Admin exists
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@numvax.com';
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin1234!#';

    try {
      await prisma.admin.upsert({
        where: { email: defaultEmail },
        update: {},
        create: {
          email: defaultEmail,
          name: 'Super Admin',
          passwordHash: hashPassword(defaultPassword),
          role: 'superadmin',
        },
      });
    } catch {}

    // 2. Ensure Default SiteSettings exists
    try {
      await prisma.siteSettings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
          id: 'default',
          siteName: 'Numvax',
          tagline: 'Fast, accurate and easy-to-use free online tools',
          titleTemplate: '{{title}} | Numvax',
          defaultMetaDescription: 'Fast, accurate and easy-to-use calculators, converters, developer tools, text utilities, and PDF tools.',
          defaultOgImage: '/og-image.jpg',
          defaultRobots: 'index, follow',
          defaultCanonical: 'https://numvax.com',
          contactEmail: 'contact@numvax.com',
          heroHeading: "Every Online Tool You'll Ever Need. 100% Free & Private.",
          heroDescription: 'Fast, precise, client-side tools: Calculators, PDF utilities, image editors, developer formatters, and converters. No signup, no files uploaded to servers.',
          searchPlaceholder: 'Search 50+ tools (e.g., BMI Calculator, Merge PDF, JSON Formatter)...',
          featuredToolSlugs: JSON.stringify(['bmi-calculator', 'merge-pdf', 'json-formatter', 'image-compressor']),
          popularToolSlugs: JSON.stringify(['percentage-calculator', 'word-counter', 'uuid-generator', 'pdf-to-word']),
          adsEnabled: true,
          headerAdActive: false,
          sidebarAdActive: true,
          inContentAdActive: true,
          belowResultsAdActive: true,
          footerAdActive: true,
        },
      });
    } catch {}

    // 3. Ensure Default Categories exist
    const defaultCategories = [
      { slug: 'health', name: 'Health & Fitness', description: 'Calculators for body mass index, calories, and health metrics.', icon: 'Heart' },
      { slug: 'math', name: 'Math & Percentage', description: 'Quick math tools, percentage calculators, and date calculations.', icon: 'Calculator' },
      { slug: 'financial', name: 'Financial Calculators', description: 'Loan, mortgage, interest, and discount calculators.', icon: 'DollarSign' },
      { slug: 'date-time', name: 'Date & Time', description: 'Date duration, age calculations, and time calculators.', icon: 'Calendar' },
      { slug: 'education', name: 'Education & Academic', description: 'GPA calculators and academic grading tools.', icon: 'GraduationCap' },
      { slug: 'pdf-tools', name: 'PDF Tools', description: 'Merge, split, compress, edit, convert, and sign PDF documents locally.', icon: 'FileText' },
      { slug: 'image-tools', name: 'Image Tools', description: 'Compress, resize, convert, and filter images in your browser.', icon: 'Image' },
      { slug: 'text-tools', name: 'Text & Content', description: 'Word counters, case converters, duplicate removers, and text diffs.', icon: 'Type' },
      { slug: 'converters', name: 'Unit Converters', description: 'Length, weight, temperature, speed, area, volume, and data converters.', icon: 'ArrowLeftRight' },
      { slug: 'developer-tools', name: 'Developer Tools', description: 'JSON formatters, Base64 encoder/decoder, UUID & Hash generators, JWT decoders.', icon: 'Code2' },
      { slug: 'seo-tools', name: 'SEO & Webmaster', description: 'Robots.txt generator, sitemap analyzer, meta tags, and DNS lookup tools.', icon: 'Search' },
      { slug: 'generators', name: 'Generators', description: 'Password generators, QR code generators, and Lorem Ipsum generators.', icon: 'Sparkles' },
      { slug: 'scanner', name: 'Document Scanner', description: 'Scan physical documents to PDF directly from your camera.', icon: 'Camera' },
    ];

    const categoryMap = new Map<string, string>(); // slug -> id
    for (const [index, cat] of defaultCategories.entries()) {
      try {
        const existingCat = await prisma.toolCategory.upsert({
          where: { slug: cat.slug },
          update: {},
          create: {
            slug: cat.slug,
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            order: index,
            h1Title: `${cat.name} — Free Online Tools`,
            metaTitle: `${cat.name} Online - Fast & Free | Numvax`,
            metaDescription: cat.description,
            focusKeyword: cat.name.toLowerCase(),
          },
        });
        categoryMap.set(cat.slug, existingCat.id);
      } catch {}
    }

    // 4. Ensure Tools from CALCULATOR_CATALOG are seeded
    for (const [slug, item] of Object.entries(CALCULATOR_CATALOG)) {
      try {
        const categoryId = categoryMap.get(item.categorySlug) || categoryMap.get('math') || Array.from(categoryMap.values())[0];
        const existingTool = await prisma.tool.findUnique({ where: { slug } });

        if (!existingTool && categoryId) {
          await prisma.tool.create({
            data: {
              slug: item.slug,
              name: item.name,
              categoryId,
              type: 'calculator',
              description: item.explanation,
              shortDescription: item.shortDescription,
              isPopular: ['bmi-calculator', 'percentage-calculator', 'loan-calculator'].includes(slug),
              isFeatured: ['bmi-calculator', 'percentage-calculator'].includes(slug),
              isEnabled: true,
              focusKeyword: item.keywords?.[0] || item.name.toLowerCase(),
              secondaryKeywords: (item.keywords || []).join(', '),
              searchKeywords: (item.keywords || []).join(', '),
              searchAliases: `${item.name.toLowerCase()}, ${slug.replace(/-/g, ' ')}`,
              relatedToolSlugs: JSON.stringify((item.relatedTools || []).map(r => r.slug)),
              content: {
                create: {
                  h1Title: item.h1Title,
                  metaTitle: item.metaTitle,
                  metaDescription: item.metaDescription,
                  focusKeyword: item.keywords?.[0] || item.name.toLowerCase(),
                  secondaryKeywords: (item.keywords || []).join(', '),
                  canonicalUrl: `https://numvax.com/${item.slug}`,
                  explanation: item.explanation,
                  directAnswer: item.directAnswer,
                  formulaTitle: item.formulaTitle,
                  formulaDescription: item.formulaDescription,
                  useCases: item.useCases,
                  workedExamplesJson: JSON.stringify(item.workedExamples || []),
                  faqItemsJson: JSON.stringify(item.faqs || []),
                  ogTitle: item.metaTitle,
                  ogDescription: item.metaDescription,
                  twitterTitle: item.metaTitle,
                  twitterDescription: item.metaDescription,
                },
              },
            },
          });
        }
      } catch {}
    }

    // 5. Ensure Tools from TOOL_CATALOG are seeded
    for (const [slug, item] of Object.entries(TOOL_CATALOG)) {
      try {
        const categoryId = categoryMap.get(item.categorySlug) || categoryMap.get('developer-tools') || Array.from(categoryMap.values())[0];
        const existingTool = await prisma.tool.findUnique({ where: { slug } });

        if (!existingTool && categoryId) {
          await prisma.tool.create({
            data: {
              slug: item.slug,
              name: item.name,
              categoryId,
              type: item.type || 'developer',
              description: item.explanation,
              shortDescription: item.shortDescription,
              isPopular: ['merge-pdf', 'json-formatter', 'image-compressor', 'uuid-generator'].includes(slug),
              isFeatured: ['merge-pdf', 'json-formatter', 'image-to-word'].includes(slug),
              isEnabled: true,
              focusKeyword: item.keywords?.[0] || item.name.toLowerCase(),
              secondaryKeywords: (item.keywords || []).join(', '),
              searchKeywords: (item.keywords || []).join(', '),
              searchAliases: `${item.name.toLowerCase()}, ${slug.replace(/-/g, ' ')}`,
              relatedToolSlugs: JSON.stringify((item.relatedTools || []).map(r => r.slug)),
              content: {
                create: {
                  h1Title: item.h1Title,
                  metaTitle: item.metaTitle,
                  metaDescription: item.metaDescription,
                  focusKeyword: item.keywords?.[0] || item.name.toLowerCase(),
                  secondaryKeywords: (item.keywords || []).join(', '),
                  canonicalUrl: `https://numvax.com/${item.slug}`,
                  explanation: item.explanation,
                  directAnswer: item.directAnswer,
                  instructionsTitle: item.instructionsTitle,
                  instructionsDescription: item.instructionsDescription,
                  useCases: item.useCases,
                  trustCopy: item.trustCopy,
                  workedExamplesJson: JSON.stringify(item.workedExamples || []),
                  faqItemsJson: JSON.stringify(item.faqs || []),
                  ogTitle: item.metaTitle,
                  ogDescription: item.metaDescription,
                  twitterTitle: item.metaTitle,
                  twitterDescription: item.metaDescription,
                },
              },
            },
          });
        }
      } catch {}
    }

    // 6. Ensure Default Static Pages are seeded
    const defaultPages = [
      {
        slug: 'homepage',
        title: 'Homepage',
        h1Title: "Every Online Tool You'll Ever Need. 100% Free & Private.",
        metaTitle: 'Numvax — Free Online Tools & Calculators',
        metaDescription: 'Fast, accurate and easy-to-use calculators, converters, developer tools, text utilities, and PDF tools for everyday life, work and study.',
        focusKeyword: 'free online tools',
        canonicalUrl: 'https://numvax.com/',
      },
      {
        slug: 'about',
        title: 'About Us',
        h1Title: 'About Numvax — Privacy-First Web Utilities',
        metaTitle: 'About Us — Numvax Online Tools',
        metaDescription: 'Learn about Numvax, our mission to build fast, free, private client-side calculators and web utilities.',
        focusKeyword: 'about numvax',
        canonicalUrl: 'https://numvax.com/about',
      },
      {
        slug: 'contact',
        title: 'Contact Us',
        h1Title: 'Contact Numvax Support',
        metaTitle: 'Contact Us — Numvax Support & Feedback',
        metaDescription: 'Get in touch with the Numvax engineering team for tool requests, feedback, or bug reports.',
        focusKeyword: 'contact numvax',
        canonicalUrl: 'https://numvax.com/contact',
      },
      {
        slug: 'privacy-policy',
        title: 'Privacy Policy',
        h1Title: 'Privacy Policy',
        metaTitle: 'Privacy Policy — Numvax',
        metaDescription: 'Numvax operates on a strict zero-data-logging, client-side privacy architecture. Learn how your data is protected.',
        focusKeyword: 'numvax privacy policy',
        canonicalUrl: 'https://numvax.com/privacy-policy',
      },
      {
        slug: 'cookie-policy',
        title: 'Cookie Policy',
        h1Title: 'Cookie Policy',
        metaTitle: 'Cookie Policy — Numvax',
        metaDescription: 'Details on essential cookies, Google AdSense cookies, and privacy controls at Numvax.',
        focusKeyword: 'numvax cookie policy',
        canonicalUrl: 'https://numvax.com/cookie-policy',
      },
      {
        slug: 'terms',
        title: 'Terms of Service',
        h1Title: 'Terms of Service',
        metaTitle: 'Terms of Service — Numvax',
        metaDescription: 'Terms and conditions governing the use of Numvax online tools and calculators.',
        focusKeyword: 'numvax terms',
        canonicalUrl: 'https://numvax.com/terms',
      },
      {
        slug: 'disclaimer',
        title: 'Disclaimer',
        h1Title: 'Disclaimer & Liability Terms',
        metaTitle: 'Disclaimer — Numvax',
        metaDescription: 'Important calculations and financial/health estimate disclaimers for Numvax tools.',
        focusKeyword: 'numvax disclaimer',
        canonicalUrl: 'https://numvax.com/disclaimer',
      },
      {
        slug: 'all-tools',
        title: 'All Tools Directory',
        h1Title: 'Browse All Free Online Tools & Calculators',
        metaTitle: 'All Online Tools & Calculators Directory | Numvax',
        metaDescription: 'Complete directory of 50+ free client-side online tools, PDF editors, image converters, and developer utilities.',
        focusKeyword: 'all online tools',
        canonicalUrl: 'https://numvax.com/all-tools',
      },
    ];

    for (const page of defaultPages) {
      try {
        await prisma.pageContent.upsert({
          where: { slug: page.slug },
          update: {},
          create: {
            slug: page.slug,
            title: page.title,
            h1Title: page.h1Title,
            metaTitle: page.metaTitle,
            metaDescription: page.metaDescription,
            focusKeyword: page.focusKeyword,
            canonicalUrl: page.canonicalUrl,
            isPublished: true,
            inSitemap: true,
            ogTitle: page.metaTitle,
            ogDescription: page.metaDescription,
            twitterTitle: page.metaTitle,
            twitterDescription: page.metaDescription,
          },
        });
      } catch {}
    }

    isSeeded = true;
  } catch (error) {
    console.error('[Database Seeder] Error during seeding:', error);
  } finally {
    isSeeding = false;
  }
}
