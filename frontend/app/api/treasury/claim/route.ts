import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { promises as fs } from 'fs';
import path from 'path';
import bs58 from 'bs58';

const TREASURY_FILE = path.join(process.cwd(), 'data/treasury.json');
const REVIEWS_FILE = path.join(process.cwd(), 'data/reviews.json');

interface TreasuryData {
  vault: {
    address: string;
    balance: number;
    totalStaked: number;
  };
  stakes: { [wallet: string]: any };
  rewards: {
    [wallet: string]: {
      available: number;
      claimed: number;
      lastUpdate: number;
    };
  };
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

async function readReviewsData() {
  try {
    const data = await fs.readFile(REVIEWS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { reviews: [], reviewerStats: {} };
  }
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

    console.log('💎 Processing reward claim...');
    console.log('   Reviewer:', reviewerWallet);

    // Read treasury and review data
    const treasuryData = await readTreasuryData();
    const reviewsData = await readReviewsData();

    // Calculate rewards based on actual reviews
    const reviewerStats = reviewsData.reviewerStats[reviewerWallet];
    
    console.log('📊 Reviewer stats:', reviewerStats);
    
    if (!reviewerStats) {
      console.log('❌ No reviewer stats found');
      return NextResponse.json({
        success: false,
        amount: 0,
        message: 'No reviews found for this wallet',
      });
    }

    const rewardPerReview = 0.01; // 0.01 SOL per review
    const totalEarned = reviewerStats.totalReviews * rewardPerReview;

    console.log('💰 Total reviews:', reviewerStats.totalReviews);
    console.log('💰 Total earned:', totalEarned);

    // Get current rewards status
    const currentRewards = treasuryData.rewards[reviewerWallet] || {
      available: 0,
      claimed: 0,
      lastUpdate: 0,
    };

    console.log('💰 Current rewards:', currentRewards);

    // Calculate available (not yet claimed)
    const availableReward = totalEarned - currentRewards.claimed;

    console.log('💰 Available to claim:', availableReward);

    if (availableReward <= 0) {
      console.log('❌ No rewards available');
      return NextResponse.json({
        success: false,
        amount: 0,
        message: 'No rewards available to claim. Already claimed: ' + currentRewards.claimed + ' SOL',
      });
    }

    console.log('   Total reviews:', reviewerStats.totalReviews);
    console.log('   Reward per review:', rewardPerReview, 'SOL');
    console.log('   Total earned:', totalEarned, 'SOL');
    console.log('   Already claimed:', currentRewards.claimed, 'SOL');
    console.log('   Available to claim:', availableReward, 'SOL');

    // Real SOL transfer from vault to reviewer
    let transferSignature = null;
    const privateKeyBase58 = process.env.IRYS_PRIVATE_KEY;
    
    if (privateKeyBase58) {
      try {
        console.log('💸 Transferindo', availableReward, 'SOL do vault para o reviewer...');
        
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com';
        console.log('🌐 RPC:', rpcUrl);
        
        const connection = new Connection(rpcUrl, {
          commitment: 'confirmed'
        });
        
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
        const reviewerPubkey = new PublicKey(reviewerWallet);
        
        console.log('   From (Vault):', keypair.publicKey.toString());
        console.log('   To (Reviewer):', reviewerPubkey.toString());
        console.log('   Amount:', availableReward, 'SOL');
        
        const lamportsToSend = Math.floor(availableReward * LAMPORTS_PER_SOL);
        console.log('   Amount in lamports:', lamportsToSend);
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey: reviewerPubkey,
            lamports: lamportsToSend,
          })
        );
        
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('finalized');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = keypair.publicKey;
        
        console.log('📝 Assinando e enviando transação...');
        const signature = await connection.sendTransaction(transaction, [keypair], {
          skipPreflight: false,
          maxRetries: 3,
        });
        
        console.log('⏳ Confirmando transação...');
        await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });
        
        transferSignature = signature;
        console.log('✅ Reward transferred on-chain!');
        console.log('📝 Signature:', signature);
        
        const network = process.env.NEXT_PUBLIC_NETWORK || 'mainnet-beta';
        const explorerUrl = network === 'mainnet-beta' 
          ? `https://explorer.solana.com/tx/${signature}`
          : `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
        console.log('🔍 Explorer:', explorerUrl);
      } catch (transferError) {
        console.error('❌ Transfer failed:', transferError);
        throw new Error('Failed to transfer SOL: ' + (transferError instanceof Error ? transferError.message : 'Unknown error'));
      }
    } else {
      console.warn('⚠️ IRYS_PRIVATE_KEY not configured, cannot transfer SOL');
      throw new Error('Treasury keypair not configured');
    }

    // Update rewards data - mark as claimed
    const newClaimedTotal = currentRewards.claimed + availableReward;
    
    treasuryData.rewards[reviewerWallet] = {
      available: 0, // Set to 0 after claiming
      claimed: newClaimedTotal,
      lastUpdate: Date.now(),
    };

    await writeTreasuryData(treasuryData);

    console.log('✅ Updated rewards data:');
    console.log('   New claimed total:', newClaimedTotal, 'SOL');
    console.log('   Available after claim: 0 SOL');

    console.log('✅ Reward claim processed!');

    return NextResponse.json({
      success: true,
      amount: availableReward,
      claimed: newClaimedTotal,
      totalEarned,
      currency: 'SOL',
      signature: transferSignature,
      message: `Claimed ${availableReward.toFixed(4)} SOL`,
      explorerUrl: transferSignature 
        ? (process.env.NEXT_PUBLIC_NETWORK === 'mainnet-beta'
          ? `https://explorer.solana.com/tx/${transferSignature}`
          : `https://explorer.solana.com/tx/${transferSignature}?cluster=devnet`)
        : null,
      note: transferSignature 
        ? 'SOL transferred to your wallet on-chain!' 
        : 'Reward recorded but transfer failed',
    });

  } catch (error) {
    console.error('❌ Error processing claim:', error);
    return NextResponse.json(
      {
        error: 'Failed to process claim',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check available rewards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet parameter required' },
        { status: 400 }
      );
    }

    const treasuryData = await readTreasuryData();
    const reviewsData = await readReviewsData();

    const reviewerStats = reviewsData.reviewerStats[wallet];
    const rewardPerReview = 0.01;
    const totalEarned = reviewerStats ? reviewerStats.totalReviews * rewardPerReview : 0;

    const currentRewards = treasuryData.rewards[wallet] || {
      available: 0,
      claimed: 0,
      lastUpdate: 0,
    };

    const availableReward = totalEarned - currentRewards.claimed;

    return NextResponse.json({
      available: availableReward,
      claimed: currentRewards.claimed,
      totalEarned,
      reviewCount: reviewerStats?.totalReviews || 0,
    });

  } catch (error) {
    console.error('❌ Error fetching rewards:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch rewards',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


