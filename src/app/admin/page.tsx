'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ShieldCheck,
  Wrench,
  FileText,
  FolderTree,
  Search,
  Settings,
  Layers,
  Sparkles,
  Lock,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Key,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

export default function AdminMainPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data
  const [stats, setStats] = useState<any>(null);
  const [seoIssues, setSeoIssues] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // 1. Check Auth Session
  useEffect(() => {
    fetch('/api/admin/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAdminUser(data.admin);
          loadDashboardData();
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  const loadDashboardData = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setSeoIssues(data.seoIssues || []);
        setRecentUpdates(data.recentUpdates || []);
        setRecentHistory(data.recentHistory || []);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setIsAuthenticated(true);
        setAdminUser(data.admin);
        loadDashboardData();
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('An error occurred during login. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-neutral-500">Loading Numvax Admin...</span>
        </div>
      </div>
    );
  }

  // ─── Login Screen ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 antialiased">
        <div className="max-w-md w-full flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Numvax Admin Panel</h1>
            <p className="text-xs text-neutral-500">Sign in to manage SEO, content, tools, and site settings.</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  {loginError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700">Admin Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@numvax.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoggingIn ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Sign In to Admin Portal
              </button>
            </form>
          </div>

          <div className="text-center text-[11px] text-neutral-400">
            Protected by PBKDF2 cryptography & secure session tokens.
          </div>
        </div>
      </div>
    );
  }

  // ─── Dashboard Screen ──────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              Dashboard Overview
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Welcome back, <span className="font-bold text-neutral-800">{adminUser?.name || 'Admin'}</span>. Here is the health and SEO summary for Numvax.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDashboardData}
              disabled={isLoadingStats}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <Link
              href="/admin/tools/new"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Tool
            </Link>
          </div>
        </div>

        {/* 1. Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-neutral-100 text-neutral-800 rounded-xl">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                {stats?.publishedTools ?? '0'} Published
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900">{stats?.totalTools ?? '0'}</div>
              <div className="text-xs font-semibold text-neutral-500 mt-0.5">Total Tools & Calculators</div>
            </div>
          </div>

          <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-neutral-100 text-neutral-800 rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {stats?.publishedPages ?? '0'} Live
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900">{stats?.totalPages ?? '0'}</div>
              <div className="text-xs font-semibold text-neutral-500 mt-0.5">Static Content Pages</div>
            </div>
          </div>

          <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-neutral-100 text-neutral-800 rounded-xl">
                <FolderTree className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                Organized
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900">{stats?.totalCategories ?? '0'}</div>
              <div className="text-xs font-semibold text-neutral-500 mt-0.5">Tool Categories</div>
            </div>
          </div>

          <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                (stats?.seoIssueCount || 0) > 0 ? 'text-amber-700 bg-amber-50' : 'text-green-700 bg-green-50'
              }`}>
                {(stats?.seoIssueCount || 0) > 0 ? 'Action Needed' : 'Healthy'}
              </span>
            </div>
            <div>
              <div className="text-2xl font-black text-neutral-900">{stats?.seoIssueCount ?? '0'}</div>
              <div className="text-xs font-semibold text-neutral-500 mt-0.5">SEO Recommendations</div>
            </div>
          </div>
        </div>

        {/* 2. Quick Access Shortcuts */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider text-[11px]">Quick Management</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { href: '/admin/tools', label: 'Manage Tools', sub: `${stats?.totalTools || 0} tools`, icon: Wrench },
              { href: '/admin/pages', label: 'Static Pages', sub: `${stats?.totalPages || 0} pages`, icon: FileText },
              { href: '/admin/categories', label: 'Categories', sub: `${stats?.totalCategories || 0} groups`, icon: FolderTree },
              { href: '/admin/seo/bulk', label: 'Bulk SEO', sub: 'Fast spreadsheet', icon: Layers },
              { href: '/admin/seo/redirects', label: '301 Redirects', sub: 'URL router', icon: ArrowUpRight },
              { href: '/admin/settings/seo', label: 'Global SEO', sub: 'Templates & meta', icon: Globe },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  href={card.href}
                  className="p-4 bg-neutral-50 border border-neutral-200 hover:border-neutral-900 hover:bg-white rounded-2xl transition-all group flex flex-col gap-2"
                >
                  <div className="p-2 bg-white group-hover:bg-neutral-900 group-hover:text-white border border-neutral-200 rounded-xl text-neutral-800 w-fit transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 group-hover:text-neutral-900">{card.label}</div>
                    <div className="text-[11px] text-neutral-400">{card.sub}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. Main Split Section: SEO Issues & Recently Updated */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SEO Issues Card */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-neutral-900">Priority SEO Recommendations</h3>
              </div>
              <Link href="/admin/seo" className="text-xs font-bold text-neutral-600 hover:text-neutral-900">
                View All →
              </Link>
            </div>

            {seoIssues.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <span className="text-xs font-bold text-neutral-800">All SEO Checks Passed!</span>
                <span className="text-[11px] text-neutral-400">All tools and pages meet title, description, and keyword standards.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {seoIssues.slice(0, 5).map((issue, idx) => (
                  <Link
                    key={idx}
                    href={issue.type === 'tool' ? `/admin/tools/${issue.id}` : `/admin/pages/${issue.id}`}
                    className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-between transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-bold text-neutral-900 truncate group-hover:underline">
                        {issue.title}
                      </div>
                      <div className="text-[11px] text-amber-700 mt-0.5">{issue.issue}</div>
                    </div>
                    <span className="text-[11px] font-bold text-neutral-400 group-hover:text-neutral-900 shrink-0">
                      Fix →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recently Updated Items */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-500" />
                <h3 className="text-sm font-bold text-neutral-900">Recently Updated Items</h3>
              </div>
              <Link href="/admin/tools" className="text-xs font-bold text-neutral-600 hover:text-neutral-900">
                All Tools →
              </Link>
            </div>

            {recentUpdates.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">No recently modified items.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentUpdates.map((item, idx) => (
                  <Link
                    key={idx}
                    href={`/admin/tools/${item.id}`}
                    className="p-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="text-xs font-bold text-neutral-900 group-hover:underline">{item.name}</div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        /{item.slug} • {item.category}
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-400">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Recent Audit History */}
        {recentHistory.length > 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-500" />
                <h3 className="text-sm font-bold text-neutral-900">Recent Activity & Revision History</h3>
              </div>
              <Link href="/admin/history" className="text-xs font-bold text-neutral-600 hover:text-neutral-900">
                Full Log →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentHistory.map((h, idx) => (
                <div key={idx} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400">
                    <span className="font-bold uppercase tracking-wider text-neutral-600">{h.action}</span>
                    <span>{new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="font-bold text-neutral-900 truncate">{h.entityTitle}</div>
                  <div className="text-[11px] text-neutral-500">by {h.changedBy}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
