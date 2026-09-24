import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { getPageContent } from '@/lib/contentService';
import { FileCheck, ShieldAlert, Scale, Ban, AlertCircle, HelpCircle } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent('terms');
  const title = page?.metaTitle || 'Terms of Service - Numvax';
  const description = page?.metaDescription || 'Numvax terms of service, conditions of use, acceptable use policy, and legal agreements.';

  return {
    title,
    description,
    robots: {
      index: !page?.noIndex,
      follow: !page?.noFollow,
    },
    alternates: {
      canonical: page?.canonicalUrl || 'https://numvax.com/terms',
    },
    openGraph: {
      title,
      description,
      url: page?.canonicalUrl || 'https://numvax.com/terms',
      siteName: 'Numvax',
    },
  };
}

export default async function TermsPage() {
  const page = await getPageContent('terms');
  const h1Title = page?.h1Title || 'Terms of Service';

  const breadcrumbs = [
    { name: 'Home', url: 'https://numvax.com' },
    { name: 'Terms of Service', url: 'https://numvax.com/terms' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
          <Scale className="w-8 h-8 text-neutral-900" />
          {h1Title}
        </h1>
        <p className="text-sm text-neutral-500 font-medium">
          Last Updated: August 2026 | Effective Date: August 2026
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 leading-relaxed text-sm text-neutral-700 shadow-2xs">
        
        {/* Section 1: Acceptance */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-neutral-800" />
            1. Agreement to Terms
          </h2>
          <p>
            Welcome to <strong>Numvax</strong> (&quot;Numvax,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), accessible at <Link href="/" className="text-neutral-900 font-semibold underline">https://numvax.com</Link>. By accessing or using our website, online calculators, formatters, PDF utilities, image editors, unit converters, and associated services (collectively, the &quot;Services&quot;), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service (&quot;Terms&quot;) and our <Link href="/privacy-policy" className="text-neutral-900 font-semibold underline">Privacy Policy</Link>.
          </p>
          <p>
            If you do not agree to all of these Terms, you must immediately discontinue use of the Services.
          </p>
        </section>

        {/* Section 2: Nature of Services */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">2. Description of Services &amp; Client-Side Execution</h2>
          <p>
            Numvax provides free, browser-based online utility tools and mathematical calculators for productivity, education, document handling, and technical development.
          </p>
          <p>
            Most of our tools execute strictly within your local browser runtime via WebAssembly, HTML5 Canvas, and JavaScript. We do not require account registration or subscription fees to access standard tools.
          </p>
        </section>

        {/* Section 3: Permitted & Prohibited Conduct */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-600" />
            3. Acceptable Use &amp; Prohibited Activities
          </h2>
          <p>
            You agree to use Numvax only for lawful purposes and in accordance with these Terms. You specifically agree NOT to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-700">
            <li>Engage in any automated scraping, data extraction, harvesting, or systematic crawling of our web pages or tools without prior written consent.</li>
            <li>Use the Services to distribute, transmit, or inject malicious computer viruses, ransomware, trojan horses, worms, keyloggers, or spyware.</li>
            <li>Attempt to bypass, compromise, or circumvent any rate limiting, firewall, or security measures implemented on our servers or APIs.</li>
            <li>Use our developer tools or utilities to create fraudulent documents, facilitate illegal hacking, crack digital rights management (DRM) protections, or engage in unauthorized surveillance.</li>
            <li>Interfere with or disrupt the operation of Numvax or the servers/networks hosting the platform.</li>
            <li>Frame, mirror, or repackage any portion of Numvax within another website or commercial product without express authorization.</li>
          </ul>
        </section>

        {/* Section 4: Educational & Informational Disclaimer */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            4. Educational &amp; Informational Purposes Only
          </h2>
          <p>
            All calculations, estimations, unit conversions, formulas, and content provided on Numvax are provided strictly for <strong>general informational, educational, and estimation purposes only</strong>.
          </p>
          <p>
            Results generated by our financial, medical, or engineering calculators do not constitute formal certified financial, tax, investment, medical, diagnosis, or legal advice. Always consult a qualified professional before making significant life, health, or financial commitments. For more details, review our full <Link href="/disclaimer" className="text-neutral-900 font-semibold underline">Disclaimer</Link>.
          </p>
        </section>

        {/* Section 5: Intellectual Property */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">5. Intellectual Property Rights</h2>
          <p>
            The Numvax website, brand name, logos, original software code, UI designs, layout, editorial text, formulas, worked examples, and documentation are the exclusive property of Numvax and are protected by applicable copyright, trademark, and intellectual property laws.
          </p>
          <p>
            You retain 100% ownership and intellectual property rights over all files, text, PDF documents, and images that you process through our client-side tools. Numvax claims no ownership over your inputs or generated files.
          </p>
        </section>

        {/* Section 6: Third-Party Links & Ads */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">6. Third-Party Advertisements &amp; External Links</h2>
          <p>
            Numvax displays third-party advertisements served by Google AdSense and authorized advertising networks. We do not endorse, guarantee, or assume liability for the accuracy, legality, or quality of products or services promoted in third-party advertisements or external websites linked to from our platform.
          </p>
        </section>

        {/* Section 7: Disclaimer of Warranties */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-neutral-800" />
            7. Disclaimer of Warranties (&quot;AS IS&quot;)
          </h2>
          <p className="text-xs sm:text-sm uppercase tracking-wide font-semibold text-neutral-800">
            THE SERVICES ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY.
          </p>
          <p className="text-xs text-neutral-600">
            Numvax makes no representations or warranties that calculations will be error-free, that document conversion will preserve 100% fidelity in every edge case, or that defects will be corrected immediately.
          </p>
        </section>

        {/* Section 8: Limitation of Liability */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">8. Limitation of Liability</h2>
          <p className="text-xs sm:text-sm text-neutral-700">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL NUMVAX, ITS DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA LOSS, FINANCIAL ERRORS, BUSINESS INTERRUPTION, OR HARDWARE/DEVICE DAMAGE ARISING FROM YOUR ACCESS TO OR INABILITY TO ACCESS THE SERVICES.
          </p>
        </section>

        {/* Section 9: Indemnification */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">9. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless Numvax and its operators from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorney fees) arising out of your violation of these Terms or your misuse of the Services.
          </p>
        </section>

        {/* Section 10: Modifications & Termination */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">10. Modifications to Terms and Services</h2>
          <p>
            We reserve the right to modify, replace, suspend, or discontinue any aspect of our Services or these Terms at any time without prior notice. Your continued use of the Services following the posting of revised Terms constitutes your acceptance of the changes.
          </p>
        </section>

        {/* Section 11: Contact */}
        <section className="pt-4 border-t border-neutral-200 flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-neutral-800" />
            11. Contact Information
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            For questions or inquiries regarding these Terms of Service, please reach out to our legal and support team:
          </p>
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs sm:text-sm flex flex-col gap-1 text-neutral-700">
            <p><strong>Website:</strong> <Link href="/" className="text-neutral-900 underline">Numvax (https://numvax.com)</Link></p>
            <p><strong>Email:</strong> <a href="mailto:numvax@gmail.com" className="text-neutral-900 font-semibold underline">numvax@gmail.com</a></p>
            <p><strong>Support Page:</strong> <Link href="/contact" className="text-neutral-900 font-semibold underline">https://numvax.com/contact</Link></p>
          </div>
        </section>

      </div>
    </div>
  );
}
