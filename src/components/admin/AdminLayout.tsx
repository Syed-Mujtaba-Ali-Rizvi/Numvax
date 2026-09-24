'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Wrench,
  FileText,
  FolderTree,
  Search,
  Settings,
  Globe,
  SlidersHorizontal,
  FileCode,
  ArrowRightLeft,
  Key,
  Layers,
  History,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Home,
  Compass,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.results || []);
          setSearchOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin');
      router.refresh();
    } catch {}
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
    },
    {
      title: 'Tools & Calculators',
      items: [
        { href: '/admin/tools', label: 'All Tools', icon: Wrench, exact: true },
        { href: '/admin/tools/new', label: 'Add Tool', icon: Plus, exact: true },
      ],
    },
    {
      title: 'Pages & Content',
      items: [
        { href: '/admin/pages', label: 'All Pages', icon: FileText, exact: true },
        { href: '/admin/pages/homepage', label: 'Homepage', icon: Home, exact: true },
      ],
    },
    {
      title: 'Taxonomy',
      items: [{ href: '/admin/categories', label: 'Categories', icon: FolderTree, exact: true }],
    },
    {
      title: 'SEO Suite',
      items: [
        { href: '/admin/seo', label: 'SEO Overview', icon: Search, exact: true },
        { href: '/admin/seo/bulk', label: 'Bulk SEO Editor', icon: Layers, exact: true },
        { href: '/admin/seo/keywords', label: 'Keywords & Aliases', icon: Key, exact: true },
        { href: '/admin/seo/redirects', label: 'Redirects (301/302)', icon: ArrowRightLeft, exact: true },
        { href: '/admin/seo/sitemap', label: 'Sitemap', icon: Compass, exact: true },
        { href: '/admin/seo/robots', label: 'Robots.txt', icon: FileCode, exact: true },
      ],
    },
    {
      title: 'Settings',
      items: [
        { href: '/admin/settings/seo', label: 'Global SEO', icon: Globe, exact: true },
        { href: '/admin/settings/website', label: 'Website Settings', icon: SlidersHorizontal, exact: true },
        { href: '/admin/history', label: 'Revision History', icon: History, exact: true },
      ],
    },
  ];

  const isLinkActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href || pathname === `/en${href}` || pathname === `/es${href}` || pathname === `/fr${href}` || pathname === `/de${href}` || pathname === `/it${href}`;
    }
    return pathname.includes(href);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col antialiased text-neutral-900 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin" className="flex items-center gap-2.5 font-bold text-neutral-900">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight leading-none">Numvax</span>
              <span className="text-[10px] text-neutral-500 font-semibold tracking-wider uppercase mt-0.5">Admin CMS</span>
            </div>
          </Link>
        </div>

        {/* Global Admin Search */}
        <div className="flex-1 max-w-md mx-4 relative hidden sm:block" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tools, pages, keywords, redirects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setSearchOpen(true);
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-neutral-100 border border-transparent rounded-xl focus:bg-white focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-200 transition-all"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Search Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.url}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 border-b border-neutral-100 last:border-0 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{item.label}</div>
                    <div className="text-[11px] text-neutral-500">{item.sub}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">View Live Site</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main App Shell */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-6 gap-6">
        {/* Sidebar Desktop */}
        <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6 bg-white border border-neutral-200 rounded-3xl p-4 shadow-xs h-[calc(100vh-7rem)] sticky top-22 overflow-y-auto">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-1">
              <div className="px-3 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                {group.title}
              </div>
              {group.items.map((item, iIdx) => {
                const active = isLinkActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={iIdx}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                      active
                        ? 'bg-neutral-900 text-white shadow-xs font-bold'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-neutral-500'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden" onClick={() => setMobileMenuOpen(false)}>
            <div
              className="w-72 bg-white h-full p-4 flex flex-col gap-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-sm font-black text-neutral-900">Numvax Admin CMS</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-neutral-100">
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              {navGroups.map((group, gIdx) => (
                <div key={gIdx} className="flex flex-col gap-1">
                  <div className="px-3 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    {group.title}
                  </div>
                  {group.items.map((item, iIdx) => {
                    const active = isLinkActive(item.href, item.exact);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={iIdx}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                          active
                            ? 'bg-neutral-900 text-white font-bold'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-neutral-500'}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-white border-0 sm:border border-neutral-200 rounded-none sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xs">
          {children}
        </main>
      </div>
    </div>
  );
}
