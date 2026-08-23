'use client';

import React, { useState } from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { Image, Download, FileDown } from 'lucide-react';

export const PdfToJpg: React.FC = () => {
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(2);
  const [images, setImages] = useState<{ name: string; url: string; size: number }[]>([]);

  return (
    <PdfToolShell
      title="Upload a PDF to convert to JPG"
      description="Convert each PDF page into a high-resolution JPG image"
      customResult
    >
      {({ files, state, setState, setError, setProgress, reset }) => {
        const handleConvert = async () => {
          if (files.length === 0) return;
          setState('processing');
          setProgress(5);

          try {
            const pdfjsLib = await import('pdfjs-dist');
            
            // Set worker source
            if (typeof window !== 'undefined') {
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
            }

            const buffer = await files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            const totalPages = pdf.numPages;
            setProgress(10);

            const baseName = files[0].name.replace(/\.pdf$/i, '');
            const results: { name: string; url: string; size: number }[] = [];

            for (let i = 1; i <= totalPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale });
              
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const ctx = canvas.getContext('2d')!;
              
              await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
              
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              const response = await fetch(dataUrl);
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              
              results.push({
                name: `${baseName}_page-${i}.jpg`,
                url,
                size: blob.size,
              });

              setProgress(10 + Math.round((i / totalPages) * 85));
            }

            setImages(results);
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to convert PDF to JPG');
            setState('error');
          }
        };

        return (
          <>
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-700">Image Quality</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    >
                      <option value={0.6}>Low (60%)</option>
                      <option value={0.8}>Medium (80%)</option>
                      <option value={0.92}>High (92%)</option>
                      <option value={1.0}>Maximum (100%)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-700">Resolution Scale</label>
                    <select
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    >
                      <option value={1}>1x (72 DPI)</option>
                      <option value={2}>2x (144 DPI)</option>
                      <option value={3}>3x (216 DPI)</option>
                    </select>
                  </div>
                </div>
                <Button variant="primary" onClick={handleConvert}>
                  <Image className="w-4 h-4 mr-2" />
                  Convert to JPG
                </Button>
              </div>
            )}

            {state === 'done' && images.length > 0 && (
              <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col items-center gap-4 text-center border border-neutral-800">
                <span className="text-sm font-bold">🖼️ Converted {images.length} Page{images.length !== 1 ? 's' : ''} to JPG!</span>

                {/* Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
                  {images.map((img, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <img
                        src={img.url}
                        alt={`Page ${i + 1}`}
                        className="w-full aspect-[3/4] object-cover rounded-lg border border-neutral-700"
                      />
                      <a
                        href={img.url}
                        download={img.name}
                        className="flex items-center justify-center gap-1 px-2 py-1 bg-neutral-800 rounded-lg text-[10px] hover:bg-neutral-700 transition-colors"
                      >
                        <FileDown className="w-3 h-3" /> Page {i + 1}
                      </a>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setImages([]); reset(); }}
                  className="!text-white !border-neutral-600 hover:!bg-neutral-800"
                >
                  Convert Another PDF
                </Button>
              </div>
            )}
          </>
        );
      }}
    </PdfToolShell>
  );
};
