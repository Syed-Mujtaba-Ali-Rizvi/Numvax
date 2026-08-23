'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Download, Upload, Camera, Trash2, Check, ShieldCheck, Image as ImageIcon, Eye } from 'lucide-react';
import QRCode from 'qrcode';

export const ImageQrCodeGenerator: React.FC = () => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>('');
  const [targetViewerUrl, setTargetViewerUrl] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [scannedImage, setScannedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // When page loads, check if opened via QR scan (URL query parameter or hash containing photo data)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const params = new URLSearchParams(window.location.search);
      const imgParam = params.get('img');

      if (imgParam) {
        setScannedImage(decodeURIComponent(imgParam));
      } else if (hash && hash.startsWith('#photo=')) {
        try {
          const raw = decodeURIComponent(hash.replace('#photo=', ''));
          setScannedImage(raw);
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreviewUrl(URL.createObjectURL(file));
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          // Compress thumbnail for URL hash so phone cameras read clean HTTPS web link
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 120;
            let w = img.width;
            let h = img.height;
            if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
            else { w = Math.round((w * maxDim) / h); h = maxDim; }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              const tinyData = canvas.toDataURL('image/jpeg', 0.3);
              const fullWebUrl = `${window.location.origin}/image-qr-code-generator?img=${encodeURIComponent(tinyData)}`;
              setTargetViewerUrl(fullWebUrl);
            }
            setIsProcessing(false);
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreviewUrl('');
    setTargetViewerUrl('');
    setQrUrl('');
  };

  const generateQr = async () => {
    if (!targetViewerUrl) return;
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, targetViewerUrl, {
        width: 440,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#171717', light: '#ffffff' },
      });
      setQrUrl(canvas.toDataURL('image/png'));
    } catch {
      setQrUrl('');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadQr = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = 'numvax-photo-qr-code.png';
    a.click();
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Photo QR Code Generator</span>
          <Button variant="primary" size="sm" onClick={generateQr} disabled={!targetViewerUrl || isProcessing}>
            {isProcessing ? 'Generating...' : 'Generate Photo QR Code'}
          </Button>
        </div>

        {/* Scanned Image Display Modal (When scanned via camera) */}
        {scannedImage && (
          <div className="p-6 bg-green-50 border-2 border-green-300 rounded-2xl flex flex-col items-center gap-4 text-center">
            <span className="text-sm font-bold text-green-900 flex items-center gap-2">
              Scanned QR Photo Result:
            </span>
            <div className="p-2 bg-white rounded-xl shadow-sm border border-green-200">
              <img src={scannedImage} alt="Scanned Photo" className="max-w-xs max-h-72 object-contain rounded-lg" />
            </div>
            <a
              href={scannedImage}
              download="scanned-qr-photo.jpg"
              className="px-5 py-2 bg-green-800 text-white font-bold text-xs rounded-full hover:bg-green-900 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Scanned Photo
            </a>
          </div>
        )}

        {/* Info Banner */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 leading-relaxed">
          <div>
            <span className="font-bold text-neutral-900 block mb-0.5">Phone Camera Compatible Photo QR Code:</span>
            Phone cameras require an HTTPS web link to display pictures. This tool encodes a web viewer link into the QR code. When scanned with any phone camera, it opens NumVax and displays your picture full screen!
          </div>
        </div>

        {/* Step 1: Upload or Snap Photo */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              1. Select Photo / Picture to Embed
            </span>
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'upload' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => setActiveTab('camera')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'camera' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
                }`}
              >
                Camera
              </button>
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />

          {!photoFile ? (
            <div
              onClick={() => (activeTab === 'upload' ? fileInputRef.current?.click() : cameraInputRef.current?.click())}
              className="flex flex-col items-center justify-center py-10 px-4 bg-neutral-50 border border-dashed border-neutral-300 rounded-2xl hover:border-neutral-900 transition-colors cursor-pointer gap-2 text-center"
            >
              <div className="p-3 bg-neutral-100 rounded-full text-neutral-700">
                {activeTab === 'upload' ? <Upload className="w-6 h-6" /> : <Camera className="w-6 h-6" />}
              </div>
              <span className="text-sm font-bold text-neutral-900">
                {activeTab === 'upload' ? 'Select Photo from Gallery' : 'Take Picture with Camera'}
              </span>
              <span className="text-xs text-neutral-500 max-w-xs">
                When scanned, phone camera opens browser and displays this picture.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <img src={photoPreviewUrl} alt="Selected preview" className="w-14 h-14 object-cover rounded-xl border border-neutral-300 shadow-xs" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-neutral-900">{photoFile.name}</span>
                  {isProcessing ? (
                    <span className="text-[11px] text-amber-600 font-medium">Preparing web photo link...</span>
                  ) : (
                    <span className="text-[11px] text-green-700 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Web Photo Link Generated
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={removePhoto} className="text-red-600">
                <Trash2 className="w-4 h-4" /> Remove
              </Button>
            </div>
          )}
        </div>

        {/* Step 2: Scannable QR Code Render */}
        <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 border border-neutral-200 rounded-2xl gap-4">
          {qrUrl ? (
            <>
              <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm flex flex-col items-center gap-2">
                <img src={qrUrl} alt="Scannable Photo QR Code" className="w-64 h-64 object-contain rounded-xl" />
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-600 font-medium text-center max-w-sm">
                <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                <span>100% Phone Camera Compatible: Scanning with iPhone or Android camera opens NumVax and displays the picture!</span>
              </div>

              <Button variant="primary" size="md" onClick={downloadQr} className="mt-2">
                <Download className="w-4 h-4" /> Download Photo QR Code
              </Button>
            </>
          ) : (
            <div className="text-xs text-neutral-400 text-center py-8">Select a photo above to generate QR code</div>
          )}
        </div>
      </div>
    </Card>
  );
};
