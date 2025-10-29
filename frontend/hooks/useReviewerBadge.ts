'use client';

import { useState, useEffect } from 'react';
import { ReviewerStats } from '@/lib/review-types';

interface ReviewerStatsResponse {
  stats: ReviewerStats;
  reviews: any[];
  currentLevel: number;
  nextRequirement: number;
  canClaimBadge: boolean;
  reviewsUntilNextLevel: number;
}

export function useReviewerBadge(wallet: string | null) {
  const [stats, setStats] = useState<ReviewerStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const fetchStats = async () => {
    if (!wallet) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reviewer/${wallet}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviewer stats');
      }

      const data: ReviewerStatsResponse = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching reviewer stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet) {
      fetchStats();
    }
  }, [wallet]);

  const claimBadge = async () => {
    if (!wallet) {
      throw new Error('Wallet não conectada');
    }

    try {
      setClaiming(true);
      setError(null);

      const response = await fetch('/api/badge/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewerWallet: wallet }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim badge');
      }

      const result = await response.json();
      
      // Reload stats
      await fetchStats();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to claim badge';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setClaiming(false);
    }
  };

  return {
    stats,
    loading,
    error,
    claiming,
    claimBadge,
    refetch: fetchStats,
  };
}

