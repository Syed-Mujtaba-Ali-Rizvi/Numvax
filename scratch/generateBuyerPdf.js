const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

// Page Setup
const margin = 15;
const pageWidth = 210;
const pageHeight = 297;
const contentWidth = pageWidth - margin * 2;
let y = 20;

function checkNewPage(neededHeight = 15) {
  if (y + neededHeight > pageHeight - 20) {
    doc.addPage();
    y = 20;
  }
}

// Title & Header
doc.setFillColor(23, 23, 23); // #171717
doc.rect(margin, y, contentWidth, 24, 'F');

doc.setTextColor(255, 255, 255);
doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.text('Numvax.com — Technical Specification & Buyer Guide', margin + 6, y + 11);

doc.setFont('helvetica', 'normal');
doc.setFontSize(9);
doc.text('Complete Platform Documentation & Buyer Handover Report', margin + 6, y + 18);

y += 32;

// 1. Executive Summary
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(23, 23, 23);
doc.text('1. Executive Summary & Platform Overview', margin, y);
y += 6;

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(60, 60, 60);

const summaryText = [
  '• Domain: https://numvax.com',
  '• Niche: Free Online Utility Tools, PDF Suite, Batch Image Processors, QR Generators, Calculators.',
  '• Total Ecosystem: 184 Static Pages covering 71+ interactive web applications.',
  '• Monetization: Built-in Google AdSense slots (Header, In-Content, Below Results, Sidebar).',
  '• Key Advantage: Zero Server File Overhead ($0/mo file storage cost). 100% of image compression, PDF editing, and QR generation runs locally in the user\'s web browser RAM.'
];

summaryText.forEach(line => {
  doc.text(line, margin + 2, y);
  y += 5.5;
});

y += 4;
checkNewPage(40);

// 2. Full Technology Stack
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(23, 23, 23);
doc.text('2. Full Technology Stack', margin, y);
y += 6;

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(60, 60, 60);

const techStack = [
  '• Frontend Framework: Next.js 16.3.0 (App Router Architecture with React 19).',
  '• Programming Language: 100% TypeScript 5.x with strict type safety across all components.',
  '• Styling & Design Tokens: TailwindCSS v4 with Vanilla CSS design tokens.',
  '• Rendering Strategy: SSG (Static Site Generation) pre-rendering all 184 pages for <0.5s load speeds.',
  '• Icons & UI Primitives: Lucide React icon set (lucide-react).',
  '• ORM & Database: Prisma ORM (prisma/schema.prisma) supporting PostgreSQL, Supabase, Neon, or MySQL.',
  '• Analytics & Admin Storage: Prisma models for daily usage statistics and contact inquiries.',
  '• Infrastructure & Hosting: Deployed on Vercel Edge CDN with automated SSL/TLS certificates.'
];

techStack.forEach(line => {
  doc.text(line, margin + 2, y);
  y += 5.5;
});

y += 4;
checkNewPage(40);

// 3. Storage & Privacy Architecture
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(23, 23, 23);
doc.text('3. Storage & Privacy-First Architecture ($0 Cloud Bill)', margin, y);
y += 6;

doc.setFont('helvetica', 'normal');
doc.setFontSize(9.5);
doc.setTextColor(60, 60, 60);

const storageText = [
  '• Server File Storage: 0 Bytes Required. Photos and PDFs never touch server disk storage.',
  '• Client-Side Execution: Image compression, PDF manipulation, and QR generation run inside browser RAM.',
  '• Zero Server Hosting Bills: No AWS S3 bucket fees or server CPU bandwidth costs as traffic grows.',
  '• Automated GDPR / CCPA Compliance: Zero file storage eliminates data leakage risk entirely.'
];

storageText.forEach(line => {
  doc.text(line, margin + 2, y);
  y += 5.5;
});

y += 4;
checkNewPage(50);

// 4. Buyer FAQ & Sales Questions
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(23, 23, 23);
doc.text('4. Key Questions & Answers for Buyers', margin, y);
y += 6;

const faqs = [
  {
    q: 'Q1: What are the monthly running costs for host & database?',
    a: 'Answer: Near $0 / Month. Hosted on Vercel starter tier. Browser execution keeps server load near zero.'
  },
  {
    q: 'Q2: How hard is it to add a new tool or calculator?',
    a: 'Answer: Very easy. Adding a tool entry to src/lib/toolCatalog.ts auto-generates its SSG page, sitemap entry, breadcrumbs, and JSON-LD schema.'
  },
  {
    q: 'Q3: Is the code well-structured and typed?',
    a: 'Answer: Yes, 100% TypeScript with modern Next.js 16 App Router conventions.'
  },
  {
    q: 'Q4: Is the site ready for Google AdSense monetization?',
    a: 'Answer: Yes. AdSense slots are pre-configured in AdSlot.tsx. Simply swap in your publisher ID.'
  },
  {
    q: 'Q5: What assets are included in the sale?',
    a: 'Answer: Domain name (numvax.com), source code repo, Vercel project, IndexNow key, and brand logo.'
  }
];

faqs.forEach(item => {
  checkNewPage(18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(23, 23, 23);
  doc.text(item.q, margin + 2, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  doc.text(item.a, margin + 4, y, { maxWidth: contentWidth - 6 });
  y += 8;
});

// Save PDF file
const outputPath = path.join(__dirname, '../public/Numvax_Buyer_Technical_Handover_Guide.pdf');
const pdfBytes = doc.output('arraybuffer');
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

console.log('PDF successfully generated at:', outputPath);
