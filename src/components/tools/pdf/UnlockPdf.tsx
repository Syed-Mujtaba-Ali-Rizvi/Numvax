'use client';

import React, { useState } from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { Unlock, Eye, EyeOff } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export const UnlockPdf: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [needsPassword, setNeedsPassword] = useState<boolean | null>(null);

  return (
    <PdfToolShell
      title="Upload a password-protected PDF to unlock"
      description="Remove password protection from PDF files (you must know the password)"
      customResult
    >
      {({ files, state, setState, setError, setProgress, reset }) => {
        const [resultUrl, setLocalResultUrl] = useState<string | null>(null);
        const [resultSize, setLocalResultSize] = useState(0);

        // Check if PDF is password-protected when file is selected
        const checkProtection = async () => {
          if (files.length === 0) return;
          try {
            const buffer = await files[0].arrayBuffer();
            // Try to load without password
            try {
              await PDFDocument.load(buffer);
              setNeedsPassword(false);
            } catch {
              setNeedsPassword(true);
            }
          } catch {
            setNeedsPassword(true);
          }
        };

        if (files.length > 0 && needsPassword === null && state === 'idle') {
          checkProtection();
        }

        const handleUnlock = async () => {
          if (files.length === 0) return;
          setState('processing');
          setProgress(10);

          try {
            const buffer = await files[0].arrayBuffer();
            setProgress(30);

            let pdfDoc: PDFDocument;
            try {
              pdfDoc = await PDFDocument.load(buffer, {
                ignoreEncryption: true,
                ...(password ? { password } : {}),
              } as any);
            } catch {
              setError('Incorrect password. Please try again.');
              setState('error');
              return;
            }

            setProgress(60);

            // Save without encryption
            const newPdfBytes = await pdfDoc.save();
            const blob = new Blob([newPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            setLocalResultUrl(url);
            setLocalResultSize(blob.size);
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to unlock PDF. The password may be incorrect.');
            setState('error');
          }
        };

        return (
          <>
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                {needsPassword === false && (
                  <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
                    ✅ This PDF does not appear to be password-protected. You can still re-save it to ensure all restrictions are removed.
                  </div>
                )}

                {needsPassword === true && (
                  <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    🔒 This PDF is password-protected. Enter the password below to unlock it.
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-neutral-700">PDF Password</label>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button variant="primary" onClick={handleUnlock}>
                  <Unlock className="w-4 h-4 mr-2" />
                  {needsPassword ? 'Unlock PDF' : 'Remove Restrictions & Save'}
                </Button>
              </div>
            )}

            {state === 'done' && resultUrl && (
              <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col items-center gap-4 text-center border border-neutral-800">
                <span className="text-sm font-bold">🔓 PDF Unlocked Successfully!</span>
                {resultSize > 0 && (
                  <span className="text-xs text-neutral-400">
                    Output: {(resultSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                )}
                <div className="flex gap-3">
                  <a href={resultUrl} download={files[0]?.name?.replace(/\.pdf$/i, '-unlocked.pdf') || 'unlocked.pdf'}
                    className="px-6 py-2.5 bg-white text-neutral-900 font-bold text-xs rounded-full hover:bg-neutral-100 transition-colors flex items-center gap-2">
                    <Unlock className="w-4 h-4" /> Download Unlocked PDF
                  </a>
                  <Button variant="outline" size="sm"
                    onClick={() => { setPassword(''); setNeedsPassword(null); setLocalResultUrl(null); setLocalResultSize(0); reset(); }}
                    className="!text-white !border-neutral-600 hover:!bg-neutral-800">
                    Unlock Another PDF
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
