'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Upload, Download, AlertCircle, RefreshCw, FileText, X, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type PdfToolState = 'idle' | 'processing' | 'done' | 'error';

interface PdfToolShellProps {
  title: string;
  description: string;
  acceptTypes?: string;
  acceptLabel?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  children?: (props: {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    state: PdfToolState;
    setState: React.Dispatch<React.SetStateAction<PdfToolState>>;
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
    error: string;
    setError: React.Dispatch<React.SetStateAction<string>>;
    resultUrl: string | null;
    setResultUrl: React.Dispatch<React.SetStateAction<string | null>>;
    resultName: string;
    setResultName: React.Dispatch<React.SetStateAction<string>>;
    originalSize: number;
    setOriginalSize: React.Dispatch<React.SetStateAction<number>>;
    resultSize: number;
    setResultSize: React.Dispatch<React.SetStateAction<number>>;
    reset: () => void;
  }) => React.ReactNode;
  /* When true, the child component handles its own result UI */
  customResult?: boolean;
}

export const PdfToolShell: React.FC<PdfToolShellProps> = ({
  title,
  description,
  acceptTypes = 'application/pdf',
  acceptLabel = 'PDF',
  multiple = false,
  maxSizeMB = 25,
  children,
  customResult = false,
}) => {
  const t = useTranslations('pdfShell');
  const tCommon = useTranslations('common');

  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<PdfToolState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState('output.pdf');
  const [originalSize, setOriginalSize] = useState(0);
  const [resultSize, setResultSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFiles([]);
    setState('idle');
    setProgress(0);
    setError('');
    setResultUrl(null);
    setResultName('output.pdf');
    setOriginalSize(0);
    setResultSize(0);
  }, [resultUrl]);

  const validateAndAddFiles = useCallback((incoming: File[]) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    const accepted = acceptTypes.split(',').map(t => t.trim());

    for (const f of incoming) {
      if (f.size > maxBytes) {
        setError(`File "${f.name}" exceeds ${maxSizeMB}MB limit.`);
        setState('error');
        return;
      }
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      const mimeOk = accepted.some(a => f.type === a || a === '*/*');
      const extOk = accepted.some(a => {
        if (a === 'application/pdf') return ext === 'pdf';
        if (a.includes('word') || a.includes('docx')) return ['doc', 'docx'].includes(ext);
        if (a.includes('image')) return ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'].includes(ext);
        return false;
      });
      if (!mimeOk && !extOk) {
        setError(`File "${f.name}" is not a supported ${acceptLabel} file.`);
        setState('error');
        return;
      }
    }

    setError('');
    setState('idle');
    if (multiple) {
      setFiles(prev => [...prev, ...incoming]);
    } else {
      setFiles(incoming.slice(0, 1));
    }
  }, [acceptTypes, acceptLabel, maxSizeMB, multiple]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(Array.from(e.dataTransfer.files));
    }
  }, [validateAndAddFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
      setState('idle');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const childProps = {
    files, setFiles, state, setState, progress, setProgress,
    error, setError, resultUrl, setResultUrl, resultName, setResultName,
    originalSize, setOriginalSize, resultSize, setResultSize, reset,
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">{title}</span>
          <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()}>
            {t('selectFiles', { type: acceptLabel })}
          </Button>
        </div>

        {/* Upload Zone */}
        {state !== 'done' && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl text-center gap-3 transition-colors cursor-pointer ${
              isDragging
                ? 'border-neutral-900 bg-neutral-100'
                : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={`w-10 h-10 ${isDragging ? 'text-neutral-700' : 'text-neutral-400'}`} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-900">{title}</span>
              <span className="text-xs text-neutral-500 mt-0.5">{description}</span>
            </div>
            <label className="mt-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs rounded-full cursor-pointer transition-colors">
              {t('browseFiles', { type: acceptLabel })}
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptTypes}
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden"
                onClick={(e) => e.stopPropagation()}
              />
            </label>
            <span className="text-[10px] text-neutral-400">{t('maxSize', { size: maxSizeMB })}</span>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && state !== 'done' && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-neutral-900">
              {files.length === 1 ? t('selectedFile') : t('selectedFiles', { count: files.length })}
            </span>
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-xl text-xs">
                <div className="flex items-center gap-2 font-medium text-neutral-800 truncate max-w-xs sm:max-w-md">
                  <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-[10px] text-neutral-400 font-mono">({formatSize(file.size)})</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="p-1 text-red-500 hover:text-red-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Processing State */}
        {state === 'processing' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-10 h-10 border-3 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            <span className="text-sm font-semibold text-neutral-900">{t('processing')}</span>
            {progress > 0 && (
              <div className="w-full max-w-xs">
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neutral-900 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500 mt-1">{progress}%</span>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="flex flex-col items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-2xl text-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="text-sm font-semibold text-red-800">{error || tCommon('error')}</span>
            <Button variant="outline" size="sm" onClick={reset}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> {t('tryAgain')}
            </Button>
          </div>
        )}

        {/* Tool-specific controls & processing */}
        {children && children(childProps)}

        {/* Default Result State */}
        {state === 'done' && resultUrl && !customResult && (
          <div className="p-6 bg-neutral-900 text-white rounded-2xl flex flex-col items-center gap-4 text-center border border-neutral-800">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            <span className="text-sm font-bold">{t('processingComplete')}</span>
            {originalSize > 0 && resultSize > 0 && (
              <div className="flex gap-4 text-xs">
                <span>{t('original', { size: formatSize(originalSize) })}</span>
                <span>{t('result', { size: formatSize(resultSize) })}</span>
                {resultSize < originalSize && (
                  <span className="text-green-400">
                    -{Math.round((1 - resultSize / originalSize) * 100)}%
                  </span>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <a
                href={resultUrl}
                download={resultName}
                className="px-6 py-2.5 bg-white text-neutral-900 font-bold text-xs rounded-full hover:bg-neutral-100 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> {t('download', { format: resultName.split('.').pop()?.toUpperCase() || 'PDF' })}
              </a>
              <Button variant="outline" size="sm" onClick={reset} className="!text-white !border-neutral-600 hover:!bg-neutral-800">
                {t('processAnother')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
