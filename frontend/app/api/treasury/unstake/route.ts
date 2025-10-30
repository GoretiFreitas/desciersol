import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { promises as fs } from 'fs';
import path from 'path';
import bs58 from 'bs58';

const TREASURY_FILE = path.join(process.cwd(), 'data/treasury.json');

interface TreasuryData {
  vault: {
    address: string;
    balance: number;
    totalStaked: number;
  };
  stakes: { [wallet: string]: any };
  rewards: { [wallet: string]: any };
}

async function readTreasuryData(): Promise<TreasuryData> {
  try {
    const data = await fs.readFile(TREASURY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {
      vault: { address: process.env.NEXT_PUBLIC_VAULT_ADDRESS || 'Anfe35xfcHxzQoZ1XGG5p6PDizrvHtC4aJqLTt7ayhA6', balance: 0, totalStaked: 0 },
      stakes: {},
      rewards: {},
    };
  }
}

async function writeTreasuryData(data: TreasuryData) {
  await fs.writeFile(TREASURY_FILE, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const { reviewerWallet } = await request.json();

    if (!reviewerWallet) {
      return NextResponse.json(
        { error: 'Missing required field: reviewerWallet' },
        { status: 400 }
      );
    }

    console.log('🔄 Processing unstake...');
    console.log('   Reviewer:', reviewerWallet);

    // Read treasury data
    const data = await readTreasuryData();
    const stake = data.stakes[reviewerWallet];

    if (!stake || stake.status !== 'active') {
      return NextResponse.json(
        { error: 'No active stake found for this wallet' },
        { status: 400 }
      );
    }

    console.log('   Current stake:', stake.amount, stake.lstMint);

    // Transfer SOL back to reviewer (real transaction)
    const privateKeyBase58 = process.env.IRYS_PRIVATE_KEY;
    let signature = null;

    if (privateKeyBase58 && stake.lstMint === 'SOL') {
      try {
        const connection = new Connection(
          process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com',
          { commitment: 'confirmed' }
        );
        
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
        const reviewerPubkey = new PublicKey(reviewerWallet);

        console.log('💸 Transferring', stake.amount, 'SOL back to reviewer...');

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: reviewerPubkey,
            lamports: Math.floor(stake.amount * LAMPORTS_PER_SOL),
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = keypair.publicKey;

        signature = await connection.sendTransaction(transaction, [keypair]);
        await connection.confirmTransaction(signature);

        console.log('✅ SOL transferred back on-chain!');
        console.log('📝 Signature:', signature);
      } catch (transferError) {
        console.error('⚠️ Transfer failed:', transferError);
        console.log('ℹ️ Continuing with unstake record update');
      }
    }

    // Update stake status
    data.stakes[reviewerWallet].status = 'unstaked';
    data.vault.totalStaked -= stake.amount;

    await writeTreasuryData(data);

    console.log('✅ Unstake processed!');

    return NextResponse.json({
      success: true,
      amount: stake.amount,
      signature,
      message: `Unstaked ${stake.amount} ${stake.lstMint}`,
      note: signature 
        ? 'SOL transferred back to your wallet' 
        : 'Stake removed from records',
    });

  } catch (error) {
    console.error('❌ Error processing unstake:', error);
    return NextResponse.json(
      {
        error: 'Failed to process unstake',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

