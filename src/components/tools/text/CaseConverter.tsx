'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const CaseConverter: React.FC = () => {
  const t = useTranslations('caseTool');
  const tCommon = useTranslations('common');

  const [text, setText] = useState('Free online calculators and developer tools');

  const toUppercase = () => setText(text.toUpperCase());
  const toLowercase = () => setText(text.toLowerCase());

  const toTitleCase = () => {
    setText(
      text
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  };

  const toSentenceCase = () => {
    setText(
      text
        .toLowerCase()
        .replace(/(^\s*|[.!?]\s*)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase())
    );
  };

  const toCamelCase = () => {
    setText(
      text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
        .replace(/\s+/g, '')
    );
  };

  const toKebabCase = () => {
    setText(
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const [copied, setCopied] = useState(false);
  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={toUppercase}>
            {t('uppercase')}
          </Button>
          <Button variant="secondary" size="sm" onClick={toLowercase}>
            {t('lowercase')}
          </Button>
          <Button variant="secondary" size="sm" onClick={toTitleCase}>
            {t('titleCase')}
          </Button>
          <Button variant="secondary" size="sm" onClick={toSentenceCase}>
            {t('sentenceCase')}
          </Button>
          <Button variant="secondary" size="sm" onClick={toCamelCase}>
            {t('camelCase')}
          </Button>
          <Button variant="secondary" size="sm" onClick={toKebabCase}>
            {t('kebabCase')}
          </Button>
          <Button variant="outline" size="sm" onClick={copyText} className="ml-auto">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? tCommon('copied') : tCommon('copy')}
          </Button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Type or paste text to convert case..."
          className="w-full p-4 bg-white text-neutral-900 border border-neutral-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />
      </div>
    </Card>
  );
};
