import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';

export async function GET(
  request: NextRequest,
  { params }: { params: { wallet: string } }
) {
  try {
    const { wallet } = params;

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    console.log('🏆 Fetching badges for wallet:', wallet);

    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
      { commitment: 'confirmed' }
    );

    const metaplex = Metaplex.make(connection);
    const ownerPubkey = new PublicKey(wallet);

    // Find all NFTs owned by the wallet
    const nfts = await metaplex.nfts().findAllByOwner({ owner: ownerPubkey });
    console.log('📄 Found NFTs for wallet:', nfts.length);

    // Filter for badge NFTs (SBTs)
    const badgeNfts = [];
    
    for (const nft of nfts) {
      try {
        // Load full NFT data
        const fullNft = await metaplex.nfts().load({ metadata: nft });
        
            // Check if it's a badge by looking at the metadata
            if (fullNft.uri) {
              const response = await fetch(fullNft.uri);
              if (response.ok) {
                const metadata = await response.json();
                
                // Check if it's a badge based on properties or attributes
                const isBadge = metadata.properties?.category === 'badge' || 
                               metadata.properties?.soulBound === true ||
                               metadata.attributes?.some((attr: any) => 
                                 attr.trait_type === 'Type' && attr.value === 'Reviewer Badge'
                               ) ||
                               fullNft.symbol === 'SBTBADGE' ||
                               fullNft.name?.includes('Reviewer Badge');
                
                if (isBadge) {
              badgeNfts.push({
                mintAddress: fullNft.address.toString(),
                name: fullNft.name,
                symbol: fullNft.symbol,
                uri: fullNft.uri,
                metadata: metadata,
                badgeLevel: metadata.properties?.badgeLevel || 
                           metadata.attributes?.find((attr: any) => attr.trait_type === 'Level')?.value || 0,
                reviewCount: metadata.properties?.reviewCount || 
                            metadata.attributes?.find((attr: any) => attr.trait_type === 'Review Count')?.value || 0,
                issuedAt: metadata.properties?.issuedAt || 
                         metadata.attributes?.find((attr: any) => attr.trait_type === 'Issued At')?.value || 0,
                isSoulBound: metadata.properties?.soulBound === true,
                collection: fullNft.collection?.address?.toString() || null,
              });
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to load NFT metadata:', nft.address.toString(), error);
      }
    }

    // Sort by badge level (highest first)
    badgeNfts.sort((a, b) => b.badgeLevel - a.badgeLevel);

    console.log('🏆 Found badges:', badgeNfts.length);

    return NextResponse.json({
      wallet,
      badges: badgeNfts,
      count: badgeNfts.length,
      highestLevel: badgeNfts.length > 0 ? Math.max(...badgeNfts.map(b => b.badgeLevel)) : 0,
    });

  } catch (error) {
    console.error('❌ Error fetching badges:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch badges',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
