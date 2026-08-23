import React from 'react';

export interface JsonLdProps {
  type: 'WebSite' | 'WebApplication' | 'SoftwareApplication' | 'Breadcrumb' | 'FAQPage' | 'Organization' | 'EntityGraph' | 'HowTo';
  data?: Record<string, any>;
}

export const JsonLd: React.FC<JsonLdProps> = ({ type, data = {} }) => {
  let schema: Record<string, any> = {
    '@context': 'https://schema.org',
  };

  if (type === 'EntityGraph') {
    schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://numvax.com/#organization',
          name: 'Numvax',
          url: 'https://numvax.com/',
          logo: {
            '@type': 'ImageObject',
            '@id': 'https://numvax.com/#logo',
            url: 'https://numvax.com/logo.png',
            caption: 'Numvax',
          },
          image: 'https://numvax.com/logo.png',
          description: 'Numvax provides fast, accurate, client-side free online calculators, PDF utilities, converters, developer tools, and text utilities.',
        },
        {
          '@type': 'WebSite',
          '@id': 'https://numvax.com/#website',
          url: 'https://numvax.com/',
          name: 'Numvax',
          alternateName: ['Numvax Tools', 'Numvax Online Tools', 'Numvax Calculators'],
          publisher: {
            '@id': 'https://numvax.com/#organization',
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://numvax.com/search?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    };
  } else if (type === 'WebSite') {
    schema = {
      ...schema,
      '@type': 'WebSite',
      '@id': 'https://numvax.com/#website',
      name: data.name || 'Numvax',
      alternateName: ['Numvax Tools', 'Numvax Online Tools'],
      url: data.url || 'https://numvax.com/',
      publisher: {
        '@id': 'https://numvax.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${data.url || 'https://numvax.com'}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    };
  } else if (type === 'WebApplication' || type === 'SoftwareApplication') {
    schema = {
      ...schema,
      '@type': type,
      name: data.name,
      description: data.description,
      url: data.url,
      applicationCategory: data.category || 'UtilitiesApplication',
      operatingSystem: 'Windows, macOS, Linux, iOS, Android',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    };
  } else if (type === 'Breadcrumb') {
    schema = {
      ...schema,
      '@type': 'BreadcrumbList',
      itemListElement: data.items?.map((item: { name: string; url: string }, index: number) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })) || [],
    };
  } else if (type === 'FAQPage') {
    schema = {
      ...schema,
      '@type': 'FAQPage',
      mainEntity: data.faqs?.map((faq: { question: string; answer: string }) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })) || [],
    };
  } else if (type === 'HowTo') {
    schema = {
      ...schema,
      '@type': 'HowTo',
      name: data.name,
      description: data.description,
      step: data.steps?.map((stepText: string, index: number) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: stepText,
      })) || [],
    };
  } else if (type === 'Organization') {
    const orgObj: Record<string, any> = {
      '@type': 'Organization',
      '@id': 'https://numvax.com/#organization',
      name: data.name || 'Numvax',
      url: data.url || 'https://numvax.com/',
      logo: data.logo || 'https://numvax.com/logo.png',
      description: data.description || 'Free online tools and calculators for everyone.',
    };
    if (data.sameAs && Array.isArray(data.sameAs) && data.sameAs.length > 0) {
      orgObj.sameAs = data.sameAs;
    }
    schema = {
      ...schema,
      ...orgObj,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
