'use client';

import React, { useEffect, useState } from 'react';
import { History, Trash2, Clock } from 'lucide-react';
import { Button } from '../ui/button';

export interface HistoryItem {
  id: string;
  slug: string;
  toolName: string;
  summary: string;
  timestamp: string;
}

export interface CalculatorHistoryProps {
  slug: string;
  onRestore?: (item: HistoryItem) => void;
}

export const CalculatorHistory: React.FC<CalculatorHistoryProps> = ({ slug, onRestore }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`numvax_history_${slug}`) || localStorage.getItem(`calcora_history_${slug}`);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Storage unavailable or parsing error
    }
  }, [slug]);

  const clearHistory = () => {
    localStorage.removeItem(`numvax_history_${slug}`);
    localStorage.removeItem(`calcora_history_${slug}`);
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className="w-full mt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
        >
          <History className="w-3.5 h-3.5" />
          Recent Calculations ({history.length})
        </button>
        {isOpen && (
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-3 h-3" /> Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="flex flex-col gap-2 mt-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onRestore && onRestore(item)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-200/60 transition-colors cursor-pointer"
            >
              <span className="font-medium text-neutral-800">{item.summary}</span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                <Clock className="w-2.5 h-2.5" />
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function saveCalculationHistory(slug: string, toolName: string, summary: string) {
  try {
    const key = `numvax_history_${slug}`;
    const stored = localStorage.getItem(key) || localStorage.getItem(`calcora_history_${slug}`);
    const history: HistoryItem[] = stored ? JSON.parse(stored) : [];

    const newItem: HistoryItem = {
      id: Date.now().toString(),
      slug,
      toolName,
      summary,
      timestamp: new Date().toISOString(),
    };

    const updated = [newItem, ...history.filter((h) => h.summary !== summary)].slice(0, 10);
    localStorage.setItem(key, JSON.stringify(updated));

    // Also update global recent calculators list
    const globalRecentKey = 'numvax_recent_calculators';
    const globalStored = localStorage.getItem(globalRecentKey) || localStorage.getItem('calcora_recent_calculators');
    const globalList: Array<{ slug: string; name: string; timestamp: string }> = globalStored
      ? JSON.parse(globalStored)
      : [];

    const globalUpdated = [
      { slug, name: toolName, timestamp: new Date().toISOString() },
      ...globalList.filter((g) => g.slug !== slug),
    ].slice(0, 5);

    localStorage.setItem(globalRecentKey, JSON.stringify(globalUpdated));
  } catch {
    // LocalStorage fallback error ignored
  }
}
