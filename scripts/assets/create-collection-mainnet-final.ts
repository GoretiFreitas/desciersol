#!/usr/bin/env tsx

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
// Metadata will be uploaded via Metaplex built-in functionality

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
        creators: [{
          address: keypair.publicKey.toString(),
          share: 100,
          verified: true,
        }],
      },
    };
    
    console.log('📤 Uploading metadata to Arweave via Metaplex...');
    
    // Upload metadata via Metaplex (will auto-fund Irys)
    const { uri } = await metaplex.nfts().uploadMetadata(collectionMetadata);
    console.log(`✅ Metadata URI: ${uri}\n`);
    
    const metadataResult = { url: uri };
    
    // Create collection NFT using the helper function pattern
    console.log('🎨 Creating collection NFT...');
    
    const { nft: collectionNFT } = await metaplex.nfts().create({
      uri: metadataResult.url,
      name: collectionMetadata.name,
      symbol: collectionMetadata.symbol,
      sellerFeeBasisPoints: 0,
      isCollection: true,
      creators: [
        {
          address: keypair.publicKey,
          share: 100,
        },
      ],
      isMutable: true,
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
