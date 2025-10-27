#!/usr/bin/env tsx

/**
 * Fazer top-up do Turbo com SOL
 * Interface simples para comprar Turbo Credits
 */

import { Command } from 'commander';
import { createTurboClient, topUpWithSOL, getTurboBalance } from '../../lib/turbo-uploader.js';

const program = new Command();

program
  .name('topup-turbo')
  .description('Fazer top-up do Turbo com SOL ou verificar saldo')
  .option('-a, --amount <amount>', 'Quantidade de SOL para depositar')
  .option('--check-balance', 'Apenas verificar saldo')
  .action(async (options) => {
    try {
      console.log('💰 Turbo Credits Management\n');
      console.log('📚 Referência: https://docs.ar.io/build/upload/bundling-services');
      
      // Criar cliente Turbo
      const turbo = await createTurboClient();
      
      // Verificar saldo
      console.log('\n💰 Verificando saldo...');
      const balance = await getTurboBalance(turbo);
      
      if (options.checkBalance) {
        console.log('\n✅ Verificação de saldo concluída');
        return;
      }
      
      if (!options.amount) {
        console.log('\n⚠️  Para fazer top-up, especifique --amount');
        console.log('\n💡 Opções:');
        console.log('   1. Via web (aceita cartão, SOL, ETH, etc):');
        console.log('      https://turbo-topup.com');
        console.log('\n   2. Via SDK com SOL:');
        console.log('      npx tsx scripts/utils/topup-turbo.ts --amount 0.01');
        console.log('\n   3. Tokens aceitos:');
        console.log('      - SOL (Solana)');
        console.log('      - ETH (Ethereum)');
        console.log('      - USDC (Ethereum/Polygon)');
        console.log('      - AR (Arweave)');
        console.log('      - MATIC (Polygon)');
        console.log('      - ARIO (AR.IO)');
        return;
      }
      
      // Fazer top-up
      const amount = parseFloat(options.amount);
      
      if (amount <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }
      
      console.log(`\n💸 Fazendo top-up de ${amount} SOL...`);
      console.log('⏳ Isso pode levar alguns segundos...');
      
      await topUpWithSOL(turbo, amount);
      
      console.log('\n🎉 Top-up concluído!');
      console.log('💡 Próximos passos:');
      console.log('   1. Execute uploads com --use-turbo');
      console.log('   2. Metadata será permanente no Arweave');
      console.log('   3. URLs acessíveis publicamente');
      
    } catch (error) {
      console.error('❌ Erro:', error);
      console.log('\n💡 Alternativa mais fácil:');
      console.log('   Faça top-up via web: https://turbo-topup.com');
      console.log('   Depois use: npx tsx scripts/utils/topup-turbo.ts --check-balance');
      process.exit(1);
    }
  });

program.parse();
