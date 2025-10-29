/**
 * Types for Review System and SBT Badges
 */

export type ReviewRecommendation = 'accept' | 'minor-revision' | 'major-revision' | 'reject';

export interface Review {
  id: string;
  paperId: string; // NFT address do paper
  paperTitle: string;
  reviewerWallet: string;
  rating: number; // 1-5
  comment: string;
  strengths?: string;
  weaknesses?: string;
  recommendation: ReviewRecommendation;
  timestamp: number;
  signature?: string;
}

export interface ReviewerStats {
  wallet: string;
  totalReviews: number;
  badgeLevel: number; // 0-5 (0 = no badge)
  badgeMintAddress?: string;
  specialties: string[];
  joinedAt: number;
  lastReviewAt?: number;
}

export interface BadgeLevel {
  level: number;
  name: string;
  minReviews: number;
  maxReviews: number;
  color: string;
  icon: string;
}

export const BADGE_LEVELS: BadgeLevel[] = [
  { level: 0, name: 'No Badge', minReviews: 0, maxReviews: 0, color: 'gray', icon: '⭕' },
  { level: 1, name: 'Novice Reviewer', minReviews: 1, maxReviews: 5, color: 'blue', icon: '🥉' },
  { level: 2, name: 'Contributor', minReviews: 6, maxReviews: 15, color: 'green', icon: '🥈' },
  { level: 3, name: 'Expert Reviewer', minReviews: 16, maxReviews: 30, color: 'purple', icon: '🥇' },
  { level: 4, name: 'Master Reviewer', minReviews: 31, maxReviews: 50, color: 'orange', icon: '⭐' },
  { level: 5, name: 'Legend', minReviews: 51, maxReviews: Infinity, color: 'red', icon: '👑' },
];

export interface ReviewsData {
  reviews: Review[];
  reviewerStats: Record<string, ReviewerStats>;
}

// On-chain Review Types
export interface OnChainReview {
  id: string;
  reviewerWallet: string;
  rating: number;
  comment: string;
  recommendation: ReviewRecommendation;
  timestamp: number;
  signature?: string;
}

export interface OnChainReviewAttribute {
  trait_type: 'Review';
  value: OnChainReview;
}

export interface BadgeMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    category: 'badge';
    badgeLevel: number;
    reviewerWallet: string;
    reviewCount: number;
    issuedAt: number;
  };
}

