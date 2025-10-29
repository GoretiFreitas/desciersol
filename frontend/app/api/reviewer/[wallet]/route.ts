import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ReviewsData, ReviewerStats } from '@/lib/review-types';
import { calculateBadgeLevel, getNextBadgeRequirement } from '@/lib/review-validation';

const REVIEWS_FILE = path.join(process.cwd(), 'data', 'reviews.json');

async function readReviewsData(): Promise<ReviewsData> {
  try {
    const data = await fs.readFile(REVIEWS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { reviews: [], reviewerStats: {} };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const wallet = params.wallet;

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address é obrigatório' },
        { status: 400 }
      );
    }

    // Ler dados
    const data = await readReviewsData();
    
    // Buscar stats do reviewer
    let stats = data.reviewerStats[wallet];

    if (!stats) {
      // Criar stats inicial se não existir
      stats = {
        wallet,
        totalReviews: 0,
        badgeLevel: 0,
        specialties: [],
        joinedAt: Date.now(),
      };
    }

    // Buscar reviews do reviewer
    const reviewerReviews = data.reviews.filter(r => r.reviewerWallet === wallet);

    // Calcular badge level atual
    const currentLevel = calculateBadgeLevel(stats.totalReviews);
    const nextRequirement = getNextBadgeRequirement(currentLevel);
    const canClaimBadge = currentLevel > stats.badgeLevel;

    return NextResponse.json({
      stats,
      reviews: reviewerReviews,
      currentLevel,
      nextRequirement,
      canClaimBadge,
      reviewsUntilNextLevel: Math.max(0, nextRequirement - stats.totalReviews),
    });

  } catch (error) {
    console.error('❌ Erro ao buscar stats do reviewer:', error);
    return NextResponse.json(
      {
        error: 'Falha ao buscar stats do reviewer',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

