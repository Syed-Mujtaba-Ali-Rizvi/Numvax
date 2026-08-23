'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Copy, Check, Trash2, FileCode } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const JsonFormatter: React.FC = () => {
  const t = useTranslations('jsonTool');
  const tCommon = useTranslations('common');

  const [input, setInput] = useState('{"name":"Numvax","tools":80,"free":true,"version":1.0}');
  const [indent, setIndent] = useState<number>(2);
  const [error, setError] = useState<string | null>(null);

  const formatJson = () => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, indent));
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
    }
  };

  const minifyJson = () => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
    }
  };

  const [copied, setCopied] = useState(false);
  const copyOutput = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">{t('title')}</span>
          <Button variant="primary" size="sm" onClick={formatJson}>
            <FileCode className="w-3.5 h-3.5 mr-1" /> {t('formatJson')}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-500">{t('indent')}</span>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="text-xs bg-neutral-100 border border-neutral-300 rounded-lg px-2.5 py-1 text-neutral-800 focus:outline-none"
            >
              <option value={2}>{t('twoSpaces')}</option>
              <option value={4}>{t('fourSpaces')}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={minifyJson}>
              {t('minifyJson')}
            </Button>
            <Button variant="secondary" size="sm" onClick={copyOutput}>
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-green-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? tCommon('copied') : t('copyOutput')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setInput('')}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> {t('clear')}
            </Button>
          </div>
        </div>

        <textarea
          rows={12}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste or type JSON data here..."
          className="w-full p-4 font-mono text-xs bg-neutral-50 border border-neutral-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-mono">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
};
