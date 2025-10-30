'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BadgeDisplay } from '@/components/badges/BadgeDisplay';
import { BadgeCollection } from '@/components/badges/BadgeCollection';
import { ClaimRewards } from '@/components/treasury/ClaimRewards';
import { RoyaltyDashboard } from '@/components/treasury/RoyaltyDashboard';
import { useReviewerBadge } from '@/hooks/useReviewerBadge';
import { useBadges } from '@/hooks/useBadges';
import { BADGE_LEVELS } from '@/lib/review-types';
import { 
  Award, 
  MessageSquare, 
  TrendingUp, 
  Trophy, 
  Loader2,
  AlertCircle,
  Star,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ReviewerDashboard() {
  const { publicKey } = useWallet();
  const { stats, loading, error, claiming, claimBadge } = useReviewerBadge(
    publicKey?.toString() || null
  );
  
  const { badges, stats: badgeStats, loading: badgesLoading } = useBadges();

  const handleClaimBadge = async () => {
    try {
      const result = await claimBadge();
      alert(`${result.message}`);
    } catch (err) {
      alert(`Error claiming badge: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-16">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to view your reviewer dashboard
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-descier-3 mb-4" />
          <p className="text-muted-foreground">Loading reviewer stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <h4 className="font-semibold">Error Loading Stats</h4>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentBadge = BADGE_LEVELS.find(b => b.level === stats?.currentLevel) || BADGE_LEVELS[0];
  const nextBadge = BADGE_LEVELS.find(b => b.level === (stats?.currentLevel || 0) + 1);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Reviewer Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your contributions and earn reviewer badges
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Total Reviews */}
          <Card className="border-descier-2">
            <CardHeader>
              <CardDescription className="text-slate-600 dark:text-slate-300">Total Reviews</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2 text-slate-900 dark:text-white">
                <MessageSquare className="h-8 w-8 text-descier-4 dark:text-descier-2" />
                {stats?.stats.totalReviews || 0}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Current Badge */}
          <Card className="border-descier-2">
            <CardHeader>
              <CardDescription className="text-slate-600 dark:text-slate-300">Current Badge</CardDescription>
              <CardTitle className="text-2xl">
                {stats && stats.currentLevel > 0 ? (
                  <BadgeDisplay 
                    level={stats.currentLevel} 
                    reviewCount={stats.stats.totalReviews}
                    size="md"
                  />
                ) : (
                  <span className="text-slate-600 dark:text-slate-300">No Badge Yet</span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Progress to Next */}
          <Card className="border-descier-2">
            <CardHeader>
              <CardDescription className="text-slate-600 dark:text-slate-300">Next Badge</CardDescription>
              {nextBadge ? (
                <>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">
                    {nextBadge.icon} {nextBadge.name}
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                    {stats?.reviewsUntilNextLevel || 0} more review{stats?.reviewsUntilNextLevel !== 1 ? 's' : ''}
                  </p>
                </>
              ) : (
                <CardTitle className="text-xl text-slate-600 dark:text-slate-300">
                  Max Level Achieved!
                </CardTitle>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Badge Claim */}
        {stats?.canClaimBadge && (
          <Card className="border-descier-2 bg-descier-1/10 dark:bg-descier-4/10">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-descier-4 dark:text-descier-2 flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    New Badge Available!
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-300">
                    You've earned a new reviewer badge!
                  </CardDescription>
                </div>
                <Button
                  onClick={handleClaimBadge}
                  disabled={claiming}
                  className="bg-descier-3 hover:bg-descier-4"
                >
                  {claiming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Award className="mr-2 h-4 w-4" />
                      Claim Badge
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Badge Progression */}
        <Card className="border-descier-2">
          <CardHeader>
            <CardTitle>Badge Progression</CardTitle>
            <CardDescription>Complete more reviews to unlock higher badges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {BADGE_LEVELS.filter(b => b.level > 0).map((badge) => {
                const isUnlocked = (stats?.currentLevel || 0) >= badge.level;
                const isCurrent = stats?.currentLevel === badge.level;
                const isNext = stats?.currentLevel === badge.level - 1;

                return (
                  <div
                    key={badge.level}
                    className={`p-4 rounded-lg border-2 ${
                      isUnlocked
                        ? 'border-descier-2 bg-descier-1/10 dark:bg-descier-4/5'
                        : isNext
                        ? 'border-descier-3 bg-descier-2/10 dark:bg-descier-3/5'
                        : 'border-gray-200 dark:border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{badge.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg">{badge.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {badge.minReviews === badge.maxReviews 
                              ? `${badge.minReviews} reviews`
                              : `${badge.minReviews}${badge.maxReviews === Infinity ? '+' : `-${badge.maxReviews}`} reviews`
                            }
                          </p>
                        </div>
                      </div>
                      <div>
                        {isUnlocked && (
                          <Badge className="bg-descier-2 text-white dark:bg-descier-3">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Unlocked
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge className="bg-descier-3 text-white dark:bg-descier-4">
                            Current
                          </Badge>
                        )}
                        {isNext && (
                          <Badge className="bg-descier-1 text-descier-4 dark:bg-descier-2">
                            Next Goal
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* On-Chain Badges */}
        <Card className="border-descier-2">
          <CardHeader>
            <CardTitle>Badges On-Chain</CardTitle>
            <CardDescription>
              Your SBT (Soul-Bound Token) badges minted on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BadgeCollection walletAddress={publicKey?.toString()} />
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        <Card className="border-descier-2">
          <CardHeader>
            <CardTitle>Your Recent Reviews</CardTitle>
            <CardDescription>
              Last {stats?.reviews.length || 0} review{stats?.reviews.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats && stats.reviews.length > 0 ? (
              <div className="space-y-4">
                {stats.reviews.slice(0, 5).map((review) => (
                  <div
                    key={review.id}
                    className="p-4 border border-descier-2 rounded-lg hover:bg-descier-1/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link href={`/research/paper/${review.paperId}`}>
                          <h4 className="font-semibold hover:text-descier-3 transition-colors cursor-pointer">
                            {review.paperTitle}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {review.recommendation}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {review.comment}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(review.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven't made any reviews yet
                </p>
                <Link href="/research/browse">
                  <Button className="bg-descier-3 hover:bg-descier-4">
                    Browse Papers to Review
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Economic Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Rewards */}
          <ClaimRewards />

          {/* Royalties */}
          <RoyaltyDashboard />
        </div>
      </div>
    </div>
  );
}
