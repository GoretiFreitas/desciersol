import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { promises as fs } from 'fs';
import path from 'path';
import { ReviewsData } from '@/lib/review-types';
import { calculateBadgeLevel } from '@/lib/review-validation';
import bs58 from 'bs58';

const REVIEWS_FILE = path.join(process.cwd(), 'data', 'reviews.json');

async function readReviewsData(): Promise<ReviewsData> {
  try {
    const data = await fs.readFile(REVIEWS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { reviews: [], reviewerStats: {} };
  }
}

async function writeReviewsData(data: ReviewsData): Promise<void> {
  await fs.writeFile(REVIEWS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const { reviewerWallet } = await request.json();

    if (!reviewerWallet) {
      return NextResponse.json(
        { error: 'Wallet do revisor é obrigatória' },
        { status: 400 }
      );
    }

    // Ler dados
    const data = await readReviewsData();
    
    // Verificar stats do reviewer
    const stats = data.reviewerStats[reviewerWallet];

    if (!stats || stats.totalReviews === 0) {
      return NextResponse.json(
        { error: 'Revisor não tem reviews ainda' },
        { status: 400 }
      );
    }

    // Calcular level elegível
    const eligibleLevel = calculateBadgeLevel(stats.totalReviews);

    // Verificar se já tem o badge deste nível
    if (stats.badgeLevel >= eligibleLevel) {
      return NextResponse.json(
        { 
          error: 'Badge já foi emitido para este nível',
          currentLevel: stats.badgeLevel,
          eligibleLevel,
        },
        { status: 409 }
      );
    }

    console.log(`🏅 Emitindo badge nível ${eligibleLevel} para ${reviewerWallet}`);

    // TODO: Implementar mint de SBT real
    // Por enquanto, simular a emissão do badge
    
    // Em produção, aqui iríamos:
    // 1. Criar Metaplex instance
    // 2. Mintar SBT com extensão NonTransferable
    // 3. Transferir para reviewer wallet
    // 4. Retornar mint address e signature

    // Simulação:
    const simulatedMintAddress = `Badge${eligibleLevel}_${reviewerWallet.slice(0, 8)}`;
    const simulatedSignature = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Atualizar stats do reviewer
    stats.badgeLevel = eligibleLevel;
    stats.badgeMintAddress = simulatedMintAddress;

    // Salvar dados
    await writeReviewsData(data);

    console.log('✅ Badge emitido (simulado):', simulatedMintAddress);

    return NextResponse.json({
      success: true,
      badgeLevel: eligibleLevel,
      mintAddress: simulatedMintAddress,
      signature: simulatedSignature,
      message: `Badge nível ${eligibleLevel} emitido com sucesso!`,
      note: 'Badge simulado - Para mint real de SBT, implemente Token-2022 NonTransferable',
    });

  } catch (error) {
    console.error('❌ Erro ao emitir badge:', error);
    return NextResponse.json(
      {
        error: 'Falha ao emitir badge',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

