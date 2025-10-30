import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export async function POST(request: NextRequest) {
  try {
    const { mintAddress, newMetadataUri } = await request.json();

    if (!mintAddress || !newMetadataUri) {
      return NextResponse.json(
        { error: 'Missing required fields: mintAddress, newMetadataUri' },
        { status: 400 }
      );
    }

    console.log('🔄 Updating NFT metadata via backend...');
    console.log('📋 Mint Address:', mintAddress);
    console.log('📋 New URI:', newMetadataUri);

    // For now, we'll skip the update authority check and just try to update
    // This is a temporary solution for testing
    const keypair = Keypair.generate(); // Generate a random keypair for Metaplex identity

    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
      {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 120000,
      }
    );

    const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));

    // Find NFT using the same approach as the API
    const mintPubkey = new PublicKey(mintAddress);
    const knownOwner = new PublicKey('5f4FHMha4CXEv3JQ4oi4aG19xdx2Wt2m2BpKwRbwWogd');
    
    const nfts = await metaplex.nfts().findAllByOwner({ owner: knownOwner });
    const nft = nfts.find(n => n.address.equals(mintPubkey));
    
    if (!nft) {
      throw new Error('NFT not found in owner\'s collection');
    }

    const fullNft = await metaplex.nfts().load({ metadata: nft });

    console.log('📄 NFT found:', fullNft.name);
    console.log('🔑 Update Authority:', fullNft.updateAuthorityAddress?.toString());
    console.log('🔑 Backend Keypair:', keypair.publicKey.toString());
    
    // Check if backend keypair is update authority
    if (!fullNft.updateAuthorityAddress?.equals(keypair.publicKey)) {
      console.log('⚠️ Backend keypair is not update authority, but proceeding anyway...');
    }

    // Update NFT
    console.log('📤 Updating NFT URI...');
    const updatedNft = await metaplex.nfts().update({
      nftOrSft: fullNft,
      uri: newMetadataUri,
    });

    console.log('✅ NFT updated successfully!');
    console.log('🎯 New URI:', updatedNft.uri);

    return NextResponse.json({
      success: true,
      signature: updatedNft.address.toString(), // Using address as placeholder for signature
      newUri: updatedNft.uri,
    });

  } catch (error) {
    console.error('❌ Error updating NFT metadata:', error);
    return NextResponse.json(
      {
        error: 'Failed to update NFT metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
