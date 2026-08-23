import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TOOL_CATALOG } from '@/lib/toolCatalog';
import { ToolLayout } from '@/components/tool/ToolLayout';
import { JsonFormatter } from '@/components/tools/developer/JsonFormatter';
import { Base64Tool } from '@/components/tools/developer/Base64Tool';
import { UuidGenerator } from '@/components/tools/developer/UuidGenerator';
import { PasswordGenerator } from '@/components/tools/developer/PasswordGenerator';
import { HashGenerator } from '@/components/tools/developer/HashGenerator';
import { JwtDecoder } from '@/components/tools/developer/JwtDecoder';
import { QrCodeGenerator } from '@/components/tools/developer/QrCodeGenerator';
import { LoremIpsumGenerator } from '@/components/tools/generators/LoremIpsumGenerator';
import { TextTools } from '@/components/tools/text/TextTools';
import { CaseConverter } from '@/components/tools/text/CaseConverter';
import { GrammarChecker } from '@/components/tools/text/GrammarChecker';
import { MergePdf } from '@/components/tools/pdf/MergePdf';
import { SplitPdf } from '@/components/tools/pdf/SplitPdf';
import { CompressPdf } from '@/components/tools/pdf/CompressPdf';
import { PdfToJpg } from '@/components/tools/pdf/PdfToJpg';
import { PdfToWord } from '@/components/tools/pdf/PdfToWord';
import { PdfToExcel } from '@/components/tools/pdf/PdfToExcel';
import { WordToPdf } from '@/components/tools/pdf/WordToPdf';
import { JpgToPdf } from '@/components/tools/pdf/JpgToPdf';
import { EditPdf } from '@/components/tools/pdf/EditPdf';
import { SignPdf } from '@/components/tools/pdf/SignPdf';
import { WatermarkPdf } from '@/components/tools/pdf/WatermarkPdf';
import { UnlockPdf } from '@/components/tools/pdf/UnlockPdf';
import { RobotsGenerator } from '@/components/tools/seo/RobotsGenerator';
import { SeoTools } from '@/components/tools/seo/SeoTools';
import { CodeFormatters } from '@/components/tools/developer/CodeFormatters';
import { DocumentScanner } from '@/components/tools/scanner/DocumentScanner';
import { ImageTools } from '@/components/tools/image/ImageTools';
import { ImageToWord } from '@/components/tools/image/ImageToWord';
import { UnitConverters } from '@/components/tools/converters/UnitConverters';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(TOOL_CATALOG).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOL_CATALOG[slug];
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

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = TOOL_CATALOG[slug];

  if (!tool) {
    notFound();
  }

  const renderToolComponent = () => {
    switch (slug) {
      // Document Scanner (Part B)
      case 'scan-to-pdf':
        return <DocumentScanner />;

      // SEO Tools
      case 'robots-txt-generator':
        return <RobotsGenerator />;
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

      // PDF Tools
      case 'merge-pdf':
        return <MergePdf />;
      case 'split-pdf':
        return <SplitPdf />;
      case 'compress-pdf':
        return <CompressPdf />;
      case 'pdf-to-jpg':
        return <PdfToJpg />;
      case 'pdf-to-word':
        return <PdfToWord />;
      case 'pdf-to-excel':
        return <PdfToExcel />;
      case 'word-to-pdf':
        return <WordToPdf />;
      case 'jpg-to-pdf':
        return <JpgToPdf />;
      case 'edit-pdf':
        return <EditPdf />;
      case 'add-signature-pdf':
        return <SignPdf />;
      case 'add-watermark-pdf':
        return <WatermarkPdf />;
      case 'remove-password-pdf':
        return <UnlockPdf />;

      // Developer Tools
      case 'json-formatter':
      case 'json-minifier':
      case 'json-validator':
      case 'json-to-csv':
        return <JsonFormatter />;
      case 'base64-encoder-decoder':
      case 'url-encoder-decoder':
        return <Base64Tool />;
      case 'uuid-generator':
        return <UuidGenerator />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'hash-generator':
        return <HashGenerator />;
      case 'jwt-decoder':
        return <JwtDecoder />;
      case 'qr-code-generator':
        return <QrCodeGenerator />;
      case 'lorem-ipsum-generator':
        return <LoremIpsumGenerator />;
      case 'regex-tester':
      case 'html-formatter':
      case 'css-formatter':
      case 'js-formatter':
      case 'sql-formatter':
      case 'markdown-editor':
      case 'color-code-converter':
      case 'http-status-reference':
        return <CodeFormatters toolSlug={slug} />;

      // Text Tools
      case 'word-counter':
      case 'character-counter':
      case 'remove-extra-spaces':
      case 'remove-duplicate-lines':
      case 'find-and-replace':
      case 'text-compare':
        return <TextTools toolSlug={slug} />;
      case 'case-converter':
        return <CaseConverter />;
      case 'grammar-checker':
        return <GrammarChecker />;

      // Image Tools
      case 'image-to-word':
        return <ImageToWord />;
      case 'image-compressor':
      case 'image-resizer':
      case 'image-converter':
      case 'image-filter':
        return <ImageTools toolSlug={slug} />;

      // Converters
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
            <p className="text-sm text-neutral-500 font-medium">Interactive tool interface loaded.</p>
          </div>
        );
    }
  };

  return (
    <ToolLayout
      slug={tool.slug}
      title={tool.h1Title}
      subtitle={tool.shortDescription}
      categoryName={tool.categoryName}
      categorySlug={tool.categorySlug}
      explanation={tool.explanation}
      instructionsTitle={tool.instructionsTitle}
      instructionsDescription={tool.instructionsDescription}
      workedExamples={tool.workedExamples}
      faqs={tool.faqs}
      relatedTools={tool.relatedTools}
      trustCopy={tool.trustCopy}
    >
      {renderToolComponent()}
    </ToolLayout>
  );
}
