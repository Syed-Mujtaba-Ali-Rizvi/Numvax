'use client';

import React, { useState, useRef } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Upload, Download, Image as ImageIcon, CheckCircle, FolderOpen, Archive, Trash2, Layers } from 'lucide-react';
import JSZip from 'jszip';

interface ImageToolsProps {
  toolSlug: string;
  defaultMode?: 'single' | 'bulk';
}

interface BulkImageItem {
  id: string;
  file: File;
  originalUrl: string;
  processedUrl: string | null;
  processedBlob: Blob | null;
  originalSize: number;
  processedSize: number | null;
  width: number;
  height: number;
  status: 'idle' | 'processing' | 'done' | 'error';
}

export const ImageTools: React.FC<ImageToolsProps> = ({ toolSlug, defaultMode }) => {
  const initialMode = defaultMode || (toolSlug === 'bulk-image-compressor' ? 'bulk' : 'single');
  const [mode, setMode] = useState<'single' | 'bulk'>(initialMode);
  
  // Single mode state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [resizeMode, setResizeMode] = useState<'exact' | 'scale'>('exact');
  const [scalePercent, setScalePercent] = useState<number>(50);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedSize, setProcessedSize] = useState<number | null>(null);
  const [filterBrightness, setFilterBrightness] = useState<number>(100);
  const [filterContrast, setFilterContrast] = useState<number>(100);
  const [filterGrayscale, setFilterGrayscale] = useState<number>(0);

  // Bulk mode state (Up to 50 images)
  const [bulkItems, setBulkItems] = useState<BulkImageItem[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bulkFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSingleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setProcessedUrl(null);
      setProcessedBlob(null);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        setTargetWidth(img.width);
        setTargetHeight(img.height);
      };
    }
  };

  const handleBulkSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files).slice(0, 50); // Max 50 files
    if (selectedFiles.length === 0) return;

    const newItems: BulkImageItem[] = selectedFiles.map((file, idx) => {
      const url = URL.createObjectURL(file);
      return {
        id: `${file.name}-${idx}-${Date.now()}`,
        file,
        originalUrl: url,
        processedUrl: null,
        processedBlob: null,
        originalSize: file.size,
        processedSize: null,
        width: 0,
        height: 0,
        status: 'idle',
      };
    });

    setBulkItems(newItems);
  };

  const processSingleImage = () => {
    if (!imageUrl) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      let finalW = targetWidth || img.width;
      let finalH = targetHeight || img.height;

      if (resizeMode === 'scale') {
        finalW = Math.round((img.width * scalePercent) / 100);
        finalH = Math.round((img.height * scalePercent) / 100);
      }

      canvas.width = finalW;
      canvas.height = finalH;

      ctx.filter = `brightness(${filterBrightness}%) contrast(${filterContrast}%) grayscale(${filterGrayscale}%)`;
      ctx.drawImage(img, 0, 0, finalW, finalH);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedBlob(blob);
            setProcessedUrl(URL.createObjectURL(blob));
            setProcessedSize(blob.size);
          }
        },
        outputFormat,
        quality
      );
    };
  };

  const processBulkImages = async () => {
    if (bulkItems.length === 0) return;
    setIsBulkProcessing(true);

    const updatedItems = [...bulkItems];

    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];
      item.status = 'processing';
      setBulkItems([...updatedItems]);

      await new Promise<void>((resolve) => {
        const img = new Image();
        img.src = item.originalUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            item.status = 'error';
            resolve();
            return;
          }

          let finalW = targetWidth || img.width;
          let finalH = targetHeight || img.height;

          if (resizeMode === 'scale') {
            finalW = Math.round((img.width * scalePercent) / 100);
            finalH = Math.round((img.height * scalePercent) / 100);
          }

          canvas.width = finalW;
          canvas.height = finalH;

          ctx.filter = `brightness(${filterBrightness}%) contrast(${filterContrast}%) grayscale(${filterGrayscale}%)`;
          ctx.drawImage(img, 0, 0, finalW, finalH);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                item.processedBlob = blob;
                item.processedUrl = URL.createObjectURL(blob);
                item.processedSize = blob.size;
                item.width = finalW;
                item.height = finalH;
                item.status = 'done';
              } else {
                item.status = 'error';
              }
              resolve();
            },
            outputFormat,
            quality
          );
        };
        img.onerror = () => {
          item.status = 'error';
          resolve();
        };
      });

      setBulkItems([...updatedItems]);
    }

    setIsBulkProcessing(false);
  };

  const downloadSingleImage = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
    a.download = `numvax_edited_image.${ext}`;
    a.click();
  };

  const downloadBulkZip = async () => {
    const processedList = bulkItems.filter((item) => item.processedBlob && item.status === 'done');
    if (processedList.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';

      processedList.forEach((item, index) => {
        const baseName = item.file.name.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}_resized_${index + 1}.${ext}`;
        if (item.processedBlob) {
          zip.file(filename, item.processedBlob);
        }
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);

      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `numvax_bulk_processed_images (${processedList.length} files).zip`;
      a.click();
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const downloadSingleBulkItem = (item: BulkImageItem) => {
    if (!item.processedUrl) return;
    const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
    const baseName = item.file.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = item.processedUrl;
    a.download = `${baseName}_resized.${ext}`;
    a.click();
  };

  const removeBulkItem = (id: string) => {
    setBulkItems(bulkItems.filter((i) => i.id !== id));
  };

  const totalOriginalSize = bulkItems.reduce((acc, i) => acc + i.originalSize, 0);
  const totalProcessedSize = bulkItems.reduce((acc, i) => acc + (i.processedSize || 0), 0);
  const totalDoneCount = bulkItems.filter((i) => i.status === 'done').length;
  const savedPercentage =
    totalOriginalSize > 0 && totalProcessedSize > 0
      ? Math.round(((totalOriginalSize - totalProcessedSize) / totalOriginalSize) * 100)
      : 0;

  const getToolActionLabel = () => {
    switch (toolSlug) {
      case 'image-compressor': return 'Compress Image';
      case 'image-resizer': return 'Resize Image';
      case 'image-converter': return 'Convert Format';
      case 'image-filter': return 'Apply Filters';
      default: return 'Process Image';
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        {/* Header & Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 capitalize">{toolSlug.replace('-', ' ')} Engine</h2>
            <p className="text-xs text-neutral-500">Process single images or batch convert up to 50 images at once.</p>
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('single')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === 'single' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Single Image
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                mode === 'bulk' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Batch Mode (Up to 50)
            </button>
          </div>
        </div>

        {/* Global Controls Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
          {toolSlug === 'image-compressor' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-700">Compression Quality: {Math.round(quality * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="accent-neutral-900 cursor-pointer"
              />
            </div>
          )}

          {(toolSlug === 'image-resizer' || toolSlug === 'image-compressor') && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-700">Resize Method:</label>
                <select
                  value={resizeMode}
                  onChange={(e) => setResizeMode(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900"
                >
                  <option value="exact">Exact Dimensions (px)</option>
                  <option value="scale">Scale Percentage (%)</option>
                </select>
              </div>

              {resizeMode === 'exact' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-neutral-700">Width (px)</label>
                    <input
                      type="number"
                      value={targetWidth}
                      onChange={(e) => setTargetWidth(Number(e.target.value))}
                      className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-neutral-700">Height (px)</label>
                    <input
                      type="number"
                      value={targetHeight}
                      onChange={(e) => setTargetHeight(Number(e.target.value))}
                      className="px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-700">Scale Factor: {scalePercent}%</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={scalePercent}
                    onChange={(e) => setScalePercent(Number(e.target.value))}
                    className="accent-neutral-900 cursor-pointer"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-700">Output Format:</label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as any)}
              className="px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl text-neutral-900 font-medium"
            >
              <option value="image/jpeg">JPG / JPEG Format</option>
              <option value="image/png">PNG Format</option>
              <option value="image/webp">WebP Format</option>
            </select>
          </div>
        </div>

        {/* MODE 1: SINGLE IMAGE MODE */}
        {mode === 'single' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-700">Select Image File:</label>
              <label className="flex flex-col items-center justify-center p-8 bg-neutral-50 hover:bg-neutral-100/80 border-2 border-dashed border-neutral-300 rounded-2xl cursor-pointer transition-colors text-center gap-2">
                <Upload className="w-6 h-6 text-neutral-600" />
                <span className="text-xs font-semibold text-neutral-800">
                  {imageFile ? imageFile.name : 'Choose an image from your device'}
                </span>
                <span className="text-[11px] text-neutral-500">Supports JPG, PNG, WebP (Processed locally in browser)</span>
                <input type="file" accept="image/*" onChange={handleSingleImageSelect} className="hidden" />
              </label>
            </div>

            {imageUrl && (
              <div className="flex flex-col md:flex-row gap-6 border-t border-neutral-200 pt-6">
                <div className="w-full md:w-80 flex flex-col gap-4">
                  <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Processing Controls</span>

                  {toolSlug === 'image-filter' && (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-neutral-700">Brightness: {filterBrightness}%</label>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={filterBrightness}
                          onChange={(e) => setFilterBrightness(Number(e.target.value))}
                          className="accent-neutral-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-neutral-700">Contrast: {filterContrast}%</label>
                        <input
                          type="range"
                          min="50"
                          max="200"
                          value={filterContrast}
                          onChange={(e) => setFilterContrast(Number(e.target.value))}
                          className="accent-neutral-900"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-neutral-700">Grayscale: {filterGrayscale}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={filterGrayscale}
                          onChange={(e) => setFilterGrayscale(Number(e.target.value))}
                          className="accent-neutral-900"
                        />
                      </div>
                    </div>
                  )}

                  <Button variant="primary" size="md" onClick={processSingleImage} className="w-full mt-2">
                    {getToolActionLabel()}
                  </Button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-4 bg-neutral-50 border border-neutral-200 rounded-2xl gap-4">
                  <img src={processedUrl || imageUrl} alt="Preview" className="max-h-80 object-contain rounded-xl border border-neutral-300" />

                  {processedUrl && processedSize && (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-xs text-neutral-600 font-medium">
                        Processed Size: {(processedSize / 1024).toFixed(1)} KB (Original: {((imageFile?.size || 0) / 1024).toFixed(1)} KB)
                      </span>
                      <Button variant="primary" size="md" onClick={downloadSingleImage}>
                        <Download className="w-4 h-4" /> Download Processed Image
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: BATCH / BULK MODE (UP TO 50 IMAGES) */}
        {mode === 'bulk' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700">Select Folder or Up to 50 Image Files:</label>
                <span className="text-xs font-bold text-neutral-500">{bulkItems.length} / 50 files selected</span>
              </div>

              <label className="flex flex-col items-center justify-center p-8 bg-neutral-50 hover:bg-neutral-100/80 border-2 border-dashed border-neutral-300 rounded-2xl cursor-pointer transition-colors text-center gap-2">
                <FolderOpen className="w-8 h-8 text-neutral-600" />
                <span className="text-sm font-bold text-neutral-800">
                  {bulkItems.length > 0 ? `${bulkItems.length} Images Selected` : 'Click to Select Folder or Up to 50 Images'}
                </span>
                <span className="text-xs text-neutral-500">Hold Ctrl or Shift to choose multiple images from your computer</span>
                <input
                  ref={bulkFileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBulkSelect}
                  className="hidden"
                />
              </label>
            </div>

            {bulkItems.length > 0 && (
              <div className="flex flex-col gap-4 border-t border-neutral-200 pt-4">
                {/* Batch Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-neutral-900 text-white rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Batch Processing Action
                    </span>
                    <span className="text-xs text-neutral-400">
                      {totalDoneCount > 0 ? `${totalDoneCount} of ${bulkItems.length} images processed` : `Ready to process ${bulkItems.length} images`}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={processBulkImages}
                      disabled={isBulkProcessing}
                      className="bg-white text-neutral-900 hover:bg-neutral-100 w-full sm:w-auto"
                    >
                      {isBulkProcessing ? 'Processing Batch...' : `Batch Process All (${bulkItems.length})`}
                    </Button>

                    {totalDoneCount > 0 && (
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={downloadBulkZip}
                        disabled={isZipping}
                        className="bg-neutral-800 text-white hover:bg-neutral-700 w-full sm:w-auto border border-neutral-700 flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        {isZipping ? 'Creating ZIP...' : 'Download All (ZIP)'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Batch Savings Summary */}
                {totalDoneCount > 0 && totalOriginalSize > 0 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between text-xs text-green-900 gap-2">
                    <span className="font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" /> Total Batch Space Savings: {savedPercentage}% saved
                    </span>
                    <span>
                      Original: {(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB → Processed: {(totalProcessedSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}

                {/* Image List Table */}
                <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-200 bg-white">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-neutral-100 text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                    <div className="col-span-5 sm:col-span-4">File Name</div>
                    <div className="col-span-3 sm:col-span-3">Original Size</div>
                    <div className="col-span-3 sm:col-span-3">Result Size</div>
                    <div className="col-span-1 sm:col-span-2 text-right">Action</div>
                  </div>

                  {bulkItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 p-3 items-center text-xs text-neutral-800">
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-2 truncate">
                        <ImageIcon className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span className="truncate font-medium">{item.file.name}</span>
                      </div>

                      <div className="col-span-3 sm:col-span-3 text-neutral-500 font-mono text-[11px]">
                        {(item.originalSize / 1024).toFixed(1)} KB
                      </div>

                      <div className="col-span-3 sm:col-span-3 font-mono text-[11px]">
                        {item.status === 'done' && item.processedSize ? (
                          <span className="text-green-700 font-bold">{(item.processedSize / 1024).toFixed(1)} KB</span>
                        ) : item.status === 'processing' ? (
                          <span className="text-amber-600 animate-pulse">Processing...</span>
                        ) : (
                          <span className="text-neutral-400">Pending</span>
                        )}
                      </div>

                      <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-1">
                        {item.status === 'done' && (
                          <button
                            onClick={() => downloadSingleBulkItem(item)}
                            className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
                            title="Download single file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => removeBulkItem(item.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

