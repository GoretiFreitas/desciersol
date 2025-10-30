'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { StakeLSTForm } from '@/components/treasury/StakeLSTForm';
import { StakeStatus } from '@/components/treasury/StakeStatus';
import { ClaimRewards } from '@/components/treasury/ClaimRewards';
import { RoyaltyDashboard } from '@/components/treasury/RoyaltyDashboard';
import { CitePaper } from '@/components/treasury/CitePaper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Gift, DollarSign, Quote } from 'lucide-react';

export default function TreasuryPage() {
  const { connected } = useWallet();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white md:text-5xl">
            Platform Economics
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Stake SOL, earn rewards, and receive automated royalties
          </p>
        </div>

        {/* Connection Status */}
        {!connected && (
          <Card className="border-descier-3 bg-descier-1/20 dark:bg-descier-4/10">
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <p className="text-descier-3 dark:text-descier-2 font-semibold">
                  Connect your wallet to access economic features
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Economic Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stake Status & Staking */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-descier-3 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Stake SOL</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Stake to become eligible for reviewing
                </p>
              </div>
            </div>
            <StakeStatus />
            <StakeLSTForm />
          </div>

          {/* Rewards */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-descier-2 flex items-center justify-center">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rewards</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Earn SOL for quality reviews
                </p>
              </div>
            </div>
            <ClaimRewards />
          </div>

          {/* Royalties */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-descier-4 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Royalties</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Earn when your work is cited
                </p>
              </div>
            </div>
            <RoyaltyDashboard />
          </div>

          {/* Citations */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-descier-1 flex items-center justify-center">
                <Quote className="h-5 w-5 text-descier-4" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Citations</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Cite papers and activate royalty splits
                </p>
              </div>
            </div>
            <CitePaper />
          </div>
        </div>

        {/* Info Section */}
        <Card className="border-descier-2 dark:border-descier-4">
          <CardHeader>
            <CardTitle>How the Economic Flow Works</CardTitle>
            <CardDescription>
              Decentralized incentive system for peer review and research
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  For Reviewers
                </h3>
                <ul className="text-sm text-slate-700 dark:text-slate-200 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-descier-3 dark:text-descier-2">•</span>
                    Stake SOL to become eligible for reviewing
                  </li>
                  <li className="flex gap-2">
                    <span className="text-descier-3 dark:text-descier-2">•</span>
                    Earn rewards for approved reviews
                  </li>
                  <li className="flex gap-2">
                    <span className="text-descier-3 dark:text-descier-2">•</span>
                    Build reputation with SBT badges
                  </li>
                  <li className="flex gap-2">
                    <span className="text-descier-3 dark:text-descier-2">•</span>
                    Unstake at any time
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  For Authors
                </h3>
                <ul className="text-sm text-slate-700 dark:text-slate-200 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-descier-2 dark:text-descier-1">•</span>
                    5% royalty on all transactions
                  </li>
                  <li className="flex gap-2">
                    <span className="text-descier-2 dark:text-descier-1">•</span>
                    Earn when your paper is cited
                  </li>
                  <li className="flex gap-2">
                    <span className="text-descier-2 dark:text-descier-1">•</span>
                    Automatic splits via Metaplex
                  </li>
                  <li className="flex gap-2">
                    <span className="text-descier-2 dark:text-descier-1">•</span>
                    Permanent on-chain tracking
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

