'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Copy, Check, Trash2, Scissors, Repeat, Search, GitCompare, AlignLeft, Hash } from 'lucide-react';

interface TextToolsProps {
  toolSlug: string;
}

export const TextTools: React.FC<TextToolsProps> = ({ toolSlug }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  switch (toolSlug) {
    case 'character-counter':
      return <CharacterCounter copyToClipboard={copyToClipboard} copied={copied} />;
    case 'remove-extra-spaces':
      return <RemoveExtraSpaces copyToClipboard={copyToClipboard} copied={copied} />;
    case 'remove-duplicate-lines':
      return <RemoveDuplicateLines copyToClipboard={copyToClipboard} copied={copied} />;
    case 'find-and-replace':
      return <FindAndReplace copyToClipboard={copyToClipboard} copied={copied} />;
    case 'text-compare':
      return <TextCompare copyToClipboard={copyToClipboard} copied={copied} />;
    default:
      return <WordCounterTool copyToClipboard={copyToClipboard} copied={copied} />;
  }
};

// 1. Word Counter Tool
const WordCounterTool: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [text, setText] = useState(
    'Numvax is a fast, accurate, and free online tools platform for everyday calculations, document scanning, image compression, developer utilities, and text processing.'
  );
  const [stats, setStats] = useState({
    words: 23,
    characters: 167,
    charsNoSpaces: 145,
    sentences: 1,
    paragraphs: 1,
    readingTimeMinutes: 1,
  });

  const handleCount = () => {
    const trimmed = text.trim();
    const wordsCount = trimmed ? trimmed.split(/\s+/).length : 0;
    const charCount = text.length;
    const charNoSpaceCount = text.replace(/\s/g, '').length;
    const sentenceCount = trimmed ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphCount = trimmed ? text.split(/\n+/).filter(Boolean).length : 0;
    const readTime = Math.ceil(wordsCount / 200);

    setStats({
      words: wordsCount,
      characters: charCount,
      charsNoSpaces: charNoSpaceCount,
      sentences: sentenceCount,
      paragraphs: paragraphCount,
      readingTimeMinutes: readTime,
    });
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Word Counter Engine</span>
          <Button variant="primary" size="sm" onClick={handleCount}>
            <AlignLeft className="w-3.5 h-3.5 mr-1.5" /> Count Words
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">Words</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.words.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">Characters</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.characters.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">No Spaces</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.charsNoSpaces.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">Sentences</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.sentences.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">Paragraphs</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{stats.paragraphs.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">Reading Time</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">~{stats.readingTimeMinutes} min</span>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Type or paste your text here..."
          className="w-full p-4 bg-white text-neutral-900 border border-neutral-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(text)}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setText('');
              setStats({ words: 0, characters: 0, charsNoSpaces: 0, sentences: 0, paragraphs: 0, readingTimeMinutes: 0 });
            }}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
          </Button>
        </div>
      </div>
    </Card>
  );
};

// 2. Character Counter Tool
const CharacterCounter: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [text, setText] = useState('Analyze the exact character count, letters, numbers, and symbols in your document.');
  const [charStats, setCharStats] = useState({
    total: 82,
    noSpaces: 71,
    letters: 67,
    digits: 0,
    symbols: 4,
  });

  const handleCount = () => {
    const total = text.length;
    const noSpaces = text.replace(/\s/g, '').length;
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const digits = (text.match(/[0-9]/g) || []).length;
    const symbols = total - (letters + digits + (text.match(/\s/g) || []).length);

    setCharStats({ total, noSpaces, letters, digits, symbols });
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Character Counter Engine</span>
          <Button variant="primary" size="sm" onClick={handleCount}>
            <Hash className="w-3.5 h-3.5 mr-1.5" /> Count Characters
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">Total Chars</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{charStats.total.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">Without Spaces</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{charStats.noSpaces.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">Letters</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{charStats.letters.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">Digits</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{charStats.digits.toLocaleString()}</span>
          </div>

          <div className="flex flex-col bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] text-neutral-500 font-medium">Symbols</span>
            <span className="text-xl font-extrabold text-neutral-900 font-mono mt-0.5">{charStats.symbols.toLocaleString()}</span>
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Paste or type text to count characters..."
          className="w-full p-4 bg-white text-neutral-900 border border-neutral-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-400"
        />

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(text)}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
            {copied ? 'Copied' : 'Copy Text'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setText('')}>
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
          </Button>
        </div>
      </div>
    </Card>
  );
};

// 3. Remove Extra Spaces Tool
const RemoveExtraSpaces: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [text, setText] = useState('  This   is    an   example   text   with   unnecessary    spaces.   ');

  const handleCleanSpaces = () => {
    // Trim leading/trailing whitespace and replace multiple inner spaces with single space
    const cleaned = text
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');
    setText(cleaned);
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Whitespace Cleaner Engine</span>
          <Button variant="primary" size="sm" onClick={handleCleanSpaces}>
            <Scissors className="w-3.5 h-3.5 mr-1.5" /> Remove Extra Spaces
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-900">Enter Text to Clean Whitespace:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Paste text here to remove extra spaces..."
            className="w-full p-4 bg-white text-neutral-900 border border-neutral-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-400 font-mono"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Removes leading, trailing, and duplicate inner spaces automatically.
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(text)}>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setText('')}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// 4. Remove Duplicate Lines Tool
const RemoveDuplicateLines: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [text, setText] = useState('apple\nbanana\napple\norange\nbanana\ngrapes');
  const [removedCount, setRemovedCount] = useState<number | null>(null);

  const handleRemoveDuplicates = () => {
    const lines = text.split('\n');
    const unique = Array.from(new Set(lines));
    setRemovedCount(lines.length - unique.length);
    setText(unique.join('\n'));
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Duplicate Line Remover Engine</span>
          <Button variant="primary" size="sm" onClick={handleRemoveDuplicates}>
            <Repeat className="w-3.5 h-3.5 mr-1.5" /> Remove Duplicate Lines
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-900">Enter Line-Separated Text List:</label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setRemovedCount(null);
            }}
            rows={8}
            placeholder="Paste duplicate lines here..."
            className="w-full p-4 bg-white text-neutral-900 border border-neutral-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-400 font-mono"
          />
        </div>

        <div className="flex items-center justify-between">
          {removedCount !== null ? (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
              ✓ Removed {removedCount} duplicate line{removedCount !== 1 ? 's' : ''}!
            </span>
          ) : (
            <span className="text-xs text-neutral-500">Filters out all repeating identical lines.</span>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(text)}>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'Copied' : 'Copy Clean List'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setText('');
                setRemovedCount(null);
              }}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// 5. Find and Replace Tool
const FindAndReplace: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [text, setText] = useState('Numvax provides free tools. Numvax helps you calculate and format data online.');
  const [findStr, setFindStr] = useState('Numvax');
  const [replaceStr, setReplaceStr] = useState('Numvax App');
  const [replacedCount, setReplacedCount] = useState<number | null>(null);

  const handleReplace = () => {
    if (!findStr) return;
    const regex = new RegExp(findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    const newText = text.replace(regex, replaceStr);
    setText(newText);
    setReplacedCount(count);
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Find & Replace Engine</span>
          <Button variant="primary" size="sm" onClick={handleReplace}>
            <Search className="w-3.5 h-3.5 mr-1.5" /> Replace All Matches
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-900">Find Text:</label>
            <input
              type="text"
              value={findStr}
              onChange={(e) => setFindStr(e.target.value)}
              placeholder="Text to find..."
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-900">Replace With:</label>
            <input
              type="text"
              value={replaceStr}
              onChange={(e) => setReplaceStr(e.target.value)}
              placeholder="Replacement text..."
              className="px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-neutral-900">Document Text Content:</label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setReplacedCount(null);
            }}
            rows={8}
            className="w-full p-4 bg-white text-neutral-900 border border-neutral-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="flex items-center justify-between">
          {replacedCount !== null ? (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
              ✓ Replaced {replacedCount} occurrence{replacedCount !== 1 ? 's' : ''}!
            </span>
          ) : (
            <span className="text-xs text-neutral-500">Case-sensitive global text replacement.</span>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(text)}>
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
              {copied ? 'Copied' : 'Copy Result'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setText('')}>
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// 6. Text Compare Tool
const TextCompare: React.FC<{ copyToClipboard: (t: string) => void; copied: boolean }> = ({ copyToClipboard, copied }) => {
  const [text1, setText1] = useState('Numvax is a fast online tools website.');
  const [text2, setText2] = useState('Numvax is a fast, accurate online tools platform.');
  const [diffResult, setDiffResult] = useState<{ isMatch: boolean; message: string } | null>(null);

  const handleCompare = () => {
    if (text1 === text2) {
      setDiffResult({ isMatch: true, message: 'Both texts are 100% identical!' });
    } else {
      const lenDiff = Math.abs(text1.length - text2.length);
      setDiffResult({
        isMatch: false,
        message: `Texts differ! Original: ${text1.length} chars, Modified: ${text2.length} chars (difference of ${lenDiff} chars).`,
      });
    }
  };

  return (
    <Card>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">Text Diff & Comparison Engine</span>
          <Button variant="primary" size="sm" onClick={handleCompare}>
            <GitCompare className="w-3.5 h-3.5 mr-1.5" /> Compare Texts
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-900">Original Text 1:</label>
            <textarea
              value={text1}
              onChange={(e) => {
                setText1(e.target.value);
                setDiffResult(null);
              }}
              rows={8}
              placeholder="Paste original text here..."
              className="w-full p-3 text-xs font-mono bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-900">Modified Text 2:</label>
            <textarea
              value={text2}
              onChange={(e) => {
                setText2(e.target.value);
                setDiffResult(null);
              }}
              rows={8}
              placeholder="Paste text to compare here..."
              className="w-full p-3 text-xs font-mono bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-400"
            />
          </div>
        </div>

        {diffResult && (
          <div
            className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${
              diffResult.isMatch
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span>{diffResult.message}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
