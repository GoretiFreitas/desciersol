import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ReviewsData, OnChainReview, OnChainReviewAttribute } from '@/lib/review-types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { RPC_ENDPOINT, REVIEW_TRAIT_TYPE } from '@/lib/constants';

const REVIEWS_FILE = path.join(process.cwd(), 'data', 'reviews.json');

async function readReviewsData(): Promise<ReviewsData> {
  try {
    const data = await fs.readFile(REVIEWS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { reviews: [], reviewerStats: {} };
  }
}

async function fetchOnChainReviews(paperId: string): Promise<OnChainReview[]> {
  try {
    const connection = new Connection(RPC_ENDPOINT);
    const metaplex = Metaplex.make(connection);
    const mintAddress = new PublicKey(paperId);
    
    const nft = await metaplex.nfts().findByMint({ mintAddress });
    
    if (!nft.uri) {
      return [];
    }

    // Fetch metadata from URI
    const response = await fetch(nft.uri);
    if (!response.ok) {
      return [];
    }

    const metadata = await response.json();
    
    // Parse reviews from attributes
    const reviewAttributes = (metadata.attributes || []).filter(
      (attr: any) => attr.trait_type === REVIEW_TRAIT_TYPE
    );

    return reviewAttributes.map((attr: OnChainReviewAttribute) => attr.value);
  } catch (error) {
    console.error('Error fetching on-chain reviews:', error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const paperId = params.paperId;

    if (!paperId) {
      return NextResponse.json(
        { error: 'Paper ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar reviews on-chain primeiro
    console.log('🔍 Buscando reviews on-chain para paper:', paperId);
    const onChainReviews = await fetchOnChainReviews(paperId);
    
    let allReviews = onChainReviews;
    let source = 'on-chain';

    // Se não houver reviews on-chain, buscar do arquivo local como fallback
    if (onChainReviews.length === 0) {
      console.log('📄 Nenhuma review on-chain encontrada, buscando do arquivo local...');
      const data = await readReviewsData();
      const localReviews = data.reviews.filter(r => r.paperId === paperId);
      
      // Converter reviews locais para formato on-chain
      allReviews = localReviews.map(review => ({
        id: review.id,
        reviewerWallet: review.reviewerWallet,
        rating: review.rating,
        comment: review.comment,
        recommendation: review.recommendation,
        timestamp: review.timestamp,
      }));
      source = 'local';
    }

    console.log(`📊 Encontradas ${allReviews.length} reviews (fonte: ${source})`);

    // Ordenar por timestamp (mais recente primeiro)
    allReviews.sort((a, b) => b.timestamp - a.timestamp);

    // Calcular estatísticas
    const avgRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

    const recommendations = {
      accept: allReviews.filter(r => r.recommendation === 'accept').length,
      minorRevision: allReviews.filter(r => r.recommendation === 'minor-revision').length,
      majorRevision: allReviews.filter(r => r.recommendation === 'major-revision').length,
      reject: allReviews.filter(r => r.recommendation === 'reject').length,
    };

    return NextResponse.json({
      reviews: allReviews,
      count: allReviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
      recommendations,
      source,
    });

  } catch (error) {
    console.error('❌ Erro ao buscar reviews:', error);
    return NextResponse.json(
      {
        error: 'Falha ao buscar reviews',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

