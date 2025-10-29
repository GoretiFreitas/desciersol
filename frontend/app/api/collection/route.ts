import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { RPC_ENDPOINT, COLLECTION_ADDRESS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const connection = new Connection(RPC_ENDPOINT);
    const metaplex = Metaplex.make(connection);

    // Find NFTs by collection
    const nfts = await metaplex.nfts().findAllByCollection({
      collection: COLLECTION_ADDRESS,
    });

    // Fetch metadata for each NFT
    const nftData = await Promise.all(
      nfts.map(async (nft) => {
        try {
          // Load full NFT data
          const fullNft = await metaplex.nfts().load({ metadata: nft as any });
          
          return {
            address: nft.address.toString(),
            name: nft.name,
            uri: nft.uri,
            json: (fullNft as any).json || null,
          };
        } catch (err) {
          console.error(`Failed to load NFT ${nft.address}:`, err);
          return null;
        }
      })
    );

    // Filter out failed loads
    const validNfts = nftData.filter((nft) => nft !== null);

    return NextResponse.json({
      collection: COLLECTION_ADDRESS.toString(),
      count: validNfts.length,
      nfts: validNfts,
    });
  } catch (error) {
    console.error('Collection fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch collection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

