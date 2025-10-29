'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReviewForm } from '@/components/research/ReviewForm';
import { ReviewCard } from '@/components/research/ReviewCard';
import { useReviews } from '@/hooks/useReviews';
import { 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  Calendar, 
  Users, 
  Star,
  Loader2,
  AlertCircle 
} from 'lucide-react';

interface NFTMetadata {
  name: string;
  description?: string;
  image?: string;
  external_url?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export default function PaperDetailPage() {
  const params = useParams();
  const address = params.address as string;
  const [nft, setNft] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { reviews, stats, loading: reviewsLoading, refetch: refetchReviews } = useReviews(address);

  useEffect(() => {
    fetchNFT();
  }, [address]);

  const fetchNFT = async () => {
    try {
      setLoading(true);
      
      // Buscar NFT da collection E da wallet
      const responses = await Promise.all([
        fetch('/api/collection').catch(() => ({ ok: false, json: async () => ({ nfts: [] }) })),
        fetch('/api/nfts-by-owner?owner=5f4FHMha4CXEv3JQ4oi4aG19xdx2Wt2m2BpKwRbwWogd').catch(() => ({ ok: false, json: async () => ({ nfts: [] }) })),
      ]);

      const [collectionRes, ownerRes] = responses;
      
      const collectionData = collectionRes.ok ? await collectionRes.json() : { nfts: [] };
      const ownerData = ownerRes.ok ? await ownerRes.json() : { nfts: [] };

      // Combinar NFTs de ambas as fontes
      const allNfts = [...(collectionData.nfts || []), ...(ownerData.nfts || [])];
      const nftData = allNfts.find((n: any) => n.address === address);

      if (!nftData) {
        throw new Error('Paper não encontrado');
      }

      setNft(nftData.json || { name: nftData.name });
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load paper');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-brand-violet mb-4" />
          <p className="text-muted-foreground">Loading paper details...</p>
        </div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <h4 className="font-semibold">Error Loading Paper</h4>
                <p className="text-sm mt-1">{error || 'Paper not found'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const attributes = nft.attributes || [];
  const authors = attributes.find((a) => a.trait_type === 'Authors')?.value || 'Unknown';
  const version = attributes.find((a) => a.trait_type === 'Version')?.value;
  const license = attributes.find((a) => a.trait_type === 'License')?.value;
  const doi = attributes.find((a) => a.trait_type === 'DOI')?.value;
  const tags = attributes.find((a) => a.trait_type === 'Tags')?.value?.split(',') || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Back Button */}
        <Link href="/research/browse">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>
        </Link>

        {/* Paper Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <CardTitle className="text-3xl">{nft.name}</CardTitle>
                
                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{authors}</span>
                  </div>
                  {version && (
                    <Badge variant="secondary">v{version}</Badge>
                  )}
                  {license && (
                    <Badge variant="outline">{license}</Badge>
                  )}
                </div>

                {/* Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Description */}
                {nft.description && (
                  <CardDescription className="text-base">
                    {nft.description}
                  </CardDescription>
                )}
              </div>

              {/* Cover Image */}
              {nft.image && (
                <div className="flex-shrink-0">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-48 h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {nft.external_url && (
                <Link href={nft.external_url} target="_blank" rel="noopener noreferrer">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Read PDF
                  </Button>
                </Link>
              )}
              <Link
                href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Explorer
                </Button>
              </Link>
              {doi && (
                <Link
                  href={`https://doi.org/${doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    DOI: {doi}
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Peer Reviews</h2>
              {stats && (
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{stats.count} review{stats.count !== 1 ? 's' : ''}</span>
                  {stats.count > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{stats.avgRating.toFixed(1)} average</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant={showReviewForm ? 'outline' : 'default'}
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </Button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <ReviewForm
              paperId={address}
              paperTitle={nft.name}
              onSuccess={() => {
                setShowReviewForm(false);
                refetchReviews();
              }}
            />
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-brand-violet" />
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this paper!
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  reviewerLevel={0} // TODO: Fetch from stats
                  reviewerReviewCount={0} // TODO: Fetch from stats
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

