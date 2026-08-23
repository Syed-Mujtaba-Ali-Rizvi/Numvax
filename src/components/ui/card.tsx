import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 transition-all',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
