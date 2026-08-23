'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Copy, Check, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export const PasswordGenerator: React.FC = () => {
  const t = useTranslations('passwordTool');
  const tCommon = useTranslations('common');

  const [length, setLength] = useState<number>(16);
  const [uppercase, setUppercase] = useState<boolean>(true);
  const [lowercase, setLowercase] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [symbols, setSymbols] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');

  const generatePassword = () => {
    let chars = '';
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) chars += '0123456789';
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) {
      setPassword('');
      return;
    }

    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
    setPassword(result);
  };

  useEffect(() => {
    generatePassword();
  }, [length, uppercase, lowercase, numbers, symbols]);

  const [copied, setCopied] = useState(false);
  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">{t('generatePassword')}</span>
          <Button variant="primary" size="sm" onClick={generatePassword}>
            {t('generatePassword')}
          </Button>
        </div>

        <div className="p-4 bg-neutral-900 text-white rounded-2xl flex items-center justify-between font-mono text-lg font-bold border border-neutral-800">
          <span className="break-all">{password || 'Select options'}</span>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <Button variant="ghost" size="sm" onClick={generatePassword} className="text-neutral-300 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="sm" onClick={copyPassword}>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? tCommon('copied') : tCommon('copy')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-neutral-700">
              <span>{t('passwordLength', { length })}</span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-neutral-900 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 cursor-pointer">
              <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="rounded" />
              {t('uppercase')}
            </label>
            <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 cursor-pointer">
              <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} className="rounded" />
              {t('lowercase')}
            </label>
            <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 cursor-pointer">
              <input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} className="rounded" />
              {t('numbers')}
            </label>
            <label className="flex items-center gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 cursor-pointer">
              <input type="checkbox" checked={symbols} onChange={(e) => setSymbols(e.target.checked)} className="rounded" />
              {t('symbols')}
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
};
