import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const TREASURY_FILE = path.join(process.cwd(), 'data/treasury.json');

interface TreasuryData {
  vault: {
    address: string;
    balance: number;
    totalStaked: number;
  };
  stakes: {
    [wallet: string]: {
      reviewer: string;
      lstMint: string;
      amount: number;
      stakedAt: number;
      status: 'active' | 'unstaked';
    };
  };
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
    // Return default data if file doesn't exist
    return {
      vault: {
        address: process.env.NEXT_PUBLIC_VAULT_ADDRESS || 'Anfe35xfcHxzQoZ1XGG5p6PDizrvHtC4aJqLTt7ayhA6',
        balance: 0,
        totalStaked: 0,
      },
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
    const { reviewerWallet, lstMint, amount, transactionSignature } = await request.json();

    if (!reviewerWallet || !lstMint || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: reviewerWallet, lstMint, amount' },
        { status: 400 }
      );
    }

    console.log('💰 Processing LST stake...');
    console.log('   Reviewer:', reviewerWallet);
    console.log('   LST Mint:', lstMint);
    console.log('   Amount:', amount);
    console.log('   Transaction:', transactionSignature || 'Not provided');

    // Read current treasury data
    const data = await readTreasuryData();

    // Get existing stake for this reviewer
    const existingStake = data.stakes[reviewerWallet];
    const existingAmount = existingStake && existingStake.status === 'active' ? existingStake.amount : 0;
    const newTotalAmount = existingAmount + amount;

    // Create or update stake record
    const stakeRecord = {
      reviewer: reviewerWallet,
      lstMint,
      amount: newTotalAmount,
      stakedAt: existingStake?.stakedAt || Date.now(),
      status: 'active' as const,
    };

    data.stakes[reviewerWallet] = stakeRecord;
    data.vault.totalStaked += amount; // Only add the new amount to vault total

    // Save updated data
    await writeTreasuryData(data);

    console.log('✅ Stake recorded!');
    console.log('   Reviewer:', reviewerWallet);
    console.log('   Existing amount:', existingAmount, 'SOL');
    console.log('   New amount added:', amount, 'SOL');
    console.log('   New total amount:', newTotalAmount, 'SOL');
    console.log('   Total staked in vault:', data.vault.totalStaked, 'SOL');

    return NextResponse.json({
      success: true,
      stake: stakeRecord,
      vaultTotalStaked: data.vault.totalStaked,
      message: `Staked ${amount} ${lstMint === 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So' ? 'mSOL' : 'jitoSOL'}`,
      note: transactionSignature 
        ? 'Real stake transaction on devnet' 
        : 'Stake recorded (waiting for transaction)',
    });

  } catch (error) {
    console.error('❌ Error processing stake:', error);
    return NextResponse.json(
      {
        error: 'Failed to process stake',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if reviewer has staked
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

    const data = await readTreasuryData();
    const stake = data.stakes[wallet];

    return NextResponse.json({
      hasStake: !!stake && stake.status === 'active',
      stake: stake || null,
      vaultTotalStaked: data.vault.totalStaked,
    });

  } catch (error) {
    console.error('❌ Error checking stake:', error);
    return NextResponse.json(
      {
        error: 'Failed to check stake',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

