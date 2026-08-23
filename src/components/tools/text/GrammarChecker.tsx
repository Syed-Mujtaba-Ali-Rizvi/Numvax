'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { CheckCircle2, AlertCircle, RefreshCw, Copy, Check } from 'lucide-react';

interface GrammarMatch {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: Array<{ value: string }>;
  rule: {
    id: string;
    description: string;
    category: { name: string };
  };
}

export const GrammarChecker: React.FC = () => {
  const [text, setText] = useState('Numvax provide free online calculators that is fast and easy to use.');
  const [matches, setMatches] = useState<GrammarMatch[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const checkGrammar = async () => {
    if (!text.trim()) return;
    setIsChecking(true);
    setHasChecked(false);

    try {
      const params = new URLSearchParams();
      params.append('text', text);
      params.append('language', 'en-US');

      const res = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      });

      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch {
      // API call error handling fallback
    } finally {
      setIsChecking(false);
      setHasChecked(true);
    }
  };

  const applyFix = (match: GrammarMatch, replacement: string) => {
    const before = text.slice(0, match.offset);
    const after = text.slice(match.offset + match.length);
    const newText = before + replacement + after;
    setText(newText);
    setMatches(matches.filter((m) => m !== match));
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">LanguageTool Free Engine</span>
          <Button variant="primary" size="sm" onClick={checkGrammar} disabled={isChecking}>
            {isChecking ? 'Checking...' : 'Check Grammar'}
          </Button>
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setHasChecked(false);
          }}
          rows={7}
          placeholder="Paste or type text to check grammar and spelling..."
          className="w-full p-4 bg-white text-neutral-900 border border-neutral-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />

        {hasChecked && (
          <div className="flex flex-col gap-3">
            {matches.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No grammar or spelling issues detected! Your text looks clear.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="text-xs font-bold text-neutral-900">
                  Found {matches.length} Suggestion{matches.length > 1 ? 's' : ''}:
                </div>
                {matches.map((match, idx) => (
                  <div key={idx} className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-neutral-900">{match.message}</span>
                        <span className="text-neutral-500 text-[11px] mt-0.5">
                          Issue: "{text.slice(match.offset, match.offset + match.length)}"
                        </span>
                      </div>
                    </div>

                    {match.replacements.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold text-neutral-600">Suggestions:</span>
                        {match.replacements.slice(0, 3).map((rep, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => applyFix(match, rep.value)}
                            className="px-2.5 py-1 bg-white border border-neutral-300 hover:border-neutral-900 rounded-lg text-xs font-medium text-neutral-900 transition-colors cursor-pointer"
                          >
                            {rep.value}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
