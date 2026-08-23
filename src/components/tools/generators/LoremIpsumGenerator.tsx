'use client';

import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Type, AlignLeft } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'in',
  'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
  'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
  'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

function generateLoremText(count: number, type: 'paragraphs' | 'sentences' | 'words', startWithLorem: boolean, wrapper: 'none' | 'p' | 'html'): string {
  let result = '';

  if (type === 'words') {
    const words: string[] = [];
    if (startWithLorem && count >= 5) {
      words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
    }
    while (words.length < count) {
      const randomWord = LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
      words.push(randomWord);
    }
    const raw = words.slice(0, count).join(' ');
    result = raw.charAt(0).toUpperCase() + raw.slice(1) + '.';
  } else if (type === 'sentences') {
    const sentences: string[] = [];
    for (let i = 0; i < count; i++) {
      let sentenceLen = Math.floor(Math.random() * 8) + 6; // 6 to 13 words
      const words: string[] = [];
      if (i === 0 && startWithLorem) {
        words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
        sentenceLen = Math.max(sentenceLen, 5);
      }
      while (words.length < sentenceLen) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
      }
      const sentenceText = words.join(' ');
      sentences.push(sentenceText.charAt(0).toUpperCase() + sentenceText.slice(1) + '.');
    }
    result = sentences.join(' ');
  } else {
    // paragraphs
    const paragraphs: string[] = [];
    for (let p = 0; p < count; p++) {
      const sentenceCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 sentences per paragraph
      const sentences: string[] = [];
      for (let s = 0; s < sentenceCount; s++) {
        let sentenceLen = Math.floor(Math.random() * 8) + 6;
        const words: string[] = [];
        if (p === 0 && s === 0 && startWithLorem) {
          words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
        }
        while (words.length < sentenceLen) {
          words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
        }
        const sentenceText = words.join(' ');
        sentences.push(sentenceText.charAt(0).toUpperCase() + sentenceText.slice(1) + '.');
      }
      const paragraphText = sentences.join(' ');
      if (wrapper === 'p' || wrapper === 'html') {
        paragraphs.push(`<p>${paragraphText}</p>`);
      } else {
        paragraphs.push(paragraphText);
      }
    }
    result = paragraphs.join(wrapper === 'none' ? '\n\n' : '\n');
  }

  return result;
}

export const LoremIpsumGenerator: React.FC = () => {
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [wrapper, setWrapper] = useState<'none' | 'p'>('none');
  const [copied, setCopied] = useState<boolean>(false);
  const [text, setText] = useState('');

  const handleGenerate = () => {
    setText(generateLoremText(count, type, startWithLorem, wrapper));
  };

  React.useEffect(() => {
    handleGenerate();
  }, []);

  const wordCount = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <span className="text-xs font-semibold text-neutral-500">Lorem Ipsum Filler Text Engine</span>
            <Button variant="primary" size="sm" onClick={handleGenerate}>
              Generate Placeholder Text
            </Button>
          </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Generate Type
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
              {(['paragraphs', 'sentences', 'words'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                    type === t
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              Quantity ({count})
            </label>
            <input
              type="range"
              min={1}
              max={type === 'words' ? 200 : 20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
              HTML Wrapper
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
              <button
                onClick={() => setWrapper('none')}
                className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  wrapper === 'none'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Plain Text
              </button>
              <button
                onClick={() => setWrapper('p')}
                className={`py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  wrapper === 'p'
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                &lt;p&gt; Tags
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          <label className="flex items-center gap-2 text-xs text-neutral-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
            />
            Start with &quot;Lorem ipsum dolor sit amet...&quot;
          </label>
        </div>
      </div>
    </Card>

      <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-sm flex flex-col gap-4 relative">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono">
            <span>{wordCount} Words</span>
            <span>·</span>
            <span>{charCount} Characters</span>
          </div>

          <Button
            onClick={handleCopy}
            className="bg-neutral-800 hover:bg-neutral-700 text-white rounded-full text-xs font-medium flex items-center gap-1.5 px-4 py-1.5 border border-neutral-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </Button>
        </div>

        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-neutral-200 max-h-96 overflow-y-auto pr-2">
          {text}
        </div>
      </div>
    </div>
  );
};
