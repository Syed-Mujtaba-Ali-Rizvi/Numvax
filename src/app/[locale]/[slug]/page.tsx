import React from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { CALCULATOR_CATALOG } from '../../../lib/catalog';
import { TOOL_CATALOG } from '../../../lib/toolCatalog';
import { CalculatorLayout } from '../../../components/calculator/CalculatorLayout';
import { ToolLayout } from '../../../components/tool/ToolLayout';
import { routing } from '../../../i18n/routing';

// Lightweight, zero-layout-shift Tool Skeleton
const ToolSkeleton = () => (
  <div className="w-full min-h-[340px] bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 animate-pulse shadow-2xs">
    <div className="w-10 h-10 bg-neutral-100 rounded-xl" />
    <div className="w-48 h-4 bg-neutral-100 rounded-full" />
    <div className="w-32 h-3 bg-neutral-100/60 rounded-full" />
  </div>
);

// ─── Dynamically Code-Split Calculators ───────────────────────────────────────
const BmiCalculator = dynamic(() => import('../../../components/calculators/BmiCalculator').then(m => m.BmiCalculator), { loading: () => <ToolSkeleton /> });
const PercentageCalculator = dynamic(() => import('../../../components/calculators/PercentageCalculator').then(m => m.PercentageCalculator), { loading: () => <ToolSkeleton /> });
const GpaCalculator = dynamic(() => import('../../../components/calculators/GpaCalculator').then(m => m.GpaCalculator), { loading: () => <ToolSkeleton /> });
const DiscountCalculator = dynamic(() => import('../../../components/calculators/DiscountCalculator').then(m => m.DiscountCalculator), { loading: () => <ToolSkeleton /> });
const LoanCalculator = dynamic(() => import('../../../components/calculators/LoanCalculator').then(m => m.LoanCalculator), { loading: () => <ToolSkeleton /> });
const DateCalculator = dynamic(() => import('../../../components/calculators/DateCalculator').then(m => m.DateCalculator), { loading: () => <ToolSkeleton /> });

// ─── Dynamically Code-Split Heavy Tool Components ─────────────────────────────
const DocumentScanner = dynamic(() => import('../../../components/tools/scanner/DocumentScanner').then(m => m.DocumentScanner), { loading: () => <ToolSkeleton /> });
const RobotsGenerator = dynamic(() => import('../../../components/tools/seo/RobotsGenerator').then(m => m.RobotsGenerator), { loading: () => <ToolSkeleton /> });
const SeoTools = dynamic(() => import('../../../components/tools/seo/SeoTools').then(m => m.SeoTools), { loading: () => <ToolSkeleton /> });
const MergePdf = dynamic(() => import('../../../components/tools/pdf/MergePdf').then(m => m.MergePdf), { loading: () => <ToolSkeleton /> });
const SplitPdf = dynamic(() => import('../../../components/tools/pdf/SplitPdf').then(m => m.SplitPdf), { loading: () => <ToolSkeleton /> });
const CompressPdf = dynamic(() => import('../../../components/tools/pdf/CompressPdf').then(m => m.CompressPdf), { loading: () => <ToolSkeleton /> });
const PdfToJpg = dynamic(() => import('../../../components/tools/pdf/PdfToJpg').then(m => m.PdfToJpg), { loading: () => <ToolSkeleton /> });
const PdfToWord = dynamic(() => import('../../../components/tools/pdf/PdfToWord').then(m => m.PdfToWord), { loading: () => <ToolSkeleton /> });
const PdfToExcel = dynamic(() => import('../../../components/tools/pdf/PdfToExcel').then(m => m.PdfToExcel), { loading: () => <ToolSkeleton /> });
const WordToPdf = dynamic(() => import('../../../components/tools/pdf/WordToPdf').then(m => m.WordToPdf), { loading: () => <ToolSkeleton /> });
const JpgToPdf = dynamic(() => import('../../../components/tools/pdf/JpgToPdf').then(m => m.JpgToPdf), { loading: () => <ToolSkeleton /> });
const EditPdf = dynamic(() => import('../../../components/tools/pdf/EditPdf').then(m => m.EditPdf), { loading: () => <ToolSkeleton /> });
const SignPdf = dynamic(() => import('../../../components/tools/pdf/SignPdf').then(m => m.SignPdf), { loading: () => <ToolSkeleton /> });
const WatermarkPdf = dynamic(() => import('../../../components/tools/pdf/WatermarkPdf').then(m => m.WatermarkPdf), { loading: () => <ToolSkeleton /> });
const UnlockPdf = dynamic(() => import('../../../components/tools/pdf/UnlockPdf').then(m => m.UnlockPdf), { loading: () => <ToolSkeleton /> });
const ProtectPdf = dynamic(() => import('../../../components/tools/pdf/ProtectPdf').then(m => m.ProtectPdf), { loading: () => <ToolSkeleton /> });
const JsonFormatter = dynamic(() => import('../../../components/tools/developer/JsonFormatter').then(m => m.JsonFormatter), { loading: () => <ToolSkeleton /> });
const Base64Tool = dynamic(() => import('../../../components/tools/developer/Base64Tool').then(m => m.Base64Tool), { loading: () => <ToolSkeleton /> });
const UuidGenerator = dynamic(() => import('../../../components/tools/developer/UuidGenerator').then(m => m.UuidGenerator), { loading: () => <ToolSkeleton /> });
const PasswordGenerator = dynamic(() => import('../../../components/tools/developer/PasswordGenerator').then(m => m.PasswordGenerator), { loading: () => <ToolSkeleton /> });
const HashGenerator = dynamic(() => import('../../../components/tools/developer/HashGenerator').then(m => m.HashGenerator), { loading: () => <ToolSkeleton /> });
const JwtDecoder = dynamic(() => import('../../../components/tools/developer/JwtDecoder').then(m => m.JwtDecoder), { loading: () => <ToolSkeleton /> });
const QrCodeGenerator = dynamic(() => import('../../../components/tools/developer/QrCodeGenerator').then(m => m.QrCodeGenerator), { loading: () => <ToolSkeleton /> });
const ImageQrCodeGenerator = dynamic(() => import('../../../components/tools/developer/ImageQrCodeGenerator').then(m => m.ImageQrCodeGenerator), { loading: () => <ToolSkeleton /> });
const LoremIpsumGenerator = dynamic(() => import('../../../components/tools/generators/LoremIpsumGenerator').then(m => m.LoremIpsumGenerator), { loading: () => <ToolSkeleton /> });
const CodeFormatters = dynamic(() => import('../../../components/tools/developer/CodeFormatters').then(m => m.CodeFormatters), { loading: () => <ToolSkeleton /> });
const TextTools = dynamic(() => import('../../../components/tools/text/TextTools').then(m => m.TextTools), { loading: () => <ToolSkeleton /> });
const CaseConverter = dynamic(() => import('../../../components/tools/text/CaseConverter').then(m => m.CaseConverter), { loading: () => <ToolSkeleton /> });
const GrammarChecker = dynamic(() => import('../../../components/tools/text/GrammarChecker').then(m => m.GrammarChecker), { loading: () => <ToolSkeleton /> });
const ImageToWord = dynamic(() => import('../../../components/tools/image/ImageToWord').then(m => m.ImageToWord), { loading: () => <ToolSkeleton /> });
const ImageTools = dynamic(() => import('../../../components/tools/image/ImageTools').then(m => m.ImageTools), { loading: () => <ToolSkeleton /> });
const UnitConverters = dynamic(() => import('../../../components/tools/converters/UnitConverters').then(m => m.UnitConverters), { loading: () => <ToolSkeleton /> });

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const calcSlugs = Object.keys(CALCULATOR_CATALOG);
  const toolSlugs = Object.keys(TOOL_CATALOG);
  const allSlugs = [...calcSlugs, ...toolSlugs];

  return routing.locales.flatMap((locale) =>
    allSlugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = CALCULATOR_CATALOG[slug] || TOOL_CATALOG[slug];
  if (!item) return {};

  const baseUrl = 'https://numvax.com';
  const enUrl = `${baseUrl}/${slug}`;

  return {
    title: item.metaTitle,
    description: item.metaDescription,
    robots: {
      index: locale === 'en',
      follow: true,
      googleBot: {
        index: locale === 'en',
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: enUrl,
      languages: {
        'x-default': enUrl,
        en: enUrl,
      },
    },
    openGraph: {
      title: item.metaTitle,
      description: item.metaDescription,
      url: enUrl,
      siteName: 'Numvax',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: item.metaTitle,
      description: item.metaDescription,
    },
  };
}

export default async function LocaleSlugPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'tool' });

  // 1. Check Calculator Catalog
  const calcItem = CALCULATOR_CATALOG[slug];
  if (calcItem) {
    const renderCalculatorComponent = () => {
      switch (slug) {
        case 'bmi-calculator': return <BmiCalculator />;
        case 'percentage-calculator': return <PercentageCalculator />;
        case 'gpa-calculator': return <GpaCalculator />;
        case 'discount-calculator': return <DiscountCalculator />;
        case 'loan-calculator': return <LoanCalculator />;
        case 'date-calculator': return <DateCalculator />;
        default: return null;
      }
    };

    return (
      <CalculatorLayout
        slug={calcItem.slug}
        title={calcItem.h1Title}
        subtitle={calcItem.shortDescription}
        categoryName={calcItem.categoryName}
        categorySlug={calcItem.categorySlug}
        explanation={calcItem.explanation}
        directAnswer={calcItem.directAnswer}
        formulaTitle={calcItem.formulaTitle}
        formulaDescription={calcItem.formulaDescription}
        workedExamples={calcItem.workedExamples}
        useCases={calcItem.useCases}
        faqs={calcItem.faqs}
        relatedTools={calcItem.relatedTools}
        locale={locale}
      >
        {renderCalculatorComponent()}
      </CalculatorLayout>
    );
  }

  // 2. Check Tool Catalog
  const toolItem = TOOL_CATALOG[slug];
  if (toolItem) {
    const renderToolComponent = () => {
      switch (slug) {
        case 'scan-to-pdf': return <DocumentScanner />;
        case 'robots-txt-generator': return <RobotsGenerator />;
        case 'xml-sitemap-generator':
        case 'schema-markup-generator':
        case 'open-graph-generator':
        case 'meta-tag-analyzer':
        case 'meta-description-checker':
        case 'title-tag-checker':
        case 'keyword-density-checker':
        case 'redirect-checker':
        case 'dns-lookup':
        case 'ssl-checker':
          return <SeoTools toolSlug={slug} />;
        case 'merge-pdf': return <MergePdf />;
        case 'split-pdf': return <SplitPdf />;
        case 'compress-pdf': return <CompressPdf />;
        case 'pdf-to-jpg': return <PdfToJpg />;
        case 'pdf-to-word': return <PdfToWord />;
        case 'pdf-to-excel': return <PdfToExcel />;
        case 'word-to-pdf': return <WordToPdf />;
        case 'jpg-to-pdf': return <JpgToPdf />;
        case 'edit-pdf': return <EditPdf />;
        case 'add-signature-pdf': return <SignPdf />;
        case 'add-watermark-pdf': return <WatermarkPdf />;
        case 'remove-password-pdf': return <UnlockPdf />;
        case 'protect-pdf': return <ProtectPdf />;
        case 'json-formatter':
        case 'json-minifier':
        case 'json-validator':
        case 'json-to-csv':
          return <JsonFormatter />;
        case 'base64-encoder-decoder':
        case 'url-encoder-decoder':
          return <Base64Tool />;
        case 'uuid-generator': return <UuidGenerator />;
        case 'password-generator': return <PasswordGenerator />;
        case 'hash-generator': return <HashGenerator />;
        case 'jwt-decoder': return <JwtDecoder />;
        case 'qr-code-generator': return <QrCodeGenerator />;
        case 'bulk-qr-code-generator': return <QrCodeGenerator defaultMode="bulk" />;
        case 'image-qr-code-generator': return <ImageQrCodeGenerator />;
        case 'lorem-ipsum-generator': return <LoremIpsumGenerator />;
        case 'regex-tester':
        case 'html-formatter':
        case 'css-formatter':
        case 'js-formatter':
        case 'sql-formatter':
        case 'markdown-editor':
        case 'color-code-converter':
        case 'http-status-reference':
          return <CodeFormatters toolSlug={slug} />;
        case 'word-counter':
        case 'character-counter':
        case 'remove-extra-spaces':
        case 'remove-duplicate-lines':
        case 'find-and-replace':
        case 'text-compare':
          return <TextTools toolSlug={slug} />;
        case 'case-converter': return <CaseConverter />;
        case 'grammar-checker': return <GrammarChecker />;
        case 'image-to-word': return <ImageToWord />;
        case 'image-compressor':
        case 'bulk-image-compressor':
        case 'image-resizer':
        case 'image-converter':
        case 'image-filter':
          return <ImageTools toolSlug={slug} defaultMode={slug === 'bulk-image-compressor' ? 'bulk' : undefined} />;
        case 'length-converter':
        case 'weight-converter':
        case 'temperature-converter':
        case 'speed-converter':
        case 'volume-converter':
        case 'area-converter':
        case 'data-unit-converter':
          return <UnitConverters toolSlug={slug} />;
        default:
          return (
            <div className="p-8 text-center bg-white border border-neutral-200 rounded-2xl">
              <p className="text-sm text-neutral-500 font-medium">{t('toolLoaded')}</p>
            </div>
          );
      }
    };

    return (
      <ToolLayout
        slug={toolItem.slug}
        title={toolItem.h1Title}
        subtitle={toolItem.shortDescription}
        categoryName={toolItem.categoryName}
        categorySlug={toolItem.categorySlug}
        explanation={toolItem.explanation}
        directAnswer={toolItem.directAnswer}
        instructionsTitle={toolItem.instructionsTitle || t('howToUse')}
        instructionsDescription={toolItem.instructionsDescription}
        workedExamples={toolItem.workedExamples}
        useCases={toolItem.useCases}
        faqs={toolItem.faqs}
        relatedTools={toolItem.relatedTools}
        trustCopy={toolItem.trustCopy || t('trustCopy')}
        locale={locale}
      >
        {renderToolComponent()}
      </ToolLayout>
    );
  }

  // 3. Neither → trigger 404
  notFound();
}
