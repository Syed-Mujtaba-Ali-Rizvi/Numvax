'use client';

import React, { useState } from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { Droplets } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';

export const WatermarkPdf: React.FC = () => {
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.15);
  const [rotation, setRotation] = useState(45);
  const [color, setColor] = useState('#888888');

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  return (
    <PdfToolShell
      title="Upload a PDF to add a watermark"
      description="Add custom text watermarks across all pages of your PDF"
    >
      {({ files, state, setState, setError, setProgress, setResultUrl, setResultName, setOriginalSize, setResultSize }) => {
        const handleWatermark = async () => {
          if (files.length === 0 || !watermarkText.trim()) return;
          setState('processing');
          setProgress(10);

          try {
            setOriginalSize(files[0].size);
            const buffer = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();
            const { r, g, b } = hexToRgb(color);

            setProgress(30);

            for (let i = 0; i < pages.length; i++) {
              const page = pages[i];
              const { width, height } = page.getSize();

              // Calculate text width to center it
              const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
              const x = (width - textWidth) / 2;
              const y = height / 2;

              page.drawText(watermarkText, {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(r, g, b),
                opacity,
                rotate: degrees(rotation),
              });

              setProgress(30 + Math.round(((i + 1) / pages.length) * 60));
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            setResultUrl(url);
            setResultSize(blob.size);
            setResultName(files[0].name.replace(/\.pdf$/i, '-watermarked.pdf'));
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add watermark');
            setState('error');
          }
        };

        return (
          <>
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                {/* Watermark Text */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-neutral-700">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="CONFIDENTIAL"
                    className="px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                  />
                </div>

                {/* Settings Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-700">Font Size</label>
                    <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400">
                      <option value={24}>Small (24)</option>
                      <option value={36}>Medium (36)</option>
                      <option value={48}>Large (48)</option>
                      <option value={72}>Extra Large (72)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-700">Opacity ({Math.round(opacity * 100)}%)</label>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="accent-neutral-900 mt-1"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-700">Rotation ({rotation}°)</label>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      step="5"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="accent-neutral-900 mt-1"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-700">Color</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-9 rounded-xl border border-neutral-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="relative bg-white border border-neutral-200 rounded-xl p-8 flex items-center justify-center h-40 overflow-hidden">
                  <span
                    className="text-center select-none pointer-events-none"
                    style={{
                      fontSize: `${Math.min(fontSize, 36)}px`,
                      fontWeight: 'bold',
                      color: color,
                      opacity: opacity,
                      transform: `rotate(-${rotation}deg)`,
                      fontFamily: 'Helvetica, Arial, sans-serif',
                    }}
                  >
                    {watermarkText || 'PREVIEW'}
                  </span>
                </div>

                <Button variant="primary" onClick={handleWatermark} disabled={!watermarkText.trim()}>
                  <Droplets className="w-4 h-4 mr-2" />
                  Add Watermark to All Pages
                </Button>
              </div>
            )}
          </>
        );
      }}
    </PdfToolShell>
  );
};
