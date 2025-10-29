'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { ReviewRecommendation } from '@/lib/review-types';
import { useUpdateNFTMetadata } from '@/hooks/useUpdateNFTMetadata';
import { useMintBadge } from '@/hooks/useMintBadge';
import { EXPLORER_URL } from '@/lib/constants';

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
  const [step, setStep] = useState<'submit' | 'upload' | 'update' | 'badge' | 'complete'>('submit');
  const [badgeMinted, setBadgeMinted] = useState(false);
  const [nftUpdated, setNftUpdated] = useState(false);

  // Hooks para on-chain operations
  const { updateNFTMetadata, loading: updatingNFT, error: nftError } = useUpdateNFTMetadata();
  const { mintBadge, loading: mintingBadge, error: badgeError } = useMintBadge();

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
    setStep('submit');

    try {
      // Step 1: Submit review to API
      console.log('📝 Submitting review...');
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
          comment: comment.trim(),
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

      // Step 2: Update NFT metadata if on-chain success
      if (result.onChainSuccess && result.newMetadataUri) {
        setStep('update');
        console.log('🔄 Updating NFT metadata...');
        
        const updateResult = await updateNFTMetadata({
          mintAddress: paperId,
          newMetadataUri: result.newMetadataUri,
        });

        if (updateResult.success) {
          setNftUpdated(true);
          console.log('✅ NFT metadata updated:', updateResult.signature);
        } else {
          console.warn('⚠️ Failed to update NFT metadata:', updateResult.error);
        }
      }

      // Step 3: Mint badge if level up
      if (result.shouldMintBadge && result.newBadgeLevel) {
        setStep('badge');
        console.log('🏆 Minting badge for level:', result.newBadgeLevel);
        
        const badgeResult = await mintBadge({
          reviewerWallet: publicKey.toString(),
          badgeLevel: result.newBadgeLevel,
          reviewCount: result.reviewerStats.totalReviews,
        });

        if (badgeResult.success) {
          setBadgeMinted(true);
          console.log('✅ Badge minted:', badgeResult.mintAddress);
        } else {
          console.warn('⚠️ Failed to mint badge:', badgeResult.error);
        }
      }

      setStep('complete');
      setSuccess(true);
      
      // Resetar form
      setRating(0);
      setComment('');
      setStrengths('');
      setWeaknesses('');
      setRecommendation('accept');

      if (onSuccess) {
        onSuccess();
      }

    } catch (err) {
      console.error('❌ Erro ao submeter review:', err);
      setError(err instanceof Error ? err.message : 'Erro ao submeter review');
      setStep('submit');
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

          {/* Progress Steps */}
          {submitting && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-center">Processando Review...</div>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 text-sm ${step === 'submit' ? 'text-blue-600' : step === 'complete' ? 'text-green-600' : 'text-gray-500'}`}>
                  {step === 'submit' ? <Loader2 className="h-4 w-4 animate-spin" /> : step === 'complete' ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full bg-gray-300" />}
                  Submetendo review...
                </div>
                {step === 'update' && (
                  <div className={`flex items-center gap-2 text-sm ${updatingNFT ? 'text-blue-600' : nftUpdated ? 'text-green-600' : 'text-gray-500'}`}>
                    {updatingNFT ? <Loader2 className="h-4 w-4 animate-spin" /> : nftUpdated ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full bg-gray-300" />}
                    Atualizando NFT on-chain...
                  </div>
                )}
                {step === 'badge' && (
                  <div className={`flex items-center gap-2 text-sm ${mintingBadge ? 'text-blue-600' : badgeMinted ? 'text-green-600' : 'text-gray-500'}`}>
                    {mintingBadge ? <Loader2 className="h-4 w-4 animate-spin" /> : badgeMinted ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full bg-gray-300" />}
                    Mintando badge SBT...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    ✅ Review submetida com sucesso!
                  </p>
                  {nftUpdated && (
                    <p className="text-xs text-green-700 dark:text-green-300">
                      📄 NFT atualizado on-chain
                    </p>
                  )}
                  {badgeMinted && (
                    <p className="text-xs text-green-700 dark:text-green-300">
                      🏆 Badge SBT mintado
                    </p>
                  )}
                  <div className="flex gap-2">
                    <a
                      href={`${EXPLORER_URL}/address/${paperId}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Ver NFT no Explorer <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    ❌ {error}
                  </p>
                  {(nftError || badgeError) && (
                    <div className="mt-2 space-y-1">
                      {nftError && (
                        <p className="text-xs text-red-700 dark:text-red-300">
                          NFT Update: {nftError}
                        </p>
                      )}
                      {badgeError && (
                        <p className="text-xs text-red-700 dark:text-red-300">
                          Badge Mint: {badgeError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
                {step === 'submit' && 'Submetendo Review...'}
                {step === 'update' && 'Atualizando NFT...'}
                {step === 'badge' && 'Mintando Badge...'}
                {step === 'complete' && 'Finalizando...'}
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

