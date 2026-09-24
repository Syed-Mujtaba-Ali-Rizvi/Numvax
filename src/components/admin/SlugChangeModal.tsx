'use client';

import React from 'react';
import { ArrowRightLeft, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface SlugChangeModalProps {
  isOpen: boolean;
  oldSlug: string;
  newSlug: string;
  onConfirm: (createRedirect: boolean) => void;
  onCancel: () => void;
}

export function SlugChangeModal({
  isOpen,
  oldSlug,
  newSlug,
  onConfirm,
  onCancel,
}: SlugChangeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">URL Slug Modified</h3>
              <p className="text-xs text-neutral-500">Protect existing links and search rank</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1 text-neutral-400 hover:text-neutral-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-col gap-2.5 text-xs">
          <div>
            <span className="font-bold text-neutral-500 uppercase tracking-wider text-[10px]">Previous URL:</span>
            <div className="font-mono text-neutral-700 bg-white p-2 rounded-lg border border-neutral-200 mt-0.5 truncate">
              https://numvax.com/{oldSlug}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-xs font-bold text-neutral-400">↓ will change to ↓</span>
          </div>
          <div>
            <span className="font-bold text-green-700 uppercase tracking-wider text-[10px]">New URL:</span>
            <div className="font-mono text-neutral-900 bg-white p-2 rounded-lg border border-green-300 mt-0.5 truncate font-bold">
              https://numvax.com/{newSlug}
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Recommended:</strong> Creating a <strong>301 Permanent Redirect</strong> ensures users and Google search bots visiting the old URL are seamlessly forwarded to the new URL without broken 404 errors.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <button
            type="button"
            onClick={() => onConfirm(true)}
            className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" /> Save with 301 Redirect
          </button>
          <button
            type="button"
            onClick={() => onConfirm(false)}
            className="px-4 py-2.5 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer"
          >
            Save without Redirect
          </button>
        </div>
      </div>
    </div>
  );
}
