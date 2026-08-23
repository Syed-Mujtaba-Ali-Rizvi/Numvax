import React from 'react';
import Link from 'next/link';
import { Search, Calculator, ArrowRight, Home, Wrench, FileText, Code, Type, BarChart3, Image as ImageIcon, ArrowLeftRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found (404) - Numvax',
  description: 'The requested page could not be found. Explore free online calculators, unit converters, PDF utilities, and developer tools on Numvax.',
  robots: {
    index: false,
    follow: true,
  },
};

const POPULAR_TOOLS = [
  { name: 'Percentage Calculator', path: '/percentage-calculator', category: 'Math' },
  { name: 'BMI Calculator', path: '/bmi-calculator', category: 'Health' },
  { name: 'Loan Calculator', path: '/loan-calculator', category: 'Financial' },
  { name: 'GPA Calculator', path: '/gpa-calculator', category: 'Education' },
  { name: 'JSON Formatter', path: '/json-formatter', category: 'Developer' },
  { name: 'Word Counter', path: '/word-counter', category: 'Text' },
  { name: 'Merge PDF', path: '/merge-pdf', category: 'PDF' },
  { name: 'QR Code Generator', path: '/qr-code-generator', category: 'Generators' },
];

const CATEGORIES = [
  { name: 'Calculators', href: '/calculators', icon: Calculator },
  { name: 'Developer Tools', href: '/tools/category/developer-tools', icon: Code },
  { name: 'PDF Tools', href: '/tools/category/pdf-tools', icon: FileText },
  { name: 'Text Tools', href: '/tools/category/text-tools', icon: Type },
  { name: 'SEO Tools', href: '/tools/category/seo-tools', icon: BarChart3 },
  { name: 'Image Tools', href: '/tools/category/image-tools', icon: ImageIcon },
  { name: 'Converters', href: '/tools/category/converters', icon: ArrowLeftRight },
  { name: 'Generators', href: '/tools/category/generators', icon: Wrench },
];

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-8">
      {/* 404 Header Badge */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-6xl sm:text-7xl font-extrabold text-neutral-900 tracking-tight font-mono">404</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 max-w-lg leading-relaxed">
          The page or tool you are looking for might have been moved, renamed, or does not exist. Use the search bar below or explore our tools.
        </p>
      </div>

      {/* Search Form */}
      <form action="/search" className="w-full max-w-md relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          name="q"
          placeholder="Search all tools (e.g. Percentage, BMI, JSON...)"
          className="w-full pl-10 pr-24 py-2.5 bg-white border border-neutral-300 rounded-full text-sm text-neutral-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400 placeholder:text-neutral-400"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-full transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full text-xs font-semibold border border-neutral-200 transition-colors"
        >
          <Wrench className="w-4 h-4" />
          <span>Browse Directory</span>
        </Link>
      </div>

      {/* Popular Tools Links */}
      <div className="w-full bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs text-left mt-4 flex flex-col gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Popular Tools</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_TOOLS.map((t) => (
            <Link
              key={t.path}
              href={t.path}
              className="p-3 bg-neutral-50 hover:bg-neutral-900 hover:text-white border border-neutral-200 rounded-xl transition-colors group flex flex-col justify-between gap-2"
            >
              <span className="text-xs font-semibold text-neutral-800 group-hover:text-white line-clamp-1">{t.name}</span>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 group-hover:text-neutral-300">
                <span>{t.category}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tool Categories */}
      <div className="w-full flex flex-col gap-3 text-left">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className="flex items-center gap-2.5 p-3 bg-white border border-neutral-200 rounded-xl hover:border-neutral-900 transition-all group"
              >
                <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-700 group-hover:bg-neutral-900 group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-neutral-800">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
