'use client';

import { useState, useEffect } from 'react';

interface DebugInfo {
  url: string;
  userAgent: string;
}

export function ClientDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);

  useEffect(() => {
    // Só executa no cliente
    setDebugInfo({
      url: window.location.href,
      userAgent: window.navigator.userAgent,
    });
  }, []);

  if (!debugInfo) {
    return (
      <>
        <div>URL: Loading...</div>
        <div>User Agent: Loading...</div>
      </>
    );
  }

  return (
    <>
      <div>URL: {debugInfo.url}</div>
      <div>User Agent: {debugInfo.userAgent}</div>
    </>
  );
}
