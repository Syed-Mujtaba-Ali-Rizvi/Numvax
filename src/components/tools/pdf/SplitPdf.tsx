'use client';

import React, { useState } from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { Scissors, FileDown } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export const SplitPdf: React.FC = () => {
  const [pageCount, setPageCount] = useState(0);
  const [rangeInput, setRangeInput] = useState('');
  const [splitMode, setSplitMode] = useState<'all' | 'ranges'>('all');
  const [splitUrls, setSplitUrls] = useState<{ name: string; url: string }[]>([]);

  const parseRanges = (input: string, max: number): number[][] => {
    const ranges: number[][] = [];
    const parts = input.split(',').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim());
        const start = Math.max(1, parseInt(startStr));
        const end = Math.min(max, parseInt(endStr));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          const pages: number[] = [];
          for (let i = start; i <= end; i++) pages.push(i - 1);
          ranges.push(pages);
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1 && page <= max) {
          ranges.push([page - 1]);
        }
      }
    }
    return ranges;
  };

  return (
    <PdfToolShell
      title="Upload a PDF to split"
      description="Select a PDF file and choose which pages to extract"
      customResult
    >
      {({ files, state, setState, setError, setProgress, reset }) => {
        const handleSplit = async () => {
          if (files.length === 0) return;
          setState('processing');
          setProgress(10);
          try {
            const buffer = await files[0].arrayBuffer();
            const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
            const total = srcDoc.getPageCount();
            setPageCount(total);

            let groups: number[][];
            if (splitMode === 'all') {
              groups = Array.from({ length: total }, (_, i) => [i]);
            } else {
              groups = parseRanges(rangeInput, total);
              if (groups.length === 0) {
                setError('Invalid page range. Use format: 1-3, 5, 7-9');
                setState('error');
                return;
              }
            }

            const results: { name: string; url: string }[] = [];
            const baseName = files[0].name.replace(/\.pdf$/i, '');

            for (let i = 0; i < groups.length; i++) {
              const newDoc = await PDFDocument.create();
              const copied = await newDoc.copyPages(srcDoc, groups[i]);
              copied.forEach(p => newDoc.addPage(p));
              const bytes = await newDoc.save();
              const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
              const url = URL.createObjectURL(blob);
              const label = groups[i].length === 1
                ? `${baseName}_page-${groups[i][0] + 1}.pdf`
                : `${baseName}_pages-${groups[i][0] + 1}-${groups[i][groups[i].length - 1] + 1}.pdf`;
              results.push({ name: label, url });
              setProgress(10 + Math.round((i / groups.length) * 80));
            }

            setSplitUrls(results);
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to split PDF');
            setState('error');
          }
        };

        const handleLoadPages = async () => {
          if (files.length > 0) {
            try {
              const buffer = await files[0].arrayBuffer();
              const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
              setPageCount(doc.getPageCount());
            } catch {
              setPageCount(0);
            }
          }
        };

        if (files.length > 0 && pageCount === 0) {
          handleLoadPages();
        }

        return (
          <>
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                {pageCount > 0 && (
                  <div className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                    📄 This PDF has <strong>{pageCount}</strong> page{pageCount !== 1 ? 's' : ''}.
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-neutral-900">Split Mode:</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSplitMode('all')}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                        splitMode === 'all'
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Split All Pages
                    </button>
                    <button
                      onClick={() => setSplitMode('ranges')}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                        splitMode === 'ranges'
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Custom Ranges
                    </button>
                  </div>
                </div>

                {splitMode === 'ranges' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-700">
                      Page ranges (e.g., 1-3, 5, 7-9):
                    </label>
                    <input
                      type="text"
                      value={rangeInput}
                      onChange={(e) => setRangeInput(e.target.value)}
                      placeholder="1-3, 5, 7-9"
                      className="px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                )}

                <Button variant="primary" onClick={handleSplit}>
                  <Scissors className="w-4 h-4 mr-2" />
                  {splitMode === 'all' ? 'Split All Pages' : 'Extract Selected Pages'}
                </Button>
              </div>
            )}

            {state === 'done' && splitUrls.length > 0 && (
              <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col items-center gap-4 text-center border border-neutral-800">
                <span className="text-sm font-bold">✂️ PDF Split Successfully!</span>
                <span className="text-xs text-neutral-400">{splitUrls.length} file{splitUrls.length !== 1 ? 's' : ''} created</span>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {splitUrls.map((f, i) => (
                    <a
                      key={i}
                      href={f.url}
                      download={f.name}
                      className="flex items-center justify-between px-4 py-2 bg-neutral-800 rounded-xl text-xs hover:bg-neutral-700 transition-colors"
                    >
                      <span className="truncate">{f.name}</span>
                      <FileDown className="w-3.5 h-3.5 shrink-0 ml-2" />
                    </a>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => { setSplitUrls([]); setPageCount(0); reset(); }} className="!text-white !border-neutral-600 hover:!bg-neutral-800">
                  Split Another PDF
                </Button>
              </div>
            )}
          </>
        );
      }}
    </PdfToolShell>
  );
};
