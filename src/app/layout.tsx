/**
 * Root layout — minimal shell required by Next.js App Router.
 * 
 * All real rendering is done in src/app/[locale]/layout.tsx
 * which is called for every route via next-intl middleware routing.
 * 
 * This file only exists to satisfy Next.js's requirement for a root layout.
 * The [locale]/layout.tsx provides the actual <html>, <head>, and <body> tags.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // next-intl re-renders everything via [locale]/layout.tsx
  // This root layout is never reached for localized routes
  return children;
}
