'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoyaltyEvent {
  id: string;
  paperTitle: string;
  paperMint: string;
  amount: number;
  type: 'citation' | 'license' | 'reuse';
  from: string;
  timestamp: number;
}

export function RoyaltyDashboard() {
  const { publicKey, connected } = useWallet();
  const [royalties, setRoyalties] = useState<RoyaltyEvent[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    if (connected && publicKey) {
      // Simulate some royalty events for demonstration
      setRoyalties([
        {
          id: '1',
          paperTitle: 'Dressed_for Attention',
          paperMint: 'nkJbwgGuyhmgeuwgo4rq55y7hEsi5SnjdeiWmmvs8mg',
          amount: 0.005,
          type: 'citation',
          from: '5f4F...Wogd',
          timestamp: Date.now() - 86400000,
        },
        {
          id: '2',
          paperTitle: 'Dressed_for Attention',
          paperMint: 'nkJbwgGuyhmgeuwgo4rq55y7hEsi5SnjdeiWmmvs8mg',
          amount: 0.05,
          type: 'license',
          from: '9WzD...tAWWM',
          timestamp: Date.now() - 172800000,
        },
      ]);
      setTotalEarned(0.055);
    }
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Connect your wallet to view your royalties</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-descier-4 dark:border-descier-3">
      <CardHeader>
        <CardTitle>Royalties Received</CardTitle>
        <CardDescription>
          Earn automatically when your work is cited, licensed, or reused
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Earned */}
        <div className="p-6 bg-descier-1/20 dark:bg-descier-4/10 rounded-lg border border-descier-2">
          <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">Total Royalties Earned</div>
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-1">
            {totalEarned.toFixed(4)} SOL
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            ≈ ${(totalEarned * 150).toFixed(2)} USD (estimated)
          </p>
        </div>

        {/* Recent Royalty Events */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Recent Events
          </h3>
          
          {royalties.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No royalties received yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Publish papers to start earning royalties
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {royalties.map((event) => (
                <div
                  key={event.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-descier-3" />
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {event.paperTitle}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <Badge variant="secondary" className="text-xs">
                          {event.type === 'citation' ? 'Citation' : event.type === 'license' ? 'License' : 'Reuse'}
                        </Badge>
                        <span>from {event.from}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(event.timestamp).toLocaleDateString('en-US')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-descier-2">
                        +{event.amount} SOL
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 bg-descier-2/10 dark:bg-descier-3/10 rounded-lg border border-descier-2">
          <h4 className="text-sm font-semibold text-descier-4 dark:text-descier-1 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            About Royalties
          </h4>
          <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
            <li>• 5% royalty on all transactions of your paper</li>
            <li>• Automatic splits when cited by other papers</li>
            <li>• Royalties distributed instantly on-chain</li>
            <li>• Permanent tracking via Solana blockchain</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
