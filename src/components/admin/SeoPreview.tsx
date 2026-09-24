'use strict';
'use client';

import React, { useState } from 'react';
import { Eye, Monitor, Smartphone, Share2, Globe } from 'lucide-react';

interface SeoPreviewProps {
  title?: string;
  metaDescription?: string;
  slug?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export function SeoPreview({
  title = 'Page Title | Numvax',
  metaDescription = 'Page description will appear here in search engine results.',
  slug = 'example-tool',
  ogTitle,
  ogDescription,
  ogImage = '/og-image.jpg',
  twitterTitle,
  twitterDescription,
  twitterImage = '/og-image.jpg',
}: SeoPreviewProps) {
  const [previewTab, setPreviewTab] = useState<'google-desktop' | 'google-mobile' | 'facebook' | 'twitter'>('google-desktop');

  const finalOgTitle = ogTitle || title;
  const finalOgDesc = ogDescription || metaDescription;
  const finalTwTitle = twitterTitle || ogTitle || title;
  const finalTwDesc = twitterDescription || ogDescription || metaDescription;

  const displayUrl = `https://numvax.com/${slug === 'homepage' ? '' : slug}`;

  return (
    <div className="flex flex-col gap-3 p-5 bg-white border border-neutral-200 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-neutral-700" />
          <h3 className="text-sm font-bold text-neutral-900">Live SERP &amp; Social Preview</h3>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPreviewTab('google-desktop')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              previewTab === 'google-desktop' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Monitor className="w-3 h-3" /> Desktop
          </button>
          <button
            type="button"
            onClick={() => setPreviewTab('google-mobile')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              previewTab === 'google-mobile' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Smartphone className="w-3 h-3" /> Mobile
          </button>
          <button
            type="button"
            onClick={() => setPreviewTab('facebook')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              previewTab === 'facebook' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Share2 className="w-3 h-3" /> Facebook/OG
          </button>
          <button
            type="button"
            onClick={() => setPreviewTab('twitter')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              previewTab === 'twitter' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span className="font-bold text-[11px]">X</span> Twitter
          </button>
        </div>
      </div>

      {/* 1. Google Desktop Preview */}
      {previewTab === 'google-desktop' && (
        <div className="p-4 bg-white border border-neutral-200 rounded-xl font-sans max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-neutral-900 flex items-center justify-center text-[9px] font-bold text-white">N</div>
            <div className="flex flex-col">
              <span className="text-[12px] text-neutral-800 font-medium leading-none">Numvax</span>
              <span className="text-[11px] text-neutral-500 truncate leading-tight">{displayUrl}</span>
            </div>
          </div>
          <h4 className="text-base text-[#1a0dab] font-normal hover:underline cursor-pointer line-clamp-1 leading-snug">
            {title || 'Page Title Here'}
          </h4>
          <p className="text-xs text-[#4d5156] mt-1 line-clamp-2 leading-relaxed">
            {metaDescription || 'Add a meta description to see how it will appear on Google search result pages.'}
          </p>
        </div>
      )}

      {/* 2. Google Mobile Preview */}
      {previewTab === 'google-mobile' && (
        <div className="p-4 bg-white border border-neutral-200 rounded-2xl font-sans max-w-sm mx-auto shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-bold text-white">N</div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-neutral-800 leading-none">Numvax</span>
              <span className="text-[10px] text-neutral-400 truncate leading-tight mt-0.5">{displayUrl}</span>
            </div>
          </div>
          <h4 className="text-sm text-[#1a0dab] font-medium hover:underline cursor-pointer line-clamp-2 leading-tight">
            {title || 'Page Title Here'}
          </h4>
          <p className="text-[11px] text-[#4d5156] mt-1.5 line-clamp-3 leading-snug">
            {metaDescription || 'Add a meta description to see how it will appear on Google search result pages.'}
          </p>
        </div>
      )}

      {/* 3. Facebook / Open Graph Preview */}
      {previewTab === 'facebook' && (
        <div className="border border-neutral-200 rounded-xl overflow-hidden max-w-md bg-neutral-50 shadow-xs">
          <div className="w-full h-44 bg-neutral-200 flex items-center justify-center relative overflow-hidden">
            {ogImage ? (
              <img src={ogImage} alt="OG Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-neutral-400 font-semibold">1200 × 630 OG Image</span>
            )}
          </div>
          <div className="p-3 bg-white border-t border-neutral-200">
            <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">NUMVAX.COM</div>
            <div className="text-xs font-bold text-neutral-900 line-clamp-1 mt-0.5">{finalOgTitle}</div>
            <div className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{finalOgDesc}</div>
          </div>
        </div>
      )}

      {/* 4. Twitter / X Card Preview */}
      {previewTab === 'twitter' && (
        <div className="border border-neutral-200 rounded-2xl overflow-hidden max-w-md bg-white shadow-xs">
          <div className="w-full h-44 bg-neutral-200 flex items-center justify-center relative overflow-hidden">
            {twitterImage || ogImage ? (
              <img src={twitterImage || ogImage} alt="Twitter Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-neutral-400 font-semibold">Summary Large Image</span>
            )}
          </div>
          <div className="p-3">
            <div className="text-xs font-bold text-neutral-900 line-clamp-1">{finalTwTitle}</div>
            <div className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">{finalTwDesc}</div>
            <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
              <Globe className="w-3 h-3" /> numvax.com
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
