'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Copy, Check, ArrowRightLeft } from 'lucide-react';

export const Base64Tool: React.FC = () => {
  const [input, setInput] = useState('Hello, Numvax!');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);

  const handleProcess = () => {
    setError(null);
    try {
      if (mode === 'encode') {
        setOutput(btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16)))));
      } else {
        const decoded = atob(input);
        setOutput(decodeURIComponent(Array.prototype.map.call(decoded, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
      }
    } catch (err: any) {
      setError('Failed to process string. Please verify input encoding.');
    }
  };

  const [copied, setCopied] = useState(false);
  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-full border border-neutral-200">
            <button
              onClick={() => setMode('encode')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'encode' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                mode === 'decode' ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Decode
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={handleProcess}>
            <ArrowRightLeft className="w-3.5 h-3.5 mr-1" /> {mode === 'encode' ? 'Encode to Base64' : 'Decode Base64'}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-mono">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-700">
              {mode === 'encode' ? 'Plain Text Input:' : 'Base64 Encoded Input:'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              placeholder="Enter text..."
              className="w-full p-3 bg-white text-neutral-900 font-mono text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700">Output Result:</label>
              {output && (
                <button onClick={copyOutput} className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1">
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              rows={8}
              placeholder="Converted output will appear here..."
              className="w-full p-3 bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl border border-neutral-800 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
