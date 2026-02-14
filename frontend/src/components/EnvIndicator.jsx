import React from 'react';

/**
 * Shows a small "Local" / "Testing" badge only when running on localhost.
 * Hidden when the site is live (e.g. on Vercel) so users don't see it.
 * Use when testing locally while the production site is also live.
 */
const EnvIndicator = () => {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (!isLocal) return null;

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const isUsingLiveApi = apiUrl && !apiUrl.includes('localhost');

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-1 text-right"
      title="Only visible when running on localhost. Not shown on production."
    >
      <span className="inline-block rounded bg-amber-500 px-2 py-1 text-xs font-medium text-white shadow">
        Local
      </span>
      {isUsingLiveApi && (
        <span className="inline-block rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white shadow">
          Live API
        </span>
      )}
    </div>
  );
};

export default EnvIndicator;
