'use client';

import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Download, Share2, Edit3, PlusCircle, CheckCircle2 } from 'lucide-react';

export interface SuccessScreenProps {
  pdfBlobUrl: string;
  filename: string;
  pageCount: number;
  fileSizeBytes: number;
  onBackToEdit: () => void;
  onNewScan: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({
  pdfBlobUrl,
  filename,
  pageCount,
  fileSizeBytes,
  onBackToEdit,
  onNewScan,
}) => {
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const formattedSize =
    fileSizeBytes > 1024 * 1024
      ? `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(fileSizeBytes / 1024)} KB`;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    a.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const file = new File([await (await fetch(pdfBlobUrl)).blob()], filename, { type: 'application/pdf' });
        await navigator.share({
          files: [file],
          title: 'Scanned Document - Numvax',
          text: `Here is the scanned PDF: ${filename}`,
        });
      } catch {
        // User cancelled share dialog
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareMsg('Link copied to clipboard! (Native share not supported on this browser)');
      setTimeout(() => setShareMsg(null), 3000);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-6 p-6 sm:p-8 bg-white border border-neutral-200 rounded-2xl shadow-sm text-center animate-result">
      <div className="p-3 bg-emerald-100 text-emerald-800 rounded-full">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          ðŸŽ‰ Your PDF is Ready!
        </h2>
        <p className="text-xs text-neutral-500 font-mono">
          {filename} Â· {pageCount} Page{pageCount > 1 ? 's' : ''} Â· {formattedSize}
        </p>
      </div>

      {/* PDF Document Preview Box */}
      <div className="w-full max-w-sm h-64 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center p-2 shadow-inner">
        <iframe src={pdfBlobUrl} className="w-full h-full rounded-xl pointer-events-none" title="PDF Document Preview" />
      </div>

      {/* HARD UX REQUIREMENT: Download & Share buttons are FULL-SIZE and IMMEDIATELY VISIBLE */}
      <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3 mt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleDownload}
          className="w-full flex-1 py-3 text-sm font-bold shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download PDF
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleShare}
          className="w-full flex-1 py-3 text-sm font-bold border border-neutral-300 cursor-pointer"
        >
          <Share2 className="w-4 h-4" /> Share PDF
        </Button>
      </div>

      {shareMsg && (
        <p className="text-xs text-neutral-600 font-medium bg-neutral-100 px-3 py-1.5 rounded-full">
          {shareMsg}
        </p>
      )}

      {/* Secondary Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 w-full max-w-md justify-center">
        <Button variant="ghost" size="sm" onClick={onBackToEdit} className="text-neutral-600 hover:text-neutral-900">
          <Edit3 className="w-3.5 h-3.5" /> Back to Editor
        </Button>
        <Button variant="ghost" size="sm" onClick={onNewScan} className="text-neutral-600 hover:text-neutral-900">
          <PlusCircle className="w-3.5 h-3.5" /> New Scan Session
        </Button>
      </div>
    </div>
  );
};
