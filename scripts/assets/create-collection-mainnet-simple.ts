#!/usr/bin/env tsx

import { Connection, Keypair } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';

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
    
    // Use a placeholder URI for now - we'll update it later
    console.log('📤 Creating collection with placeholder metadata URI...');
    
    const metadataUri = 'https://arweave.net/placeholder-collection-metadata';
    
    console.log(`📄 Using metadata URI: ${metadataUri}\n`);
    
    // Create collection NFT
    console.log('🎨 Creating collection NFT...');
    
    const { nft: collectionNFT } = await metaplex.nfts().create({
      name: 'DeSci Reviews Research Papers',
      symbol: 'DESCI',
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      isCollection: true,
      isMutable: true,
      updateAuthority: keypair,
    }, { commitment: 'confirmed' });
    
    console.log('\n✅ Collection created successfully!');
    console.log(`🎯 Collection Mint: ${collectionNFT.address.toString()}`);
    console.log(`📄 Metadata URI: ${collectionNFT.uri}`);
    console.log(`🔍 Explorer: https://explorer.solana.com/address/${collectionNFT.address.toString()}`);
    console.log(`\n💡 Add this to your frontend/.env.local:`);
    console.log(`NEXT_PUBLIC_COLLECTION_ADDRESS=${collectionNFT.address.toString()}`);
    
    // Save collection info
    const collectionInfo = {
      mint: collectionNFT.address.toString(),
      name: 'DeSci Reviews Research Papers',
      symbol: 'DESCI',
      uri: collectionNFT.uri,
      network: 'mainnet-beta',
      createdAt: new Date().toISOString(),
      note: 'Metadata URI is placeholder - update later via updateNFTMetadata',
    };
    
    console.log('\n📋 Collection Info:');
    console.log(JSON.stringify(collectionInfo, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating collection:', error);
    process.exit(1);
  }
}

createMainnetCollection();
