import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { getPageContent } from '@/lib/contentService';
import { ShieldCheck, Lock, Eye, FileText, Database, Globe } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent('privacy-policy');
  const title = page?.metaTitle || 'Privacy Policy - Numvax';
  const description = page?.metaDescription || 'Numvax comprehensive privacy policy, Google AdSense disclosures, cookie usage, Google Consent Mode v2, and GDPR/CCPA data protection rights.';

  return {
    title,
    description,
    robots: {
      index: !page?.noIndex,
      follow: !page?.noFollow,
    },
    alternates: {
      canonical: page?.canonicalUrl || 'https://numvax.com/privacy-policy',
    },
    openGraph: {
      title,
      description,
      url: page?.canonicalUrl || 'https://numvax.com/privacy-policy',
      siteName: 'Numvax',
    },
  };
}

export default async function PrivacyPage() {
  const page = await getPageContent('privacy-policy');
  const h1Title = page?.h1Title || 'Privacy Policy';

  const breadcrumbs = [
    { name: 'Home', url: 'https://numvax.com' },
    { name: 'Privacy Policy', url: 'https://numvax.com/privacy-policy' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          {h1Title}
        </h1>
        <p className="text-sm text-neutral-500 font-medium">
          Last Updated: August 2026 | Effective Date: August 2026
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 leading-relaxed text-sm text-neutral-700 shadow-2xs">
        
        {/* Section 1: Overview & Architecture */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            1. Overview &amp; Privacy-First Architecture
          </h2>
          <p>
            At <strong>Numvax</strong> (accessible at <Link href="/" className="text-neutral-900 font-semibold underline hover:text-neutral-700">https://numvax.com</Link>), we believe that privacy is a fundamental human right. This Privacy Policy explains our practices regarding the collection, use, disclosure, and protection of information when you access our website, calculators, converters, image utilities, PDF tools, and developer utilities.
          </p>
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-950 flex flex-col gap-1">
            <strong className="font-bold flex items-center gap-1.5 text-emerald-900">
              <Lock className="w-4 h-4" /> Client-Side Processing Guarantee:
            </strong>
            <span>
              The vast majority of our online calculators, PDF manipulation tools, image compressors, and formatters execute <strong>100% client-side inside your browser</strong> using WebAssembly, Canvas API, and local JavaScript engines. Your uploaded documents, confidential files, financial inputs, passwords, and photos are never uploaded to our servers, never stored in databases, and never inspected by third parties.
            </span>
          </div>
        </section>

        {/* Section 2: Advertising & Google AdSense Disclosures */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-neutral-800" />
            2. Google AdSense &amp; Third-Party Advertising Disclosures
          </h2>
          <p>
            Numvax is funded through advertising revenue to keep all online tools and calculators 100% free and accessible without subscription fees or paywalls. We partner with <strong>Google AdSense</strong> and affiliated third-party advertising networks to display relevant advertisements.
          </p>
          <p>
            Please take note of the following mandatory disclosures regarding how Google and third-party advertising partners serve ads on our site:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-neutral-700">
            <li>
              <strong>Third-Party Vendor Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to your website or other websites on the Internet.
            </li>
            <li>
              <strong>Advertising Cookies:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve advertisements to our users based on their visits to Numvax and/or other sites across the World Wide Web.
            </li>
            <li>
              <strong>Opting Out of Personalized Advertising:</strong> Users may opt out of personalized advertising by visiting the <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-bold underline hover:text-neutral-700">Google Ads Settings</a>. Alternatively, you can opt out of third-party vendor use of cookies for personalized advertising by visiting the Network Advertising Initiative (NAI) or Digital Advertising Alliance (DAA) opt-out portals at <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-bold underline hover:text-neutral-700">www.aboutads.info/choices</a> or <a href="https://youradchoices.com" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-bold underline hover:text-neutral-700">youradchoices.com</a>.
            </li>
            <li>
              <strong>Google Partner Data Policy:</strong> For comprehensive information on how Google collects and processes data when you use partner websites and applications, please review the official Google disclosure at <a href="https://www.google.com/policies/privacy/partners/" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-bold underline hover:text-neutral-700">How Google uses data when you use our partners&apos; sites or apps</a>.
            </li>
          </ul>
        </section>

        {/* Section 3: Google Consent Mode v2 & Cookies */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-neutral-800" />
            3. Google Consent Mode v2 &amp; Cookie Policy
          </h2>
          <p>
            To strictly respect global privacy regulations including the European General Data Protection Regulation (GDPR) and the EU User Consent Policy, Numvax implements <strong>Google Consent Mode v2</strong>.
          </p>
          <p>
            When you first arrive on Numvax, non-essential advertising and analytics cookies are <strong>denied by default</strong>. They are only activated if you explicitly grant permission through our Consent Banner.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <strong className="text-neutral-900 block font-bold mb-1">analytics_storage</strong>
              <p className="text-neutral-600">Controls cookie storage for aggregate traffic analytics (Google Analytics 4).</p>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <strong className="text-neutral-900 block font-bold mb-1">ad_storage</strong>
              <p className="text-neutral-600">Controls storage of cookies related to advertising delivery and verification.</p>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <strong className="text-neutral-900 block font-bold mb-1">ad_user_data</strong>
              <p className="text-neutral-600">Controls whether user data is transmitted to Google for online advertising purposes.</p>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
              <strong className="text-neutral-900 block font-bold mb-1">ad_personalization</strong>
              <p className="text-neutral-600">Controls personalized advertising targeting and remarketing signals.</p>
            </div>
          </div>
          <p className="text-xs text-neutral-600 mt-1">
            You can modify, update, or revoke your cookie preferences at any time by clicking the <strong>Cookie Settings</strong> button located in our website footer or visiting our <Link href="/cookie-policy" className="text-neutral-900 font-semibold underline">Cookie Policy</Link>.
          </p>
        </section>

        {/* Section 4: Analytics (Google Analytics 4) */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">4. Web Analytics (Google Analytics 4)</h2>
          <p>
            We use Google Analytics 4 (GA4) to understand how visitors interact with our platform, such as popular tools, browser compatibility, page load latency, and geographic usage trends. GA4 collects pseudonymized data such as device model, screen resolution, operating system, and approximate geographic region (city level). IP addresses are automatically anonymized and never stored in cleartext.
          </p>
        </section>

        {/* Section 5: Local Storage & Device Data */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">5. Browser Local Storage &amp; Device Data</h2>
          <p>
            Numvax utilizes standard web browser <code>localStorage</code> solely to improve your user experience on your device. We use local storage for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-neutral-600">
            <li>Saving your cookie consent selections and privacy preferences.</li>
            <li>Storing your recent calculation history locally on your device (e.g. recent GPA or loan calculations for quick retrieval).</li>
            <li>Remembering your tool favorites and theme preferences.</li>
          </ul>
          <p className="text-xs text-neutral-500">
            Local storage is stored exclusively on your device and is never transmitted to our backend infrastructure.
          </p>
        </section>

        {/* Section 6: Children's Privacy (COPPA) */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">6. Children&apos;s Privacy (COPPA Compliance)</h2>
          <p>
            Protecting the privacy of children is of paramount importance. Numvax complies with the Children&apos;s Online Privacy Protection Act (COPPA). Our website and online tools are designed for general audiences and are not directed at children under the age of 13.
          </p>
          <p>
            We do not knowingly collect, request, or maintain personally identifiable information from children under 13. If you believe a child under 13 has provided personal data through our contact form, please contact us immediately at <a href="mailto:numvax@gmail.com" className="text-neutral-900 font-bold underline">numvax@gmail.com</a>, and we will promptly delete such information.
          </p>
        </section>

        {/* Section 7: GDPR & European Data Protection Rights */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-neutral-800" />
            7. Your Rights under GDPR (European Union / UK)
          </h2>
          <p>
            If you reside within the European Economic Area (EEA) or the United Kingdom, you hold specific statutory data protection rights under the General Data Protection Regulation (GDPR / UK GDPR):
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-700">
            <li><strong>Right to Access:</strong> You have the right to request copies of your personal data.</li>
            <li><strong>Right to Rectification:</strong> You have the right to request correction of inaccurate or incomplete information.</li>
            <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You have the right to request deletion of your personal data under certain conditions.</li>
            <li><strong>Right to Restrict Processing:</strong> You have the right to request restriction of personal data processing.</li>
            <li><strong>Right to Object:</strong> You have the right to object to our processing of your personal data, including for direct marketing purposes.</li>
            <li><strong>Right to Data Portability:</strong> You have the right to receive your personal data in a structured, commonly used format.</li>
          </ul>
        </section>

        {/* Section 8: California Privacy Rights (CCPA / CPRA) */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">8. California Privacy Rights (CCPA / CPRA)</h2>
          <p>
            If you are a California resident, the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA) provides you with specific privacy rights:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-700">
            <li><strong>Right to Know &amp; Access:</strong> The right to request disclosure of categories and specific pieces of personal information collected.</li>
            <li><strong>Right to Delete:</strong> The right to request deletion of personal information collected from you.</li>
            <li><strong>Right to Opt-Out of Sale or Sharing:</strong> Numvax does not sell personal data for monetary compensation. To opt out of third-party cookie sharing for cross-context behavioral advertising, you can adjust your cookie settings via our on-site banner or use Global Privacy Control (GPC) browser signals.</li>
            <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA/CPRA rights.</li>
          </ul>
        </section>

        {/* Section 9: Security of Your Data */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">9. Data Security</h2>
          <p>
            We implement industry-standard SSL/TLS encryption across our entire platform to ensure all web traffic between your device and our servers is secured. However, remember that no method of transmission over the Internet is 100% secure. Because calculations and document edits occur locally on your machine, your exposure to server-side breaches on Numvax is minimized by design.
          </p>
        </section>

        {/* Section 10: External Links */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">10. Third-Party Links &amp; External Content</h2>
          <p>
            Our website may contain links to third-party websites or services that are not owned or operated by Numvax. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </p>
        </section>

        {/* Section 11: Policy Updates */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">11. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy periodically to reflect changes in regulatory requirements or platform features. We will notify users of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; timestamp at the top of the policy.
          </p>
        </section>

        {/* Section 12: Contact Information */}
        <section className="pt-4 border-t border-neutral-200 flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-neutral-800" />
            12. Contact &amp; Data Protection Officer Inquiries
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            If you have any questions, concerns, or requests regarding this Privacy Policy or wish to exercise your data protection rights, please contact our privacy team:
          </p>
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-xs sm:text-sm flex flex-col gap-1 text-neutral-700">
            <p><strong>Website:</strong> <Link href="/" className="text-neutral-900 underline">Numvax (https://numvax.com)</Link></p>
            <p><strong>Email:</strong> <a href="mailto:numvax@gmail.com" className="text-neutral-900 font-semibold underline">numvax@gmail.com</a></p>
            <p><strong>Contact Form:</strong> <Link href="/contact" className="text-neutral-900 font-semibold underline">https://numvax.com/contact</Link></p>
            <p><strong>Response Timeframe:</strong> We acknowledge and respond to all privacy and data rights requests within 30 days.</p>
          </div>
        </section>

      </div>
    </div>
  );
}
