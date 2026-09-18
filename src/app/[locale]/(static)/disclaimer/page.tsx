import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { AlertTriangle, DollarSign, Activity, FileCheck2, ShieldAlert, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer - Numvax',
  description: 'Numvax accuracy disclaimer, financial calculations disclaimer, health estimates, and file processing terms.',
  alternates: {
    canonical: 'https://numvax.com/disclaimer',
  },
};

export default function DisclaimerPage() {
  const breadcrumbs = [
    { name: 'Home', url: 'https://numvax.com' },
    { name: 'Disclaimer', url: 'https://numvax.com/disclaimer' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-neutral-900" />
          Legal & Accuracy Disclaimer
        </h1>
        <p className="text-sm text-neutral-500 font-medium">
          Last Updated: August 2026 | Effective Date: August 2026
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 leading-relaxed text-sm text-neutral-700 shadow-2xs">
        
        {/* Section 1: General Disclaimer */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-neutral-800" />
            1. General Educational & Utility Disclaimer
          </h2>
          <p>
            The information, mathematical calculations, converters, tools, and content provided on <strong>Numvax</strong> (<Link href="/" className="text-neutral-900 font-semibold underline">https://numvax.com</Link>) are for <strong>general informational, educational, and estimation purposes only</strong>.
          </p>
          <p>
            While Numvax implements rigorous testing and standard algorithms to ensure maximum precision and mathematical accuracy, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of calculation outputs.
          </p>
        </section>

        {/* Section 2: Financial Disclaimer */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-700" />
            2. Financial Calculators Disclaimer
          </h2>
          <p>
            Our financial calculators (including the Loan Calculator, Discount Calculator, Percentage Calculator, and Mortgage Amortization tools) produce estimated figures based on mathematical compounding models and user-provided inputs.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-700">
            <li><strong>Not Financial or Investment Advice:</strong> Calculations do not constitute certified financial, tax, lending, or legal advice.</li>
            <li><strong>Lender Discrepancies:</strong> Actual loan terms, annual percentage rates (APR), closing fees, property taxes, insurance premiums, and repayment schedules vary by lender and jurisdiction.</li>
            <li><strong>Consult a Professional:</strong> Always verify figures with a certified financial advisor, accountant, or licensed lending officer before signing loan contracts or executing investments.</li>
          </ul>
        </section>

        {/* Section 3: Health & Medical Disclaimer */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            3. Health & Fitness Calculations Disclaimer (BMI)
          </h2>
          <p>
            The Body Mass Index (BMI) Calculator on Numvax utilizes the standard World Health Organization (WHO) adult screening formulas.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-700">
            <li><strong>Not a Medical Diagnosis:</strong> BMI is a general population screening metric comparing weight to height and does NOT measure individual body fat percentage, muscular density, bone structure, or metabolic health.</li>
            <li><strong>Athletes & Special Populations:</strong> BMI calculations may be inaccurate for pregnant individuals, competitive athletes, bodybuilders, children, and seniors.</li>
            <li><strong>Medical Consultation:</strong> Never disregard professional medical advice or delay seeking clinical attention because of something you have calculated on this site. Consult a physician or registered dietitian for clinical health assessments.</li>
          </ul>
        </section>

        {/* Section 4: File Processing & Document Manipulation */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-neutral-800" />
            4. Document & File Processing Integrity
          </h2>
          <p>
            Numvax provides PDF manipulation (merging, splitting, compression, conversion), optical character recognition (OCR), and image tools that process files client-side inside your browser memory.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-700">
            <li><strong>Backup Your Files:</strong> Always maintain original copies of your important documents before converting, editing, or compressing them.</li>
            <li><strong>Formatting Variations:</strong> Complex layout elements, specialized fonts, vector paths, or scanned handwriting may vary in output fidelity during automated conversions (e.g. PDF to Word or Image OCR).</li>
            <li><strong>No Responsibility for Data Loss:</strong> Numvax is not responsible for any accidental corruption, data loss, or visual artifacts arising from file processing on your local machine.</li>
          </ul>
        </section>

        {/* Section 5: Developer & Cryptographic Tools */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-neutral-800" />
            5. Developer Utilities & Cryptographic Tools
          </h2>
          <p>
            Developer tools (such as Hash Generators, Password Generators, Base64 Encoders, and JWT Decoders) are provided for development and testing convenience. While password generators use cryptographically strong client-side pseudorandom number generators (<code>crypto.getRandomValues</code>), you remain solely responsible for the implementation, storage, and security of your credentials and application keys.
          </p>
        </section>

        {/* Section 6: Third-Party Advertisements */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">6. Third-Party Advertisements & Links</h2>
          <p>
            Advertisements displayed on Numvax are served by third-party advertising partners, including Google AdSense. Numvax does not endorse, sponsor, or guarantee any external products, services, or claims advertised on our platform. Clicking external links or advertisements directs you to third-party domains governed by their respective terms and privacy policies.
          </p>
        </section>

        {/* Section 7: Contact */}
        <section className="pt-4 border-t border-neutral-200 flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-900">Questions or Accuracy Feedback?</h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            If you notice a calculation discrepancy or have questions regarding our disclaimers, please notify our engineering team at <a href="mailto:numvax@gmail.com" className="text-neutral-900 font-semibold underline">numvax@gmail.com</a> or submit feedback via our <Link href="/contact" className="text-neutral-900 font-semibold underline">Contact Form</Link>.
          </p>
        </section>

      </div>
    </div>
  );
}
