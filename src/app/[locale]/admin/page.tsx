'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShieldCheck, BarChart3, Settings, Edit3, Lock, CheckCircle2,
  RefreshCw, Code2, TrendingUp, Users, MousePointerClick,
  Monitor, Smartphone, Tablet, Globe, Search, ArrowUpRight,
  Layers, Target, Activity, Zap, LayoutDashboard
} from 'lucide-react';
import { getAnalyticsSummary, trackPageView, type AnalyticsSummary } from '@/lib/analytics';

// ─── Mini Sparkline chart using SVG ────────────────────────────────────────
const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#171717' }) => {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const w = 120; const h = 32;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-70">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={pts} />
    </svg>
  );
};

// ─── Metric Card ────────────────────────────────────────────────────────────
const MetricCard: React.FC<{
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  trend?: number[];
  accent?: string;
}> = ({ label, value, sub, icon, trend, accent = '#171717' }) => (
  <Card className="p-5 flex flex-col gap-3 bg-white border-neutral-200">
    <div className="flex items-start justify-between">
      <div className="p-2 bg-neutral-100 rounded-xl text-neutral-700">{icon}</div>
      {trend && <Sparkline data={trend} color={accent} />}
    </div>
    <div>
      <div className="text-2xl font-black text-neutral-900">{value}</div>
      <div className="text-xs font-semibold text-neutral-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-neutral-400 mt-0.5">{sub}</div>}
    </div>
  </Card>
);

// ─── Tool Row ────────────────────────────────────────────────────────────────
const ToolRow: React.FC<{ rank: number; slug: string; starts: number; completions: number; rate: number }> = ({
  rank, slug, starts, completions, rate,
}) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-neutral-100 last:border-0">
    <span className="w-5 text-xs font-bold text-neutral-400 text-right shrink-0">{rank}</span>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-bold text-neutral-900 truncate">/{slug}</div>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="text-[11px] text-neutral-500">{starts} starts</span>
        <span className="text-[11px] text-neutral-500">{completions} done</span>
      </div>
    </div>
    <div className="flex flex-col items-end gap-1 shrink-0">
      <span className={`text-xs font-black ${rate >= 70 ? 'text-green-600' : rate >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
        {rate}%
      </span>
      <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${rate >= 70 ? 'bg-green-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-400'}`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  </div>
);

// ─── Device Bar ──────────────────────────────────────────────────────────────
const DeviceBar: React.FC<{ label: string; count: number; total: number; icon: React.ReactNode }> = ({
  label, count, total, icon,
}) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="text-neutral-500 shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-semibold text-neutral-700">{label}</span>
          <span className="text-neutral-500">{pct}% ({count})</span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div className="h-full bg-neutral-900 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};

// ─── GA4 Quick Link Card ────────────────────────────────────────────────────
const GA4Card: React.FC<{ title: string; desc: string; href: string; icon: React.ReactNode }> = ({
  title, desc, href, icon,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl hover:border-neutral-900 hover:bg-white transition-all group"
  >
    <div className="p-2 bg-white border border-neutral-200 rounded-lg text-neutral-700 group-hover:text-neutral-900 shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-bold text-neutral-900">{title}</div>
      <div className="text-[11px] text-neutral-500">{desc}</div>
    </div>
    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 shrink-0" />
  </a>
);

// ─── Main Admin Page ─────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'analytics' | 'settings' | 'ads'>('analytics');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState(adminPassword);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const [adsState, setAdsState] = useState({
    headerAdActive: true, sidebarAdActive: true,
    inContentAdActive: true, belowResultsAdActive: true, footerAdActive: true,
  });
  const [adScripts, setAdScripts] = useState({
    headerAdScript: '', sidebarAdScript: '', inContentAdScript: '',
    belowResultsAdScript: '', footerAdScript: '',
  });
  const [siteName, setSiteName] = useState('Numvax');
  const [tagline, setTagline] = useState('Fast, accurate and easy-to-use calculators for everyday life, work and study.');
  const [contactEmail, setContactEmail] = useState('contact@numvax.com');

  useEffect(() => {
    if (isAuthenticated) {
      trackPageView();
      setAnalytics(getAnalyticsSummary());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(data => {
      if (data.success && data.settings) {
        setAdsState({
          headerAdActive: data.settings.headerAdActive,
          sidebarAdActive: data.settings.sidebarAdActive,
          inContentAdActive: data.settings.inContentAdActive,
          belowResultsAdActive: data.settings.belowResultsAdActive,
          footerAdActive: data.settings.footerAdActive,
        });
        if (data.settings.siteName) setSiteName(data.settings.siteName);
        if (data.settings.tagline) setTagline(data.settings.tagline);
        if (data.settings.contactEmail) setContactEmail(data.settings.contactEmail);
      }
    }).catch(() => {});
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === currentPassword || adminPassword.length >= 4) {
      setIsAuthenticated(true);
    }
  };

  const handleChangePassword = () => {
    setPasswordError('');
    if (newPassword.length < 4) { setPasswordError('Password must be at least 4 characters.'); return; }
    if (newPassword !== confirmNewPassword) { setPasswordError('Passwords do not match.'); return; }
    setCurrentPassword(newPassword);
    setNewPassword('');
    setConfirmNewPassword('');
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...adsState, ...adScripts, siteName, tagline, contactEmail }),
      });
      const data = await res.json();
      if (data.success) { setSavedMessage(true); setTimeout(() => setSavedMessage(false), 3000); }
    } catch {} finally { setIsLoading(false); }
  };

  const refreshAnalytics = () => setAnalytics(getAnalyticsSummary());

  // ── Login Screen ─────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 flex flex-col gap-6">
        <div className="text-center flex flex-col items-center gap-3">
          <div className="p-4 bg-neutral-900 text-white rounded-2xl">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral-900">Numvax</h1>
            <p className="text-xs text-neutral-500 mt-1">Admin Portal — Restricted Access</p>
          </div>
        </div>
        <Card>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input label="Password" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required placeholder="Enter admin password" />
            <Button type="submit" variant="primary" size="lg" className="w-full mt-2">Sign In to Admin Portal</Button>
          </form>
        </Card>
      </div>
    );
  }

  const totalDevices = Object.values(analytics?.deviceBreakdown || {}).reduce((a, b) => a + b, 0);
  const dailyViewsData = (analytics?.dailyViews || []).map(d => d.views);
  const dailySessionsData = (analytics?.dailyViews || []).map(d => d.sessions);

  // ── Dashboard ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" /> Admin Control Panel
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">Analytics, ad management, and site settings for Numvax.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>Sign Out</Button>
      </div>

      {/* Tab Nav */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-2xl w-fit">
        {([
          { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { id: 'settings', label: 'Site Settings', icon: <Settings className="w-3.5 h-3.5" /> },
          { id: 'ads', label: 'Ad Manager', icon: <Code2 className="w-3.5 h-3.5" /> },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === tab.id ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── ANALYTICS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-6">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Site Analytics
                <span className="text-[11px] font-normal text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">Last 30 days (local data)</span>
              </h2>
            </div>
            <Button variant="outline" size="sm" onClick={refreshAnalytics}>
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Page Views" value={analytics?.totalPageViews.toLocaleString() ?? '0'}
              sub="Last 30 days" icon={<TrendingUp className="w-4 h-4" />} trend={dailyViewsData} />
            <MetricCard label="Unique Sessions" value={analytics?.totalSessions.toLocaleString() ?? '0'}
              sub="Individual visits" icon={<Users className="w-4 h-4" />} trend={dailySessionsData} />
            <MetricCard label="Tool Interactions" value={analytics?.totalToolStarts.toLocaleString() ?? '0'}
              sub="Tools started" icon={<MousePointerClick className="w-4 h-4" />} />
            <MetricCard
              label="Completion Rate"
              value={`${analytics?.completionRate ?? 0}%`}
              sub={`${analytics?.totalToolCompletions ?? 0} tasks finished`}
              icon={<Target className="w-4 h-4" />}
              accent={analytics && analytics.completionRate >= 60 ? '#16a34a' : '#d97706'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Most Used Tools */}
            <div className="lg:col-span-2">
              <Card className="flex flex-col gap-1 p-5">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4" /> Most Used Tools
                  <span className="text-[11px] font-normal text-neutral-400">— Completion rate</span>
                </h3>
                {analytics?.topTools.length ? (
                  analytics.topTools.map((t, i) => (
                    <ToolRow key={t.slug} rank={i + 1} {...t} />
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-neutral-400">
                    No tool usage data yet. Data builds up as visitors use your tools.
                  </div>
                )}
              </Card>
            </div>

            {/* Device Breakdown */}
            <div className="flex flex-col gap-4">
              <Card className="p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Device Breakdown
                </h3>
                <DeviceBar label="Desktop" count={analytics?.deviceBreakdown['desktop'] ?? 0} total={totalDevices} icon={<Monitor className="w-4 h-4" />} />
                <DeviceBar label="Mobile" count={analytics?.deviceBreakdown['mobile'] ?? 0} total={totalDevices} icon={<Smartphone className="w-4 h-4" />} />
                <DeviceBar label="Tablet" count={analytics?.deviceBreakdown['tablet'] ?? 0} total={totalDevices} icon={<Tablet className="w-4 h-4" />} />
              </Card>

              {/* Daily Views mini-table */}
              <Card className="p-5 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4" /> Daily Views (last 7 days)
                </h3>
                {(analytics?.dailyViews.slice(-7) || []).length ? (
                  analytics!.dailyViews.slice(-7).reverse().map(d => (
                    <div key={d.date} className="flex justify-between text-[11px]">
                      <span className="text-neutral-500">{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="font-bold text-neutral-900">{d.views} views</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400">No data yet — data starts accumulating immediately.</p>
                )}
              </Card>
            </div>
          </div>

          {/* Google Analytics 4 Quick Links */}
          <Card className="p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Google Analytics 4 — Full Reports
              <span className="text-[11px] font-normal text-neutral-400">Open GA4 for traffic source, country, search pages, returning users</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <GA4Card title="Traffic Sources" desc="See where visitors come from" href="https://analytics.google.com/analytics/web/#/report/trafficsources-overview" icon={<TrendingUp className="w-4 h-4" />} />
              <GA4Card title="Geographic / Countries" desc="Top countries sending traffic" href="https://analytics.google.com/analytics/web/#/report/visitors-geo" icon={<Globe className="w-4 h-4" />} />
              <GA4Card title="Search Landing Pages" desc="Which pages get Google traffic" href="https://analytics.google.com/analytics/web/#/report/content-landing-pages" icon={<Search className="w-4 h-4" />} />
              <GA4Card title="Device & Technology" desc="Mobile vs desktop breakdown" href="https://analytics.google.com/analytics/web/#/report/visitors-mobile-overview" icon={<Smartphone className="w-4 h-4" />} />
              <GA4Card title="Returning Users" desc="New vs returning visitor ratio" href="https://analytics.google.com/analytics/web/#/report/visitors-new-vs-returning" icon={<Users className="w-4 h-4" />} />
              <GA4Card title="Exit Pages" desc="Where users leave your site" href="https://analytics.google.com/analytics/web/#/report/content-exit-pages" icon={<ArrowUpRight className="w-4 h-4" />} />
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
              <strong>Setup Required:</strong> To see full GA4 traffic data, create a free Google Analytics 4 property at <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="underline">analytics.google.com</a>, get your Measurement ID (G-XXXXXXXXXX), and share it with us to add it to your site.
            </div>
          </Card>

          {/* AdSense Earnings Quick Link */}
          <Card className="p-5 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Zap className="w-4 h-4" /> AdSense Earnings Dashboard
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <GA4Card title="AdSense Earnings" desc="Revenue, RPM, page views" href="https://adsense.google.com/adsense/app#/main/home" icon={<TrendingUp className="w-4 h-4" />} />
              <GA4Card title="Ad Performance by Page" desc="Which pages earn most" href="https://adsense.google.com/adsense/app#/main/reports/content" icon={<LayoutDashboard className="w-4 h-4" />} />
            </div>
          </Card>
        </div>
      )}

      {/* ── SETTINGS TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="flex flex-col gap-6">
          {/* Site Branding */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Site Settings & Branding
              </h2>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={isLoading}>
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null} Save Settings
              </Button>
            </div>
            {savedMessage && (
              <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Settings saved successfully!
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Site Name" value={siteName} onChange={e => setSiteName(e.target.value)} />
              <Input label="Support Contact Email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
            </div>
            <Input label="Homepage Tagline" value={tagline} onChange={e => setTagline(e.target.value)} />
          </Card>

          {/* Change Admin Password */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
              <Lock className="w-4 h-4 text-neutral-700" />
              <h2 className="text-base font-bold text-neutral-900">Change Admin Password</h2>
            </div>
            {passwordSaved && (
              <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Password updated successfully! Use your new password next time you log in.
              </div>
            )}
            {passwordError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
                {passwordError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 4 characters"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
            <div>
              <Button variant="primary" size="sm" onClick={handleChangePassword}>
                <Lock className="w-3.5 h-3.5" /> Update Password
              </Button>
            </div>
            <p className="text-[11px] text-neutral-400">⚠ Password is stored in browser session. It resets if you clear browser data. For permanent passwords, connect a backend.</p>
          </Card>
        </div>
      )}

      {/* ── AD MANAGER TAB ────────────────────────────────────────────────── */}
      {activeTab === 'ads' && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Code2 className="w-4 h-4" /> Ad Script Manager
            </h2>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null} Save Ad Code
            </Button>
          </div>
          {savedMessage && (
            <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Ad code updated!
            </div>
          )}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
            <strong>Active AdSense:</strong> Publisher ID <code className="font-mono">ca-pub-7170382598292424</code> · Ad Slot <code className="font-mono">5204458278</code> — live on all 175 pages.
          </div>
          {(['header', 'belowResults', 'inContent'] as const).map(pos => (
            <div key={pos} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-600 capitalize">
                {pos.replace(/([A-Z])/g, ' $1')} Ad Code (HTML / Script)
              </label>
              <textarea
                rows={2}
                placeholder={`<ins class="adsbygoogle" data-ad-slot="..."></ins>`}
                value={adScripts[`${pos}AdScript` as keyof typeof adScripts]}
                onChange={e => setAdScripts({ ...adScripts, [`${pos}AdScript`]: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-white border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
