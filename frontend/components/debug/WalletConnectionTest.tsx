'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WalletConnectionTest() {
  const { connected, connecting, publicKey, wallet, select, wallets } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Wallet Connection...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection Test</CardTitle>
          <CardDescription>Test your wallet connection step by step</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="space-y-2">
            <h3 className="font-semibold">Connection Status</h3>
            <div className="flex gap-2">
              <Badge variant={connected ? "default" : "secondary"}>
                {connected ? '✅ Connected' : '⚪ Disconnected'}
              </Badge>
              <Badge variant={connecting ? "default" : "secondary"}>
                {connecting ? '🔄 Connecting...' : '⚪ Idle'}
              </Badge>
            </div>
          </div>

          {/* Public Key */}
          {publicKey && (
            <div className="space-y-2">
              <h3 className="font-semibold">Wallet Address</h3>
              <code className="block p-2 bg-muted rounded text-sm break-all">
                {publicKey.toString()}
              </code>
            </div>
          )}

          {/* Current Wallet */}
          <div className="space-y-2">
            <h3 className="font-semibold">Current Wallet</h3>
            <p className="text-sm">
              {wallet?.adapter.name || 'None selected'}
            </p>
          </div>

          {/* Available Wallets */}
          <div className="space-y-2">
            <h3 className="font-semibold">Available Wallets ({wallets.length})</h3>
            <div className="space-y-2">
              {wallets.map((w) => (
                <div key={w.adapter.name} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {w.adapter.icon && (
                      <img src={w.adapter.icon} alt={w.adapter.name} className="w-6 h-6" />
                    )}
                    <span className="text-sm">{w.adapter.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={w.readyState === 'Installed' ? 'default' : 'secondary'}>
                      {w.readyState}
                    </Badge>
                    {w.readyState === 'Installed' && (
                      <button
                        onClick={() => select(w.adapter.name)}
                        className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Button */}
          <div className="space-y-2">
            <h3 className="font-semibold">Standard Connection</h3>
            <WalletMultiButton className="!bg-primary !text-primary-foreground" />
          </div>

          {/* Troubleshooting */}
          <div className="space-y-2 mt-6 p-4 bg-muted rounded">
            <h3 className="font-semibold">Troubleshooting</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Make sure Phantom or Solflare is installed</li>
              <li>Wallet should be on <strong>Devnet</strong></li>
              <li>Try refreshing the page (Cmd+R)</li>
              <li>Check browser console for errors (F12)</li>
              <li>Try clicking "Select" on an installed wallet above</li>
            </ul>
          </div>

          {/* Network Info */}
          <div className="space-y-2 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
            <h3 className="font-semibold">Network Configuration</h3>
            <div className="text-sm space-y-1">
              <p><strong>Network:</strong> {process.env.NEXT_PUBLIC_NETWORK || 'devnet'}</p>
              <p><strong>RPC:</strong> {process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

