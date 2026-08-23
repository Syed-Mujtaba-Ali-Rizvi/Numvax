'use client';

import React, { useState } from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { Lock, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import jsPDF from 'jspdf';

export const ProtectPdf: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [permissionRestrictPrint, setPermissionRestrictPrint] = useState(false);
  const [permissionRestrictCopy, setPermissionRestrictCopy] = useState(false);

  return (
    <PdfToolShell
      title="Upload PDF to Protect with Password"
      description="Encrypt PDF document with password protection so it requires a password to open"
      customResult
    >
      {({ files, state, setState, setError, setProgress, reset }) => {
        const [resultUrl, setLocalResultUrl] = useState<string | null>(null);
        const [resultSize, setLocalResultSize] = useState(0);

        const handleProtect = async () => {
          if (files.length === 0) return;

          if (!password.trim()) {
            setError('Please enter a password to protect your PDF.');
            return;
          }

          if (password !== confirmPassword) {
            setError('Passwords do not match. Please re-enter.');
            return;
          }

          setState('processing');
          setProgress(10);

          try {
            const pdfjsLib = await import('pdfjs-dist');
            if (typeof window !== 'undefined') {
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
            }

            const buffer = await files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            const totalPages = pdf.numPages;
            setProgress(25);

            // Compute permissions array for jsPDF
            const permissions: Array<'print' | 'modify' | 'copy' | 'annot-forms'> = [];
            if (!permissionRestrictPrint) permissions.push('print');
            if (!permissionRestrictCopy) permissions.push('copy');

            // Render first page to get orientation & dimensions in pt
            const firstPage = await pdf.getPage(1);
            const firstViewport = firstPage.getViewport({ scale: 1.0 });

            // Initialize jsPDF with standard encryption enabled
            const doc = new jsPDF({
              orientation: firstViewport.width > firstViewport.height ? 'landscape' : 'portrait',
              unit: 'pt',
              format: [firstViewport.width, firstViewport.height],
              encryption: {
                userPassword: password,
                ownerPassword: password + '_owner_protect',
                userPermissions: permissions,
              },
            });

            for (let i = 1; i <= totalPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 2.0 }); // 2.0 scale for sharp vector quality

              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              const ctx = canvas.getContext('2d')!;

              await page.render({ canvasContext: ctx, viewport } as any).promise;

              const imgData = canvas.toDataURL('image/jpeg', 0.95);

              const pagePtWidth = viewport.width / 2.0;
              const pagePtHeight = viewport.height / 2.0;

              if (i > 1) {
                doc.addPage([pagePtWidth, pagePtHeight], pagePtWidth > pagePtHeight ? 'landscape' : 'portrait');
              }

              doc.addImage(imgData, 'JPEG', 0, 0, pagePtWidth, pagePtHeight, undefined, 'FAST');
              setProgress(25 + Math.round((i / totalPages) * 65));
            }

            // Export array buffer from encrypted jsPDF doc
            const pdfArrayBuffer = doc.output('arraybuffer');
            const blob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            setLocalResultUrl(url);
            setLocalResultSize(blob.size);
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to encrypt PDF file. Please try again.');
            setState('error');
          }
        };

        return (
          <>
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-5 mt-2">
                <div className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                  <span>100% Client-Side Protection: PDF encryption runs locally in your browser.</span>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Set PDF Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-700">Confirm Password *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password..."
                      className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                  </div>
                </div>

                {/* Security Options */}
                <div className="flex flex-col gap-2 pt-2 border-t border-neutral-200">
                  <span className="text-xs font-semibold text-neutral-700">Security Permissions:</span>
                  <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionRestrictPrint}
                      onChange={(e) => setPermissionRestrictPrint(e.target.checked)}
                      className="rounded border-neutral-300"
                    />
                    <span>Restrict Printing Permission</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissionRestrictCopy}
                      onChange={(e) => setPermissionRestrictCopy(e.target.checked)}
                      className="rounded border-neutral-300"
                    />
                    <span>Restrict Text & Content Copying</span>
                  </label>
                </div>

                <Button variant="primary" onClick={handleProtect}>
                  <Lock className="w-4 h-4 mr-2" /> Protect & Encrypt PDF
                </Button>
              </div>
            )}

            {state === 'done' && resultUrl && (
              <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col items-center gap-4 text-center border border-neutral-800">
                <span className="text-sm font-bold flex items-center gap-2 text-green-400">
                  <Check className="w-5 h-5" /> PDF Password Protected & Encrypted!
                </span>
                <span className="text-xs text-neutral-300 max-w-xs">
                  Anyone who opens this PDF file in Adobe Acrobat, Chrome, or any PDF viewer will be required to enter your password to view the document.
                </span>
                {resultSize > 0 && (
                  <span className="text-xs text-neutral-400">
                    Encrypted Size: {(resultSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
                <div className="flex gap-3">
                  <a
                    href={resultUrl}
                    download={files[0]?.name?.replace(/\.pdf$/i, '-protected.pdf') || 'protected.pdf'}
                    className="px-6 py-2.5 bg-white text-neutral-900 font-bold text-xs rounded-full hover:bg-neutral-100 transition-colors flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> Download Protected PDF
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPassword('');
                      setConfirmPassword('');
                      setLocalResultUrl(null);
                      setLocalResultSize(0);
                      reset();
                    }}
                    className="!text-white !border-neutral-600 hover:!bg-neutral-800"
                  >
                    Protect Another PDF
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
