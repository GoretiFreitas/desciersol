'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Loader2, CheckCircle, AlertCircle, TrendingUp, ExternalLink } from 'lucide-react';

export function ClaimRewards() {
  const { publicKey, connected } = useWallet();
  const [claiming, setClaiming] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [availableReward, setAvailableReward] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [txSignature, setTxSignature] = useState<string>('');

  useEffect(() => {
    if (connected && publicKey) {
      // Fetch available rewards
      fetchRewards();
    }
  }, [connected, publicKey]);

  const fetchRewards = async () => {
    if (!publicKey) return;

    try {
      const response = await fetch(`/api/treasury/claim?wallet=${publicKey.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setAvailableReward(data.available || 0);
        setTotalEarned(data.totalEarned || 0);
        console.log('Rewards fetched:', data);
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
    }
  };

  const handleClaim = async () => {
    if (!connected || !publicKey) {
      setError('Connect your wallet first');
      return;
    }

    if (availableReward <= 0) {
      setError('No rewards available to claim');
      return;
    }

    try {
      setClaiming(true);
      setError('');
      setSuccess(false);

      console.log('Claiming rewards...');

      const response = await fetch('/api/treasury/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerWallet: publicKey.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim rewards');
      }

      const result = await response.json();
      console.log('Rewards claimed:', result);

      if (result.success) {
        setSuccess(true);
        setAvailableReward(0);
        setTotalEarned(result.totalEarned);
        setTxSignature(result.signature || '');

        setTimeout(() => {
          setSuccess(false);
          setTxSignature('');
          fetchRewards(); // Refresh rewards
        }, 10000);
      } else {
        throw new Error(result.message || 'No rewards available');
      }

    } catch (err) {
      console.error('Claim error:', err);
      setError(err instanceof Error ? err.message : 'Error claiming rewards');
    } finally {
      setClaiming(false);
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Connect your wallet to view your rewards</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-descier-2 dark:border-descier-4">
      <CardHeader>
        <CardTitle>Your Rewards</CardTitle>
        <CardDescription>
          Earn SOL for submitting quality reviews
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-descier-1/20 dark:bg-descier-4/10 rounded-lg border border-descier-2">
            <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">Available</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {availableReward.toFixed(4)} SOL
            </div>
          </div>

          <div className="p-4 bg-descier-2/20 dark:bg-descier-3/10 rounded-lg border border-descier-2">
            <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">Total Earned</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalEarned.toFixed(4)} SOL
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-descier-1/20 dark:bg-descier-4/10 rounded-lg border border-descier-2">
          <h4 className="text-sm font-semibold text-descier-4 dark:text-descier-1 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            How to earn rewards
          </h4>
          <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
            <li>• Submit quality reviews</li>
            <li>• Earn ~0.01 SOL per review</li>
            <li>• Bonus for reviews accepted by the community</li>
            <li>• Claim rewards at any time</li>
          </ul>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                SOL transferred to your wallet on-chain!
              </p>
            </div>
            {txSignature && (
              <a
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View transaction on Explorer
              </a>
            )}
          </div>
        )}

        {/* Claim Button */}
        <Button
          onClick={handleClaim}
          disabled={claiming || availableReward <= 0}
          className="w-full bg-descier-2 hover:bg-descier-3"
          size="lg"
        >
          {claiming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Claim...
            </>
          ) : (
            <>
              <Gift className="mr-2 h-4 w-4" />
              Claim {availableReward.toFixed(4)} SOL
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
