import React from 'react';
import { Metadata } from 'next';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

export const metadata: Metadata = {
  title: 'Terms of Service - Numvax',
  description: 'Numvax terms of service and usage conditions.',
  alternates: {
    canonical: 'https://Numvax.com/terms',
  },
};

export default function TermsPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://Numvax.com' },
    { name: 'Terms of Service', url: 'https://Numvax.com/terms' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
        Terms of Service
      </h1>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-4 leading-relaxed text-sm text-neutral-600">
        <p>Last updated: August 2026</p>

        <h2 className="text-base font-bold text-neutral-900">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Numvax ("the Site"), you agree to be bound by these Terms of Service.
        </p>

        <h2 className="text-base font-bold text-neutral-900">2. Educational & Informational Purpose</h2>
        <p>
          All calculators and content on Numvax are provided "as is" for general informational and educational purposes only. Results do not constitute legal, medical, or formal financial advice.
        </p>
      </div>
    </div>
  );
}
