'use client';

import { Review } from '@/lib/review-types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BadgeDisplay } from '@/components/badges/BadgeDisplay';
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  reviewerLevel?: number;
  reviewerReviewCount?: number;
}

export function ReviewCard({ review, reviewerLevel = 0, reviewerReviewCount = 0 }: ReviewCardProps) {
  const recommendationConfig = {
    accept: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle, label: 'Accept' },
    'minor-revision': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: ThumbsUp, label: 'Minor Revision' },
    'major-revision': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: AlertTriangle, label: 'Major Revision' },
    reject: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: ThumbsDown, label: 'Reject' },
  };

  const config = recommendationConfig[review.recommendation];
  const RecommendationIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-900 dark:text-slate-100">
                {review.reviewerWallet.slice(0, 4)}...{review.reviewerWallet.slice(-4)}
              </code>
              <BadgeDisplay 
                level={reviewerLevel} 
                reviewCount={reviewerReviewCount}
                size="sm"
                showDetails={false}
              />
            </div>
            <div className="flex items-center gap-3">
              {/* Rating Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              {/* Recommendation */}
              <Badge className={`${config.color} border-0 font-semibold`}>
                <RecommendationIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300">
            {new Date(review.timestamp).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment */}
        <div>
          <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
            {review.comment}
          </p>
        </div>

        {/* Strengths & Weaknesses */}
        {(review.strengths || review.weaknesses) && (
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
            {review.strengths && (
              <div>
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                  💪 Strengths
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {review.strengths}
                </p>
              </div>
            )}
            {review.weaknesses && (
              <div>
                <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">
                  ⚠️ Weaknesses
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {review.weaknesses}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

