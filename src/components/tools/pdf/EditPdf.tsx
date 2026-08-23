'use client';

import React, { useState } from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { RotateCw, ArrowUp, ArrowDown, Trash2, Download } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';

interface PageInfo {
  index: number;
  rotation: number;
  deleted: boolean;
}

export const EditPdf: React.FC = () => {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  return (
    <PdfToolShell
      title="Upload a PDF to edit pages"
      description="Rotate, reorder, and delete pages in your PDF document"
      customResult
    >
      {({ files, state, setState, setError, setProgress, reset }) => {
        const [resultUrl, setLocalResultUrl] = useState<string | null>(null);

        const loadPages = async () => {
          if (files.length === 0) return;
          setState('processing');
          setProgress(10);

          try {
            const pdfjsLib = await import('pdfjs-dist');
            if (typeof window !== 'undefined') {
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
            }

            const buffer = await files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            const total = pdf.numPages;

            const thumbs: string[] = [];
            const pageInfos: PageInfo[] = [];

            for (let i = 1; i <= total; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 0.4 });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const ctx = canvas.getContext('2d')!;
              await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
              thumbs.push(canvas.toDataURL('image/jpeg', 0.7));
              pageInfos.push({ index: i - 1, rotation: 0, deleted: false });
              setProgress(10 + Math.round((i / total) * 60));
            }

            setThumbnails(thumbs);
            setPages(pageInfos);
            setProgress(100);
            setState('idle');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load PDF pages');
            setState('error');
          }
        };

        if (files.length > 0 && pages.length === 0 && state === 'idle') {
          loadPages();
        }

        const rotatePage = (idx: number) => {
          setPages(prev => prev.map((p, i) => 
            i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p
          ));
        };

        const toggleDelete = (idx: number) => {
          setPages(prev => prev.map((p, i) =>
            i === idx ? { ...p, deleted: !p.deleted } : p
          ));
        };

        const movePage = (idx: number, dir: 'up' | 'down') => {
          const target = dir === 'up' ? idx - 1 : idx + 1;
          if (target < 0 || target >= pages.length) return;
          const newPages = [...pages];
          [newPages[idx], newPages[target]] = [newPages[target], newPages[idx]];
          const newThumbs = [...thumbnails];
          [newThumbs[idx], newThumbs[target]] = [newThumbs[target], newThumbs[idx]];
          setPages(newPages);
          setThumbnails(newThumbs);
        };

        const handleSave = async () => {
          setState('processing');
          setProgress(10);

          try {
            const buffer = await files[0].arrayBuffer();
            const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
            const newDoc = await PDFDocument.create();

            const activePages = pages.filter(p => !p.deleted);
            
            for (let i = 0; i < activePages.length; i++) {
              const p = activePages[i];
              const [copied] = await newDoc.copyPages(srcDoc, [p.index]);
              
              if (p.rotation !== 0) {
                const currentRotation = copied.getRotation().angle;
                copied.setRotation(degrees(currentRotation + p.rotation));
              }
              
              newDoc.addPage(copied);
              setProgress(10 + Math.round(((i + 1) / activePages.length) * 80));
            }

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setLocalResultUrl(url);
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save edited PDF');
            setState('error');
          }
        };

        const activeCount = pages.filter(p => !p.deleted).length;

        return (
          <>
            {pages.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    {pages.length} pages — {activeCount} active, {pages.length - activeCount} deleted
                  </span>
                  <Button variant="primary" size="sm" onClick={handleSave} disabled={activeCount === 0}>
                    Save Edited PDF
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {pages.map((page, idx) => (
                    <div key={idx} className={`relative group rounded-xl border-2 overflow-hidden transition-all ${
                      page.deleted ? 'opacity-40 border-red-300' : 'border-neutral-200'
                    }`}>
                      <div className="relative">
                        <img
                          src={thumbnails[idx]}
                          alt={`Page ${idx + 1}`}
                          className="w-full aspect-[3/4] object-cover"
                          style={{ transform: `rotate(${page.rotation}deg)` }}
                        />
                        <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-md">
                          {idx + 1}
                        </span>
                        {page.rotation !== 0 && (
                          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-blue-500/80 text-white text-[10px] rounded-md">
                            {page.rotation}°
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1 p-1.5 bg-neutral-50">
                        <button onClick={() => movePage(idx, 'up')} disabled={idx === 0}
                          className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => movePage(idx, 'down')} disabled={idx === pages.length - 1}
                          className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => rotatePage(idx)}
                          className="p-1 text-neutral-500 hover:text-neutral-900">
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleDelete(idx)}
                          className={`p-1 ${page.deleted ? 'text-green-600 hover:text-green-700' : 'text-red-500 hover:text-red-700'}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state === 'done' && resultUrl && (
              <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col items-center gap-4 text-center border border-neutral-800">
                <span className="text-sm font-bold">✅ PDF Edited Successfully!</span>
                <div className="flex gap-3">
                  <a href={resultUrl} download={files[0]?.name?.replace(/\.pdf$/i, '-edited.pdf') || 'edited.pdf'}
                    className="px-6 py-2.5 bg-white text-neutral-900 font-bold text-xs rounded-full hover:bg-neutral-100 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Edited PDF
                  </a>
                  <Button variant="outline" size="sm" onClick={() => { setPages([]); setThumbnails([]); setLocalResultUrl(null); reset(); }}
                    className="!text-white !border-neutral-600 hover:!bg-neutral-800">
                    Edit Another PDF
                  </Button>
                </div>
              </div>
            )}
          </>
        );
      }}
    </PdfToolShell>
  );
};
