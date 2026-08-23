'use client';

import React from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { FileText } from 'lucide-react';

export const WordToPdf: React.FC = () => {
  return (
    <PdfToolShell
      title="Upload a Word document to convert to PDF"
      description="Convert DOCX files into standardized PDF documents"
      acceptTypes="application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
      acceptLabel="Word"
    >
      {({ files, state, setState, setError, setProgress, setResultUrl, setResultName, setOriginalSize, setResultSize }) => {
        const handleConvert = async () => {
          if (files.length === 0) return;
          setState('processing');
          setProgress(5);

          try {
            setOriginalSize(files[0].size);
            const buffer = await files[0].arrayBuffer();
            setProgress(15);

            // Use mammoth to convert DOCX to HTML
            const mammoth = await import('mammoth');
            const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
            const html = result.value;
            setProgress(40);

            // Use jsPDF to render HTML content to PDF
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: 'a4',
            });

            // Parse HTML and render text to PDF
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 20;
            const lineHeight = 6;
            const maxWidth = pageWidth - margin * 2;
            let y = margin;

            const addText = (text: string, fontSize: number, bold: boolean = false) => {
              doc.setFontSize(fontSize);
              if (bold) {
                doc.setFont('helvetica', 'bold');
              } else {
                doc.setFont('helvetica', 'normal');
              }
              
              const lines = doc.splitTextToSize(text, maxWidth);
              const currentLineHeight = fontSize * 0.5;
              
              for (const line of lines) {
                if (y + currentLineHeight > pageHeight - margin) {
                  doc.addPage();
                  y = margin;
                }
                doc.text(line, margin, y);
                y += currentLineHeight;
              }
              y += lineHeight * 0.3;
            };

            // Walk through HTML elements
            const elements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, table');
            
            if (elements.length === 0) {
              // Fallback: just use innerText
              const plainText = tempDiv.innerText || tempDiv.textContent || '';
              addText(plainText, 11);
            } else {
              elements.forEach((el) => {
                const tag = el.tagName.toLowerCase();
                const text = (el.textContent || '').trim();
                if (!text) return;

                switch (tag) {
                  case 'h1': addText(text, 22, true); y += 4; break;
                  case 'h2': addText(text, 18, true); y += 3; break;
                  case 'h3': addText(text, 15, true); y += 2; break;
                  case 'h4': case 'h5': case 'h6': addText(text, 13, true); y += 1; break;
                  case 'li': addText(`• ${text}`, 11); break;
                  default: addText(text, 11); break;
                }
              });
            }

            setProgress(80);

            const pdfBlob = doc.output('blob');
            const url = URL.createObjectURL(pdfBlob);

            setResultUrl(url);
            setResultSize(pdfBlob.size);
            setResultName(files[0].name.replace(/\.(docx?|doc)$/i, '.pdf'));
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to convert Word to PDF');
            setState('error');
          }
        };

        return (
          <>
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                  📄 Your Word document will be converted to HTML then rendered as a formatted PDF.
                  Text, headings, and basic formatting will be preserved.
                </div>
                <Button variant="primary" onClick={handleConvert}>
                  <FileText className="w-4 h-4 mr-2" />
                  Convert to PDF
                </Button>
              </div>
            )}
          </>
        );
      }}
    </PdfToolShell>
  );
};
