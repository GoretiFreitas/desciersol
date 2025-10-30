'use client';

import React from 'react';
import { Badge, Award, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as UIBadge } from '@/components/ui/badge';
import { useBadges, Badge as BadgeType } from '@/hooks/useBadges';
import { EXPLORER_URL } from '@/lib/constants';
import { Skeleton } from '@/components/ui/skeleton';

interface BadgeCollectionProps {
  walletAddress?: string;
  showTitle?: boolean;
  compact?: boolean;
}

export function BadgeCollection({ 
  walletAddress, 
  showTitle = true, 
  compact = false 
}: BadgeCollectionProps) {
  const { badges, stats, loading, error, refreshBadges } = useBadges();

  // Fetch badges for specific wallet if provided
  React.useEffect(() => {
    if (walletAddress) {
      refreshBadges();
    }
  }, [walletAddress]);

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && <Skeleton className="h-8 w-48" />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <Award className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">Error loading badges</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
        <Button onClick={refreshBadges} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">
          <Award className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">No badges found</p>
          <p className="text-xs">Submit reviews to earn badges!</p>
        </div>
        <Button onClick={refreshBadges} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const BadgeCard = ({ badge }: { badge: BadgeType }) => (
    <Card className="relative overflow-hidden border-descier-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-descier-4 dark:text-descier-2" />
          <CardTitle className="text-lg text-slate-900 dark:text-white">{badge.name}</CardTitle>
        </div>
        <UIBadge className="text-xs bg-descier-3 text-white dark:bg-descier-4">
          Level {badge.badgeLevel}
        </UIBadge>
      </div>
      <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
        {badge.metadata?.description || 'Reviewer badge'}
      </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Reviews:</span>
            <span className="font-medium text-slate-900 dark:text-white">{badge.reviewCount}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-300">Issued:</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {new Date(badge.issuedAt).toLocaleDateString('en-US')}
            </span>
          </div>

          <div className="space-y-1">
            {badge.isSoulBound && (
              <div className="flex items-center gap-2 text-xs text-descier-4 dark:text-descier-2">
                <Badge className="h-3 w-3" />
                <span>Soul-Bound Token</span>
              </div>
            )}
            {badge.collection && (
              <div className="flex items-center gap-2 text-xs text-descier-3 dark:text-descier-1">
                <div className="h-2 w-2 rounded-full bg-descier-3 dark:bg-descier-1" />
                <span>Verified by Descier</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-descier-3 text-slate-900 dark:text-white hover:bg-descier-2/10 dark:hover:bg-descier-2/20"
              onClick={() => window.open(`${EXPLORER_URL}/address/${badge.mintAddress}?cluster=devnet`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Badges On-Chain</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {stats?.count || 0} badge(s) • Highest level: {stats?.highestLevel || 0}
            </p>
          </div>
          <Button onClick={refreshBadges} variant="outline" size="sm" className="border-descier-3 text-slate-900 dark:text-white hover:bg-descier-2/10">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {compact ? (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <UIBadge key={badge.mintAddress} className="text-xs bg-descier-3 text-white dark:bg-descier-4">
              <Award className="h-3 w-3 mr-1" />
              Level {badge.badgeLevel}
            </UIBadge>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <BadgeCard key={badge.mintAddress} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
}
