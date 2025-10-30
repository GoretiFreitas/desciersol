#!/usr/bin/env tsx

import { Connection, Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';

// Mainnet configuration
const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY';
const KEYPAIR_PATH = './keypair-mainnet.json';

async function createBadgeCollection() {
  try {
    console.log('🚀 Creating Badge Collection on mainnet-beta...\n');
    
    // Load keypair
    const keypairData = JSON.parse(readFileSync(KEYPAIR_PATH, 'utf8'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    console.log('👤 Wallet:', keypair.publicKey.toString());
    
    // Create connection
    const connection = new Connection(MAINNET_RPC, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });
    
    // Check balance
    const balance = await connection.getBalance(keypair.publicKey);
    const balanceSOL = balance / 1e9;
    console.log(`💰 Balance: ${balanceSOL.toFixed(4)} SOL\n`);
    
    if (balanceSOL < 0.1) {
      console.warn('⚠️  Low balance! Recommended at least 0.1 SOL for NFT creation.');
    }
    
    // Create Metaplex instance
    const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));
    
    // Badge collection metadata
    const badgeMetadata = {
      name: 'DeSci Reviews Reviewer Badges',
      symbol: 'DSRBADGE',
      description: 'Soul-Bound Token badges for expert reviewers on DeSci Reviews platform',
      image: 'https://arweave.net/placeholder-badge-collection-image',
      external_url: 'https://descierreviews.io',
      attributes: [
        { trait_type: 'Collection Type', value: 'SBT Badges' },
        { trait_type: 'Token Type', value: 'Soul-Bound' },
        { trait_type: 'Platform', value: 'DeSci Reviews' },
        { trait_type: 'Network', value: 'mainnet-beta' },
      ],
      properties: {
        files: [],
        category: 'badge',
      },
    };
    
    console.log('📤 Uploading metadata to Arweave...');
    
    // Upload metadata to Arweave
    const metadataBuffer = Buffer.from(JSON.stringify(badgeMetadata));
    const { uri } = await metaplex.nfts().uploadMetadata({
      ...badgeMetadata as any,
      properties: badgeMetadata.properties as any,
    });
    
    console.log(`✅ Metadata URI: ${uri}\n`);
    
    // Create badge collection NFT
    console.log('🎨 Creating badge collection NFT...');
    
    const { nft: badgeCollection } = await metaplex.nfts().create({
      use: keypairIdentity(keypair),
      name: badgeMetadata.name,
      symbol: badgeMetadata.symbol,
      uri: uri,
      sellerFeeBasisPoints: 0,
      isCollection: true,
      isMutable: true,
      updateAuthority: keypair,
    }, { commitment: 'confirmed' });
    
    console.log('\n✅ Badge Collection created successfully!');
    console.log(`🎯 Badge Collection Mint: ${badgeCollection.address.toString()}`);
    console.log(`📄 Metadata: ${badgeCollection.uri}`);
    console.log(`🔍 Explorer: https://explorer.solana.com/address/${badgeCollection.address.toString()}`);
    console.log(`\n💡 Add this to your frontend/.env.local:`);
    console.log(`NEXT_PUBLIC_BADGE_COLLECTION_ADDRESS=${badgeCollection.address.toString()}`);
    
    // Save collection info
    const collectionInfo = {
      mint: badgeCollection.address.toString(),
      name: badgeMetadata.name,
      symbol: badgeMetadata.symbol,
      uri: badgeCollection.uri,
      network: 'mainnet-beta',
      createdAt: new Date().toISOString(),
    };
    
    console.log('\n📋 Badge Collection Info:');
    console.log(JSON.stringify(collectionInfo, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating badge collection:', error);
    process.exit(1);
  }
}

createBadgeCollection();
