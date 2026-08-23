'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Camera, Upload, RotateCw, RotateCcw, Trash2, Download, Check, RefreshCw, Crop, Maximize, ArrowLeft } from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { EditStack, QualityPreset, FilterType } from './types';
import { SuccessScreen } from './SuccessScreen';

export const DocumentScanner: React.FC = () => {
  const [pages, setPages] = useState<EditStack[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [pendingPhotoBlob, setPendingPhotoBlob] = useState<{ blob: Blob; url: string } | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [quality, setQuality] = useState<QualityPreset>('average');
  const [filename, setFilename] = useState<string>('Scanned_Document');
  const [pdfResult, setPdfResult] = useState<{ url: string; size: number } | null>(null);

  // Finger Drag Crop Margins in percentages: top, bottom, left, right (0 to 45)
  const [cropMargins, setCropMargins] = useState({ top: 6, bottom: 6, left: 6, right: 6 });
  const [cropRotation, setCropRotation] = useState<number>(0);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [isCroppingPage, setIsCroppingPage] = useState<boolean>(false);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cropContainerRef = useRef<HTMLDivElement | null>(null);
  const draggingHandleRef = useRef<string | null>(null);

  // Direct native camera photo capture
  const handlePhotoCaptured = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPendingPhotoBlob({ blob: file, url });
      setCropMargins({ top: 6, bottom: 6, left: 6, right: 6 });
      setCropRotation(0);
      setActiveHandle(null);
    }
  };

  // Touch / Finger Drag Event Handlers for 8 Crop Handles
  const handleDragStart = (handleName: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    draggingHandleRef.current = handleName;
    setActiveHandle(handleName);
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!draggingHandleRef.current || !cropContainerRef.current) return;

    const rect = cropContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    // Calculate percentage boundaries (capped between 0% and 45% for safety)
    const xPct = Math.min(45, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(45, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    const xPctRight = Math.min(45, Math.max(0, ((rect.right - clientX) / rect.width) * 100));
    const yPctBottom = Math.min(45, Math.max(0, ((rect.bottom - clientY) / rect.height) * 100));

    const handle = draggingHandleRef.current;

    setCropMargins((prev) => {
      const next = { ...prev };
      if (handle === 'tl') {
        next.top = Math.round(yPct);
        next.left = Math.round(xPct);
      } else if (handle === 'tr') {
        next.top = Math.round(yPct);
        next.right = Math.round(xPctRight);
      } else if (handle === 'bl') {
        next.bottom = Math.round(yPctBottom);
        next.left = Math.round(xPct);
      } else if (handle === 'br') {
        next.bottom = Math.round(yPctBottom);
        next.right = Math.round(xPctRight);
      } else if (handle === 't') {
        next.top = Math.round(yPct);
      } else if (handle === 'b') {
        next.bottom = Math.round(yPctBottom);
      } else if (handle === 'l') {
        next.left = Math.round(xPct);
      } else if (handle === 'r') {
        next.right = Math.round(xPctRight);
      }
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    draggingHandleRef.current = null;
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => handleDragMove(e);
    const onEnd = () => handleDragEnd();

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // Canvas Crop & Rotate Execution
  const executeCropAndRotate = async (sourceUrl: string, rotationDeg: number): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;

        // Apply Crop Margins
        const cropX = (cropMargins.left / 100) * nw;
        const cropY = (cropMargins.top / 100) * nh;
        const cropW = Math.max(10, nw - cropX - (cropMargins.right / 100) * nw);
        const cropH = Math.max(10, nh - cropY - (cropMargins.bottom / 100) * nh);

        // Canvas setup for Crop + Rotation
        const canvas = document.createElement('canvas');
        const rot = (rotationDeg % 360 + 360) % 360;

        if (rot === 90 || rot === 270) {
          canvas.width = cropH;
          canvas.height = cropW;
        } else {
          canvas.width = cropW;
          canvas.height = cropH;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rot * Math.PI) / 180);

        if (rot === 90 || rot === 270) {
          ctx.drawImage(img, cropX, cropY, cropW, cropH, -cropH / 2, -cropW / 2, cropH, cropW);
        } else {
          ctx.drawImage(img, cropX, cropY, cropW, cropH, -cropW / 2, -cropH / 2, cropW, cropH);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({ blob, url });
            } else {
              reject(new Error('Blob creation failed'));
            }
          },
          'image/jpeg',
          0.95
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for cropping'));
      img.src = sourceUrl;
    });
  };

  // Confirm photo from CamScanner Finger Crop screen to Editor Stack
  const confirmPendingPhoto = async () => {
    if (!pendingPhotoBlob) return;

    let finalBlob = pendingPhotoBlob.blob;
    let finalUrl = pendingPhotoBlob.url;

    try {
      const cropped = await executeCropAndRotate(pendingPhotoBlob.url, cropRotation);
      finalBlob = cropped.blob;
      finalUrl = cropped.url;
    } catch {
      // Fallback to original photo
    }

    const newPage: EditStack = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      originalBlob: finalBlob,
      originalUrl: finalUrl,
      rotation: 0,
      adjustments: { brightness: 0, contrast: 0, exposure: 0 },
      filter: 'none',
    };
    setPages((prev) => [...prev, newPage]);
    setActivePageIndex(pages.length);
    setPendingPhotoBlob(null);
  };

  // Apply crop to existing page in workspace
  const applyCropToActivePage = async () => {
    const activePage = pages[activePageIndex];
    if (!activePage) return;

    try {
      const cropped = await executeCropAndRotate(activePage.originalUrl, cropRotation);
      setPages((prev) =>
        prev.map((p, i) =>
          i === activePageIndex
            ? { ...p, originalBlob: cropped.blob, originalUrl: cropped.url }
            : p
        )
      );
      setIsCroppingPage(false);
      setCropMargins({ top: 6, bottom: 6, left: 6, right: 6 });
    } catch {
      alert('Failed to crop picture.');
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setPendingPhotoBlob(null);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  // Page Controls
  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, rotation: ((p.rotation + 90) % 360) as 0 | 90 | 180 | 270 } : p))
    );
  };

  const applyFilterToPage = (index: number, filter: FilterType) => {
    setPages((prev) => prev.map((p, i) => (i === index ? { ...p, filter } : p)));
  };

  const deletePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
    if (activePageIndex >= pages.length - 1) {
      setActivePageIndex(Math.max(0, pages.length - 2));
    }
  };

  // PDF Export
  const generatePdf = async () => {
    if (pages.length === 0) return;
    setIsExporting(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const pageItem of pages) {
        const imgBuffer = await pageItem.originalBlob.arrayBuffer();
        const embeddedImg = await pdfDoc.embedJpg(imgBuffer);

        const pdfPage = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
        pdfPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: embeddedImg.width,
          height: embeddedImg.height,
        });

        if (pageItem.rotation !== 0) {
          pdfPage.setRotation(degrees(pageItem.rotation));
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfResult({ url, size: blob.size });
    } catch {
      alert('Failed to assemble PDF document. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  if (pdfResult) {
    return (
      <SuccessScreen
        pdfBlobUrl={pdfResult.url}
        filename={filename.endsWith('.pdf') ? filename : `${filename}.pdf`}
        pageCount={pages.length}
        fileSizeBytes={pdfResult.size}
        onBackToEdit={() => setPdfResult(null)}
        onNewScan={() => {
          setPages([]);
          setPdfResult(null);
          setActivePageIndex(0);
        }}
      />
    );
  }

  // CamScanner-Style Finger Crop Screen (Camera Capture Review)
  if (pendingPhotoBlob) {
    return (
      <div className="w-full flex flex-col bg-neutral-950 text-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-800">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md">
          <button
            onClick={retakePhoto}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Retake
          </button>
          <span className="text-sm font-extrabold tracking-tight">Crop Document</span>
          <div className="w-12" />
        </div>

        {/* Main Touch / Finger Drag Canvas & Image Container */}
        <div className="relative flex-1 flex items-center justify-center p-6 bg-neutral-950 min-h-[420px] select-none touch-none">
          <div
            ref={cropContainerRef}
            className="relative max-h-[460px] overflow-hidden rounded-lg shadow-2xl border border-neutral-800 flex items-center justify-center"
          >
            <img
              src={pendingPhotoBlob.url}
              alt="Scan Preview"
              style={{ transform: `rotate(${cropRotation}deg)` }}
              className="max-h-[440px] max-w-full object-contain rounded-lg transition-transform duration-200 pointer-events-none"
            />

            {/* Teal Finger-Drag Crop Box Overlay */}
            <div
              className="absolute border-2 border-[#00bfa5] bg-black/30 pointer-events-none shadow-2xl transition-all"
              style={{
                top: `${cropMargins.top}%`,
                bottom: `${cropMargins.bottom}%`,
                left: `${cropMargins.left}%`,
                right: `${cropMargins.right}%`,
              }}
            >
              {/* Active Handle Indicator Badge */}
              {activeHandle && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#00bfa5] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                  Dragging {activeHandle.toUpperCase()}
                </div>
              )}

              {/* Top-Left Corner Handle with 48px Large Touch Target */}
              <div
                onMouseDown={(e) => handleDragStart('tl', e)}
                onTouchStart={(e) => handleDragStart('tl', e)}
                className="absolute -top-6 -left-6 w-12 h-12 flex items-center justify-center pointer-events-auto cursor-nwse-resize touch-none"
              >
                <div
                  className={`w-7 h-7 bg-[#00bfa5] border-2 border-white rounded-full shadow-lg transition-transform ${
                    activeHandle === 'tl' ? 'scale-125 ring-4 ring-[#00bfa5]/40 bg-[#00e6c3]' : ''
                  }`}
                />
              </div>

              {/* Top-Right Corner Handle with 48px Large Touch Target */}
              <div
                onMouseDown={(e) => handleDragStart('tr', e)}
                onTouchStart={(e) => handleDragStart('tr', e)}
                className="absolute -top-6 -right-6 w-12 h-12 flex items-center justify-center pointer-events-auto cursor-nesw-resize touch-none"
              >
                <div
                  className={`w-7 h-7 bg-[#00bfa5] border-2 border-white rounded-full shadow-lg transition-transform ${
                    activeHandle === 'tr' ? 'scale-125 ring-4 ring-[#00bfa5]/40 bg-[#00e6c3]' : ''
                  }`}
                />
              </div>

              {/* Bottom-Left Corner Handle with 48px Large Touch Target */}
              <div
                onMouseDown={(e) => handleDragStart('bl', e)}
                onTouchStart={(e) => handleDragStart('bl', e)}
                className="absolute -bottom-6 -left-6 w-12 h-12 flex items-center justify-center pointer-events-auto cursor-nesw-resize touch-none"
              >
                <div
                  className={`w-7 h-7 bg-[#00bfa5] border-2 border-white rounded-full shadow-lg transition-transform ${
                    activeHandle === 'bl' ? 'scale-125 ring-4 ring-[#00bfa5]/40 bg-[#00e6c3]' : ''
                  }`}
                />
              </div>

              {/* Bottom-Right Corner Handle with 48px Large Touch Target */}
              <div
                onMouseDown={(e) => handleDragStart('br', e)}
                onTouchStart={(e) => handleDragStart('br', e)}
                className="absolute -bottom-6 -right-6 w-12 h-12 flex items-center justify-center pointer-events-auto cursor-nwse-resize touch-none"
              >
                <div
                  className={`w-7 h-7 bg-[#00bfa5] border-2 border-white rounded-full shadow-lg transition-transform ${
                    activeHandle === 'br' ? 'scale-125 ring-4 ring-[#00bfa5]/40 bg-[#00e6c3]' : ''
                  }`}
                />
              </div>

              {/* Top Side Handle with Large Touch Target */}
              <div
                onMouseDown={(e) => handleDragStart('t', e)}
                onTouchStart={(e) => handleDragStart('t', e)}
                className="absolute -top-5 left-1/2 -translate-x-1/2 w-16 h-10 flex items-center justify-center pointer-events-auto cursor-ns-resize touch-none"
              >
                <div
                  className={`w-8 h-4 bg-white border-2 border-[#00bfa5] rounded-full shadow-md transition-transform ${
                    activeHandle === 't' ? 'scale-125 border-[#00e6c3]' : ''
                  }`}
                />
              </div>

              {/* Bottom Side Handle with Large Touch Target */}
              <div
                onMouseDown={(e) => handleDragStart('b', e)}
                onTouchStart={(e) => handleDragStart('b', e)}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-10 flex items-center justify-center pointer-events-auto cursor-ns-resize touch-none"
              >
                <div
                  className={`w-8 h-4 bg-white border-2 border-[#00bfa5] rounded-full shadow-md transition-transform ${
                    activeHandle === 'b' ? 'scale-125 border-[#00e6c3]' : ''
                  }`}
                />
              </div>

              {/* Left Side Handle with Large Touch Target */}
              <div
                onMouseDown={(e) => handleDragStart('l', e)}
                onTouchStart={(e) => handleDragStart('l', e)}
                className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-16 flex items-center justify-center pointer-events-auto cursor-ew-resize touch-none"
              >
                <div
                  className={`w-4 h-8 bg-white border-2 border-[#00bfa5] rounded-full shadow-md transition-transform ${
                    activeHandle === 'l' ? 'scale-125 border-[#00e6c3]' : ''
                  }`}
                />
              </div>

              {/* Right Side Handle with Large Touch Target */}
              <div
                onMouseDown={(e) => handleDragStart('r', e)}
                onTouchStart={(e) => handleDragStart('r', e)}
                className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-16 flex items-center justify-center pointer-events-auto cursor-ew-resize touch-none"
              >
                <div
                  className={`w-4 h-8 bg-white border-2 border-[#00bfa5] rounded-full shadow-md transition-transform ${
                    activeHandle === 'r' ? 'scale-125 border-[#00e6c3]' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CamScanner Style Bottom Action Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-900 border-t border-neutral-800">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCropRotation((prev) => (prev - 90 + 360) % 360)}
              className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="text-[10px] font-medium">Left</span>
            </button>

            <button
              onClick={() => setCropRotation((prev) => (prev + 90) % 360)}
              className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCw className="w-5 h-5" />
              <span className="text-[10px] font-medium">Right</span>
            </button>

            <button
              onClick={() => setCropMargins({ top: 6, bottom: 6, left: 6, right: 6 })}
              className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Crop className="w-5 h-5" />
              <span className="text-[10px] font-medium">Auto Crop</span>
            </button>

            <button
              onClick={() => setCropMargins({ top: 0, bottom: 0, left: 0, right: 0 })}
              className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <Maximize className="w-5 h-5" />
              <span className="text-[10px] font-medium">All</span>
            </button>
          </div>

          {/* Big Green Checkmark Confirm Button */}
          <button
            onClick={confirmPendingPhoto}
            className="w-12 h-12 rounded-2xl bg-[#00bfa5] hover:bg-[#00a892] text-white flex items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer"
            title="Save Cropped Picture"
          >
            <Check className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      </div>
    );
  }

  const activePage = pages[activePageIndex];

  return (
    <Card>
      <div className="flex flex-col gap-6">
        {/* Hidden Camera & Gallery File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoCaptured}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoCaptured}
          className="hidden"
        />

        {/* Scan Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-full transition-colors cursor-pointer shadow-xs"
            >
              <Camera className="w-4 h-4" /> Scan Document / Photo
            </button>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium text-xs rounded-full transition-colors border border-neutral-300 cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Upload Photos
            </button>
          </div>

          <span className="text-xs text-neutral-500 font-medium">
            {pages.length} Page{pages.length === 1 ? '' : 's'} in session
          </span>
        </div>

        {/* Empty Session State */}
        {pages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl text-center gap-3">
            <div className="p-3 bg-neutral-100 rounded-full text-neutral-600">
              <Camera className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-neutral-900">No Pages Scanned Yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm">
                Tap <strong>&quot;Scan Document / Photo&quot;</strong> to open your phone&apos;s camera directly, crop pictures by finger drag, and build PDF documents.
              </p>
            </div>
          </div>
        )}

        {/* Page Editing Workspace */}
        {pages.length > 0 && activePage && (
          <div className="flex flex-col md:flex-row gap-6 border-t border-neutral-200 pt-6">
            {/* Main Page Preview Box */}
            <div className="flex-1 flex flex-col items-center gap-3 bg-neutral-50 border border-neutral-200 p-4 rounded-2xl">
              <div className="relative max-w-full overflow-hidden flex items-center justify-center p-2">
                <img
                  src={activePage.originalUrl}
                  alt={`Page ${activePageIndex + 1}`}
                  style={{
                    transform: `rotate(${activePage.rotation}deg)`,
                    filter:
                      activePage.filter === 'grayscale'
                        ? 'grayscale(100%)'
                        : activePage.filter === 'bw'
                        ? 'contrast(200%) grayscale(100%)'
                        : 'none',
                  }}
                  className="max-h-96 object-contain rounded-xl shadow-xs transition-transform duration-200"
                />

                {isCroppingPage && (
                  <div
                    className="absolute border-2 border-[#00bfa5] bg-black/30 pointer-events-none shadow-2xl transition-all"
                    style={{
                      top: `${cropMargins.top}%`,
                      bottom: `${cropMargins.bottom}%`,
                      left: `${cropMargins.left}%`,
                      right: `${cropMargins.right}%`,
                    }}
                  />
                )}
              </div>

              {/* In-Workspace Finger Crop Panel when Cropping active */}
              {isCroppingPage && (
                <div className="w-full flex flex-col gap-3 p-3 bg-neutral-900 text-white border border-neutral-800 rounded-xl text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Finger Drag Crop Active:</span>
                    <button
                      type="button"
                      onClick={() => setIsCroppingPage(false)}
                      className="text-neutral-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setCropMargins({ top: 6, bottom: 6, left: 6, right: 6 })}
                      className="px-3 py-1 bg-neutral-800 rounded-md text-[11px] hover:bg-neutral-700"
                    >
                      Auto Crop
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropMargins({ top: 0, bottom: 0, left: 0, right: 0 })}
                      className="px-3 py-1 bg-neutral-800 rounded-md text-[11px] hover:bg-neutral-700"
                    >
                      Full Image
                    </button>
                    <Button variant="primary" size="sm" onClick={applyCropToActivePage} className="!bg-[#00bfa5] hover:!bg-[#00a892] text-white">
                      <Check className="w-3.5 h-3.5" /> Save Crop
                    </Button>
                  </div>
                </div>
              )}

              {/* Page Controls Toolbar */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  variant={isCroppingPage ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setIsCroppingPage(!isCroppingPage)}
                >
                  <Crop className="w-3.5 h-3.5" /> {isCroppingPage ? 'Cropping Active' : 'Crop Picture'}
                </Button>

                <Button variant="outline" size="sm" onClick={() => rotatePage(activePageIndex)}>
                  <RotateCw className="w-3.5 h-3.5" /> Rotate 90°
                </Button>

                <select
                  value={activePage.filter}
                  onChange={(e) => applyFilterToPage(activePageIndex, e.target.value as FilterType)}
                  className="text-xs bg-white border border-neutral-300 rounded-full px-3 py-1.5 text-neutral-800 focus:outline-none cursor-pointer"
                >
                  <option value="none">Filter: Original</option>
                  <option value="grayscale">Filter: Grayscale</option>
                  <option value="bw">Filter: B&W Document</option>
                </select>

                <Button variant="ghost" size="sm" onClick={() => deletePage(activePageIndex)} className="text-red-600">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </div>

            {/* Side Page Manager & PDF Config */}
            <div className="w-full md:w-72 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-neutral-900">Multi-Page Manager:</span>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-neutral-50 border border-neutral-200 rounded-xl">
                  {pages.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActivePageIndex(idx);
                        setIsCroppingPage(false);
                      }}
                      className={`relative w-14 h-18 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        idx === activePageIndex ? 'border-neutral-900 ring-2 ring-neutral-400' : 'border-neutral-300'
                      }`}
                    >
                      <img src={p.originalUrl} className="w-full h-full object-cover" alt={`Thumb ${idx + 1}`} />
                      <span className="absolute bottom-0 right-0 bg-neutral-900 text-white text-[9px] font-bold px-1 rounded-tl">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Settings */}
              <div className="flex flex-col gap-3 pt-3 border-t border-neutral-200">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-700">File Name:</label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-neutral-700">Quality Preset:</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as QualityPreset)}
                    className="text-xs bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-neutral-800 focus:outline-none cursor-pointer"
                  >
                    <option value="small">Small (~300-500 KB/page)</option>
                    <option value="average">Average (~1-2 MB/page - Default)</option>
                    <option value="large">Large (High Res)</option>
                  </select>
                </div>

                <Button variant="primary" size="md" onClick={generatePdf} disabled={isExporting} className="w-full mt-2">
                  <Download className="w-4 h-4" /> {isExporting ? 'Generating PDF...' : 'Create PDF Document'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
