'use client';

import React, { useState } from 'react';
import { Copy, Check, Share2, Printer } from 'lucide-react';
import { Button } from '../ui/button';

export interface CalculatorResultProps {
  primaryValue: string | number;
  primaryLabel?: string;
  secondaryItems?: Array<{ label: string; value: string | number }>;
  summaryText?: string;
  disclaimer?: string;
  onPrint?: () => void;
  shareTitle?: string;
}

export const CalculatorResult: React.FC<CalculatorResultProps> = ({
  primaryValue,
  primaryLabel = 'Result',
  secondaryItems = [],
  summaryText,
  disclaimer,
  onPrint,
  shareTitle = 'Numvax Calculation',
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const copyToClipboard = () => {
    const textToCopy = `${primaryLabel}: ${primaryValue}${
      secondaryItems.length > 0
        ? '\n' + secondaryItems.map((i) => `${i.label}: ${i.value}`).join('\n')
        : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `${primaryLabel}: ${primaryValue}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="animate-result flex flex-col gap-5 p-6 bg-neutral-900 text-white rounded-2xl shadow-md border border-neutral-800">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Calculated Output
        </span>
        <div className="flex items-center gap-1.5 no-print">
          <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-neutral-300 hover:text-white hover:bg-neutral-800">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="text-neutral-300 hover:text-white hover:bg-neutral-800">
            <Share2 className="w-3.5 h-3.5" />
            {shared ? 'Link Copied' : 'Share'}
          </Button>
          {onPrint && (
            <Button variant="ghost" size="sm" onClick={onPrint} className="text-neutral-300 hover:text-white hover:bg-neutral-800">
              <Printer className="w-3.5 h-3.5" />
              Print
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col">
        <span className="text-xs text-neutral-400 font-medium">{primaryLabel}</span>
        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 font-mono">
          {primaryValue}
        </div>
      </div>

      {secondaryItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-neutral-800">
          {secondaryItems.map((item, idx) => (
            <div key={idx} className="flex flex-col bg-neutral-800/80 p-3 rounded-xl border border-neutral-700/50">
              <span className="text-xs text-neutral-400 font-medium">{item.label}</span>
              <span className="text-base font-semibold text-neutral-100 mt-0.5 font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {summaryText && (
        <p className="text-xs text-neutral-300 italic pt-1">{summaryText}</p>
      )}

      {disclaimer && (
        <div className="p-3 bg-neutral-800/90 rounded-xl text-xs text-neutral-400 border border-neutral-700/50">
          <strong>Disclaimer:</strong> {disclaimer}
        </div>
      )}
    </div>
  );
};
