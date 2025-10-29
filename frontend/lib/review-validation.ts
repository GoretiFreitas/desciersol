/**
 * Validation utilities for reviews
 */

import { ReviewRecommendation } from './review-types';

export interface ReviewValidation {
  valid: boolean;
  errors: string[];
}

export function validateReview(data: {
  paperId?: string;
  reviewerWallet?: string;
  rating?: number;
  comment?: string;
  recommendation?: string;
}): ReviewValidation {
  const errors: string[] = [];

  // Paper ID
  if (!data.paperId || data.paperId.trim() === '') {
    errors.push('Paper ID é obrigatório');
  }

  // Reviewer wallet
  if (!data.reviewerWallet || data.reviewerWallet.trim() === '') {
    errors.push('Wallet do revisor é obrigatória');
  }

  // Rating
  if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
    errors.push('Rating deve ser entre 1 e 5');
  }

  // Comment
  if (!data.comment || data.comment.trim() === '') {
    errors.push('Comentário é obrigatório');
  } else if (data.comment.trim().length < 50) {
    errors.push('Comentário deve ter pelo menos 50 caracteres');
  } else if (data.comment.length > 2000) {
    errors.push('Comentário não pode ter mais de 2000 caracteres');
  }

  // Recommendation
  const validRecommendations: ReviewRecommendation[] = [
    'accept',
    'minor-revision',
    'major-revision',
    'reject'
  ];
  if (!data.recommendation || !validRecommendations.includes(data.recommendation as ReviewRecommendation)) {
    errors.push('Recomendação inválida');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateBadgeLevel(reviewCount: number): number {
  if (reviewCount === 0) return 0;
  if (reviewCount <= 5) return 1;
  if (reviewCount <= 15) return 2;
  if (reviewCount <= 30) return 3;
  if (reviewCount <= 50) return 4;
  return 5;
}

export function getNextBadgeRequirement(currentLevel: number): number {
  const requirements = [0, 1, 6, 16, 31, 51];
  return requirements[currentLevel + 1] || Infinity;
}

