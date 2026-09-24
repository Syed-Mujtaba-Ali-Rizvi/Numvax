import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Numvax Admin Panel',
  description: 'Numvax content management system and SEO dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="min-h-full bg-neutral-50 text-neutral-900 font-sans">
        {children}
      </body>
    </html>
  );
}
