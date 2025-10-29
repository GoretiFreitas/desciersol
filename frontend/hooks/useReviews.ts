'use client';

import { useState, useEffect } from 'react';
import { Review, ReviewRecommendation } from '@/lib/review-types';

interface SubmitReviewParams {
  paperId: string;
  paperTitle: string;
  reviewerWallet: string;
  rating: number;
  comment: string;
  strengths?: string;
  weaknesses?: string;
  recommendation: ReviewRecommendation;
}

interface ReviewsResponse {
  reviews: Review[];
  count: number;
  avgRating: number;
  recommendations: {
    accept: number;
    minorRevision: number;
    majorRevision: number;
    reject: number;
  };
}

export function useReviews(paperId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewsResponse | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/review/${paperId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data: ReviewsResponse = await response.json();
      setReviews(data.reviews);
      setStats(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paperId) {
      fetchReviews();
    }
  }, [paperId]);

  const submitReview = async (params: SubmitReviewParams) => {
    try {
      setError(null);

      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit review');
      }

      const result = await response.json();
      
      // Reload reviews
      await fetchReviews();

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    reviews,
    stats,
    loading,
    error,
    submitReview,
    refetch: fetchReviews,
  };
}

