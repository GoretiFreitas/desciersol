'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useStakeSOL } from '@/hooks/useStakeSOL';
import { EXPLORER_URL } from '@/lib/constants';

export function StakeLSTForm() {
  const { publicKey, connected } = useWallet();
  const { stakeSOL, loading: staking } = useStakeSOL();
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [txSignature, setTxSignature] = useState('');

  const handleStake = async () => {
    if (!connected || !publicKey) {
      setError('Connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }

    try {
      setError('');
      setSuccess(false);
      setTxSignature('');

      console.log('Initiating real SOL stake...');
      console.log('   Amount:', amount, 'SOL');

      const result = await stakeSOL({
        amount: parseFloat(amount),
      });

      if (result.success && result.signature) {
        console.log('Stake successful:', result.signature);
        setSuccess(true);
        setTxSignature(result.signature);
        setAmount('');

        setTimeout(() => {
          setSuccess(false);
          setTxSignature('');
        }, 10000);
      } else {
        throw new Error(result.error || 'Failed to stake');
      }

    } catch (err) {
      console.error('Stake error:', err);
      setError(err instanceof Error ? err.message : 'Error staking SOL');
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Connect your wallet to stake SOL</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-descier-2 dark:border-descier-4">
      <CardHeader>
        <CardTitle>Stake SOL to Review</CardTitle>
        <CardDescription>
          Stake SOL to become an eligible reviewer and earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount of SOL</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={staking}
          />
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Recommended minimum: 0.1 SOL
          </p>
        </div>

        {/* Info */}
        <div className="p-4 bg-descier-1/20 dark:bg-descier-4/10 rounded-lg border border-descier-2">
          <h4 className="text-sm font-semibold text-descier-4 dark:text-descier-1 mb-2">
            How it works
          </h4>
          <ul className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
            <li>• Stake SOL to become an eligible reviewer</li>
            <li>• Earn SOL rewards for quality reviews</li>
            <li>• Unstake at any time (no lock period)</li>
            <li>• Your SOL is secured in Descier vault</li>
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
                Stake completed successfully on-chain!
              </p>
            </div>
            {txSignature && (
              <a
                href={`${EXPLORER_URL}/tx/${txSignature}?cluster=devnet`}
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

        {/* Submit Button */}
        <Button
          onClick={handleStake}
          disabled={staking || !amount}
          className="w-full bg-descier-3 hover:bg-descier-4"
        >
          {staking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Stake...
            </>
          ) : (
            <>
              <TrendingUp className="mr-2 h-4 w-4" />
              Stake SOL
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
