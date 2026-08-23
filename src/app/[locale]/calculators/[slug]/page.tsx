import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CALCULATOR_CATALOG } from '@/lib/catalog';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';

import { BmiCalculator } from '@/components/calculators/BmiCalculator';
import { PercentageCalculator } from '@/components/calculators/PercentageCalculator';
import { GpaCalculator } from '@/components/calculators/GpaCalculator';
import { DiscountCalculator } from '@/components/calculators/DiscountCalculator';
import { LoanCalculator } from '@/components/calculators/LoanCalculator';
import { DateCalculator } from '@/components/calculators/DateCalculator';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(CALCULATOR_CATALOG).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = CALCULATOR_CATALOG[slug];
  if (!tool) return {};

  const url = `https://numvax.com/${slug}`;

  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url,
      siteName: 'Numvax',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = CALCULATOR_CATALOG[slug];

  if (!tool) {
    notFound();
  }

  const renderCalculatorComponent = () => {
    switch (slug) {

      case 'bmi-calculator':
        return <BmiCalculator />;
      case 'percentage-calculator':
        return <PercentageCalculator />;
      case 'gpa-calculator':
        return <GpaCalculator />;
      case 'discount-calculator':
        return <DiscountCalculator />;
      case 'loan-calculator':
        return <LoanCalculator />;
      case 'date-calculator':
        return <DateCalculator />;
      default:
        return null;
    }
  };

  return (
    <CalculatorLayout
      slug={tool.slug}
      title={tool.h1Title}
      subtitle={tool.shortDescription}
      categoryName={tool.categoryName}
      categorySlug={tool.categorySlug}
      explanation={tool.explanation}
      formulaTitle={tool.formulaTitle}
      formulaDescription={tool.formulaDescription}
      workedExamples={tool.workedExamples}
      faqs={tool.faqs}
      relatedTools={tool.relatedTools}
    >
      {renderCalculatorComponent()}
    </CalculatorLayout>
  );
}
