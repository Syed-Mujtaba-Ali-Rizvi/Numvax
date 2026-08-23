import { MetadataRoute } from 'next';
import { CALCULATOR_CATALOG } from '../lib/catalog';
import { TOOL_CATALOG } from '../lib/toolCatalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://numvax.com';
  const lastModified = new Date('2026-08-14');

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/calculators`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/tools`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/all-tools`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/cookie-policy`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
  ];

  const calculatorCategoryPages: MetadataRoute.Sitemap = [
    'financial',
    'health',
    'math',
    'date-time',
    'education',
    'converters',
  ].map((category) => ({
    url: `${baseUrl}/calculators/category/${category}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const toolCategoryPages: MetadataRoute.Sitemap = [
    'pdf-tools',
    'image-tools',
    'text-tools',
    'converters',
    'developer-tools',
    'seo-tools',
    'generators',
  ].map((category) => ({
    url: `${baseUrl}/tools/category/${category}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Clean root URLs (e.g. /percentage-calculator, /compress-pdf)
  const rootCalculatorPages: MetadataRoute.Sitemap = Object.keys(CALCULATOR_CATALOG).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 1.0,
  }));

  const rootToolPages: MetadataRoute.Sitemap = Object.keys(TOOL_CATALOG).map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 1.0,
  }));

  return [
    ...staticPages,
    ...calculatorCategoryPages,
    ...toolCategoryPages,
    ...rootCalculatorPages,
    ...rootToolPages,
  ];
}
