import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-neutral-500 overflow-x-auto py-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const relativeUrl = item.url.replace('https://Numvax.com', '') || '/';

        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-3 h-3 text-neutral-400 shrink-0" />}
            {isLast ? (
              <span className="font-semibold text-neutral-900 shrink-0" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={relativeUrl}
                className="hover:text-neutral-900 flex items-center gap-1 transition-colors shrink-0"
              >
                {index === 0 && <Home className="w-3 h-3" />}
                <span>{item.name}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
