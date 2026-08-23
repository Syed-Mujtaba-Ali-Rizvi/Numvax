import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  suffix?: string;
  prefix?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, suffix, prefix, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center rounded-xl shadow-xs">
          {prefix && (
            <span className="absolute left-3 text-neutral-500 text-sm pointer-events-none select-none">
              {prefix}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full px-3 py-2 text-sm bg-white text-neutral-900 border rounded-xl transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-400',
                'placeholder:text-neutral-400',
                error
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-neutral-300',
                prefix && 'pl-8',
                suffix && 'pr-8',
                className
              )
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-neutral-500 text-xs font-medium pointer-events-none select-none">
              {suffix}
            </span>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-neutral-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
