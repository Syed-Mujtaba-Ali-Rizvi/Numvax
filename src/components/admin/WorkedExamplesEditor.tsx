'use client';

import React from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';

export interface WorkedExample {
  title: string;
  example: string;
}

interface WorkedExamplesEditorProps {
  examples: WorkedExample[];
  onChange: (examples: WorkedExample[]) => void;
}

export function WorkedExamplesEditor({ examples, onChange }: WorkedExamplesEditorProps) {
  const handleAdd = () => {
    onChange([...examples, { title: '', example: '' }]);
  };

  const handleUpdate = (index: number, field: 'title' | 'example', value: string) => {
    const updated = [...examples];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(examples.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-neutral-500" /> Worked Step-by-Step Examples ({examples.length})
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Example
        </button>
      </div>

      {examples.length === 0 ? (
        <div className="p-4 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-400">No worked examples added. Worked examples provide rich content for search engines and users.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {examples.map((item, idx) => (
            <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-500">Example #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  title="Remove Example"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Example Title (e.g., Calculating 20% Discount on $150 Item)"
                value={item.title}
                onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />

              <textarea
                rows={3}
                placeholder="Step 1: Divide discount rate by 100...&#10;Step 2: Multiply by original price..."
                value={item.example}
                onChange={(e) => handleUpdate(idx, 'example', e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
