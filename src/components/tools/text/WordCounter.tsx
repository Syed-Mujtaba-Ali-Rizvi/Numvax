'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Copy, Check, Trash2, BarChart2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const WordCounter: React.FC = () => {
  const t = useTranslations('wordCounterTool');
  const tCommon = useTranslations('common');

  const [text, setText] = useState('Numvax is a fast, accurate, and free online tools platform for everyday calculations, document scanning, image compression, developer utilities, and text processing.');
  
  const [stats, setStats] = useState({
    words: 23,
    characters: 167,
    charsNoSpaces: 145,
    sentences: 1,
    paragraphs: 1,
    readingTimeMinutes: 1
  });

  const handleCalculate = () => {
    const trimmed = text.trim();
    const wordsCount = trimmed ? trimmed.split(/\s+/).length : 0;
    const charCount = text.length;
    const charNoSpaceCount = text.replace(/\s/g, '').length;
    const sentenceCount = trimmed ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphCount = trimmed ? text.split(/\n+/).filter(Boolean).length : 0;
    const readTime = Math.ceil(wordsCount / 200);

    setStats({
      words: wordsCount,
      characters: charCount,
      charsNoSpaces: charNoSpaceCount,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
      readingTimeMinutes: readTime
    });
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
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">{t('title')}</span>
          <Button variant="primary" size="sm" onClick={handleCalculate}>
            <BarChart2 className="w-3.5 h-3.5 mr-1.5" /> {t('countWords')}
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">{t('words')}</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.words.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">{t('characters')}</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.characters.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">{t('noSpaces')}</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.charsNoSpaces.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">{t('sentences')}</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.sentences.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">{t('paragraphs')}</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.paragraphs.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">{t('readingTime')}</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.readingTimeMinutes} min</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            rows={8}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleCalculate();
            }}
            placeholder="Type or paste your text here..."
            className="w-full p-4 text-sm bg-neutral-50 border border-neutral-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-neutral-400 font-sans leading-relaxed"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => { setText(''); handleCalculate(); }}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> {t('clearText')}
          </Button>

          <Button variant="secondary" size="sm" onClick={copyText}>
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-green-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? tCommon('copied') : t('copyText')}
          </Button>
        </div>
      </div>
    </Card>
  );
};
