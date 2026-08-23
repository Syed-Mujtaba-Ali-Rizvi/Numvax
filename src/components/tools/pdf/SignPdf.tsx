'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { PenTool, Download, Type, Eraser } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

type SignatureMode = 'draw' | 'type';

export const SignPdf: React.FC = () => {
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw');
  const [signatureText, setSignatureText] = useState('');
  const [signatureFont, setSignatureFont] = useState('cursive');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [pagePreview, setPagePreview] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sigPosition, setSigPosition] = useState({ x: 50, y: 80 });
  const [sigSize, setSigSize] = useState({ w: 200, h: 60 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || signatureMode !== 'draw') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [signatureMode]);

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getCanvasPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = () => {
    isDrawing.current = false;
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl(null);
  };

  const generateTypedSignature = () => {
    if (!signatureText.trim()) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000000';
    ctx.font = `48px ${signatureFont}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(signatureText, 20, 60);
    setSignatureDataUrl(canvas.toDataURL('image/png'));
  };

  return (
    <PdfToolShell
      title="Upload a PDF to add your signature"
      description="Draw or type your signature and place it on any page"
      customResult
    >
      {({ files, state, setState, setError, setProgress, reset }) => {
        const [resultUrl, setLocalResultUrl] = useState<string | null>(null);

        const loadPreview = async () => {
          if (files.length === 0) return;
          try {
            const pdfjsLib = await import('pdfjs-dist');
            if (typeof window !== 'undefined') {
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
            }
            const buffer = await files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            setTotalPages(pdf.numPages);
            const page = await pdf.getPage(selectedPage + 1);
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d')!;
            await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
            setPagePreview(canvas.toDataURL('image/jpeg', 0.8));
          } catch {
            // Preview load failed silently
          }
        };

        if (files.length > 0 && !pagePreview && state === 'idle') {
          loadPreview();
        }

        const handleSign = async () => {
          if (!signatureDataUrl || files.length === 0) return;
          setState('processing');
          setProgress(10);

          try {
            const buffer = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
            setProgress(30);

            // Convert signature to PNG bytes
            const sigResponse = await fetch(signatureDataUrl);
            const sigBlob = await sigResponse.blob();
            const sigBuffer = await sigBlob.arrayBuffer();
            const sigImage = await pdfDoc.embedPng(new Uint8Array(sigBuffer));
            setProgress(50);

            const page = pdfDoc.getPage(selectedPage);
            const { width, height } = page.getSize();

            // Position signature (convert percentage to absolute)
            const sigX = (sigPosition.x / 100) * width;
            const sigY = height - (sigPosition.y / 100) * height - sigSize.h * 0.5;

            page.drawImage(sigImage, {
              x: sigX,
              y: sigY,
              width: sigSize.w * 0.5,
              height: sigSize.h * 0.5,
              opacity: 1,
            });

            setProgress(80);

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setLocalResultUrl(url);
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add signature');
            setState('error');
          }
        };

        return (
          <>
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                {/* Signature Mode Toggle */}
                <div className="flex gap-2">
                  <button onClick={() => setSignatureMode('draw')}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      signatureMode === 'draw' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}>
                    <PenTool className="w-3.5 h-3.5" /> Draw
                  </button>
                  <button onClick={() => setSignatureMode('type')}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      signatureMode === 'type' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}>
                    <Type className="w-3.5 h-3.5" /> Type
                  </button>
                </div>

                {/* Draw Canvas */}
                {signatureMode === 'draw' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-neutral-700">Draw your signature below:</label>
                    <div className="relative border border-neutral-300 rounded-xl overflow-hidden bg-white">
                      <canvas
                        ref={canvasRef}
                        width={400}
                        height={120}
                        className="w-full cursor-crosshair touch-none"
                        onMouseDown={startDraw}
                        onMouseMove={draw}
                        onMouseUp={endDraw}
                        onMouseLeave={endDraw}
                        onTouchStart={startDraw}
                        onTouchMove={draw}
                        onTouchEnd={endDraw}
                      />
                      <button onClick={clearCanvas}
                        className="absolute top-2 right-2 p-1.5 bg-neutral-100 rounded-lg text-neutral-500 hover:text-neutral-900">
                        <Eraser className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Type Signature */}
                {signatureMode === 'type' && (
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                      placeholder="Type your name..."
                      className="px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                    <select value={signatureFont} onChange={(e) => setSignatureFont(e.target.value)}
                      className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400">
                      <option value="cursive">Cursive</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                    </select>
                    {signatureText && (
                      <div className="p-4 bg-white border border-neutral-200 rounded-xl">
                        <span style={{ fontFamily: signatureFont, fontSize: '32px' }}>{signatureText}</span>
                      </div>
                    )}
                    <Button variant="outline" size="sm" onClick={generateTypedSignature} disabled={!signatureText.trim()}>
                      Generate Signature
                    </Button>
                  </div>
                )}

                {/* Page Selection & Position */}
                {totalPages > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-neutral-700">Page</label>
                      <select value={selectedPage} onChange={(e) => { setSelectedPage(parseInt(e.target.value)); setPagePreview(null); }}
                        className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <option key={i} value={i}>Page {i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-neutral-700">Position X (%)</label>
                      <input type="range" min="0" max="100" value={sigPosition.x}
                        onChange={(e) => setSigPosition(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                        className="accent-neutral-900" />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-neutral-700">Position Y (%)</label>
                  <input type="range" min="0" max="100" value={sigPosition.y}
                    onChange={(e) => setSigPosition(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                    className="accent-neutral-900" />
                </div>

                {/* Preview */}
                {pagePreview && signatureDataUrl && (
                  <div className="relative border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
                    <img src={pagePreview} alt="Page preview" className="w-full" />
                    <img
                      src={signatureDataUrl}
                      alt="Signature"
                      className="absolute pointer-events-none"
                      style={{
                        left: `${sigPosition.x}%`,
                        top: `${sigPosition.y}%`,
                        width: `${sigSize.w * 0.3}px`,
                        height: `${sigSize.h * 0.3}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  </div>
                )}

                <Button variant="primary" onClick={handleSign} disabled={!signatureDataUrl}>
                  <PenTool className="w-4 h-4 mr-2" />
                  Add Signature to PDF
                </Button>
              </div>
            )}

            {state === 'done' && resultUrl && (
              <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col items-center gap-4 text-center border border-neutral-800">
                <span className="text-sm font-bold">✍️ Signature Added Successfully!</span>
                <div className="flex gap-3">
                  <a href={resultUrl} download={files[0]?.name?.replace(/\.pdf$/i, '-signed.pdf') || 'signed.pdf'}
                    className="px-6 py-2.5 bg-white text-neutral-900 font-bold text-xs rounded-full hover:bg-neutral-100 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download Signed PDF
                  </a>
                  <Button variant="outline" size="sm"
                    onClick={() => { setSignatureDataUrl(null); setPagePreview(null); setTotalPages(0); setLocalResultUrl(null); reset(); }}
                    className="!text-white !border-neutral-600 hover:!bg-neutral-800">
                    Sign Another PDF
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
