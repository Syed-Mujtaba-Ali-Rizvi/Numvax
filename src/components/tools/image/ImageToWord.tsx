'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import {
  Upload, Download, Camera, Trash2, RefreshCw, CheckCircle2,
  FileText, Plus, Eye, RotateCw, Contrast, AlertCircle, Layers
} from 'lucide-react';
import { createWorker } from 'tesseract.js';

interface PageImageItem {
  id: string;
  file: File;
  previewUrl: string;
  rotation: number;
  enhanceContrast: boolean;
  ocrText?: string;
}

export const ImageToWord: React.FC = () => {
  const [pages, setPages] = useState<PageImageItem[]>([]);
  const [state, setState] = useState<'idle' | 'processing' | 'done' | 'error'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [combinedText, setCombinedText] = useState<string>('');
  const [docxBlobUrl, setDocxBlobUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState<string>('scanned-document.docx');
  const [resultSize, setResultSize] = useState<number>(0);
  const [showPreviewText, setShowPreviewText] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Add files to page stack
  const handleAddFiles = (incomingFiles: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'];
    const newItems: PageImageItem[] = [];

    Array.from(incomingFiles).forEach(file => {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage(`File "${file.name}" exceeds 25MB limit.`);
        setState('error');
        return;
      }
      if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
        setErrorMessage(`File "${file.name}" is not a supported image (JPG, PNG, WebP).`);
        setState('error');
        return;
      }

      newItems.push({
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        rotation: 0,
        enhanceContrast: false,
      });
    });

    if (newItems.length > 0) {
      setPages(prev => [...prev, ...newItems]);
      setErrorMessage('');
      if (state === 'error') setState('idle');
    }
  };

  const removePage = (id: string) => {
    setPages(prev => {
      const target = prev.find(p => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(p => p.id !== id);
    });
  };

  const rotatePage = (id: string) => {
    setPages(prev =>
      prev.map(p => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const toggleContrast = (id: string) => {
    setPages(prev =>
      prev.map(p => (p.id === id ? { ...p, enhanceContrast: !p.enhanceContrast } : p))
    );
  };

  // Process image on canvas (apply rotation and optional high contrast)
  const processImageForOCR = (item: PageImageItem): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context not available'));

        const rad = (item.rotation * Math.PI) / 180;
        const isRotated = item.rotation === 90 || item.rotation === 270;
        canvas.width = isRotated ? img.height : img.width;
        canvas.height = isRotated ? img.width : img.height;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        // Enhance contrast if enabled
        if (item.enhanceContrast) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 4) {
            // Convert to grayscale
            const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
            // High contrast thresholding
            const val = avg > 140 ? 255 : 0;
            d[i] = val;
            d[i + 1] = val;
            d[i + 2] = val;
          }
          ctx.putImageData(imgData, 0, 0);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${item.file.name}`));
      img.src = item.previewUrl;
    });
  };

  // Perform OCR and DOCX Generation
  const handleStartConversion = async () => {
    if (pages.length === 0) return;
    setState('processing');
    setProgress(5);
    setStatusMessage('Initializing Tesseract OCR Engine...');
    setErrorMessage('');
    setCombinedText('');

    try {
      // 1. Initialize Tesseract worker
      const worker = await createWorker('eng');
      setProgress(15);

      let aggregatedText = '';
      const total = pages.length;

      for (let idx = 0; idx < total; idx++) {
        const item = pages[idx];
        setStatusMessage(`Processing page ${idx + 1} of ${total} using OCR...`);

        // Prepare image
        const processedDataUrl = await processImageForOCR(item);

        // Run OCR
        const { data } = await worker.recognize(processedDataUrl);
        const pageText = data.text ? data.text.trim() : '';

        aggregatedText += `--- Page ${idx + 1} ---\n\n${pageText || '[No text detected on this page]'}\n\n`;

        const stepProgress = 15 + Math.round(((idx + 1) / total) * 65);
        setProgress(stepProgress);
      }

      await worker.terminate();

      setCombinedText(aggregatedText);
      setStatusMessage('Generating Word (.docx) document...');
      setProgress(85);

      // 2. Generate DOCX using docx library
      const docxLib = await import('docx');
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } = docxLib;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const children: any[] = [];
      const sections = aggregatedText.split('--- Page ');

      sections.forEach((sec, idx) => {
        if (!sec.trim()) return;
        const pageLines = sec.split('\n').filter(Boolean);
        const titleLine = pageLines[0] ? `Page ${pageLines[0]}` : `Page ${idx}`;

        children.push(
          new Paragraph({
            text: titleLine,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
          })
        );

        // Add remaining lines as paragraphs
        const bodyLines = pageLines.slice(1);
        bodyLines.forEach(line => {
          if (line.startsWith('---')) return;
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 24, // 12pt
                }),
              ],
              spacing: { after: 120, line: 276 },
            })
          );
        });

        if (idx < sections.length - 1) {
          children.push(new Paragraph({ children: [new PageBreak()] }));
        }
      });

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);

      setDocxBlobUrl(url);
      setResultSize(blob.size);

      const firstFileName = pages[0].file.name.replace(/\.[^/.]+$/, '');
      setResultFileName(`${firstFileName}_scanned.docx`);

      setProgress(100);
      setState('done');
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMessage(err?.message || 'OCR processing failed. Please ensure the image contains clear text.');
      setState('error');
    }
  };

  const handleReset = () => {
    if (docxBlobUrl) URL.revokeObjectURL(docxBlobUrl);
    pages.forEach(p => URL.revokeObjectURL(p.previewUrl));
    setPages([]);
    setState('idle');
    setProgress(0);
    setStatusMessage('');
    setErrorMessage('');
    setCombinedText('');
    setDocxBlobUrl(null);
  };

  return (
    <Card className="flex flex-col gap-6">
      {/* Hidden File & Camera Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={e => e.target.files && handleAddFiles(e.target.files)}
        accept="image/jpeg,image/png,image/webp,image/bmp"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={e => e.target.files && handleAddFiles(e.target.files)}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Hero Upload Controls */}
      {state === 'idle' && pages.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-neutral-300 hover:border-neutral-900 bg-neutral-50/50 hover:bg-neutral-50 rounded-2xl transition-all gap-4 text-center">
          <div className="p-4 bg-white border border-neutral-200 rounded-full shadow-xs">
            <Upload className="w-8 h-8 text-neutral-900" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Upload Images or Scan Scanned Documents
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Supports JPG, PNG, WebP (Max 25MB per file). Camera scanning available on mobile devices.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Button variant="primary" size="md" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Select Images
            </Button>
            <Button variant="outline" size="md" onClick={() => cameraInputRef.current?.click()}>
              <Camera className="w-4 h-4 mr-2" /> Scan Document (Camera)
            </Button>
          </div>
        </div>
      )}

      {/* Pages Grid & Batch Management */}
      {pages.length > 0 && state === 'idle' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Selected Pages ({pages.length})
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Image
              </Button>
              <Button variant="outline" size="sm" onClick={() => cameraInputRef.current?.click()}>
                <Camera className="w-3.5 h-3.5 mr-1" /> Scan
              </Button>
            </div>
          </div>

          {/* Grid of Page Thumbnails */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pages.map((item, idx) => (
              <div
                key={item.id}
                className="relative bg-white border border-neutral-200 rounded-xl p-2 flex flex-col gap-2 group hover:border-neutral-900 transition-all"
              >
                <div className="relative aspect-[3/4] bg-neutral-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={item.previewUrl}
                    alt={`Page ${idx + 1}`}
                    className="max-h-full max-w-full object-contain transition-transform duration-300"
                    style={{
                      transform: `rotate(${item.rotation}deg)`,
                      filter: item.enhanceContrast ? 'contrast(200%) grayscale(100%)' : 'none',
                    }}
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-neutral-900/80 text-white text-[10px] font-bold rounded-md">
                    P. {idx + 1}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-100">
                  <button
                    onClick={() => rotatePage(item.id)}
                    title="Rotate 90°"
                    className="p-1 hover:bg-neutral-100 rounded text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleContrast(item.id)}
                    title="Toggle High Contrast for OCR"
                    className={`p-1 rounded cursor-pointer ${
                      item.enhanceContrast ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    <Contrast className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removePage(item.id)}
                    title="Remove Page"
                    className="p-1 hover:bg-red-50 rounded text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200">
            <span className="text-xs text-neutral-500">
              💡 Tip: Click contrast button to sharpen low-light scans for better OCR accuracy.
            </span>
            <Button variant="primary" size="lg" onClick={handleStartConversion} className="w-full sm:w-auto">
              <FileText className="w-4 h-4 mr-2" /> Convert {pages.length} Page(s) to Word (.docx)
            </Button>
          </div>
        </div>
      )}

      {/* Processing Progress */}
      {state === 'processing' && (
        <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
          <RefreshCw className="w-8 h-8 text-neutral-900 animate-spin" />
          <div>
            <h4 className="text-sm font-bold text-neutral-900">{statusMessage}</h4>
            <p className="text-xs text-neutral-500 mt-1">Processing Optical Character Recognition (OCR) locally...</p>
          </div>

          <div className="w-full max-w-md bg-neutral-100 h-2.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-neutral-900 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-neutral-700">{progress}%</span>
        </div>
      )}

      {/* Error Message & Retry */}
      {state === 'error' && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div className="text-xs font-bold text-red-900">{errorMessage}</div>
          <Button variant="outline" size="sm" onClick={() => setState('idle')} className="mt-1">
            Try Again
          </Button>
        </div>
      )}

      {/* Conversion Output Result */}
      {state === 'done' && docxBlobUrl && (
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-green-50 border border-green-200 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-900 font-bold text-base">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                OCR Conversion Completed!
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                Convert Another Image
              </Button>
            </div>

            <div className="text-xs text-neutral-600 flex flex-wrap gap-4">
              <span>📄 Original: <strong>{pages.length} Image Page(s)</strong></span>
              <span>💾 Output: <strong>.docx Word Document</strong></span>
              <span>⚡ Size: <strong>{Math.round(resultSize / 1024)} KB</strong></span>
            </div>

            <a
              href={docxBlobUrl}
              download={resultFileName}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-full transition-all shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Word Document (.docx)
            </a>
          </div>

          {/* Editable Text Preview */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Extracted OCR Text Preview & Editor
              </span>
              <button
                onClick={() => setShowPreviewText(!showPreviewText)}
                className="text-xs text-neutral-500 hover:text-neutral-900"
              >
                {showPreviewText ? 'Hide' : 'Show'}
              </button>
            </div>

            {showPreviewText && (
              <textarea
                value={combinedText}
                onChange={e => setCombinedText(e.target.value)}
                rows={8}
                className="w-full p-4 bg-white border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                placeholder="Extracted text will appear here..."
              />
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
