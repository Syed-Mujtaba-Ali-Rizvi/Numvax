'use client';

import React, { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { ShieldAlert } from 'lucide-react';

export const JwtDecoder: React.FC = () => {
  const [jwt, setJwt] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  const [header, setHeader] = useState<string>('');
  const [payload, setPayload] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const decodeJwt = () => {
    setError(null);
    setHeader('');
    setPayload('');

    if (!jwt.trim()) return;

    const parts = jwt.split('.');
    if (parts.length !== 3) {
      setError('Invalid JWT structure. A valid JWT contains 3 dot-separated parts.');
      return;
    }

    try {
      const decHeader = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const decPayload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      setHeader(JSON.stringify(decHeader, null, 2));
      setPayload(JSON.stringify(decPayload, null, 2));
    } catch {
      setError('Failed to parse JWT payload. Base64URL string may be corrupt.');
    }
  };

  React.useEffect(() => {
    decodeJwt();
  }, []);

  return (
    <Card>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-500">JWT Token Decoder</span>
          <Button variant="primary" size="sm" onClick={decodeJwt}>
            Decode JWT
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-neutral-700">Encoded JWT Token:</label>
          <textarea
            value={jwt}
            onChange={(e) => setJwt(e.target.value)}
            rows={4}
            placeholder="Paste JWT token here..."
            className="w-full p-3 bg-neutral-900 text-emerald-400 font-mono text-xs rounded-xl border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 leading-relaxed"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-700">Decoded Header:</label>
            <pre className="p-4 bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl border border-neutral-800 min-h-40 overflow-x-auto">
              {header || '// Header payload will render here'}
            </pre>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-700">Decoded Payload Claims:</label>
            <pre className="p-4 bg-neutral-900 text-neutral-100 font-mono text-xs rounded-xl border border-neutral-800 min-h-40 overflow-x-auto">
              {payload || '// Claims payload will render here'}
            </pre>
          </div>
        </div>
        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-[11px] text-neutral-600 leading-relaxed">
          <strong>Note:</strong> Decoding a JWT parses and displays the header and payload claims. It does not verify the token&apos;s cryptographic signature.
        </div>
      </div>
    </Card>
  );
};
