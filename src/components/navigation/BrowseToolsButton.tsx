'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Wrench } from 'lucide-react';
import { useLocale } from 'next-intl';

interface BrowseToolsButtonProps {
  className?: string;
  count?: number | string;
  variant?: 'primary' | 'outline' | 'subtle';
  size?: 'sm' | 'md' | 'lg';
}

export const BrowseToolsButton: React.FC<BrowseToolsButtonProps> = ({
  className = '',
  count = '74+',
  variant = 'outline',
  size = 'md',
}) => {
  const locale = useLocale();
  const toolsHref = locale === 'en' ? '/tools' : `/${locale}/tools`;

  const sizeClasses = {
    sm: 'px-3 py-2 text-xs gap-1.5 min-h-[38px]',
    md: 'px-4 py-2.5 text-xs sm:text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3 text-sm sm:text-base gap-2.5 min-h-[48px]',
  }[size];

  const variantClasses = {
    primary: 'bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-900 shadow-xs',
    outline: 'bg-white text-neutral-800 hover:bg-neutral-50 hover:text-neutral-950 border-neutral-300 hover:border-neutral-900 shadow-2xs',
    subtle: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 border-transparent',
  }[variant];

  return (
    <Link
      href={toolsHref}
      className={`inline-flex items-center justify-center font-bold rounded-xl border transition-all duration-150 cursor-pointer select-none group shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
      title="Browse all free online tools and calculators on Numvax"
    >
      <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500 group-hover:text-neutral-900 transition-colors" />
      <span>Browse {count} Other Tools</span>
      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
};
