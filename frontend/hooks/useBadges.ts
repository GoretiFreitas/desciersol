'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export interface Badge {
  mintAddress: string;
  name: string;
  symbol: string;
  uri: string;
  metadata: any;
  badgeLevel: number;
  reviewCount: number;
  issuedAt: number;
  isSoulBound: boolean;
  collection: string | null;
}

export interface BadgeStats {
  wallet: string;
  badges: Badge[];
  count: number;
  highestLevel: number;
}

export function useBadges() {
  const { publicKey } = useWallet();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BadgeStats | null>(null);

  const fetchBadges = async (walletAddress?: string) => {
    if (!walletAddress && !publicKey) {
      setBadges([]);
      setStats(null);
      return;
    }

    const address = walletAddress || publicKey?.toString();
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🏆 Fetching badges for wallet:', address);

      const response = await fetch(`/api/badge/${address}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // No badges found
          setBadges([]);
          setStats({
            wallet: address,
            badges: [],
            count: 0,
            highestLevel: 0,
          });
          return;
        }
        throw new Error(`Failed to fetch badges: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Badges fetched:', data);

      setBadges(data.badges || []);
      setStats(data);

    } catch (err) {
      console.error('❌ Error fetching badges:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch badges');
      setBadges([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshBadges = () => {
    if (publicKey) {
      fetchBadges();
    }
  };

  // Auto-fetch when wallet connects
  useEffect(() => {
    if (publicKey) {
      fetchBadges();
    } else {
      setBadges([]);
      setStats(null);
    }
  }, [publicKey]);

  return {
    badges,
    stats,
    loading,
    error,
    fetchBadges,
    refreshBadges,
  };
}
