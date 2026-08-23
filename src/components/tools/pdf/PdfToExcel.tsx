'use client';

import React from 'react';
import { PdfToolShell } from './PdfToolShell';
import { Button } from '../../ui/button';
import { Table } from 'lucide-react';

export const PdfToExcel: React.FC = () => {
  return (
    <PdfToolShell
      title="Upload a PDF to convert to Excel"
      description="Extract tabular data from PDF and generate an XLSX spreadsheet"
    >
      {({ files, state, setState, setError, setProgress, setResultUrl, setResultName, setOriginalSize, setResultSize }) => {
        const handleConvert = async () => {
          if (files.length === 0) return;
          setState('processing');
          setProgress(5);

          try {
            const pdfjsLib = await import('pdfjs-dist');

            if (typeof window !== 'undefined') {
              pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
            }

            setOriginalSize(files[0].size);
            const buffer = await files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            const totalPages = pdf.numPages;
            setProgress(15);

            // Extract text items with positions from all pages
            const allPageData: { page: number; rows: string[][] }[] = [];

            for (let i = 1; i <= totalPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              
              // Group text items by Y position (rows)
              const itemsByY = new Map<number, { x: number; str: string }[]>();
              
              for (const item of content.items) {
                if (!('str' in item) || !item.str.trim()) continue;
                const typedItem = item as { str: string; transform: number[] };
                const y = Math.round(typedItem.transform[5]); // Round Y to group nearby items
                const x = typedItem.transform[4];
                
                if (!itemsByY.has(y)) itemsByY.set(y, []);
                itemsByY.get(y)!.push({ x, str: typedItem.str });
              }

              // Sort rows by Y (descending, since PDF Y is bottom-up) and items by X
              const sortedRows = Array.from(itemsByY.entries())
                .sort(([a], [b]) => b - a)
                .map(([, items]) => 
                  items.sort((a, b) => a.x - b.x).map(item => item.str)
                );

              allPageData.push({ page: i, rows: sortedRows });
              setProgress(15 + Math.round((i / totalPages) * 50));
            }

            setProgress(70);

            // Generate XLSX using exceljs
            const ExcelJS = await import('exceljs');
            const workbook = new ExcelJS.Workbook();

            for (const pageData of allPageData) {
              const sheet = workbook.addWorksheet(`Page ${pageData.page}`);
              
              for (const row of pageData.rows) {
                sheet.addRow(row);
              }

              // Auto-size columns
              sheet.columns.forEach(column => {
                let maxLength = 10;
                column.eachCell?.({ includeEmpty: false }, (cell) => {
                  const val = cell.value?.toString() || '';
                  maxLength = Math.max(maxLength, val.length + 2);
                });
                column.width = Math.min(maxLength, 40);
              });
            }

            setProgress(85);

            const xlsxBuffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([xlsxBuffer], { 
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = URL.createObjectURL(blob);

            setResultUrl(url);
            setResultSize(blob.size);
            setResultName(files[0].name.replace(/\.pdf$/i, '.xlsx'));
            setProgress(100);
            setState('done');
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to convert PDF to Excel');
            setState('error');
          }
        };

        return (
          <>
            {files.length > 0 && state === 'idle' && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                  📊 Text and tabular data will be extracted from each PDF page into separate Excel sheets.
                  Each page becomes a worksheet with data organized by position.
                </div>
                <Button variant="primary" onClick={handleConvert}>
                  <Table className="w-4 h-4 mr-2" />
                  Convert to Excel (.xlsx)
                </Button>
              </div>
            )}
          </>
        );
      }}
    </PdfToolShell>
  );
};
