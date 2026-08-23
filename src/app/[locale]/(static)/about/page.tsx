import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { JsonLd } from '@/components/seo/JsonLd';
import { ShieldCheck, Zap, Layers, Lock, Cpu, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Numvax – Free Online Tools & Utility Platform',
  description: 'Learn about Numvax: a free, privacy-first online utility platform providing batch image compression, PDF editing, QR code generation, unit converters, and calculators.',
  alternates: {
    canonical: 'https://numvax.com/about',
  },
};

export default function AboutPage() {
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
        <Image src="/logo.png" alt="Numvax Logo" width={40} height={40} className="rounded-xl object-contain bg-black shrink-0 shadow-2xs" priority />
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            About Numvax
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium">
            Fast, client-side online tools & utilities platform
          </p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 leading-relaxed text-sm text-neutral-700 shadow-2xs">

        {/* Core Purpose */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">What is Numvax?</h2>
          <p className="leading-relaxed">
            <strong>Numvax</strong> is a free online utility platform providing client-side browser tools for image processing, PDF manipulation, QR code generation, file conversion, financial & health calculators, and developer utilities.
          </p>
          <p className="leading-relaxed">
            Our mission is simple: build fast, accurate, zero-friction tools that run directly inside your web browser without account signups, registration walls, or server-side file uploads.
          </p>
        </section>

        {/* What Numvax Provides */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-neutral-900">What Does Numvax Provide?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl flex flex-col gap-1">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-neutral-900" /> Image Tools & Batch Processing
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Compress up to 50 images at once (JPG, PNG, WebP), resize dimensions, convert image formats, and export batch ZIP archives.
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl flex flex-col gap-1">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-neutral-900" /> PDF Document Utilities
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Merge PDF files, split page ranges, compress PDF size, edit pages, extract images, sign contracts, and convert PDF to Word/JPG.
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl flex flex-col gap-1">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-neutral-900" /> Bulk QR Code Generators
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Generate single or batch QR codes up to 100 links at once with custom center logo branding, error correction, and ZIP export.
              </p>
            </div>

            <div className="p-4 bg-[#FAF8F5] border border-neutral-200/80 rounded-2xl flex flex-col gap-1">
              <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-neutral-900" /> Calculators & Converters
              </span>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Financial loan amortization, percentage calculators, BMI metrics, GPA scales, date duration math, and multi-unit converters.
              </p>
            </div>
          </div>
        </section>

        {/* Who is Numvax for */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">Who is Numvax Useful For?</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600 text-xs sm:text-sm">
            <li><strong>Students & Educators:</strong> Calculate GPA, calculate date differences, format essays, and count words.</li>
            <li><strong>Freelancers & Small Business Owners:</strong> Generate bulk QR codes, edit contract PDFs, and compress batch photos.</li>
            <li><strong>Developers & Marketers:</strong> Format JSON data, encode Base64 strings, generate passwords, and analyze meta tags.</li>
            <li><strong>General Web Users:</strong> Fast, free daily utility tools that work on any smartphone, tablet, or desktop computer.</li>
          </ul>
        </section>

        {/* Privacy First Principles */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-neutral-900" /> Privacy-First Browser Processing
          </h2>
          <p className="leading-relaxed">
            The vast majority of tools on Numvax process your data entirely inside your browser memory using WebAssembly, Canvas API, and JavaScript engines. Your photos, PDF files, passwords, and numbers are never uploaded to our servers or stored in third-party databases.
          </p>
        </section>

        {/* Contact */}
        <section className="pt-4 border-t border-neutral-200 flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-900">Contact & Feedback</h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            Have a tool suggestion or bug report? Reach out directly via our <a href="/contact" className="text-neutral-900 font-bold underline hover:text-neutral-700">Contact page</a> or email <a href="mailto:numvax@gmail.com" className="text-neutral-900 font-bold underline hover:text-neutral-700">Numvax@gmail.com</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
