'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Settings,
  Save,
  KeyRound,
  DollarSign,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Code2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function AdminWebsiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings State
  const [formData, setFormData] = useState({
    siteName: 'Numvax',
    contactEmail: 'contact@numvax.com',
    adsEnabled: true,
    headerAdActive: false,
    sidebarAdActive: true,
    inContentAdActive: true,
    belowResultsAdActive: true,
    footerAdActive: true,
    headerAdScript: '',
    sidebarAdScript: '',
    inContentAdScript: '',
    belowResultsAdScript: '',
    footerAdScript: '',
  });

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setFormData((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Website settings saved successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    setSavingPassword(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Admin password changed successfully' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-neutral-900" />
              Website &amp; Account Settings
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Manage website identity, Google AdSense placement scripts, and administrator security credentials.
            </p>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="underline ml-4">Dismiss</button>
          </div>
        )}

        {/* General Website Info Form */}
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-neutral-700" />
              Website Identity &amp; Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Website / Brand Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={formData.siteName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Public Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="contact@numvax.com"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* AdSense & Monetization Controls */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-neutral-700" />
                  Monetization &amp; Ad Placements
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Toggle ad slots or inject custom AdSense / ad network script tags safely.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="adsEnabled"
                  checked={formData.adsEnabled}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-xs font-semibold text-neutral-700">Global Ads Active:</span>
                {formData.adsEnabled ? (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">Enabled</span>
                ) : (
                  <span className="px-2.5 py-1 bg-neutral-200 text-neutral-600 rounded-lg text-xs font-bold">Disabled</span>
                )}
              </label>
            </div>

            <div className="space-y-4 pt-2 divide-y divide-neutral-100">
              {/* Header Ad */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-neutral-900">Header Ad Slot (Above Content)</div>
                  <div className="text-[11px] text-neutral-400">
                    Recommended: Keep disabled on unapproved AdSense sites to avoid screen-shield policy violations.
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="headerAdActive"
                    checked={formData.headerAdActive}
                    onChange={handleChange}
                    className="rounded text-neutral-900 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-neutral-700">{formData.headerAdActive ? 'Active' : 'Hidden'}</span>
                </label>
              </div>

              {/* Sidebar Ad */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-neutral-900">Sidebar Ad Slot</div>
                  <div className="text-[11px] text-neutral-400">High-viewability desktop sticky rail slot</div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="sidebarAdActive"
                    checked={formData.sidebarAdActive}
                    onChange={handleChange}
                    className="rounded text-neutral-900 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-neutral-700">{formData.sidebarAdActive ? 'Active' : 'Hidden'}</span>
                </label>
              </div>

              {/* In-Content Ad */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-neutral-900">In-Content Mid-Article Ad Slot</div>
                  <div className="text-[11px] text-neutral-400">Placed organically inside long explanations &amp; guides</div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="inContentAdActive"
                    checked={formData.inContentAdActive}
                    onChange={handleChange}
                    className="rounded text-neutral-900 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-neutral-700">{formData.inContentAdActive ? 'Active' : 'Hidden'}</span>
                </label>
              </div>

              {/* Below Results Ad */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-neutral-900">Below Results / Interactive Output Ad Slot</div>
                  <div className="text-[11px] text-neutral-400">Positioned immediately after tool results computation</div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="belowResultsAdActive"
                    checked={formData.belowResultsAdActive}
                    onChange={handleChange}
                    className="rounded text-neutral-900 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-neutral-700">{formData.belowResultsAdActive ? 'Active' : 'Hidden'}</span>
                </label>
              </div>

              {/* Footer Ad */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-neutral-900">Footer Banner Ad Slot</div>
                  <div className="text-[11px] text-neutral-400">Bottom horizontal billboard slot</div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="footerAdActive"
                    checked={formData.footerAdActive}
                    onChange={handleChange}
                    className="rounded text-neutral-900 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-neutral-700">{formData.footerAdActive ? 'Active' : 'Hidden'}</span>
                </label>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings || loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {savingSettings ? 'Saving...' : 'Save Website Settings'}
              </button>
            </div>
          </div>
        </form>

        {/* Change Admin Password Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-neutral-700" />
            Security &amp; Change Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  placeholder="Min 8 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  placeholder="Re-type new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
