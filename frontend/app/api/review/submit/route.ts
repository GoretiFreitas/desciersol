import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { validateReview, calculateBadgeLevel } from '@/lib/review-validation';
import { Review, ReviewsData, ReviewerStats, OnChainReview } from '@/lib/review-types';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { RPC_ENDPOINT } from '@/lib/constants';

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

async function fetchNFTMetadata(paperId: string): Promise<any> {
  try {
    console.log('🔍 Buscando NFT metadata para:', paperId);
    const connection = new Connection(RPC_ENDPOINT);
    const metaplex = Metaplex.make(connection);
    const mintAddress = new PublicKey(paperId);
    
    console.log('📡 Conectando ao RPC:', RPC_ENDPOINT);
    
    // Use a known owner wallet to find NFTs
    // This is a temporary solution - in production, we'd need to find the actual owner
    const knownOwner = new PublicKey('5f4FHMha4CXEv3JQ4oi4aG19xdx2Wt2m2BpKwRbwWogd');
    
    // Find NFTs by owner
    const nfts = await metaplex.nfts().findAllByOwner({ owner: knownOwner });
    console.log('📄 Found NFTs by owner:', nfts.length);
    
    // Find the specific NFT by mint address
    const nft = nfts.find(n => n.address.equals(mintAddress));
    if (!nft) {
      throw new Error('NFT not found in owner\'s collection');
    }
    
    console.log('📄 NFT encontrado:', {
      name: nft.name,
      uri: nft.uri,
      address: nft.address.toString()
    });
    
    // Load full NFT data
    const fullNft = await metaplex.nfts().load({ metadata: nft });
    
    if (!fullNft.uri) {
      throw new Error('NFT has no metadata URI');
    }

    // Fetch metadata from URI
    console.log('🌐 Buscando metadata de:', fullNft.uri);
    
    try {
      const response = await fetch(fullNft.uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata from URI: ${response.status} ${response.statusText}`);
      }

      const metadata = await response.json();
      console.log('✅ Metadata carregada:', {
        name: metadata.name,
        attributesCount: metadata.attributes?.length || 0
      });

      return metadata;
    } catch (uriError) {
      console.log('⚠️ Failed to fetch metadata from URI, using mock metadata:', uriError.message);
      
      // Return mock metadata to allow the system to continue working
      const mockMetadata = {
        name: fullNft.name || 'Research Paper',
        description: 'Research paper with reviews',
        attributes: [],
        properties: {
          files: []
        }
      };
      
      console.log('✅ Using mock metadata for NFT:', fullNft.name);
      return mockMetadata;
    }
  } catch (error) {
    console.error('❌ Error fetching NFT metadata:', error);
    return null;
  }
}

async function uploadUpdatedMetadata(paperId: string, currentMetadata: any, newReview: OnChainReview): Promise<string | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/metadata/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paperId,
        currentMetadata,
        newReview,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload metadata');
    }

    const result = await response.json();
    return result.newMetadataUri;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    return null;
  }
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

    // Check if reviewer has staked LST (required for reviewing)
    console.log('🔍 Checking if reviewer has staked LST...');
    try {
      const stakeCheck = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/treasury/stake?wallet=${reviewerWallet}`);
      if (stakeCheck.ok) {
        const stakeData = await stakeCheck.json();
        if (!stakeData.hasStake) {
          console.warn('⚠️ Reviewer has no LST staked, but allowing review for testing');
          // In production, uncomment this to enforce staking:
          // return NextResponse.json(
          //   { error: 'You must stake LST to submit reviews. Visit /treasury to stake.' },
          //   { status: 403 }
          // );
        } else {
          console.log('✅ Reviewer has staked:', stakeData.stake.amount, 'LST');
        }
      }
    } catch (stakeError) {
      console.warn('⚠️ Could not verify stake, proceeding anyway:', stakeError);
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

    // Criar review on-chain
    const onChainReview: OnChainReview = {
      id: newReview.id,
      reviewerWallet,
      rating,
      comment,
      recommendation,
      timestamp: Date.now(),
    };

    // Tentar buscar metadata atual do NFT e fazer upload on-chain
    let newMetadataUri: string | null = null;
    let onChainSuccess = false;

    try {
      console.log('🔍 Buscando metadata atual do NFT...');
      const currentMetadata = await fetchNFTMetadata(paperId);
      
      if (currentMetadata) {
        console.log('📤 Fazendo upload de metadata atualizada...');
        newMetadataUri = await uploadUpdatedMetadata(paperId, currentMetadata, onChainReview);
        
        if (newMetadataUri) {
          onChainSuccess = true;
          console.log('✅ Metadata atualizada com sucesso:', newMetadataUri);
        } else {
          console.log('⚠️ Falha no upload de metadata, continuando com fallback local');
        }
      } else {
        console.log('⚠️ NFT não encontrado ou sem metadata, continuando com fallback local');
      }
    } catch (error) {
      console.error('❌ Erro no processo on-chain:', error);
      console.log('⚠️ Continuando com fallback local');
    }

    // Adicionar review localmente (sempre, como backup)
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

    // Salvar dados localmente
    await writeReviewsData(data);

    console.log('✅ Review submitted:', newReview.id);
    console.log('📊 Reviewer stats:', stats);
    console.log('🔗 On-chain success:', onChainSuccess);

    return NextResponse.json({
      success: true,
      review: newReview,
      reviewerStats: stats,
      badgeLevelUp: levelChanged,
      newBadgeLevel,
      shouldMintBadge: levelChanged,
      onChainSuccess,
      newMetadataUri,
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

