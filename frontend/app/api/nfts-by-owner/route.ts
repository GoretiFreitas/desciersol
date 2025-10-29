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

    // Find NFTs by owner
    const nfts = await metaplex.nfts().findAllByOwner({
      owner: ownerPubkey,
    });

    console.log('✅ Encontrados', nfts.length, 'NFTs');

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
            owner: owner,
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

