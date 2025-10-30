'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, TrendingDown, Loader2, Shield, ExternalLink } from 'lucide-react';
import { EXPLORER_URL } from '@/lib/constants';

interface StakeInfo {
  reviewer: string;
  lstMint: string;
  amount: number;
  stakedAt: number;
  status: string;
}

export function StakeStatus() {
  const { publicKey, connected } = useWallet();
  const [stake, setStake] = useState<StakeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [unstaking, setUnstaking] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchStake();
    }
  }, [connected, publicKey]);

  const fetchStake = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/treasury/stake?wallet=${publicKey.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.hasStake) {
          setStake(data.stake);
          console.log('Stake found:', data.stake);
        } else {
          setStake(null);
        }
      }
    } catch (err) {
      console.error('Error fetching stake:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!publicKey || !stake) return;

    if (!confirm('Are you sure you want to unstake? You will not be able to review papers until you stake again.')) {
      return;
    }

    try {
      setUnstaking(true);

      const response = await fetch('/api/treasury/unstake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerWallet: publicKey.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unstake');
      }

      const result = await response.json();
      console.log('Unstake successful:', result);

      // Refresh stake status
      await fetchStake();

    } catch (err) {
      console.error('Unstake error:', err);
      alert('Error unstaking: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setUnstaking(false);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Connect your wallet to view your stake</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-descier-3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stake) {
    return (
      <Card className="border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle>Stake Status</CardTitle>
          <CardDescription>You have not staked yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Stake SOL to become a validated reviewer
            </p>
            <Button variant="outline" onClick={fetchStake}>
              Check Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-descier-2 bg-descier-1/10 dark:bg-descier-4/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-descier-3" />
              Stake Status
            </CardTitle>
            <CardDescription>You are a validated reviewer</CardDescription>
          </div>
          <Badge className="bg-descier-2 text-white dark:bg-descier-3 border-descier-3">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active Validator
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stake Amount */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-descier-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">Staked Amount</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {stake.amount} {stake.lstMint === 'SOL' ? 'SOL' : 'LST'}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Since {new Date(stake.stakedAt).toLocaleDateString('en-US')}
          </div>
        </div>

        {/* Benefits */}
        <div className="p-3 bg-descier-1/10 dark:bg-descier-4/10 rounded-lg border border-descier-2">
          <h4 className="text-xs font-semibold text-descier-4 dark:text-descier-1 mb-2">
            Active Benefits
          </h4>
          <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
            <li>• Can submit unlimited reviews</li>
            <li>• Earn 0.01 SOL per approved review</li>
            <li>• Build reputation with SBT badges</li>
            <li>• Participate in platform governance</li>
          </ul>
        </div>

        {/* Unstake Button */}
        <Button
          onClick={handleUnstake}
          disabled={unstaking}
          variant="outline"
          className="w-full border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20"
        >
          {unstaking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Unstake...
            </>
          ) : (
            <>
              <TrendingDown className="mr-2 h-4 w-4" />
              Unstake
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
