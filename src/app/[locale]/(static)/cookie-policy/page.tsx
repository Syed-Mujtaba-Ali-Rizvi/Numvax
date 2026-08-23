import React from 'react';
import { Metadata } from 'next';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

export const metadata: Metadata = {
  title: 'Cookie Policy - Numvax',
  description: 'Numvax cookie policy and Google Consent Mode v2 disclosures.',
  alternates: {
    canonical: 'https://numvax.com/cookie-policy',
  },
};

export default function CookiePolicyPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://numvax.com' },
    { name: 'Cookie Policy', url: 'https://numvax.com/cookie-policy' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
        Cookie Policy
      </h1>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-4 leading-relaxed text-sm text-neutral-600">
        <p>Last updated: August 2026</p>

        <p>
          This Cookie Policy explains how Numvax uses cookies and similar tracking technologies when you visit our website.
        </p>

        <h2 className="text-base font-bold text-neutral-900">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your computer or mobile device by websites you visit. They are widely used to make websites work properly, provide a more convenient user experience, and supply statistical metrics to site owners.
        </p>

        <h2 className="text-base font-bold text-neutral-900">2. Types of Cookies We Use</h2>
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-xs font-bold text-neutral-900">A. Essential Cookies (Strictly Necessary)</h3>
            <p className="text-xs text-neutral-600 mt-1">
              These cookies are essential for you to browse our website and use core security and preferences features. They are always active.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900">B. Analytics Cookies (Google Analytics 4)</h3>
            <p className="text-xs text-neutral-600 mt-1">
              Used to understand how visitors interact with our tools and pages, measuring metrics like page loads, device type, and exit rates. We only use these if you select &quot;Accept All&quot; or enable them in your settings.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900">C. Advertising & Personalization Cookies (Google AdSense)</h3>
            <p className="text-xs text-neutral-600 mt-1">
              Used by Google AdSense to serve relevant advertisements to users and measure ad clicks and impressions securely.
            </p>
          </div>
        </div>

        <h2 className="text-base font-bold text-neutral-900">3. Google Consent Mode v2</h2>
        <p>
          We strictly implement **Google Consent Mode v2**. When you visit our website, non-essential cookies (Analytics, Advertising, and Ads personalization) remain **blocked by default** until you choose to grant them.
        </p>

        <h2 className="text-base font-bold text-neutral-900">4. How to Manage Cookies</h2>
        <p>
          You can customize or reset your consent choices at any time:
        </p>
        <ol className="list-decimal pl-5 flex flex-col gap-1 text-xs">
          <li>Scroll to the bottom of any page on our site.</li>
          <li>Click the <strong>Cookie Settings</strong> link in the footer.</li>
          <li>Adjust the toggles for Analytics, Advertising, and Ad Personalization.</li>
          <li>Click <strong>Save Preferences</strong>.</li>
        </ol>
      </div>
    </div>
  );
}
