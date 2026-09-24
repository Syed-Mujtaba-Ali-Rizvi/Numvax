import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { getPageContent } from '@/lib/contentService';
import { Cookie, ShieldCheck, Settings, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent('cookie-policy');
  const title = page?.metaTitle || 'Cookie Policy - Numvax';
  const description = page?.metaDescription || 'Numvax comprehensive cookie policy, Google AdSense disclosures, Google Consent Mode v2, and cookie preference management.';

  return {
    title,
    description,
    robots: {
      index: !page?.noIndex,
      follow: !page?.noFollow,
    },
    alternates: {
      canonical: page?.canonicalUrl || 'https://numvax.com/cookie-policy',
    },
    openGraph: {
      title,
      description,
      url: page?.canonicalUrl || 'https://numvax.com/cookie-policy',
      siteName: 'Numvax',
    },
  };
}

export default async function CookiePolicyPage() {
  const page = await getPageContent('cookie-policy');
  const h1Title = page?.h1Title || 'Cookie Policy';

  const breadcrumbs = [
    { name: 'Home', url: 'https://numvax.com' },
    { name: 'Cookie Policy', url: 'https://numvax.com/cookie-policy' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-3">
          <Cookie className="w-8 h-8 text-neutral-900" />
          {h1Title}
        </h1>
        <p className="text-sm text-neutral-500 font-medium">
          Last Updated: August 2026 | Effective Date: August 2026
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-8 leading-relaxed text-sm text-neutral-700 shadow-2xs">
        
        {/* Section 1: What Are Cookies */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">1. What Are Cookies and Tracking Technologies?</h2>
          <p>
            Cookies are small alphanumeric text files placed on your computer, smartphone, or tablet when you visit websites. Cookies allow web applications to identify your device, store preferences, ensure security, and understand how the site is utilized.
          </p>
          <p>
            In addition to cookies, Numvax may use similar browser storage mechanisms such as <code>localStorage</code> and <code>sessionStorage</code> to store client-side calculation data and user interface states without transmitting information over the network.
          </p>
        </section>

        {/* Section 2: Why We Use Cookies */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900">2. Why Does Numvax Use Cookies?</h2>
          <p>
            Numvax uses cookies and tracking technologies for the following primary objectives:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-700">
            <li><strong>Site Operation &amp; Security:</strong> To enable core site navigation, prevent fraud, and verify security integrity.</li>
            <li><strong>Remembering Preferences:</strong> To record your cookie consent choices and user interface preferences locally.</li>
            <li><strong>Analytics &amp; Performance:</strong> To measure aggregate visitor volume, popular tools, and identify performance bottlenecks via Google Analytics 4.</li>
            <li><strong>Monetization &amp; Advertising:</strong> To serve non-intrusive advertisements via Google AdSense and authorized ad networks, supporting free tool availability.</li>
          </ul>
        </section>

        {/* Section 3: Detailed Cookie Classification Table */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-neutral-900">3. Categories of Cookies We Use</h2>

          <div className="space-y-4">
            {/* Category A: Essential */}
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> A. Strictly Necessary Cookies
                </span>
                <span className="px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded-full text-[10px] font-bold uppercase">Always Active</span>
              </div>
              <p className="text-xs text-neutral-600">
                These cookies are required for technical operation, routing, and saving your cookie consent preferences. They cannot be turned off.
              </p>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs border border-neutral-200 bg-white rounded-lg">
                  <thead className="bg-neutral-100 text-neutral-800 font-semibold">
                    <tr>
                      <th className="p-2 border-b">Cookie / Key</th>
                      <th className="p-2 border-b">Provider</th>
                      <th className="p-2 border-b">Purpose</th>
                      <th className="p-2 border-b">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-600">
                    <tr>
                      <td className="p-2 font-mono">numvax_consent_preferences</td>
                      <td className="p-2">Numvax (Local Storage)</td>
                      <td className="p-2">Stores user consent selections for Google Consent Mode v2</td>
                      <td className="p-2">12 Months</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-mono">NEXT_LOCALE</td>
                      <td className="p-2">Numvax</td>
                      <td className="p-2">Maintains your selected language locale</td>
                      <td className="p-2">1 Year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category B: Analytics */}
            <div className="p-4 bg-white border border-neutral-200 rounded-2xl flex flex-col gap-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-neutral-700" /> B. Performance &amp; Analytics Cookies (Google Analytics 4)
                </span>
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-full text-[10px] font-semibold">Consent Required</span>
              </div>
              <p className="text-xs text-neutral-600">
                Help us understand how visitors discover and use our tools, measure page load speeds, and spot navigation issues.
              </p>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs border border-neutral-200 bg-white rounded-lg">
                  <thead className="bg-neutral-100 text-neutral-800 font-semibold">
                    <tr>
                      <th className="p-2 border-b">Cookie</th>
                      <th className="p-2 border-b">Provider</th>
                      <th className="p-2 border-b">Purpose</th>
                      <th className="p-2 border-b">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-600">
                    <tr>
                      <td className="p-2 font-mono">_ga</td>
                      <td className="p-2">Google Analytics</td>
                      <td className="p-2">Distinguishes unique visitors for aggregate site statistics</td>
                      <td className="p-2">2 Years</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-mono">_ga_*</td>
                      <td className="p-2">Google Analytics</td>
                      <td className="p-2">Maintains session state and event telemetry</td>
                      <td className="p-2">2 Years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category C: Advertising & AdSense */}
            <div className="p-4 bg-white border border-neutral-200 rounded-2xl flex flex-col gap-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-neutral-700" /> C. Advertising &amp; Targeting Cookies (Google AdSense)
                </span>
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-full text-[10px] font-semibold">Consent Required</span>
              </div>
              <p className="text-xs text-neutral-600">
                Set by Google AdSense and third-party advertising partners to serve relevant advertisements, prevent ad fraud, and measure ad viewability.
              </p>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs border border-neutral-200 bg-white rounded-lg">
                  <thead className="bg-neutral-100 text-neutral-800 font-semibold">
                    <tr>
                      <th className="p-2 border-b">Cookie</th>
                      <th className="p-2 border-b">Provider</th>
                      <th className="p-2 border-b">Purpose</th>
                      <th className="p-2 border-b">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-600">
                    <tr>
                      <td className="p-2 font-mono">__gads / __gpi</td>
                      <td className="p-2">Google AdSense</td>
                      <td className="p-2">Measures ad impressions and user interactions with ad units</td>
                      <td className="p-2">13 Months</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-mono">IDE / test_cookie</td>
                      <td className="p-2">Google DoubleClick</td>
                      <td className="p-2">Used for ad targeting, frequency capping, and reporting</td>
                      <td className="p-2">1 Year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Google Consent Mode v2 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-neutral-800" />
            4. Google Consent Mode v2 Implementation
          </h2>
          <p>
            Numvax complies fully with the European Union User Consent Policy by integrating <strong>Google Consent Mode v2</strong>. When you visit our website:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-neutral-700">
            <li><code>analytics_storage</code>: Denied by default. Granted only upon explicit user consent.</li>
            <li><code>ad_storage</code>: Denied by default. Granted only upon explicit user consent.</li>
            <li><code>ad_user_data</code>: Denied by default. Controls transmission of advertising telemetry to Google.</li>
            <li><code>ad_personalization</code>: Denied by default. Controls interest-based remarketing and targeting.</li>
          </ul>
        </section>

        {/* Section 5: How to Manage and Control Cookies */}
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-neutral-900">5. How to Manage and Disable Cookies</h2>
          <p>
            You have full control over cookie usage on Numvax through multiple methods:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col gap-2">
              <strong className="text-sm font-bold text-neutral-900">1. On-Site Consent Settings</strong>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Click the <strong>Cookie Settings</strong> button at the bottom of our footer at any time to open our preference modal and toggle analytics or advertising cookies on or off.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col gap-2">
              <strong className="text-sm font-bold text-neutral-900">2. Industry Opt-Out Portals</strong>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Opt out of personalized advertising globally via:
              </p>
              <div className="flex flex-col gap-1 text-xs">
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-semibold underline flex items-center gap-1">
                  Google Ads Settings <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-semibold underline flex items-center gap-1">
                  DAA Consumer Choice <ExternalLink className="w-3 h-3" />
                </a>
                <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-neutral-900 font-semibold underline flex items-center gap-1">
                  Your Online Choices (EU) <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col gap-2">
            <strong className="text-sm font-bold text-neutral-900">3. Web Browser Cookie Settings</strong>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Most web browsers allow you to manage or block cookies through browser preferences:
            </p>
            <ul className="list-disc pl-5 text-xs text-neutral-600 space-y-1">
              <li><strong>Google Chrome:</strong> Settings &rarr; Privacy and security &rarr; Third-party cookies.</li>
              <li><strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Enhanced Tracking Protection.</li>
              <li><strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Block all cookies.</li>
              <li><strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies.</li>
            </ul>
          </div>
        </section>

        {/* Section 6: Contact */}
        <section className="pt-4 border-t border-neutral-200 flex flex-col gap-2">
          <h2 className="text-lg font-bold text-neutral-900">Questions Regarding Cookies?</h2>
          <p className="text-xs sm:text-sm text-neutral-600">
            For further details regarding our data collection and privacy commitments, please review our <Link href="/privacy-policy" className="text-neutral-900 font-semibold underline">Privacy Policy</Link> or email us at <a href="mailto:numvax@gmail.com" className="text-neutral-900 font-semibold underline">numvax@gmail.com</a>.
          </p>
        </section>

      </div>
    </div>
  );
}
