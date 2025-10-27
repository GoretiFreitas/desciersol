#!/usr/bin/env tsx

/**
 * Exemplo de uso de Liquid Staking
 */

import { PublicKey } from '@solana/web3.js';
import { createConnection } from '../../lib/connection.js';
import {
  getLSTInfo,
  getAllLSTs,
  calculateYield,
  getConversionRate,
  estimateSOLForLST,
  estimateLSTForSOL,
  getLSTBalance,
  compareLSTs,
  calculateRewards
} from '../../lib/liquid-staking.js';

async function liquidStakingExample() {
  console.log('💰 Exemplo de Liquid Staking\n');
  
  const connection = createConnection();
  
  // 1. Listar todos os LSTs disponíveis
  console.log('📋 LSTs disponíveis na Mainnet:');
  const lsts = getAllLSTs('mainnet');
  lsts.forEach(lst => {
    console.log(`   ${lst.symbol} (${lst.name})`);
    console.log(`   - Protocolo: ${lst.protocol}`);
    console.log(`   - APY: ${lst.apy}%`);
    console.log(`   - TVL: ${(lst.tvl / 1000000).toFixed(2)}M SOL`);
    console.log(`   - Website: ${lst.website}\n`);
  });
  
  // 2. Comparar LSTs
  console.log('📊 Comparação de LSTs (ordenado por APY):');
  const comparison = compareLSTs('mainnet');
  comparison.forEach((lst, index) => {
    console.log(`   ${index + 1}. ${lst.symbol}: ${lst.apy}% APY - ${(lst.tvl / 1000000).toFixed(2)}M SOL TVL`);
  });
  
  // 3. Obter informações sobre mSOL
  console.log('\n💎 Informações sobre mSOL:');
  const msolInfo = getLSTInfo('mSOL', 'mainnet');
  if (msolInfo) {
    console.log(`   Nome: ${msolInfo.name}`);
    console.log(`   Mint: ${msolInfo.mint.toString()}`);
    console.log(`   APY: ${msolInfo.apy}%`);
    console.log(`   Decimals: ${msolInfo.decimals}`);
  }
  
  // 4. Calcular yield estimado
  const principal = 100; // 100 SOL
  const days = 365; // 1 ano
  const msolYield = calculateYield(principal, 'mSOL', days);
  const jitoYield = calculateYield(principal, 'jitoSOL', days);
  
  console.log(`\n💹 Yield estimado para ${principal} SOL em ${days} dias:`);
  console.log(`   mSOL: ${msolYield.toFixed(4)} SOL (${((msolYield / principal) * 100).toFixed(2)}%)`);
  console.log(`   jitoSOL: ${jitoYield.toFixed(4)} SOL (${((jitoYield / principal) * 100).toFixed(2)}%)`);
  
  // 5. Calcular taxas de conversão
  console.log('\n💱 Taxas de conversão:');
  const msolRate = await getConversionRate(connection, 'mSOL');
  const jitoRate = await getConversionRate(connection, 'jitoSOL');
  console.log(`   1 SOL = ${msolRate.toFixed(4)} mSOL`);
  console.log(`   1 SOL = ${jitoRate.toFixed(4)} jitoSOL`);
  
  // 6. Estimar quanto LST será recebido
  const solToStake = 10;
  const msolReceived = await estimateLSTForSOL(connection, 'mSOL', solToStake);
  const jitoReceived = await estimateLSTForSOL(connection, 'jitoSOL', solToStake);
  
  console.log(`\n🔄 Estimativa de conversão de ${solToStake} SOL:`);
  console.log(`   Receberá: ${msolReceived.toFixed(4)} mSOL`);
  console.log(`   Receberá: ${jitoReceived.toFixed(4)} jitoSOL`);
  
  // 7. Calcular rewards acumulados
  const stakedAmount = 50;
  const daysStaked = 180; // 6 meses
  const rewards = calculateRewards(stakedAmount, 'jitoSOL', daysStaked);
  
  console.log(`\n🎁 Rewards estimados:`);
  console.log(`   Principal: ${stakedAmount} jitoSOL`);
  console.log(`   Período: ${daysStaked} dias`);
  console.log(`   Rewards: ${rewards.toFixed(4)} SOL`);
  console.log(`   Total: ${(stakedAmount + rewards).toFixed(4)} SOL`);
  
  // 8. Exemplo de verificar saldo (requer public key)
  console.log('\n💼 Para verificar saldo:');
  console.log('   const balance = await getLSTBalance(connection, userPublicKey, "mSOL");');
  console.log('   console.log(`Saldo: ${balance} mSOL`);');
  
  console.log('\n🎯 Próximos passos:');
  console.log('   1. Integrar com protocolos de staking (Marinade, Jito)');
  console.log('   2. Implementar swap SOL ↔ LST');
  console.log('   3. Adicionar funcionalidade de unstake');
  console.log('   4. Criar dashboard de performance de LSTs');
}

liquidStakingExample();
