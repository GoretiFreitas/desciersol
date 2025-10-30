import { NextRequest, NextResponse } from 'next/server';
import { Uploader } from '@irys/upload';
import { Solana } from '@irys/upload-solana';
import { OnChainReview, OnChainReviewAttribute } from '@/lib/review-types';
import { REVIEW_TRAIT_TYPE, MAX_REVIEWS_PER_PAPER } from '@/lib/constants';

interface UpdateMetadataRequest {
  paperId: string;
  currentMetadata: any;
  newReview: OnChainReview;
}

async function createIrysUploader() {
  const privateKeyBase58 = process.env.IRYS_PRIVATE_KEY;
  
  if (!privateKeyBase58) {
    throw new Error('IRYS_PRIVATE_KEY not configured');
  }

  const useDevnet = process.env.NETWORK === 'devnet' || !process.env.NETWORK; // Default to devnet if not set
  
  if (useDevnet) {
    // Usar Irys DEVNET
    const uploader = await Uploader(Solana)
      .withWallet(privateKeyBase58)
      .withRpc('https://api.devnet.solana.com')
      .devnet();
    
    return uploader;
  } else {
    // Usar Irys MAINNET  
    const uploader = await Uploader(Solana)
      .withWallet(privateKeyBase58)
      .withRpc('https://api.mainnet-beta.solana.com');
    
    return uploader;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { paperId, currentMetadata, newReview }: UpdateMetadataRequest = await request.json();

    if (!paperId || !currentMetadata || !newReview) {
      return NextResponse.json(
        { error: 'Missing required fields: paperId, currentMetadata, newReview' },
        { status: 400 }
      );
    }

    console.log('📝 Updating metadata for paper:', paperId);
    console.log('📊 Current attributes count:', currentMetadata.attributes?.length || 0);

    // Verificar limite de reviews
    const existingReviews = currentMetadata.attributes?.filter(
      (attr: any) => attr.trait_type === REVIEW_TRAIT_TYPE
    ) || [];

    if (existingReviews.length >= MAX_REVIEWS_PER_PAPER) {
      return NextResponse.json(
        { error: `Maximum reviews per paper reached (${MAX_REVIEWS_PER_PAPER})` },
        { status: 400 }
      );
    }

    // Criar novo atributo de review
    const reviewAttribute: OnChainReviewAttribute = {
      trait_type: REVIEW_TRAIT_TYPE,
      value: newReview
    };

    // Atualizar metadata
    const updatedMetadata = {
      ...currentMetadata,
      attributes: [
        ...(currentMetadata.attributes || []),
        reviewAttribute
      ]
    };

    console.log('📤 Uploading updated metadata to Arweave...');

    // Upload para Arweave via Irys
    const uploader = await createIrysUploader();
    const metadataJson = JSON.stringify(updatedMetadata, null, 2);
    
    const uploadResult = await uploader.upload(metadataJson, {
      tags: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'App-Name', value: 'DeSci-Reviews' },
        { name: 'Paper-Id', value: paperId },
        { name: 'Review-Count', value: (existingReviews.length + 1).toString() }
      ]
    });

    console.log('✅ Metadata uploaded successfully:', uploadResult.id);

    return NextResponse.json({
      success: true,
      newMetadataUri: `https://arweave.net/${uploadResult.id}`,
      reviewCount: existingReviews.length + 1,
      arweaveId: uploadResult.id
    });

  } catch (error) {
    console.error('❌ Error updating metadata:', error);
    return NextResponse.json(
      {
        error: 'Failed to update metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
