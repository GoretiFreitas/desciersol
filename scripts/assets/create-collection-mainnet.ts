#!/usr/bin/env tsx

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import bs58 from 'bs58';

// Mainnet configuration
const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY';
const KEYPAIR_PATH = './keypair-mainnet.json';

async function createMainnetCollection() {
  try {
    console.log('🚀 Creating NFT collection on mainnet-beta...\n');
    
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
    
    // Collection metadata for Research Papers
    const collectionMetadata = {
      name: 'DeSci Reviews Research Papers',
      symbol: 'DESCI',
      description: 'Collection of peer-reviewed research papers on the DeSci Reviews platform',
      image: 'https://arweave.net/placeholder-collection-image',
      external_url: 'https://descierreviews.io',
      attributes: [
        { trait_type: 'Collection Type', value: 'Research Papers' },
        { trait_type: 'Platform', value: 'DeSci Reviews' },
        { trait_type: 'Network', value: 'mainnet-beta' },
      ],
      properties: {
        files: [],
        category: 'research',
      },
    };
    
    console.log('📤 Uploading metadata to Arweave...');
    
    // Upload metadata to Arweave
    const metadataBuffer = Buffer.from(JSON.stringify(collectionMetadata));
    const { uri } = await metaplex.nfts().uploadMetadata({
      ...collectionMetadata as any,
      properties: collectionMetadata.properties as any,
    });
    
    console.log(`✅ Metadata URI: ${uri}\n`);
    
    // Create collection NFT
    console.log('🎨 Creating collection NFT...');
    
    const { nft: collectionNFT } = await metaplex.nfts().create({
      use: keypairIdentity(keypair),
      name: collectionMetadata.name,
      symbol: collectionMetadata.symbol,
      uri: uri,
      sellerFeeBasisPoints: 0,
      isCollection: true,
      isMutable: true,
      updateAuthority: keypair,
    }, { commitment: 'confirmed' });
    
    console.log('\n✅ Collection created successfully!');
    console.log(`🎯 Collection Mint: ${collectionNFT.address.toString()}`);
    console.log(`📄 Metadata: ${collectionNFT.uri}`);
    console.log(`🔍 Explorer: https://explorer.solana.com/address/${collectionNFT.address.toString()}`);
    console.log(`\n💡 Add this to your frontend/.env.local:`);
    console.log(`NEXT_PUBLIC_COLLECTION_ADDRESS=${collectionNFT.address.toString()}`);
    
    // Save collection info
    const collectionInfo = {
      mint: collectionNFT.address.toString(),
      name: collectionMetadata.name,
      symbol: collectionMetadata.symbol,
      uri: collectionNFT.uri,
      network: 'mainnet-beta',
      createdAt: new Date().toISOString(),
    };
    
    console.log('\n📋 Collection Info:');
    console.log(JSON.stringify(collectionInfo, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating collection:', error);
    process.exit(1);
  }
}

createMainnetCollection();
