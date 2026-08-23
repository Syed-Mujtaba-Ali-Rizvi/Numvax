'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { FilePlus, Download, Trash2, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { useTranslations } from 'next-intl';

export const MergePdf: React.FC = () => {
  const t = useTranslations('pdfShell');
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter((f) => f.type === 'application/pdf');
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, idx) => idx !== index));
    setMergedPdfUrl(null);
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;
    const updated = [...files];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFiles(updated);
    setMergedPdfUrl(null);
  };

  const mergeFiles = async () => {
    if (files.length < 2) return;
    setIsMerging(true);
    try {
      const mergedDoc = await PDFDocument.create();

      for (const file of files) {
        const fileBuffer = await file.arrayBuffer();
        const doc = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach((page) => mergedDoc.addPage(page));
      }

      const mergedPdfBytes = await mergedDoc.save();
      const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch {
      // PDF merge error handling
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">{t('mergePdf')}</span>
          <Button variant="primary" size="sm" onClick={mergeFiles} disabled={files.length < 2 || isMerging}>
            {isMerging ? t('processing') : t('mergePdf')}
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl text-center gap-3">
          <FilePlus className="w-10 h-10 text-neutral-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-900">{t('selectFiles', { type: 'PDF' })}</span>
            <span className="text-xs text-neutral-500 mt-0.5">{t('maxSize', { size: 25 })}</span>
          </div>

          <label className="mt-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-full cursor-pointer transition-colors">
            {t('browseFiles', { type: 'PDF' })}
            <input type="file" accept="application/pdf" multiple onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        {files.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-900">{t('selectedFiles', { count: files.length })}</span>
              <Button
                variant="primary"
                size="sm"
                onClick={mergeFiles}
                disabled={files.length < 2 || isMerging}
              >
                {isMerging ? t('processing') : t('mergePdf')}
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2 font-medium text-neutral-800 truncate max-w-xs sm:max-w-md">
                    <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveFile(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveFile(idx, 'down')}
                      disabled={idx === files.length - 1}
                      className="p-1 text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => removeFile(idx)} className="p-1 text-red-500 hover:text-red-700 ml-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {mergedPdfUrl && (
          <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col items-center gap-4 text-center border border-neutral-800 animate-result">
            <span className="text-sm font-bold">{t('processingComplete')}</span>
            <a
              href={mergedPdfUrl}
              download="merged_numvax.pdf"
              className="px-6 py-2.5 bg-white text-neutral-900 font-bold text-xs rounded-full hover:bg-neutral-100 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> {t('download', { format: 'PDF' })}
            </a>
          </div>
        )}
      </div>
    </Card>
  );
};
