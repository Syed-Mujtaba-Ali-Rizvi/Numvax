import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface CalculatorFAQProps {
  items: FAQItem[];
  faqLabel?: string;
}

export const CalculatorFAQ: React.FC<CalculatorFAQProps> = ({ items, faqLabel = 'Frequently Asked Questions' }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="w-full flex flex-col gap-4 mt-8 pt-8 border-t border-neutral-200">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-neutral-900" />
        <h2 className="text-xl font-bold text-neutral-900">{faqLabel}</h2>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item, idx) => (
          <details
            key={idx}
            open={idx === 0}
            className="group border border-neutral-200 rounded-2xl bg-white overflow-hidden transition-all [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="w-full flex items-center justify-between p-4 font-semibold text-sm text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer select-none">
              <span>{item.question}</span>
              <svg
                className="w-4 h-4 text-neutral-500 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-4 pb-4 pt-1 text-sm text-neutral-600 border-t border-neutral-100 leading-relaxed whitespace-pre-line">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};
