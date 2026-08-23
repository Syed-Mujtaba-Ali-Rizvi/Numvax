'use client';

import React, { useState } from 'react';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  const breadcrumbs = [
    { name: 'Home', url: 'https://numvax.com' },
    { name: 'Contact', url: 'https://numvax.com/contact' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
          Contact Us
        </h1>
        <p className="text-sm text-neutral-600">
          Have feedback, a feature request, or an inquiry? Reach out to the Numvax team.
        </p>
      </div>

      <Card>
        {status === 'success' ? (
          <div className="p-8 text-center flex flex-col items-center gap-3">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
            <h2 className="text-xl font-bold text-neutral-900">Message Sent!</h2>
            <p className="text-sm text-neutral-600 max-w-md">
              Thank you for contacting Numvax. Your message has been delivered to our inbox and we will get back to you soon.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setStatus('idle');
                setName('');
                setEmail('');
                setSubject('');
                setMessage('');
              }}
              className="mt-2"
            >
              Send Another Message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Your Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400"
              />
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" className="mt-2" disabled={status === 'sending'}>
              {status === 'sending' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" /> Send Message
                </>
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
