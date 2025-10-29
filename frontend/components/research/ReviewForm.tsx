'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ReviewRecommendation } from '@/lib/review-types';

interface ReviewFormProps {
  paperId: string;
  paperTitle: string;
  onSuccess?: () => void;
}

export function ReviewForm({ paperId, paperTitle, onSuccess }: ReviewFormProps) {
  const { publicKey } = useWallet();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [recommendation, setRecommendation] = useState<ReviewRecommendation>('accept');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publicKey) {
      setError('Por favor conecte sua wallet');
      return;
    }

    if (rating === 0) {
      setError('Por favor selecione uma avaliação (estrelas)');
      return;
    }

    if (comment.trim().length < 50) {
      setError('O comentário deve ter pelo menos 50 caracteres');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paperId,
          paperTitle,
          reviewerWallet: publicKey.toString(),
          rating,
          comment,
          strengths: strengths.trim() || undefined,
          weaknesses: weaknesses.trim() || undefined,
          recommendation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao submeter review');
      }

      const result = await response.json();
      console.log('✅ Review submetida:', result);

      setSuccess(true);
      
      // Resetar form
      setRating(0);
      setComment('');
      setStrengths('');
      setWeaknesses('');
      setRecommendation('accept');

      if (result.badgeLevelUp) {
        setTimeout(() => {
          alert(`🎉 Parabéns! Você alcançou o nível ${result.reviewerStats.badgeLevel}! Vá para o Dashboard do Revisor para reivindicar seu badge.`);
        }, 500);
      }

      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error('❌ Erro ao submeter review:', err);
      setError(err instanceof Error ? err.message : 'Erro ao submeter review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!publicKey) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Conecte sua wallet para submeter uma review
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">
              Review Submetida com Sucesso!
            </h3>
            <p className="text-muted-foreground mb-4">
              Obrigado por contribuir para a comunidade científica!
            </p>
            <Button onClick={() => setSuccess(false)} variant="outline">
              Submeter Outra Review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Review</CardTitle>
        <CardDescription>
          Peer review helps maintain quality and credibility in the scientific community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Recommendation */}
          <div className="space-y-2">
            <Label>Recommendation *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'accept' as const, label: 'Accept', color: 'green' },
                { value: 'minor-revision' as const, label: 'Minor Revision', color: 'blue' },
                { value: 'major-revision' as const, label: 'Major Revision', color: 'orange' },
                { value: 'reject' as const, label: 'Reject', color: 'red' },
              ].map((rec) => (
                <button
                  key={rec.value}
                  type="button"
                  onClick={() => setRecommendation(rec.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    recommendation === rec.value
                      ? `border-${rec.color}-500 bg-${rec.color}-50 dark:bg-${rec.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium">{rec.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Review Comment * (min 50 caracteres)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide your detailed review, analysis, and feedback..."
              className="min-h-[150px]"
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length} / 2000 caracteres
              {comment.length > 0 && comment.length < 50 && (
                <span className="text-orange-600 dark:text-orange-400 ml-2">
                  (ainda faltam {50 - comment.length})
                </span>
              )}
            </p>
          </div>

          {/* Strengths (optional) */}
          <div className="space-y-2">
            <Label htmlFor="strengths">Strengths (Opcional)</Label>
            <Textarea
              id="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              placeholder="What are the strong points of this research?"
              className="min-h-[80px]"
              disabled={submitting}
            />
          </div>

          {/* Weaknesses (optional) */}
          <div className="space-y-2">
            <Label htmlFor="weaknesses">Weaknesses (Opcional)</Label>
            <Textarea
              id="weaknesses"
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              placeholder="What could be improved in this research?"
              className="min-h-[80px]"
              disabled={submitting}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                ❌ {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting || rating === 0 || comment.length < 50}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submetendo Review...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

