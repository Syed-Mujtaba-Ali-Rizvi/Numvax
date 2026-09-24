import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { JsonLd } from '@/components/seo/JsonLd';
import { getPageContent } from '@/lib/contentService';
import { ShieldCheck, Zap, Layers, Lock, Cpu, Globe, CheckCircle2, Award, Users } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent('about');
  const title = page?.metaTitle || 'About Numvax – Free Online Tools & Utility Platform';
  const description = page?.metaDescription || 'Learn about Numvax: a free, privacy-first online utility platform providing client-side batch image compression, PDF editing, QR code generation, unit converters, and calculators.';

  return {
    title,
    description,
    robots: {
      index: !page?.noIndex,
      follow: !page?.noFollow,
    },
    alternates: {
      canonical: page?.canonicalUrl || 'https://numvax.com/about',
    },
    openGraph: {
      title,
      description,
      url: page?.canonicalUrl || 'https://numvax.com/about',
      siteName: 'Numvax',
    },
  };
}

export default async function AboutPage() {
  const page = await getPageContent('about');
  const h1Title = page?.h1Title || 'About Numvax';

  const breadcrumbs = [
    { name: 'Home', url: 'https://numvax.com' },
    { name: 'About', url: 'https://numvax.com/about' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
      <JsonLd type="Breadcrumb" data={{ items: breadcrumbs }} />
      <JsonLd type="Organization" data={{ name: 'Numvax', url: 'https://numvax.com', description: 'Free client-side online tools, converters, and calculators.' }} />
      <Breadcrumb items={breadcrumbs} />

      <div className="flex items-center gap-3">
        <Image src="/logo.png" alt="Numvax Logo" width={48} height={48} className="rounded-xl object-contain bg-black shrink-0 shadow-2xs" priority />
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            {h1Title}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Fast, client-side online tools &amp; utility platform built for high privacy and speed
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 leading-relaxed text-sm text-neutral-700 shadow-2xs">

        {/* Core Purpose */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-neutral-800" />
            What is Numvax?
          </h2>
          <p className="leading-relaxed">
            <strong>Numvax</strong> (<Link href="/" className="text-neutral-900 font-semibold underline">https://numvax.com</Link>) is an independent online utility suite designed to make essential daily digital tasks fast, reliable, and 100% private. We provide specialized tools for image optimization, PDF document manipulation, QR code generation, financial &amp; health calculations, unit conversions, and developer utilities.
          </p>
          <p className="leading-relaxed">
            Unlike traditional online utility websites that upload your files to remote cloud servers for processing, Numvax is engineered with a <strong>modern client-side architecture</strong>. Our tools execute computations and file transformations directly within your browser memory using cutting-edge WebAssembly, HTML5 Canvas, and Web Crypto APIs.
          </p>
        </section>

        {/* Our Guiding Principles */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-neutral-800" />
            Our Core Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col gap-2">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-700" /> 100% Privacy by Design
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Your files, inputs, passwords, and photos never leave your device. No server uploads, no data retention, and no data selling.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col gap-2">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" /> Zero Friction Access
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                No mandatory sign-ups, no email captures, and no paywalls. All tools are immediately accessible to everyone, everywhere.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col gap-2">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Algorithmic Accuracy
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Every calculation and conversion formula is benchmarked against recognized industry standards (WHO, NIST, ISO).
              </p>
            </div>
          </div>
        </section>

        {/* Tool Categories */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-neutral-800" />
            What Does Numvax Provide?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl flex flex-col gap-1">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-900" /> Image Tools &amp; Batch Processing
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Batch compress up to 50 images simultaneously (JPG, PNG, WebP), resize pixel dimensions, convert formats, and export clean ZIP archives.
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl flex flex-col gap-1">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-900" /> PDF Document Utilities
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Merge PDF documents, split page ranges, compress PDF size, add digital signatures, password-protect files, and convert PDF to Word/JPG.
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl flex flex-col gap-1">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-neutral-900" /> High-Performance QR Codes
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Generate single or bulk QR codes up to 100 links at once with custom center logos, scannability error correction, and instant SVG/PNG exports.
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl flex flex-col gap-1">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-neutral-900" /> Mathematical &amp; Financial Calculators
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Loan amortization schedules, percentage calculations, BMI health ranges, college GPA scales, business day counts, and unit converters.
              </p>
            </div>
          </div>
        </section>

        {/* Technology & Security */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-neutral-800" />
            Engineering &amp; Security Architecture
          </h2>
          <p className="leading-relaxed text-xs sm:text-sm text-neutral-600">
            Numvax is built with modern web technologies including Next.js, TypeScript, Tailwind CSS, PDF-Lib, and Tesseract.js OCR. By shifting computations into the user&apos;s browser runtime:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600">
            <li><strong>Zero Server Latency:</strong> Instant results without waiting for round-trip server uploads.</li>
            <li><strong>Zero Data Breach Surface:</strong> Since we don&apos;t hold your files or inputs in databases, there is no server-side user data to leak or compromise.</li>
            <li><strong>Offline Capable:</strong> Many tools continue to function smoothly even when your internet connection drops after the page is loaded.</li>
          </ul>
        </section>

        {/* Editorial Standards & Accuracy */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-neutral-800" />
            Editorial &amp; Quality Verification Standards
          </h2>
          <p className="leading-relaxed text-xs sm:text-sm text-neutral-600">
            Every calculator and utility on Numvax is accompanied by thorough documentation, worked examples, mathematical formula descriptions, and frequently asked questions (FAQs). We regularly review calculation engines against authoritative reference materials to maintain the highest standard of accuracy.
          </p>
        </section>

        {/* Contact & Transparency */}
        <section className="pt-4 border-t border-neutral-200 flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-neutral-800" />
            Contact &amp; Feedback
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            We actively maintain and improve Numvax based on user feedback. Have a feature suggestion, tool request, or bug report? Reach out via our <Link href="/contact" className="text-neutral-900 font-bold underline hover:text-neutral-700">Contact page</Link> or email us directly at <a href="mailto:numvax@gmail.com" className="text-neutral-900 font-bold underline hover:text-neutral-700">numvax@gmail.com</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
