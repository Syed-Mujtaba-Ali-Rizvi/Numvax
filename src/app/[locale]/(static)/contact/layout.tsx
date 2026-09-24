import { Metadata } from 'next';
import { getPageContent } from '@/lib/contentService';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent('contact');
  const title = page?.metaTitle || 'Contact Us - Numvax';
  const description = page?.metaDescription || 'Have feedback, a feature request, or an inquiry? Reach out to the Numvax team.';

  return {
    title,
    description,
    robots: {
      index: !page?.noIndex,
      follow: !page?.noFollow,
    },
    alternates: {
      canonical: page?.canonicalUrl || 'https://numvax.com/contact',
    },
    openGraph: {
      title,
      description,
      url: page?.canonicalUrl || 'https://numvax.com/contact',
      siteName: 'Numvax',
    },
  };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
