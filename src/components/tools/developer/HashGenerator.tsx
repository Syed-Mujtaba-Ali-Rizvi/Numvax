'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Copy, Check, Hash } from 'lucide-react';

export const HashGenerator: React.FC = () => {
  const [text, setText] = useState('Numvax');
  const [sha1, setSha1] = useState('');
  const [sha256, setSha256] = useState('');
  const [sha512, setSha512] = useState('');

  const computeHashes = async () => {
    if (!text) {
      setSha1('');
      setSha256('');
      setSha512('');
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const buf1 = await crypto.subtle.digest('SHA-1', data);
    setSha1(Array.from(new Uint8Array(buf1)).map((b) => b.toString(16).padStart(2, '0')).join(''));

    const buf256 = await crypto.subtle.digest('SHA-256', data);
    setSha256(Array.from(new Uint8Array(buf256)).map((b) => b.toString(16).padStart(2, '0')).join(''));

    const buf512 = await crypto.subtle.digest('SHA-512', data);
    setSha512(Array.from(new Uint8Array(buf512)).map((b) => b.toString(16).padStart(2, '0')).join(''));
  };

  useEffect(() => {
    computeHashes();
  }, []);

  const copyVal = (val: string) => {
    navigator.clipboard.writeText(val);
  };

  return (
    <Card>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Cryptographic Hashing Engine</span>
          <Button variant="primary" size="sm" onClick={computeHashes}>
            Generate Hashes
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-700">Input String:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Type text to compute hashes..."
            className="w-full p-3 bg-white border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 p-3 bg-neutral-900 text-white rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
              <span>SHA-256 Digest:</span>
              <button onClick={() => copyVal(sha256)} className="hover:text-white">Copy</button>
            </div>
            <span className="font-mono text-xs text-emerald-400 break-all">{sha256 || '...'}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 bg-neutral-900 text-white rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
              <span>SHA-1 Digest:</span>
              <button onClick={() => copyVal(sha1)} className="hover:text-white">Copy</button>
            </div>
            <span className="font-mono text-xs text-neutral-200 break-all">{sha1 || '...'}</span>
          </div>

          <div className="flex flex-col gap-1 p-3 bg-neutral-900 text-white rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold">
              <span>SHA-512 Digest:</span>
              <button onClick={() => copyVal(sha512)} className="hover:text-white">Copy</button>
            </div>
            <span className="font-mono text-xs text-neutral-300 break-all">{sha512 || '...'}</span>
          </div>
        </div>
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] text-neutral-600 leading-relaxed">
          <strong>Security Note:</strong> Hash functions are one-way mathematical digests, not encryption. SHA-1 is included for legacy compatibility and checksum verification; use SHA-256 or SHA-512 for modern cryptographic security.
        </div>
      </div>
    </Card>
  );
};
