'use client';

import React, { useState } from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { FileText, CheckCircle2, Download, RefreshCw, Eye, AlertTriangle } from 'lucide-react';

export const PdfToWord: React.FC = () => {
  const [extractedPreview, setExtractedPreview] = useState<string>('');
  const [pageCount, setPageCount] = useState<number>(0);
  const [showTextPreview, setShowTextPreview] = useState<boolean>(false);

  return (
    <PdfToolShell
      title="Upload a PDF file to convert to Word"
      description="Extract text, headings, and layout structure into an editable Microsoft Word (.docx) document"
      maxSizeMB={30}
    >
      {({
        files,
        state,
        setState,
        setProgress,
        setError,
        setResultUrl,
        setResultName,
        setOriginalSize,
        setResultSize,
        reset,
      }) => {
        const handleConvert = async () => {
          if (files.length === 0) return;
          setState('processing');
          setProgress(5);
          setExtractedPreview('');
          setPageCount(0);

          try {
            // 1. Load pdfjs-dist dynamically
            const pdfjsLib = await import('pdfjs-dist');
            if (typeof window !== 'undefined') {
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
            }

            const file = files[0];
            setOriginalSize(file.size);
            setProgress(10);

            const buffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            const totalPages = pdf.numPages;
            setPageCount(totalPages);
            setProgress(20);

            // 2. Extract structured content page by page
            interface PageContent {
              pageNum: number;
              lines: Array<{ text: string; height: number; isBold: boolean }>;
            }

            const parsedPages: PageContent[] = [];
            let fullRawText = '';

            for (let i = 1; i <= totalPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              
              // Group text items into lines by Y position
              const lineMap = new Map<number, { text: string; height: number; isBold: boolean }[]>();

              for (const item of textContent.items as any[]) {
                if (!item.str || item.str.trim() === '') continue;
                // item.transform: [scaleX, skewY, skewX, scaleY, translateX, translateY]
                const y = Math.round(item.transform[5] || 0);
                const fontSize = Math.abs(item.transform[0] || item.height || 12);
                const fontName = (item.fontName || '').toLowerCase();
                const isBold = fontName.includes('bold') || fontName.includes('black') || fontSize > 14;

                const existing = lineMap.get(y) || [];
                existing.push({ text: item.str, height: fontSize, isBold });
                lineMap.set(y, existing);
              }

              // Sort Y positions descending (top to bottom of page)
              const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);
              const pageLines: { text: string; height: number; isBold: boolean }[] = [];

              for (const y of sortedY) {
                const itemsOnLine = lineMap.get(y)!;
                // Sort X positions left to right
                const lineText = itemsOnLine.map(it => it.text).join(' ').trim();
                const maxHeight = Math.max(...itemsOnLine.map(it => it.height));
                const hasBold = itemsOnLine.some(it => it.isBold);
                if (lineText) {
                  pageLines.push({ text: lineText, height: maxHeight, isBold: hasBold });
                  fullRawText += lineText + '\n';
                }
              }

              fullRawText += '\n--- Page Break ---\n\n';
              parsedPages.push({ pageNum: i, lines: pageLines });

              const currentProgress = 20 + Math.round((i / totalPages) * 55);
              setProgress(currentProgress);
            }

            setExtractedPreview(fullRawText.slice(0, 1500));
            setProgress(78);

            // 3. Build DOCX Document
            const docxLib = await import('docx');
            const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } = docxLib;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const docSectionsChildren: any[] = [];

            parsedPages.forEach((pageData, pageIdx) => {
              // Page header
              docSectionsChildren.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Page ${pageData.pageNum}`,
                      bold: true,
                      color: '666666',
                      size: 20,
                    }),
                  ],
                  spacing: { before: 100, after: 150 },
                })
              );

              if (pageData.lines.length === 0) {
                docSectionsChildren.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '[Scanned or image page — use Image to Word tool for OCR]',
                        italics: true,
                        color: '999999',
                        size: 22,
                      }),
                    ],
                    spacing: { after: 200 },
                  })
                );
              } else {
                pageData.lines.forEach(line => {
                  const isTitle = line.height >= 18;
                  const isHeading = line.height >= 14 && line.height < 18;

                  if (isTitle) {
                    docSectionsChildren.push(
                      new Paragraph({
                        text: line.text,
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 240, after: 120 },
                      })
                    );
                  } else if (isHeading) {
                    docSectionsChildren.push(
                      new Paragraph({
                        text: line.text,
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 180, after: 90 },
                      })
                    );
                  } else {
                    docSectionsChildren.push(
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: line.text,
                            bold: line.isBold,
                            size: 23, // 11.5pt font
                          }),
                        ],
                        spacing: { after: 100, line: 276 }, // 1.15 line spacing
                      })
                    );
                  }
                });
              }

              // Add Page Break between pages
              if (pageIdx < parsedPages.length - 1) {
                docSectionsChildren.push(
                  new Paragraph({
                    children: [new PageBreak()],
                  })
                );
              }
            });

            const doc = new Document({
              sections: [
                {
                  properties: {},
                  children: docSectionsChildren,
                },
              ],
            });

            setProgress(90);

            // 4. Generate Blob
            const docxBlob = await Packer.toBlob(doc);
            const downloadUrl = URL.createObjectURL(docxBlob);

            setResultUrl(downloadUrl);
            setResultSize(docxBlob.size);
            const outputFileName = file.name.replace(/\.pdf$/i, '') + '.docx';
            setResultName(outputFileName);

            setProgress(100);
            setState('done');
          } catch (err: any) {
            console.error('PDF to Word Error:', err);
            setError(
              err?.message ||
                'Failed to extract content from this PDF. If this is a scanned document, please use our Image/Scan to Word tool.'
            );
            setState('error');
          }
        };

        return (
          <div className="flex flex-col gap-6">
            {/* Conversion Trigger Button */}
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 leading-relaxed">
                  <div className="font-bold text-neutral-900 mb-1 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-neutral-900" /> Document Ready for Conversion
                  </div>
                  Text paragraphs, titles, and layout will be converted into a real <strong>.docx</strong> file that opens in Microsoft Word, Google Docs, and LibreOffice.
                </div>
                <Button variant="primary" size="lg" onClick={handleConvert} className="w-full sm:w-auto">
                  <FileText className="w-4 h-4 mr-2" />
                  Convert PDF to Word (.docx)
                </Button>
              </div>
            )}

            {/* Custom Preview when Done */}
            {state === 'done' && (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-green-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Conversion Completed Successfully!
                  </div>
                  <div className="text-xs text-neutral-600 flex flex-wrap gap-4">
                    <span>📄 <strong>{pageCount}</strong> Pages converted</span>
                    <span>💾 Output: <strong>.docx</strong></span>
                  </div>

                  {extractedPreview && (
                    <div className="mt-2">
                      <button
                        onClick={() => setShowTextPreview(!showTextPreview)}
                        className="text-xs text-neutral-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {showTextPreview ? 'Hide Text Preview' : 'Show Extracted Text Preview'}
                      </button>
                      {showTextPreview && (
                        <pre className="mt-2 p-3 bg-white border border-neutral-200 rounded-xl text-[11px] font-mono text-neutral-800 max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {extractedPreview}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }}
    </PdfToolShell>
  );
};
