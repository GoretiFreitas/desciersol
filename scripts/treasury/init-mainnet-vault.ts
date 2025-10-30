#!/usr/bin/env tsx

import { writeFileSync } from 'fs';
import { join } from 'path';

const VAULT_ADDRESS = 'H5iKPWZyq2dhHnNuE1g2N5nBDzsYVrPDo6V4B32XQf1S';
const TREASURY_FILE = join(process.cwd(), 'frontend/data/treasury.json');

async function initMainnetTreasury() {
  try {
    console.log('🚀 Initializing mainnet treasury vault...\n');
    
    const treasuryData = {
      vault: {
        address: VAULT_ADDRESS,
        balance: 0,
        totalStaked: 0,
      },
      stakes: {},
      rewards: {},
    };
    
    writeFileSync(TREASURY_FILE, JSON.stringify(treasuryData, null, 2));
    
    console.log('✅ Mainnet treasury initialized!');
    console.log(`🏦 Vault address: ${VAULT_ADDRESS}`);
    console.log(`📁 Data file: ${TREASURY_FILE}\n`);
    
    console.log('💡 The treasury is ready for mainnet operations:');
    console.log('   - Stake SOL to become eligible reviewer');
    console.log('   - Earn rewards for quality reviews');
    console.log('   - Claim SOL rewards on-chain');
    
  } catch (error) {
    console.error('❌ Error initializing treasury:', error);
    process.exit(1);
  }
}

initMainnetTreasury();
