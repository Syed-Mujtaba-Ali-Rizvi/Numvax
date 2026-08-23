'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Settings, X } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export interface ConsentPreferences {
  analytics: boolean;
  advertising: boolean;
  personalizedAds: boolean;
}

export const ConsentBanner: React.FC = () => {
  const t = useTranslations('consent');
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPreferences>({
    analytics: false,
    advertising: false,
    personalizedAds: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('numvax_consent_preferences');
    if (!saved) {
      setIsVisible(true);
    } else {
      try {
        setPrefs(JSON.parse(saved));
      } catch (e) {
        setIsVisible(true);
      }
    }

    const handleReopen = () => {
      setShowSettings(true);
      setIsVisible(true);
    };

    window.addEventListener('reopen-consent-banner', handleReopen);
    return () => window.removeEventListener('reopen-consent-banner', handleReopen);
  }, []);

  const saveConsent = (updatedPrefs: ConsentPreferences) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem('numvax_consent_preferences', JSON.stringify(updatedPrefs));
    setPrefs(updatedPrefs);
    setIsVisible(false);
    setShowSettings(false);

    try {
      const windowWithGtag = window as any;
      if (typeof windowWithGtag.gtag === 'function') {
        windowWithGtag.gtag('consent', 'update', {
          analytics_storage: updatedPrefs.analytics ? 'granted' : 'denied',
          ad_storage: updatedPrefs.advertising ? 'granted' : 'denied',
          ad_user_data: updatedPrefs.advertising ? 'granted' : 'denied',
          ad_personalization: updatedPrefs.personalizedAds ? 'granted' : 'denied',
        });
      }
    } catch (err) {
      console.error('Error updating Google Consent Mode:', err);
    }
  };

  const handleAcceptAll = () => saveConsent({ analytics: true, advertising: true, personalizedAds: true });
  const handleRejectAll = () => saveConsent({ analytics: false, advertising: false, personalizedAds: false });
  const handleSaveCustom = () => saveConsent(prefs);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-neutral-900 text-white rounded-xl shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-neutral-900">{t('title')}</h4>
                <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
                  {t('description')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="text-neutral-600">
                <Settings className="w-4 h-4 mr-1.5" /> {t('customize')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRejectAll} className="border-neutral-300">
                {t('rejectNonEssential')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleAcceptAll}>
                {t('acceptAll')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <span className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-neutral-600" /> {t('settingsTitle')}
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                title={t('back')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Essential */}
              <div className="flex items-start justify-between gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    {t('essential.title')}
                    <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-700 rounded text-[9px] font-bold uppercase">
                      {t('essential.alwaysActive')}
                    </span>
                  </span>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">{t('essential.desc')}</p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4 p-3 border border-neutral-200 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-neutral-900">{t('analytics.title')}</span>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">{t('analytics.desc')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={e => setPrefs(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900" />
                </label>
              </div>

              {/* Advertising */}
              <div className="flex items-start justify-between gap-4 p-3 border border-neutral-200 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-neutral-900">{t('advertising.title')}</span>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">{t('advertising.desc')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={prefs.advertising}
                    onChange={e => setPrefs(prev => ({ ...prev, advertising: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900" />
                </label>
              </div>

              {/* Personalization */}
              <div className="flex items-start justify-between gap-4 p-3 border border-neutral-200 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-neutral-900">{t('personalization.title')}</span>
                  <p className="text-[11px] text-neutral-500 leading-relaxed">{t('personalization.desc')}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    checked={prefs.personalizedAds}
                    onChange={e => setPrefs(prev => ({ ...prev, personalizedAds: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900" />
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-200 text-xs">
              <div className="flex gap-2.5 text-neutral-500">
                <Link href="/privacy-policy" className="hover:underline font-semibold">{t('privacyPolicy')}</Link>
                <Link href="/cookie-policy" className="hover:underline font-semibold">{t('cookiePolicy')}</Link>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>{t('back')}</Button>
                <Button variant="primary" size="sm" onClick={handleSaveCustom}>{t('savePreferences')}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
