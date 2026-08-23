'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export interface AdSlotProps {
  position: 'header' | 'sidebar' | 'in_content' | 'below_results' | 'footer';
  className?: string;
  /** Your AdSense publisher ID, e.g. "ca-pub-7170382598292424" */
  adClient?: string;
  /** The ad unit slot ID, e.g. "4321787290" */
  adSlot?: string;
  /** Ad format — defaults to "auto" */
  adFormat?: string;
  /** Full-width responsive — defaults to true */
  fullWidthResponsive?: boolean;
}

export const AdSlot: React.FC<AdSlotProps> = ({
  position,
  className = '',
  adClient = 'ca-pub-7170382598292424',
  adSlot = '5204458278',
  adFormat = 'auto',
  fullWidthResponsive = true,
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Only push the ad once per mount
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.error('AdSense push error:', err);
    }
  }, []);

  if (!adSlot) {
    return null;
  }

  return (
    <div
      className={`ad-slot no-print text-center min-h-0 ${className}`}
      data-ad-position={position}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
};
