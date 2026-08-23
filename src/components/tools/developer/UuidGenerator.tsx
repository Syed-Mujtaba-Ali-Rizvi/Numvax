'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const UuidGenerator: React.FC = () => {
  const t = useTranslations('uuidTool');
  const tCommon = useTranslations('common');

  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [uuids, setUuids] = useState<string[]>([]);

  const generateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let u = crypto.randomUUID();
      if (!hyphens) u = u.replace(/-/g, '');
      if (uppercase) u = u.toUpperCase();
      list.push(u);
    }
    setUuids(list);
  };

  React.useEffect(() => {
    generateUuids();
  }, [count, uppercase, hyphens]);

  const [copied, setCopied] = useState(false);
  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">{t('generateUuid')}</span>
          <Button variant="primary" size="sm" onClick={generateUuids}>
            {t('generateUuid')}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-700">
              {t('bulkCount', { count })}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
              className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-4 sm:pt-0">
            <input
              type="checkbox"
              id="uppercase"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded border-neutral-300 text-neutral-900"
            />
            <label htmlFor="uppercase" className="text-xs font-medium text-neutral-700 cursor-pointer">Uppercase Format</label>
          </div>

          <div className="flex items-center gap-2 pt-4 sm:pt-0">
            <input
              type="checkbox"
              id="hyphens"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="rounded border-neutral-300 text-neutral-900"
            />
            <label htmlFor="hyphens" className="text-xs font-medium text-neutral-700 cursor-pointer">Include Hyphens</label>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={copyAll}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? tCommon('copied') : t('copyAll')}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {uuids.map((uuid, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-neutral-900 text-neutral-100 rounded-xl border border-neutral-800 font-mono text-xs">
              <span>{uuid}</span>
              <button
                onClick={() => navigator.clipboard.writeText(uuid)}
                className="text-neutral-400 hover:text-white text-[11px]"
              >
                {tCommon('copy')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
