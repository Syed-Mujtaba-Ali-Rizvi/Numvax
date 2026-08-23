'use client';

import React, { useState } from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { Image, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export const JpgToPdf: React.FC = () => {
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'original'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [previews, setPreviews] = useState<string[]>([]);

  return (
    <PdfToolShell
      title="Upload images to convert to PDF"
      description="Convert JPG, PNG, or WebP images into a multi-page PDF document"
      acceptTypes="image/jpeg,image/png,image/webp,image/bmp"
      acceptLabel="Image"
      multiple
      customResult
    >
      {({ files, setFiles, state, setState, setError, setProgress, setResultUrl, setResultName, reset }) => {
        // Generate previews when files change
        if (files.length > 0 && previews.length !== files.length) {
          Promise.all(
            files.map(f => {
              return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(f);
              });
            })
          ).then(setPreviews);
        }

        const moveImage = (idx: number, dir: 'up' | 'down') => {
          const target = dir === 'up' ? idx - 1 : idx + 1;
          if (target < 0 || target >= files.length) return;
          const newFiles = [...files];
          [newFiles[idx], newFiles[target]] = [newFiles[target], newFiles[idx]];
          setFiles(newFiles);
          const newPreviews = [...previews];
          [newPreviews[idx], newPreviews[target]] = [newPreviews[target], newPreviews[idx]];
          setPreviews(newPreviews);
        };

        const removeImage = (idx: number) => {
          setFiles(prev => prev.filter((_, i) => i !== idx));
          setPreviews(prev => prev.filter((_, i) => i !== idx));
        };

        const handleConvert = async () => {
          if (files.length === 0) return;
          setState('processing');
          setProgress(5);

          try {
            const pdfDoc = await PDFDocument.create();

            const pageSizes: Record<string, { w: number; h: number }> = {
              a4: { w: 595.28, h: 841.89 },
              letter: { w: 612, h: 792 },
            };

            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const bytes = await file.arrayBuffer();
              const uint8 = new Uint8Array(bytes);

              let image;
              const ext = file.name.split('.').pop()?.toLowerCase() || '';
              const mime = file.type;

              if (mime === 'image/png' || ext === 'png') {
                image = await pdfDoc.embedPng(uint8);
              } else {
                // Convert non-JPEG images to JPEG via canvas
                if (mime !== 'image/jpeg' && ext !== 'jpg' && ext !== 'jpeg') {
                  const canvas = document.createElement('canvas');
                  const img = document.createElement('img');
                  await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error('Failed to load image'));
                    img.src = URL.createObjectURL(file);
                  });
                  canvas.width = img.naturalWidth;
                  canvas.height = img.naturalHeight;
                  const ctx = canvas.getContext('2d')!;
                  ctx.drawImage(img, 0, 0);
                  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
                  const base64 = jpegDataUrl.split(',')[1];
                  const jpegBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                  image = await pdfDoc.embedJpg(jpegBytes);
                  URL.revokeObjectURL(img.src);
                } else {
                  image = await pdfDoc.embedJpg(uint8);
                }
              }

              let pw: number, ph: number;

              if (pageSize === 'original') {
                pw = image.width;
                ph = image.height;
              } else {
                const size = pageSizes[pageSize];
                pw = orientation === 'portrait' ? size.w : size.h;
                ph = orientation === 'portrait' ? size.h : size.w;
              }

              const page = pdfDoc.addPage([pw, ph]);

              // Scale image to fit page while maintaining aspect ratio
              const imgAspect = image.width / image.height;
              const pageAspect = pw / ph;
              let drawW: number, drawH: number;

              if (imgAspect > pageAspect) {
                drawW = pw;
                drawH = pw / imgAspect;
              } else {
                drawH = ph;
                drawW = ph * imgAspect;
              }

              const x = (pw - drawW) / 2;
              const y = (ph - drawH) / 2;

              page.drawImage(image, { x, y, width: drawW, height: drawH });

              setProgress(5 + Math.round(((i + 1) / files.length) * 85));
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            setResultUrl(url);
            setResultName('images-to-pdf.pdf');
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to convert images to PDF');
            setState('error');
          }
        };

        return (
          <>
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                {/* Image previews with reorder */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={preview}
                        alt={`Image ${idx + 1}`}
                        className="w-full aspect-[3/4] object-cover rounded-xl border border-neutral-200"
                      />
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveImage(idx, 'up')} disabled={idx === 0}
                          className="p-1 bg-white/90 rounded-md text-neutral-600 hover:text-neutral-900 disabled:opacity-30">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moveImage(idx, 'down')} disabled={idx === files.length - 1}
                          className="p-1 bg-white/90 rounded-md text-neutral-600 hover:text-neutral-900 disabled:opacity-30">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeImage(idx)}
                          className="p-1 bg-white/90 rounded-md text-red-500 hover:text-red-700">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded-md">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-700">Page Size</label>
                    <select value={pageSize} onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter' | 'original')}
                      className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400">
                      <option value="a4">A4</option>
                      <option value="letter">Letter</option>
                      <option value="original">Original Size</option>
                    </select>
                  </div>
                  {pageSize !== 'original' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-neutral-700">Orientation</label>
                      <select value={orientation} onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                        className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400">
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                      </select>
                    </div>
                  )}
                </div>

                <Button variant="primary" onClick={handleConvert}>
                  <Image className="w-4 h-4 mr-2" />
                  Convert {files.length} Image{files.length !== 1 ? 's' : ''} to PDF
                </Button>
              </div>
            )}

            {state === 'done' && (
              <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col items-center gap-4 text-center border border-neutral-800">
                <span className="text-sm font-bold">📄 Images Converted to PDF!</span>
                <span className="text-xs text-neutral-400">{files.length} page{files.length !== 1 ? 's' : ''} created</span>
                <div className="flex gap-3">
                  <a href={/* resultUrl is set in parent shell state */ undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      // Access parent result URL through DOM
                      const link = document.createElement('a');
                      link.href = (document.querySelector('[data-pdf-result-url]') as HTMLElement)?.dataset.pdfResultUrl || '';
                      link.download = 'images-to-pdf.pdf';
                      link.click();
                    }}
                    className="px-6 py-2.5 bg-white text-neutral-900 font-bold text-xs rounded-full hover:bg-neutral-100 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    Download PDF
                  </a>
                  <Button variant="outline" size="sm" onClick={() => { setPreviews([]); reset(); }} className="!text-white !border-neutral-600 hover:!bg-neutral-800">
                    Convert More Images
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
