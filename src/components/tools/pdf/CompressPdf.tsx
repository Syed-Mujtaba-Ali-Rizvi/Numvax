'use client';

import React from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { Minimize2 } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { useTranslations } from 'next-intl';

export const CompressPdf: React.FC = () => {
  const t = useTranslations('pdfShell');
  const tHome = useTranslations('home');

  return (
    <PdfToolShell
      title={t('uploadPrompt', { action: t('compressPdf') })}
      description={tHome('featuredDescriptions.imageCompressor')}
    >
      {({ files, state, setState, setError, setProgress, setResultUrl, setResultName, setOriginalSize, setResultSize }) => {
        const handleCompress = async () => {
          if (files.length === 0) return;
          setState('processing');
          setProgress(10);
          try {
            const file = files[0];
            setOriginalSize(file.size);
            const buffer = await file.arrayBuffer();
            setProgress(30);

            const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
            setProgress(50);

            // Remove metadata to reduce size
            srcDoc.setTitle('');
            srcDoc.setAuthor('');
            srcDoc.setSubject('');
            srcDoc.setKeywords([]);
            srcDoc.setProducer('');
            srcDoc.setCreator('');

            setProgress(70);

            // Save with object-stream compression
            const compressedBytes = await srcDoc.save({
              useObjectStreams: true,
              addDefaultPage: false,
            });

            setProgress(90);

            const blob = new Blob([compressedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            setResultUrl(url);
            setResultSize(blob.size);
            setResultName(file.name.replace(/\.pdf$/i, '-compressed.pdf'));
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to compress PDF');
            setState('error');
          }
        };

        return (
          <>
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                  📊 {t('originalSize', { size: `${(files[0].size / (1024 * 1024)).toFixed(2)} MB` })}
                </div>
                <Button variant="primary" onClick={handleCompress}>
                  <Minimize2 className="w-4 h-4 mr-2" />
                  {t('compressPdf')}
                </Button>
              </div>
            )}
          </>
        );
      }}
    </PdfToolShell>
  );
};
