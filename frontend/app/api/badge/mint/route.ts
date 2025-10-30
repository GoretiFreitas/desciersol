import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import bs58 from 'bs58';

export async function POST(request: NextRequest) {
  try {
    const { reviewerWallet, badgeLevel, reviewCount, metadataUri, name, symbol } = await request.json();

    if (!reviewerWallet || !badgeLevel || !reviewCount) {
      return NextResponse.json(
        { error: 'Missing required fields: reviewerWallet, badgeLevel, reviewCount' },
        { status: 400 }
      );
    }

    console.log('🏆 Minting SBT badge via backend...');
    console.log('📋 Reviewer Wallet:', reviewerWallet);
    console.log('📋 Badge Level:', badgeLevel);
    console.log('📋 Review Count:', reviewCount);
    console.log('📋 Metadata URI:', metadataUri);

    // Use backend keypair for minting
    const privateKeyBase58 = process.env.IRYS_PRIVATE_KEY;
    if (!privateKeyBase58) {
      throw new Error('IRYS_PRIVATE_KEY not configured');
    }

    const privateKey = bs58.decode(privateKeyBase58);
    const keypair = Keypair.fromSecretKey(privateKey);

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 120000,
    });

    const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));

    // Badge configuration
    const badgeConfig = {
      name: name || `Reviewer Badge Level ${badgeLevel}`,
      symbol: symbol || 'SBTBADGE',
      description: `Soul-bound token badge for reviewer level ${badgeLevel}`,
      image: `https://arweave.net/badge-level-${badgeLevel}`,
    };

    // Use provided metadataUri or upload if not provided
    let finalMetadataUri = metadataUri;
    
    if (!finalMetadataUri) {
      console.log('📤 Uploading badge metadata to Arweave...');
      const badgeMetadata = {
        name: badgeConfig.name,
        symbol: badgeConfig.symbol,
        description: `Soul-bound token badge for reviewer level ${badgeLevel}. This badge represents the reviewer's reputation and cannot be transferred.`,
        image: `https://arweave.net/badge-level-${badgeLevel}`,
        attributes: [
          { trait_type: 'Type', value: 'Reviewer Badge' },
          { trait_type: 'Level', value: badgeLevel },
          { trait_type: 'Review Count', value: reviewCount },
          { trait_type: 'Issued At', value: new Date().toISOString() },
          { trait_type: 'Reviewer', value: reviewerWallet },
          { trait_type: 'Soul-Bound', value: 'Non-Transferable' },
        ],
        properties: {
          category: 'badge',
          badgeLevel: badgeLevel,
          reviewerWallet: reviewerWallet,
          reviewCount: reviewCount,
          issuedAt: Date.now(),
          soulBound: true,
        },
      };

      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/upload-metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: badgeMetadata,
          tags: {
            'App-Name': 'DeSci-Reviews',
            'Badge-Level': badgeLevel.toString(),
            'Reviewer-Wallet': reviewerWallet,
            'Soul-Bound': 'true',
          }
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload badge metadata');
      }

      const uploadResult = await uploadResponse.json();
      finalMetadataUri = uploadResult.uri;
      console.log('✅ Badge Metadata URI:', finalMetadataUri);
    } else {
      console.log('✅ Using provided metadata URI:', finalMetadataUri);
    }

    // Create SBT with proper configuration - mint directly to reviewer wallet
    console.log('🪙 Minting SBT directly to reviewer wallet...');
    const reviewerPubkey = new PublicKey(reviewerWallet);
    
    // Import SPL Token functions for transfer
    const { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } = await import('@solana/spl-token');
    
    // Step 1: Create the badge NFT mint
    console.log('🪙 Creating badge NFT mint...');
    
    // Create the NFT
    const { nft: badgeNft, response } = await metaplex.nfts().create({
      use: keypairIdentity(keypair),
      name: badgeConfig.name,
      symbol: badgeConfig.symbol,
      uri: finalMetadataUri,
      sellerFeeBasisPoints: 0,
      isMutable: false,
      isCollection: false,
      tokenStandard: 0,
      creators: [{ 
        address: keypair.publicKey, 
        share: 100,
        verified: true,
      }],
      collection: new PublicKey(process.env.NEXT_PUBLIC_BADGE_COLLECTION_ADDRESS || 'FWdnCLxzU3hFhXuqBwevLUBe1fyPpJaGn1uXme9C5MZi'),
    }, { 
      commitment: 'confirmed',
      mintTokens: true, // This will create the token account
    });
    
    console.log('✅ Badge minted to backend wallet!');
    console.log(`   Mint Address: ${badgeNft.mint.address.toString()}`);
    
    // Step 2: Transfer the token to the reviewer's wallet
    console.log('🔄 Transferring badge to reviewer wallet...');
    
    // Use Metaplex's transfer function which handles all the complexity
    console.log('🔄 Transferring badge to reviewer wallet using Metaplex...');
    
    try {
      const transferResult = await metaplex.nfts().transfer({
        nftOrSft: badgeNft,
        toOwner: reviewerPubkey,
      }, {
        commitment: 'confirmed',
      });
      
      console.log('✅ Badge transferred to reviewer wallet!');
      console.log(`   Transfer signature: ${transferResult.response.signature}`);
      console.log(`   Mint Address: ${badgeNft.mint.address.toString()}`);
      
      const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet-beta';
      const transferExplorer = network === 'mainnet-beta'
        ? `https://explorer.solana.com/address/${badgeNft.mint.address.toString()}`
        : `https://explorer.solana.com/address/${badgeNft.mint.address.toString()}?cluster=devnet`;
      console.log(`   Explorer: ${transferExplorer}`);
    } catch (transferError) {
      console.error('⚠️ Transfer failed:', transferError);
      console.log('ℹ️ Badge was minted but could not be transferred');
      console.log('ℹ️ It will appear in the backend wallet and be assigned to the reviewer via metadata');
      console.log(`   Mint Address: ${badgeNft.mint.address.toString()}`);
      
      const networkLog = process.env.NEXT_PUBLIC_NETWORK || 'mainnet-beta';
      const errorExplorer = networkLog === 'mainnet-beta'
        ? `https://explorer.solana.com/address/${badgeNft.mint.address.toString()}`
        : `https://explorer.solana.com/address/${badgeNft.mint.address.toString()}?cluster=devnet`;
      console.log(`   Explorer: ${errorExplorer}`);
    }

    const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet-beta';
    const explorerUrl = network === 'mainnet-beta' 
      ? `https://explorer.solana.com/address/${badgeNft.address.toString()}`
      : `https://explorer.solana.com/address/${badgeNft.address.toString()}?cluster=devnet`;

    return NextResponse.json({
      success: true,
      mintAddress: badgeNft.address.toString(),
      signature: response?.signature?.toString() || badgeNft.address.toString(),
      explorerUrl,
    });

  } catch (error) {
    console.error('❌ Error minting badge:', error);
    return NextResponse.json(
      {
        error: 'Failed to mint badge',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
