'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Download, QrCode, Upload, Camera, Trash2, Image as ImageIcon, Layers, Archive, FileText, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';
import JSZip from 'jszip';

interface BulkQrItem {
  id: number;
  text: string;
  qrDataUrl: string;
  filename: string;
}

interface QrCodeGeneratorProps {
  defaultMode?: 'single' | 'bulk';
}

export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ defaultMode = 'single' }) => {
  const [mode, setMode] = useState<'single' | 'bulk'>(defaultMode);

  // Single QR Mode State
  const [text, setText] = useState('https://numvax.com');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string>('');

  // Bulk QR Mode State (Up to 100 items)
  const [bulkInput, setBulkInput] = useState<string>(
    'https://numvax.com\nhttps://numvax.com/image-compressor\nhttps://numvax.com/qr-code-generator\nhttps://numvax.com/word-counter\nhttps://numvax.com/pdf-to-jpg'
  );
  const [bulkResults, setBulkResults] = useState<BulkQrItem[]>([]);
  const [isGeneratingBulk, setIsGeneratingBulk] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

  const removeLogo = () => {
    setLogoUrl(null);
  };

  const generateSingleQr = async () => {
    if (!text.trim()) {
      setQrUrl('');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, text, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#171717',
          light: '#ffffff',
        },
      });

      if (logoUrl) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = logoUrl;

          await new Promise<void>((resolve) => {
            img.onload = () => {
              const canvasWidth = canvas.width;
              const canvasHeight = canvas.height;

              const logoSize = Math.floor(canvasWidth * 0.22);
              const padding = Math.floor(logoSize * 0.15);
              const totalBoxSize = logoSize + padding * 2;

              const x = Math.floor((canvasWidth - totalBoxSize) / 2);
              const y = Math.floor((canvasHeight - totalBoxSize) / 2);

              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.roundRect ? ctx.roundRect(x, y, totalBoxSize, totalBoxSize, 8) : ctx.rect(x, y, totalBoxSize, totalBoxSize);
              ctx.fill();

              const logoX = Math.floor((canvasWidth - logoSize) / 2);
              const logoY = Math.floor((canvasHeight - logoSize) / 2);
              ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
              resolve();
            };
            img.onerror = () => resolve();
          });
        }
      }

      setQrUrl(canvas.toDataURL('image/png'));
    } catch {
      setQrUrl('');
    }
  };

  useEffect(() => {
    if (mode === 'single') {
      generateSingleQr();
    }
  }, [logoUrl, mode]);

  const generateBulkQrCodes = async () => {
    const rawLines = bulkInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 100); // Up to 100 items limit

    if (rawLines.length === 0) return;

    setIsGeneratingBulk(true);
    const results: BulkQrItem[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const lineText = rawLines[i];
      try {
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, lineText, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#171717', light: '#ffffff' },
        });

        if (logoUrl) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = logoUrl;

            await new Promise<void>((resolve) => {
              img.onload = () => {
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const logoSize = Math.floor(canvasWidth * 0.22);
                const padding = Math.floor(logoSize * 0.15);
                const totalBoxSize = logoSize + padding * 2;
                const x = Math.floor((canvasWidth - totalBoxSize) / 2);
                const y = Math.floor((canvasHeight - totalBoxSize) / 2);

                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.roundRect ? ctx.roundRect(x, y, totalBoxSize, totalBoxSize, 8) : ctx.rect(x, y, totalBoxSize, totalBoxSize);
                ctx.fill();

                const logoX = Math.floor((canvasWidth - logoSize) / 2);
                const logoY = Math.floor((canvasHeight - logoSize) / 2);
                ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
                resolve();
              };
              img.onerror = () => resolve();
            });
          }
        }

        const dataUrl = canvas.toDataURL('image/png');
        const safeSlug = lineText
          .replace(/https?:\/\//g, '')
          .replace(/[^a-zA-Z0-9]/g, '_')
          .substring(0, 25);
        const filename = `qr_${i + 1}_${safeSlug || 'item'}.png`;

        results.push({
          id: i + 1,
          text: lineText,
          qrDataUrl: dataUrl,
          filename,
        });
      } catch (err) {
        console.error('Error generating QR for item:', lineText, err);
      }
    }

    setBulkResults(results);
    setIsGeneratingBulk(false);
  };

  const handleTxtFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const textContent = event.target?.result as string;
        if (textContent) {
          setBulkInput(textContent);
        }
      };
      reader.readAsText(file);
    }
  };

  const downloadSingleQr = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'numvax-qrcode.png';
    a.click();
  };

  const downloadBulkQrItem = (item: BulkQrItem) => {
    const a = document.createElement('a');
    a.href = item.qrDataUrl;
    a.download = item.filename;
    a.click();
  };

  const downloadAllBulkZip = async () => {
    if (bulkResults.length === 0) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();

      for (let i = 0; i < bulkResults.length; i++) {
        const item = bulkResults[i];
        const base64Data = item.qrDataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(item.filename, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `numvax-bulk-qrcodes (${bulkResults.length} items).zip`;
      a.click();
    } catch (err) {
      console.error('Failed to create ZIP:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const linesCount = bulkInput
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0).length;

  return (
    <Card>
      <div className="flex flex-col gap-6">
        {/* Header & Mode Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900">QR Code Generation Engine</h2>
            <p className="text-xs text-neutral-500">Create single custom QR codes or batch generate up to 100 QR codes at once.</p>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('single')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'single' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Single QR
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                mode === 'bulk' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Batch Mode (Up to 100)
            </button>
          </div>
        </div>

        {/* Logo Upload (Applies to both Single & Bulk) */}
        <div className="flex flex-col gap-1.5 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
          <label className="text-xs font-semibold text-neutral-700">Center Branding Logo (Optional - Applies to all QR codes):</label>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-neutral-100 text-neutral-800 font-medium text-xs rounded-xl cursor-pointer transition-colors border border-neutral-300">
              <Upload className="w-3.5 h-3.5" /> Select Logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>

            <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-neutral-100 text-neutral-800 font-medium text-xs rounded-xl cursor-pointer transition-colors border border-neutral-300">
              <Camera className="w-3.5 h-3.5" /> Camera
              <input type="file" accept="image/*" capture="environment" onChange={handleLogoUpload} className="hidden" />
            </label>

            {logoUrl && (
              <Button variant="ghost" size="sm" onClick={removeLogo} className="text-red-600">
                <Trash2 className="w-3.5 h-3.5" /> Remove Logo
              </Button>
            )}

            {logoUrl && (
              <span className="text-xs text-green-700 font-semibold flex items-center gap-1 ml-auto">
                <CheckCircle className="w-3.5 h-3.5" /> Logo Active (High Error-Correction H 30% Auto-Applied)
              </span>
            )}
          </div>
        </div>

        {/* MODE 1: SINGLE QR CODE */}
        {mode === 'single' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-700">QR Code Target URL / Text:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter URL or text (e.g. https://numvax.com)"
                  className="flex-1 px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
                <Button variant="primary" size="md" onClick={generateSingleQr}>
                  Generate QR
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 border border-neutral-200 rounded-2xl gap-4">
              {qrUrl ? (
                <>
                  <img src={qrUrl} alt="Generated QR Code" className="w-56 h-56 border border-neutral-200 rounded-xl shadow-xs bg-white p-2" />
                  <Button variant="primary" size="md" onClick={downloadSingleQr}>
                    <Download className="w-4 h-4" /> Download High-Res QR Code
                  </Button>
                </>
              ) : (
                <div className="text-xs text-neutral-400 text-center py-8">Enter text above to render QR code</div>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: BATCH / BULK QR CODES (UP TO 100 ITEMS) */}
        {mode === 'bulk' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">
                  Paste URLs or Text Items (One per line - Max 100 items):
                </label>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${linesCount > 100 ? 'text-red-600' : 'text-neutral-500'}`}>
                    {linesCount} / 100 items
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-neutral-700 font-semibold cursor-pointer hover:underline">
                    <FileText className="w-3.5 h-3.5 text-neutral-600" /> Upload TXT/CSV
                    <input ref={bulkFileInputRef} type="file" accept=".txt,.csv" onChange={handleTxtFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={6}
                placeholder="https://site1.com&#10;https://site2.com&#10;Product-101&#10;Product-102"
                className="w-full p-3 bg-white border border-neutral-300 rounded-xl text-xs font-mono text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-neutral-900 text-white rounded-2xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">Batch Generator Engine</span>
                <span className="text-xs text-neutral-400">Generates high-resolution PNG QR codes for each line item.</span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={generateBulkQrCodes}
                  disabled={isGeneratingBulk || linesCount === 0}
                  className="bg-white text-neutral-900 hover:bg-neutral-100"
                >
                  {isGeneratingBulk ? 'Generating 100 QR Codes...' : `Generate Batch (${Math.min(linesCount, 100)})`}
                </Button>

                {bulkResults.length > 0 && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={downloadAllBulkZip}
                    disabled={isZipping}
                    className="bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700 flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    {isZipping ? 'Zipping QR Codes...' : `Download All ${bulkResults.length} (ZIP)`}
                  </Button>
                )}
              </div>
            </div>

            {/* Generated QR Codes Grid */}
            {bulkResults.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    Generated QR Codes ({bulkResults.length} Total)
                  </span>
                  <span className="text-xs text-neutral-500">Click any card to download individual QR code image</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {bulkResults.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => downloadBulkQrItem(item)}
                      className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-400 rounded-2xl transition-all cursor-pointer flex flex-col items-center gap-2 group"
                    >
                      <img src={item.qrDataUrl} alt={`QR ${item.id}`} className="w-28 h-28 object-contain bg-white rounded-lg p-1 border border-neutral-200" />
                      <span className="text-[11px] font-mono text-neutral-700 truncate w-full text-center group-hover:text-neutral-900 font-semibold">
                        #{item.id}: {item.text}
                      </span>
                      <span className="text-[10px] text-neutral-500 flex items-center gap-1 group-hover:text-neutral-900">
                        <Download className="w-3 h-3" /> Download PNG
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

