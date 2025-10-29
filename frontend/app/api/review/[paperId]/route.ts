import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { ReviewsData } from '@/lib/review-types';

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

    // Ler reviews
    const data = await readReviewsData();
    
    // Filtrar reviews do paper
    const paperReviews = data.reviews.filter(r => r.paperId === paperId);

    // Calcular estatísticas
    const avgRating = paperReviews.length > 0
      ? paperReviews.reduce((sum, r) => sum + r.rating, 0) / paperReviews.length
      : 0;

    const recommendations = {
      accept: paperReviews.filter(r => r.recommendation === 'accept').length,
      minorRevision: paperReviews.filter(r => r.recommendation === 'minor-revision').length,
      majorRevision: paperReviews.filter(r => r.recommendation === 'major-revision').length,
      reject: paperReviews.filter(r => r.recommendation === 'reject').length,
    };

    return NextResponse.json({
      reviews: paperReviews,
      count: paperReviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
      recommendations,
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

