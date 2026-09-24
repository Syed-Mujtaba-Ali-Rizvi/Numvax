'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Sparkles, HelpCircle } from 'lucide-react';

interface SeoAnalyzerProps {
  title?: string;
  metaDescription?: string;
  focusKeyword?: string;
  h1Title?: string;
  slug?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  ogImage?: string;
  faqCount?: number;
  examplesCount?: number;
  contentLength?: number;
}

export function SeoAnalyzer({
  title = '',
  metaDescription = '',
  focusKeyword = '',
  h1Title = '',
  slug = '',
  canonicalUrl = '',
  noIndex = false,
  ogImage = '',
  faqCount = 0,
  examplesCount = 0,
  contentLength = 0,
}: SeoAnalyzerProps) {
  const keyword = focusKeyword.trim().toLowerCase();

  const checks: Array<{
    id: string;
    label: string;
    passed: boolean;
    warning?: boolean;
    message: string;
    weight: number;
  }> = [];

  // 1. SEO Title Length Check
  const titleLen = title.length;
  if (titleLen >= 35 && titleLen <= 65) {
    checks.push({
      id: 'title-len',
      label: 'SEO Title Length',
      passed: true,
      message: `Optimal length (${titleLen} chars, recommended 40-60).`,
      weight: 15,
    });
  } else if (titleLen > 65) {
    checks.push({
      id: 'title-len',
      label: 'SEO Title Length',
      passed: false,
      warning: true,
      message: `Title is too long (${titleLen} chars). May get truncated in search results.`,
      weight: 15,
    });
  } else if (titleLen > 0) {
    checks.push({
      id: 'title-len',
      label: 'SEO Title Length',
      passed: false,
      warning: true,
      message: `Title is too short (${titleLen} chars). Recommended at least 35 characters.`,
      weight: 15,
    });
  } else {
    checks.push({
      id: 'title-len',
      label: 'SEO Title Length',
      passed: false,
      message: 'SEO Title is missing.',
      weight: 15,
    });
  }

  // 2. Meta Description Check
  const descLen = metaDescription.length;
  if (descLen >= 110 && descLen <= 165) {
    checks.push({
      id: 'desc-len',
      label: 'Meta Description Length',
      passed: true,
      message: `Optimal length (${descLen} chars, recommended 120-160).`,
      weight: 15,
    });
  } else if (descLen > 165) {
    checks.push({
      id: 'desc-len',
      label: 'Meta Description Length',
      passed: false,
      warning: true,
      message: `Description is too long (${descLen} chars). Google may truncate after ~160 chars.`,
      weight: 15,
    });
  } else if (descLen > 0) {
    checks.push({
      id: 'desc-len',
      label: 'Meta Description Length',
      passed: false,
      warning: true,
      message: `Description is too short (${descLen} chars). Recommended at least 110 characters.`,
      weight: 15,
    });
  } else {
    checks.push({
      id: 'desc-len',
      label: 'Meta Description Length',
      passed: false,
      message: 'Meta Description is missing.',
      weight: 15,
    });
  }

  // 3. Focus Keyword Presence
  if (keyword) {
    const inTitle = title.toLowerCase().includes(keyword);
    const inDesc = metaDescription.toLowerCase().includes(keyword);
    const inH1 = h1Title.toLowerCase().includes(keyword);
    const inSlug = slug.toLowerCase().replace(/-/g, ' ').includes(keyword.replace(/-/g, ' '));

    checks.push({
      id: 'kw-title',
      label: 'Focus Keyword in SEO Title',
      passed: inTitle,
      message: inTitle ? 'Focus keyword found in SEO Title.' : `Focus keyword "${keyword}" is missing from SEO Title.`,
      weight: 15,
    });

    checks.push({
      id: 'kw-desc',
      label: 'Focus Keyword in Meta Description',
      passed: inDesc,
      message: inDesc ? 'Focus keyword found in Meta Description.' : `Focus keyword "${keyword}" is missing from Meta Description.`,
      weight: 10,
    });

    checks.push({
      id: 'kw-h1',
      label: 'Focus Keyword in H1 Heading',
      passed: inH1,
      message: inH1 ? 'Focus keyword found in H1 Heading.' : `Focus keyword "${keyword}" is missing from H1 Heading.`,
      weight: 10,
    });

    checks.push({
      id: 'kw-slug',
      label: 'Focus Keyword in URL Slug',
      passed: inSlug,
      warning: !inSlug,
      message: inSlug ? 'Focus keyword matches URL slug.' : `Focus keyword "${keyword}" not reflected in URL slug.`,
      weight: 5,
    });
  } else {
    checks.push({
      id: 'kw-missing',
      label: 'Focus Keyword',
      passed: false,
      message: 'No focus keyword set. Define a target primary search term.',
      weight: 25,
    });
  }

  // 4. Indexing & Canonical
  if (noIndex) {
    checks.push({
      id: 'indexing',
      label: 'Indexing Status',
      passed: false,
      warning: true,
      message: 'Page is set to NoIndex (hidden from Google search engines).',
      weight: 5,
    });
  } else {
    checks.push({
      id: 'indexing',
      label: 'Indexing Status',
      passed: true,
      message: 'Page is indexable (Index, Follow).',
      weight: 5,
    });
  }

  // 5. Open Graph Image
  if (ogImage && ogImage.length > 3) {
    checks.push({
      id: 'og-image',
      label: 'Social Share Image',
      passed: true,
      message: 'OG Social preview image configured.',
      weight: 5,
    });
  } else {
    checks.push({
      id: 'og-image',
      label: 'Social Share Image',
      passed: false,
      warning: true,
      message: 'OG Image is missing. Social links will not show an image preview card.',
      weight: 5,
    });
  }

  // 6. FAQ Rich Snippets
  if (faqCount >= 3) {
    checks.push({
      id: 'faqs',
      label: 'FAQ Schema Snippets',
      passed: true,
      message: `${faqCount} FAQs configured for Google FAQPage rich snippet eligibility.`,
      weight: 10,
    });
  } else if (faqCount > 0) {
    checks.push({
      id: 'faqs',
      label: 'FAQ Schema Snippets',
      passed: true,
      warning: true,
      message: `Only ${faqCount} FAQs. Recommended to have at least 3 for best rich snippet results.`,
      weight: 5,
    });
  } else {
    checks.push({
      id: 'faqs',
      label: 'FAQ Schema Snippets',
      passed: false,
      warning: true,
      message: 'No FAQ items added. Adding FAQs boosts organic CTR and rich snippet ranking.',
      weight: 5,
    });
  }

  // Calculate Final Score
  const totalPossible = checks.reduce((sum, c) => sum + c.weight, 0);
  const earned = checks.reduce((sum, c) => sum + (c.passed ? c.weight : c.warning ? c.weight * 0.4 : 0), 0);
  const finalScore = Math.min(100, Math.max(0, Math.round((earned / totalPossible) * 100)));

  const passedChecks = checks.filter((c) => c.passed && !c.warning);
  const warningChecks = checks.filter((c) => c.warning);
  const criticalChecks = checks.filter((c) => !c.passed && !c.warning);

  return (
    <div className="flex flex-col gap-4 p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs">
      {/* Header with Score */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-neutral-100 text-neutral-800 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">SEO Analyzer</h3>
            <p className="text-[11px] text-neutral-400">Internal checklist & on-page compliance</p>
          </div>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xl font-black text-neutral-900">{finalScore}/100</div>
            <div
              className={`text-[10px] font-bold uppercase tracking-wider ${
                finalScore >= 80 ? 'text-green-600' : finalScore >= 50 ? 'text-amber-600' : 'text-red-500'
              }`}
            >
              {finalScore >= 80 ? 'Excellent' : finalScore >= 50 ? 'Needs Work' : 'Poor'}
            </div>
          </div>
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-neutral-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  finalScore >= 80 ? 'text-green-500' : finalScore >= 50 ? 'text-amber-500' : 'text-red-500'
                }
                strokeDasharray={`${finalScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold text-neutral-900">{finalScore}</span>
          </div>
        </div>
      </div>

      {/* Critical Issues */}
      {criticalChecks.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Critical Issues ({criticalChecks.length})
          </div>
          <div className="flex flex-col gap-1.5">
            {criticalChecks.map((c) => (
              <div key={c.id} className="p-2.5 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{c.label}: </span>
                  {c.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warningChecks.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Optimization Suggestions ({warningChecks.length})
          </div>
          <div className="flex flex-col gap-1.5">
            {warningChecks.map((c) => (
              <div key={c.id} className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{c.label}: </span>
                  {c.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passed Checks */}
      <div className="flex flex-col gap-2 mt-1">
        <div className="text-[11px] font-bold text-green-700 uppercase tracking-wider flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" /> Passed Checks ({passedChecks.length})
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {passedChecks.map((c) => (
            <div key={c.id} className="p-2 bg-neutral-50 border border-neutral-200/80 rounded-xl text-[11px] text-neutral-700 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <span className="truncate">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
