import React from 'react';
import { Metadata } from 'next';
import ToolsIndexPage from '@/app/[locale]/tools/page';
import { TOOL_CATALOG } from '@/lib/toolCatalog';
import { CALCULATOR_CATALOG } from '@/lib/catalog';

const totalToolCount = Object.keys(CALCULATOR_CATALOG).length + Object.keys(TOOL_CATALOG).length;

export const metadata: Metadata = {
  title: `All ${totalToolCount}+ Free Online Tools & Calculators - Numvax Directory`,
  description: `Browse all ${totalToolCount}+ free online calculators, PDF tools, image converters, developer utilities, text tools, and SEO tools on Numvax.`,
  alternates: {
    canonical: 'https://numvax.com/tools',
  },
};

export default function AllToolsPage() {
  return <ToolsIndexPage />;
}
