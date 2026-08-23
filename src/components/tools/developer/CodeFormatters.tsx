'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Copy, Check, Code, Eye, Search, Palette, RefreshCw } from 'lucide-react';

interface CodeFormattersProps {
  toolSlug: string;
}

export const CodeFormatters: React.FC<CodeFormattersProps> = ({ toolSlug }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Regex Tester
  if (toolSlug === 'regex-tester') {
    return <RegexTester />;
  }

  // 2. Markdown Editor
  if (toolSlug === 'markdown-editor') {
    return <MarkdownEditor copyToClipboard={copyToClipboard} copied={copied} />;
  }

  // 3. Color Code Converter
  if (toolSlug === 'color-code-converter') {
    return <ColorCodeConverter copyToClipboard={copyToClipboard} copied={copied} />;
  }

  // 4. HTTP Status Reference
  if (toolSlug === 'http-status-reference') {
    return <HttpStatusReference />;
  }

  // 5. Code Formatters (HTML, CSS, JS, SQL)
  return <GenericCodeFormatter toolSlug={toolSlug} copyToClipboard={copyToClipboard} copied={copied} />;
};

// --- Generic Code Formatter (HTML, CSS, JS, SQL) ---
const GenericCodeFormatter: React.FC<{ toolSlug: string; copyToClipboard: (t: string) => void; copied: boolean }> = ({
  toolSlug,
  copyToClipboard,
  copied,
}) => {
  const getDefaultCode = () => {
    switch (toolSlug) {
      case 'html-formatter':
        return '<div class="container"><h1>Hello Numvax</h1><p>Welcome to online developer tools.</p></div>';
      case 'css-formatter':
        return 'body{margin:0;padding:0;font-family:sans-serif;}h1{color:#171717;font-size:24px;}';
      case 'js-formatter':
        return 'function calculateTotal(items){return items.reduce((acc,item)=>acc+item.price,0);}console.log(calculateTotal([{price:10},{price:20}]));';
      case 'sql-formatter':
        return 'SELECT id, name, email, created_at FROM users WHERE status = "active" ORDER BY created_at DESC;';
      default:
        return '// Enter your code here';
    }
  };

  const [inputCode, setInputCode] = useState(getDefaultCode());

  // Indentation/formatting helper
  const formatCode = (code: string, lang: string) => {
    if (!code.trim()) return '';
    try {
      if (lang.includes('html')) {
        let indent = 0;
        return code
          .replace(/>\s*</g, '>\n<')
          .split('\n')
          .map((line) => {
            if (line.match(/^<\//)) indent = Math.max(0, indent - 1);
            const padded = '  '.repeat(indent) + line.trim();
            if (line.match(/^<[^\/!\?][^>]*[^\/]>$/) && !line.match(/<(img|br|hr|input)/i)) indent++;
            return padded;
          })
          .join('\n');
      } else if (lang.includes('css')) {
        return code
          .replace(/\{/g, ' {\n  ')
          .replace(/;/g, ';\n  ')
          .replace(/\s*\}\s*/g, '\n}\n\n')
          .replace(/  \n/g, '')
          .trim();
      } else if (lang.includes('sql')) {
        return code
          .replace(/\s+(FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|JOIN|LEFT JOIN|INNER JOIN)/gi, '\n$1')
          .replace(/,/g, ',\n  ');
      } else {
        // JS simple indentation
        return code
          .replace(/;/g, ';\n')
          .replace(/\{/g, ' {\n  ')
          .replace(/\}/g, '\n}\n');
      }
    } catch {
      return code;
    }
  };

  const [formattedOutput, setFormattedOutput] = useState('');

  React.useEffect(() => {
    setFormattedOutput(formatCode(inputCode, toolSlug));
  }, []);

  const getLanguageLabel = () => {
    const lang = toolSlug.replace('-formatter', '');
    if (lang === 'js') return 'JavaScript';
    return lang.toUpperCase();
  };

  const handleFormat = () => {
    setFormattedOutput(formatCode(inputCode, toolSlug));
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">{getLanguageLabel()} Code Formatter</span>
          <Button variant="primary" size="sm" onClick={handleFormat}>
            Format {getLanguageLabel()}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
            Input Code ({getLanguageLabel()}):
          </label>
          <textarea
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            rows={6}
            className="w-full p-3 font-mono text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Formatted Output:</label>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(formattedOutput)}>
              {copied ? <Check className="w-3.5 h-3.5 text-green-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? 'Copied' : 'Copy Code'}
            </Button>
          </div>
          <pre className="p-4 bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl overflow-x-auto max-h-80">
            {formattedOutput || '// Formatted output will appear here after clicking format'}
          </pre>
        </div>
      </div>
    </Card>
  );
};

// --- Regex Tester ---
const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('Contact us at support@numvax.com or info@example.org for inquiries.');
  const [matches, setMatches] = useState<string[] | null>([]);

  const runTest = () => {
    if (!pattern.trim()) {
      setMatches([]);
      return;
    }
    try {
      const regex = new RegExp(pattern, flags);
      const list: string[] = [];
      let m;
      if (flags.includes('g')) {
        while ((m = regex.exec(testText)) !== null) {
          list.push(m[0]);
          if (m.index === regex.lastIndex) regex.lastIndex++;
        }
      } else {
        const m = testText.match(regex);
        if (m) list.push(m[0]);
      }
      setMatches(list);
    } catch {
      setMatches(null);
    }
  };

  React.useEffect(() => {
    runTest();
  }, []);

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Regular Expression Tester</span>
          <Button variant="primary" size="sm" onClick={runTest}>
            Test Regex
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-900">Regular Expression Pattern:</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. [0-9]+"
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-900">Flags:</label>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="g, i, m"
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-mono"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-900">Test String:</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={4}
            className="w-full p-3 text-xs font-mono bg-white border border-neutral-300 rounded-xl"
          />
        </div>

        {matches === null ? (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            ⚠️ Invalid regular expression syntax.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-900">Matches Found ({matches.length}):</label>
            {matches.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matches.map((m, idx) => (
                  <span key={idx} className="px-3 py-1 bg-neutral-900 text-white rounded-lg font-mono text-xs">
                    {m}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-neutral-500 italic">No matches found.</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

// --- Markdown Editor ---
const MarkdownEditor: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [markdown, setMarkdown] = useState(
    '# Welcome to Numvax Markdown Editor\n\nWrite **bold**, *italic*, or `code` easily.\n\n- Feature 1\n- Feature 2\n- Client-side fast processing'
  );

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-900">Markdown Input:</label>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={10}
              className="w-full p-3 font-mono text-xs bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-900">Live Preview:</label>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(markdown)}>
                {copied ? <Check className="w-3.5 h-3.5 text-green-600 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? 'Copied' : 'Copy MD'}
              </Button>
            </div>
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 font-sans space-y-2 max-h-72 overflow-y-auto">
              {markdown.split('\n').map((line, idx) => {
                if (line.startsWith('# ')) return <div key={idx} className="text-lg font-bold text-neutral-900">{line.slice(2)}</div>;
                if (line.startsWith('## ')) return <h2 key={idx} className="text-base font-bold text-neutral-900">{line.slice(3)}</h2>;
                if (line.startsWith('- ')) return <li key={idx} className="ml-4">{line.slice(2)}</li>;
                return <p key={idx}>{line}</p>;
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// --- Color Code Converter ---
const ColorCodeConverter: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [colorHex, setColorHex] = useState('#171717');

  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return { r: 23, g: 23, b: 23 };
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return { r, g, b };
  };

  const { r, g, b } = hexToRgb(colorHex);
  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(0, 0%, ${Math.round(((r + g + b) / 3 / 255) * 100)}%)`;

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setColorHex(e.target.value)}
            className="w-16 h-16 rounded-2xl border border-neutral-300 cursor-pointer"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-neutral-900">Selected Color HEX:</label>
            <input
              type="text"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              className="px-3 py-1.5 bg-white border border-neutral-300 rounded-xl font-mono text-sm uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400 font-mono">HEX</span>
              <span className="text-xs font-bold text-neutral-900 font-mono">{colorHex.toUpperCase()}</span>
            </div>
            <button onClick={() => copyToClipboard(colorHex)} className="p-1 text-neutral-500 hover:text-neutral-900">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400 font-mono">RGB</span>
              <span className="text-xs font-bold text-neutral-900 font-mono">{rgbStr}</span>
            </div>
            <button onClick={() => copyToClipboard(rgbStr)} className="p-1 text-neutral-500 hover:text-neutral-900">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-neutral-400 font-mono">HSL</span>
              <span className="text-xs font-bold text-neutral-900 font-mono">{hslStr}</span>
            </div>
            <button onClick={() => copyToClipboard(hslStr)} className="p-1 text-neutral-500 hover:text-neutral-900">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// --- HTTP Status Reference ---
const HttpStatusReference: React.FC = () => {
  const [search, setSearch] = useState('');

  const statuses = [
    { code: 200, name: 'OK', desc: 'Standard response for successful HTTP requests.' },
    { code: 201, name: 'Created', desc: 'The request has been fulfilled and resulted in a new resource.' },
    { code: 301, name: 'Moved Permanently', desc: 'This and all future requests should be directed to the given URI.' },
    { code: 302, name: 'Found (Temporary Redirect)', desc: 'Resource temporarily resides under a different URI.' },
    { code: 400, name: 'Bad Request', desc: 'Server cannot process request due to client error.' },
    { code: 401, name: 'Unauthorized', desc: 'Authentication is required and has failed or not been provided.' },
    { code: 403, name: 'Forbidden', desc: 'User does not have necessary permissions for the resource.' },
    { code: 404, name: 'Not Found', desc: 'The requested resource could not be found.' },
    { code: 500, name: 'Internal Server Error', desc: 'Generic error message when server encounters an unexpected condition.' },
    { code: 502, name: 'Bad Gateway', desc: 'Server acting as gateway received an invalid response from upstream server.' },
    { code: 503, name: 'Service Unavailable', desc: 'Server is currently unable to handle the request due to maintenance or overload.' },
  ];

  const filtered = statuses.filter(
    (s) =>
      s.code.toString().includes(search) ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search HTTP status codes (e.g. 404, 200, redirect)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-neutral-300 rounded-xl"
          />
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((s) => (
            <div key={s.code} className="flex items-start gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
              <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white text-xs shrink-0">
                {s.code}
              </span>
              <div className="flex flex-col">
                <span className="font-bold text-neutral-900">{s.name}</span>
                <span className="text-neutral-500 mt-0.5">{s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
