'use client';

/**
 * Numvax Analytics Tracker
 * Lightweight client-side analytics stored in localStorage.
 * Tracks tool usage, completions, and session data.
 */

export interface ToolEvent {
  slug: string;
  name: string;
  action: 'start' | 'complete' | 'download' | 'error';
  timestamp: number;
  sessionId: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  pageViews: number;
  toolStarts: Record<string, number>;
  toolCompletions: Record<string, number>;
  countries: Record<string, number>;
  devices: Record<string, number>;
  sessions: string[];
}

const STORAGE_KEY = 'numvax_analytics';
const SESSION_KEY = 'numvax_session';
const MAX_DAYS = 30;

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadStats(): Record<string, DailyStats> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStats(stats: Record<string, DailyStats>) {
  if (typeof window === 'undefined') return;
  // Prune stats older than MAX_DAYS
  const keys = Object.keys(stats).sort();
  while (keys.length > MAX_DAYS) {
    delete stats[keys.shift()!];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage full - clear old data
    localStorage.removeItem(STORAGE_KEY);
  }
}

function getToday(stats: Record<string, DailyStats>): DailyStats {
  const key = getTodayKey();
  if (!stats[key]) {
    stats[key] = {
      date: key,
      pageViews: 0,
      toolStarts: {},
      toolCompletions: {},
      countries: {},
      devices: {},
      sessions: [],
    };
  }
  return stats[key];
}

function detectDevice(): string {
  if (typeof window === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) {
    if (/iPad/i.test(ua)) return 'tablet';
    return 'mobile';
  }
  return 'desktop';
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function trackPageView() {
  if (typeof window === 'undefined') return;
  const stats = loadStats();
  const today = getToday(stats);
  today.pageViews++;
  const sid = getSessionId();
  if (!today.sessions.includes(sid)) today.sessions.push(sid);
  const device = detectDevice();
  today.devices[device] = (today.devices[device] || 0) + 1;
  saveStats(stats);
}

export function trackToolStart(slug: string, name: string) {
  if (typeof window === 'undefined') return;
  const stats = loadStats();
  const today = getToday(stats);
  today.toolStarts[slug] = (today.toolStarts[slug] || 0) + 1;
  saveStats(stats);
  // Fire GA4 event if available
  try {
    (window as any).gtag?.('event', 'tool_start', { tool_name: name, tool_slug: slug });
  } catch {}
}

export function trackToolComplete(slug: string, name: string) {
  if (typeof window === 'undefined') return;
  const stats = loadStats();
  const today = getToday(stats);
  today.toolCompletions[slug] = (today.toolCompletions[slug] || 0) + 1;
  saveStats(stats);
  try {
    (window as any).gtag?.('event', 'tool_complete', { tool_name: name, tool_slug: slug });
  } catch {}
}

export function trackSearch(query: string, resultCount: number) {
  if (typeof window === 'undefined' || !query.trim()) return;
  try {
    (window as any).gtag?.('event', 'search', {
      search_term: query.trim(),
      result_count: resultCount,
    });
  } catch {}
}

// ─── Analytics Reader (for admin) ─────────────────────────────────────────────

export interface AnalyticsSummary {
  totalPageViews: number;
  totalSessions: number;
  totalToolStarts: number;
  totalToolCompletions: number;
  completionRate: number;
  topTools: Array<{ slug: string; starts: number; completions: number; rate: number }>;
  deviceBreakdown: Record<string, number>;
  dailyViews: Array<{ date: string; views: number; sessions: number }>;
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const stats = loadStats();
  const days = Object.values(stats).sort((a, b) => a.date.localeCompare(b.date));

  let totalPageViews = 0;
  const sessionSet = new Set<string>();
  let totalToolStarts = 0;
  let totalToolCompletions = 0;
  const toolStarts: Record<string, number> = {};
  const toolCompletions: Record<string, number> = {};
  const deviceBreakdown: Record<string, number> = {};
  const dailyViews: Array<{ date: string; views: number; sessions: number }> = [];

  for (const day of days) {
    totalPageViews += day.pageViews;
    day.sessions.forEach((s) => sessionSet.add(s));
    for (const [slug, count] of Object.entries(day.toolStarts)) {
      toolStarts[slug] = (toolStarts[slug] || 0) + count;
      totalToolStarts += count;
    }
    for (const [slug, count] of Object.entries(day.toolCompletions)) {
      toolCompletions[slug] = (toolCompletions[slug] || 0) + count;
      totalToolCompletions += count;
    }
    for (const [device, count] of Object.entries(day.devices)) {
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + count;
    }
    dailyViews.push({ date: day.date, views: day.pageViews, sessions: day.sessions.length });
  }

  const topTools = Object.entries(toolStarts)
    .map(([slug, starts]) => ({
      slug,
      starts,
      completions: toolCompletions[slug] || 0,
      rate: starts > 0 ? Math.round(((toolCompletions[slug] || 0) / starts) * 100) : 0,
    }))
    .sort((a, b) => b.starts - a.starts)
    .slice(0, 10);

  return {
    totalPageViews,
    totalSessions: sessionSet.size,
    totalToolStarts,
    totalToolCompletions,
    completionRate: totalToolStarts > 0 ? Math.round((totalToolCompletions / totalToolStarts) * 100) : 0,
    topTools,
    deviceBreakdown,
    dailyViews: dailyViews.slice(-14), // last 14 days
  };
}
