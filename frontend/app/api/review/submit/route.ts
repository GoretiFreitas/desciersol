import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { validateReview, calculateBadgeLevel } from '@/lib/review-validation';
import { Review, ReviewsData, ReviewerStats } from '@/lib/review-types';

const REVIEWS_FILE = path.join(process.cwd(), 'data', 'reviews.json');

async function readReviewsData(): Promise<ReviewsData> {
  try {
    const data = await fs.readFile(REVIEWS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Se arquivo não existe, retornar estrutura vazia
    return { reviews: [], reviewerStats: {} };
  }
}

async function writeReviewsData(data: ReviewsData): Promise<void> {
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paperId,
      paperTitle,
      reviewerWallet,
      rating,
      comment,
      strengths,
      weaknesses,
      recommendation,
    } = body;

    // Validar inputs
    const validation = validateReview({
      paperId,
      reviewerWallet,
      rating,
      comment,
      recommendation,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    // Ler dados existentes
    const data = await readReviewsData();

    // Verificar se reviewer já revisou este paper
    const existingReview = data.reviews.find(
      r => r.paperId === paperId && r.reviewerWallet === reviewerWallet
    );

    if (existingReview) {
      return NextResponse.json(
        { error: 'Você já revisou este paper' },
        { status: 409 }
      );
    }

    // Criar nova review
    const newReview: Review = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paperId,
      paperTitle,
      reviewerWallet,
      rating,
      comment,
      strengths,
      weaknesses,
      recommendation,
      timestamp: Date.now(),
    };

    // Adicionar review
    data.reviews.push(newReview);

    // Atualizar stats do reviewer
    if (!data.reviewerStats[reviewerWallet]) {
      data.reviewerStats[reviewerWallet] = {
        wallet: reviewerWallet,
        totalReviews: 0,
        badgeLevel: 0,
        specialties: [],
        joinedAt: Date.now(),
      };
    }

    const stats = data.reviewerStats[reviewerWallet];
    stats.totalReviews++;
    stats.lastReviewAt = Date.now();
    
    // Calcular novo badge level
    const newBadgeLevel = calculateBadgeLevel(stats.totalReviews);
    const levelChanged = newBadgeLevel > stats.badgeLevel;
    stats.badgeLevel = newBadgeLevel;

    // Salvar dados
    await writeReviewsData(data);

    console.log('✅ Review submitted:', newReview.id);
    console.log('📊 Reviewer stats:', stats);

    return NextResponse.json({
      success: true,
      review: newReview,
      reviewerStats: stats,
      badgeLevelUp: levelChanged,
      message: levelChanged 
        ? `Review submetida! Você alcançou o nível ${newBadgeLevel}!`
        : 'Review submetida com sucesso!',
    });

  } catch (error) {
    console.error('❌ Erro ao submeter review:', error);
    return NextResponse.json(
      {
        error: 'Falha ao submeter review',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

