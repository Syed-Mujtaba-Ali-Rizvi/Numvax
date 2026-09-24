'use client';

import React from 'react';
import { Plus, Trash2, HelpCircle, ChevronDown } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FaqListEditorProps {
  faqs: FAQItem[];
  onChange: (faqs: FAQItem[]) => void;
}

export function FaqListEditor({ faqs, onChange }: FaqListEditorProps) {
  const handleAdd = () => {
    onChange([...faqs, { question: '', answer: '' }]);
  };

  const handleUpdate = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-neutral-500" /> Frequently Asked Questions ({faqs.length})
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add FAQ Item
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="p-4 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl text-center">
          <p className="text-xs text-neutral-400">No FAQ items yet. Click &quot;Add FAQ Item&quot; to add structured Q&As for Google rich snippets.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col gap-2 relative group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-neutral-500">FAQ #{idx + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 text-neutral-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  title="Remove FAQ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                type="text"
                placeholder="Question (e.g., How does this tool calculate BMI?)"
                value={faq.question}
                onChange={(e) => handleUpdate(idx, 'question', e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-semibold bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />

              <textarea
                rows={2}
                placeholder="Answer explanation..."
                value={faq.answer}
                onChange={(e) => handleUpdate(idx, 'answer', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
