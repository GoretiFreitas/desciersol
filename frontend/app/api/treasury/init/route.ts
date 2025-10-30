import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

export async function POST(request: NextRequest) {
  try {
    console.log('🏦 Initializing treasury vault...');

    // Use backend keypair
    const privateKeyBase58 = process.env.IRYS_PRIVATE_KEY;
    if (!privateKeyBase58) {
      throw new Error('IRYS_PRIVATE_KEY not configured');
    }

    const privateKey = bs58.decode(privateKeyBase58);
    const keypair = Keypair.fromSecretKey(privateKey);

    const connection = new Connection(
      process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
      { commitment: 'confirmed' }
    );

    // For MVP, we'll use a simple treasury PDA approach
    // The vault address is derived from the program and a seed
    const TREASURY_SEED = 'descier-treasury';
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(TREASURY_SEED)],
      keypair.publicKey // Using backend pubkey as program for simplicity
    );

    console.log('✅ Treasury Vault PDA:', vaultPDA.toString());
    console.log('🔑 Authority:', keypair.publicKey.toString());

    return NextResponse.json({
      success: true,
      vaultAddress: vaultPDA.toString(),
      authority: keypair.publicKey.toString(),
      message: 'Treasury vault initialized (PDA)',
    });

  } catch (error) {
    console.error('❌ Error initializing treasury:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize treasury',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

