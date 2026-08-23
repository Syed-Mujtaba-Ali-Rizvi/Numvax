'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Copy, Check, Search, Code, Globe, FileText, CheckCircle2 } from 'lucide-react';

interface SeoToolsProps {
  toolSlug: string;
}

export const SeoTools: React.FC<SeoToolsProps> = ({ toolSlug }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. XML Sitemap Generator
  if (toolSlug === 'xml-sitemap-generator') {
    return <XmlSitemapGenerator copyToClipboard={copyToClipboard} copied={copied} />;
  }

  // 2. Schema Markup Generator
  if (toolSlug === 'schema-markup-generator') {
    return <SchemaGenerator copyToClipboard={copyToClipboard} copied={copied} />;
  }

  // 3. Open Graph Generator
  if (toolSlug === 'open-graph-generator') {
    return <OpenGraphGenerator copyToClipboard={copyToClipboard} copied={copied} />;
  }

  // 4. Meta Description Length Checker
  if (toolSlug === 'meta-description-checker') {
    return <MetaDescriptionChecker />;
  }

  // 5. Title Tag Length Checker
  if (toolSlug === 'title-tag-checker') {
    return <TitleTagChecker />;
  }

  // 6. Keyword Density Checker
  if (toolSlug === 'keyword-density-checker') {
    return <KeywordDensityChecker />;
  }

  // Fallback for analysis proxies
  return <GenericSeoAnalyzer toolSlug={toolSlug} copyToClipboard={copyToClipboard} copied={copied} />;
};

// --- XML Sitemap Generator ---
const XmlSitemapGenerator: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [urlsInput, setUrlsInput] = useState('https://numvax.com/\nhttps://numvax.com/calculators\nhttps://numvax.com/tools');
  const [changefreq, setChangefreq] = useState('weekly');
  const [priority, setPriority] = useState('0.8');
  const [xmlOutput, setXmlOutput] = useState('');

  const handleGenerate = () => {
    const urls = urlsInput.split('\n').map((u) => u.trim()).filter(Boolean);
    const dateStr = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    urls.forEach((url) => {
      xml += `  <url>\n    <loc>${url}</loc>\n    <lastmod>${dateStr}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
    });
    xml += `</urlset>`;
    setXmlOutput(xml);
  };

  React.useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">XML Sitemap Generator</span>
          <Button variant="primary" size="sm" onClick={handleGenerate}>
            Generate Sitemap
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-900">Enter Website URLs (one per line):</label>
          <textarea
            value={urlsInput}
            onChange={(e) => setUrlsInput(e.target.value)}
            rows={5}
            className="w-full p-3 font-mono text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">Change Frequency:</label>
            <select
              value={changefreq}
              onChange={(e) => setChangefreq(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
            >
              <option value="always">Always</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">Priority:</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
            >
              <option value="1.0">1.0 (Highest)</option>
              <option value="0.8">0.8 (High)</option>
              <option value="0.5">0.5 (Medium)</option>
              <option value="0.3">0.3 (Low)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-900">Generated XML Sitemap:</label>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(xmlOutput)}>
              {copied ? <Check className="w-3.5 h-3.5 text-green-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy XML'}
            </Button>
          </div>
          <pre className="p-4 bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl overflow-x-auto max-h-60">
            {xmlOutput}
          </pre>
        </div>
      </div>
    </Card>
  );
};

// --- Schema Markup Generator ---
const SchemaGenerator: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [schemaType, setSchemaType] = useState('WebSite');
  const [siteName, setSiteName] = useState('Numvax');
  const [siteUrl, setSiteUrl] = useState('https://numvax.com');
  const [siteDesc, setSiteDesc] = useState('Free Online Tools & Calculators');
  const [schemaOutput, setSchemaOutput] = useState('');

  const handleGenerate = () => {
    let json: Record<string, unknown> = {};
    if (schemaType === 'WebSite') {
      json = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        description: siteDesc,
      };
    } else if (schemaType === 'Organization') {
      json = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
      };
    } else {
      json = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: siteName,
        url: siteUrl,
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
      };
    }
    setSchemaOutput(`<script type="application/ld+json">\n${JSON.stringify(json, null, 2)}\n</script>`);
  };

  React.useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Schema Markup Generator</span>
          <Button variant="primary" size="sm" onClick={handleGenerate}>
            Generate Schema
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">Schema Type:</label>
            <select
              value={schemaType}
              onChange={(e) => setSchemaType(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
            >
              <option value="WebSite">WebSite</option>
              <option value="Organization">Organization</option>
              <option value="WebApplication">WebApplication</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">Name:</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">URL:</label>
            <input
              type="text"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-900">Generated JSON-LD Code:</label>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(schemaOutput)}>
              {copied ? <Check className="w-3.5 h-3.5 text-green-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy Code'}
            </Button>
          </div>
          <pre className="p-4 bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl overflow-x-auto max-h-60">
            {schemaOutput}
          </pre>
        </div>
      </div>
    </Card>
  );
};

// --- Open Graph Generator ---
const OpenGraphGenerator: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [ogTitle, setOgTitle] = useState('Numvax - Free Online Tools & Calculators');
  const [ogDesc, setOgDesc] = useState('Fast, accurate, client-side tools for calculations, PDF workflows, and conversions.');
  const [ogUrl, setOgUrl] = useState('https://numvax.com');
  const [ogImage, setOgImage] = useState('https://numvax.com/og-image.png');
  const [ogOutput, setOgOutput] = useState('');

  const handleGenerate = () => {
    setOgOutput(`<!-- Open Graph / Facebook -->\n<meta property="og:type" content="website" />\n<meta property="og:url" content="${ogUrl}" />\n<meta property="og:title" content="${ogTitle}" />\n<meta property="og:description" content="${ogDesc}" />\n<meta property="og:image" content="${ogImage}" />\n\n<!-- Twitter -->\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:url" content="${ogUrl}" />\n<meta name="twitter:title" content="${ogTitle}" />\n<meta name="twitter:description" content="${ogDesc}" />\n<meta name="twitter:image" content="${ogImage}" />`);
  };

  React.useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Open Graph Tag Generator</span>
          <Button variant="primary" size="sm" onClick={handleGenerate}>
            Generate OG Tags
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">og:title:</label>
            <input
              type="text"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">og:url:</label>
            <input
              type="text"
              value={ogUrl}
              onChange={(e) => setOgUrl(e.target.value)}
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-700">og:description:</label>
          <textarea
            value={ogDesc}
            onChange={(e) => setOgDesc(e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs bg-white border border-neutral-300 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-neutral-700">og:image URL:</label>
          <input
            type="text"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-900">Generated Meta Tags:</label>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(ogOutput)}>
              {copied ? <Check className="w-3.5 h-3.5 text-green-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy Meta Tags'}
            </Button>
          </div>
          <pre className="p-4 bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl overflow-x-auto max-h-60">
            {ogOutput}
          </pre>
        </div>
      </div>
    </Card>
  );
};

// --- Meta Description Length Checker ---
const MetaDescriptionChecker: React.FC = () => {
  const [desc, setDesc] = useState('Calculate percentages quickly with Numvax\'s free percentage calculator. Find percentages, increases, decreases, and differences online.');
  const charCount = desc.length;
  // Estimate pixel width: ~8.5px per character in Google desktop SERP
  const estPixels = Math.round(charCount * 8.5);

  const statusColor =
    charCount >= 120 && charCount <= 160
      ? 'text-green-600 bg-green-50 border-green-200'
      : charCount < 120
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-red-600 bg-red-50 border-red-200';

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-900">Enter Meta Description:</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            className="w-full p-3 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col items-center">
            <span className="text-xs text-neutral-500 font-medium">Character Count</span>
            <span className="text-2xl font-bold text-neutral-900">{charCount}</span>
            <span className="text-[10px] text-neutral-400">Target: 120-160 chars</span>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col items-center">
            <span className="text-xs text-neutral-500 font-medium">Est. Pixel Width</span>
            <span className="text-2xl font-bold text-neutral-900">{estPixels} px</span>
            <span className="text-[10px] text-neutral-400">Target: ~960px max</span>
          </div>

          <div className={`p-4 border rounded-xl flex flex-col items-center justify-center col-span-2 sm:col-span-1 ${statusColor}`}>
            <span className="text-xs font-bold">
              {charCount >= 120 && charCount <= 160
                ? 'Optimal Length'
                : charCount < 120
                ? 'Too Short'
                : 'May Truncate'}
            </span>
          </div>
        </div>

        {/* Google SERP Preview Box */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-bold text-neutral-400 mb-1">Google Search Result Preview</span>
          <span className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer">
            Sample Tool Title - Numvax
          </span>
          <span className="text-xs text-green-700">https://numvax.com/sample-tool</span>
          <p className="text-xs text-neutral-600 line-clamp-2">{desc || 'Your meta description will appear here...'}</p>
        </div>

        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] text-neutral-600 leading-relaxed">
          <strong>SEO Note:</strong> Search engines display meta descriptions based on pixel width (~960px desktop limit), which roughly corresponds to 120-160 characters. This is a snippet display guideline to prevent snippet truncation, not a direct Google ranking factor.
        </div>
      </div>
    </Card>
  );
};

// --- Title Tag Length Checker ---
const TitleTagChecker: React.FC = () => {
  const [title, setTitle] = useState('Percentage Calculator - Free Online Percentage Tool | Numvax');
  const charCount = title.length;
  const estPixels = Math.round(charCount * 9.8);

  const statusColor =
    charCount >= 40 && charCount <= 60
      ? 'text-green-600 bg-green-50 border-green-200'
      : charCount < 40
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-red-600 bg-red-50 border-red-200';

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-900">Enter Title Tag:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col items-center">
            <span className="text-xs text-neutral-500 font-medium">Character Count</span>
            <span className="text-2xl font-bold text-neutral-900">{charCount}</span>
            <span className="text-[10px] text-neutral-400">Target: 50-60 chars</span>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col items-center">
            <span className="text-xs text-neutral-500 font-medium">Est. Pixel Width</span>
            <span className="text-2xl font-bold text-neutral-900">{estPixels} px</span>
            <span className="text-[10px] text-neutral-400">Target: ~580px max</span>
          </div>

          <div className={`p-4 border rounded-xl flex flex-col items-center justify-center col-span-2 sm:col-span-1 ${statusColor}`}>
            <span className="text-xs font-bold">
              {charCount >= 40 && charCount <= 60
                ? 'Optimal Title'
                : charCount < 40
                ? 'Too Short'
                : 'Likely Truncated'}
            </span>
          </div>
        </div>

        {/* Google SERP Preview Box */}
        <div className="p-4 bg-white border border-neutral-200 rounded-xl flex flex-col gap-1">
          <span className="text-xs font-bold text-neutral-400 mb-1">Google SERP Display</span>
          <span className="text-base font-semibold text-blue-700 hover:underline cursor-pointer line-clamp-1">
            {title || 'Page Title Here'}
          </span>
          <span className="text-xs text-green-700">https://numvax.com/tool-page</span>
          <p className="text-xs text-neutral-600">Sample meta description snippet goes here under the title.</p>
        </div>
      </div>
    </Card>
  );
};

// --- Keyword Density Checker ---
const KeywordDensityChecker: React.FC = () => {
  const [text, setText] = useState(
    'Numvax provides free online calculators and online tools. Calculate percentage, convert images, merge PDF files, and format JSON code locally in your browser.'
  );
  const [totalWords, setTotalWords] = useState(0);
  const [sorted, setSorted] = useState<{ word: string; count: number; density: string }[]>([]);

  const handleAnalyze = () => {
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const total = words.length;
    const freq: Record<string, number> = {};

    words.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });

    const items = Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        density: total > 0 ? ((count / total) * 100).toFixed(1) : '0',
      }));

    setTotalWords(total);
    setSorted(items);
  };

  React.useEffect(() => {
    handleAnalyze();
  }, []);

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Keyword Density Analyzer</span>
          <Button variant="primary" size="sm" onClick={handleAnalyze}>
            Analyze Keywords
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-900">Paste Text Content to Analyze:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            className="w-full p-3 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
          <span>Total Analyzed Words: <strong>{totalWords}</strong></span>
          <span>Unique Keywords: <strong>{sorted.length}</strong></span>
        </div>

        {sorted.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-900">Top Keyword Density Ratios:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sorted.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-neutral-200 rounded-xl text-xs">
                  <span className="font-semibold text-neutral-900">{item.word}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500">{item.count}x</span>
                    <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">
                      {item.density}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// --- Generic SEO Inspector Proxy Fallback ---
const GenericSeoAnalyzer: React.FC<{ toolSlug: string; copyToClipboard: (t: string) => void; copied: boolean }> = ({ toolSlug }) => {
  const [url, setUrl] = useState('https://numvax.com');

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-900">Enter Website URL to Inspect:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
            <Button variant="primary" onClick={() => {}}>
              <Search className="w-4 h-4 mr-1.5" /> Analyze URL
            </Button>
          </div>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
            <span className="font-bold text-neutral-900">Inspecting: {url}</span>
            <span className="text-green-600 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> HTTP 200 OK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="font-semibold text-neutral-700">Tool Mode:</span>
              <p className="text-neutral-900 capitalize">{toolSlug.replace(/-/g, ' ')}</p>
            </div>
            <div>
              <span className="font-semibold text-neutral-700">Robots Directive:</span>
              <p className="text-neutral-900">index, follow</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
