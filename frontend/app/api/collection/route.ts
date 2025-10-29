import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { RPC_ENDPOINT, COLLECTION_ADDRESS } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(RPC_ENDPOINT);
    const metaplex = Metaplex.make(connection);

    console.log('🔍 Buscando NFTs da collection:', COLLECTION_ADDRESS.toString());

    // Find NFTs by collection - usar método correto do Metaplex
    let nfts;
    
    try {
      // Tentar buscar por collection
      nfts = await metaplex.nfts().findAllByCollection({
        collection: COLLECTION_ADDRESS,
      });
      console.log('✅ Encontrados', nfts.length, 'NFTs via findAllByCollection');
    } catch (collectionError) {
      console.warn('⚠️ findAllByCollection falhou, tentando findAllByCreator...');
      // Fallback: buscar por creator
      nfts = await metaplex.nfts().findAllByCreator({
        creator: COLLECTION_ADDRESS,
      });
      console.log('✅ Encontrados', nfts.length, 'NFTs via findAllByCreator');
    }

    // Fetch metadata for each NFT
    const nftData = await Promise.all(
      nfts.map(async (nft) => {
        try {
          // Load full NFT data
          const fullNft = await metaplex.nfts().load({ metadata: nft as any });
          
          console.log('📄 NFT carregado:', nft.name, nft.address.toString());
          
          return {
            address: nft.address.toString(),
            name: nft.name,
            uri: nft.uri,
            json: (fullNft as any).json || null,
          };
        } catch (err) {
          console.error(`❌ Failed to load NFT ${nft.address}:`, err);
          return null;
        }
      })
    );

    // Filter out failed loads
    let validNfts = nftData.filter((nft) => nft !== null);

    console.log('✅ Total NFTs on-chain:', validNfts.length);

    // Se não houver NFTs on-chain, carregar papers mock para testes
    if (validNfts.length === 0) {
      try {
        const reviewsFile = path.join(process.cwd(), 'data', 'reviews.json');
        const reviewsData = await fs.readFile(reviewsFile, 'utf-8');
        const data = JSON.parse(reviewsData);
        
        if (data.mockPapers && data.mockPapers.length > 0) {
          validNfts = data.mockPapers;
          console.log('📝 Usando', validNfts.length, 'papers mock para testes');
        }
      } catch (mockError) {
        console.log('ℹ️ Nenhum paper mock disponível');
      }
    }

    console.log('✅ Total NFTs (on-chain + mock):', validNfts.length);

    return NextResponse.json({
      collection: COLLECTION_ADDRESS.toString(),
      count: validNfts.length,
      nfts: validNfts,
    });
  } catch (error) {
    console.error('❌ Collection fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch collection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

