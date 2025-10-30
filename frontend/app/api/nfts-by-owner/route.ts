import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { RPC_ENDPOINT } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get('owner');

    if (!owner) {
      return NextResponse.json(
        { error: 'Owner address is required' },
        { status: 400 }
      );
    }

    const connection = new Connection(RPC_ENDPOINT);
    const metaplex = Metaplex.make(connection);
    const ownerPubkey = new PublicKey(owner);

    console.log('🔍 Buscando NFTs do owner:', owner);

    // Criar timeout para evitar travamento (30s)
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout after 30s')), 30000)
    );

    // Find NFTs by owner com timeout
    const fetchNfts = metaplex.nfts().findAllByOwner({
      owner: ownerPubkey,
    });

    const nfts = await Promise.race([fetchNfts, timeout]) as any[];

    console.log('✅ Encontrados', nfts.length, 'NFTs');

    // Fetch metadata for each NFT (limitado a 10 para melhor performance)
    const nftData = await Promise.all(
      nfts.slice(0, 10).map(async (nft) => {
        try {
          // Load full NFT data
          const fullNft = await metaplex.nfts().load({ metadata: nft as any });
          
          console.log('📄 NFT carregado:', nft.name, nft.address.toString());
          
          // Check if it's a badge (exclude from research papers)
          const isBadge = nft.name?.includes('Reviewer Badge') || 
                         nft.symbol === 'SBTBADGE' ||
                         (fullNft as any).json?.properties?.category === 'badge' ||
                         (fullNft as any).json?.properties?.soulBound === true;
          
          if (isBadge) {
            console.log('🚫 Excluindo badge:', nft.name);
            return null; // Skip badges
          }
          
          return {
            address: nft.address.toString(),
            name: nft.name,
            uri: nft.uri,
            json: (fullNft as any).json || null,
            owner: owner,
            collection: (fullNft as any).collection?.address?.toString() || null,
          };
        } catch (err) {
          console.error(`❌ Failed to load NFT ${nft.address}:`, err);
          return null;
        }
      })
    );

    // Filter out failed loads
    const validNfts = nftData.filter((nft) => nft !== null);

    console.log('✅ Total NFTs válidos:', validNfts.length);

    return NextResponse.json({
      owner,
      count: validNfts.length,
      nfts: validNfts,
    });
  } catch (error) {
    console.error('❌ NFTs by owner fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch NFTs',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

