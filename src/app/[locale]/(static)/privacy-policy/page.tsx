import React from 'react';
import { Metadata } from 'next';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

export const metadata: Metadata = {
  title: 'Privacy Policy - Numvax',
  description: 'Numvax privacy policy and data collection disclosures.',
  alternates: {
    canonical: 'https://Numvax.com/privacy-policy',
  },
};

export default function PrivacyPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://Numvax.com' },
    { name: 'Privacy Policy', url: 'https://Numvax.com/privacy-policy' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
        Privacy Policy
      </h1>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-4 leading-relaxed text-sm text-neutral-600">
        <p>Last updated: August 2026</p>

        <h2 className="text-base font-bold text-neutral-900">1. Data Minimization & Protection</h2>
        <p>
          Numvax values user privacy. All mathematical computations occur strictly in your web browser. We do not store, track, or log the personal numerical figures (e.g. loan amounts, DOB, weight figures) that you enter into calculator forms.
        </p>

        <h2 className="text-base font-bold text-neutral-900">2. Cookies, Analytics & Google Consent Mode v2</h2>
        <p>
          Numvax uses Google Analytics 4 (GA4) to understand website traffic, aggregate user interaction trends, and optimize our tools. We also display compliant advertisements via Google AdSense to keep our services free. 
        </p>
        <p>
          We implement **Google Consent Mode v2**, meaning third-party analytics and advertising cookies are **denied by default** for visitors. They are only loaded and run if you explicitly consent to them via our Consent Banner. The consent parameters we respect are:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1 text-xs">
          <li><code>analytics_storage</code>: Controls analytics cookie storage.</li>
          <li><code>ad_storage</code>: Controls advertising-related cookie storage.</li>
          <li><code>ad_user_data</code>: Controls whether user data is sent to Google for ads measurement.</li>
          <li><code>ad_personalization</code>: Controls personalized ad remarketing.</li>
        </ul>
        <p>
          You can change or revoke your cookie consent selections at any time by clicking the <strong>Cookie Settings</strong> link in our website footer.
        </p>

        <h2 className="text-base font-bold text-neutral-900">3. Local Storage Usage</h2>
        <p>
          Numvax uses browser local storage (`localStorage`) solely for user convenience to save recent calculations, favorite tools, and cookie consent preferences locally on your device.
        </p>
      </div>
    </div>
  );
}
