import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing, isRTL, type Locale } from '../../i18n/routing';
import { Header } from '../../components/navigation/Header';
import { Footer } from '../../components/navigation/Footer';
import { JsonLd } from '../../components/seo/JsonLd';
import { ConsentBanner } from '../../components/navigation/ConsentBanner';
import Script from 'next/script';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  const localeOGMap: Record<string, string> = {
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    it: 'it_IT',
  };

  const baseUrl = 'https://numvax.com';
  const canonicalUrl = `${baseUrl}/`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: 'Numvax — Free Online Tools & Calculators',
      template: '%s | Numvax',
    },
    description: 'Fast, accurate and easy-to-use calculators, converters, developer tools, text utilities, and PDF tools for everyday life, work and study.',
    applicationName: 'Numvax',
    openGraph: {
      type: 'website',
      locale: localeOGMap[locale] || 'en_US',
      url: canonicalUrl,
      siteName: 'Numvax',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Numvax — Free Online Tools & Calculators',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/og-image.jpg'],
    },
    robots: {
      index: locale === 'en',
      follow: true,
      googleBot: {
        index: locale === 'en',
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    manifest: '/site.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/logo.png', type: 'image/png' },
      ],
      shortcut: '/logo.png',
      apple: '/apple-touch-icon.png',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'x-default': `${baseUrl}/`,
        en: `${baseUrl}/`,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = isRTL(locale as Locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Google Consent Mode v2 Default Settings (Non-blocking) */}
        <Script id="google-consent-mode" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            var savedConsent = null;
            try {
              savedConsent = JSON.parse(localStorage.getItem('numvax_consent_preferences'));
            } catch(e) {}
            if (savedConsent) {
              gtag('consent', 'default', {
                'analytics_storage': savedConsent.analytics ? 'granted' : 'denied',
                'ad_storage': savedConsent.advertising ? 'granted' : 'denied',
                'ad_user_data': savedConsent.advertising ? 'granted' : 'denied',
                'ad_personalization': savedConsent.personalizedAds ? 'granted' : 'denied',
                'wait_for_update': 500
              });
            } else {
              gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'wait_for_update': 500
              });
            }
          `}
        </Script>
        {/* Google Tag Manager (afterInteractive for fast mobile paint) */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WMN4G4H9');
          `}
        </Script>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7170382598292424"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        {/* Google Analytics 4 (GA4) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-YHEGJX5E0K"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YHEGJX5E0K', { send_page_view: true });
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-white text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WMN4G4H9"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <NextIntlClientProvider messages={messages}>
          {/* Linked Organization + WebSite Structured Data */}
          <JsonLd type="EntityGraph" />
          <Header />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <ConsentBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
